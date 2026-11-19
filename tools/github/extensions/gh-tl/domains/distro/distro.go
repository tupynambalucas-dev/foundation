package distro

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/spf13/cobra"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/config"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/contracts"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/ui"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/wsl"
)

// NewDistroCmd constructs the 'distro' command tree with an injected or default WSLDistroOperator.
func NewDistroCmd(op ...contracts.WSLDistroOperator) *cobra.Command {
	var operator contracts.WSLDistroOperator
	if len(op) > 0 && op[0] != nil {
		operator = op[0]
	} else {
		operator = wsl.NewOperator()
	}

	cmd := &cobra.Command{
		Use:   "distro",
		Short: "Provision, inspect, and manage corporate WSL2 custom distributions (.wsl)",
		Long: `Manages tupynambalucas-dev modern tar-based WSL2 distributions (Ubuntu 26.04 LTS),
including catalog discovery, SHA-256 verification, and native wsl.exe installation.`,
	}

	cmd.AddCommand(newListCmd(operator))
	cmd.AddCommand(newStatusCmd(operator))
	cmd.AddCommand(newInstallCmd(operator))

	return cmd
}

func resolveCatalogSource(explicitSource string) string {
	if explicitSource != "" {
		return explicitSource
	}
	localCandidate := filepath.Join("distributions", "catalog", "DistributionInfo.json")
	if info, err := os.Stat(localCandidate); err == nil && !info.IsDir() {
		return localCandidate
	}
	return config.DefaultCatalogURL
}

func newListCmd(inspector contracts.WSLDistroInspector) *cobra.Command {
	var flagCatalog string

	cmd := &cobra.Command{
		Use:   "list",
		Short: "List available corporate WSL2 distributions from the ModernDistributions catalog",
		RunE: func(cmd *cobra.Command, args []string) error {
			source := resolveCatalogSource(flagCatalog)
			manifest, err := inspector.FetchCatalogManifest(source)
			if err != nil {
				return err
			}

			installed, _ := inspector.ListInstalledDistros()
			installedMap := make(map[string]contracts.InstalledDistro)
			for _, inst := range installed {
				installedMap[inst.Name] = inst
			}

			ui.PrintHeader("tupynambalucas-dev WSL2 Distribution Catalog")
			ui.PrintInfo(fmt.Sprintf("Catalog Source: %s", source))
			fmt.Println()

			keys := make([]string, 0, len(manifest.ModernDistributions))
			for k := range manifest.ModernDistributions {
				keys = append(keys, k)
			}
			sort.Strings(keys)

			for _, distroKey := range keys {
				versions := manifest.ModernDistributions[distroKey]
				for _, v := range versions {
					status := "Not Installed"
					if inst, ok := installedMap[distroKey]; ok {
						status = fmt.Sprintf("Installed (%s, WSL %s)", inst.State, inst.Version)
					} else if inst, ok := installedMap[v.Name]; ok {
						status = fmt.Sprintf("Installed (%s, WSL %s)", inst.State, inst.Version)
					}

					fmt.Printf("  %s (%s)\n", ui.Bold(distroKey), v.Name)
					fmt.Printf("    Friendly Name : %s\n", v.FriendlyName)
					fmt.Printf("    Host Status   : %s\n", status)
					if v.Amd64Url != nil {
						fmt.Printf("    AMD64 Archive : %s\n", v.Amd64Url.Url)
						fmt.Printf("    SHA-256       : %s\n", v.Amd64Url.Sha256)
					}
					fmt.Println()
				}
			}

			return nil
		},
	}

	cmd.Flags().StringVar(&flagCatalog, "catalog", "", "Path or HTTPS URL to DistributionInfo.json")
	return cmd
}

func newStatusCmd(inspector contracts.WSLDistroInspector) *cobra.Command {
	return &cobra.Command{
		Use:   "status",
		Short: "Inspect installed WSL2 distributions and host virtualization configuration",
		RunE: func(cmd *cobra.Command, args []string) error {
			ui.PrintHeader("tupynambalucas-dev WSL2 Host & Instance Status")

			home, _ := os.UserHomeDir()
			if home != "" {
				wslConfigPath := filepath.Join(home, ".wslconfig")
				if raw, err := os.ReadFile(wslConfigPath); err == nil {
					content := string(raw)
					if strings.Contains(content, "sparseVhd=true") {
						ui.PrintPass(fmt.Sprintf("Host .wslconfig found at %s (sparseVhd=true)", wslConfigPath))
					} else {
						ui.PrintWarn(fmt.Sprintf("Host .wslconfig found at %s, but sparseVhd=true is not set", wslConfigPath))
					}
				} else {
					ui.PrintWarn("No %UserProfile%\\.wslconfig found (see host/config/.wslconfig.example)")
				}
			}

			distros, err := inspector.ListInstalledDistros()
			if err != nil {
				return err
			}

			fmt.Println()
			ui.PrintSubheader("Registered WSL Distributions")
			if len(distros) == 0 {
				ui.PrintInfo("No WSL distributions are currently installed on this host.")
				return nil
			}

			for _, d := range distros {
				defMarker := " "
				if d.IsDefault {
					defMarker = "*"
				}
				ui.PrintPass(fmt.Sprintf("[%s] %-28s State=%-10s WSL=%s", defMarker, d.Name, d.State, d.Version))
			}

			return nil
		},
	}
}

func newInstallCmd(operator contracts.WSLDistroOperator) *cobra.Command {
	var (
		flagFromFile string
		flagSha256   string
	)

	cmd := &cobra.Command{
		Use:   "install [distro-name]",
		Short: "Install a corporate WSL2 distribution natively via wsl.exe",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			distroName := "tupynambalucas-dev"
			if len(args) > 0 && strings.TrimSpace(args[0]) != "" {
				distroName = strings.TrimSpace(args[0])
			}

			if flagFromFile != "" {
				if flagSha256 != "" {
					ok, err := operator.VerifyFileSHA256(flagFromFile, flagSha256)
					if err != nil {
						return err
					}
					if !ok {
						return fmt.Errorf("cryptographic SHA-256 verification failed for %s (expected %s)", flagFromFile, flagSha256)
					}
					ui.PrintPass(fmt.Sprintf("Verified SHA-256 integrity for %s", flagFromFile))
				}
				ui.PrintInfo(fmt.Sprintf("Installing %s from archive %s...", distroName, flagFromFile))
				return operator.InstallFromFile(flagFromFile, distroName)
			}

			// Auto-enroll catalog manifest into Windows Registry if missing or outdated
			currentURL, _ := operator.GetCatalogURL()
			if !strings.EqualFold(currentURL, config.DefaultCatalogURL) {
				ui.PrintInfo(fmt.Sprintf("Auto-enrolling catalog manifest into Windows Registry: %s", config.DefaultCatalogURL))
				if err := operator.SetCatalogURL(config.DefaultCatalogURL); err != nil {
					ui.PrintWarn(fmt.Sprintf("Could not auto-enroll catalog URL in registry (Administrator elevation required): %v", err))
				} else {
					ui.PrintPass("Catalog URL registered in Windows Registry (DistributionListUrlAppend)")
				}
			}

			ui.PrintInfo(fmt.Sprintf("Installing %s from registered WSL catalog...", distroName))
			return operator.InstallFromCatalog(distroName)
		},
	}

	cmd.Flags().StringVar(&flagFromFile, "from-file", "", "Install directly from a local .wsl archive file")
	cmd.Flags().StringVar(&flagSha256, "sha256", "", "Expected SHA-256 hex digest (0x...) when using --from-file")
	return cmd
}
