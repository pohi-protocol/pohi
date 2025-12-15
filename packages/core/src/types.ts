/**
 * PoHI Protocol Types
 * Chain-neutral type definitions for Proof of Human Intent
 */

// ============ Proof of Personhood (PoP) Provider Types ============

/**
 * Known PoP provider identifiers
 * Extensible - any string is valid for forward compatibility
 */
export const POP_PROVIDERS = {
  WORLD_ID: 'world_id',
  GITCOIN_PASSPORT: 'gitcoin_passport',
  PROOF_OF_HUMANITY: 'proof_of_humanity',
  CIVIC: 'civic',
  BRIGHTID: 'brightid',
} as const

export type KnownPoPProvider = typeof POP_PROVIDERS[keyof typeof POP_PROVIDERS]

/**
 * World ID verification levels (when using World ID provider)
 */
export type WorldIDVerificationLevel = 'orb' | 'device' | 'secure_document' | 'document'

/**
 * World ID specific proof data
 */
export interface WorldIDProof {
  merkle_root: string
  nullifier_hash: string
  proof: string
  verification_level: WorldIDVerificationLevel
}

// ============ Approval Subject Types ============

/**
 * Known approval action types
 * Extensible - any string is valid for forward compatibility
 */
export const APPROVAL_ACTIONS = {
  PR_MERGE: 'PR_MERGE',
  RELEASE: 'RELEASE',
  DEPLOY: 'DEPLOY',
  GENERIC: 'GENERIC',
} as const

export type KnownApprovalAction = typeof APPROVAL_ACTIONS[keyof typeof APPROVAL_ACTIONS]

/**
 * Approval subject - what is being approved
 * Designed to be VCS-agnostic (works with GitHub, GitLab, Bitbucket, etc.)
 */
export interface ApprovalSubject {
  /** Repository identifier (e.g., "owner/repo" for GitHub) */
  repository: string
  /** Commit reference (SHA, tag, or other identifier) */
  commit_sha: string
  /** Optional reference number (PR number, MR number, etc.) */
  ref_number?: number
  /** Type of action being approved */
  action: KnownApprovalAction | string
  /** Human-readable description */
  description?: string
  /** Additional metadata (extensible) */
  metadata?: Record<string, unknown>
}

// ============ Human Proof Types ============

/**
 * Human proof - evidence of human verification
 * Provider-agnostic design for extensibility
 */
export interface HumanProof {
  /**
   * PoP provider identifier (e.g., 'world_id', 'gitcoin_passport')
   * Use POP_PROVIDERS constants for known providers
   */
  method: KnownPoPProvider | string
  /** Provider-specific verification level or tier */
  verification_level?: string
  /**
   * Unique identifier for the human (per action scope)
   * Called "nullifier" in World ID, may have different names in other systems
   */
  nullifier_hash: string
  /** Signal that was bound to the proof (prevents replay) */
  signal: string
  /** Provider-specific proof data (optional, for on-chain verification) */
  provider_proof?: Record<string, unknown>
}

// ============ Chain Record Types ============

/**
 * On-chain record reference (optional)
 */
export interface ChainRecord {
  /** Chain identifier (e.g., 480 for World Chain) */
  chain_id: number
  /** Transaction hash */
  tx_hash: string
  /** Block number */
  block_number: number
  /** Contract address (optional) */
  contract_address?: string
}

// ============ Attestation Types ============

/**
 * PoHI Attestation document
 * The core data structure of the protocol
 */
export interface HumanApprovalAttestation {
  /** Schema version */
  version: '1.0'
  /** Document type identifier */
  type: 'HumanApprovalAttestation'
  /** What was approved */
  subject: ApprovalSubject
  /** Proof of human verification */
  human_proof: HumanProof
  /** ISO 8601 timestamp of attestation creation */
  timestamp: string
  /**
   * SHA-256 hash of canonical attestation (protocol standard)
   * Format: hex string with 0x prefix
   */
  attestation_hash?: string
  /** On-chain record reference (if recorded) */
  chain_record?: ChainRecord
  /** Optional cryptographic signature */
  signature?: {
    /** Signature algorithm (e.g., 'ES256', 'EdDSA') */
    algorithm: string
    /** Signature value (base64 or hex) */
    value: string
    /** Signer identifier (optional) */
    signer?: string
  }
}

// ============ API Response Types ============

/**
 * Verification API response
 */
export interface VerifyResponse {
  success: boolean
  attestation?: HumanApprovalAttestation
  error?: string
}

/**
 * Approval status for polling
 */
export interface ApprovalStatus {
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  attestation?: HumanApprovalAttestation
  error?: string
}

// ============ EVM Types (for @pohi-protocol/evm compatibility) ============

/**
 * On-chain attestation structure (matches EVM smart contract)
 * Note: This type is here for compatibility, but EVM-specific logic
 * should use @pohi-protocol/evm package
 */
export interface OnChainAttestation {
  attestationHash: `0x${string}`
  repository: string
  commitSha: `0x${string}`
  nullifierHash: `0x${string}`
  verificationLevel: number
  timestamp: bigint
  revoked: boolean
  recorder: `0x${string}`
}
