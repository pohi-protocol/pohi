/**
 * BrightID Verifier
 *
 * Verifies users via BrightID decentralized identity network.
 * API: https://app.brightid.org/node/v5
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type { BrightIDProofData, BrightIDConfig } from '../providers'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'
import { registerVerifier } from './mock'

/**
 * BrightID API response structure
 */
interface BrightIDVerificationResponse {
  data?: {
    unique: boolean
    contextIds: string[]
    timestamp: number
    sig?: {
      r: string
      s: string
      v: number
    }
    publicKey?: string
    verification?: string
  }
  error?: boolean
  errorMessage?: string
  errorNum?: number
}

/**
 * Default BrightID node URL
 */
const DEFAULT_NODE_URL = 'https://app.brightid.org/node/v5'

/**
 * BrightID verifier implementation
 */
export class BrightIDVerifier
  implements ProviderVerifier<BrightIDProofData, BrightIDConfig>
{
  readonly provider = POP_PROVIDERS.BRIGHTID

  /**
   * Verify a BrightID user
   *
   * @param proof - Proof data containing context_id
   * @param config - Configuration with context name
   */
  async verify(
    proof: BrightIDProofData,
    config: BrightIDConfig
  ): Promise<VerificationResult> {
    const { context_id } = proof
    const { context, node_url = DEFAULT_NODE_URL } = config

    if (!context_id) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Context ID is required',
      }
    }

    if (!context) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'BrightID context is required',
      }
    }

    try {
      // Query BrightID node for verification status
      const response = await fetch(
        `${node_url}/verifications/${context}/${context_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = (await response.json()) as BrightIDVerificationResponse

      if (data.error || !data.data) {
        return {
          success: false,
          provider: this.provider,
          unique_id: context_id,
          error: data.errorMessage || 'BrightID verification failed',
        }
      }

      // Check if user is verified as unique
      if (!data.data.unique) {
        return {
          success: false,
          provider: this.provider,
          unique_id: context_id,
          verification_level: 'not_unique',
          error: 'User is not verified as unique in BrightID',
          raw_data: {
            context_id,
            context,
            unique: false,
            timestamp: data.data.timestamp,
          },
        }
      }

      // Determine verification level based on verification type
      const verificationLevel = data.data.verification || 'meets'

      return {
        success: true,
        provider: this.provider,
        unique_id: context_id,
        verification_level: verificationLevel,
        raw_data: {
          context_id,
          context,
          unique: true,
          timestamp: data.data.timestamp,
          sig: data.data.sig,
        },
      }
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: `BrightID verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Convert verification result to HumanProof
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    // Hash the context_id for nullifier
    const nullifierHash = sha256(`brightid:${result.unique_id}`)

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
registerVerifier(POP_PROVIDERS.BRIGHTID, BrightIDVerifier)
