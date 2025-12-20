/**
 * Proof of Humanity Verifier
 *
 * Verifies users registered with the Proof of Humanity protocol.
 * Uses The Graph subgraph for querying registration status.
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type {
  ProofOfHumanityProofData,
  ProofOfHumanityConfig,
  PoHStatus,
} from '../providers'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'
import { registerVerifier } from './mock'

/**
 * Default subgraph URL for Proof of Humanity
 */
const DEFAULT_SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-mainnet'

/**
 * GraphQL query for submission status
 */
const SUBMISSION_QUERY = `
  query GetSubmission($address: ID!) {
    submission(id: $address) {
      id
      status
      registered
      submissionTime
      name
    }
  }
`

/**
 * Subgraph response structure
 */
interface SubgraphResponse {
  data?: {
    submission?: {
      id: string
      status: string
      registered: boolean
      submissionTime: string
      name?: string
    }
  }
  errors?: Array<{ message: string }>
}

/**
 * Map subgraph status to PoHStatus
 */
function mapStatus(status: string, registered: boolean): PoHStatus {
  if (registered && status === 'None') {
    return 'registered'
  }
  switch (status) {
    case 'Vouching':
      return 'vouching'
    case 'PendingRegistration':
    case 'PendingRemoval':
      return 'pending'
    case 'Challenged':
      return 'challenged'
    default:
      return registered ? 'registered' : 'removed'
  }
}

/**
 * Proof of Humanity verifier implementation
 */
export class ProofOfHumanityVerifier
  implements
    ProviderVerifier<ProofOfHumanityProofData, ProofOfHumanityConfig>
{
  readonly provider = POP_PROVIDERS.PROOF_OF_HUMANITY

  /**
   * Verify a Proof of Humanity registration
   *
   * @param proof - Proof data containing Ethereum address
   * @param config - Configuration with subgraph URL
   */
  async verify(
    proof: ProofOfHumanityProofData,
    config: ProofOfHumanityConfig
  ): Promise<VerificationResult> {
    const { address } = proof
    const { subgraph_url = DEFAULT_SUBGRAPH_URL } = config

    if (!address) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Address is required',
      }
    }

    // Normalize address to lowercase
    const normalizedAddress = address.toLowerCase()

    try {
      // Query The Graph subgraph
      const response = await fetch(subgraph_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: SUBMISSION_QUERY,
          variables: { address: normalizedAddress },
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          provider: this.provider,
          unique_id: normalizedAddress,
          error: `Subgraph request failed: ${response.status}`,
        }
      }

      const data = (await response.json()) as SubgraphResponse

      if (data.errors && data.errors.length > 0) {
        return {
          success: false,
          provider: this.provider,
          unique_id: normalizedAddress,
          error: `Subgraph error: ${data.errors[0].message}`,
        }
      }

      const submission = data.data?.submission

      if (!submission) {
        return {
          success: false,
          provider: this.provider,
          unique_id: normalizedAddress,
          error: 'Address not found in Proof of Humanity registry',
          raw_data: {
            address: normalizedAddress,
            status: 'not_found',
          },
        }
      }

      // Map status
      const pohStatus = mapStatus(submission.status, submission.registered)

      // Only accept registered status
      if (pohStatus !== 'registered') {
        return {
          success: false,
          provider: this.provider,
          unique_id: normalizedAddress,
          verification_level: pohStatus,
          error: `Registration status is '${pohStatus}', not 'registered'`,
          raw_data: {
            address: normalizedAddress,
            status: pohStatus,
            submissionTime: submission.submissionTime,
          },
        }
      }

      return {
        success: true,
        provider: this.provider,
        unique_id: submission.id || normalizedAddress,
        verification_level: 'registered',
        raw_data: {
          address: normalizedAddress,
          status: pohStatus,
          submissionTime: submission.submissionTime,
          name: submission.name,
        },
      }
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: `Proof of Humanity verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Convert verification result to HumanProof
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    // Hash the address for nullifier
    const nullifierHash = sha256(`poh:${result.unique_id}`)

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
registerVerifier(POP_PROVIDERS.PROOF_OF_HUMANITY, ProofOfHumanityVerifier)
