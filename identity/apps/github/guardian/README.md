# GitHub App: tupynambalucas-guardian (Tier 2B)

## Finalidade e Escopo Operacional

Este aplicativo opera no **Plano de Proteção, Auditoria e Governança** (*Protection, Policy & Approval Plane*). Atua como a identidade auditora independente (`tupynambalucas-guardian[bot]`) que avalia os 7 Precondition Gates de qualidade, conformidade de commits semânticos, assinaturas criptográficas SSH, alertas de segurança e confinamento de arquivos em Pull Requests antes de submeter revisões formais (`APPROVE` ou `REQUEST_CHANGES`).

Por operar com `contents: read` (sem permissão de escrita em código), garante conformidade estrita com o princípio de Separação de Deveres (*Separation of Duties* - SoD), permitindo aprovar Pull Requests abertos pelo `tupynambalucas-automation[bot]` ou por mantenedores humanos.

## Credenciais

- **App Slug**: `tupynambalucas-guardian`
- **Bot Handle**: `tupynambalucas-guardian[bot]`
- **Variáveis de Ambiente**: `GUARDIAN_APP_ID`, `GUARDIAN_APP_INSTALLATION_ID`, `GUARDIAN_APP_PRIVATE_KEY_BASE64`
