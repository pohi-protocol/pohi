/**
 * Holonym Verifier
 *
 * Verifies users via Holonym (Human ID) sybil-resistance API.
 * API: https://api.holonym.io/sybil-resistance
 * Docs: https://docs.holonym.id
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type { HolonymProofData, HolonymConfig, HolonymCredentialType } from '../providers'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'
import { registerVerifier } from './mock'

/**
 * Holonym API response structure
 */
interface HolonymSybilResponse {
  result: boolean
  error?: string
}

/**
 * Default action ID recommended by Holonym
 */
const DEFAULT_ACTION_ID = '123456789'

/**
 * Default chain for verification
 */
const DEFAULT_CHAIN = 'optimism'

/**
 * Get verification level based on credential type
 */
function getVerificationLevel(credentialType: HolonymCredentialType): string {
  switch (credentialType) {
    case 'gov-id':
      return 'government_id'
    case 'epassport':
      return 'epassport'
    case 'phone':
      return 'phone'
    default:
      return 'unknown'
  }
}

/**
 * Holonym verifier implementation
 */
export class HolonymVerifier
  implements ProviderVerifier<HolonymProofData, HolonymConfig>
{
  readonly provider = POP_PROVIDERS.HOLONYM

  /**
   * Verify a user via Holonym sybil-resistance API
   *
   * @param proof - Proof data containing the Ethereum address and credential type
   * @param config - Configuration with chain and action ID
   */
  async verify(
    proof: HolonymProofData,
    config: HolonymConfig = {}
  ): Promise<VerificationResult> {
    const { address, credential_type } = proof
    const chain = proof.chain || config.chain || DEFAULT_CHAIN
    const actionId = proof.action_id || config.action_id || DEFAULT_ACTION_ID

    if (!address) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Address is required',
      }
    }

    if (!credential_type) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Credential type is required (gov-id, epassport, or phone)',
      }
    }

    // Validate credential type
    const validCredentialTypes: HolonymCredentialType[] = ['gov-id', 'epassport', 'phone']
    if (!validCredentialTypes.includes(credential_type)) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: `Invalid credential type: ${credential_type}. Must be one of: ${validCredentialTypes.join(', ')}`,
      }
    }

    // Check if required credentials are specified in config
    if (config.required_credentials && config.required_credentials.length > 0) {
      if (!config.required_credentials.includes(credential_type)) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          error: `Credential type ${credential_type} is not in required credentials: ${config.required_credentials.join(', ')}`,
        }
      }
    }

    try {
      // Call Holonym sybil-resistance API
      const url = `https://api.holonym.io/sybil-resistance/${credential_type}/${chain}?user=${address}&action-id=${actionId}`

      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          provider: this.provider,
          unique_id: '',
          error: `Holonym API error: ${response.status} ${errorText}`,
        }
      }

      const data = (await response.json()) as HolonymSybilResponse

      if (data.error) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          error: `Holonym verification error: ${data.error}`,
        }
      }

      if (!data.result) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          verification_level: getVerificationLevel(credential_type),
          error: 'User has not completed Holonym verification or has already submitted a proof for this action',
          raw_data: {
            address: address.toLowerCase(),
            credential_type,
            chain,
            action_id: actionId,
            is_unique: false,
          },
        }
      }

      return {
        success: true,
        provider: this.provider,
        unique_id: address.toLowerCase(),
        verification_level: getVerificationLevel(credential_type),
        raw_data: {
          address: address.toLowerCase(),
          credential_type,
          chain,
          action_id: actionId,
          is_unique: true,
        },
      }
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: `Holonym verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Convert verification result to HumanProof
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    // Hash the address + credential_type for privacy (nullifier)
    const credentialType = (result.raw_data?.credential_type as string) || 'unknown'
    const nullifierHash = sha256(`holonym:${credentialType}:${result.unique_id}`)

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
registerVerifier(POP_PROVIDERS.HOLONYM, HolonymVerifier)
