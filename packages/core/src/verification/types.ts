/**
 * Verification Module Types
 *
 * Defines interfaces for provider verification across all supported PoP providers.
 */

import type { HumanProof } from '../types'

/**
 * Result of a provider verification attempt
 */
export interface VerificationResult {
  /** Whether verification succeeded */
  success: boolean
  /** Provider identifier */
  provider: string
  /** Unique identifier for the verified human (used as nullifier base) */
  unique_id: string
  /** Provider-specific verification level/tier */
  verification_level?: string
  /** Raw data from the provider API */
  raw_data?: Record<string, unknown>
  /** Error message if verification failed */
  error?: string
}

/**
 * Configuration for provider verification
 */
export interface VerifierConfig {
  /** Enable mock mode for testing */
  mock?: boolean
}

/**
 * Abstract provider verifier interface
 */
export interface ProviderVerifier<TProof = unknown, TConfig = unknown> {
  /** Provider identifier from POP_PROVIDERS */
  readonly provider: string

  /**
   * Verify a proof from the provider
   * @param proof - Provider-specific proof data
   * @param config - Provider configuration (API keys, etc.)
   * @returns Verification result
   */
  verify(proof: TProof, config: TConfig): Promise<VerificationResult>

  /**
   * Convert verification result to HumanProof for attestation
   * @param result - Successful verification result
   * @param signal - Signal to bind (usually commit SHA)
   * @returns HumanProof suitable for attestation
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof
}

/**
 * Provider verification request (for API endpoints)
 */
export interface VerificationRequest {
  /** Provider to use for verification */
  provider: string
  /** Provider-specific proof data */
  proof: unknown
  /** Signal to bind to the proof */
  signal: string
}

/**
 * Provider verification response
 */
export interface VerificationResponse {
  /** Whether verification succeeded */
  success: boolean
  /** Human proof if successful */
  human_proof?: HumanProof
  /** Error message if failed */
  error?: string
  /** Provider used */
  provider: string
}
