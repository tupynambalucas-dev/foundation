package main

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func signTestOIDCJWT(t *testing.T, key *rsa.PrivateKey, kid string, claims GitHubOIDCTokenClaims) string {
	t.Helper()
	headerJSON, _ := json.Marshal(map[string]string{"alg": "RS256", "typ": "JWT", "kid": kid})
	claimsJSON, _ := json.Marshal(claims)
	h := base64.RawURLEncoding.EncodeToString(headerJSON)
	p := base64.RawURLEncoding.EncodeToString(claimsJSON)
	hashed := sha256.Sum256([]byte(h + "." + p))
	sig, err := rsa.SignPKCS1v15(rand.Reader, key, crypto.SHA256, hashed[:])
	if err != nil {
		t.Fatalf("failed to sign test OIDC JWT: %v", err)
	}
	return h + "." + p + "." + base64.RawURLEncoding.EncodeToString(sig)
}

func startMockJWKSServer(t *testing.T, kid string, pub *rsa.PublicKey) *httptest.Server {
	t.Helper()
	eBytes := big.NewInt(int64(pub.E)).Bytes()
	jwks := jwksResponse{
		Keys: []jwkKey{
			{
				Kid: kid,
				Kty: "RSA",
				N:   base64.RawURLEncoding.EncodeToString(pub.N.Bytes()),
				E:   base64.RawURLEncoding.EncodeToString(eBytes),
			},
		},
	}
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(jwks)
	}))
}

func TestTokenBrokerPolicyValidation(t *testing.T) {
	broker := &Broker{
		appID:          "12345",
		installationID: "67890",
		policies: map[string]Policy{
			"test-subject": {
				Subject:             "test-subject",
				App:                 "automation",
				AllowedRepositories: []string{"platform", "foundation"},
				AllowedPermissions: map[string]string{
					"contents":      "write",
					"pull_requests": "write",
				},
			},
			"agent:mcp-github-governance": {
				Subject:             "agent:mcp-github-governance",
				App:                 "org-manager",
				AllowedRepositories: []string{"*"},
				AllowedPermissions: map[string]string{
					"metadata": "read",
				},
			},
		},
	}

	if err := broker.ValidatePolicy("test-subject", TokenRequest{
		Repositories: []string{"platform"},
		Permissions:  map[string]string{"contents": "read"},
	}); err != nil {
		t.Fatalf("expected valid request to pass, got: %v", err)
	}

	if err := broker.ValidatePolicy("test-subject", TokenRequest{
		Repositories: []string{"unauthorized-repo"},
		Permissions:  map[string]string{"contents": "read"},
	}); err == nil {
		t.Fatalf("expected unauthorized repository to be rejected")
	}

	if err := broker.ValidatePolicy("test-subject", TokenRequest{
		Repositories: []string{"platform"},
		Permissions:  map[string]string{"contents": "admin"},
	}); err == nil {
		t.Fatalf("expected exceeded permission level to be rejected")
	}

	if err := broker.ValidatePolicy("test-subject", TokenRequest{
		Repositories: []string{},
		Permissions:  map[string]string{"contents": "read"},
	}); err == nil {
		t.Fatalf("expected empty repository list to be rejected for non-org-manager tier")
	}

	// Org-manager with explicit "*" may omit repositories for org-level metadata
	if err := broker.ValidatePolicy("agent:mcp-github-governance", TokenRequest{
		Repositories: []string{},
		Permissions:  map[string]string{"metadata": "read"},
	}); err != nil {
		t.Fatalf("expected org-manager wildcard metadata request to pass, got: %v", err)
	}
}

func TestResolveAppCredentialsNoPrivilegeEscalation(t *testing.T) {
	key, _ := rsa.GenerateKey(rand.Reader, 2048)
	broker := &Broker{
		appID:          "default-app",
		installationID: "default-inst",
		privateKey:     key,
		apps:           map[string]AppCredentials{},
	}

	if _, err := broker.ResolveAppCredentials("org-manager"); err == nil {
		t.Fatalf("expected unconfigured org-manager tier to return error without silent fallback")
	}
}

func TestJWTSigning(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate RSA key: %v", err)
	}

	pemBytes := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(key),
	})

	loadedKey, err := LoadPrivateKey(pemBytes)
	if err != nil {
		t.Fatalf("failed to load private key from PEM: %v", err)
	}

	broker := &Broker{appID: "12345", privateKey: loadedKey}
	jwtStr, err := broker.GenerateJWT()
	if err != nil || jwtStr == "" {
		t.Fatalf("failed to generate JWT: %v", err)
	}
}

func TestVerifyCallerIdentityWithJWKSAndAPIKey(t *testing.T) {
	oidcKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate OIDC key: %v", err)
	}
	jwksServer := startMockJWKSServer(t, "test-kid-1", &oidcKey.PublicKey)
	defer jwksServer.Close()

	broker := &Broker{
		apiKey:      "local-shared-secret",
		oidcJWKSURL: jwksServer.URL,
		httpClient:  jwksServer.Client(),
	}

	// 1. Missing header rejected
	if _, err := broker.VerifyCallerIdentity(""); err == nil {
		t.Errorf("expected error for empty header")
	}

	// 2. Shared API key + X-Caller-ID accepted
	sub, err := broker.VerifyCallerIdentity("Bearer local-shared-secret", "agent:mcp-github-governance")
	if err != nil || sub != "agent:mcp-github-governance" {
		t.Fatalf("expected API key + X-Caller-ID to succeed, got sub=%q err=%v", sub, err)
	}

	// 3. Shared API key without X-Caller-ID rejected
	if _, err := broker.VerifyCallerIdentity("Bearer local-shared-secret"); err == nil {
		t.Errorf("expected error when X-Caller-ID is omitted with API key")
	}

	// 4. Valid RS256-signed GitHub Actions OIDC token accepted via JWKS
	now := time.Now().Unix()
	validOIDC := signTestOIDCJWT(t, oidcKey, "test-kid-1", GitHubOIDCTokenClaims{
		Issuer:    githubOIDCIssuer,
		Subject:   "repo:tupynambalucas-dev/platform:ref:refs/heads/main",
		ExpiresAt: now + 3600,
		NotBefore: now - 60,
		IssuedAt:  now - 60,
	})
	oidcSub, err := broker.VerifyCallerIdentity("Bearer " + validOIDC)
	if err != nil || oidcSub != "repo:tupynambalucas-dev/platform:ref:refs/heads/main" {
		t.Fatalf("expected valid RS256 OIDC token to pass, got sub=%q err=%v", oidcSub, err)
	}

	// 5. Tampered OIDC signature rejected
	if _, err := broker.VerifyCallerIdentity("Bearer " + validOIDC + "tampered"); err == nil {
		t.Errorf("expected tampered OIDC signature to be rejected")
	}

	// 6. Expired OIDC token rejected
	expiredOIDC := signTestOIDCJWT(t, oidcKey, "test-kid-1", GitHubOIDCTokenClaims{
		Issuer:    githubOIDCIssuer,
		Subject:   "repo:tupynambalucas-dev/platform:ref:refs/heads/main",
		ExpiresAt: now - 3600,
	})
	if _, err := broker.VerifyCallerIdentity("Bearer " + expiredOIDC); err == nil {
		t.Errorf("expected expired OIDC token to be rejected")
	}
}
