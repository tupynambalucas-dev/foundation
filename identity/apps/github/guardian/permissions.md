# Permissões e Justificativa de Least-Privilege: tupynambalucas-guardian

## Matriz de Permissões (Tier 2B - Protection Plane)

| Permissão | Nível | Justificativa Técnica |
| :--- | :--- | :--- |
| `contents` | `read` | Inspeção somente-leitura da árvore de arquivos, commits e assinaturas criptográficas SSH/GPG. Impede mutação de código pelo auditor. |
| `pull_requests` | `write` | Submissão de revisões formais (`APPROVE`, `REQUEST_CHANGES`), comentários de diagnóstico de gates e aplicação de labels. |
| `issues` | `write` | Gerenciamento de labels de governança e comentários em issues e PRs vinculados. |
| `checks` | `read` | Leitura de check-runs e check-suites de CI/CD para validação do Gate 1 (Status Checks Green). |
| `statuses` | `read` | Leitura de commit statuses externos para verificação de integridade de pipelines. |
| `security_events` | `read` | Auditoria de alertas de Code Scanning e Secret Scanning no Gate 4 (Zero Security Alerts). |
| `vulnerability_alerts` | `read` | Leitura de alertas do Dependabot para bloqueio de PRs com vulnerabilidades críticas. |
| `metadata` | `read` | Permissão obrigatória padrão para instalação de GitHub Apps. |
