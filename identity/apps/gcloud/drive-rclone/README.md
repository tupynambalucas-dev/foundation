# Google Cloud App: Rclone Windows & WSL Desktop Client

## Visão Geral e Arquitetura Multi-Contas

Este aplicativo governa o OAuth 2.0 Client ID utilizado pelo **Rclone** e **WinFsp** para montagem e backup de contas do Google Drive:
- Suporta simultaneamente contas pessoais (`@gmail.com`) e contas corporativas (`@tupynambalucas.dev`).
- Utiliza um único par de `client_id` e `client_secret` em múltiplos remotes no `rclone.conf`.
- Com a publicação em **Produção** e verificação de marca aprovada no Google Search Console sob `tupynambalucas.dev`, os refresh tokens tornam-se permanentes (sem expiração semanal de 7 dias).

## Mapeamento de Letras no Windows

- `H:` -> `drive-personal:` (Google Drive Pessoal)
- `E:` -> `drive-org:` (Google Drive Corporativo)
- `L:` -> `drive-media:` (Mídias e Arquivos Volumosos)
- `R:` -> `drive-backup:` (Espelhamento e Backups)
- `G:` -> Cache local ultrarrápido em SSD (`G:\rclone-cache`).

## Comandos Úteis de Backup

```powershell
# Transferência direta nuvem-para-nuvem sem consumo de banda local:
rclone sync drive-personal:Projetos drive-backup:Backups/Projetos --drive-server-side-across-configs --fast-list -v

# Backup incremental com pasta datada de retenção de arquivos alterados:
$data = Get-Date -Format "yyyy-MM-dd"
rclone sync "C:\Users\tupyn\projects" "drive-backup:WorkstationBackup/Current" --backup-dir "drive-backup:WorkstationBackup/Archive/$data" --fast-list
```
