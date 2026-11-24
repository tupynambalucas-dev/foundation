//go:build windows

package wsl

import (
	"fmt"

	"golang.org/x/sys/windows"
	"golang.org/x/sys/windows/registry"
)

const (
	// LxssRegistryPath is the registry path where Microsoft WSL reads catalog federation URLs.
	LxssRegistryPath = `SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss`
	// CatalogValueName is the append URL value consumed by ModernDistributions.
	CatalogValueName = `DistributionListUrlAppend`
)

// GetCatalogURL reads DistributionListUrlAppend from HKLM.
func (o *Operator) GetCatalogURL() (string, error) {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, LxssRegistryPath, registry.QUERY_VALUE)
	if err != nil {
		return "", fmt.Errorf("failed to open Lxss registry key: %w", err)
	}
	defer k.Close()

	val, _, err := k.GetStringValue(CatalogValueName)
	if err != nil {
		return "", err
	}
	return val, nil
}

// SetCatalogURL writes DistributionListUrlAppend into HKLM.
func (o *Operator) SetCatalogURL(url string) error {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, LxssRegistryPath, registry.SET_VALUE)
	if err != nil {
		return fmt.Errorf("failed to open Lxss registry key for writing (requires Administrator elevation): %w", err)
	}
	defer k.Close()

	if err := k.SetStringValue(CatalogValueName, url); err != nil {
		return fmt.Errorf("failed to set %s in registry: %w", CatalogValueName, err)
	}
	return nil
}

// IsAdmin returns true if the current Windows process is running with elevated Administrator token.
func (o *Operator) IsAdmin() bool {
	var token windows.Token
	err := windows.OpenProcessToken(windows.CurrentProcess(), windows.TOKEN_QUERY, &token)
	if err != nil {
		return false
	}
	defer token.Close()
	return token.IsElevated()
}
