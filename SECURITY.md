# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: **security@pohi-protocol.org** (or open a private security advisory on GitHub)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Initial response | 48 hours |
| Vulnerability confirmation | 7 days |
| Fix development | 30 days (critical: 7 days) |
| Public disclosure | After fix is deployed |

## Scope

### In Scope

| Component | Location |
|-----------|----------|
| Smart Contracts | `packages/contracts/src/` |
| Core Library | `packages/core/src/` |
| SDK | `packages/sdk/src/` |
| CLI | `packages/cli/src/` |
| GitHub Action | `packages/action/src/` |

### Out of Scope

- Third-party dependencies (report to upstream)
- Demo application (`packages/demo/`)
- Documentation websites

## Security Model

### Trust Assumptions

1. **World ID Orb**: Correctly identifies unique humans
2. **Cryptographic Primitives**: SHA-256, Keccak-256, ZK proofs are secure
3. **Blockchain**: World Chain provides finality and censorship resistance
4. **Time**: Block timestamps are reasonably accurate

### Threat Model

| Threat | Mitigation | Status |
|--------|------------|--------|
| **Sybil Attack** | World ID nullifier hash ensures one approval per human per scope | Implemented |
| **Replay Attack** | Signal binds proof to specific commit SHA | Implemented |
| **Tampering** | Attestation hash covers all critical fields | Implemented |
| **Front-running** | On-chain recording with nullifier check | Implemented |
| **Impersonation** | ZK proof of personhood required | Implemented |

### Known Limitations

1. **World ID Dependency**: Security relies on World ID's Orb verification accuracy
2. **Nullifier Scope**: Same human can approve different commits (by design)
3. **Revocation**: Revoked attestations remain on-chain (marked as revoked)
4. **Timestamp**: Uses block timestamp, not external time oracle

## Smart Contract Security

### Audit Status

| Contract | Auditor | Status | Report |
|----------|---------|--------|--------|
| PoHIRegistry.sol | - | Pending | - |

### Security Features

- **Access Control**: Owner-based administration
- **Reentrancy Protection**: No external calls in state-changing functions
- **Integer Overflow**: Solidity 0.8.x built-in checks
- **Nullifier Uniqueness**: Mapping prevents duplicate approvals

### Upgrade Policy

- Contracts are **non-upgradeable** by design
- New versions deployed to new addresses
- Migration tools provided for users

## Cryptographic Details

### Hash Algorithms

| Purpose | Algorithm | Implementation |
|---------|-----------|----------------|
| Attestation Hash (off-chain) | SHA-256 | Node.js `crypto` |
| Attestation Hash (on-chain) | Keccak-256 | Solidity native |
| Signal Hash | SHA-256 / Keccak-256 | Context-dependent |

### Why Two Hash Algorithms?

- **SHA-256**: Protocol standard, widely supported, used off-chain
- **Keccak-256**: EVM native, gas efficient, used on-chain

Both hashes are computed for each attestation:
- `attestation_hash`: SHA-256 for protocol identification
- EVM hash: Keccak-256 for on-chain storage

## Dependency Security

### Audit Trail

Key dependencies and their security posture:

| Package | Purpose | Security |
|---------|---------|----------|
| `viem` | EVM interaction | Widely audited |
| `@worldcoin/idkit` | World ID integration | Worldcoin maintained |

### Update Policy

- Security patches: Immediate update
- Minor versions: Weekly review
- Major versions: Compatibility testing required

## Bug Bounty

Coming soon. We plan to launch a bug bounty program after the initial security audit.

### Preliminary Rewards (Subject to Change)

| Severity | Reward |
|----------|--------|
| Critical | Up to $10,000 |
| High | Up to $5,000 |
| Medium | Up to $1,000 |
| Low | Up to $200 |

## Security Checklist for Contributors

Before submitting a PR:

- [ ] No secrets or private keys in code
- [ ] Input validation for all user inputs
- [ ] No unsafe type assertions
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] Tests cover security-critical paths

## Contact

- Security issues: security@pohi-protocol.org
- General questions: Open a GitHub Discussion
