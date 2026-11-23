package github

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestKeyPayloadMarshaling(t *testing.T) {
	p := keyPayload{
		Title: "[tupynambalucas-dev Sign] workstation",
		Key:   "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI1234567890abcdef",
	}

	raw, err := json.Marshal(p)
	if err != nil {
		t.Fatalf("failed marshaling keyPayload: %v", err)
	}

	s := string(raw)
	if !strings.Contains(s, `"title":"[tupynambalucas-dev Sign] workstation"`) {
		t.Errorf("unexpected marshaled JSON: %s", s)
	}
}

func TestSigningKeyMatchingLogic(t *testing.T) {
	pubKeyContent := "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE14YYmWFmvJajpwA9FUBteEFKAOZXXrQN8asHmmyger contato@tupynambalucas.dev"
	fields := strings.Fields(pubKeyContent)
	if len(fields) < 2 {
		t.Fatalf("expected at least 2 fields in public key, got %d", len(fields))
	}
	keyData := fields[1]

	enrolledKeys := []SSHSigningKey{
		{
			ID:    1,
			Key:   "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEDis74XOysFXrdoFZf/bcJ59Ycmfa0l473ELM5/D0Hy",
			Title: "old-key",
		},
		{
			ID:    2,
			Key:   "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE14YYmWFmvJajpwA9FUBteEFKAOZXXrQN8asHmmyger",
			Title: "corporate-key",
		},
	}

	matched := false
	for _, k := range enrolledKeys {
		if strings.Contains(k.Key, keyData) {
			matched = true
			break
		}
	}

	if !matched {
		t.Errorf("expected corporate key to match enrolled keys")
	}

	unmatchedKey := "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINOTENROLLED12345 user@example.com"
	unmatchedFields := strings.Fields(unmatchedKey)
	unmatchedData := unmatchedFields[1]

	matchedUnregistered := false
	for _, k := range enrolledKeys {
		if strings.Contains(k.Key, unmatchedData) {
			matchedUnregistered = true
			break
		}
	}
	if matchedUnregistered {
		t.Errorf("expected unregistered key to NOT match enrolled keys")
	}
}
