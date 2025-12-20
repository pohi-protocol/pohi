/**
 * Verification Module
 *
 * Provides unified verification interface for all PoP providers.
 */

// Types
export type {
  VerificationResult,
  VerifierConfig,
  ProviderVerifier,
  VerificationRequest,
  VerificationResponse,
} from './types'

// Mock utilities (must be imported before verifiers)
export {
  isMockMode,
  MockVerifier,
  getVerifier,
  hasVerifier,
  registerVerifier,
  getRegisteredProviders,
  getAvailableProviders,
} from './mock'

// Provider verifiers (self-registering)
export { GitcoinPassportVerifier } from './gitcoin-passport'
export { BrightIDVerifier } from './brightid'
export { CivicVerifier } from './civic'
export { ProofOfHumanityVerifier } from './proof-of-humanity'
