# Managing Hypervisor Resources with .wslconfig

Operational runbook for fine-tuning WSL2 hypervisor limits, automatic VHDX compaction, and memory constraints using `%UserProfile%\.wslconfig`.

---

## The Problem

Out of the box, WSL2 allocates up to 50% of the host machine's total RAM and expands virtual disks (`ext4.vhdx`) dynamically without ever shrinking them. This can lead to:
1. Windows host memory starvation when compiling large monorepos or running container pods.
2. Unbounded growth of VHDX files occupying hundreds of gigabytes even after deleting containers or packages.

---

## The Solution: Global .wslconfig

WSL2 supports global hypervisor tuning via a configuration file located at:

```text
%UserProfile%\.wslconfig
```

The enterprise baseline template is maintained at:

```text
virtualization/config/.wslconfig.example
```

---

## Recommended Enterprise Configuration

```ini
[wsl2]
# Maximum memory allocated to the WSL2 virtual machine
memory=12GB

# Number of logical processors assigned to the hypervisor
processors=6

# Allocate swap memory on the host drive
swap=4GB

# Enable sparse VHD support for automatic disk space reclamation
sparseVhd=true

# Disable automatic localhost forwarding if conflicting with VPNs
localhostForwarding=true

# GUI applications integration via WSLg
guiApplications=true

[experimental]
# Automatically release cached memory back to Windows
autoMemoryReclaim=gradual

# Networking mode (mirrored enables seamless VPN and IPv6 integration)
networkingMode=mirrored
dnsTunneling=true
firewall=true
```

---

## Step 1: Deploy Automatically via gh-tl

Running `gh tl host prepare` automatically inspects `%UserProfile%\.wslconfig`. If absent, it deploys the enterprise configuration. If an existing configuration is found, it creates a non-destructive backup (`.wslconfig.bak`) before updating:

```bash
gh tl host prepare
```

---

## Step 2: Enable Sparse VHD on Existing Distributions

When `sparseVhd=true` is declared, newly installed distributions automatically create sparse virtual disks. However, pre-existing distributions require setting the sparse flag once:

```powershell
# Check current distribution status
wsl.exe --list --verbose

# Enable sparse VHD on installed distributions
wsl.exe --manage tupynambalucas-dev --set-sparse true
wsl.exe --manage tupynambalucas-dev-cluster --set-sparse true
```

Once sparse VHD is active, deleting large files inside the Linux distribution automatically shrinks the underlying `ext4.vhdx` file on the Windows NTFS drive.

---

## Step 3: Apply Changes & Restart Hypervisor

After saving changes to `.wslconfig`, you must restart the WSL subsystem for changes to take effect:

```powershell
# Shutdown all running instances and hypervisor
wsl.exe --shutdown

# Wait 5 seconds, then launch your distro
wsl.exe -d tupynambalucas-dev
```

Inside the Linux environment, verify the memory bounds:

```bash
free -h
# Expected: Total memory approximately matches memory=12GB in .wslconfig
```

---

## Troubleshooting

### WSL Fails to Start After Editing .wslconfig

- **Cause**: Syntax error or allocating more RAM than physically exists on the host.
- **Fix**: Open `%UserProfile%\.wslconfig` and lower the `memory` value below your host's physical RAM, or restore `.wslconfig.bak`.

---

## Related References

- [Host Readiness and PowerShell Deprecation](../explanation/host-readiness-and-powershell-deprecation.md)
- [CLI Command Specification](../reference/cli-command-specification.md)
