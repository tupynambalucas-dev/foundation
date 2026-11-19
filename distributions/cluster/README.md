# Cluster Kubernetes Engine Distribution (`tupynambalucas-dev-cluster`)

Layer-3 WSL2 Distribution-as-Code package extending [`tupynambalucas-dev`](../base/README.md) into a dedicated Ubuntu 26.04 LTS Kubernetes engine (`tupynambalucas-dev-cluster.wsl`) engineered to host the organization's dual `k3d` clusters (`k3d-hub` and `k3d-corporate`).

---

## Kubernetes & Cloud-Native Toolchain Matrix

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| **`k3d`** | `v5.8.3` | Multi-node k3s cluster orchestration inside Docker (`k3d-hub` & `k3d-corporate`) |
| **`kubectl`** | `v1.31.4` | Kubernetes API CLI |
| **`helm`** | `v3.16.4` | Chart lifecycle management |
| **`skaffold`** | `v2.13.2` | Continuous local Kubernetes development workflows |
| **`kubeseal`** | `0.27.1` | Bitnami SealedSecrets encryption utility |
| **Docker & containerd** | `docker.service` enabled | Always-on container runtime for persistent `k3d` control planes |

---

## Kernel Tuning (`etc/sysctl.d/99-kubernetes.conf`)

| Parameter | Value | Rationale |
| :--- | :--- | :--- |
| `fs.inotify.max_user_watches` | `1048576` | Prevents Skaffold, Vite, and Kubernetes kubelet file-watcher exhaustion |
| `fs.inotify.max_user_instances` | `8192` | Supports concurrent log tailing and ingress controllers across dual clusters |
| `fs.file-max` | `2097152` | High file-descriptor ceiling for containerd and database pods |
| `vm.max_map_count` | `262144` | Required by vector/search engines and observability workloads |
| `net.ipv4.ip_forward` | `1` | Required for CNI pod-to-pod and service routing |

---

## Windows Terminal Profile (`Admin` Profile Inheritance)

`tupynambalucas-dev-cluster` inherits 100% of the visual identity from the developer's `Admin` Windows Terminal profile:
- **Icon**: `tupynambalucas-dev-cluster.ico` (sourced from `g_brxplayer.ico`)
- **Tab Title**: `tupynambalucas.dev [cluster]`
- **Theme & Wallpaper**: `Vintage` color scheme, `#000000` background, `"backgroundImage": "monygang.png"` (`backgroundImageOpacity: 0.45`, `fill`)
- **Typography & Cursor**: `Ubuntu Mono` (`size: 12`, `weight: "medium"`), vintage cursor `#FE00FF`, selection `#80555D`, `elevate: true`

---

## Navigation

- [WSL2 Distributions Subsystem (`../README.md`)](../README.md)
- [Base Developer Distribution (`../base/README.md`)](../base/README.md)
- [Documentation Hub (`../../references/README.md`)](../../references/README.md)
- [Workstation Monorepo Root (`../../README.md`)](../../README.md)
