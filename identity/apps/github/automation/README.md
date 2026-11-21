# GitHub App: tupynambalucas-automation (Tier 2A)

## Finalidade e Escopo Operacional

Este aplicativo opera no **Plano de Execução e Entrega de CI/CD** (*Execution & Delivery Plane*). É a identidade máquina produtora (`tupynambalucas-automation[bot]`) utilizada por pipelines do GitHub Actions, Release Please, git-cliff, builds automatizados de pacotes e pelo daemon Token Broker para emissão de credenciais temporárias de escrita de código e criação de Pull Requests de release.

## Credenciais

- **App ID**: `5650100`
- **Installation ID**: `179570999`
- **Chave Privada**: Gerenciada via Infisical (`AUTOMATION_APP_PRIVATE_KEY_BASE64`) e utilizada pelo Token Broker para emissão de tokens de 1 hora escopados estritamente ao repositório solicitante.
