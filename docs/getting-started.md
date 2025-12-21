# Getting Started with PoHI

This guide will help you integrate Proof of Human Intent into your project.

## What is PoHI?

PoHI (Proof of Human Intent) creates cryptographically verifiable proof that a real human approved critical software actions. It answers three questions:

- **Who?** - A unique human (verified by World ID)
- **What?** - A specific commit SHA
- **When?** - Immutable timestamp

## Prerequisites

- Node.js 18+
- [World ID App](https://world.org/world-app) installed on your phone
- GitHub repository (for CI/CD integration)

---

## Quick Start

### 1. Try the Demo

Visit [pohi-demo.vercel.app](https://pohi-demo.vercel.app) to see PoHI in action:

1. Enter a repository and commit SHA
2. Select World ID as provider
3. Scan the QR code with your World App
4. Receive a cryptographic attestation

### 2. Install the Library

```bash
# Core library (zero dependencies)
npm install pohi-core

# For EVM/on-chain integration
npm install pohi-evm

# Full SDK
npm install pohi-sdk
```

### 3. Create an Attestation

```typescript
import { createAttestation, computeSignal, validateAttestation } from 'pohi-core';

// After receiving World ID proof from your frontend
const attestation = createAttestation(
  {
    repository: 'your-org/your-repo',
    commit_sha: 'abc123def456...',
    action: 'PR_MERGE',
    description: 'Merge feature branch'
  },
  {
    method: 'world_id',
    verification_level: 'orb',
    nullifier_hash: '0x...', // from World ID
    signal: computeSignal('your-org/your-repo', 'abc123def456...')
  }
);

// Validate the attestation
const result = validateAttestation(attestation);
console.log(result.valid); // true
console.log(attestation.attestation_hash); // 0x...
```

---

## GitHub Action Integration

The easiest way to use PoHI is with our GitHub Action.

### Basic Setup

Create `.github/workflows/human-approval.yml`:

```yaml
name: Human Approval Required

on:
  pull_request:
    types: [labeled]

permissions:
  contents: write
  statuses: write
  pull-requests: write

jobs:
  require-human:
    if: github.event.label.name == 'needs-human-approval'
    runs-on: ubuntu-latest

    steps:
      - name: Request Human Approval
        uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://pohi-demo.vercel.app
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: approve_pr_merge
          verification-level: orb
          timeout-minutes: 30
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### How It Works

1. Add the `needs-human-approval` label to a PR
2. The workflow posts a comment with an approval link
3. A human scans the QR code with World App
4. Once verified, the workflow succeeds
5. PR can be merged

### Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `approval-url` | Yes | - | URL of approval UI |
| `world-id-app-id` | Yes | - | Your World ID App ID |
| `world-id-action` | Yes | - | World ID action identifier |
| `verification-level` | No | `orb` | `device` or `orb` |
| `timeout-minutes` | No | `30` | How long to wait |
| `github-token` | No | `GITHUB_TOKEN` | For status updates |

### Action Outputs

| Output | Description |
|--------|-------------|
| `attestation` | Full attestation JSON |
| `attestation-hash` | SHA-256 hash of attestation |
| `nullifier-hash` | World ID nullifier (unique per human) |
| `approved-at` | ISO timestamp of approval |

---

## World ID Setup

### 1. Create a World ID App

1. Go to [developer.world.org](https://developer.world.org)
2. Create a new app
3. Note your **App ID** (e.g., `app_abc123...`)
4. Create an **Action** (e.g., `approve_pr_merge`)

### 2. Configure Verification Level

- **Device**: Phone-based verification (lower assurance)
- **Orb**: Biometric verification (higher assurance, recommended for production)

### 3. Add to GitHub Secrets

```
WORLD_ID_APP_ID=app_abc123...
```

---

## Use Cases

### 1. PR Merge Approval

Require human approval before merging AI-generated PRs:

```yaml
jobs:
  ai-pr-approval:
    if: contains(github.event.pull_request.labels.*.name, 'ai-generated')
    # ... PoHI action
```

### 2. Production Deployment

Gate deployments with human verification:

```yaml
jobs:
  deploy-prod:
    needs: [build, test]
    steps:
      - name: Human Approval for Deploy
        uses: pohi-protocol/pohi/packages/action@main
        with:
          world-id-action: approve_production_deploy
          # ...

      - name: Deploy
        run: ./deploy.sh
```

### 3. Release Signing

Verify human approval for releases:

```yaml
on:
  release:
    types: [created]

jobs:
  verify-release:
    steps:
      - uses: pohi-protocol/pohi/packages/action@main
        with:
          world-id-action: approve_release
```

---

## Security Considerations

### What PoHI Guarantees

- A **unique human** approved a **specific commit**
- The approval is **timestamped** and **tamper-evident**
- The same human cannot approve the same commit twice

### What PoHI Does NOT Guarantee

- That the human **understood** the code
- That the human is **authorized** by your organization
- That the code is **correct** or **safe**

### Best Practices

1. **Use Orb verification** for high-security workflows
2. **Combine with code review** - PoHI proves human approval, not code quality
3. **Trust your approval server** - Only use trusted `approval-url` values
4. **Monitor attestations** - Watch for unexpected approvals

---

## Troubleshooting

### "World ID verification failed"

- Ensure you have the World App installed
- Check that your World ID is verified (Orb or Device)
- Verify the action ID matches your World ID app configuration

### "Timeout waiting for approval"

- The default timeout is 30 minutes
- Increase `timeout-minutes` if needed
- Check that the approval URL is accessible

### "Status check not updating"

- Ensure `GITHUB_TOKEN` has `statuses: write` permission
- Check workflow permissions in repository settings

---

## API Reference

### Core Functions

```typescript
// Create attestation from subject and proof
createAttestation(subject: ApprovalSubject, proof: HumanProof): HumanApprovalAttestation

// Validate attestation structure and hash
validateAttestation(attestation: HumanApprovalAttestation): { valid: boolean, errors: string[] }

// Compute signal for World ID binding
computeSignal(repository: string, commitSha: string): string

// Compute attestation hash
computeAttestationHash(attestation: HumanApprovalAttestation): string
```

### Types

```typescript
interface ApprovalSubject {
  repository: string;
  commit_sha: string;
  action: 'PR_MERGE' | 'DEPLOY' | 'RELEASE' | 'GENERIC';
  description?: string;
}

interface HumanProof {
  method: 'world_id' | 'gitcoin_passport' | 'brightid' | 'civic' | 'proof_of_humanity';
  verification_level?: 'device' | 'orb';
  nullifier_hash: string;
  signal: string;
}
```

---

## Next Steps

- [Security Model](../SECURITY.md) - Detailed threat analysis
- [Demo App](https://pohi-demo.vercel.app) - Try it live
- [GitHub Repository](https://github.com/pohi-protocol/pohi) - Source code
- [Research Paper](../paper/) - Academic background

---

## Support

- **Issues**: [GitHub Issues](https://github.com/pohi-protocol/pohi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pohi-protocol/pohi/discussions)
