package host

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"
	"github.com/tupynambalucas-dev/foundation/extensions/gh-tl/internal/config"
	"github.com/tupynambalucas-dev/foundation/extensions/gh-tl/internal/contracts"
	"github.com/tupynambalucas-dev/foundation/extensions/gh-tl/internal/ui"
)

func newVerifyCmd(operator contracts.WSLDistroOperator) *cobra.Command {
	return &cobra.Command{
		Use:   "verify",
		Short: "Verify Windows host readiness gates for corporate WSL2 distributions",
		RunE: func(cmd *cobra.Command, args []string) error {
			ui.PrintHeader("tupynambalucas-dev Windows Host Readiness Audit")

			allPassed := true

			// Gate 1: Administrator Elevation
			isAdmin := operator.IsAdmin()
			if isAdmin {
				ui.PrintPass("Gate 1 [Admin Elevation]: Current process possesses elevated Administrator token")
			} else {
				ui.PrintInfo("Gate 1 [Admin Elevation]: Current process running as standard user (elevation required only for registry writes)")
			}

			// Gate 2: Windows Registry Catalog Federation
			catalogURL, err := operator.GetCatalogURL()
			if err != nil || catalogURL == "" {
				ui.PrintWarn(fmt.Sprintf("Gate 2 [WSL Catalog]: DistributionListUrlAppend not registered in HKLM: %v", err))
				allPassed = false
			} else {
				if strings.EqualFold(catalogURL, config.DefaultCatalogURL) {
					ui.PrintPass(fmt.Sprintf("Gate 2 [WSL Catalog]: Catalog federated cleanly: %s", catalogURL))
				} else {
					ui.PrintWarn(fmt.Sprintf("Gate 2 [WSL Catalog]: Registered URL differs from canonical SSOT: %s", catalogURL))
				}
			}

			// Gate 3: .wslconfig Hypervisor Settings
			home, _ := os.UserHomeDir()
			if home != "" {
				wslConfigPath := filepath.Join(home, ".wslconfig")
				if raw, err := os.ReadFile(wslConfigPath); err == nil {
					content := string(raw)
					if strings.Contains(content, "sparseVhd=true") {
						ui.PrintPass(fmt.Sprintf("Gate 3 [.wslconfig]: Hypervisor configuration present with sparseVhd=true (%s)", wslConfigPath))
					} else {
						ui.PrintWarn(fmt.Sprintf("Gate 3 [.wslconfig]: Found %s but sparseVhd=true is not declared", wslConfigPath))
					}
				} else {
					ui.PrintWarn("Gate 3 [.wslconfig]: %UserProfile%\\.wslconfig not found (run 'gh tl host prepare')")
					allPassed = false
				}
			}

			// Gate 4: Windows Terminal Fragments Directory
			localApp := os.Getenv("LOCALAPPDATA")
			if localApp != "" {
				fragmentDir := filepath.Join(localApp, "Microsoft", "Windows Terminal", "Fragments", "Microsoft.WSL")
				wallpaperPath := filepath.Join(fragmentDir, "monygang.png")
				if _, err := os.Stat(wallpaperPath); err == nil {
					ui.PrintPass(fmt.Sprintf("Gate 4 [Terminal Assets]: Wallpaper staged at %s", wallpaperPath))
				} else {
					ui.PrintInfo(fmt.Sprintf("Gate 4 [Terminal Assets]: Terminal wallpaper not staged at %s", wallpaperPath))
				}
			}

			// Gate 5: WSL Engine Responsiveness
			distros, err := operator.ListInstalledDistros()
			if err != nil {
				ui.PrintWarn(fmt.Sprintf("Gate 5 [WSL Engine]: wsl.exe query failed: %v", err))
				allPassed = false
			} else {
				ui.PrintPass(fmt.Sprintf("Gate 5 [WSL Engine]: wsl.exe responsive (%d distributions registered)", len(distros)))
			}

			fmt.Println()
			if allPassed {
				ui.PrintPass("All critical host readiness gates PASSED. Host is ready for 'gh tl distro install'.")
			} else {
				ui.PrintWarn("Some readiness gates flagged warnings. Run 'gh tl host prepare' as Administrator to resolve.")
			}

			return nil
		},
	}
}
