# Onboarding & Readiness Verification Domain (`tl onboard` / `tl verify`)

Layer-3 CLI domain housing automated developer workstation bootstrapping, cryptographic Ed25519 SSH key registration, conditional Git identity isolation, and 7-gate pre-flight readiness verification.

---

## Commands

### `tl onboard` (`gh tl onboard`)

Executes the end-to-end workstation setup workflow:
1. Validates Git version compatibility (`>= 2.36.0`).
2. Resolves developer identity from the authenticated GitHub profile or CLI flags.
3. Provisions an Ed25519 SSH signing keypair (`~/.ssh/github_tupynambalucas-dev_ed25519`).
4. Registers the public key with the GitHub REST API for both authentication (`user/keys`) and commit signing (`user/ssh_signing_keys`).
5. Writes isolated corporate Git identity to `~/.gitconfig-tupynambalucas-dev` and binds `includeIf.hasconfig:remote.*.url`.
6. Updates `~/.ssh/allowed_signers` for local signature verification.
7. Runs all 7 pre-flight readiness gates upon completion.

```bash
# Standard interactive onboarding
tl onboard

# Custom parameters
tl onboard --name "Lucas Tupynamba" --email "contato@tupynambalucas.dev" --org "tupynambalucas-dev"
```

#### Flags

| Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `--name` | `string` | *(GitHub Name / Login)* | Developer full name for Git commits |
| `--email` | `string` | `contato@tupynambalucas.dev` | Corporate email address |
| `--key-path` | `string` | `~/.ssh/github_tupynambalucas-dev_ed25519` | Target SSH private key path |
| `--org` | `string` | `tupynambalucas-dev` | Target GitHub organization name |
| `--skip-upload` | `bool` | `false` | Skip registering SSH keys via GitHub API |
| `--verify` | `bool` | `false` | Execute pre-flight readiness verification only |

---

### `tl verify` (`gh tl verify`)

Audits the workstation across the 7 compliance gates in strictly read-only mode without modifying local files or Git configuration.

```bash
tl verify
```

---

## 7 Pre-Flight Readiness Gates Specification

| Gate | Target | Requirement | Remediation |
| :--- | :--- | :--- | :--- |
| **Gate 1: Git Engine** | `git --version` | Version `>= 2.36.0` | Upgrade Git (`winget upgrade Git.Git` or `sudo apt install git`). |
| **Gate 2: Signing Key** | `~/.ssh/*.pub` | Ed25519 public key present | Run `tl onboard` to generate and register the keypair. |
| **Gate 3: Commit Signing** | Git config | `gpg.format=ssh` & `commit.gpgsign=true` | Run `git config --global gpg.format ssh && git config --global commit.gpgsign true`. |
| **Gate 4: Mani CLI** | `mani --version` | Mani orchestrator in `PATH` | Install Mani (`scoop install mani` or via `tupynambalucas-dev` WSL distro). |
| **Gate 5: Node & pnpm** | `node`, `pnpm` | Node.js `>= 22` and `pnpm` active | Enable Corepack (`corepack enable`). |
| **Gate 6: SSH Transport** | Git config | `url.git@github.com:.insteadOf = https://github.com/` | Run `git config --global url."git@github.com:".insteadOf https://github.com/`. |
| **Gate 7: GitHub Session** | `gh auth status` | Authenticated session for `github.com` | Run `gh auth login --git-protocol ssh --web`. |

---

## Navigation

- [gh-tl Extension Root (`../../README.md`)](../../README.md)
- [Distro Lifecycle Domain (`../distro/README.md`)](../distro/README.md)
- [Host Readiness Domain (`../host/README.md`)](../host/README.md)
- [Workstation Monorepo Root (`../../../../../../README.md`)](../../../../../../README.md)
