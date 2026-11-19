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
