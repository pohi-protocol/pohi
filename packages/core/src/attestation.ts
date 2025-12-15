import { keccak256, encodePacked, toHex } from 'viem'
import type {
  HumanApprovalAttestation,
  ApprovalSubject,
  HumanProof,
  WorldIDVerificationLevel,
} from './types'

/**
 * Create a new attestation from subject and proof
 */
export function createAttestation(
  subject: ApprovalSubject,
  proof: HumanProof
): HumanApprovalAttestation {
  const attestation: HumanApprovalAttestation = {
    version: '1.0',
    type: 'HumanApprovalAttestation',
    subject,
    human_proof: proof,
    timestamp: new Date().toISOString(),
  }

  // Compute deterministic hash
  attestation.attestation_hash = computeAttestationHash(attestation)

  return attestation
}

/**
 * Compute deterministic keccak256 hash of an attestation
 * This hash can be used for on-chain recording and verification
 */
export function computeAttestationHash(attestation: HumanApprovalAttestation): `0x${string}` {
  // Parse timestamp to Unix timestamp (seconds)
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
 * Validate attestation structure and hash integrity
 */
export function validateAttestation(attestation: HumanApprovalAttestation): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check version
  if (attestation.version !== '1.0') {
    errors.push(`Unknown version: ${attestation.version}`)
  }

  // Check type
  if (attestation.type !== 'HumanApprovalAttestation') {
    errors.push(`Invalid type: ${attestation.type}`)
  }

  // Check required subject fields
  if (!attestation.subject?.repository) {
    errors.push('Missing subject.repository')
  }
  if (!attestation.subject?.commit_sha) {
    errors.push('Missing subject.commit_sha')
  }
  if (!attestation.subject?.action) {
    errors.push('Missing subject.action')
  }

  // Validate action type
  const validActions = ['PR_MERGE', 'RELEASE', 'DEPLOY', 'GENERIC']
  if (attestation.subject?.action && !validActions.includes(attestation.subject.action)) {
    errors.push(`Invalid subject.action: ${attestation.subject.action}`)
  }

  // Check required human_proof fields
  if (!attestation.human_proof?.nullifier_hash) {
    errors.push('Missing human_proof.nullifier_hash')
  }
  if (!attestation.human_proof?.signal) {
    // Signal can be empty string, so just check it exists
    if (attestation.human_proof?.signal === undefined) {
      errors.push('Missing human_proof.signal')
    }
  }
  if (attestation.human_proof?.method !== 'world_id') {
    errors.push(`Unknown verification method: ${attestation.human_proof?.method}`)
  }

  // Check timestamp
  if (!attestation.timestamp) {
    errors.push('Missing timestamp')
  } else {
    const timestamp = new Date(attestation.timestamp)
    if (isNaN(timestamp.getTime())) {
      errors.push('Invalid timestamp format')
    }
  }

  // Verify hash integrity if present
  if (attestation.attestation_hash && errors.length === 0) {
    const computedHash = computeAttestationHash(attestation)
    if (computedHash !== attestation.attestation_hash) {
      errors.push('Hash mismatch - attestation data may have been tampered')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if an attestation is valid (simple boolean version)
 */
export function isValidAttestation(attestation: HumanApprovalAttestation): boolean {
  return validateAttestation(attestation).valid
}

/**
 * Convert verification level string to numeric value for on-chain storage
 */
export function verificationLevelToNumber(level: WorldIDVerificationLevel | string): number {
  const levelMap: Record<string, number> = {
    device: 0,
    orb: 1,
    secure_document: 2,
    document: 2,
  }
  return levelMap[level] ?? 0
}

/**
 * Convert numeric verification level to string
 */
export function numberToVerificationLevel(num: number): WorldIDVerificationLevel {
  const levels: WorldIDVerificationLevel[] = ['device', 'orb', 'secure_document']
  return levels[num] ?? 'device'
}

/**
 * Generate a unique key for an attestation (used for storage lookup)
 */
export function getAttestationKey(repository: string, commitSha: string): string {
  return `${repository}:${commitSha}`
}

/**
 * Convert commit SHA to bytes32 format for on-chain storage
 */
export function commitShaToBytes32(commitSha: string): `0x${string}` {
  // Pad the commit SHA to 32 bytes
  const cleanSha = commitSha.replace(/^0x/, '')
  const padded = cleanSha.padEnd(64, '0')
  return `0x${padded}` as `0x${string}`
}

/**
 * Serialize attestation to JSON string
 */
export function serializeAttestation(attestation: HumanApprovalAttestation): string {
  return JSON.stringify(attestation, null, 2)
}

/**
 * Parse attestation from JSON string
 */
export function parseAttestation(json: string): HumanApprovalAttestation {
  return JSON.parse(json) as HumanApprovalAttestation
}
