# @pohi-protocol/evm

EVM/blockchain utilities for Proof of Human Intent (PoHI).

## Installation

```bash
npm install @pohi-protocol/evm
```

## Features

- Keccak-256 hashing for on-chain storage
- EVM-compatible attestation conversion
- Utility functions for bytes32 handling
- Built on [viem](https://viem.sh)

## Usage

```typescript
import {
  computeEvmAttestationHash,
  computeEvmSignal,
  toEvmAttestation,
} from '@pohi-protocol/evm';

// Compute EVM-compatible hash
const evmHash = computeEvmAttestationHash(attestation);

// Convert for contract calls
const evmAttestation = toEvmAttestation(attestation);
```

## API

### `computeEvmAttestationHash(attestation)`

Computes keccak256 hash for on-chain storage.

### `computeEvmSignal(repository, commitSha)`

Computes keccak256 signal for World ID verification.

### `toEvmAttestation(attestation)`

Converts attestation to EVM-compatible format.

### `commitShaToBytes32(commitSha)`

Converts commit SHA to bytes32 format.

## License

Apache-2.0
