# Google Cloud App: Workspace Automation Services

## Visão Geral

Este aplicativo governa as integrações automatizadas com o **Google Workspace** (Google Sheets, Google Docs e Google Drive) consumidas pelos plugins e agentes do `agent-mesh`:
- `gwork-sheets-architect`: Síntese de tabelas relacionais em 1NF com cabeçalhos congelados para o Google AppSheet.
- `gwork-docs-architect`: Publicação de relatórios executivos formatados a partir de Markdown.
- `gwork-drive-operator`: Gestão de pastas de equipes e arquivos compartilhados.

## Credenciais

As chaves JSON da conta de serviço (`GOOGLE_SERVICE_ACCOUNT_JSON`) residem estritamente no cofre Infisical sob a identidade de máquina corporativa, sem gravação em arquivos de código ou commits versionados.
