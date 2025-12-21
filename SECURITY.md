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

---

## Security Model

### Trust Assumptions

1. **World ID Orb**: Provides strong practical Sybil resistance through biometric-based uniqueness checks (does not claim formal biometric infallibility)
2. **Cryptographic Primitives**: SHA-256, Keccak-256, ZK proofs are computationally secure
3. **Blockchain**: World Chain provides finality and censorship resistance
4. **Time**: Block timestamps are reasonably accurate (within minutes)
5. **GitHub Context**: `github.context.sha` in Actions is trustworthy

### What PoHI Guarantees

- A **unique human** (as verified by World ID) approved a **specific signal** (commit SHA)
- The approval is **timestamped** and **tamper-evident**
- The same human cannot approve the same commit twice (nullifier uniqueness)

### What PoHI Does NOT Guarantee

- That the human **understood** what they approved (semantic gap)
- That the human **intended** to approve that specific action (UI/social engineering)
- That the human is **authorized** by the organization (requires Authority Layer)
- That the code being approved is **safe** or **correct**

---

## Detailed Threat Analysis

### 1. Sybil Attack

| Aspect | Details |
|--------|---------|
| **Threat** | Attacker creates multiple identities to approve malicious commits |
| **Mitigation** | World ID nullifier hash ensures one identity per human per scope |
| **Assurance Level** | High (Orb), Medium (Device) |
| **Residual Risk** | World ID verification accuracy; colluding individuals |

### 2. Replay Attack

| Aspect | Details |
|--------|---------|
| **Threat** | Reusing a valid proof from one commit for another |
| **Mitigation** | Signal = SHA256(repository:commit_sha) binds proof to specific commit |
| **Assurance Level** | High |
| **Residual Risk** | None identified |

### 3. Front-Running Attack

| Aspect | Details |
|--------|---------|
| **Threat** | Attacker observes pending approval and submits before legitimate user |
| **Mitigation** | On-chain nullifier check; ZK proof required (attacker lacks proof) |
| **Assurance Level** | High |
| **Residual Risk** | Theoretical MEV concerns (mitigated by World Chain design) |

### 4. Impersonation Attack

| Aspect | Details |
|--------|---------|
| **Threat** | Attacker claims to be an authorized approver |
| **Mitigation** | World ID ZK proof cryptographically proves humanity |
| **Assurance Level** | High |
| **Residual Risk** | Compromised World ID credentials (user responsibility) |

### 5. Attestation Tampering

| Aspect | Details |
|--------|---------|
| **Threat** | Modifying attestation data after creation |
| **Mitigation** | SHA-256 hash covers all fields; on-chain immutability |
| **Assurance Level** | High |
| **Residual Risk** | None identified |

### 6. GitHub Action Workflow Spoofing

| Aspect | Details |
|--------|---------|
| **Threat** | Malicious workflow fakes approval status |
| **Mitigation** | `github.context.sha` from trusted runner environment |
| **Attack Vector** | Compromised CI runner, malicious Action dependency |
| **Assurance Level** | Medium |
| **Residual Risk** | Supply chain attack on GitHub Actions itself |

### 7. Malicious Approval Server

| Aspect | Details |
|--------|---------|
| **Threat** | `approval-url` points to attacker-controlled server returning fake "approved" |
| **Mitigation** | Server must return valid World ID proof (verified by World ID API) |
| **Recommendation** | Users should only use trusted approval URLs |
| **Assurance Level** | Medium (depends on server trust) |

### 8. Semantic Gap Attack (Out of Scope)

| Aspect | Details |
|--------|---------|
| **Threat** | Human approves without understanding the commit content |
| **Status** | Explicitly out of scope for cryptographic protocol |
| **Mitigation** | UI best practices (show commit details clearly) |
| **Recommendation** | Display commit diff, author, and description before approval |

### 9. Social Engineering / Coercion (Out of Scope)

| Aspect | Details |
|--------|---------|
| **Threat** | Human is tricked or coerced into approving |
| **Status** | Out of scope for cryptographic protocol |
| **Mitigation** | Organizational security policies, education |

### 10. Malicious Insider

| Aspect | Details |
|--------|---------|
| **Threat** | Authorized human intentionally approves malicious code |
| **Status** | Out of scope (human verified correctly, intent is malicious) |
| **Mitigation** | Multi-signature requirements, code review policies |

---

## Component-Specific Security Analysis

### Core Library (`packages/core/`)

#### Reviewed: 2024-12

| Finding | Severity | Status |
|---------|----------|--------|
| Canonical JSON serialization ensures deterministic hashing | ✅ Good | N/A |
| SHA-256 used for attestation hash | ✅ Good | N/A |
| Hash integrity verification in `validateAttestation()` | ✅ Good | N/A |
| `parseAttestation()` uses type assertion without runtime validation | ⚠️ Low | Documented |

**Recommendation**: Callers of `parseAttestation()` should call `validateAttestation()` on the result.

### GitHub Action (`packages/action/`)

#### Reviewed: 2024-12

| Finding | Severity | Status |
|---------|----------|--------|
| Uses `github.context.sha` (trusted source) | ✅ Good | N/A |
| Status API response not cryptographically verified | ⚠️ Medium | Documented |
| Depends on `approval-url` being trustworthy | ⚠️ Medium | Documented |

**Recommendation**:
- Only configure trusted `approval-url` values
- Future: Add on-chain verification of attestation in Action

### Smart Contract (`packages/contracts/`)

#### Reviewed: 2024-12

| Finding | Severity | Status |
|---------|----------|--------|
| Solidity 0.8.24 with built-in overflow protection | ✅ Good | N/A |
| No external calls (no reentrancy risk) | ✅ Good | N/A |
| Input validation on all parameters | ✅ Good | N/A |
| Duplicate approval check prevents same human approving same commit | ✅ Good | N/A |
| Unbounded loop in duplicate check could cause DoS | ⚠️ Low | Documented |
| Permissionless recording (anyone can call `recordAttestation`) | ℹ️ Info | By Design |
| Admin can revoke any attestation | ℹ️ Info | By Design |
| World ID proof not verified on-chain | ℹ️ Info | By Design (off-chain) |

**Note on Permissionless Design**: The contract intentionally allows anyone to record attestations. The security comes from:
1. World ID proof verification (off-chain)
2. Attestation hash uniqueness
3. Nullifier-based duplicate prevention

---

## ZK Proof Boundary Conditions

### World ID Proof Verification

| Parameter | Validation |
|-----------|------------|
| `proof` | Valid ZK-SNARK proof |
| `merkle_root` | Must be in valid root set |
| `nullifier_hash` | Derived from identity; unique per action scope |
| `signal` | Must match expected SHA256(repository:commit) |
| `external_nullifier` | App-specific action identifier |

### Edge Cases

1. **Expired Merkle Root**: World ID has a root expiration window. Old proofs may fail.
2. **Action Scope Change**: If `worldIdAction` changes, existing nullifiers don't apply.
3. **Signal Mismatch**: Commit SHA must exactly match; short SHA not accepted.

---

## Smart Contract Security

### Audit Status

| Contract | Auditor | Status | Report |
|----------|---------|--------|--------|
| PoHIRegistry.sol | - | Pending | - |

### Security Features

- **Access Control**: Owner-based administration for admin management
- **Reentrancy Protection**: No external calls in state-changing functions
- **Integer Overflow**: Solidity 0.8.x built-in checks
- **Nullifier Uniqueness**: Mapping prevents duplicate approvals per commit
- **Custom Errors**: Gas-efficient error handling

### Known Design Decisions

1. **Non-upgradeable**: Contracts cannot be upgraded (new versions = new addresses)
2. **Permissionless Recording**: Security relies on off-chain proof verification
3. **Admin Revocation**: Admins can revoke any attestation (for emergency response)

---

## Cryptographic Details

### Hash Algorithms

| Purpose | Algorithm | Implementation |
|---------|-----------|----------------|
| Attestation Hash (off-chain) | SHA-256 | Node.js `crypto` |
| Attestation Hash (on-chain) | Keccak-256 | Solidity native |
| Signal Hash | SHA-256 | Protocol standard |
| Commit Key | Keccak-256 | On-chain indexing |

### Why Two Hash Algorithms?

- **SHA-256**: Protocol standard, widely supported, interoperable
- **Keccak-256**: EVM native, gas efficient for on-chain operations

Both hashes are computed for each attestation to support both off-chain verification and on-chain storage.

---

## Dependency Security

### Key Dependencies

| Package | Purpose | Security Posture |
|---------|---------|------------------|
| `viem` | EVM interaction | Widely audited, maintained by Paradigm |
| `@worldcoin/idkit` | World ID integration | Maintained by Worldcoin Foundation |
| `@actions/core` | GitHub Actions SDK | Maintained by GitHub |
| `@actions/github` | GitHub API | Maintained by GitHub |

### Update Policy

- **Security patches**: Immediate update
- **Minor versions**: Weekly review
- **Major versions**: Compatibility testing required

---

## Security Recommendations for Users

### For Organizations Using PoHI

1. **Trust Your Approval Server**: Only use `approval-url` values you control or trust
2. **Require Orb Verification**: Use `verification-level: orb` for high-security workflows
3. **Complement with Code Review**: PoHI proves human approval, not code correctness
4. **Monitor Attestations**: Watch for unexpected approvals on your repositories
5. **Multi-Approver Policies**: Consider requiring multiple human approvals for critical changes

### For Individual Users

1. **Verify Commit Details**: Always check the commit SHA and repository before approving
2. **Secure Your World ID**: Protect your World ID credentials
3. **Report Suspicious Requests**: If asked to approve something unexpected, investigate first

---

## Bug Bounty

Coming soon. We plan to launch a bug bounty program after initial security audit.

### Preliminary Rewards (Subject to Change)

| Severity | Reward |
|----------|--------|
| Critical | Up to $10,000 |
| High | Up to $5,000 |
| Medium | Up to $1,000 |
| Low | Up to $200 |

---

## Security Checklist for Contributors

Before submitting a PR:

- [ ] No secrets or private keys in code
- [ ] Input validation for all user inputs
- [ ] No unsafe type assertions without validation
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] Tests cover security-critical paths
- [ ] Consider replay, Sybil, and tampering attacks

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2024-12 | Added detailed threat analysis, component review |
| 1.0 | 2024-12 | Initial security policy |

---

## Contact

- Security issues: security@pohi-protocol.org
- General questions: Open a GitHub Discussion
