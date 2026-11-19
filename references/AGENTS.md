<context-hierarchy>
  <parent-context path="../AGENTS.md" description="Layer 1: Workstation Monorepo Root Agent Context Router" />
  <system-instruction>
    AGENT: You are operating in the references bounded context of workstation. If you have not read "../AGENTS.md" in this session, read it first before proceeding.
  </system-instruction>
</context-hierarchy>

# Documentation Subsystem Agent Context (`references/`)

This document serves as the sovereign Layer-2 bounded context router for technical documentation in `workstation/references/`, structured according to the **Diátaxis Framework**.

## Navigation by Quadrant

- [README.md](./README.md): Master documentation hub and comprehensive quadrant index.
- **Tutorials (`tutorials/`)**: Learning-oriented step-by-step guides ([Getting Started](./tutorials/getting-started-with-workstation.md), [Building Custom Distros](./tutorials/building-and-testing-custom-distros.md)).
- **How-To Guides (`how-to-guides/`)**: Problem-oriented recipes ([Enrolling WSL Catalog](./how-to-guides/enrolling-wsl-distribution-catalog.md), [Provisioning Kubernetes Cluster](./how-to-guides/provisioning-kubernetes-cluster-in-wsl.md), [Authoring gh-tl CLI Domains](./how-to-guides/authoring-and-extending-gh-tl-cli.md), [Managing Hypervisor Resources](./how-to-guides/managing-hypervisor-with-wslconfig.md)).
- **Technical Reference (`reference/`)**: Information-oriented specifications ([CLI Command Specification](./reference/cli-command-specification.md), [Distribution Catalog Schema](./reference/distribution-catalog-schema.md), [Repository Anatomy & Package Matrix](./reference/repository-anatomy-and-package-matrix.md), [Systemd Units & OOBE Spec](./reference/systemd-units-and-oobe-spec.md)).
- **Architecture Explanation (`explanation/`)**: Understanding-oriented design principles ([Workstation DDD Topology](./explanation/workstation-architecture-and-ddd-topology.md), [Modern WSL Catalog Mechanics](./explanation/modern-wsl-catalog-vs-legacy-distros.md), [Host Readiness & PowerShell Deprecation](./explanation/host-readiness-and-powershell-deprecation.md), [Distribution-as-Code & OCI](./explanation/distribution-as-code-and-oci-mechanics.md)).

## Scoped Guardrails

1. **Strict Diátaxis Separation**: Authors MUST respect quadrant boundaries:
   - `tutorials/`: Learning-oriented, chronological narrative for beginners.
   - `how-to-guides/`: Problem-oriented, actionable runbooks for specific goals.
   - `reference/`: Information-oriented, deterministic specifications, schemas, tables.
   - `explanation/`: Understanding-oriented, architectural reasoning, tradeoffs, comparisons.
2. **Layer 4+ Context Proliferation Prohibition**: Pure documentation subdirectories (`tutorials/`, `how-to-guides/`, `reference/`, `explanation/`) MUST NOT declare child `AGENTS.md` context routers. The parent router (`references/AGENTS.md`) governs all four quadrants.
3. **Zero-Emoji Invariant**: Strictly forbidden across all document titles, callouts, tables, and body text.
4. **Link Integrity**: All links must be relative (`./` or `../`) and point to existing files on disk. Never emit absolute `file:///` filesystem paths.
5. **Language Policy**: Technical documentation must be authored strictly in en-US.
6. **Artifact Isolation**: AI-generated architectural plans, reviews, and execution logs must reside in `../.agents/plans/`, never in `references/`.
