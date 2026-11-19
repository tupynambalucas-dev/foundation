# syntax=docker/dockerfile:1.7
ARG BASE_IMAGE=tupynambalucas-dev-base:latest
FROM ${BASE_IMAGE} AS builder

ENV DEBIAN_FRONTEND=noninteractive \
    K3D_VERSION=v5.8.3 \
    KUBECTL_VERSION=v1.31.4 \
    HELM_VERSION=v3.16.4 \
    SKAFFOLD_VERSION=v2.13.2 \
    KUBESEAL_VERSION=0.27.1

# 1. Networking & Kubernetes node prerequisites
RUN apt-get update && apt-get install -y --no-install-recommends \
    conntrack \
    ebtables \
    ethtool \
    iproute2 \
    iptables \
    kmod \
    socat \
    util-linux \
    && systemctl enable docker.service containerd.service

# 2. Install kubectl, k3d, Helm, Skaffold, and kubeseal
RUN ARCH=$(dpkg --print-architecture) \
    && curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/${ARCH}/kubectl" -o /usr/local/bin/kubectl \
    && curl -fsSL "https://github.com/k3d-io/k3d/releases/download/${K3D_VERSION}/k3d-linux-${ARCH}" -o /usr/local/bin/k3d \
    && curl -fsSL "https://get.helm.sh/helm-${HELM_VERSION}-linux-${ARCH}.tar.gz" | tar -xzO linux-${ARCH}/helm > /usr/local/bin/helm \
    && curl -fsSL "https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-linux-${ARCH}" -o /usr/local/bin/skaffold \
    && curl -fsSL "https://github.com/bitnami-labs/sealed-secrets/releases/download/v${KUBESEAL_VERSION}/kubeseal-${KUBESEAL_VERSION}-linux-${ARCH}.tar.gz" | tar -xzO kubeseal > /usr/local/bin/kubeseal \
    && chmod 0755 /usr/local/bin/kubectl /usr/local/bin/k3d /usr/local/bin/helm /usr/local/bin/skaffold /usr/local/bin/kubeseal

# 3. Apply Cluster WSL Config, Kernel Tuning (inotify/sysctl), and OOBE
COPY distributions/shared/assets/monygang.png /usr/lib/wsl/monygang.png
COPY distributions/cluster/assets/tupynambalucas-dev-cluster.ico /usr/lib/wsl/tupynambalucas-dev-cluster.ico
COPY distributions/cluster/assets/terminal-profile.json /usr/lib/wsl/terminal-profile.json
COPY distributions/cluster/etc/sysctl.d/99-kubernetes.conf /etc/sysctl.d/99-kubernetes.conf
COPY distributions/cluster/etc/wsl.conf /etc/wsl.conf
COPY distributions/cluster/etc/wsl-distribution.conf /etc/wsl-distribution.conf
COPY distributions/cluster/etc/oobe.sh /etc/oobe.sh
COPY distributions/shared/systemd-mask.sh /tmp/systemd-mask.sh

RUN chown root:root /etc/wsl.conf /etc/wsl-distribution.conf /etc/oobe.sh /etc/sysctl.d/99-kubernetes.conf /usr/lib/wsl/monygang.png \
    && chmod 0644 /etc/wsl.conf /etc/wsl-distribution.conf /etc/sysctl.d/99-kubernetes.conf /usr/lib/wsl/tupynambalucas-dev-cluster.ico /usr/lib/wsl/terminal-profile.json /usr/lib/wsl/monygang.png \
    && chmod 0755 /etc/oobe.sh /tmp/systemd-mask.sh \
    && /tmp/systemd-mask.sh

FROM scratch AS rootfs
COPY --from=builder / /
