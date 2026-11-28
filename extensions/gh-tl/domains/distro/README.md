# WSL2 Distribution Lifecycle Domain (`tl distro`)

Layer-3 CLI domain providing discovery, host inspection, and cryptographic verification for `tupynambalucas-dev` modern tar-based WSL2 distributions (`.wsl`).

---

## Subcommands

### 1. `tl distro list` (`gh tl distro list`)

Queries [`distributions/catalog/DistributionInfo.json`](../../../../distributions/catalog/DistributionInfo.json) (locally when inside the repository or remotely from GitHub `main`) and displays all available corporate WSL2 distributions alongside their local installation state.

```bash
tl distro list
tl distro list --catalog ./distributions/catalog/DistributionInfo.json
```

### 2. `tl distro status` (`gh tl distro status`)

Inspects the Windows host's `%UserProfile%\.wslconfig` (checking for `sparseVhd=true`) and lists all registered WSL distributions reported by `wsl.exe --list --verbose`.

```bash
tl distro status
```

### 3. `tl distro install [distro-name]` (`gh tl distro install`)

Installs `tupynambalucas-dev` or `tupynambalucas-dev-cluster` natively via `wsl.exe --install`, or from a local `.wsl` archive file with optional `0x<SHA256>` integrity verification.

```bash
# Install from registered catalog
tl distro install tupynambalucas-dev
tl distro install tupynambalucas-dev-cluster

# Install from local .wsl file with SHA-256 verification
tl distro install tupynambalucas-dev --from-file output/tupynambalucas-dev.wsl --sha256 0x...
```

---

## Navigation

- [gh-tl Extension Root (`../../README.md`)](../../README.md)
- [Onboarding Domain (`../onboard/README.md`)](../onboard/README.md)
- [Host Readiness Domain (`../host/README.md`)](../host/README.md)
- [WSL2 Distributions Subsystem (`../../../../distributions/README.md`)](../../../../distributions/README.md)
