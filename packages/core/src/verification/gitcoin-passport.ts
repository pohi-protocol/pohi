/**
 * Gitcoin Passport Verifier
 *
 * Verifies users via Gitcoin Passport score and stamps.
 * API: https://api.passport.gitcoin.co
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type {
  GitcoinPassportProofData,
  GitcoinPassportConfig,
} from '../providers'
import { GITCOIN_PASSPORT_THRESHOLDS } from '../providers'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'
import { registerVerifier } from './mock'

/**
 * Gitcoin Passport API response structure
 */
interface PassportScoreResponse {
  address: string
  score: string
  status: string
  last_score_timestamp: string
  evidence?: {
    type: string
    success: boolean
    rawScore: string
    threshold: string
  }
  error?: string
}

/**
 * Get verification level based on score
 */
function getVerificationLevel(score: number): string {
  if (score >= GITCOIN_PASSPORT_THRESHOLDS.HIGH_TRUST) {
    return 'high_trust'
  }
  if (score >= GITCOIN_PASSPORT_THRESHOLDS.TRUSTED) {
    return 'trusted'
  }
  if (score >= GITCOIN_PASSPORT_THRESHOLDS.BASIC) {
    return 'basic'
  }
  return 'insufficient'
}

/**
 * Gitcoin Passport verifier implementation
 */
export class GitcoinPassportVerifier
  implements ProviderVerifier<GitcoinPassportProofData, GitcoinPassportConfig>
{
  readonly provider = POP_PROVIDERS.GITCOIN_PASSPORT

  /**
   * Verify a Gitcoin Passport holder
   *
   * @param proof - Proof data containing the Ethereum address
   * @param config - Configuration with API key and minimum score
   */
  async verify(
    proof: GitcoinPassportProofData,
    config: GitcoinPassportConfig
  ): Promise<VerificationResult> {
    const { address } = proof
    const { api_key, min_score = GITCOIN_PASSPORT_THRESHOLDS.BASIC } = config

    if (!address) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Address is required',
      }
    }

    if (!api_key) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Gitcoin Passport API key is required',
      }
    }

    try {
      // Fetch score from Gitcoin Passport API v2
      // Requires scorer_id from https://developer.passport.xyz/
      const scorerId = config.scorer_id
      if (!scorerId) {
        return {
          success: false,
          provider: this.provider,
          unique_id: '',
          error: 'Gitcoin Passport scorer_id is required (get from developer.passport.xyz)',
        }
      }

      const response = await fetch(
        `https://api.passport.xyz/v2/stamps/${scorerId}/score/${address}`,
        {
          headers: {
            'X-API-KEY': api_key,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          provider: this.provider,
          unique_id: '',
          error: `Gitcoin Passport API error: ${response.status} ${errorText}`,
        }
      }

      const data = (await response.json()) as PassportScoreResponse

      // Check if score meets minimum threshold
      const score = parseFloat(data.score)
      if (isNaN(score)) {
        return {
          success: false,
          provider: this.provider,
          unique_id: '',
          error: 'Invalid score from Gitcoin Passport',
        }
      }

      if (score < min_score) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          verification_level: getVerificationLevel(score),
          error: `Score ${score} is below minimum threshold ${min_score}`,
          raw_data: {
            score,
            address: address.toLowerCase(),
            timestamp: data.last_score_timestamp,
          },
        }
      }

      return {
        success: true,
        provider: this.provider,
        unique_id: address.toLowerCase(),
        verification_level: getVerificationLevel(score),
        raw_data: {
          score,
          address: address.toLowerCase(),
          timestamp: data.last_score_timestamp,
          status: data.status,
        },
      }
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: `Gitcoin Passport verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Convert verification result to HumanProof
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    // Hash the address for privacy (nullifier)
    const nullifierHash = sha256(`gitcoin_passport:${result.unique_id}`)

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
registerVerifier(POP_PROVIDERS.GITCOIN_PASSPORT, GitcoinPassportVerifier)
