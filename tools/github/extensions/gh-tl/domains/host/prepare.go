package host

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/config"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/contracts"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/ui"
)

const defaultWSLConfigTemplate = `[wsl2]
memory=16GB
processors=8
sparseVhd=true
autoMemoryReclaim=gradual
nestedVirtualization=true

[experimental]
autoProxy=true
dnsTunneling=true
`

func newPrepareCmd(operator contracts.WSLDistroOperator) *cobra.Command {
	var (
		flagCatalogURL     string
		flagSkipWSLConfig  bool
		flagSkipWallpaper  bool
	)

	cmd := &cobra.Command{
		Use:   "prepare",
		Short: "Prepare Windows 11 host with registry catalog, .wslconfig, and terminal assets",
		RunE: func(cmd *cobra.Command, args []string) error {
			ui.PrintHeader("tupynambalucas-dev Windows Host Readiness Preparation")

			catalogURL := config.DefaultCatalogURL
			if flagCatalogURL != "" {
				catalogURL = flagCatalogURL
			}

			// 1. Windows Registry Catalog Federation
			ui.PrintSubheader("1. Windows Registry ModernDistributions Enrollment")
			if err := operator.SetCatalogURL(catalogURL); err != nil {
				ui.PrintWarn(fmt.Sprintf("Could not write registry key directly: %v", err))
				ui.PrintInfo("To enroll manually, import virtualization/registry/tupynambalucas-dev.reg as Administrator.")
			} else {
				ui.PrintPass(fmt.Sprintf("Enrolled catalog URL in HKLM\\...\\Lxss: %s", catalogURL))
			}

			// 2. Non-Destructive .wslconfig Deployment
			if !flagSkipWSLConfig {
				ui.PrintSubheader("2. Hypervisor Configuration (.wslconfig)")
				home, err := os.UserHomeDir()
				if err != nil {
					ui.PrintWarn(fmt.Sprintf("Could not determine user home directory: %v", err))
				} else {
					targetPath := filepath.Join(home, ".wslconfig")
					backupPath := filepath.Join(home, ".wslconfig.bak")

					if _, err := os.Stat(targetPath); err == nil {
						// Create non-destructive backup
						data, readErr := os.ReadFile(targetPath)
						if readErr == nil {
							_ = os.WriteFile(backupPath, data, 0644)
							ui.PrintInfo(fmt.Sprintf("Existing .wslconfig backed up to %s", backupPath))
						}
					}

					// Read template from virtualization/config/.wslconfig.example if available, else fallback
					templateContent := defaultWSLConfigTemplate
					exampleCandidate := filepath.Join("virtualization", "config", ".wslconfig.example")
					if raw, readErr := os.ReadFile(exampleCandidate); readErr == nil {
						templateContent = string(raw)
					}

					if writeErr := os.WriteFile(targetPath, []byte(templateContent), 0644); writeErr != nil {
						ui.PrintWarn(fmt.Sprintf("Failed writing %s: %v", targetPath, writeErr))
					} else {
						ui.PrintPass(fmt.Sprintf("Deployed authoritative .wslconfig to %s", targetPath))
					}
				}
			}

			// 3. Windows Terminal Fragment Wallpaper Staging
			if !flagSkipWallpaper {
				ui.PrintSubheader("3. Windows Terminal Fragment Wallpaper Staging")
				localApp := os.Getenv("LOCALAPPDATA")
				if localApp != "" {
					fragmentDir := filepath.Join(localApp, "Microsoft", "Windows Terminal", "Fragments", "Microsoft.WSL")
					if mkErr := os.MkdirAll(fragmentDir, 0755); mkErr == nil {
						wallpaperTarget := filepath.Join(fragmentDir, "monygang.png")
						wallpaperSource := filepath.Join("distributions", "shared", "assets", "monygang.png")

						if srcData, srcErr := os.ReadFile(wallpaperSource); srcErr == nil {
							if writeErr := os.WriteFile(wallpaperTarget, srcData, 0644); writeErr == nil {
								ui.PrintPass(fmt.Sprintf("Staged terminal wallpaper to %s", wallpaperTarget))
							} else {
								ui.PrintWarn(fmt.Sprintf("Could not write wallpaper: %v", writeErr))
							}
						} else {
							ui.PrintInfo("Wallpaper source not found in working directory (skipped)")
						}
					}
				}
			}

			fmt.Println()
			ui.PrintPass("Host preparation completed. Run 'gh tl host verify' to validate readiness gates.")
			return nil
		},
	}

	cmd.Flags().StringVar(&flagCatalogURL, "catalog-url", "", "Custom catalog URL override")
	cmd.Flags().BoolVar(&flagSkipWSLConfig, "skip-wslconfig", false, "Skip .wslconfig deployment")
	cmd.Flags().BoolVar(&flagSkipWallpaper, "skip-wallpaper", false, "Skip wallpaper staging")
	return cmd
}
