# Provisioning a Kubernetes Cluster in WSL2

Task-oriented guide for deploying, configuring, and verifying localized Kubernetes development clusters inside the `tupynambalucas-dev-cluster` WSL2 distribution.

---

## The Problem

Running local container orchestrators (k3s, k8s, kind) directly inside standard WSL2 distributions frequently fails due to missing sysctl kernel bridges (`bridge-nf-call-iptables`), restricted inotify watch limits, missing cgroups v2 configurations, or unmanaged kubeconfig permissions.

---

## The Solution: tupynambalucas-dev-cluster

The `tupynambalucas-dev-cluster` distribution pre-packages all required kernel parameters, sysctl configurations, and container runtime tooling tailored for single-node cluster engines.

---

## Step 1: Install the Cluster Distribution

Run the installation command via `gh-tl`:

```bash
gh tl distro install tupynambalucas-dev-cluster
```

Or invoke native WSL:

```bash
wsl.exe --install -d tupynambalucas-dev-cluster
```

---

## Step 2: Validate Pre-Configured Sysctl Parameters

Boot into the newly created cluster instance:

```bash
wsl.exe -d tupynambalucas-dev-cluster
```

Verify that `distributions/cluster/etc/sysctl.d/99-kubernetes.conf` applied the required networking parameters:

```bash
sysctl net.bridge.bridge-nf-call-iptables
# Expected: net.bridge.bridge-nf-call-iptables = 1

sysctl net.bridge.bridge-nf-call-ip6tables
# Expected: net.bridge.bridge-nf-call-ip6tables = 1

sysctl net.ipv4.ip_forward
# Expected: net.ipv4.ip_forward = 1

sysctl fs.inotify.max_user_watches
# Expected: fs.inotify.max_user_watches = 524288
```

---

## Step 3: Verify Kubeconfig Directory Permissions

The distribution's OOBE script (`distributions/cluster/etc/oobe.sh`) automatically initializes `/home/tupy/.kube` with strict enterprise permission flags (`0700`):

```bash
ls -ld ~/.kube
# Expected: drwx------ 2 tupy tupy ... /home/tupy/.kube
```

This prevents Kubernetes CLI tools (`kubectl`, `helm`, `k9s`) from throwing permission warnings during configuration generation.

---

## Step 4: Install and Start k3s (Zero-Docker Lightweight Kubernetes)

To initialize a single-node cluster without Docker Desktop overhead, install k3s using the official installer with systemd service mode:

```bash
curl -sfL https://get.k3s.io | sh -
```

Wait for the k3s service to achieve running status:

```bash
sudo systemctl status k3s
```

Allow your non-root user (`tupy`) to access the cluster:

```bash
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown tupy:tupy ~/.kube/config
chmod 0600 ~/.kube/config
```

Verify the node is ready:

```bash
kubectl get nodes
```

Expected output:
```text
NAME             STATUS   ROLES                  AGE   VERSION
DESKTOP-WSL      Ready    control-plane,master   1m    v1.30.x+k3s1
```

---

## Step 5: Clean Up and Resource Teardown

When finished developing, shut down the cluster to release host memory:

```bash
sudo systemctl stop k3s
```

To release memory back to the Windows host completely:

```powershell
# From Windows PowerShell
wsl.exe --terminate tupynambalucas-dev-cluster
```

---

## Related References

- [Systemd Units & OOBE Specification](../reference/systemd-units-and-oobe-spec.md)
- [Managing Hypervisor Resources with .wslconfig](./managing-hypervisor-with-wslconfig.md)
