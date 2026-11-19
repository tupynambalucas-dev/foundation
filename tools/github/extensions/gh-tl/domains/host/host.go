package host

import (
	"github.com/spf13/cobra"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/contracts"
	"github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/wsl"
)

// NewHostCmd constructs the 'host' command tree for Windows host governance.
func NewHostCmd(op ...contracts.WSLDistroOperator) *cobra.Command {
	var operator contracts.WSLDistroOperator
	if len(op) > 0 && op[0] != nil {
		operator = op[0]
	} else {
		operator = wsl.NewOperator()
	}

	cmd := &cobra.Command{
		Use:   "host",
		Short: "Manage Windows 11 host readiness, hypervisor parameters, and WSL catalog federation",
		Long: `Governs Windows 11 virtualization settings natively in Go without PowerShell:
automates Windows Registry ModernDistributions catalog federation, non-destructive .wslconfig
deployment, and Windows Terminal asset staging.`,
	}

	cmd.AddCommand(newPrepareCmd(operator))
	cmd.AddCommand(newVerifyCmd(operator))

	return cmd
}
