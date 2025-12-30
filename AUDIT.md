# Audit Documentation

This document provides information for external security auditors reviewing the PoHI (Proof of Human Intent) protocol.

## Table of Contents

1. [Overview](#overview)
2. [Audit Scope](#audit-scope)
3. [Architecture](#architecture)
4. [Smart Contract Specification](#smart-contract-specification)
5. [Cryptographic Design](#cryptographic-design)
6. [Known Design Decisions](#known-design-decisions)
7. [Test Coverage](#test-coverage)
8. [How to Reproduce](#how-to-reproduce)
9. [Contact](#contact)

---

## Overview

PoHI is a protocol that creates cryptographically verifiable proof that a real human approved critical software actions (like PR merges, deployments, or releases).

### Core Components

| Component | Location | Description |
|-----------|----------|-------------|
| Smart Contract | `packages/contracts/` | On-chain registry for attestations |
| Core Library | `packages/core/` | Types, validation, hashing (zero dependencies) |
| EVM Utilities | `packages/evm/` | EVM-specific conversions |
| SDK | `packages/sdk/` | Client for World Chain interaction |

---

## Audit Scope

### Primary Scope (High Priority)

| File | Lines | Description |
|------|-------|-------------|
| `packages/contracts/src/PoHIRegistry.sol` | ~290 | Main registry contract |

### Secondary Scope (Medium Priority)

| File | Lines | Description |
|------|-------|-------------|
| `packages/core/src/attestation.ts` | ~200 | Attestation creation and validation |
| `packages/core/src/verification/*.ts` | ~600 | PoP provider verifiers |
| `packages/evm/src/index.ts` | ~110 | EVM hash functions |
| `packages/sdk/src/client.ts` | ~250 | World Chain client |

### Out of Scope

- Demo application (`packages/demo/`)
- CI/CD integrations (`packages/action/`, `packages/gitlab-ci/`, `packages/bitbucket-pipe/`)
- Documentation and tests

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PoHI Protocol Flow                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. VERIFICATION          2. ATTESTATION          3. RECORDING     │
│   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐  │
│   │  World ID /  │  ──▶   │  pohi-core   │  ──▶   │PoHIRegistry  │  │
│   │  PoP Provider│        │ createAttest │        │ (on-chain)   │  │
│   └──────────────┘        └──────────────┘        └──────────────┘  │
│         │                        │                       │          │
│         ▼                        ▼                       ▼          │
│   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐  │
│   │  ZK Proof    │        │  SHA-256     │        │  Keccak-256  │  │
│   │  (nullifier) │        │  (off-chain) │        │  (on-chain)  │  │
│   └──────────────┘        └──────────────┘        └──────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Trust Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Trust Boundaries                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TRUSTED                    VERIFIED                    UNTRUSTED   │
│  ────────                   ────────                    ─────────   │
│  • World ID Orb             • Attestation hash          • User input│
│  • Blockchain finality      • Nullifier uniqueness      • API URLs  │
│  • CI runner environment    • ZK proof validity         • Off-chain │
│    (github.context.sha)                                   servers   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Specification

### PoHIRegistry.sol

**Solidity Version**: 0.8.24
**License**: Apache-2.0
**Deployed**: World Chain Sepolia (`0xe3aF97c1Eb0c1Bfa872059270a947e8A10FFD9d1`)

#### State Variables

```solidity
// Attestation storage
mapping(bytes32 => Attestation) public attestations;

// Index: commit key => attestation hashes
mapping(bytes32 => bytes32[]) public commitAttestations;

// Index: nullifier => attestation hashes (Sybil detection)
mapping(bytes32 => bytes32[]) public nullifierAttestations;

// Access control
mapping(address => bool) public admins;
address public owner;
```

#### Struct: Attestation

```solidity
struct Attestation {
    bytes32 attestationHash;      // Unique identifier
    string repository;            // e.g., "owner/repo"
    bytes32 commitSha;           // Git commit (as bytes32)
    bytes32 nullifierHash;       // World ID nullifier
    uint8 verificationLevel;     // 0=Device, 1=Orb, 2+=Other
    uint256 timestamp;           // Block timestamp
    bool revoked;                // Revocation status
    address recorder;            // Address that recorded
}
```

#### Functions

| Function | Access | Description |
|----------|--------|-------------|
| `recordAttestation()` | Public | Record new attestation |
| `revokeAttestation()` | Recorder/Admin/Owner | Revoke attestation |
| `getAttestation()` | View | Get attestation by hash |
| `isValidAttestation()` | View | Check if valid (exists + not revoked) |
| `getAttestationsForCommit()` | View | Get all attestations for a commit |
| `getAttestationsForNullifier()` | View | Get attestations by nullifier |
| `hasValidAttestation()` | View | Check if commit has valid attestation |
| `getValidAttestationCount()` | View | Count valid attestations for commit |
| `addAdmin()` | Owner | Add admin address |
| `removeAdmin()` | Owner | Remove admin address |
| `transferOwnership()` | Owner | Transfer contract ownership |

#### Input Validation

```solidity
// recordAttestation input checks
if (attestationHash == bytes32(0)) revert InvalidInput();
if (bytes(repository).length == 0) revert InvalidInput();
if (commitSha == bytes32(0)) revert InvalidInput();
if (nullifierHash == bytes32(0)) revert InvalidInput();
```

#### Duplicate Prevention

```solidity
// Same attestation hash
if (attestations[attestationHash].timestamp != 0) {
    revert AttestationAlreadyExists();
}

// Same human approving same commit (nullifier check)
bytes32 commitKey = keccak256(abi.encodePacked(repository, commitSha));
for (uint256 i = 0; i < existing.length; i++) {
    if (attestations[existing[i]].nullifierHash == nullifierHash) {
        revert DuplicateApproval();
    }
}
```

#### Events

```solidity
event AttestationRecorded(
    bytes32 indexed attestationHash,
    string repository,
    bytes32 indexed commitSha,
    bytes32 indexed nullifierHash,
    uint8 verificationLevel,
    address recorder
);

event AttestationRevoked(
    bytes32 indexed attestationHash,
    string reason,
    address revokedBy
);

event AdminAdded(address indexed admin);
event AdminRemoved(address indexed admin);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

#### Custom Errors

```solidity
error AttestationAlreadyExists();
error AttestationNotFound();
error AttestationAlreadyRevoked();
error NotAuthorized();
error InvalidInput();
error DuplicateApproval();
```

---

## Cryptographic Design

### Hash Functions

| Purpose | Algorithm | Location | Notes |
|---------|-----------|----------|-------|
| Attestation hash (off-chain) | SHA-256 | `pohi-core` | Protocol standard |
| Attestation hash (on-chain) | Keccak-256 | `pohi-evm` | EVM-native |
| Signal hash | SHA-256 | `pohi-core` | `SHA256(repository:commit_sha)` |
| Commit key | Keccak-256 | Contract | `keccak256(abi.encodePacked(repository, commitSha))` |

### Attestation Hash Computation (Off-chain)

```typescript
// pohi-core/src/attestation.ts
function computeAttestationHash(attestation: HumanApprovalAttestation): string {
  const canonical = canonicalizeAttestation(attestation)
  return sha256(canonical)
}

function canonicalizeAttestation(attestation: HumanApprovalAttestation): string {
  // Deterministic JSON serialization (sorted keys)
  const { attestation_hash, signature, ...rest } = attestation
  return JSON.stringify(rest, Object.keys(rest).sort())
}
```

### Attestation Hash Computation (On-chain)

```typescript
// pohi-evm/src/index.ts
function computeEvmAttestationHash(attestation: HumanApprovalAttestation): `0x${string}` {
  const timestamp = BigInt(Math.floor(new Date(attestation.timestamp).getTime() / 1000))

  return keccak256(
    encodePacked(
      ['string', 'string', 'string', 'string', 'uint256'],
      [
        attestation.subject.repository,
        attestation.subject.commit_sha,
        attestation.human_proof.nullifier_hash,
        attestation.human_proof.signal,
        timestamp,
      ]
    )
  )
}
```

### Signal Computation

```typescript
// pohi-core/src/attestation.ts
function computeSignal(repository: string, commitSha: string): string {
  return sha256(`${repository}:${commitSha}`)
}
```

---

## Known Design Decisions

### 1. Permissionless Recording

**Decision**: Anyone can call `recordAttestation()` without access control.

**Rationale**:
- Security comes from World ID proof verification (off-chain)
- Attestation hash uniqueness prevents duplicates
- Nullifier prevents same human approving same commit twice
- Off-chain verification is cheaper and more flexible

**Trade-off**: Relies on off-chain verification being performed correctly.

### 2. Dual Hash System

**Decision**: Use SHA-256 off-chain and Keccak-256 on-chain.

**Rationale**:
- SHA-256 is widely supported for interoperability
- Keccak-256 is EVM-native and gas-efficient
- Both hashes are stored/computed for each attestation

### 3. Admin Revocation

**Decision**: Admins/owner can revoke any attestation.

**Rationale**:
- Emergency response capability
- Handle fraudulent attestations
- Regulatory compliance

**Risk**: Admin key compromise could revoke legitimate attestations.

### 4. Non-Upgradeable Contract

**Decision**: Contract is not upgradeable.

**Rationale**:
- Simpler security model
- Immutable rules
- New versions deploy to new addresses

**Trade-off**: Cannot fix bugs without migration.

### 5. Unbounded Loop in Duplicate Check

**Decision**: Loop through all attestations for a commit to check nullifiers.

**Rationale**:
- Simpler implementation
- Expected low number of attestations per commit (< 10)

**Risk**: DoS if many attestations exist for same commit. Gas cost grows linearly.

**Mitigation**: Practical limit through gas costs; monitoring recommended.

---

## Test Coverage

### Smart Contract Tests

**Location**: `packages/contracts/test/PoHIRegistry.t.sol`
**Framework**: Foundry
**Test Count**: 39 tests

| Category | Tests | Status |
|----------|-------|--------|
| Recording attestations | 8 | ✅ Pass |
| Input validation | 4 | ✅ Pass |
| Duplicate prevention | 3 | ✅ Pass |
| Revocation | 7 | ✅ Pass |
| Query functions | 6 | ✅ Pass |
| Admin management | 6 | ✅ Pass |
| Ownership | 5 | ✅ Pass |

### TypeScript Tests

**Framework**: Vitest

| Package | Tests | Coverage |
|---------|-------|----------|
| `pohi-core` | 142 | ~96% |
| `pohi-sdk` | 48 | ~100% |
| `pohi-evm` | 24 | ~100% |

---

## How to Reproduce

### Prerequisites

```bash
# Node.js 18+
node --version

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Run All Tests

```bash
# Clone repository
git clone https://github.com/pohi-protocol/pohi.git
cd pohi

# Install dependencies
npm ci

# Build packages
npm run build

# Run all tests
npm test

# Run contract tests specifically
cd packages/contracts
forge test -vv
```

### Verify Deployed Contract

```bash
# World Chain Sepolia
cast call 0xe3aF97c1Eb0c1Bfa872059270a947e8A10FFD9d1 \
  "owner()" \
  --rpc-url https://worldchain-sepolia.g.alchemy.com/public
```

### Generate Coverage Report

```bash
# TypeScript coverage
npm run test:coverage

# Solidity coverage
cd packages/contracts
forge coverage
```

---

## Security Checklist for Auditors

### Smart Contract

- [ ] Reentrancy vulnerabilities (note: no external calls)
- [ ] Integer overflow/underflow (note: Solidity 0.8.x)
- [ ] Access control bypass
- [ ] Front-running vulnerabilities
- [ ] DoS via unbounded loops
- [ ] Event emission correctness
- [ ] Storage collisions

### Cryptographic

- [ ] Hash collision resistance
- [ ] Timing attacks in hash computation
- [ ] Deterministic serialization
- [ ] Signal binding correctness

### Business Logic

- [ ] Duplicate attestation prevention
- [ ] Nullifier uniqueness enforcement
- [ ] Revocation authorization
- [ ] Admin privilege escalation

---

## Contact

- **Security Issues**: ikko.ashimine@i-tec.ltd
- **GitHub Issues**: [pohi-protocol/pohi](https://github.com/pohi-protocol/pohi/issues)
- **Audit Questions**: Open a private security advisory on GitHub

---

## Appendix: File Hashes

For verification, here are SHA-256 hashes of critical files at v0.1.0:

```
packages/contracts/src/PoHIRegistry.sol
packages/core/src/attestation.ts
packages/core/src/types.ts
packages/evm/src/index.ts
packages/sdk/src/client.ts
```

*(To be updated after audit completion)*
