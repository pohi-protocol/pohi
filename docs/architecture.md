# PoHI Architecture

## Overview

Proof of Human Intent (PoHI) is a four-layer protocol for creating cryptographically verifiable records of human approval in software development workflows.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Proof of Human Intent (PoHI)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐       │
│    │   Layer 1   │      │   Layer 2   │      │   Layer 3   │       │
│    │  Identity   │ ───▶ │  Authority  │ ───▶ │ Attestation │       │
│    │  (World ID) │      │  (DID/VC)   │      │   (SCITT)   │       │
│    └─────────────┘      └─────────────┘      └─────────────┘       │
│          │                    │                    │                │
│          ▼                    ▼                    ▼                │
│    ┌─────────────────────────────────────────────────────────┐     │
│    │              Layer 4: Git Integration                    │     │
│    │         (GitHub Actions, Webhooks, Status API)          │     │
│    └─────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Layer 1: Identity (World ID)

**Purpose**: Verify the approver is a unique human using zero-knowledge proofs.

### Key Concepts

- **Proof of Personhood**: World ID uses iris biometrics to verify unique humans
- **Zero-Knowledge Proof**: Proves humanity without revealing identity
- **Nullifier Hash**: Prevents same human from approving multiple times (Sybil resistance)
- **Signal Binding**: Links proof to specific commit SHA

### Flow

```
User → World App → Scan QR → Generate ZK Proof → Verify on-chain/API
```

### Data

```json
{
  "method": "world_id",
  "verification_level": "orb",  // or "device"
  "nullifier_hash": "0x...",
  "merkle_root": "0x...",
  "proof": "..."
}
```

## Layer 2: Authority (DID/VC)

**Purpose**: Manage approval permissions using decentralized identifiers and verifiable credentials.

### DID Document

```json
{
  "id": "did:web:company.com:approvers:alice",
  "verificationMethod": [...],
  "worldIdBinding": {
    "nullifierHash": "0x...",
    "verificationLevel": "orb"
  }
}
```

### Verifiable Credential (Approval Authority)

```json
{
  "type": ["ApproverCredential"],
  "issuer": "did:web:company.com",
  "credentialSubject": {
    "id": "did:web:company.com:approvers:alice",
    "role": "senior_engineer",
    "approvalScope": {
      "repositories": ["org/repo-*"],
      "environments": ["staging", "production"]
    }
  }
}
```

## Layer 3: Attestation (SCITT)

**Purpose**: Record approval events in a tamper-evident transparency log.

### SCITT Compatibility

- Uses COSE_Sign1 envelope format
- Append-only Merkle tree for integrity
- Generates inclusion proofs (receipts)

### Attestation Structure

```json
{
  "version": "1.0",
  "type": "HumanApprovalAttestation",
  "subject": {
    "repository": "org/repo",
    "event": "PR_MERGE",
    "commit_sha": "abc123...",
    "pr_number": 42
  },
  "human_proof": {
    "method": "world_id",
    "verification_level": "orb",
    "nullifier_hash": "0x...",
    "signal": "abc123..."
  },
  "authority": {
    "did": "did:web:company.com:approvers:alice",
    "credential_ref": "vc:uuid:..."
  },
  "timestamp": "2025-12-15T10:30:00Z",
  "proof": {
    "type": "Ed25519Signature2020",
    "jws": "eyJ..."
  }
}
```

## Layer 4: Integration

### GitHub Integration

1. **Webhook**: Receives PR events
2. **Status API**: Updates PR status (pending → verified)
3. **Branch Protection**: Requires PoHI status check
4. **GitHub Action**: Automates verification flow

### Sequence

```
PR Created 
  → Webhook triggers PoHI service
  → Bot comments with approval link
  → Human scans World ID QR
  → ZK proof verified
  → Attestation created & logged
  → GitHub status updated
  → Merge enabled
```

## Security Properties

| Property | Mechanism |
|----------|-----------|
| Sybil Resistance | World ID nullifier hash |
| Replay Prevention | Commit SHA in signal |
| Tamper Evidence | Merkle tree proofs |
| Non-repudiation | Cryptographic signatures |
| Auditability | Append-only log |

## Implementation Options

### Minimum (MVP)

```
World ID → GitHub Action → Database
```

### Standard

```
World ID → Verifier Service → SCITT Log
    ↓
  DID/VC
```

### Enterprise

```
World ID → Verifier → SCITT → Blockchain Anchor
    ↓           ↓
  DID/VC    Policy Engine
```
