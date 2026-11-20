package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"testing"
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
