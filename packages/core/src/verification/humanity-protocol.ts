/**
 * Humanity Protocol Verifier
 *
 * Verifies users via Humanity Protocol's palm-based biometric verification.
 * API: https://issuer.humanity.org
 * Docs: https://humanityprotocol.com
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type { HumanityProtocolProofData, HumanityProtocolConfig } from '../providers'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'
import { registerVerifier } from './mock'

/**
 * Humanity Protocol API response structure
 */
interface HumanityProtocolResponse {
  /** Whether the address is human-verified */
  isHuman: boolean
  /** Error message if request failed */
  error?: string
}

/**
 * Default API URL for Humanity Protocol
 */
const DEFAULT_API_URL = 'https://issuer.humanity.org'

/**
 * Humanity Protocol verifier implementation
 */
export class HumanityProtocolVerifier
  implements ProviderVerifier<HumanityProtocolProofData, HumanityProtocolConfig>
{
  readonly provider = POP_PROVIDERS.HUMANITY_PROTOCOL

  /**
   * Verify a user via Humanity Protocol API
   *
   * @param proof - Proof data containing the Ethereum address
   * @param config - Configuration with API URL
   */
  async verify(
    proof: HumanityProtocolProofData,
    config: HumanityProtocolConfig = {}
  ): Promise<VerificationResult> {
    const { address } = proof
    const apiUrl = config.api_url || DEFAULT_API_URL

    if (!address) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Address is required',
      }
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Invalid Ethereum address format',
      }
    }

    try {
      // Call Humanity Protocol API
      const url = `${apiUrl}/v1/identity/${address}`

      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          provider: this.provider,
          unique_id: '',
          error: `Humanity Protocol API error: ${response.status} ${errorText}`,
        }
      }

      const data = (await response.json()) as HumanityProtocolResponse

      if (data.error) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          error: `Humanity Protocol verification error: ${data.error}`,
        }
      }

      if (!data.isHuman) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          verification_level: 'palm_verified',
          error: 'User has not completed Humanity Protocol palm verification',
          raw_data: {
            address: address.toLowerCase(),
            is_human: false,
          },
        }
      }

      return {
        success: true,
        provider: this.provider,
        unique_id: address.toLowerCase(),
        verification_level: 'palm_verified',
        raw_data: {
          address: address.toLowerCase(),
          is_human: true,
        },
      }
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: `Humanity Protocol verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Convert verification result to HumanProof
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    // Hash the address for privacy (nullifier)
    const nullifierHash = sha256(`humanity_protocol:${result.unique_id}`)

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
registerVerifier(POP_PROVIDERS.HUMANITY_PROTOCOL, HumanityProtocolVerifier)
