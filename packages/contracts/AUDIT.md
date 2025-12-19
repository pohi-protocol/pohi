# PoHI Registry - Audit Preparation

## Overview

**Contract**: PoHIRegistry.sol
**Solidity Version**: ^0.8.24
**License**: Apache-2.0
**Lines of Code**: ~290

## Purpose

The PoHI Registry is an on-chain registry for storing human approval attestations. It links World ID verifications to software commits, enabling verifiable proof that a human approved a specific action.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     PoHIRegistry                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Storage:                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ attestations: hash → Attestation                 │   │
│  │ commitAttestations: commitKey → hash[]           │   │
│  │ nullifierAttestations: nullifier → hash[]        │   │
│  │ admins: address → bool                           │   │
│  │ owner: address                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Functions:                                              │
│  ├── recordAttestation()    [public]                    │
│  ├── revokeAttestation()    [recorder/admin/owner]      │
│  ├── getAttestation()       [view]                      │
│  ├── isValidAttestation()   [view]                      │
│  ├── hasValidAttestation()  [view]                      │
│  ├── addAdmin()             [owner]                     │
│  ├── removeAdmin()          [owner]                     │
│  └── transferOwnership()    [owner]                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Data Structures

### Attestation

```solidity
struct Attestation {
    bytes32 attestationHash;      // Unique identifier
    string repository;            // e.g., "owner/repo"
    bytes32 commitSha;            // Git commit reference
    bytes32 nullifierHash;        // World ID nullifier
    uint8 verificationLevel;      // 0=Device, 1=Orb
    uint256 timestamp;            // Block timestamp
    bool revoked;                 // Revocation status
    address recorder;             // Who recorded this
}
```

## Security Considerations

### Access Control

| Function | Access | Notes |
|----------|--------|-------|
| `recordAttestation` | Anyone | Permissionless recording |
| `revokeAttestation` | Recorder / Admin / Owner | Only authorized parties |
| `addAdmin` | Owner | Owner-only |
| `removeAdmin` | Owner | Owner-only |
| `transferOwnership` | Owner | Owner-only |

### Invariants

1. **Unique Attestation**: Each `attestationHash` can only be recorded once
2. **No Duplicate Approval**: Same `nullifierHash` cannot approve same commit twice
3. **Immutable Data**: Once recorded, attestation data (except `revoked`) cannot change
4. **Revocation Finality**: Revoked attestations cannot be un-revoked

### Attack Vectors Considered

| Attack | Mitigation | Location |
|--------|------------|----------|
| **Duplicate Recording** | Check `attestations[hash].timestamp != 0` | L108 |
| **Sybil Approval** | Check nullifier per commit | L115-119 |
| **Unauthorized Revocation** | Check msg.sender authorization | L158 |
| **Zero Input** | Validate all inputs | L102-105 |
| **Reentrancy** | No external calls | N/A |
| **Integer Overflow** | Solidity 0.8.x checks | Built-in |

### Gas Considerations

| Operation | Estimated Gas | Notes |
|-----------|---------------|-------|
| `recordAttestation` | ~150,000 | Depends on existing attestations |
| `revokeAttestation` | ~30,000 | Simple state change |
| `getAttestation` | ~5,000 | View function |
| `hasValidAttestation` | ~10,000+ | Loops through attestations |

**Note**: `hasValidAttestation` and `getValidAttestationCount` loop through all attestations for a commit. This could become expensive if many attestations exist for a single commit. Consider adding pagination or limits in future versions.

## Known Limitations

1. **No On-chain World ID Verification**: The contract trusts the caller to provide valid World ID proofs. Full verification would require integration with World ID contracts.

2. **Unbounded Arrays**: `commitAttestations` and `nullifierAttestations` can grow without limit. This is acceptable for the expected use case but could be an issue at scale.

3. **String Storage**: `repository` is stored as a string, which is more expensive than bytes32. This is intentional for readability.

4. **No Batch Operations**: Recording/revoking must be done one at a time.

5. **Centralized Admin**: Owner has significant power (add/remove admins, revoke any attestation via admin).

## Test Coverage

See `test/PoHIRegistry.t.sol` for comprehensive tests covering:

- [x] Basic recording and retrieval
- [x] Duplicate attestation prevention
- [x] Duplicate approval (same nullifier) prevention
- [x] Revocation by recorder
- [x] Revocation by admin
- [x] Revocation by owner
- [x] Unauthorized revocation rejection
- [x] Input validation
- [x] Admin management
- [x] Ownership transfer
- [x] Query functions

## Deployment

### Target Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| World Chain Mainnet | 480 | Planned |
| World Chain Sepolia | 4801 | Planned |

### Deployment Parameters

No constructor parameters required.

### Post-Deployment

1. Verify contract on explorer
2. Transfer ownership to multisig (if applicable)
3. Add initial admins (if any)

## Audit Scope

### In Scope

- `src/PoHIRegistry.sol` - All functions and storage
- `test/PoHIRegistry.t.sol` - Test coverage validation

### Out of Scope

- Deployment scripts
- Off-chain components
- World ID integration (separate system)

## Questions for Auditors

1. Is the duplicate approval check (L115-119) gas-efficient for expected usage?
2. Should we add a maximum limit to attestations per commit?
3. Is the access control model appropriate for the use case?
4. Any recommendations for future upgradeability without proxy patterns?

## Contact

For audit inquiries: security@pohi-protocol.org
