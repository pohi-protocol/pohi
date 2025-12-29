// World ID verification level type (compatible with IDKit v2)
export type WorldIDVerificationLevel = 'orb' | 'device' | 'secure_document' | 'document'

// World ID verification types
export interface WorldIDProof {
  merkle_root: string
  nullifier_hash: string
  proof: string
  verification_level: WorldIDVerificationLevel
}

// Approval subject (what is being approved)
export interface ApprovalSubject {
  repository?: string
  commit_sha?: string
  pr_number?: number
  action: 'PR_MERGE' | 'RELEASE' | 'DEPLOY' | 'GENERIC'
  description?: string
}

// Human proof details
export interface HumanProof {
  method: 'world_id'
  verification_level: WorldIDVerificationLevel | string
  nullifier_hash: string
  signal: string
}

// The main attestation document
export interface HumanApprovalAttestation {
  version: '1.0'
  type: 'HumanApprovalAttestation'
  subject: ApprovalSubject
  human_proof: HumanProof
  timestamp: string
  /** SHA-256 hash of canonical attestation (protocol standard) */
  attestation_hash?: string
  signature?: {
    type: string
    jws: string
  }
}

// API response types
export interface VerifyResponse {
  success: boolean
  attestation?: HumanApprovalAttestation
  error?: string
}

// Re-export IDKit types for convenience
// ISuccessResult is now imported from @worldcoin/idkit directly
