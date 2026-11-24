package cmd

import (
	"github.com/spf13/cobra"
	"github.com/tupynambalucas-dev/foundation/extensions/gh-tl/domains/distro"
	"github.com/tupynambalucas-dev/foundation/extensions/gh-tl/domains/host"
	"github.com/tupynambalucas-dev/foundation/extensions/gh-tl/domains/onboard"
)

var rootCmd = &cobra.Command{
	Use:   "tl",
	Short: "Tupynamba Lucas Enterprise Developer Workstation & WSL2 CLI Suite",
	Long: `tl (also invoked via 'gh tl' or 'gh workstation') is the centralized developer
workstation CLI for the tupynambalucas-dev ecosystem, orchestrating WSL2 custom
distributions (.wsl), cryptographic SSH signing, Windows host readiness, and multi-repository gates.`,
}

// Execute runs the root CLI command suite.
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.AddCommand(onboard.NewOnboardCmd())
	rootCmd.AddCommand(onboard.NewVerifyCmd())
	rootCmd.AddCommand(distro.NewDistroCmd())
	rootCmd.AddCommand(host.NewHostCmd())
}
