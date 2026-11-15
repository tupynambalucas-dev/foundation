package wsl

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/tupynambalucas-dev/workstation/cli/internal/contracts"
)

// Operator implements contracts.WSLDistroOperator using the host wsl.exe binary and HTTP/file readers.
type Operator struct {
	HTTPClient *http.Client
}

var _ contracts.WSLDistroOperator = (*Operator)(nil)

// NewOperator returns a configured WSLDistroOperator instance.
func NewOperator() *Operator {
	return &Operator{
		HTTPClient: &http.Client{Timeout: 15 * time.Second},
	}
}

// ParseManifest parses a Microsoft WSL 2.4.4+ ModernDistributions JSON manifest.
func ParseManifest(data []byte) (*contracts.DistributionManifest, error) {
	var manifest contracts.DistributionManifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, fmt.Errorf("failed to parse DistributionInfo.json manifest: %w", err)
	}
	if len(manifest.ModernDistributions) == 0 {
		return nil, fmt.Errorf("manifest contains no ModernDistributions entries")
	}
	return &manifest, nil
}

// FetchCatalogManifest loads a DistributionInfo.json manifest from a local file path or HTTPS URL.
func (o *Operator) FetchCatalogManifest(source string) (*contracts.DistributionManifest, error) {
	var raw []byte
	var err error

	if strings.HasPrefix(source, "http://") || strings.HasPrefix(source, "https://") {
		resp, reqErr := o.HTTPClient.Get(source)
		if reqErr != nil {
			return nil, fmt.Errorf("failed fetching remote catalog %s: %w", source, reqErr)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("remote catalog %s returned HTTP %d", source, resp.StatusCode)
		}
		raw, err = io.ReadAll(resp.Body)
	} else {
		cleanPath := strings.TrimPrefix(source, "file:///")
		cleanPath = strings.TrimPrefix(cleanPath, "file://")
		raw, err = os.ReadFile(cleanPath)
	}

	if err != nil {
		return nil, fmt.Errorf("failed reading catalog manifest from %s: %w", source, err)
	}

	return ParseManifest(raw)
}

// NormalizeHexHash strips optional "0x" or "0X" prefixes and lowercases a SHA-256 hex digest.
func NormalizeHexHash(hash string) string {
	trimmed := strings.TrimSpace(hash)
	trimmed = strings.TrimPrefix(trimmed, "0x")
	trimmed = strings.TrimPrefix(trimmed, "0X")
	return strings.ToLower(trimmed)
}

// VerifyFileSHA256 computes the SHA-256 digest of filePath and compares it against expectedHexHash.
func (o *Operator) VerifyFileSHA256(filePath, expectedHexHash string) (bool, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return false, fmt.Errorf("failed to open %s for SHA-256 verification: %w", filePath, err)
	}
	defer f.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, f); err != nil {
		return false, fmt.Errorf("failed hashing %s: %w", filePath, err)
	}

	actual := hex.EncodeToString(hasher.Sum(nil))
	expected := NormalizeHexHash(expectedHexHash)
	return actual == expected, nil
}

// StripUTF16Nulls removes null bytes emitted by wsl.exe UTF-16LE console output.
func StripUTF16Nulls(raw []byte) string {
	cleaned := make([]byte, 0, len(raw))
	for _, b := range raw {
		if b != 0x00 && b != '\r' {
			cleaned = append(cleaned, b)
		}
	}
	return string(cleaned)
}

// ParseWSLListVerbose parses the output of 'wsl.exe --list --verbose'.
func ParseWSLListVerbose(output string) []contracts.InstalledDistro {
	lines := strings.Split(output, "\n")
	var distros []contracts.InstalledDistro

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		// Skip header line ("NAME STATE VERSION")
		if i == 0 && (strings.Contains(strings.ToUpper(trimmed), "NAME") && strings.Contains(strings.ToUpper(trimmed), "STATE")) {
			continue
		}

		isDefault := false
		if strings.HasPrefix(trimmed, "*") {
			isDefault = true
			trimmed = strings.TrimSpace(strings.TrimPrefix(trimmed, "*"))
		}

		fields := strings.Fields(trimmed)
		if len(fields) < 3 {
			continue
		}

		distros = append(distros, contracts.InstalledDistro{
			Name:      fields[0],
			State:     fields[1],
			Version:   fields[2],
			IsDefault: isDefault,
		})
	}

	return distros
}

// ListInstalledDistros executes 'wsl.exe --list --verbose' and returns registered distributions.
func (o *Operator) ListInstalledDistros() ([]contracts.InstalledDistro, error) {
	cmd := exec.Command("wsl.exe", "--list", "--verbose")
	out, err := cmd.CombinedOutput()
	if err != nil {
		cleaned := strings.ToLower(StripUTF16Nulls(out))
		// wsl.exe returns exit code -1 (0xffffffff) across all Windows locales when zero distributions are registered.
		if strings.Contains(cleaned, "no installed distributions") ||
			strings.Contains(cleaned, "wsl.exe --install") ||
			strings.Contains(cleaned, "--list --online") ||
			strings.Contains(err.Error(), "0xffffffff") {
			return nil, nil
		}
		return nil, fmt.Errorf("failed executing wsl.exe --list --verbose: %w", err)
	}

	cleaned := StripUTF16Nulls(out)
	return ParseWSLListVerbose(cleaned), nil
}

// InstallFromCatalog invokes native 'wsl.exe --install <distroName>' from the registered catalog.
func (o *Operator) InstallFromCatalog(distroName string) error {
	cmd := exec.Command("wsl.exe", "--install", "-d", distroName)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("wsl.exe --install -d %s failed: %w", distroName, err)
	}
	return nil
}

// InstallFromFile invokes native 'wsl.exe --install --from-file <wslFilePath> --name <distroName>'.
func (o *Operator) InstallFromFile(wslFilePath, distroName string) error {
	args := []string{"--install", "--from-file", wslFilePath}
	if distroName != "" {
		args = append(args, "--name", distroName)
	}
	cmd := exec.Command("wsl.exe", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("wsl.exe %s failed: %w", strings.Join(args, " "), err)
	}
	return nil
}
