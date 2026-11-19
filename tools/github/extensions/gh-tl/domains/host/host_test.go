package host

import (
	"testing"

	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/contracts"
)

type mockHostOperator struct {
	catalogURL string
	setErr     error
	isAdmin    bool
	installed  []contracts.InstalledDistro
}

func (m *mockHostOperator) ListInstalledDistros() ([]contracts.InstalledDistro, error) {
	return m.installed, nil
}

func (m *mockHostOperator) FetchCatalogManifest(source string) (*contracts.DistributionManifest, error) {
	return nil, nil
}

func (m *mockHostOperator) VerifyFileSHA256(filePath, expectedHexHash string) (bool, error) {
	return true, nil
}

func (m *mockHostOperator) InstallFromCatalog(distroName string) error {
	return nil
}

func (m *mockHostOperator) InstallFromFile(wslFilePath, distroName string) error {
	return nil
}

func (m *mockHostOperator) GetCatalogURL() (string, error) {
	return m.catalogURL, nil
}

func (m *mockHostOperator) SetCatalogURL(url string) error {
	if m.setErr != nil {
		return m.setErr
	}
	m.catalogURL = url
	return nil
}

func (m *mockHostOperator) IsAdmin() bool {
	return m.isAdmin
}

func TestNewHostCmdWiring(t *testing.T) {
	mock := &mockHostOperator{
		catalogURL: "https://example.com/DistributionInfo.json",
		isAdmin:    true,
		installed:  []contracts.InstalledDistro{{Name: "tupynambalucas-dev", State: "Running", Version: "2"}},
	}

	cmd := NewHostCmd(mock)
	if cmd == nil {
		t.Fatal("expected NewHostCmd to return non-nil command")
	}

	// Test verify subcommand
	cmd.SetArgs([]string{"verify"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("expected host verify to execute without error, got: %v", err)
	}

	// Test prepare subcommand with dry run / flags
	cmd.SetArgs([]string{"prepare", "--skip-wslconfig", "--skip-wallpaper"})
	if err := cmd.Execute(); err != nil {
		t.Fatalf("expected host prepare to execute without error, got: %v", err)
	}
}
