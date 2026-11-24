package distro

import (
	"fmt"
	"testing"

	"github.com/tupynambalucas-dev/foundation/extensions/gh-tl/internal/contracts"
)

type mockWSLOperator struct {
	manifest          *contracts.DistributionManifest
	installed         []contracts.InstalledDistro
	verifyResult      bool
	installedCatalog  string
	installedFilePath string
	installedFileName string
}

func (m *mockWSLOperator) ListInstalledDistros() ([]contracts.InstalledDistro, error) {
	return m.installed, nil
}

func (m *mockWSLOperator) FetchCatalogManifest(source string) (*contracts.DistributionManifest, error) {
	if m.manifest == nil {
		return nil, fmt.Errorf("no manifest configured")
	}
	return m.manifest, nil
}

func (m *mockWSLOperator) VerifyFileSHA256(filePath, expectedHexHash string) (bool, error) {
	return m.verifyResult, nil
}

func (m *mockWSLOperator) InstallFromCatalog(distroName string) error {
	m.installedCatalog = distroName
	return nil
}

func (m *mockWSLOperator) InstallFromFile(wslFilePath, distroName string) error {
	m.installedFilePath = wslFilePath
	m.installedFileName = distroName
	return nil
}

func (m *mockWSLOperator) GetCatalogURL() (string, error) {
	return "https://github.com/tupynambalucas-dev/workstation/releases/latest/download/DistributionInfo.json", nil
}

func (m *mockWSLOperator) SetCatalogURL(url string) error {
	return nil
}

func (m *mockWSLOperator) IsAdmin() bool {
	return true
}

func TestDistroListCommand(t *testing.T) {
	mock := &mockWSLOperator{
		manifest: &contracts.DistributionManifest{
			ModernDistributions: map[string][]contracts.ModernDistroVersion{
				"tupynambalucas-dev": {
					{
						Name:         "tupynambalucas-dev-26.04",
						FriendlyName: "tupynambalucas-dev (Ubuntu 26.04 LTS)",
						Default:      true,
					},
				},
			},
		},
		installed: []contracts.InstalledDistro{
			{Name: "tupynambalucas-dev", State: "Running", Version: "2", IsDefault: true},
		},
	}

	cmd := NewDistroCmd(mock)
	cmd.SetArgs([]string{"list", "--catalog", "mock-source"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("expected distro list to succeed, got error: %v", err)
	}
}

func TestDistroInstallCatalogAndFile(t *testing.T) {
	mock := &mockWSLOperator{verifyResult: true}
	cmd := NewDistroCmd(mock)

	cmd.SetArgs([]string{"install", "tupynambalucas-dev-cluster"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("expected catalog install to succeed, got: %v", err)
	}
	if mock.installedCatalog != "tupynambalucas-dev-cluster" {
		t.Errorf("expected installedCatalog='tupynambalucas-dev-cluster', got %q", mock.installedCatalog)
	}

	cmdFile := NewDistroCmd(mock)
	cmdFile.SetArgs([]string{"install", "tupynambalucas-dev", "--from-file", "output/tupynambalucas-dev.wsl", "--sha256", "0x1234"})
	if err := cmdFile.Execute(); err != nil {
		t.Fatalf("expected file install to succeed, got: %v", err)
	}
	if mock.installedFilePath != "output/tupynambalucas-dev.wsl" || mock.installedFileName != "tupynambalucas-dev" {
		t.Errorf("unexpected file install args: path=%q name=%q", mock.installedFilePath, mock.installedFileName)
	}
}
