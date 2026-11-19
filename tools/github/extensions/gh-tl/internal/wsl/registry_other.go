//go:build !windows

package wsl

import "fmt"

// GetCatalogURL returns a placeholder error on non-Windows platforms.
func (o *Operator) GetCatalogURL() (string, error) {
	return "", fmt.Errorf("registry catalog federation is only supported on Windows")
}

// SetCatalogURL is a no-op on non-Windows platforms.
func (o *Operator) SetCatalogURL(url string) error {
	return fmt.Errorf("registry catalog federation is only supported on Windows")
}

// IsAdmin returns false on non-Windows platforms in this context.
func (o *Operator) IsAdmin() bool {
	return false
}
