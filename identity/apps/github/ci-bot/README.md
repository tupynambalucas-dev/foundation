# GitHub App: tupynambalucas-ci-bot (Tier 2)

## Finalidade e Escopo Operacional

Este aplicativo opera no **Plano de Automação de CI/CD** (*Automation Plane*). É a identidade utilizada por pipelines do GitHub Actions, Release Please, builds automatizados de pacotes e pelo daemon Token Broker para emissão de credenciais temporárias de escrita de código.

## Credenciais

- **App ID**: `5650100`
- **Installation ID**: `179570999`
- **Chave Privada**: Utilizada como base para o Token Broker. O Token Broker recebe requisições de agentes ou workflows e emite tokens de 1 hora escopados estritamente ao repositório solicitante.
