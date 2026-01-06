# PoHI Development Container
FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install additional tools
RUN apt-get update && apt-get install -y \
    curl \
    git \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash
ENV PATH="/root/.foundry/bin:${PATH}"
RUN foundryup

# Install Playwright dependencies (for E2E tests)
RUN npx playwright install-deps chromium

# Set working directory
WORKDIR /workspace

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/evm/package.json ./packages/evm/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/cli/package.json ./packages/cli/
COPY packages/action/package.json ./packages/action/
COPY packages/demo/package.json ./packages/demo/
COPY packages/gitlab-ci/package.json ./packages/gitlab-ci/
COPY packages/bitbucket-pipe/package.json ./packages/bitbucket-pipe/

# Install dependencies
RUN npm install

# Default command
CMD ["sleep", "infinity"]
