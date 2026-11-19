# Distribution-as-Code and OCI Mechanics

Technical deep dive into using multi-stage Dockerfiles as declarative distribution recipes and leveraging Docker Buildx tar export mechanics for WSL2 rootfs compilation.

---

## 1. What is Distribution-as-Code?

Distribution-as-Code is the practice of treating an entire Linux operating system image as version-controlled, auditable, and reproducible source code.

Instead of maintaining binary virtual hard disks (`.vhdx`) or shell setup scripts that mutate live virtual machines, the distribution's complete state—package dependencies, systemd configurations, user templates, and kernel sysctls—is codified within a Dockerfile:

- Developer Workstation: `distributions/base/Dockerfile`
- Kubernetes Node: `distributions/cluster/Dockerfile`

---

## 2. Multi-Stage Build & Scratch Export Architecture

A major challenge with using container images as WSL distributions is that standard Docker container layers contain container runtime metadata (`.dockerenv`, container entrypoints, intermediate layer caches) that degrade WSL virtualization performance.

To solve this, our Dockerfiles utilize a two-stage pattern:

```dockerfile
# Stage 1: Build & sanitize rootfs
FROM ubuntu:devel AS builder
ENV DEBIAN_FRONTEND=noninteractive

# Install core packages, developer toolchains, shells
RUN apt-get update && apt-get install -y --no-install-recommends ...

# Mask conflicting systemd units & purge caches
COPY distributions/shared/systemd-mask.sh /tmp/systemd-mask.sh
RUN /tmp/systemd-mask.sh && rm -f /tmp/systemd-mask.sh

# Stage 2: Pristine Rootfs Export
FROM scratch
COPY --from=builder / /
```

### Why `FROM scratch`?
Starting `FROM scratch` and copying `/` from the builder stage collapses all intermediate filesystem layers into a single flattened filesystem tree, completely discarding build history, intermediate cached packages, and build environment variables.

---

## 3. Docker Buildx Tar Export Mechanics

Standard `docker build` exports an image to the local Docker daemon container store. In contrast, Docker Buildx supports the `--output type=tar` exporter:

```bash
docker buildx build \
  --output type=tar,dest=output/tupynambalucas-dev.wsl \
  -f distributions/base/Dockerfile \
  .
```

### What Buildx Does:
1. Executes the build steps in an isolated BuildKit worker container.
2. Formats the root filesystem of the `FROM scratch` stage into an uncompressed POSIX tarball (`.wsl`).
3. Streams the tar archive directly to the host filesystem at `output/tupynambalucas-dev.wsl` without touching the local Docker image cache.
4. Preserves POSIX file permissions, symbolic links (such as systemd `/dev/null` masks), and special device nodes.

---

## 4. Cloud CI/CD Automation

In `.github/workflows/release.yml`, GitHub Actions runs this build across multiple Linux runners:
1. Docker Buildx compiles both distributions (`tupynambalucas-dev.wsl` and `tupynambalucas-dev-cluster.wsl`).
2. A cryptographic SHA-256 digest is computed for each archive (`0x<hex>`).
3. The workflow dynamically replaces placeholder checksums in `distributions/catalog/DistributionInfo.json`.
4. All artifacts are attached to the official GitHub Release.

This ensures zero build overhead on developer workstations.

---

## Related References

- [Systemd Units and OOBE Specification](../reference/systemd-units-and-oobe-spec.md)
- [Building and Testing Custom WSL2 Distros](../tutorials/building-and-testing-custom-distros.md)
