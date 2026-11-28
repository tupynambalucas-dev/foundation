<context-hierarchy>
  <parent src="../../AGENTS.md" type="global-rules" />
  <parent src="../AGENTS.md" type="bounded-context-rules" />
  <system-instruction>
    AGENT: You are operating in the Go Token Broker package (foundation/identity/broker). If you have not read "../../AGENTS.md" and "../AGENTS.md" in this session, read them first before proceeding.
  </system-instruction>
</context-hierarchy>

# Go Token Broker Agent Context Router (`foundation/identity/broker`)

This document serves as the Layer-3 context router for the Go Security Token Service (`foundation/identity/broker/`), which mints ephemeral, down-scoped 60-minute GitHub App Installation Access Tokens for CI/CD runners and local Agent Mesh MCP servers.

## Architectural Boundaries & Ubiquitous Language

- **Standalone Go Module**: Encapsulated `go.mod` / `go.sum` inside `identity/broker/` (Clean Root invariant).
- **Policy-as-Code (`config/policies.yaml`)**: Maps caller subjects (`agent:mcp-github-governance`, `agent:mcp-github-delivery`, `agent:mcp-github-guardian`, GitHub OIDC workflows) to exact tiers, repositories, and permission scopes.
- **No-Privilege-Escalation**: Requests for `org-manager`, `automation`, or `guardian` are strictly isolated and NEVER fall back across privilege tiers.
- **Caching**: In-memory `sync.RWMutex` token cache with 55-minute TTL (tokens expire at 60 minutes).

## Operational & Security Guardrails

- **CodeQL `go/clear-text-logging`**: NEVER log raw `Authorization` headers, OIDC tokens, raw caller-supplied subjects, or RSA keys. Log strictly server-side resolved `policy.Subject`, target `tier`, and repository count (`[AUDIT-ISSUED]`).
- **Constant-Time Auth**: Local callers authenticate via constant-time `TOKEN_BROKER_API_KEY` + `X-Caller-ID`; CI callers authenticate via RS256 OIDC JWT verified against GitHub's live JWKS.
- **Local Bind**: Always bind local developer instances strictly to `127.0.0.1` (`scripts/start-broker.sh`).

## Required Skills

- **Identity Plugin (`@tupynambalucas-dev/plugin-identity`)**: `token-broker-operator`.
- **Secrets Plugin (`@tupynambalucas-dev/plugin-secrets`)**: `infisical-vault-operator`.
