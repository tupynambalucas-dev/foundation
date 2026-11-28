# Universal Workstation Documentation Hub (`references/`)

Authoritative technical documentation for the `tupynambalucas-dev/workstation` sovereign developer workstation monorepo, organized according to the **Diátaxis Framework**.

---

## 1. Documentation Quadrants

The documentation is partitioned into four distinct quadrants, each serving a specific developer and AI agent interaction mode:

```text
references/
├── tutorials/       # Learning-oriented: step-by-step guidance for beginners
├── how-to-guides/   # Problem-oriented: task-focused recipes for specific operational goals
├── reference/       # Information-oriented: technical descriptions, schemas, APIs, configurations
└── explanation/     # Understanding-oriented: architectural rationale, background context & mechanics
```

---

## 2. Master Navigation Index

### 2.1 Tutorials (Learning-Oriented)

Practical lessons to onboard new engineers and AI agents by building from scratch:

- [Getting Started with Workstation](./tutorials/getting-started-with-workstation.md): Complete day-0 developer onboarding tutorial from zero to working workstation, using `gh extension install`, `gh tl onboard`, `gh tl host prepare`, and native WSL distribution streaming.
- [Building and Testing Custom WSL2 Distros](./tutorials/building-and-testing-custom-distros.md): Step-by-step tutorial on building the Debian/Ubuntu WSL2 distributions locally with Docker Buildx and testing tar rootfs exports.

### 2.2 How-To Guides (Problem-Oriented)

Task-focused runbooks and recipes to accomplish specific operational goals:

- [Enrolling the WSL Distribution Catalog](./how-to-guides/enrolling-wsl-distribution-catalog.md): How to inspect, register, or manually troubleshoot `DistributionListUrlAppend` in Windows Registry (`HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss`).
- [Provisioning a Kubernetes Cluster in WSL2](./how-to-guides/provisioning-kubernetes-cluster-in-wsl.md): How to provision and verify the k3s cluster distro (`tupynambalucas-dev-cluster`) with sysctl flags and kubeconfig permission isolation.
- [Authoring and Extending the gh-tl CLI](./how-to-guides/authoring-and-extending-gh-tl-cli.md): How to create a new CLI domain slice in `tools/github/extensions/gh-tl/domains/` with dependency injection and unit tests.
- [Managing Hypervisor Resources with .wslconfig](./how-to-guides/managing-hypervisor-with-wslconfig.md): How to configure memory, processors, swap, and sparse VHD in `%UserProfile%\.wslconfig`.

### 2.3 Technical Reference (Information-Oriented)

Declarative specifications, catalogs, schemas, and matrices:

- [CLI Command Specification](./reference/cli-command-specification.md): Authoritative command reference for `tl` / `gh tl` (`tl onboard`, `tl verify`, `tl distro list|status|install`, `tl host prepare|verify`), flags, environment variables, and exit codes.
- [Distribution Catalog Schema](./reference/distribution-catalog-schema.md): Technical specification of `DistributionInfo.json`, modern WSL tar manifests, SHA-256 formatting, and Windows Terminal profiles.
- [Repository Anatomy and Package Matrix](./reference/repository-anatomy-and-package-matrix.md): Technical breakdown of monorepo workspaces, dependencies, strict pnpm catalogs, and Turborepo pipelines.
- [Systemd Units and OOBE Specification](./reference/systemd-units-and-oobe-spec.md): Detailed specification of systemd masks, rootfs hygiene invariants, OOBE account provisioning, and developer environment synchronization.

### 2.4 Architecture Explanation (Understanding-Oriented)

Deep architectural context, design tradeoffs, and system mechanics:

- [Workstation Architecture and DDD Topology](./explanation/workstation-architecture-and-ddd-topology.md): Why workstation is structured as a domain-driven monorepo with clean root, pnpm workspaces, and encapsulated Go toolchains.
- [Modern WSL Catalog vs Legacy Distros](./explanation/modern-wsl-catalog-vs-legacy-distros.md): Architectural comparison between ModernDistributions URL append mechanism vs legacy appx packages, MSIX, and manual tar imports.
- [Host Readiness and PowerShell Deprecation](./explanation/host-readiness-and-powershell-deprecation.md): Rationale for transitioning from Windows PowerShell (`install.ps1`) to native cross-platform Go with Win32 API.
- [Distribution-as-Code and OCI Mechanics](./explanation/distribution-as-code-and-oci-mechanics.md): Rationale for using multi-stage Dockerfiles as distribution build recipes and exporting pristine tar rootfs.

---

## 3. Governance & Documentation Standards

- All documents strictly adhere to GitHub Flavored Markdown (GFM) and the Zero-Emoji Invariant.
- All intra-repository links must be relative and resolve to valid files on disk. Absolute `file:///` links are strictly forbidden.
- Technical documentation is authored strictly in en-US.
- Historical execution plans and audit reports are archived under [../.agents/plans/](../.agents/plans/completed/distro-distribution-and-cli-architecture/README.md).
