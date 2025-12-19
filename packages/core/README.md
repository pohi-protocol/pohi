# @pohi-protocol/core

Chain-neutral core library for Proof of Human Intent (PoHI).

## Installation

```bash
npm install @pohi-protocol/core
```

## Features

- Zero runtime dependencies
- Chain-neutral types and validation
- SHA-256 based attestation hashing
- Full TypeScript support

## Usage

```typescript
import {
  createAttestation,
  computeSignal,
  validateAttestation,
} from '@pohi-protocol/core';

// Create an attestation
const attestation = createAttestation(
  {
    repository: 'owner/repo',
    commit_sha: 'abc123...',
    action: 'DEPLOY',
  },
  {
    method: 'world_id',
    verification_level: 'orb',
    nullifier_hash: '0x...',
    signal: computeSignal('owner/repo', 'abc123...'),
  }
);

// Validate
const result = validateAttestation(attestation);
console.log(result.valid); // true
```

## API

### `createAttestation(subject, proof)`

Creates a new attestation with computed hash.

### `validateAttestation(attestation)`

Validates attestation structure and hash integrity.

### `computeSignal(repository, commitSha)`

Computes SHA-256 signal hash for binding proof to action.

### `computeAttestationHash(attestation)`

Computes SHA-256 hash of canonical attestation.

## License

Apache-2.0
