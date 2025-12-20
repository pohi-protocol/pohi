/**
 * @pohi-protocol/evm
 *
 * EVM/blockchain utilities for Proof of Human Intent (PoHI)
 * Use this package for on-chain attestation recording and verification
 */

import { keccak256, encodePacked, toHex, toBytes } from 'viem'
import type { HumanApprovalAttestation } from 'pohi-core'
import { verificationLevelToNumber } from 'pohi-core'

// ============ Re-export viem utilities ============

export { keccak256, encodePacked, toHex, toBytes } from 'viem'

// ============ EVM Hash Functions ============

/**
 * Compute EVM-compatible keccak256 hash of an attestation
 * Use this hash for on-chain recording (different from protocol-standard SHA-256)
 */
export function computeEvmAttestationHash(attestation: HumanApprovalAttestation): `0x${string}` {
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

/**
 * Compute EVM-compatible signal hash
 * Use this for World ID verification when recording on-chain
 */
export function computeEvmSignal(repository: string, commitSha: string): `0x${string}` {
  return keccak256(
    encodePacked(
      ['string', 'string'],
      [repository, commitSha]
    )
  )
}

// ============ Conversion Utilities ============

/**
 * Convert commit SHA to bytes32 format for on-chain storage
 */
export function commitShaToBytes32(commitSha: string): `0x${string}` {
  const cleanSha = commitSha.replace(/^0x/, '')
  const padded = cleanSha.padEnd(64, '0')
  return `0x${padded}` as `0x${string}`
}

/**
 * Convert nullifier hash string to bytes32
 */
export function nullifierToBytes32(nullifier: string): `0x${string}` {
  if (nullifier.startsWith('0x')) {
    return nullifier as `0x${string}`
  }
  return `0x${nullifier}` as `0x${string}`
}

/**
 * Convert attestation to EVM-compatible format for contract calls
 */
export function toEvmAttestation(attestation: HumanApprovalAttestation): {
  attestationHash: `0x${string}`
  repository: string
  commitSha: `0x${string}`
  nullifierHash: `0x${string}`
  verificationLevel: number
  timestamp: bigint
} {
  return {
    attestationHash: computeEvmAttestationHash(attestation),
    repository: attestation.subject.repository,
    commitSha: commitShaToBytes32(attestation.subject.commit_sha),
    nullifierHash: nullifierToBytes32(attestation.human_proof.nullifier_hash),
    verificationLevel: verificationLevelToNumber(attestation.human_proof.verification_level),
    timestamp: BigInt(Math.floor(new Date(attestation.timestamp).getTime() / 1000)),
  }
}

// ============ Type Guards ============

/**
 * Check if a string is a valid hex string with 0x prefix
 */
export function isHexString(value: string): value is `0x${string}` {
  return /^0x[0-9a-fA-F]*$/.test(value)
}

/**
 * Check if a string is a valid bytes32
 */
export function isBytes32(value: string): value is `0x${string}` {
  return /^0x[0-9a-fA-F]{64}$/.test(value)
}
