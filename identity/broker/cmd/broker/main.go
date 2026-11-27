package main

import (
	"bytes"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/subtle"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"gopkg.in/yaml.v3"
)

const (
	githubAPIVersion   = "2026-03-10"
	githubOIDCIssuer   = "https://token.actions.githubusercontent.com"
	defaultOIDCJWKSURL = "https://token.actions.githubusercontent.com/.well-known/jwks"
	jwksCacheTTL       = 15 * time.Minute
	tokenSafetyMargin  = 5 * time.Minute
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
	App          string            `json:"app,omitempty"`
	Tier         string            `json:"tier,omitempty"`
	Repository   string            `json:"repository,omitempty"`
	Repositories []string          `json:"repositories"`
	Permissions  map[string]string `json:"permissions,omitempty"`
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

type jwkKey struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type jwksResponse struct {
	Keys []jwkKey `json:"keys"`
}

// Broker holds configuration, cryptographic keys, JWKS cache, and 55-minute token cache.
type Broker struct {
	appID          string
	installationID string
	privateKey     *rsa.PrivateKey
	apps           map[string]AppCredentials
	policies       map[string]Policy
	apiKey         string
	oidcJWKSURL    string
	jwksKeys       map[string]*rsa.PublicKey
	jwksExpiresAt  time.Time
	tokenCache     map[string]TokenResponse
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

	headerJSON, err := json.Marshal(map[string]string{
		"alg": "RS256",
		"typ": "JWT",
	})
	if err != nil {
		return "", err
	}

	now := time.Now().Unix()
	claimsJSON, err := json.Marshal(map[string]interface{}{
		"iat": now - 60,
		"exp": now + (5 * 60),
		"iss": appID,
	})
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

	return signingInput + "." + base64.RawURLEncoding.EncodeToString(signature), nil
}

// GenerateJWT creates a signed RS256 JWT using the broker's default credentials.
func (b *Broker) GenerateJWT() (string, error) {
	return GenerateJWTForApp(b.appID, b.privateKey)
}

// ResolveAppCredentials returns AppCredentials for the designated app tier with strict
// No-Privilege-Escalation isolation (never falls back to org-manager).
func (b *Broker) ResolveAppCredentials(appSlug string) (AppCredentials, error) {
	if appSlug != "" {
		if b.apps != nil {
			if creds, ok := b.apps[appSlug]; ok && creds.AppID != "" && creds.InstallationID != "" && creds.PrivateKey != nil {
				return creds, nil
			}
		}
		// Never silently fall back to another tier when org-manager is requested explicitly
		if appSlug == "org-manager" {
			return AppCredentials{}, fmt.Errorf("credentials not initialized for privileged tier %q", appSlug)
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

func (b *Broker) getOIDCPublicKey(kid string) (*rsa.PublicKey, error) {
	b.mu.RLock()
	if b.jwksKeys != nil && time.Now().Before(b.jwksExpiresAt) {
		if key, ok := b.jwksKeys[kid]; ok {
			b.mu.RUnlock()
			return key, nil
		}
	}
	b.mu.RUnlock()

	jwksURL := b.oidcJWKSURL
	if jwksURL == "" {
		jwksURL = defaultOIDCJWKSURL
	}
	client := b.httpClient
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}

	resp, err := client.Get(jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch OIDC JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OIDC JWKS endpoint returned HTTP %d", resp.StatusCode)
	}

	var parsed jwksResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, fmt.Errorf("failed to decode OIDC JWKS: %w", err)
	}

	keys := make(map[string]*rsa.PublicKey)
	for _, k := range parsed.Keys {
		if k.Kty != "RSA" || k.N == "" || k.E == "" {
			continue
		}
		nBytes, errN := base64.RawURLEncoding.DecodeString(k.N)
		eBytes, errE := base64.RawURLEncoding.DecodeString(k.E)
		if errN != nil || errE != nil {
			continue
		}
		var eInt int
		for _, eb := range eBytes {
			eInt = eInt<<8 + int(eb)
		}
		keys[k.Kid] = &rsa.PublicKey{
			N: new(big.Int).SetBytes(nBytes),
			E: eInt,
		}
	}

	b.mu.Lock()
	b.jwksKeys = keys
	b.jwksExpiresAt = time.Now().Add(jwksCacheTTL)
	b.mu.Unlock()

	if kid != "" {
		if key, ok := keys[kid]; ok {
			return key, nil
		}
		return nil, fmt.Errorf("no matching RSA JWK found for kid %q", kid)
	}
	for _, key := range keys {
		return key, nil
	}
	return nil, fmt.Errorf("OIDC JWKS contained no usable RSA keys")
}

func (b *Broker) verifyOIDCSignature(parts []string) error {
	if len(parts) != 3 {
		return fmt.Errorf("malformed OIDC JWT")
	}
	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return fmt.Errorf("invalid OIDC JWT header encoding: %w", err)
	}
	var header struct {
		Alg string `json:"alg"`
		Kid string `json:"kid"`
	}
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return fmt.Errorf("invalid OIDC JWT header JSON: %w", err)
	}
	if header.Alg != "RS256" {
		return fmt.Errorf("unsupported OIDC JWT alg %q (RS256 required)", header.Alg)
	}

	pubKey, err := b.getOIDCPublicKey(header.Kid)
	if err != nil {
		return err
	}

	sigBytes, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return fmt.Errorf("invalid OIDC JWT signature encoding: %w", err)
	}
	hashed := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
	if err := rsa.VerifyPKCS1v15(pubKey, crypto.SHA256, hashed[:], sigBytes); err != nil {
		return fmt.Errorf("OIDC JWT RS256 signature verification failed: %w", err)
	}
	return nil
}

// VerifyCallerIdentity extracts and validates the caller subject from Authorization and optional X-Caller-ID.
func (b *Broker) VerifyCallerIdentity(authHeader string, callerIDHeader ...string) (string, error) {
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return "", fmt.Errorf("missing or invalid Authorization bearer header")
	}

	rawToken := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	callerID := ""
	if len(callerIDHeader) > 0 {
		callerID = strings.TrimSpace(callerIDHeader[0])
	}

	// 1. Shared API Key + X-Caller-ID for authenticated local/internal callers
	if b.apiKey != "" && subtle.ConstantTimeCompare([]byte(rawToken), []byte(b.apiKey)) == 1 {
		if callerID == "" {
			return "", fmt.Errorf("authenticated API key caller must provide X-Caller-ID header")
		}
		return callerID, nil
	}

	// 2. JWT / GitHub Actions OIDC token
	parts := strings.Split(rawToken, ".")
	if len(parts) == 3 {
		payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
		if err == nil {
			var claims GitHubOIDCTokenClaims
			if json.Unmarshal(payloadBytes, &claims) == nil && claims.Subject != "" {
				now := time.Now().Unix()
				if claims.Issuer == githubOIDCIssuer {
					if claims.ExpiresAt > 0 && claims.ExpiresAt < now-30 {
						return "", fmt.Errorf("GitHub Actions OIDC token is expired (exp=%d, now=%d)", claims.ExpiresAt, now)
					}
					if claims.NotBefore > 0 && claims.NotBefore > now+60 {
						return "", fmt.Errorf("GitHub Actions OIDC token is not yet valid (nbf=%d, now=%d)", claims.NotBefore, now)
					}
					if err := b.verifyOIDCSignature(parts); err != nil {
						return "", err
					}
				}
				return claims.Subject, nil
			}
		}
	}

	// 3. When API key is enforced, reject unauthenticated raw subjects
	if b.apiKey != "" {
		return "", fmt.Errorf("invalid Authorization bearer credential")
	}

	// 4. Local loopback fallback without API key
	if callerID != "" {
		return callerID, nil
	}
	return rawToken, nil
}

// ValidatePolicy asserts that requested repositories and permissions strictly adhere to policy-as-code.
func (b *Broker) ValidatePolicy(subject string, req TokenRequest) error {
	b.mu.RLock()
	defer b.mu.RUnlock()

	policy, exists := b.policies[subject]
	if !exists {
		return fmt.Errorf("caller is not authorized by any active policy")
	}

	// Org-manager metadata queries may omit repositories only when policy explicitly allows "*"
	allowedRepoSet := make(map[string]bool)
	for _, repo := range policy.AllowedRepositories {
		allowedRepoSet[repo] = true
	}

	if len(req.Repositories) == 0 {
		if !(policy.App == "org-manager" && allowedRepoSet["*"]) {
			return fmt.Errorf("request must specify at least one repository explicitly")
		}
	}

	for _, reqRepo := range req.Repositories {
		if !allowedRepoSet[reqRepo] && !allowedRepoSet["*"] {
			return fmt.Errorf("repository %q is not permitted for policy %q", reqRepo, policy.Subject)
		}
	}

	for perm, reqLevel := range req.Permissions {
		allowedLevel, ok := policy.AllowedPermissions[perm]
		if !ok {
			return fmt.Errorf("permission %q is not permitted for policy %q", perm, policy.Subject)
		}
		if permRanks[reqLevel] > permRanks[allowedLevel] {
			return fmt.Errorf("requested level %q for permission %q exceeds permitted level %q", reqLevel, perm, allowedLevel)
		}
	}

	return nil
}

func buildCacheKey(appSlug string, repos []string, perms map[string]string) string {
	sortedRepos := append([]string(nil), repos...)
	sort.Strings(sortedRepos)

	permKeys := make([]string, 0, len(perms))
	for k := range perms {
		permKeys = append(permKeys, k)
	}
	sort.Strings(permKeys)

	var sb strings.Builder
	sb.WriteString(appSlug)
	sb.WriteString("|")
	sb.WriteString(strings.Join(sortedRepos, ","))
	sb.WriteString("|")
	for _, k := range permKeys {
		sb.WriteString(k)
		sb.WriteString("=")
		sb.WriteString(perms[k])
		sb.WriteString(";")
	}
	return sb.String()
}

// HandleTokenRequest processes token issuance against GitHub API with 55-minute caching.
func (b *Broker) HandleTokenRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	subject, err := b.VerifyCallerIdentity(r.Header.Get("Authorization"), r.Header.Get("X-Caller-ID"))
	if err != nil {
		http.Error(w, fmt.Sprintf("Unauthorized: %v", err), http.StatusUnauthorized)
		return
	}

	var req TokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Invalid JSON request body: %v", err), http.StatusBadRequest)
		return
	}

	// Normalize legacy singular `repository` field into `repositories`
	if len(req.Repositories) == 0 && strings.TrimSpace(req.Repository) != "" {
		req.Repositories = []string{strings.TrimSpace(req.Repository)}
	}

	if err := b.ValidatePolicy(subject, req); err != nil {
		log.Printf("[AUDIT-DENIED] error=%v", err)
		http.Error(w, fmt.Sprintf("Forbidden: %v", err), http.StatusForbidden)
		return
	}

	b.mu.RLock()
	policy := b.policies[subject]
	b.mu.RUnlock()

	cacheKey := buildCacheKey(policy.App, req.Repositories, req.Permissions)
	b.mu.RLock()
	if cached, ok := b.tokenCache[cacheKey]; ok && cached.ExpiresAt.After(time.Now().Add(tokenSafetyMargin)) {
		b.mu.RUnlock()
		log.Printf("[AUDIT-CACHED] policy=%q app=%q repositories=%v expires_at=%s",
			policy.Subject, policy.App, req.Repositories, cached.ExpiresAt.Format(time.RFC3339))
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(cached)
		return
	}
	b.mu.RUnlock()

	creds, err := b.ResolveAppCredentials(policy.App)
	if err != nil {
		log.Printf("[ERROR] Failed to resolve credentials for policy=%q app=%q: %v", policy.Subject, policy.App, err)
		http.Error(w, "Internal server error resolving machine identity credentials", http.StatusInternalServerError)
		return
	}

	jwtToken, err := GenerateJWTForApp(creds.AppID, creds.PrivateKey)
	if err != nil {
		log.Printf("[ERROR] Failed to generate JWT: %v", err)
		http.Error(w, "Internal server error generating authentication token", http.StatusInternalServerError)
		return
	}

	ghPayload := map[string]interface{}{}
	if len(req.Repositories) > 0 {
		ghPayload["repositories"] = req.Repositories
	}
	if len(req.Permissions) > 0 {
		ghPayload["permissions"] = req.Permissions
	}
	reqBody, _ := json.Marshal(ghPayload)

	githubURL := fmt.Sprintf("https://api.github.com/app/installations/%s/access_tokens", creds.InstallationID)
	ghReq, err := http.NewRequestWithContext(r.Context(), "POST", githubURL, bytes.NewReader(reqBody))
	if err != nil {
		http.Error(w, "Failed to create GitHub API request", http.StatusInternalServerError)
		return
	}

	ghReq.Header.Set("Authorization", "Bearer "+jwtToken)
	ghReq.Header.Set("Accept", "application/vnd.github+json")
	ghReq.Header.Set("X-GitHub-Api-Version", githubAPIVersion)
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

	var ghResult TokenResponse
	if err := json.NewDecoder(ghResp.Body).Decode(&ghResult); err != nil {
		http.Error(w, "Failed to parse GitHub response", http.StatusInternalServerError)
		return
	}

	b.mu.Lock()
	if b.tokenCache == nil {
		b.tokenCache = make(map[string]TokenResponse)
	}
	b.tokenCache[cacheKey] = ghResult
	b.mu.Unlock()

	log.Printf("[AUDIT-ISSUED] policy=%q app=%q repositories=%v permissions=%v expires_at=%s",
		policy.Subject, policy.App, req.Repositories, req.Permissions, ghResult.ExpiresAt.Format(time.RFC3339))

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(ghResult)
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
	orgManagerCreds := loadAppCredentialsFromEnv("ORG_MANAGER", "")
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
		"org-manager": orgManagerCreds,
		"automation":  automationCreds,
		"ci-bot":      automationCreds,
		"guardian":    guardianCreds,
	}

	broker := &Broker{
		appID:          defaultCreds.AppID,
		installationID: defaultCreds.InstallationID,
		privateKey:     defaultCreds.PrivateKey,
		apps:           appsMap,
		policies:       policiesMap,
		apiKey:         strings.TrimSpace(os.Getenv("TOKEN_BROKER_API_KEY")),
		oidcJWKSURL:    defaultOIDCJWKSURL,
		tokenCache:     make(map[string]TokenResponse),
		httpClient:     &http.Client{Timeout: 15 * time.Second},
	}

	bindAddr := os.Getenv("BIND_ADDR")
	if bindAddr == "" {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		bindAddr = ":" + port
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"status":             "healthy",
			"timestamp":          time.Now().UTC().Format(time.RFC3339),
			"version":            "1.2.0",
			"api_version":        githubAPIVersion,
			"policies_loaded":    len(broker.policies),
			"private_key_loaded": broker.privateKey != nil,
			"tiers_ready": map[string]bool{
				"org-manager": orgManagerCreds.PrivateKey != nil,
				"automation":  automationCreds.PrivateKey != nil,
				"guardian":    guardianCreds.PrivateKey != nil,
			},
		})
	})
	mux.HandleFunc("/v1/github/token", broker.HandleTokenRequest)
	mux.HandleFunc("/v1/token", broker.HandleTokenRequest)

	log.Printf("GitHub App Token Broker v1.2.0 running on %s (policies: %d loaded)", bindAddr, len(broker.policies))
	server := &http.Server{
		Addr:         bindAddr,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server shutdown with error: %v", err)
	}
}
