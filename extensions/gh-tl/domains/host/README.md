# Windows Host Readiness Domain (`tl host`)

CLI domain providing Windows host hypervisor governance, non-destructive `.wslconfig` deployment, Windows Terminal asset staging, and Windows Registry ModernDistributions catalog federation.

---

## Subcommands

### 1. `tl host prepare` (`gh tl host prepare`)

Configures the Windows host environment for native WSL2 distribution delivery.

```bash
gh tl host prepare
```

#### What It Does:
1. Enrolls `DistributionListUrlAppend` in `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss` pointing to the canonical GitHub Release catalog URL.
2. Deploys `%UserProfile%\.wslconfig` with non-destructive backup (`.wslconfig.bak`).
3. Stages `%LocalAppData%\Microsoft\Windows Terminal\Fragments\Microsoft.WSL\monygang.png`.

> [!NOTE]
> Requires administrative privileges (Run as Administrator) on Windows.

---

### 2. `tl host verify` (`gh tl host verify`)

Non-destructively audits the 5 Windows host readiness gates:

```bash
gh tl host verify
```

#### Readiness Gates:
1. **Gate 1 [Admin Elevation]**: Verifies that the current process possesses elevated Administrator rights.
2. **Gate 2 [WSL Catalog]**: Checks that `DistributionListUrlAppend` matches the canonical corporate URL.
3. **Gate 3 [.wslconfig]**: Validates presence of hypervisor bounds and `sparseVhd=true`.
4. **Gate 4 [Terminal Assets]**: Verifies that `monygang.png` is staged for Windows Terminal profiles.
5. **Gate 5 [WSL Engine]**: Confirms that `wsl.exe` is responsive and lists installed distributions.

---

## Navigation

- [gh-tl Extension Root (`../../README.md`)](../../README.md)
- [Distro Domain (`../distro/README.md`)](../distro/README.md)
- [Onboard Domain (`../onboard/README.md`)](../onboard/README.md)
- [Virtualization Subsystem (`../../../../virtualization/README.md`)](../../../../virtualization/README.md)
