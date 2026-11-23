package wsl

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"testing"
)

func TestParseManifest(t *testing.T) {
	raw := []byte(`{
  "ModernDistributions": {
    "tupynambalucas-dev": [
      {
        "Name": "tupynambalucas-dev-26.04",
        "FriendlyName": "tupynambalucas-dev (Ubuntu 26.04 LTS Developer Workstation)",
        "Default": true,
        "Amd64Url": {
          "Url": "https://github.com/tupynambalucas-dev/workstation/releases/latest/download/tupynambalucas-dev.wsl",
          "Sha256": "0xabcdef1234567890"
        }
      }
    ]
  }
}`)

	manifest, err := ParseManifest(raw)
	if err != nil {
		t.Fatalf("ParseManifest failed: %v", err)
	}

	versions, ok := manifest.ModernDistributions["tupynambalucas-dev"]
	if !ok || len(versions) != 1 {
		t.Fatalf("expected 1 version for tupynambalucas-dev, got %v", versions)
	}

	if versions[0].Name != "tupynambalucas-dev-26.04" {
		t.Errorf("unexpected Name: %s", versions[0].Name)
	}
	if versions[0].Amd64Url == nil || versions[0].Amd64Url.Sha256 != "0xabcdef1234567890" {
		t.Errorf("unexpected Amd64Url: %+v", versions[0].Amd64Url)
	}
}

func TestVerifyFileSHA256(t *testing.T) {
	tempDir := t.TempDir()
	sampleFile := filepath.Join(tempDir, "sample.wsl")
	payload := []byte("tupynambalucas-dev-wsl-archive-payload")
	if err := os.WriteFile(sampleFile, payload, 0644); err != nil {
		t.Fatalf("failed writing sample file: %v", err)
	}

	sum := sha256.Sum256(payload)
	hexHash := "0x" + hex.EncodeToString(sum[:])

	op := NewOperator()
	match, err := op.VerifyFileSHA256(sampleFile, hexHash)
	if err != nil {
		t.Fatalf("VerifyFileSHA256 returned unexpected error: %v", err)
	}
	if !match {
		t.Error("expected SHA-256 verification to succeed with 0x prefix")
	}

	mismatch, err := op.VerifyFileSHA256(sampleFile, "0x0000000000000000")
	if err != nil {
		t.Fatalf("VerifyFileSHA256 returned unexpected error on mismatch: %v", err)
	}
	if mismatch {
		t.Error("expected SHA-256 verification to fail on mismatched hash")
	}
}

func TestParseWSLListVerbose(t *testing.T) {
	sample := `  NAME                          STATE           VERSION
* tupynambalucas-dev            Running         2
  tupynambalucas-dev-cluster    Stopped         2
`
	distros := ParseWSLListVerbose(sample)
	if len(distros) != 2 {
		t.Fatalf("expected 2 distros, got %d", len(distros))
	}

	if distros[0].Name != "tupynambalucas-dev" || !distros[0].IsDefault || distros[0].State != "Running" || distros[0].Version != "2" {
		t.Errorf("unexpected first distro: %+v", distros[0])
	}
	if distros[1].Name != "tupynambalucas-dev-cluster" || distros[1].IsDefault || distros[1].State != "Stopped" {
		t.Errorf("unexpected second distro: %+v", distros[1])
	}
}
