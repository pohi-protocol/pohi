/**
 * Coinbase Verifications Verifier
 *
 * Verifies users via Coinbase Verifications on Base chain using EAS.
 * GraphQL: https://base.easscan.org/graphql
 * Docs: https://github.com/coinbase/verifications
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type {
  CoinbaseVerificationsProofData,
  CoinbaseVerificationsConfig,
  CoinbaseVerificationType,
} from '../providers'
import { COINBASE_SCHEMA_IDS } from '../providers'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'
import { registerVerifier } from './mock'

/**
 * Default GraphQL endpoint for EAS on Base
 */
const DEFAULT_GRAPHQL_URL = 'https://base.easscan.org/graphql'

/**
 * EAS GraphQL response structure
 */
interface EASAttestationResponse {
  data?: {
    attestations: Array<{
      id: string
      attester: string
      recipient: string
      schemaId: string
      revoked: boolean
      time: number
      expirationTime: number
      data: string
    }>
  }
  errors?: Array<{
    message: string
  }>
}

/**
 * Get schema ID for attestation type
 */
function getSchemaId(type: CoinbaseVerificationType): string {
  switch (type) {
    case 'verified_account':
      return COINBASE_SCHEMA_IDS.VERIFIED_ACCOUNT
    case 'verified_country':
      return COINBASE_SCHEMA_IDS.VERIFIED_COUNTRY
    case 'coinbase_one':
      return COINBASE_SCHEMA_IDS.COINBASE_ONE
    default:
      return COINBASE_SCHEMA_IDS.VERIFIED_ACCOUNT
  }
}

/**
 * Get verification level string from attestation types
 */
function getVerificationLevel(types: CoinbaseVerificationType[]): string {
  if (types.includes('coinbase_one')) {
    return 'coinbase_one'
  }
  if (types.includes('verified_country')) {
    return 'verified_country'
  }
  return 'verified_account'
}

/**
 * Coinbase Verifications verifier implementation
 */
export class CoinbaseVerificationsVerifier
  implements ProviderVerifier<CoinbaseVerificationsProofData, CoinbaseVerificationsConfig>
{
  readonly provider = POP_PROVIDERS.COINBASE_VERIFICATIONS

  /**
   * Verify a user via Coinbase Verifications EAS attestations
   *
   * @param proof - Proof data containing the Ethereum address
   * @param config - Configuration with GraphQL URL and required attestations
   */
  async verify(
    proof: CoinbaseVerificationsProofData,
    config: CoinbaseVerificationsConfig = {}
  ): Promise<VerificationResult> {
    const { address, attestation_type = 'verified_account' } = proof
    const graphqlUrl = config.graphql_url || DEFAULT_GRAPHQL_URL
    const allowRevoked = config.allow_revoked ?? false

    if (!address) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Address is required',
      }
    }

    // Validate address format
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Invalid Ethereum address format',
      }
    }

    // Determine which attestation types to check
    const typesToCheck: CoinbaseVerificationType[] = config.required_attestations
      ? config.required_attestations
      : [attestation_type]

    try {
      const foundTypes: CoinbaseVerificationType[] = []
      const attestationIds: string[] = []

      // Check each required attestation type
      for (const type of typesToCheck) {
        const schemaId = getSchemaId(type)

        // Query EAS GraphQL API
        const query = `
          query GetAttestations($recipient: String!, $schemaId: String!) {
            attestations(
              where: {
                recipient: { equals: $recipient }
                schemaId: { equals: $schemaId }
              }
              orderBy: { time: desc }
              take: 1
            ) {
              id
              attester
              recipient
              schemaId
              revoked
              time
              expirationTime
              data
            }
          }
        `

        const response = await fetch(graphqlUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: {
              recipient: address.toLowerCase(),
              schemaId,
            },
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          return {
            success: false,
            provider: this.provider,
            unique_id: '',
            error: `EAS GraphQL error: ${response.status} ${errorText}`,
          }
        }

        const data = (await response.json()) as EASAttestationResponse

        if (data.errors && data.errors.length > 0) {
          return {
            success: false,
            provider: this.provider,
            unique_id: address.toLowerCase(),
            error: `EAS GraphQL error: ${data.errors[0].message}`,
          }
        }

        const attestations = data.data?.attestations || []

        if (attestations.length > 0) {
          const attestation = attestations[0]

          // Check if revoked
          if (attestation.revoked && !allowRevoked) {
            continue // Skip revoked attestations
          }

          // Check if expired
          if (attestation.expirationTime > 0 && attestation.expirationTime < Date.now() / 1000) {
            continue // Skip expired attestations
          }

          foundTypes.push(type)
          attestationIds.push(attestation.id)
        }
      }

      // Check if all required attestations were found
      if (config.required_attestations && config.required_attestations.length > 0) {
        const missingTypes = typesToCheck.filter((t) => !foundTypes.includes(t))
        if (missingTypes.length > 0) {
          return {
            success: false,
            provider: this.provider,
            unique_id: address.toLowerCase(),
            verification_level: foundTypes.length > 0 ? getVerificationLevel(foundTypes) : undefined,
            error: `Missing required attestations: ${missingTypes.join(', ')}`,
            raw_data: {
              address: address.toLowerCase(),
              found_attestations: foundTypes,
              missing_attestations: missingTypes,
              attestation_ids: attestationIds,
            },
          }
        }
      } else if (foundTypes.length === 0) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          error: `No valid Coinbase ${attestation_type} attestation found`,
          raw_data: {
            address: address.toLowerCase(),
            checked_type: attestation_type,
          },
        }
      }

      return {
        success: true,
        provider: this.provider,
        unique_id: address.toLowerCase(),
        verification_level: getVerificationLevel(foundTypes),
        raw_data: {
          address: address.toLowerCase(),
          attestation_types: foundTypes,
          attestation_ids: attestationIds,
        },
      }
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: `Coinbase Verifications check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Convert verification result to HumanProof
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    // Hash the address for nullifier
    const nullifierHash = sha256(`coinbase_verifications:${result.unique_id}`)

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
registerVerifier(POP_PROVIDERS.COINBASE_VERIFICATIONS, CoinbaseVerificationsVerifier)
