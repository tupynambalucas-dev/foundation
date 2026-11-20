package github

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/cli/go-gh/v2/pkg/api"
)

// User represents the authenticated GitHub user profile.
type User struct {
	Login string `json:"login"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// SSHSigningKey represents a public SSH signing key registered on a GitHub user profile.
type SSHSigningKey struct {
	ID        int    `json:"id"`
	Key       string `json:"key"`
	Title     string `json:"title"`
	CreatedAt string `json:"created_at"`
}

// ErrFineGrainedPAT indicates that a fine-grained personal access token was used where OAuth/classic scope is required.
var ErrFineGrainedPAT = errors.New("personal access token cannot manage user SSH keys; GitHub requires OAuth login (admin:ssh_signing_key)")

type keyPayload struct {
	Title string `json:"title"`
	Key   string `json:"key"`
}

// GetCurrentUser returns the profile of the currently authenticated GitHub user.
func GetCurrentUser() (*User, error) {
	client, err := api.DefaultRESTClient()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize GitHub API client: %w", err)
	}

	var user User
	if err := client.Get("user", &user); err != nil {
		return nil, fmt.Errorf("failed fetching authenticated user from GitHub API: %w", err)
	}

	return &user, nil
}

// ListUserSigningKeys fetches public SSH signing keys registered on a user's GitHub profile.
// Note: This endpoint is accessible with any valid token or unauthenticated for public profiles.
func ListUserSigningKeys(username string) ([]SSHSigningKey, error) {
	client, err := api.DefaultRESTClient()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize GitHub API client: %w", err)
	}

	var keys []SSHSigningKey
	endpoint := fmt.Sprintf("users/%s/ssh_signing_keys", username)
	if err := client.Get(endpoint, &keys); err != nil {
		return nil, fmt.Errorf("failed fetching signing keys for user %q: %w", username, err)
	}

	return keys, nil
}

// IsSigningKeyEnrolled checks whether the provided public key content matches any signing key registered on GitHub.
func IsSigningKeyEnrolled(username, pubKeyContent string) (bool, error) {
	fields := strings.Fields(strings.TrimSpace(pubKeyContent))
	if len(fields) < 2 {
		return false, fmt.Errorf("invalid public key format: expected at least type and base64 payload")
	}

	keyData := fields[1]

	keys, err := ListUserSigningKeys(username)
	if err != nil {
		return false, err
	}

	for _, k := range keys {
		if strings.Contains(k.Key, keyData) {
			return true, nil
		}
	}

	return false, nil
}

// RegisterAuthKey registers an SSH public key for Git transport authentication (push/pull).
func RegisterAuthKey(title, pubKey string) (bool, error) {
	client, err := api.DefaultRESTClient()
	if err != nil {
		return false, fmt.Errorf("failed to initialize GitHub API client: %w", err)
	}

	payload, err := json.Marshal(keyPayload{
		Title: title,
		Key:   pubKey,
	})
	if err != nil {
		return false, err
	}

	err = client.Post("user/keys", bytes.NewReader(payload), nil)
	if err != nil {
		var httpErr *api.HTTPError
		if errors.As(err, &httpErr) {
			if httpErr.StatusCode == 422 {
				// Key is already present on the account
				if strings.Contains(strings.ToLower(httpErr.Message), "already") ||
					strings.Contains(strings.ToLower(httpErr.Error()), "already") {
					return false, nil
				}
			}
			if httpErr.StatusCode == 403 {
				msg := strings.ToLower(httpErr.Message + " " + httpErr.Error())
				if strings.Contains(msg, "personal access token") || strings.Contains(msg, "resource not accessible") {
					return false, ErrFineGrainedPAT
				}
			}
		}
		return false, fmt.Errorf("failed registering authentication key: %w", err)
	}

	return true, nil
}

// RegisterSigningKey registers an SSH public key for commit/tag cryptographic verification.
func RegisterSigningKey(title, pubKey string) (bool, error) {
	client, err := api.DefaultRESTClient()
	if err != nil {
		return false, fmt.Errorf("failed to initialize GitHub API client: %w", err)
	}

	payload, err := json.Marshal(keyPayload{
		Title: title,
		Key:   pubKey,
	})
	if err != nil {
		return false, err
	}

	err = client.Post("user/ssh_signing_keys", bytes.NewReader(payload), nil)
	if err != nil {
		var httpErr *api.HTTPError
		if errors.As(err, &httpErr) {
			if httpErr.StatusCode == 422 {
				// Key is already present on the account
				if strings.Contains(strings.ToLower(httpErr.Message), "already") ||
					strings.Contains(strings.ToLower(httpErr.Error()), "already") {
					return false, nil
				}
			}
			if httpErr.StatusCode == 403 {
				msg := strings.ToLower(httpErr.Message + " " + httpErr.Error())
				if strings.Contains(msg, "personal access token") || strings.Contains(msg, "resource not accessible") {
					return false, ErrFineGrainedPAT
				}
			}
		}
		return false, fmt.Errorf("failed registering signing key: %w", err)
	}

	return true, nil
}
