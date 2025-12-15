// Types
export type {
  WorldIDVerificationLevel,
  WorldIDProof,
  ApprovalSubject,
  HumanProof,
  ChainRecord,
  HumanApprovalAttestation,
  VerifyResponse,
  ApprovalStatus,
  OnChainAttestation,
} from './types'

// Attestation functions
export {
  createAttestation,
  computeAttestationHash,
  validateAttestation,
  isValidAttestation,
  verificationLevelToNumber,
  numberToVerificationLevel,
  getAttestationKey,
  commitShaToBytes32,
  serializeAttestation,
  parseAttestation,
} from './attestation'

// Re-export viem utilities that consumers might need
export { keccak256, encodePacked } from 'viem'
