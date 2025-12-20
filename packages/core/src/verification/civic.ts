/**
 * Civic Verifier
 *
 * Verifies users via Civic Gateway Pass system.
 * Uses on-chain gateway tokens for verification.
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type { CivicProofData, CivicConfig } from '../providers'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'
import { registerVerifier } from './mock'

/**
 * Civic verification level mapping
 */
const VERIFICATION_LEVELS: Record<string, number> = {
  captcha: 1,
  uniqueness: 2,
  liveness: 3,
  id_verification: 4,
}

/**
 * Get highest verification level from list
 */
function getHighestLevel(verifications: string[]): string {
  let highest = 'captcha'
  let highestScore = 0

  for (const v of verifications) {
    const score = VERIFICATION_LEVELS[v] || 0
    if (score > highestScore) {
      highestScore = score
      highest = v
    }
  }

  return highest
}

/**
 * Civic verifier implementation
 */
export class CivicVerifier
  implements ProviderVerifier<CivicProofData, CivicConfig>
{
  readonly provider = POP_PROVIDERS.CIVIC

  /**
   * Verify a Civic Gateway Pass holder
   *
   * @param proof - Proof data containing gateway token info
   * @param config - Configuration with gatekeeper network
   */
  async verify(
    proof: CivicProofData,
    config: CivicConfig
  ): Promise<VerificationResult> {
    const { user_id, gateway_token, verifications, expiration } = proof
    const { gatekeeper_network, required_verifications = [] } = config

    if (!user_id) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'User ID is required',
      }
    }

    if (!gatekeeper_network) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Civic gatekeeper network is required',
      }
    }

    // Check if verifications array exists
    if (!verifications || verifications.length === 0) {
      return {
        success: false,
        provider: this.provider,
        unique_id: user_id,
        error: 'No verifications provided',
      }
    }

    // Check expiration if provided
    if (expiration) {
      const expirationDate = new Date(expiration)
      if (expirationDate < new Date()) {
        return {
          success: false,
          provider: this.provider,
          unique_id: user_id,
          error: 'Gateway pass has expired',
          raw_data: {
            user_id,
            verifications,
            expiration,
            expired: true,
          },
        }
      }
    }

    // Check required verifications
    for (const required of required_verifications) {
      if (!verifications.includes(required)) {
        return {
          success: false,
          provider: this.provider,
          unique_id: user_id,
          error: `Missing required verification: ${required}`,
          raw_data: {
            user_id,
            verifications,
            required_verifications,
          },
        }
      }
    }

    // Determine verification level
    const verificationLevel = getHighestLevel(verifications)

    return {
      success: true,
      provider: this.provider,
      unique_id: user_id,
      verification_level: verificationLevel,
      raw_data: {
        user_id,
        gateway_token,
        verifications,
        expiration,
        gatekeeper_network,
      },
    }
  }

  /**
   * Convert verification result to HumanProof
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    // Hash the user_id for nullifier
    const nullifierHash = sha256(`civic:${result.unique_id}`)

    return {
      method: this.provider,
      verification_level: result.verification_level,
      nullifier_hash: nullifierHash,
      signal,
      provider_proof: result.raw_data,
    }
  }
}

// Register this verifier
registerVerifier(POP_PROVIDERS.CIVIC, CivicVerifier)
