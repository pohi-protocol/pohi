# pohi-sdk

SDK for interacting with the PoHI Registry on World Chain.

## Installation

```bash
npm install pohi-sdk
```

## Features

- Full client for World Chain interaction
- Record and verify attestations on-chain
- Query attestation status
- Built on [viem](https://viem.sh)

## Usage

```typescript
import { PoHIClient } from 'pohi-sdk';

// Create client (read-only)
const client = new PoHIClient({
  network: 'mainnet', // or 'sepolia'
});

// Check if commit has valid attestation
const hasAttestation = await client.hasValidAttestation(
  'owner/repo',
  'abc123...'
);

// With write access
const writeClient = new PoHIClient({
  network: 'sepolia',
  privateKey: '0x...',
});

// Record attestation on-chain
const txHash = await writeClient.recordAttestation(attestation);
```

## API

### `PoHIClient`

Main client class for interacting with the PoHI Registry.

#### Read Operations

- `getAttestation(hash)` - Get attestation by hash
- `isValidAttestation(hash)` - Check if attestation is valid
- `hasValidAttestation(repo, commit)` - Check if commit has valid attestation
- `getAttestationsForCommit(repo, commit)` - Get all attestations for commit

#### Write Operations

- `recordAttestation(attestation)` - Record attestation on-chain
- `revokeAttestation(hash, reason)` - Revoke an attestation

## License

Apache-2.0
