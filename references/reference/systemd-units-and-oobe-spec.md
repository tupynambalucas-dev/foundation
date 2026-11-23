# Systemd Units and OOBE Specification

Technical specification of systemd unit masking, filesystem hygiene invariants, and Out-Of-Box Experience (OOBE) provisioning scripts for `tupynambalucas-dev` WSL2 distributions.

---

## 1. Systemd Unit Masking Rationale

WSL2 manages networking, hostname resolution, device nodes, and virtual mounts via host hypervisor virtualization drivers (`/init` and Plan 9 / VirtIO-FS file sharing). When standard Linux init managers (systemd) run concurrently, standard daemon services conflict with hypervisor drivers, resulting in high CPU usage, broken DNS resolution, or hanging boots.

The script `distributions/shared/systemd-mask.sh` masks these conflicting units by symlinking them to `/dev/null` in `/etc/systemd/system/` and `/etc/systemd/user/`:

### Masked Unit Catalog

| Unit Name | Why It Must Be Masked in WSL2 |
| :--- | :--- |
| `systemd-resolved.service` | WSL automatically manages `/etc/resolv.conf` pointing to the host Hyper-V internal DNS bridge. Running `systemd-resolved` overwrites this file with `127.0.0.53`, breaking DNS on corporate VPNs. |
| `systemd-networkd.service` | Network interfaces (`eth0`) are bridged by WSL's hypervisor. Daemon network configuration triggers IP conflicts. |
| `NetworkManager.service` | NetworkManager attempts to manage hypervisor interfaces, causing high boot latency and routing table corruption. |
| `systemd-tmpfiles-setup.service` | Attempts to chown/chmod virtual mountpoints created by WSL init, causing transient boot failures. |
| `systemd-tmpfiles-clean.service` | Redundant with WSL host-side memory and file cleanup. |
| `systemd-tmpfiles-clean.timer` | Timer trigger for tmpfiles cleanup. |
| `systemd-tmpfiles-setup-dev-early.service` | Conflicts with WSL devtmpfs initialization. |
| `systemd-tmpfiles-setup-dev.service` | Conflicts with WSL devtmpfs initialization. |
| `tmp.mount` | `/tmp` is managed by WSL virtual filesystem mounts. |
| `ssh.service` | Background SSH daemon is not required inside client workstations; developers connect outbound via host SSH agent. |

---

## 2. Rootfs Hygiene Invariants

Prior to exporting the final `.wsl` tarball, `systemd-mask.sh` executes filesystem hygiene invariants:

```bash
# Remove static resolv.conf so WSL generates dynamic DNS pointers at boot
rm -f /etc/resolv.conf

# Purge cache directories to minimize tarball size
# shellcheck disable=SC2115
rm -rf /boot/* /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

---

## 3. Out-Of-Box Experience (OOBE) Lifecycle

The OOBE script executes on the first boot of a newly registered distribution:
- Base Workstation: `distributions/base/etc/oobe.sh`
- Cluster Workstation: `distributions/cluster/etc/oobe.sh`
- Shared Logic: `distributions/shared/oobe-common.sh`

### Provisioning Steps (`provision_developer_account`):
1. **Developer Account Creation**:
   - Creates user `tupy` with UID `1000` and GID `1000`.
   - Assigns default shell `/bin/zsh`.
   - Adds user to groups: `adm`, `cdrom`, `sudo`, `dip`, `plugdev`, `docker`.
   - Configures `/etc/sudoers.d/tupy` with `NOPASSWD:ALL` (permissions `0440`).
2. **Directory Scaffolding**:
   - Creates `/home/tupy/.ssh` (permissions `0700`).
   - Creates corporate workspace directory: `/home/tupy/projects/org`.
3. **Windows Host Asset Synchronization**:
   - Locates Windows user profile via `/mnt/c/Windows/System32/cmd.exe /c "echo %USERPROFILE%"`.
   - Copies SSH keys matching `*ed25519*`, `config`, `known_hosts*`, and `allowed_signers` from `%UserProfile%\.ssh` into `/home/tupy/.ssh/`.
   - Sets strict permissions: private keys `0600`, public keys and config `0644`.
4. **Git Identity Synchronization**:
   - Copies `%UserProfile%\.gitconfig` and `%UserProfile%\.gitconfig-tupynambalucas-dev`.
   - Normalizes Windows path separators (`C:/Users/...`) into Linux paths (`/home/tupy/...`).
5. **Ownership Realignment**:
   - Recursively assigns ownership of `/home/tupy` to `tupy:tupy`.

---

## Related References

- [Distribution-as-Code and OCI Mechanics](../explanation/distribution-as-code-and-oci-mechanics.md)
- [Building and Testing Custom WSL2 Distros](../tutorials/building-and-testing-custom-distros.md)
