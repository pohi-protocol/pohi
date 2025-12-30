# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: **ikko.ashimine@i-tec.ltd** (or open a private security advisory on GitHub)

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
| GitLab CI Component | `packages/gitlab-ci/src/` |
| Bitbucket Pipe | `packages/bitbucket-pipe/src/` |

### Out of Scope

- Third-party dependencies (report to upstream)
- Demo application (`packages/demo/`)
- Documentation websites

---

## Self-Review Summary (2025-01)

This security self-review was conducted to identify potential vulnerabilities and document the security posture of PoHI before public release.

### Review Scope

| Area | Status | Notes |
|------|--------|-------|
| Threat Model | ✅ Documented | 10 threat categories analyzed |
| Core Library | ✅ Reviewed | Deterministic hashing, type validation |
| Smart Contract | ✅ Reviewed | No external calls, overflow protection |
| GitHub Action | ✅ Reviewed | Trusted context, URL trust documented |
| GitLab CI | ✅ Reviewed | Token scoping, URL trust documented |
| Bitbucket Pipe | ✅ Reviewed | Docker isolation, token scoping |
| ZK Proof Boundaries | ✅ Documented | Edge cases identified |
| Cryptographic Design | ✅ Documented | SHA-256/Keccak-256 usage explained |
| Dependency Audit | ✅ Reviewed | Key dependencies documented |

### Open Items

| Item | Priority | Status |
|------|----------|--------|
| External smart contract audit | High | Planned |
| Formal verification of ZK circuits | Medium | Not planned (uses World ID's verified circuits) |
| Penetration testing | Medium | Planned post-launch |
| Bug bounty program | Medium | Planned |

### Key Findings Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | - |
| High | 0 | - |
| Medium | 5 | All documented with mitigations |
| Low | 2 | All documented |
| Informational | 4 | By design |

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

## Concrete Attack Scenarios

### Scenario 1: Stolen World ID Approval

**Attack**: Attacker steals victim's phone with World App and approves malicious commit.

```
Attacker → Steals phone → Opens World App → Scans approval QR → Malicious code deployed
```

**Analysis**:
- PoHI correctly records that "a human approved" the commit
- The human verification is technically valid
- This is a **credential theft** issue, not a protocol flaw

**Mitigations**:
- World App biometric lock (FaceID/fingerprint)
- Device-level security (passcode)
- Organization policy: require multiple approvers for production

**Residual Risk**: Accepted (same as any credential-based system)

---

### Scenario 2: Malicious CI Runner

**Attack**: Compromised CI runner reports fake `GITHUB_SHA` / `CI_COMMIT_SHA`.

```
Attacker → Compromises self-hosted runner → Modifies environment → Reports wrong SHA
```

**Analysis**:
- If runner is compromised, attacker controls the environment
- PoHI would record approval for the **wrong commit**
- This is a **supply chain attack** on CI infrastructure

**Mitigations**:
- Use GitHub/GitLab hosted runners (trusted environment)
- Runner hardening and monitoring
- Compare attestation SHA with actual deployed code

**Residual Risk**: Medium (depends on runner security)

---

### Scenario 3: Approval Server MITM

**Attack**: Attacker intercepts traffic to approval server and injects fake "approved" response.

```
CI Job → HTTPS request → Attacker MITM → Fake "approved" response → CI proceeds
```

**Analysis**:
- Requires breaking TLS (unlikely) or DNS hijacking
- Even if successful, no valid World ID proof exists
- On-chain verification would fail

**Mitigations**:
- HTTPS enforced for approval URLs
- Certificate pinning (future enhancement)
- On-chain attestation verification

**Residual Risk**: Low (requires significant infrastructure compromise)

---

### Scenario 4: Replay Attack Across Repos

**Attack**: Use approval from Repo A to authorize deploy in Repo B.

```
Attacker → Gets approval for repo-a:abc123 → Tries to use for repo-b:abc123
```

**Analysis**:
- Signal = SHA256("repo-a:abc123") ≠ SHA256("repo-b:abc123")
- ZK proof is bound to specific signal
- Verification would fail

**Result**: ✅ Attack prevented by protocol design

---

### Scenario 5: Race Condition Double-Deploy

**Attack**: Two deployments try to use same approval simultaneously.

```
Deploy Job 1 → Checks approval → ✓
Deploy Job 2 → Checks approval → ✓ (same attestation)
Both deploy simultaneously
```

**Analysis**:
- This is **not** a security issue (same approval used twice is fine)
- The approval is for a specific commit, deploying it twice is valid
- If this is undesired, use on-chain nullifier check

**Mitigations**:
- On-chain recording marks attestation as "used"
- CI job should mark approval as consumed after use

**Residual Risk**: Low (depends on use case)

---

### Scenario 6: Nullifier Reuse Attack

**Attack**: Same human tries to approve same commit twice (double voting).

```
Human A → Approves commit X → Recorded with nullifier N
Human A → Tries to approve commit X again → Same nullifier N
```

**Analysis**:
- Contract checks: `nullifierUsed[commitKey][nullifierHash]`
- Second attempt would fail: `AlreadyApproved()`

**Result**: ✅ Attack prevented by nullifier uniqueness

---

## Component-Specific Security Analysis

### Core Library (`packages/core/`)

#### Reviewed: 2025-01

| Finding | Severity | Status |
|---------|----------|--------|
| Canonical JSON serialization ensures deterministic hashing | ✅ Good | N/A |
| SHA-256 used for attestation hash | ✅ Good | N/A |
| Hash integrity verification in `validateAttestation()` | ✅ Good | N/A |
| `parseAttestation()` uses type assertion without runtime validation | ⚠️ Low | Documented |

**Recommendation**: Callers of `parseAttestation()` should call `validateAttestation()` on the result.

### GitHub Action (`packages/action/`)

#### Reviewed: 2025-01

| Finding | Severity | Status |
|---------|----------|--------|
| Uses `github.context.sha` (trusted source) | ✅ Good | N/A |
| Status API response not cryptographically verified | ⚠️ Medium | Documented |
| Depends on `approval-url` being trustworthy | ⚠️ Medium | Documented |

**Recommendation**:
- Only configure trusted `approval-url` values
- Future: Add on-chain verification of attestation in Action

### Smart Contract (`packages/contracts/`)

#### Reviewed: 2025-01

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

### GitLab CI Component (`packages/gitlab-ci/`)

#### Reviewed: 2025-01

| Finding | Severity | Status |
|---------|----------|--------|
| Uses `CI_COMMIT_SHA` from GitLab CI environment (trusted) | ✅ Good | N/A |
| Uses `CI_JOB_TOKEN` or custom `GITLAB_TOKEN` for API auth | ✅ Good | N/A |
| Status API response not cryptographically verified | ⚠️ Medium | Documented |
| Depends on `POHI_APPROVAL_URL` being trustworthy | ⚠️ Medium | Documented |
| MR notes expose approval URL (information disclosure) | ℹ️ Info | By Design |

**Recommendations**:
- Only configure trusted `POHI_APPROVAL_URL` values
- Use `CI_JOB_TOKEN` where possible (limited scope)
- For custom tokens, use minimal required permissions

### Bitbucket Pipe (`packages/bitbucket-pipe/`)

#### Reviewed: 2025-01

| Finding | Severity | Status |
|---------|----------|--------|
| Uses `BITBUCKET_COMMIT` from Pipelines environment (trusted) | ✅ Good | N/A |
| Requires `BITBUCKET_TOKEN` with repository write access | ⚠️ Medium | Documented |
| Status API response not cryptographically verified | ⚠️ Medium | Documented |
| Depends on `POHI_APPROVAL_URL` being trustworthy | ⚠️ Medium | Documented |
| Runs in Docker container (isolated environment) | ✅ Good | N/A |

**Recommendations**:
- Create App Password with minimal scopes (`repository:write`, `pullrequest:write`)
- Only configure trusted `POHI_APPROVAL_URL` values
- Store `BITBUCKET_TOKEN` as secured repository variable

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

## Verification Status

### Protocol Verification

| Component | Method | Status | Date |
|-----------|--------|--------|------|
| World ID Integration | Manual testing with Orb verification | ✅ Verified | 2025-01 |
| Attestation Hashing | Unit tests (deterministic output) | ✅ Verified | 2025-01 |
| Nullifier Uniqueness | Unit tests + manual testing | ✅ Verified | 2025-01 |
| Signal Binding | Unit tests | ✅ Verified | 2025-01 |
| On-chain Recording | Testnet deployment | ✅ Verified | 2025-01 |

### Test Coverage

| Package | Coverage | Critical Paths |
|---------|----------|----------------|
| `pohi-core` | 96% | ✅ All covered |
| `pohi-sdk` | 100% | ✅ All covered |
| `pohi-evm` | 100% | ✅ All covered |
| Smart Contracts | Foundry tests | ✅ All covered |

### Proof of Personhood Providers

| Provider | Status | Notes |
|----------|--------|-------|
| World ID (Orb) | ✅ Tested | Primary provider, production-ready |
| World ID (Device) | ✅ Tested | Lower assurance level |
| Gitcoin Passport | ✅ Tested | API v2 verified (2025-01), Score: 54.33 |
| BrightID | 🔧 Implemented | API integration complete |
| Civic | 🔧 Implemented | Gateway integration complete |
| Proof of Humanity | 🔧 Implemented | Subgraph integration complete |

### CI/CD Platform Verification

| Platform | Status | Notes |
|----------|--------|-------|
| GitHub Actions | ✅ Tested | Production-ready |
| GitLab CI | 🔧 Implemented | Ready for testing |
| Bitbucket Pipelines | 🔧 Implemented | Ready for testing |

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
| 1.2 | 2025-01 | Added GitLab CI/Bitbucket Pipe, self-review summary, attack scenarios |
| 1.1 | 2024-12 | Added detailed threat analysis, component review |
| 1.0 | 2024-12 | Initial security policy |

---

## Contact

- Security issues: ikko.ashimine@i-tec.ltd
- General questions: Open a GitHub Discussion
