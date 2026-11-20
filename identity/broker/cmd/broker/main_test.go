package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"testing"
	"time"
)

func TestTokenBrokerPolicyValidation(t *testing.T) {
	broker := &Broker{
		appID:          "12345",
		installationID: "67890",
		policies: map[string]Policy{
			"test-subject": {
				Subject:             "test-subject",
				AllowedRepositories: []string{"platform", "foundation"},
				AllowedPermissions: map[string]string{
					"contents":      "write",
					"pull_requests": "write",
				},
			},
		},
	}

	// 1. Valid request
	validReq := TokenRequest{
		Repositories: []string{"platform"},
		Permissions: map[string]string{
			"contents": "read",
		},
	}
	if err := broker.ValidatePolicy("test-subject", validReq); err != nil {
		t.Fatalf("expected valid request to pass, got: %v", err)
	}

	// 2. Disallowed repository
	invalidRepoReq := TokenRequest{
		Repositories: []string{"unauthorized-repo"},
		Permissions: map[string]string{
			"contents": "read",
		},
	}
	if err := broker.ValidatePolicy("test-subject", invalidRepoReq); err == nil {
		t.Fatalf("expected unauthorized repository to be rejected")
	}

	// 3. Exceeded permission level (admin > write)
	exceededPermReq := TokenRequest{
		Repositories: []string{"platform"},
		Permissions: map[string]string{
			"contents": "admin",
		},
	}
	if err := broker.ValidatePolicy("test-subject", exceededPermReq); err == nil {
		t.Fatalf("expected exceeded permission level to be rejected")
	}

	// 4. Empty repository list must be rejected
	emptyRepoReq := TokenRequest{
		Repositories: []string{},
		Permissions: map[string]string{
			"contents": "read",
		},
	}
	if err := broker.ValidatePolicy("test-subject", emptyRepoReq); err == nil {
		t.Fatalf("expected empty repository list to be rejected")
	}
}

func TestJWTSigning(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate RSA key: %v", err)
	}

	keyBytes := x509.MarshalPKCS1PrivateKey(key)
	pemBytes := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: keyBytes,
	})

	loadedKey, err := LoadPrivateKey(pemBytes)
	if err != nil {
		t.Fatalf("failed to load private key from PEM: %v", err)
	}

	broker := &Broker{
		appID:      "12345",
		privateKey: loadedKey,
	}

	jwtStr, err := broker.GenerateJWT()
	if err != nil {
		t.Fatalf("failed to generate JWT: %v", err)
	}

	if jwtStr == "" {
		t.Fatalf("expected non-empty JWT")
	}
}

func TestVerifyCallerIdentity(t *testing.T) {
	broker := &Broker{}

	// 1. Missing header
	if _, err := broker.VerifyCallerIdentity(""); err == nil {
		t.Errorf("expected error for empty header")
	}

	// 2. Direct bearer subject (e.g. machine identity or local agent)
	directSub, err := broker.VerifyCallerIdentity("Bearer agent-mesh-autonomous-worker")
	if err != nil {
		t.Fatalf("unexpected error for direct bearer token: %v", err)
	}
	if directSub != "agent-mesh-autonomous-worker" {
		t.Errorf("expected agent-mesh-autonomous-worker, got %q", directSub)
	}

	// 3. Valid GitHub Actions OIDC Token
	now := time.Now().Unix()
	claims := GitHubOIDCTokenClaims{
		Issuer:     "https://token.actions.githubusercontent.com",
		Subject:    "repo:tupynambalucas-dev/platform:ref:refs/heads/main",
		Repository: "tupynambalucas-dev/platform",
		ExpiresAt:  now + 3600,
		NotBefore:  now - 60,
		IssuedAt:   now - 60,
	}
	claimsJSON, _ := json.Marshal(claims)
	encodedHeader := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"RS256","typ":"JWT"}`))
	encodedClaims := base64.RawURLEncoding.EncodeToString(claimsJSON)
	fakeJWT := encodedHeader + "." + encodedClaims + ".fake-signature"

	oidcSub, err := broker.VerifyCallerIdentity("Bearer " + fakeJWT)
	if err != nil {
		t.Fatalf("unexpected error for valid OIDC claims: %v", err)
	}
	if oidcSub != "repo:tupynambalucas-dev/platform:ref:refs/heads/main" {
		t.Errorf("expected repo:tupynambalucas-dev/platform:ref:refs/heads/main, got %q", oidcSub)
	}

	// 4. Expired GitHub Actions OIDC Token
	expiredClaims := GitHubOIDCTokenClaims{
		Issuer:    "https://token.actions.githubusercontent.com",
		Subject:   "repo:tupynambalucas-dev/platform:ref:refs/heads/main",
		ExpiresAt: now - 3600, // expired 1h ago
	}
	expiredClaimsJSON, _ := json.Marshal(expiredClaims)
	expiredJWT := encodedHeader + "." + base64.RawURLEncoding.EncodeToString(expiredClaimsJSON) + ".fake-sig"

	if _, err := broker.VerifyCallerIdentity("Bearer " + expiredJWT); err == nil {
		t.Errorf("expected error for expired GitHub Actions OIDC token")
	}
}
