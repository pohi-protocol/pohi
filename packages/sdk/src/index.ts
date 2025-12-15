// Client
export { PoHIClient, type PoHIClientConfig, type OnChainAttestation } from './client'

// Chains
export { worldChain, worldChainSepolia } from './chains'

// ABI
export { pohiRegistryAbi } from './abi'

// Re-export core types and utilities for convenience
export type {
  HumanApprovalAttestation,
  ApprovalSubject,
  HumanProof,
  ChainRecord,
} from '@pohi-protocol/core'

export {
  createAttestation,
  computeAttestationHash,
  validateAttestation,
  isValidAttestation,
  commitShaToBytes32,
  verificationLevelToNumber,
  numberToVerificationLevel,
} from '@pohi-protocol/core'
