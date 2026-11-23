# Distribution Catalog Schema (`DistributionInfo.json`)

Authoritative technical specification of the WSL 2.4.4+ `DistributionInfo.json` manifest and Windows Terminal profile fragments.

---

## 1. Specification Overview

Microsoft WSL 2.4.4+ utilizes a declarative JSON manifest format called **ModernDistributions** to discover, stream, and verify custom WSL2 distributions. The corporate manifest is version-controlled at `distributions/catalog/DistributionInfo.json` and attached to GitHub Releases upon publication.

---

## 2. Schema Structure

```json
{
  "$schema": "https://raw.githubusercontent.com/microsoft/WSL/master/distributions/DistributionInfo.schema.json",
  "Distributions": [
    {
      "Name": "tupynambalucas-dev",
      "FriendlyName": "tupynambalucas-dev (Ubuntu 26.04 LTS)",
      "Amd64Url": {
        "Url": "https://github.com/tupynambalucas-dev/workstation/releases/download/v0.2.0/tupynambalucas-dev.wsl",
        "Sha256": "0x0000000000000000000000000000000000000000000000000000000000000000"
      },
      "Default": true,
      "IconUrl": "https://raw.githubusercontent.com/tupynambalucas-dev/workstation/main/distributions/base/assets/tupynambalucas-dev.ico",
      "PackageFamilyName": "tupynambalucas-dev.workstation_8wekyb3d8bbwe",
      "TerminalProfile": {
        "name": "tupynambalucas-dev",
        "commandline": "wsl.exe -d tupynambalucas-dev",
        "startingDirectory": "//wsl.localhost/tupynambalucas-dev/home/tupy/projects/org",
        "icon": "%LOCALAPPDATA%/Microsoft/Windows Terminal/Fragments/Microsoft.WSL/tupynambalucas-dev.ico",
        "backgroundImage": "%LOCALAPPDATA%/Microsoft/Windows Terminal/Fragments/Microsoft.WSL/monygang.png",
        "backgroundImageOpacity": 0.25,
        "cursorShape": "bar",
        "font": {
          "face": "Cascadia Code NF",
          "size": 11
        }
      }
    }
  ]
}
```

---

## 3. Field Definitions

### 3.1 Distribution Object

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `Name` | `string` | Yes | Unique identifier used for `wsl.exe -d <Name>` and `wsl.exe --install -d <Name>`. |
| `FriendlyName` | `string` | Yes | Human-readable title displayed in `wsl.exe --list --online`. |
| `Amd64Url` | `object` | Yes | Download URL and integrity hash for x86_64 machines. |
| `Arm64Url` | `object` | No | Download URL and integrity hash for ARM64 machines. |
| `Default` | `boolean` | No | When `true`, marked as the preferred enterprise distribution. |
| `IconUrl` | `string` | No | Public URL for the distribution icon. |
| `PackageFamilyName` | `string` | Yes | Unique pseudo-UWP family name to isolate AppData. |
| `TerminalProfile` | `object` | No | Embedded Windows Terminal profile configuration. |

### 3.2 Download Target (`Amd64Url` / `Arm64Url`)

| Field | Type | Format | Description |
| :--- | :--- | :--- | :--- |
| `Url` | `string` | HTTPS URL | Direct download link to the `.wsl` tarball asset on GitHub Releases. |
| `Sha256` | `string` | `0x<hex>` | 64-character lowercase hexadecimal hash prefixed with `0x`. Case-insensitive in WSL engine. |

> [!IMPORTANT]
> **The `0x` Hex Prefix Invariant**:
> WSL's internal C++ download verifier strictly requires the `0x` prefix on the `Sha256` string. A raw 64-character string without `0x` will cause `wsl.exe --install` to fail with error `0x80070057 (E_INVALIDARG)`.

---

## 4. Windows Terminal Fragment Specification

Windows Terminal discovers dynamic profiles through JSON fragments located at:

```text
%LocalAppData%\Microsoft\Windows Terminal\Fragments\<AppFolder>\<file>.json
```

For WSL distributions, fragments use the namespace `Microsoft.WSL`:

```text
%LocalAppData%\Microsoft\Windows Terminal\Fragments\Microsoft.WSL\
```

### Staged Assets:
- `monygang.png`: Shared wallpaper staged by `gh tl host prepare`.
- `tupynambalucas-dev.ico`: Distribution icon.
- `tupynambalucas-dev-cluster.ico`: Kubernetes cluster distribution icon.

---

## Related References

- [Enrolling the WSL Distribution Catalog](../how-to-guides/enrolling-wsl-distribution-catalog.md)
- [Modern WSL Catalog vs Legacy Distros](../explanation/modern-wsl-catalog-vs-legacy-distros.md)
