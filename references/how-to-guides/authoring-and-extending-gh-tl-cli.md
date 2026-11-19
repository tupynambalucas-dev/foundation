# Authoring and Extending the gh-tl CLI

Step-by-step developer guide for adding new CLI domain commands, implementing decoupled interfaces, and writing unit tests inside `tools/github/extensions/gh-tl/`.

---

## Architectural Principles

The `gh-tl` extension is structured according to **Feature-Sliced Design (FSD)** and **Domain-Driven Design (DDD)** principles:

```text
tools/github/extensions/gh-tl/
├── cmd/               # Tier 1: CLI entrypoint and Cobra root wiring
│   ├── root.go        # Combines domain commands
│   └── tl/main.go     # Binary entrypoint
├── domains/           # Tier 2: Autonomous business domain slices
│   ├── distro/        # WSL distribution discovery and installation
│   ├── host/          # Windows host readiness and registry governance
│   └── onboard/       # Developer identity and readiness verification
└── internal/          # Tier 3: Shared adapters, contracts, and SSOT utilities
    ├── contracts/     # Segregated SOLID interfaces (dependency inversion)
    ├── config/        # SSOT constants and paths
    ├── git/           # Git process runner
    ├── github/        # GitHub API client (go-gh)
    ├── ssh/           # SSH keygen and allowed_signers
    ├── ui/            # Formatted terminal UI (strictly zero emojis)
    └── wsl/           # Win32 registry and wsl.exe process wrappers
```

> [!IMPORTANT]
> **Strict Dependency Flow**:
> - `cmd/` depends on `domains/`.
> - `domains/` depends on `internal/`.
> - Feature slices in `domains/*` MUST NEVER import each other.
> - Packages in `internal/*` MUST NEVER import `domains/*` or `cmd/*`.

---

## Step 1: Define Interfaces in `internal/contracts/`

When a new domain requires interacting with the OS, filesystem, or external processes, define a segregated interface in `internal/contracts/interfaces.go`:

```go
package contracts

// BackupOperator defines the contract for archive creation.
type BackupOperator interface {
    ExportDistro(name string, destination string) error
    VerifyBackup(destination string) (bool, error)
}
```

This ensures that commands can be tested deterministically using mocks without touching real OS files.

---

## Step 2: Implement Real Adapters in `internal/`

Implement the interface in a concrete adapter under `internal/`:

```go
package wsl

import (
    "os/exec"
    "github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/contracts"
)

type RealBackupOperator struct{}

func NewRealBackupOperator() contracts.BackupOperator {
    return &RealBackupOperator{}
}

func (b *RealBackupOperator) ExportDistro(name string, destination string) error {
    cmd := exec.Command("wsl.exe", "--export", name, destination)
    return cmd.Run()
}

func (b *RealBackupOperator) VerifyBackup(destination string) (bool, error) {
    // Verification logic
    return true, nil
}
```

---

## Step 3: Author the Domain Slice in `domains/`

Create a new directory under `domains/<slice-name>/`:

```go
package backup

import (
    "github.com/spf13/cobra"
    "github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/contracts"
    "github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/ui"
    "github.com/tupynambalucas-dev/workstation/tools/github/extensions/gh-tl/internal/wsl"
)

// NewBackupCmd creates the backup cobra command tree.
func NewBackupCmd() *cobra.Command {
    return NewBackupCmdWithOperator(wsl.NewRealBackupOperator())
}

// NewBackupCmdWithOperator allows injecting mock operators for testing.
func NewBackupCmdWithOperator(op contracts.BackupOperator) *cobra.Command {
    cmd := &cobra.Command{
        Use:   "backup <distro-name>",
        Short: "Export a local WSL distribution into a backup archive",
        Args:  cobra.ExactArgs(1),
        RunE: func(cmd *cobra.Command, args []string) error {
            distroName := args[0]
            ui.Info("Backing up distribution %s...", distroName)
            return op.ExportDistro(distroName, distroName+".tar")
        },
    }
    return cmd
}
```

---

## Step 4: Write Unit Tests with Mocks

Create `<slice-name>_test.go` in the same directory:

```go
package backup

import (
    "testing"
)

type mockBackupOperator struct {
    exportedName string
}

func (m *mockBackupOperator) ExportDistro(name string, dest string) error {
    m.exportedName = name
    return nil
}

func (m *mockBackupOperator) VerifyBackup(dest string) (bool, error) {
    return true, nil
}

func TestBackupCommand(t *testing.T) {
    mock := &mockBackupOperator{}
    cmd := NewBackupCmdWithOperator(mock)
    cmd.SetArgs([]string{"tupynambalucas-dev"})

    if err := cmd.Execute(); err != nil {
        t.Fatalf("unexpected error: %v", err)
    }

    if mock.exportedName != "tupynambalucas-dev" {
        t.Errorf("expected distro name tupynambalucas-dev, got %s", mock.exportedName)
    }
}
```

---

## Step 5: Wire the Command into `cmd/root.go`

Register the new command in `cmd/root.go`:

```go
func init() {
    rootCmd.AddCommand(onboard.NewOnboardCmd())
    rootCmd.AddCommand(onboard.NewVerifyCmd())
    rootCmd.AddCommand(distro.NewDistroCmd())
    rootCmd.AddCommand(host.NewHostCmd())
    rootCmd.AddCommand(backup.NewBackupCmd()) // Registered
}
```

---

## Step 6: Validate and Test via Monorepo Tooling

Run the test suite from the repository root:

```bash
# Run tests across Go extension
pnpm tl:test

# Run TypeScript and Turborepo checks
pnpm lint
pnpm typecheck
```

---

## Related References

- [CLI Command Specification](../reference/cli-command-specification.md)
- [Repository Anatomy and Package Matrix](../reference/repository-anatomy-and-package-matrix.md)
