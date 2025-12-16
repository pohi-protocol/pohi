import { createHash } from 'crypto'
import type {
  HumanApprovalAttestation,
  ApprovalSubject,
  HumanProof,
  WorldIDVerificationLevel,
} from './types'
import { APPROVAL_ACTIONS, POP_PROVIDERS } from './types'

// ============ Canonicalization ============

/**
 * Canonical field order for attestation serialization
 * This ensures deterministic hash computation across implementations
 * Based on RFC 8785 (JSON Canonicalization Scheme) principles
 */
const CANONICAL_FIELD_ORDER = {
  attestation: ['version', 'type', 'subject', 'human_proof', 'timestamp'],
  subject: ['repository', 'commit_sha', 'ref_number', 'action', 'description', 'metadata'],
  human_proof: ['method', 'verification_level', 'nullifier_hash', 'signal', 'provider_proof'],
} as const

/**
 * Create canonical JSON representation of an attestation
 * Used for deterministic hash computation
 */
export function canonicalizeAttestation(attestation: HumanApprovalAttestation): string {
  const canonical: Record<string, unknown> = {}

  // Add fields in canonical order (only if present)
  for (const field of CANONICAL_FIELD_ORDER.attestation) {
    const value = attestation[field as keyof HumanApprovalAttestation]
    if (value !== undefined) {
      if (field === 'subject') {
        canonical[field] = canonicalizeObject(value as Record<string, unknown>, CANONICAL_FIELD_ORDER.subject)
      } else if (field === 'human_proof') {
        canonical[field] = canonicalizeObject(value as Record<string, unknown>, CANONICAL_FIELD_ORDER.human_proof)
      } else {
        canonical[field] = value
      }
    }
  }

  // Use JSON.stringify with sorted keys for nested objects
  return JSON.stringify(canonical, (_, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce((sorted: Record<string, unknown>, key) => {
        sorted[key] = value[key]
        return sorted
      }, {})
    }
    return value
  })
}

function canonicalizeObject(obj: Record<string, unknown>, fieldOrder: readonly string[]): Record<string, unknown> {
  const canonical: Record<string, unknown> = {}
  for (const field of fieldOrder) {
    if (obj[field] !== undefined) {
      canonical[field] = obj[field]
    }
  }
  return canonical
}

// ============ Hash Functions ============

/**
 * Compute SHA-256 hash of data
 * Returns hex string with 0x prefix
 */
export function sha256(data: string | Buffer): string {
  const hash = createHash('sha256').update(data).digest('hex')
  return `0x${hash}`
}

/**
 * Compute deterministic SHA-256 hash of an attestation
 * This is the protocol-standard hash used for attestation identification
 */
export function computeAttestationHash(attestation: HumanApprovalAttestation): string {
  const canonical = canonicalizeAttestation(attestation)
  return sha256(canonical)
}

/**
 * Compute signal hash (for binding proof to specific action)
 * Uses SHA-256 for protocol standard
 */
export function computeSignal(repository: string, commitSha: string): string {
  return sha256(`${repository}:${commitSha}`)
}

// ============ Attestation Creation ============

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

// ============ Validation ============

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

  // Validate action type (warn for unknown, but allow for extensibility)
  const knownActions = Object.values(APPROVAL_ACTIONS)
  if (attestation.subject?.action && !knownActions.includes(attestation.subject.action as typeof knownActions[number])) {
    // Unknown action is allowed but logged as info (not error)
    // This enables forward compatibility
  }

  // Check required human_proof fields
  if (!attestation.human_proof?.method) {
    errors.push('Missing human_proof.method')
  }
  if (!attestation.human_proof?.nullifier_hash) {
    errors.push('Missing human_proof.nullifier_hash')
  }
  if (attestation.human_proof?.signal === undefined) {
    errors.push('Missing human_proof.signal')
  }

  // Validate method (warn for unknown, but allow for extensibility)
  const knownProviders = Object.values(POP_PROVIDERS)
  if (attestation.human_proof?.method && !knownProviders.includes(attestation.human_proof.method as typeof knownProviders[number])) {
    // Unknown provider is allowed for extensibility
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

// ============ Utility Functions ============

/**
 * Convert verification level string to numeric value
 * Useful for on-chain storage or comparison
 */
export function verificationLevelToNumber(level: WorldIDVerificationLevel | string | undefined): number {
  const levelMap: Record<string, number> = {
    device: 0,
    orb: 1,
    secure_document: 2,
    document: 2,
  }
  return levelMap[level ?? ''] ?? 0
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
 * Serialize attestation to JSON string (canonical format)
 */
export function serializeAttestation(attestation: HumanApprovalAttestation): string {
  return canonicalizeAttestation(attestation)
}

/**
 * Serialize attestation to pretty-printed JSON (for display)
 */
export function serializeAttestationPretty(attestation: HumanApprovalAttestation): string {
  return JSON.stringify(attestation, null, 2)
}

/**
 * Parse attestation from JSON string
 */
export function parseAttestation(json: string): HumanApprovalAttestation {
  return JSON.parse(json) as HumanApprovalAttestation
}
