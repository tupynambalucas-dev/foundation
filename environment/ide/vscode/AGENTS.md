<context-hierarchy>
  <parent src="../AGENTS.md" type="subdomain-rules" />
  <parent src="../../AGENTS.md" type="bounded-context-rules" />
  <system-instruction>
    AGENT: You are operating within the VS Code Domain Slice (foundation/environment/ide/vscode). Manage profiles, keybindings, and extension compatibility matrices.
  </system-instruction>
</context-hierarchy>

# VS Code Domain Slice Agent Context Router

Manages enterprise Visual Studio Code configurations, official profiles, keybindings, and extension matrices.

## Sub-path Layout

- **`shared/`**: Common VS Code templates (`settings.template.json`, `extensions.template.json`).
- **`profiles/`**: Exportable JSON profile definitions (`frontend.code-profile`, `backend.code-profile`).
- **`matrix/`**: Extension compatibility matrix across operating systems.
- **`keybindings/`**: Cross-platform shortcut schemes (`win32.json`, `darwin.json`, `linux.json`).
