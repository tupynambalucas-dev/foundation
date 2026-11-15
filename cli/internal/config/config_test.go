package config

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestNormalizePath(t *testing.T) {
	input := `C:\Users\tupyn\.ssh\github_tupynambalucas-dev_ed25519.pub`
	got := NormalizePath(input)
	if strings.Contains(got, `\`) {
		t.Errorf("expected forward slashes only, got %q", got)
	}
}

func TestSetupCorporateGitConfig(t *testing.T) {
	tempDir := t.TempDir()
	targetPath := filepath.Join(tempDir, ".gitconfig-tupynambalucas-dev")
	pubKeyPath := filepath.Join(tempDir, "id_ed25519.pub")
	allowedSignersPath := filepath.Join(tempDir, "allowed_signers")

	err := SetupCorporateGitConfig("Lucas Tupynamba", DefaultEmail, pubKeyPath, allowedSignersPath, targetPath)
	if err != nil {
		t.Fatalf("SetupCorporateGitConfig failed: %v", err)
	}

	raw, err := os.ReadFile(targetPath)
	if err != nil {
		t.Fatalf("failed reading generated corporate gitconfig: %v", err)
	}

	content := string(raw)
	if !strings.Contains(content, "name = Lucas Tupynamba") {
		t.Errorf("expected user name in config, got:\n%s", content)
	}
	if !strings.Contains(content, "email = "+DefaultEmail) {
		t.Errorf("expected email in config, got:\n%s", content)
	}
	if !strings.Contains(content, "format = ssh") {
		t.Errorf("expected gpg format ssh in config, got:\n%s", content)
	}
}
