# Getting Started with Workstation

A comprehensive, step-by-step tutorial guiding a developer through their Day-0 setup of the `tupynambalucas-dev` workstation ecosystem on a Windows machine.

---

## Overview

By the end of this tutorial, you will have:
1. Installed the `tl` CLI tool via GitHub CLI extension.
2. Initialized your corporate identity, SSH signing keys, and Git configuration.
3. Prepared your Windows host hypervisor (`.wslconfig`, Windows Terminal profiles, and catalog registry).
4. Verified that all readiness gates pass.
5. Streamed and booted the corporate `tupynambalucas-dev` WSL2 distribution with zero manual Docker configuration.

---

## Prerequisites

Before beginning, ensure your host machine satisfies these initial requirements:
- **Windows 11 (Build 22621+)** or **Windows 10 (Build 19045+)** with WSL2 enabled.
- **Git** installed on the Windows host (`git --version` >= 2.34.0).
- **GitHub CLI (`gh`)** installed and authenticated (`gh auth login`).
- Administrative privileges for Windows Registry catalog registration.

---

## Step 1: Install the Workstation CLI Extension

The workstation toolchain is delivered as an official GitHub CLI extension (`gh-tl`). Run the following command from PowerShell or Windows Terminal:

```bash
gh extension install tupynambalucas-dev/workstation
```

Verify that the extension is properly registered:

```bash
gh extension list
```

You should see `tupynambalucas-dev/workstation` mapped to the binary alias `tl`. You can now run `gh tl` or invoke the compiled standalone `tl` binary.

---

## Step 2: Provision Developer Identity (`gh tl onboard`)

Run the onboarding command to generate your cryptographic Ed25519 SSH signing key and configure your corporate Git identity:

```bash
gh tl onboard --user "Your Full Name" --email "contato@tupynambalucas.dev"
```

### What Happens Automatically:
1. **SSH Keypair Generation**: An Ed25519 keypair is generated at `%UserProfile%\.ssh\id_ed25519` (if not already present).
2. **GitHub Key Enrollment**: Your public key is registered with your GitHub account for both SSH authentication and commit signing.
3. **Allowed Signers Configuration**: `%UserProfile%\.ssh\allowed_signers` is populated to verify signed commits locally.
4. **Conditional Git Configuration**: An `includeIf` block is inserted into `%UserProfile%\.gitconfig`, isolating corporate commits inside `projects/org/` without affecting personal projects.

---

## Step 3: Prepare the Windows Host (`gh tl host prepare`)

To allow WSL to discover and stream corporate distributions natively, open an **Elevated PowerShell (Run as Administrator)** session and execute:

```bash
gh tl host prepare
```

### What Happens Automatically:
1. **Registry ModernDistributions Catalog Enrollment**:
   Adds `DistributionListUrlAppend` under `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss` pointing to the canonical corporate catalog URL:
   `https://github.com/tupynambalucas-dev/workstation/releases/latest/download/DistributionInfo.json`.
2. **Hypervisor Configuration Deployment**:
   Deploys `%UserProfile%\.wslconfig` with resource bounds (12GB RAM, 6 CPU cores, and `sparseVhd=true` for automatic disk compaction). If an existing `.wslconfig` is found, a backup is created (`.wslconfig.bak`).
3. **Windows Terminal Fragment Staging**:
   Copies the corporate background wallpaper (`monygang.png`) into `%LocalAppData%\Microsoft\Windows Terminal\Fragments\Microsoft.WSL\`.

---

## Step 4: Verify Host Readiness Gates (`gh tl host verify`)

After running `gh tl host prepare`, verify that all 5 host readiness gates pass:

```bash
gh tl host verify
```

Expected output:

```text
==========================================================
tupynambalucas-dev Windows Host Readiness Audit
==========================================================

 PASS Gate 1 [Admin Elevation]: Current process possesses elevated Administrator token
 PASS Gate 2 [WSL Catalog]: Canonical registry catalog URL registered
 PASS Gate 3 [.wslconfig]: Hypervisor configuration present with sparseVhd=true
 PASS Gate 4 [Terminal Assets]: Terminal wallpaper staged
 PASS Gate 5 [WSL Engine]: wsl.exe responsive

 PASS All critical host readiness gates PASSED. Host is ready for 'gh tl distro install'.
```

Next, verify your developer identity gates:

```bash
gh tl verify
```

---

## Step 5: Discover Available Distributions

Query the registered catalog to inspect available corporate WSL2 distributions:

```bash
gh tl distro list
```

Alternatively, run the native WSL command:

```bash
wsl.exe --list --online
```

You will see `tupynambalucas-dev` and `tupynambalucas-dev-cluster` in the list of available distributions alongside Microsoft standard distributions.

---

## Step 6: Install the Corporate Distribution

To install the primary Ubuntu 26.04 developer workstation distribution, run:

```bash
gh tl distro install tupynambalucas-dev
```

Alternatively, invoke native WSL:

```bash
wsl.exe --install -d tupynambalucas-dev
```

### What Happens Under the Hood:
1. `wsl.exe` fetches `DistributionInfo.json` from the enrolled GitHub Release URL.
2. The `tupynambalucas-dev.wsl` rootfs archive is streamed directly from GitHub Releases with live download progress.
3. WSL unpacks the tarball directly into a managed virtual hard disk (`ext4.vhdx`).
4. On first launch, the Out-Of-Box Experience (`/usr/lib/wsl/oobe-common.sh`) script executes automatically:
   - Provisions developer account `tupy` (UID/GID 1000).
   - Configures passwordless `sudo`.
   - Synchronizes SSH keys (`~/.ssh/`) and Git configuration (`~/.gitconfig`) from your Windows host.

---

## Step 7: Launch and Verify the In-Distro Environment

Launch your newly installed distribution:

```bash
wsl.exe -d tupynambalucas-dev
```

Inside the Linux shell, verify your identity:

```bash
whoami
# Output: tupy

git config --get user.name
# Output: Your Full Name

git config --get user.signingkey
# Output: ssh-ed25519 ...
```

Congratulations! Your workstation is fully operational, adhering to zero-Docker distribution delivery and enterprise cryptographic standards.

---

## Next Steps

- Explore the [CLI Command Specification](../reference/cli-command-specification.md) for full parameter references.
- Learn how to deploy a local Kubernetes cluster using the [Provisioning Kubernetes Cluster Guide](../how-to-guides/provisioning-kubernetes-cluster-in-wsl.md).
