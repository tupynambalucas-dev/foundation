# CLI Command Specification (`tl` / `gh tl`)

Authoritative technical specification of commands, flags, arguments, exit codes, and operational behavior for the `tupynambalucas-dev` workstation CLI suite.

---

## 1. Invocation Syntax

The CLI binary is named `tl` and can be invoked either directly as a standalone executable or through the GitHub CLI extension router:

```bash
tl <command> [subcommand] [flags]
gh tl <command> [subcommand] [flags]
gh workstation <command> [subcommand] [flags]
```

---

## 2. Command Catalog Overview

| Command | Subcommands | Primary Responsibility | Elevated Token Required |
| :--- | :--- | :--- | :---: |
| `tl onboard` | - | Configures developer Git identity, SSH Ed25519 signing keys, and GitHub credentials. | No |
| `tl verify` | - | Non-destructive audit verifying all 7 developer identity and signing readiness gates. | No |
| `tl distro` | `list`, `status`, `install` | Discovers, inspects, and installs WSL2 custom distributions (`.wsl`). | Yes (if installing) |
| `tl host` | `prepare`, `verify` | Deploys `.wslconfig`, stages terminal wallpapers, and enrolls catalog in Windows Registry. | Yes |

---

## 3. Command Reference

### 3.1 `tl onboard`

Provisions developer identity, generates SSH signing keys, and configures Git.

#### Flags:
- `--user <name>`: Developer full name (required if `git config user.name` is unset).
- `--email <email>`: Developer email address (defaults to SSOT: `contato@tupynambalucas.dev`).
- `--org <slug>`: Organization slug (defaults to `tupynambalucas-dev`).
- `--verify`: Runs `tl verify` automatically upon completing setup.

#### Exit Codes:
- `0`: Setup completed successfully.
- `1`: Invalid arguments, SSH generation failure, or GitHub API authentication error.

---

### 3.2 `tl verify`

Executes a non-destructive audit of 7 developer environment readiness gates:
1. **Gate 1**: Git CLI installation and version (`>= 2.34.0`).
2. **Gate 2**: GitHub CLI installation and authentication status.
3. **Gate 3**: Developer identity configuration (`user.name`, `user.email`).
4. **Gate 4**: Ed25519 SSH keypair presence (`%UserProfile%\.ssh\id_ed25519`).
5. **Gate 5**: Commit signing configuration (`gpg.format = ssh`, `user.signingkey`).
6. **Gate 6**: Allowed signers file configuration (`gpg.ssh.allowedSignersFile`).
7. **Gate 7**: GitHub remote SSH signing key enrollment (`gh api user/ssh_signing_keys`).

#### Flags:
- `--strict`: Treats non-critical warnings as fatal errors.

#### Exit Codes:
- `0`: All readiness gates passed.
- `1`: One or more readiness gates failed.

---

### 3.3 `tl distro list`

Queries the registered or local ModernDistributions catalog and lists all available corporate distributions alongside their host installation state.

#### Flags:
- `--catalog <path-or-url>`: Overrides the catalog source (defaults to remote SSOT release catalog).

#### Exit Codes:
- `0`: Catalog fetched and printed successfully.
- `1`: Network or filesystem error reading catalog JSON.

---

### 3.4 `tl distro status`

Inspects local WSL subsystem state:
- Validates hypervisor configuration (`%UserProfile%\.wslconfig`) for `sparseVhd=true`.
- Invokes `wsl.exe --list --verbose` and parses UTF-16LE output.

#### Exit Codes:
- `0`: Status inspected successfully.
- `1`: WSL engine unresponsive or execution error.

---

### 3.5 `tl distro install [distro-name]`

Installs a WSL2 distribution from the registered catalog or from a local `.wsl` file.

#### Arguments:
- `distro-name`: Name of the target distribution (`tupynambalucas-dev` or `tupynambalucas-dev-cluster`).

#### Flags:
- `--from-file <path>`: Path to local `.wsl` archive file.
- `--sha256 <hash>`: Expected SHA-256 digest (`0x<hex>`). Verifies integrity before installation.

#### Automatic Behavior:
- Before executing installation, the command verifies that `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss\DistributionListUrlAppend` is enrolled. If absent, it automatically enrolls the canonical release catalog.

#### Exit Codes:
- `0`: Distribution installed successfully.
- `1`: Checksum mismatch, missing catalog, or `wsl.exe` installation error.

---

### 3.6 `tl host prepare`

Configures the Windows host environment for native WSL distribution delivery.

#### Execution Requirements:
- MUST be executed with Windows Administrator elevation (writes to `HKLM`).

#### Actions Performed:
1. Enrolls `DistributionListUrlAppend` in `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss`.
2. Deploys `%UserProfile%\.wslconfig` with non-destructive backup (`.wslconfig.bak`).
3. Stages `%LocalAppData%\Microsoft\Windows Terminal\Fragments\Microsoft.WSL\monygang.png`.

#### Exit Codes:
- `0`: Host prepared successfully.
- `1`: Elevation missing or file/registry write error.

---

### 3.7 `tl host verify`

Audits the 5 host readiness gates:
1. **Gate 1 [Admin Elevation]**: Verifies elevated token.
2. **Gate 2 [WSL Catalog]**: Validates registry key against canonical URL.
3. **Gate 3 [.wslconfig]**: Validates hypervisor configuration and `sparseVhd=true`.
4. **Gate 4 [Terminal Assets]**: Verifies presence of staged background image.
5. **Gate 5 [WSL Engine]**: Verifies responsiveness of `wsl.exe`.

#### Exit Codes:
- `0`: All gates passed.
- `1`: One or more gates failed.

---

## 4. Environment Variables

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `TL_ORG` | Overrides the canonical GitHub organization slug. | `tupynambalucas-dev` |
| `TL_CATALOG_URL` | Overrides the canonical WSL ModernDistributions catalog URL. | `https://github.com/tupynambalucas-dev/workstation/releases/latest/download/DistributionInfo.json` |
| `TL_DEVELOPER_EMAIL` | Overrides default corporate developer email. | `contato@tupynambalucas.dev` |

---

## Related References

- [Authoring and Extending the gh-tl CLI](../how-to-guides/authoring-and-extending-gh-tl-cli.md)
- [Distribution Catalog Schema](./distribution-catalog-schema.md)
