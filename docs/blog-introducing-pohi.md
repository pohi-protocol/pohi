# Introducing PoHI: Cryptographic Proof That a Human Approved Your Code

**TL;DR**: AI agents are writing code, reviewing PRs, and deploying to production. But can you *prove* a human approved it? PoHI (Proof of Human Intent) creates verifiable cryptographic attestations binding human approval to specific commits.

[Try the Demo](https://pohi-demo.vercel.app) | [GitHub](https://github.com/pohi-protocol/pohi) | [npm](https://www.npmjs.com/package/pohi-core) | [Paper (coming soon)](#)

![PoHI - Proof of Human Intent](https://pohi-demo.vercel.app/opengraph-image)

---

## The Problem

It's 2025. GitHub Copilot writes your code. AI agents create pull requests. Automated systems review and suggest merges.

But here's the question nobody's asking:

> "Who approved this merge?"
> "The AI did."

This is fine for low-stakes changes. But what about:

- Deploying to production?
- Releasing a security-critical library?
- Merging code that handles user data?

Today, there's no way to cryptographically verify that a human—not a bot—approved these actions.

## The Solution: Proof of Human Intent

PoHI creates machine-verifiable proof that a real human approved a specific action. It answers three questions:

| Question | Technology | Proof |
|----------|------------|-------|
| **Who?** | World ID (ZK proof of personhood) | Unique human |
| **What?** | SHA-256 signal binding | Specific commit |
| **When?** | Blockchain timestamp | Immutable record |

### How It Works

```
1. AI creates PR
2. Workflow requests human approval
3. Human scans QR code with World App
4. Zero-knowledge proof generated
5. Attestation created: "Human X approved commit Y at time Z"
6. PR can be merged
```

The key insight: **World ID proves you're a unique human without revealing who you are**. The nullifier hash ensures one approval per human per commit—no Sybil attacks possible.

### Multiple Identity Providers

PoHI isn't locked to a single provider. We've tested and verified:

| Provider | Type | Status |
|----------|------|--------|
| **World ID** | ZK proof (Orb/Device) | ✅ Verified |
| **Gitcoin Passport** | Web3 identity score | ✅ Verified (Score: 54.33) |
| **BrightID** | Social graph | 🔧 Implemented |
| **Civic** | Gateway Pass | 🔧 Implemented |

This means organizations can choose the verification level appropriate for their risk tolerance.

## Show Me the Code

### GitHub Action (Easiest)

```yaml
# .github/workflows/human-approval.yml
name: Require Human Approval

on:
  pull_request:
    types: [labeled]

jobs:
  human-gate:
    if: github.event.label.name == 'needs-human-approval'
    runs-on: ubuntu-latest
    steps:
      - uses: pohi-protocol/pohi/packages/action@main
        with:
          approval-url: https://pohi-demo.vercel.app
          world-id-app-id: ${{ secrets.WORLD_ID_APP_ID }}
          world-id-action: approve_merge
```

That's it. Add the label, scan the QR code, and the workflow succeeds.

### Library (Full Control)

```typescript
import { createAttestation, validateAttestation } from 'pohi-core';

const attestation = createAttestation(
  { repository: 'org/repo', commit_sha: 'abc123', action: 'DEPLOY' },
  { method: 'world_id', nullifier_hash: '0x...', signal: '0x...' }
);

console.log(attestation.attestation_hash); // Unique identifier
console.log(validateAttestation(attestation).valid); // true
```

## Why Not Just Use GitHub Reviews?

GitHub reviews have two problems:

1. **No proof of humanity**: A bot can approve a PR
2. **No cryptographic binding**: Reviews aren't machine-verifiable

PoHI creates a cryptographic link between:
- A verified human (World ID nullifier)
- A specific action (commit SHA)
- A timestamp (block time)

This attestation can be verified by anyone, anywhere, without trusting GitHub.

## What PoHI Doesn't Do

We're explicit about limitations:

- **Not a code reviewer**: PoHI proves approval, not correctness
- **Not authorization**: Use it with your org's access controls
- **Not semantic verification**: We can't ensure the human understood the code

PoHI guarantees: *"A unique human approved this specific commit."*

It does NOT guarantee: *"The human made a good decision."*

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Proof of Human Intent                       │
├─────────────────────────────────────────────────────────────┤
│   ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│   │  VERIFY  │───▶│   BIND   │───▶│  RECORD  │              │
│   │ "Human?" │    │  "What?" │    │ "Proof"  │              │
│   └──────────┘    └──────────┘    └──────────┘              │
│        │               │               │                     │
│        ▼               ▼               ▼                     │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│   │ World ID │    │ Git+SHA  │    │ On-chain │              │
│   │ ZK Proof │    │ Binding  │    │  Record  │              │
│   └──────────┘    └──────────┘    └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

We've done a [comprehensive security review](https://github.com/pohi-protocol/pohi/blob/main/SECURITY.md) covering:

- **Sybil attacks**: Prevented by World ID nullifiers
- **Replay attacks**: Signal binds proof to specific commit
- **Tampering**: SHA-256 hash integrity
- **Impersonation**: ZK proof required

What's out of scope:
- Social engineering (human tricked into approving)
- Semantic gap (human doesn't understand what they approved)
- Malicious insiders (authorized human with bad intent)

## Current Status

PoHI is live and testable:

- **Smart Contracts**: Deployed on [World Chain Sepolia](https://worldchain-sepolia.explorer.alchemy.com/address/0xe3af97c1eb0c1bfa872059270a947e8a10ffd9d1)
- **npm Packages**: `pohi-core`, `pohi-evm`, `pohi-sdk`, `pohi-cli` all published
- **CI/CD Integrations**: GitHub Action, GitLab CI, Bitbucket Pipe ready
- **Test Coverage**: 250+ tests across all packages

World Chain Mainnet deployment coming soon.

## Try It Now

1. **Demo**: [pohi-demo.vercel.app](https://pohi-demo.vercel.app)
2. **Install**: `npm install pohi-core`
3. **GitHub Action**: Copy the YAML above

## Why This Matters

As AI takes over implementation, humans become approvers.

This shift is inevitable. The question is: will there be cryptographic proof of human oversight, or just process theater?

PoHI ensures that when you say "a human approved this," you can prove it.

---

**Links**:
- GitHub: [pohi-protocol/pohi](https://github.com/pohi-protocol/pohi)
- Demo: [pohi-demo.vercel.app](https://pohi-demo.vercel.app)
- npm: [pohi-core](https://www.npmjs.com/package/pohi-core)
- Security: [SECURITY.md](https://github.com/pohi-protocol/pohi/blob/main/SECURITY.md)
- Contract: [World Chain Sepolia](https://worldchain-sepolia.explorer.alchemy.com/address/0xe3af97c1eb0c1bfa872059270a947e8a10ffd9d1)

**Author**: [Ikko Eltociear Ashimine](https://github.com/eltociear)

*Published: December 2025*

---

*Proof of Human Intent: AI executes. Humans authorize. Machines verify.*

---

**Discussion**: Found this interesting? Have questions or feedback? Open an [issue](https://github.com/pohi-protocol/pohi/issues) or reach out on GitHub.
