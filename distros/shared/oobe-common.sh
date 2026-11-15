#!/usr/bin/env bash
set -euo pipefail

provision_developer_account() {
  local dev_user="${1:-tupy}"
  local dev_uid="${2:-1000}"
  local dev_gid="${3:-1000}"

  if ! getent passwd "$dev_uid" >/dev/null 2>&1; then
    groupadd -g "$dev_gid" "$dev_user" 2>/dev/null || true
    useradd -u "$dev_uid" -g "$dev_gid" -m -s /bin/zsh -G adm,cdrom,sudo,dip,plugdev,docker "$dev_user"
    echo "${dev_user} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${dev_user}"
    chmod 0440 "/etc/sudoers.d/${dev_user}"
  fi

  local win_profile
  win_profile=$(/mnt/c/Windows/System32/cmd.exe /c "echo %USERPROFILE%" 2>/dev/null | tr -d '\r' | sed 's/\\/\//g' | sed 's/^C:/\/mnt\/c/' || true)

  local dev_home="/home/${dev_user}"
  mkdir -p "${dev_home}/.ssh" "${dev_home}/projects/organizations/tupynambalucas-dev"
  chmod 0700 "${dev_home}/.ssh"

  # Stage shared Windows Terminal background image into $FRAGMENT_ROOT for portable relative lookup
  if [ -n "$win_profile" ] && [ -f "/usr/lib/wsl/monygang.png" ]; then
    local wt_fragment_dir="${win_profile}/AppData/Local/Microsoft/Windows Terminal/Fragments/Microsoft.WSL"
    mkdir -p "$wt_fragment_dir" 2>/dev/null || true
    cp -f "/usr/lib/wsl/monygang.png" "${wt_fragment_dir}/monygang.png" 2>/dev/null || true
  fi

  if [ -n "$win_profile" ] && [ -d "${win_profile}/.ssh" ]; then
    find "${win_profile}/.ssh" -maxdepth 1 -type f \( -name "*ed25519*" -o -name "config" -o -name "known_hosts*" -o -name "allowed_signers" \) -exec cp {} "${dev_home}/.ssh/" \;
    chmod 0600 "${dev_home}/.ssh/"* 2>/dev/null || true
    chmod 0644 "${dev_home}/.ssh/"*.pub "${dev_home}/.ssh/config" "${dev_home}/.ssh/known_hosts" "${dev_home}/.ssh/allowed_signers" 2>/dev/null || true
  fi

  if [ -n "$win_profile" ] && [ -f "${win_profile}/.gitconfig" ]; then
    cp "${win_profile}/.gitconfig" "${dev_home}/.gitconfig"
    sed -i "s|C:/Users/[^/]*/|/home/${dev_user}/|g" "${dev_home}/.gitconfig" || true
  fi

  if [ -n "$win_profile" ] && [ -f "${win_profile}/.gitconfig-tupynambalucas-dev" ]; then
    cp "${win_profile}/.gitconfig-tupynambalucas-dev" "${dev_home}/.gitconfig-tupynambalucas-dev"
    sed -i "s|C:/Users/[^/]*/|/home/${dev_user}/|g" "${dev_home}/.gitconfig-tupynambalucas-dev" || true
  fi

  chown -R "${dev_user}:${dev_user}" "${dev_home}"
}
