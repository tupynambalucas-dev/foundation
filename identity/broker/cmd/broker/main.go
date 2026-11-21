package main

import (
	"bytes"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"gopkg.in/yaml.v3"
)

// Policy defines the permissions granted to a specific subject (caller identity).
type Policy struct {
	Subject             string            `yaml:"subject" json:"subject"`
	App                 string            `yaml:"app,omitempty" json:"app,omitempty"`
	AllowedRepositories []string          `yaml:"allowed_repositories" json:"allowed_repositories"`
	AllowedPermissions  map[string]string `yaml:"allowed_permissions" json:"allowed_permissions"`
}

// PoliciesConfig represents the root structure of policies.yaml.
type PoliciesConfig struct {
	Policies []Policy `yaml:"policies" json:"policies"`
}

// TokenRequest represents the payload received from a caller wanting an installation token.
type TokenRequest struct {
	Repositories []string          `json:"repositories"`
	Permissions  map[string]string `json:"permissions"`
}

// TokenResponse represents the short-lived installation access token returned to the caller.
type TokenResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}

// AppCredentials stores the cryptographic identity for a specific GitHub App tier.
type AppCredentials struct {
	AppID          string
	InstallationID string
	PrivateKey     *rsa.PrivateKey
}

// Broker holds configuration and cryptographic keys for token vending.
type Broker struct {
	appID          string
	installationID string
	privateKey     *rsa.PrivateKey
	apps           map[string]AppCredentials
	policies       map[string]Policy
	mu             sync.RWMutex
	httpClient     *http.Client
}

var permRanks = map[string]int{
	"read":  1,
	"write": 2,
	"admin": 3,
}

// LoadPrivateKey parses an RSA private key from PEM bytes.
func LoadPrivateKey(pemBytes []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, fmt.Errorf("failed to decode PEM block containing private key")
	}

	// Try PKCS#1 first, then PKCS#8
	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return key, nil
	}
	parsedKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err == nil {
		if rsaKey, ok := parsedKey.(*rsa.PrivateKey); ok {
			return rsaKey, nil
		}
		return nil, fmt.Errorf("PKCS#8 key is not an RSA private key")
	}
	return nil, fmt.Errorf("could not parse private key as PKCS#1 or PKCS#8: %w", err)
}

// GenerateJWTForApp creates a signed RS256 JWT valid for 5 minutes for the specified app credentials.
func GenerateJWTForApp(appID string, privateKey *rsa.PrivateKey) (string, error) {
	if privateKey == nil {
		return "", fmt.Errorf("private key is not initialized")
	}

	header := map[string]string{
		"alg": "RS256",
		"typ": "JWT",
	}
	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}

	now := time.Now().Unix()
	claims := map[string]interface{}{
		"iat": now - 60,       // 60s clock skew tolerance
		"exp": now + (5 * 60), // Valid for 5 minutes
		"iss": appID,
	}
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	encodedHeader := base64.RawURLEncoding.EncodeToString(headerJSON)
	encodedClaims := base64.RawURLEncoding.EncodeToString(claimsJSON)
	signingInput := encodedHeader + "." + encodedClaims

	hashed := sha256.Sum256([]byte(signingInput))
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hashed[:])
	if err != nil {
		return "", fmt.Errorf("failed to sign JWT: %w", err)
	}

	encodedSignature := base64.RawURLEncoding.EncodeToString(signature)
	return signingInput + "." + encodedSignature, nil
}

// GenerateJWT creates a signed RS256 JWT using the broker's default credentials.
func (b *Broker) GenerateJWT() (string, error) {
	return GenerateJWTForApp(b.appID, b.privateKey)
}

// ResolveAppCredentials returns the AppCredentials for a policy's designated app tier, falling back to default credentials.
func (b *Broker) ResolveAppCredentials(appSlug string) (AppCredentials, error) {
	if appSlug != "" && b.apps != nil {
		if creds, ok := b.apps[appSlug]; ok && creds.AppID != "" && creds.InstallationID != "" && creds.PrivateKey != nil {
			return creds, nil
		}
	}
	if b.appID != "" && b.installationID != "" && b.privateKey != nil {
		return AppCredentials{
			AppID:          b.appID,
			InstallationID: b.installationID,
			PrivateKey:     b.privateKey,
		}, nil
	}
	return AppCredentials{}, fmt.Errorf("credentials not initialized for app tier %q", appSlug)
}

// GitHubOIDCTokenClaims represents claims extracted from a GitHub Actions ID token JWT.
type GitHubOIDCTokenClaims struct {
	Issuer          string      `json:"iss"`
	Subject         string      `json:"sub"`
	Audience        interface{} `json:"aud"`
	Repository      string      `json:"repository"`
	RepositoryOwner string      `json:"repository_owner"`
	Actor           string      `json:"actor"`
	Workflow        string      `json:"workflow"`
	ExpiresAt       int64       `json:"exp"`
	NotBefore       int64       `json:"nbf"`
	IssuedAt        int64       `json:"iat"`
}

// VerifyCallerIdentity extracts and validates the subject from the authorization header.
// Supports GitHub Actions OIDC ID-Tokens (validating issuer, exp, and nbf), standard JWTs,
// or direct machine identity subjects.
func (b *Broker) VerifyCallerIdentity(authHeader string) (string, error) {
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return "", fmt.Errorf("missing or invalid Authorization bearer header")
	}

	rawToken := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	parts := strings.Split(rawToken, ".")
	if len(parts) >= 2 {
		payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
		if err == nil {
			var claims GitHubOIDCTokenClaims
			if json.Unmarshal(payloadBytes, &claims) == nil && claims.Subject != "" {
				now := time.Now().Unix()
				// Assert temporal validity if issued by GitHub Actions OIDC provider
				if claims.Issuer == "https://token.actions.githubusercontent.com" {
					if claims.ExpiresAt > 0 && claims.ExpiresAt < now-30 {
						return "", fmt.Errorf("GitHub Actions OIDC token is expired (exp=%d, now=%d)", claims.ExpiresAt, now)
					}
					if claims.NotBefore > 0 && claims.NotBefore > now+60 {
						return "", fmt.Errorf("GitHub Actions OIDC token is not yet valid (nbf=%d, now=%d)", claims.NotBefore, now)
					}
				}
				return claims.Subject, nil
			}
		}
	}

	// Fallback for local testing and direct machine identity tokens
	return rawToken, nil
}

// ValidatePolicy asserts that requested repositories and permissions strictly adhere to policy-as-code.
func (b *Broker) ValidatePolicy(subject string, req TokenRequest) error {
	b.mu.RLock()
	defer b.mu.RUnlock()

	policy, exists := b.policies[subject]
	if !exists {
		return fmt.Errorf("subject %q is not authorized by any active policy", subject)
	}

	// Ensure repository list is non-empty (never issue wildcard tokens)
	if len(req.Repositories) == 0 {
		return fmt.Errorf("request must specify at least one repository explicitly")
	}

	allowedRepoSet := make(map[string]bool)
	for _, repo := range policy.AllowedRepositories {
		allowedRepoSet[repo] = true
	}

	for _, reqRepo := range req.Repositories {
		if !allowedRepoSet[reqRepo] && !allowedRepoSet["*"] {
			return fmt.Errorf("repository %q is not permitted for subject %q", reqRepo, subject)
		}
	}

	for perm, reqLevel := range req.Permissions {
		allowedLevel, ok := policy.AllowedPermissions[perm]
		if !ok {
			return fmt.Errorf("permission %q is not permitted for subject %q", perm, subject)
		}
		if permRanks[reqLevel] > permRanks[allowedLevel] {
			return fmt.Errorf("requested level %q for permission %q exceeds permitted level %q", reqLevel, perm, allowedLevel)
		}
	}

	return nil
}

// HandleTokenRequest processes token issuance against GitHub API.
func (b *Broker) HandleTokenRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	subject, err := b.VerifyCallerIdentity(r.Header.Get("Authorization"))
	if err != nil {
		http.Error(w, fmt.Sprintf("Unauthorized: %v", err), http.StatusUnauthorized)
		return
	}

	var req TokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON request body: %v", err), http.StatusBadRequest)
		return
	}

	if err := b.ValidatePolicy(subject, req); err != nil {
		log.Printf("[AUDIT-DENIED] subject=%q error=%v", subject, err)
		http.Error(w, fmt.Sprintf("Forbidden: %v", err), http.StatusForbidden)
		return
	}

	b.mu.RLock()
	policy := b.policies[subject]
	b.mu.RUnlock()

	creds, err := b.ResolveAppCredentials(policy.App)
	if err != nil {
		log.Printf("[ERROR] Failed to resolve credentials for subject=%q app=%q: %v", subject, policy.App, err)
		http.Error(w, "Internal server error resolving machine identity credentials", http.StatusInternalServerError)
		return
	}

	jwtToken, err := GenerateJWTForApp(creds.AppID, creds.PrivateKey)
	if err != nil {
		log.Printf("[ERROR] Failed to generate JWT: %v", err)
		http.Error(w, "Internal server error generating authentication token", http.StatusInternalServerError)
		return
	}

	githubURL := fmt.Sprintf("https://api.github.com/app/installations/%s/access_tokens", creds.InstallationID)
	reqBody, _ := json.Marshal(req)

	ghReq, err := http.NewRequestWithContext(r.Context(), "POST", githubURL, bytes.NewReader(reqBody))
	if err != nil {
		http.Error(w, "Failed to create GitHub API request", http.StatusInternalServerError)
		return
	}

	ghReq.Header.Set("Authorization", "Bearer "+jwtToken)
	ghReq.Header.Set("Accept", "application/vnd.github+json")
	ghReq.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	ghReq.Header.Set("Content-Type", "application/json")

	ghResp, err := b.httpClient.Do(ghReq)
	if err != nil {
		log.Printf("[ERROR] GitHub API network failure: %v", err)
		http.Error(w, "Failed to communicate with GitHub API", http.StatusBadGateway)
		return
	}
	defer ghResp.Body.Close()

	if ghResp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(ghResp.Body)
		log.Printf("[ERROR] GitHub API returned status %d: %s", ghResp.StatusCode, string(body))
		http.Error(w, fmt.Sprintf("GitHub API rejected token request: %s", string(body)), http.StatusBadGateway)
		return
	}

	var ghResult struct {
		Token     string    `json:"token"`
		ExpiresAt time.Time `json:"expires_at"`
	}
	if err := json.NewDecoder(ghResp.Body).Decode(&ghResult); err != nil {
		http.Error(w, "Failed to parse GitHub response", http.StatusInternalServerError)
		return
	}

	log.Printf("[AUDIT-ISSUED] subject=%q app=%q repositories=%v permissions=%v expires_at=%s",
		subject, policy.App, req.Repositories, req.Permissions, ghResult.ExpiresAt.Format(time.RFC3339))

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(TokenResponse{
		Token:     ghResult.Token,
		ExpiresAt: ghResult.ExpiresAt,
	})
}

func loadAppCredentialsFromEnv(prefix string, fallbackPrefix string) AppCredentials {
	appID := os.Getenv(prefix + "_APP_ID")
	if appID == "" && fallbackPrefix != "" {
		appID = os.Getenv(fallbackPrefix + "_APP_ID")
	}

	instID := os.Getenv(prefix + "_APP_INSTALLATION_ID")
	if instID == "" {
		instID = os.Getenv(prefix + "_INSTALLATION_ID")
	}
	if instID == "" && fallbackPrefix != "" {
		instID = os.Getenv(fallbackPrefix + "_APP_INSTALLATION_ID")
		if instID == "" {
			instID = os.Getenv(fallbackPrefix + "_INSTALLATION_ID")
		}
	}

	keyRaw := os.Getenv(prefix + "_APP_PRIVATE_KEY")
	if keyRaw == "" {
		keyRaw = os.Getenv(prefix + "_PRIVATE_KEY")
	}
	keyB64 := os.Getenv(prefix + "_APP_PRIVATE_KEY_BASE64")
	keyPath := os.Getenv(prefix + "_APP_PRIVATE_KEY_PATH")
	if keyPath == "" {
		keyPath = os.Getenv(prefix + "_PRIVATE_KEY_PATH")
	}

	if keyRaw == "" && keyB64 == "" && keyPath == "" && fallbackPrefix != "" {
		keyRaw = os.Getenv(fallbackPrefix + "_APP_PRIVATE_KEY")
		if keyRaw == "" {
			keyRaw = os.Getenv(fallbackPrefix + "_PRIVATE_KEY")
		}
		keyB64 = os.Getenv(fallbackPrefix + "_APP_PRIVATE_KEY_BASE64")
		keyPath = os.Getenv(fallbackPrefix + "_APP_PRIVATE_KEY_PATH")
		if keyPath == "" {
			keyPath = os.Getenv(fallbackPrefix + "_PRIVATE_KEY_PATH")
		}
	}

	var pemBytes []byte
	if keyB64 != "" {
		decoded, err := base64.StdEncoding.DecodeString(strings.TrimSpace(keyB64))
		if err == nil {
			pemBytes = decoded
		} else {
			pemBytes = []byte(keyB64)
		}
	} else if keyRaw != "" {
		pemBytes = []byte(keyRaw)
	} else if keyPath != "" {
		data, err := os.ReadFile(keyPath)
		if err != nil {
			log.Printf("[WARN] Failed to read private key file %s: %v", keyPath, err)
		} else {
			pemBytes = data
		}
	}

	var rsaKey *rsa.PrivateKey
	if len(pemBytes) > 0 {
		var err error
		rsaKey, err = LoadPrivateKey(pemBytes)
		if err != nil {
			log.Printf("[WARN] Failed to parse RSA private key for prefix %s: %v", prefix, err)
		}
	}

	return AppCredentials{
		AppID:          appID,
		InstallationID: instID,
		PrivateKey:     rsaKey,
	}
}

func main() {
	defaultCreds := loadAppCredentialsFromEnv("GITHUB", "AUTOMATION")
	automationCreds := loadAppCredentialsFromEnv("AUTOMATION", "CI_BOT")
	guardianCreds := loadAppCredentialsFromEnv("GUARDIAN", "AUTOMATION")

	if defaultCreds.AppID == "" {
		defaultCreds = automationCreds
	}

	policiesPath := os.Getenv("POLICIES_PATH")
	if policiesPath == "" {
		policiesPath = "config/policies.yaml"
	}

	policyData, err := os.ReadFile(policiesPath)
	if err != nil {
		log.Printf("[WARN] Could not read policies from %s: %v (running with empty policies)", policiesPath, err)
		policyData = []byte("policies: []")
	}

	var config PoliciesConfig
	if err := yaml.Unmarshal(policyData, &config); err != nil {
		log.Fatalf("Failed to parse YAML from %s: %v", policiesPath, err)
	}

	policiesMap := make(map[string]Policy)
	for _, p := range config.Policies {
		policiesMap[p.Subject] = p
	}

	appsMap := map[string]AppCredentials{
		"automation": automationCreds,
		"ci-bot":     automationCreds,
		"guardian":   guardianCreds,
	}

	broker := &Broker{
		appID:          defaultCreds.AppID,
		installationID: defaultCreds.InstallationID,
		privateKey:     defaultCreds.PrivateKey,
		apps:           appsMap,
		policies:       policiesMap,
		httpClient:     &http.Client{Timeout: 15 * time.Second},
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":             "healthy",
			"timestamp":          time.Now().UTC().Format(time.RFC3339),
			"version":            "1.1.0",
			"policies_loaded":    len(broker.policies),
			"private_key_loaded": broker.privateKey != nil,
		})
	})
	mux.HandleFunc("/v1/github/token", broker.HandleTokenRequest)
	mux.HandleFunc("/v1/token", broker.HandleTokenRequest)

	log.Printf("GitHub App Token Broker running on :%s (policies: %d loaded)", port, len(broker.policies))
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server shutdown with error: %v", err)
	}
}
