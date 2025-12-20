/**
 * Mock Verifier
 *
 * Provides mock verification for development and testing.
 * Enable with POHI_MOCK_PROVIDERS=true environment variable.
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'

/**
 * Check if mock mode is enabled
 */
export function isMockMode(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.POHI_MOCK_PROVIDERS === 'true'
  }
  return false
}

/**
 * Mock verifier that returns success for any provider
 */
export class MockVerifier implements ProviderVerifier {
  readonly provider: string

  constructor(provider: string) {
    this.provider = provider
  }

  async verify(): Promise<VerificationResult> {
    // Generate a deterministic but unique ID for testing
    const uniqueId = `mock_${this.provider}_${Date.now()}_${Math.random().toString(36).slice(2)}`

    return {
      success: true,
      provider: this.provider,
      unique_id: uniqueId,
      verification_level: 'mock',
      raw_data: {
        mock: true,
        timestamp: new Date().toISOString(),
      },
    }
  }

  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    return {
      method: this.provider,
      verification_level: 'mock',
      nullifier_hash: sha256(result.unique_id),
      signal,
      provider_proof: result.raw_data,
    }
  }
}

/**
 * Provider verifier implementations registry
 */
const verifierRegistry: Map<string, new () => ProviderVerifier> = new Map()

/**
 * Register a provider verifier implementation
 */
export function registerVerifier(
  provider: string,
  verifierClass: new () => ProviderVerifier
): void {
  verifierRegistry.set(provider, verifierClass)
}

/**
 * Get the appropriate verifier for a provider
 * Returns MockVerifier if mock mode is enabled
 */
export function getVerifier(provider: string): ProviderVerifier {
  // Always use mock verifier in mock mode
  if (isMockMode()) {
    return new MockVerifier(provider)
  }

  // Get registered verifier
  const VerifierClass = verifierRegistry.get(provider)
  if (VerifierClass) {
    return new VerifierClass()
  }

  throw new Error(`No verifier registered for provider: ${provider}`)
}

/**
 * Check if a verifier is registered for a provider
 */
export function hasVerifier(provider: string): boolean {
  return verifierRegistry.has(provider) || isMockMode()
}

/**
 * Get list of all registered providers
 */
export function getRegisteredProviders(): string[] {
  return Array.from(verifierRegistry.keys())
}

/**
 * Get list of all available providers (including mock support)
 */
export function getAvailableProviders(): string[] {
  if (isMockMode()) {
    return Object.values(POP_PROVIDERS)
  }
  return getRegisteredProviders()
}
