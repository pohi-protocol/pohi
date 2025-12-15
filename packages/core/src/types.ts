/**
 * World ID verification level type (compatible with IDKit v2)
 */
export type WorldIDVerificationLevel = 'orb' | 'device' | 'secure_document' | 'document'

/**
 * World ID proof from IDKit
 */
export interface WorldIDProof {
  merkle_root: string
  nullifier_hash: string
  proof: string
  verification_level: WorldIDVerificationLevel
}

/**
 * Approval subject - what is being approved
 */
export interface ApprovalSubject {
  /** Repository in format owner/repo */
  repository: string
  /** Git commit SHA */
  commit_sha: string
  /** Pull request number (optional) */
  pr_number?: number
  /** Type of action being approved */
  action: 'PR_MERGE' | 'RELEASE' | 'DEPLOY' | 'GENERIC'
  /** Human-readable description */
  description?: string
}

/**
 * Human proof details from World ID verification
 */
export interface HumanProof {
  /** Verification method used */
  method: 'world_id'
  /** Verification level achieved */
  verification_level: WorldIDVerificationLevel | string
  /** Unique identifier for the human (per action) */
  nullifier_hash: string
  /** Signal that was bound to the proof */
  signal: string
}

/**
 * On-chain record reference
 */
export interface ChainRecord {
  /** Chain ID (480 for World Chain, 4801 for World Chain Sepolia) */
  chain_id: number
  /** Transaction hash of the recording */
  tx_hash: string
  /** Block number where recorded */
  block_number: number
}

/**
 * The main attestation document
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
  /** Keccak256 hash of the attestation (deterministic) */
  attestation_hash?: string
  /** On-chain record reference (if recorded) */
  chain_record?: ChainRecord
  /** Optional cryptographic signature */
  signature?: {
    type: string
    jws: string
  }
}

/**
 * API response for verification
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

/**
 * On-chain attestation structure (matches smart contract)
 */
export interface OnChainAttestation {
  attestationHash: `0x${string}`
  repository: string
  commitSha: `0x${string}`
  nullifierHash: `0x${string}`
  verificationLevel: number // 0=device, 1=orb, 2=secure_document
  timestamp: bigint
  revoked: boolean
  recorder: `0x${string}`
}
