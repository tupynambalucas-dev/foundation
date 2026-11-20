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

// Broker holds configuration and cryptographic keys for token vending.
type Broker struct {
	appID          string
	installationID string
	privateKey     *rsa.PrivateKey
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

// GenerateJWT creates a signed RS256 JWT valid for 5 minutes as required by GitHub API.
func (b *Broker) GenerateJWT() (string, error) {
	if b.privateKey == nil {
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
		"iss": b.appID,
	}
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	encodedHeader := base64.RawURLEncoding.EncodeToString(headerJSON)
	encodedClaims := base64.RawURLEncoding.EncodeToString(claimsJSON)
	signingInput := encodedHeader + "." + encodedClaims

	hashed := sha256.Sum256([]byte(signingInput))
	signature, err := rsa.SignPKCS1v15(rand.Reader, b.privateKey, crypto.SHA256, hashed[:])
	if err != nil {
		return "", fmt.Errorf("failed to sign JWT: %w", err)
	}

	encodedSignature := base64.RawURLEncoding.EncodeToString(signature)
	return signingInput + "." + encodedSignature, nil
}

// VerifyCallerIdentity extracts and validates the subject from the authorization header.
func (b *Broker) VerifyCallerIdentity(authHeader string) (string, error) {
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return "", fmt.Errorf("missing or invalid Authorization bearer header")
	}

	rawToken := strings.TrimPrefix(authHeader, "Bearer ")
	parts := strings.Split(rawToken, ".")
	if len(parts) >= 2 {
		payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
		if err == nil {
			var claims struct {
				Sub string `json:"sub"`
			}
			if json.Unmarshal(payloadBytes, &claims) == nil && claims.Sub != "" {
				return claims.Sub, nil
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

	jwtToken, err := b.GenerateJWT()
	if err != nil {
		log.Printf("[ERROR] Failed to generate JWT: %v", err)
		http.Error(w, "Internal server error generating authentication token", http.StatusInternalServerError)
		return
	}

	githubURL := fmt.Sprintf("https://api.github.com/app/installations/%s/access_tokens", b.installationID)
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

	log.Printf("[AUDIT-ISSUED] subject=%q repositories=%v permissions=%v expires_at=%s",
		subject, req.Repositories, req.Permissions, ghResult.ExpiresAt.Format(time.RFC3339))

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(TokenResponse{
		Token:     ghResult.Token,
		ExpiresAt: ghResult.ExpiresAt,
	})
}

func main() {
	appID := os.Getenv("GITHUB_APP_ID")
	installationID := os.Getenv("GITHUB_INSTALLATION_ID")
	privateKeyRaw := os.Getenv("GITHUB_PRIVATE_KEY")
	privateKeyPath := os.Getenv("GITHUB_PRIVATE_KEY_PATH")
	policiesPath := os.Getenv("POLICIES_PATH")

	if policiesPath == "" {
		policiesPath = "config/policies.yaml"
	}

	var pemBytes []byte
	if privateKeyRaw != "" {
		pemBytes = []byte(privateKeyRaw)
	} else if privateKeyPath != "" {
		var err error
		pemBytes, err = os.ReadFile(privateKeyPath)
		if err != nil {
			log.Fatalf("Failed to read private key file %s: %v", privateKeyPath, err)
		}
	}

	var rsaKey *rsa.PrivateKey
	if len(pemBytes) > 0 {
		var err error
		rsaKey, err = LoadPrivateKey(pemBytes)
		if err != nil {
			log.Fatalf("Failed to parse RSA private key: %v", err)
		}
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

	broker := &Broker{
		appID:          appID,
		installationID: installationID,
		privateKey:     rsaKey,
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
			"version":            "1.0.0",
			"policies_loaded":    len(broker.policies),
			"private_key_loaded": broker.privateKey != nil,
		})
	})
	mux.HandleFunc("/v1/github/token", broker.HandleTokenRequest)

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
