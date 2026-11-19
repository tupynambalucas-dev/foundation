# Host Readiness and PowerShell Deprecation

Architectural rationale for transitioning Windows host governance from legacy PowerShell scripts (`install.ps1`) to native, cross-platform Go commands within `gh tl`.

---

## 1. Context & Background

The initial workstation setup relied on a Windows PowerShell script (`virtualization/scripts/install.ps1`) to:
1. Verify Windows build versions.
2. Edit the Windows Registry (`HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss`).
3. Deploy `%UserProfile%\.wslconfig`.
4. Copy terminal background assets to `%LocalAppData%\Microsoft\Windows Terminal\Fragments\`.

While functional, reliance on standalone PowerShell scripts introduced multiple friction points across developer environments.

---

## 2. Friction Points of PowerShell Automation

### 1. Windows Execution Policy Blocks
Default Windows client configurations restrict running unsigned `.ps1` scripts (`Restricted` or `RemoteSigned` execution policies). Developers routinely encountered:

```text
File install.ps1 cannot be loaded because running scripts is disabled on this system.
```

Instructing developers to run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` creates security friction and fails corporate endpoint compliance checks.

### 2. Platform Fragility
PowerShell syntax, module dependencies (`Microsoft.PowerShell.Archive`), and encoding behaviors vary significantly between Windows PowerShell 5.1 (bundled with Windows) and PowerShell Core 7+.

### 3. Disconnected User Experience
Developers had to run PowerShell scripts for host preparation, then switch to the GitHub CLI extension (`gh-tl`) for identity onboarding, creating a fragmented setup journey.

---

## 3. The Go-Powered Host Governance Architecture

In the unified architecture, all host governance operations were rewritten in native Go inside `tools/github/extensions/gh-tl/domains/host/`:

```text
gh tl host prepare   # Automatically configures Registry, .wslconfig, and Terminal assets
gh tl host verify    # Non-destructively audits all 5 host readiness gates
```

### Technical Implementation:

1. **Native Win32 Registry API**:
   Instead of launching `reg.exe` or PowerShell commands, the Go CLI imports `golang.org/x/sys/windows/registry`, opening `registry.LOCAL_MACHINE.OpenKey` and setting `SetStringValue("DistributionListUrlAppend", ...)` directly through Windows kernel system calls.
2. **Cross-Platform Compilation**:
   By using build tags (`//go:build windows` vs `//go:build !windows`), `gh-tl` compiles cleanly on Linux, macOS, and Windows. On non-Windows hosts, `host prepare` gracefully outputs clear platform guidance.
3. **Transparent Auto-Enrollment in `distro install`**:
   When a developer runs `gh tl distro install`, the command inspects the registry key prior to running `wsl.exe`. If the catalog URL is missing, it automatically enrolls the release catalog without requiring a separate manual step.

---

## 4. Deprecation Status of `install.ps1`

`virtualization/scripts/install.ps1` is officially deprecated. The script now outputs an enterprise deprecation alert redirecting developers to:

```bash
gh tl host prepare
```

The script remains in the repository solely for backward compatibility with automated provisioning tools.

---

## Related References

- [CLI Command Specification](../reference/cli-command-specification.md)
- [Managing Hypervisor Resources with .wslconfig](../how-to-guides/managing-hypervisor-with-wslconfig.md)
