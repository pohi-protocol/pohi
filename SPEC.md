# PoHI Protocol Specification v1.0

**Proof of Human Intent (PoHI)** - A protocol for cryptographically binding human approval to software artifacts.

> AI executes. Humans authorize. Machines verify.

## Overview

PoHI enables verified humans to create tamper-evident attestations that approve specific software changes (commits, PRs, deployments). These attestations can be verified off-chain or recorded on-chain for immutable audit trails.

## Design Principles

1. **Chain-neutral**: Core protocol uses SHA-256, no blockchain dependency
2. **Provider-agnostic**: Supports multiple Proof-of-Personhood (PoP) providers
3. **VCS-agnostic**: Works with GitHub, GitLab, Bitbucket, etc.
4. **Minimal dependencies**: Core library has zero runtime dependencies

## Attestation Structure

### HumanApprovalAttestation

```json
{
  "version": "1.0",
  "type": "HumanApprovalAttestation",
  "subject": {
    "repository": "owner/repo",
    "commit_sha": "abc123def456...",
    "action": "DEPLOY",
    "description": "Production deployment v2.1.0"
  },
  "human_proof": {
    "method": "world_id",
    "verification_level": "orb",
    "nullifier_hash": "0x...",
    "signal": "0x..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "attestation_hash": "0x..."
}
```

### Field Definitions

#### `version`
- Type: `string`
- Required: Yes
- Value: `"1.0"`

#### `type`
- Type: `string`
- Required: Yes
- Value: `"HumanApprovalAttestation"`

#### `subject`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repository` | string | Yes | Repository identifier (e.g., `owner/repo`) |
| `commit_sha` | string | Yes | Commit reference (SHA, tag, etc.) |
| `ref_number` | number | No | PR/MR number |
| `action` | string | Yes | Action type (see below) |
| `description` | string | No | Human-readable description |
| `metadata` | object | No | Additional key-value data |

**Known Actions**: `PR_MERGE`, `RELEASE`, `DEPLOY`, `GENERIC`
Custom actions are allowed for extensibility.

#### `human_proof`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method` | string | Yes | PoP provider identifier |
| `verification_level` | string | No | Provider-specific verification tier |
| `nullifier_hash` | string | Yes | Unique identifier per human per scope |
| `signal` | string | Yes | Bound signal (prevents replay) |
| `provider_proof` | object | No | Provider-specific proof data |

**Known Providers**: `world_id`, `gitcoin_passport`, `proof_of_humanity`, `civic`, `brightid`
Custom providers are allowed for extensibility.

#### `timestamp`
- Type: `string` (ISO 8601)
- Required: Yes
- Example: `"2024-01-15T10:30:00.000Z"`

#### `attestation_hash`
- Type: `string` (hex with 0x prefix)
- Required: No (computed automatically)
- Algorithm: SHA-256 of canonical JSON

## Hash Computation

### Protocol Standard (SHA-256)

The `attestation_hash` is computed using SHA-256 over the canonical JSON representation:

```
attestation_hash = SHA-256(canonicalize(attestation))
```

#### Canonicalization Rules

1. Include only these fields: `version`, `type`, `subject`, `human_proof`, `timestamp`
2. Order fields alphabetically within each object
3. Exclude `attestation_hash`, `chain_record`, `signature`
4. Use compact JSON (no whitespace)

#### Field Order

```
attestation: [version, type, subject, human_proof, timestamp]
subject: [repository, commit_sha, ref_number, action, description, metadata]
human_proof: [method, verification_level, nullifier_hash, signal, provider_proof]
```

### EVM Compatibility (Keccak-256)

For on-chain recording, use `@pohi-protocol/evm`:

```
evm_hash = keccak256(encodePacked(repository, commit_sha, nullifier_hash, signal, timestamp))
```

## Signal Computation

The signal binds the proof to a specific action:

```
signal = SHA-256(repository + ":" + commit_sha)
```

For World ID, pass this as the `signal` parameter to IDKit.

## Verification Flow

### Off-chain Verification

1. Parse attestation JSON
2. Validate structure (required fields, types)
3. Verify `attestation_hash` matches computed hash
4. Verify PoP proof with provider API (optional)

### On-chain Verification

1. Record attestation to smart contract
2. Contract validates:
   - Hash not previously recorded
   - Nullifier + commit combination unique (Sybil resistance)
3. Query contract for commit approval status

## Security Considerations

### Replay Prevention
- `nullifier_hash` ensures one approval per human per scope
- `signal` binds proof to specific commit

### Tamper Detection
- `attestation_hash` covers all critical fields
- Any modification invalidates the hash

### Sybil Resistance
- PoP providers ensure unique human identity
- On-chain recording prevents duplicate approvals

## Package Structure

```
@pohi-protocol/core   - Chain-neutral types and validation (no deps)
@pohi-protocol/evm    - EVM utilities (keccak256, encodePacked)
@pohi-protocol/sdk    - Chain interaction client
@pohi-protocol/action - GitHub Action
@pohi-protocol/cli    - Command-line tool
```

## Examples

### Minimal Attestation

```json
{
  "version": "1.0",
  "type": "HumanApprovalAttestation",
  "subject": {
    "repository": "acme/app",
    "commit_sha": "a1b2c3d4",
    "action": "DEPLOY"
  },
  "human_proof": {
    "method": "world_id",
    "nullifier_hash": "0x1234...",
    "signal": "0xabcd..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### With On-chain Record

```json
{
  "version": "1.0",
  "type": "HumanApprovalAttestation",
  "subject": {
    "repository": "acme/app",
    "commit_sha": "a1b2c3d4",
    "action": "RELEASE",
    "description": "v2.0.0 release"
  },
  "human_proof": {
    "method": "world_id",
    "verification_level": "orb",
    "nullifier_hash": "0x1234...",
    "signal": "0xabcd..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "attestation_hash": "0x5678...",
  "chain_record": {
    "chain_id": 480,
    "tx_hash": "0x9012...",
    "block_number": 12345678
  }
}
```

## Compatibility

### Supported PoP Providers

| Provider | Status | Verification Levels | Sybil Resistance |
|----------|--------|---------------------|------------------|
| World ID | Supported | `device`, `orb`, `secure_document` | High (Orb) |
| Gitcoin Passport | Types Ready | Score-based (15/25/35+) | Medium |
| Proof of Humanity | Types Ready | Binary (registered/not) | High |
| Civic | Types Ready | `uniqueness`, `liveness`, `id_verification` | Medium |
| BrightID | Types Ready | `meets`, `bitu` | Medium |

**Note**: "Types Ready" means the type definitions and utilities are available in `@pohi-protocol/core`. Full integration with provider APIs requires additional implementation.

### Supported Chains

| Chain | Chain ID | Status |
|-------|----------|--------|
| World Chain | 480 | Supported |
| World Chain Sepolia | 4801 | Supported |
| Ethereum | 1 | Planned |
| Optimism | 10 | Planned |

## Changelog

### v1.0 (Initial)
- SHA-256 based attestation hash
- World ID support
- EVM recording support
