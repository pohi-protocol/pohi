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
} from 'pohi-core'

export {
  createAttestation,
  computeAttestationHash,
  validateAttestation,
  isValidAttestation,
  verificationLevelToNumber,
  numberToVerificationLevel,
} from 'pohi-core'

// Re-export EVM utilities
export {
  computeEvmAttestationHash,
  computeEvmSignal,
  commitShaToBytes32,
  nullifierToBytes32,
  toEvmAttestation,
  keccak256,
  encodePacked,
} from 'pohi-evm'
