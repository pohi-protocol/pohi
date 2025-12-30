# PoHIRegistry Contract Specification

## Overview

The PoHIRegistry contract serves as an on-chain registry for Proof of Human Intent attestations. It stores attestations that link human identity verifications (via World ID or other PoP providers) to specific software commits.

## Contract Details

- **Name**: PoHIRegistry
- **Solidity Version**: ^0.8.24
- **License**: Apache-2.0
- **Network**: World Chain (Mainnet: 480, Sepolia: 4801)

---

## State Variables

### attestations

```solidity
mapping(bytes32 => Attestation) public attestations;
```

Maps attestation hash to attestation data. Primary storage for all attestations.

### commitAttestations

```solidity
mapping(bytes32 => bytes32[]) public commitAttestations;
```

Index mapping from commit key (`keccak256(repository, commitSha)`) to array of attestation hashes. Enables lookup of all attestations for a specific commit.

### nullifierAttestations

```solidity
mapping(bytes32 => bytes32[]) public nullifierAttestations;
```

Index mapping from nullifier hash to array of attestation hashes. Enables Sybil detection and tracking of approvals by the same human.

### admins

```solidity
mapping(address => bool) public admins;
```

Maps addresses to admin status. Admins can revoke any attestation.

### owner

```solidity
address public owner;
```

Contract owner address. Can manage admins and transfer ownership.

---

## Structs

### Attestation

```solidity
struct Attestation {
    bytes32 attestationHash;
    string repository;
    bytes32 commitSha;
    bytes32 nullifierHash;
    uint8 verificationLevel;
    uint256 timestamp;
    bool revoked;
    address recorder;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `attestationHash` | `bytes32` | Unique identifier for the attestation |
| `repository` | `string` | Repository identifier (e.g., "owner/repo") |
| `commitSha` | `bytes32` | Git commit SHA as bytes32 |
| `nullifierHash` | `bytes32` | World ID nullifier (unique per human per action) |
| `verificationLevel` | `uint8` | 0=Device, 1=Orb, 2+=Other providers |
| `timestamp` | `uint256` | Block timestamp when recorded |
| `revoked` | `bool` | Whether attestation has been revoked |
| `recorder` | `address` | Address that recorded the attestation |

---

## Events

### AttestationRecorded

```solidity
event AttestationRecorded(
    bytes32 indexed attestationHash,
    string repository,
    bytes32 indexed commitSha,
    bytes32 indexed nullifierHash,
    uint8 verificationLevel,
    address recorder
);
```

Emitted when a new attestation is successfully recorded.

### AttestationRevoked

```solidity
event AttestationRevoked(
    bytes32 indexed attestationHash,
    string reason,
    address revokedBy
);
```

Emitted when an attestation is revoked.

### AdminAdded

```solidity
event AdminAdded(address indexed admin);
```

Emitted when a new admin is added.

### AdminRemoved

```solidity
event AdminRemoved(address indexed admin);
```

Emitted when an admin is removed.

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

Emitted when ownership is transferred.

---

## Custom Errors

| Error | Description |
|-------|-------------|
| `AttestationAlreadyExists()` | Attestation with this hash already exists |
| `AttestationNotFound()` | No attestation found for given hash |
| `AttestationAlreadyRevoked()` | Attestation has already been revoked |
| `NotAuthorized()` | Caller lacks permission for this action |
| `InvalidInput()` | Input parameter is invalid (zero value) |
| `DuplicateApproval()` | Same nullifier already approved this commit |

---

## Functions

### recordAttestation

```solidity
function recordAttestation(
    bytes32 attestationHash,
    string calldata repository,
    bytes32 commitSha,
    bytes32 nullifierHash,
    uint8 verificationLevel
) external returns (bytes32)
```

Records a new attestation on-chain.

**Parameters:**
- `attestationHash`: Unique hash identifying this attestation
- `repository`: Repository identifier (e.g., "owner/repo")
- `commitSha`: Git commit SHA as bytes32
- `nullifierHash`: World ID nullifier hash
- `verificationLevel`: Verification level (0=Device, 1=Orb)

**Returns:** The attestation hash

**Reverts:**
- `InvalidInput()` if any parameter is zero/empty
- `AttestationAlreadyExists()` if attestation hash already exists
- `DuplicateApproval()` if same nullifier already approved this commit

**Gas:** ~270,000 (first attestation for commit), ~250,000 (subsequent)

---

### revokeAttestation

```solidity
function revokeAttestation(
    bytes32 attestationHash,
    string calldata reason
) external
```

Revokes an existing attestation.

**Parameters:**
- `attestationHash`: Hash of attestation to revoke
- `reason`: Human-readable reason for revocation

**Authorization:**
- Original recorder, OR
- Admin, OR
- Owner

**Reverts:**
- `AttestationNotFound()` if attestation doesn't exist
- `AttestationAlreadyRevoked()` if already revoked
- `NotAuthorized()` if caller lacks permission

**Gas:** ~30,000

---

### getAttestation

```solidity
function getAttestation(bytes32 attestationHash)
    external view returns (Attestation memory)
```

Retrieves attestation data by hash.

**Parameters:**
- `attestationHash`: Hash of attestation to retrieve

**Returns:** Attestation struct with all fields

**Reverts:**
- `AttestationNotFound()` if attestation doesn't exist

---

### isValidAttestation

```solidity
function isValidAttestation(bytes32 attestationHash)
    external view returns (bool)
```

Checks if an attestation is valid (exists and not revoked).

**Parameters:**
- `attestationHash`: Hash of attestation to check

**Returns:** `true` if attestation exists and is not revoked

---

### getAttestationsForCommit

```solidity
function getAttestationsForCommit(
    string calldata repository,
    bytes32 commitSha
) external view returns (bytes32[] memory)
```

Gets all attestation hashes for a specific commit.

**Parameters:**
- `repository`: Repository identifier
- `commitSha`: Commit SHA as bytes32

**Returns:** Array of attestation hashes

---

### getAttestationsForNullifier

```solidity
function getAttestationsForNullifier(bytes32 nullifierHash)
    external view returns (bytes32[] memory)
```

Gets all attestation hashes for a nullifier.

**Parameters:**
- `nullifierHash`: Nullifier hash to query

**Returns:** Array of attestation hashes

---

### hasValidAttestation

```solidity
function hasValidAttestation(
    string calldata repository,
    bytes32 commitSha
) external view returns (bool)
```

Checks if a commit has at least one valid attestation.

**Parameters:**
- `repository`: Repository identifier
- `commitSha`: Commit SHA as bytes32

**Returns:** `true` if commit has at least one non-revoked attestation

---

### getValidAttestationCount

```solidity
function getValidAttestationCount(
    string calldata repository,
    bytes32 commitSha
) external view returns (uint256 count)
```

Counts valid (non-revoked) attestations for a commit.

**Parameters:**
- `repository`: Repository identifier
- `commitSha`: Commit SHA as bytes32

**Returns:** Number of valid attestations

---

### addAdmin

```solidity
function addAdmin(address admin) external
```

Adds an admin address.

**Parameters:**
- `admin`: Address to grant admin privileges

**Authorization:** Owner only

**Reverts:**
- `NotAuthorized()` if caller is not owner
- `InvalidInput()` if admin is zero address

---

### removeAdmin

```solidity
function removeAdmin(address admin) external
```

Removes an admin address.

**Parameters:**
- `admin`: Address to revoke admin privileges

**Authorization:** Owner only

**Reverts:**
- `NotAuthorized()` if caller is not owner

---

### transferOwnership

```solidity
function transferOwnership(address newOwner) external
```

Transfers contract ownership.

**Parameters:**
- `newOwner`: Address of new owner

**Authorization:** Owner only

**Reverts:**
- `NotAuthorized()` if caller is not owner
- `InvalidInput()` if newOwner is zero address

---

## Invariants

### INV-1: Attestation Uniqueness
Each attestation hash maps to exactly one attestation.

```
∀ hash: attestations[hash].timestamp != 0 ⟹
  attestations[hash] is unique
```

### INV-2: Nullifier-Commit Uniqueness
A nullifier can only approve a specific commit once.

```
∀ commit, nullifier:
  count(attestations where commitKey == commit AND nullifierHash == nullifier) ≤ 1
```

### INV-3: Revocation Immutability
Once revoked, an attestation cannot be un-revoked.

```
∀ hash, t1, t2 where t1 < t2:
  attestations[hash].revoked @ t1 ⟹ attestations[hash].revoked @ t2
```

### INV-4: Index Consistency
All attestation hashes in index arrays exist in the main mapping.

```
∀ commitKey, i:
  commitAttestations[commitKey][i] ∈ keys(attestations)

∀ nullifier, i:
  nullifierAttestations[nullifier][i] ∈ keys(attestations)
```

---

## Security Properties

### SP-1: No Reentrancy
The contract makes no external calls, eliminating reentrancy risk.

### SP-2: Overflow Protection
Solidity 0.8.x provides built-in overflow protection for all arithmetic.

### SP-3: Access Control
- Recording: Permissionless (anyone can record)
- Revocation: Recorder OR Admin OR Owner
- Admin management: Owner only
- Ownership transfer: Owner only

### SP-4: Input Validation
All input parameters are validated:
- Zero values rejected for bytes32 fields
- Empty strings rejected for repository
- Zero address rejected for admin/owner

---

## Gas Costs (Estimates)

| Function | Gas (Typical) |
|----------|---------------|
| `recordAttestation` (first for commit) | ~275,000 |
| `recordAttestation` (with existing) | ~280,000 + n×5,000 |
| `revokeAttestation` | ~30,000 |
| `getAttestation` | ~5,000 |
| `isValidAttestation` | ~3,000 |
| `hasValidAttestation` | ~5,000 + n×3,000 |
| `getValidAttestationCount` | ~5,000 + n×3,000 |
| `addAdmin` | ~50,000 |
| `removeAdmin` | ~25,000 |
| `transferOwnership` | ~30,000 |

*n = number of attestations for the commit*

---

## Deployment

### Constructor

```solidity
constructor() {
    owner = msg.sender;
}
```

Sets deployer as initial owner. No admins by default.

### Deployed Addresses

| Network | Address | Explorer |
|---------|---------|----------|
| World Chain Sepolia | `0xe3aF97c1Eb0c1Bfa872059270a947e8A10FFD9d1` | [View](https://worldchain-sepolia.explorer.alchemy.com/address/0xe3af97c1eb0c1bfa872059270a947e8a10ffd9d1) |
| World Chain Mainnet | TBD | - |

---

## Upgrade Path

This contract is **non-upgradeable**. Future versions will be deployed to new addresses.

Migration strategy:
1. Deploy new contract version
2. (Optional) Export attestations via events
3. Import attestations to new contract
4. Update SDK/clients to new address
5. (Optional) Pause/disable old contract via admin functions
