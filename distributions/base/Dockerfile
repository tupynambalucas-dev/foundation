# syntax=docker/dockerfile:1.7
FROM ubuntu:26.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    NODE_MAJOR=22 \
    PNPM_VERSION=12.6.0 \
    GO_VERSION=1.27.3 \
    MANI_VERSION=0.30.0

# 1. Core OS packages, systemd, zsh, and build essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    dbus \
    git \
    gnupg \
    jq \
    less \
    locales \
    lsb-release \
    make \
    openssh-client \
    procps \
    sudo \
    systemd \
    systemd-sysv \
    unzip \
    wget \
    xz-utils \
    zip \
    zsh \
    && locale-gen en_US.UTF-8 \
    && update-locale LANG=en_US.UTF-8

# 2. GitHub CLI (gh), Docker CLI + Socket-Activated Engine, and Infisical CLI
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc \
    && chmod a+r /etc/apt/keyrings/docker.asc \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
    && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | bash \
    && apt-get update && apt-get install -y --no-install-recommends \
    gh \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin \
    infisical \
    && systemctl disable docker.service \
    && systemctl enable docker.socket

# 3. Node.js v22 LTS & pnpm v12
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate

# 4. Go Runtime & Mani CLI Orchestrator
RUN ARCH=$(dpkg --print-architecture) \
    && curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-${ARCH}.tar.gz" | tar -C /usr/local -xzf - \
    && ln -sf /usr/local/go/bin/go /usr/local/bin/go \
    && ln -sf /usr/local/go/bin/gofmt /usr/local/bin/gofmt \
    && curl -fsSL "https://github.com/aliesbelik/mani/releases/download/v${MANI_VERSION}/mani_${MANI_VERSION}_linux_${ARCH}.tar.gz" | tar -C /usr/local/bin -xzf - mani \
    && chmod 0755 /usr/local/bin/mani

# 5. WSL Distribution Configuration, OOBE, Assets, and Systemd Hygiene
RUN mkdir -p /usr/lib/wsl
COPY distributions/shared/assets/monygang.png /usr/lib/wsl/monygang.png
COPY distributions/base/assets/tupynambalucas-dev.ico /usr/lib/wsl/tupynambalucas-dev.ico
COPY distributions/base/assets/terminal-profile.json /usr/lib/wsl/terminal-profile.json
COPY distributions/base/etc/wsl.conf /etc/wsl.conf
COPY distributions/base/etc/wsl-distribution.conf /etc/wsl-distribution.conf
COPY distributions/shared/oobe-common.sh /usr/lib/wsl/oobe-common.sh
COPY distributions/base/etc/oobe.sh /etc/oobe.sh
COPY distributions/shared/systemd-mask.sh /tmp/systemd-mask.sh

RUN chown root:root /etc/wsl.conf /etc/wsl-distribution.conf /etc/oobe.sh /usr/lib/wsl/oobe-common.sh /usr/lib/wsl/monygang.png \
    && chmod 0644 /etc/wsl.conf /etc/wsl-distribution.conf /usr/lib/wsl/tupynambalucas-dev.ico /usr/lib/wsl/terminal-profile.json /usr/lib/wsl/monygang.png \
    && chmod 0755 /etc/oobe.sh /usr/lib/wsl/oobe-common.sh /tmp/systemd-mask.sh \
    && /tmp/systemd-mask.sh

# Flatten into a clean single-layer rootfs for tar export
FROM scratch AS rootfs
COPY --from=builder / /
