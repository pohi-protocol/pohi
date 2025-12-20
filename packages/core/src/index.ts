/**
 * pohi-core
 *
 * Chain-neutral core library for Proof of Human Intent (PoHI)
 * This package provides types, validation, and utilities for PoHI attestations
 * without any blockchain-specific dependencies.
 *
 * For EVM/blockchain integration, use @pohi-protocol/evm
 */

// ============ Types ============

export type {
  // PoP Provider types
  KnownPoPProvider,
  WorldIDVerificationLevel,
  WorldIDProof,
  // Approval types
  KnownApprovalAction,
  ApprovalSubject,
  // Human proof types
  HumanProof,
  // Chain types
  ChainRecord,
  OnChainAttestation,
  // Attestation types
  HumanApprovalAttestation,
  // API types
  VerifyResponse,
  ApprovalStatus,
} from './types'

// ============ Constants ============

export {
  POP_PROVIDERS,
  APPROVAL_ACTIONS,
} from './types'

// ============ Provider Types ============

export type {
  // World ID
  WorldIDProofData,
  WorldIDConfig,
  // Gitcoin Passport
  GitcoinPassportProofData,
  GitcoinPassportStamp,
  GitcoinPassportConfig,
  // BrightID
  BrightIDVerificationLevel,
  BrightIDProofData,
  BrightIDConfig,
  // Civic
  CivicVerificationType,
  CivicProofData,
  CivicConfig,
  // Proof of Humanity
  PoHStatus,
  ProofOfHumanityProofData,
  ProofOfHumanityConfig,
  // Provider utilities
  ProviderFeatures,
} from './providers'

export {
  GITCOIN_PASSPORT_THRESHOLDS,
  getProviderName,
  getProviderDocsUrl,
  isKnownProvider,
  getProviderFeatures,
} from './providers'

// ============ Core Functions ============

export {
  // Attestation creation
  createAttestation,
  // Hash computation (SHA-256 based)
  computeAttestationHash,
  computeSignal,
  sha256,
  // Canonicalization
  canonicalizeAttestation,
  // Validation
  validateAttestation,
  isValidAttestation,
  // Utility functions
  verificationLevelToNumber,
  numberToVerificationLevel,
  getAttestationKey,
  // Serialization
  serializeAttestation,
  serializeAttestationPretty,
  parseAttestation,
} from './attestation'

// ============ Verification Module ============

export type {
  VerificationResult,
  VerifierConfig,
  ProviderVerifier,
  VerificationRequest,
  VerificationResponse,
} from './verification'

export {
  // Mock utilities
  isMockMode,
  MockVerifier,
  getVerifier,
  hasVerifier,
  registerVerifier,
  getRegisteredProviders,
  getAvailableProviders,
  // Provider verifiers
  GitcoinPassportVerifier,
  BrightIDVerifier,
  CivicVerifier,
  ProofOfHumanityVerifier,
} from './verification'
