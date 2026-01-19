/**
 * Idena Verifier
 *
 * Verifies users via Idena Proof-of-Person blockchain.
 * RPC: https://rpc.idena.dev
 * Docs: https://docs.idena.io
 */

import { POP_PROVIDERS } from '../types'
import type { HumanProof } from '../types'
import type { IdenaProofData, IdenaConfig, IdenaIdentityState } from '../providers'
import { IDENA_STATE_LEVELS } from '../providers'
import type { ProviderVerifier, VerificationResult } from './types'
import { sha256 } from '../attestation'
import { registerVerifier } from './mock'

/**
 * Default RPC endpoint
 */
const DEFAULT_RPC_URL = 'https://rpc.idena.dev'

/**
 * Default minimum identity state required
 */
const DEFAULT_MIN_STATE: IdenaIdentityState = 'Newbie'

/**
 * Idena RPC response structure for dna_identity
 */
interface IdenaIdentityResponse {
  id: number
  result?: {
    address: string
    state: IdenaIdentityState
    stake?: string
    age?: number
    totalShortFlipPoints?: number
    totalQualifiedFlips?: number
    online?: boolean
    penalty?: string
    penaltySeconds?: number
    generation?: number
    birthday?: number
    profileHash?: string
    code?: string
    invitees?: Array<{ TxHash: string; Address: string }>
    flips?: string[]
    requiredFlips?: number
    madeFlips?: number
    totalShortAnswers?: {
      flipsCount: number
      answers: number
      point: number
    }
  }
  error?: {
    code: number
    message: string
  }
}

/**
 * Check if identity state meets minimum requirement
 */
function meetsMinState(state: IdenaIdentityState, minState: IdenaIdentityState): boolean {
  const stateLevel = IDENA_STATE_LEVELS[state] ?? 0
  const minLevel = IDENA_STATE_LEVELS[minState] ?? 0
  return stateLevel >= minLevel
}

/**
 * Get verification level string from state
 */
function getVerificationLevel(state: IdenaIdentityState): string {
  return state.toLowerCase()
}

/**
 * Idena verifier implementation
 */
export class IdenaVerifier implements ProviderVerifier<IdenaProofData, IdenaConfig> {
  readonly provider = POP_PROVIDERS.IDENA

  /**
   * Verify a user via Idena RPC API
   *
   * @param proof - Proof data containing the Idena address
   * @param config - Configuration with RPC URL and minimum state
   */
  async verify(proof: IdenaProofData, config: IdenaConfig = {}): Promise<VerificationResult> {
    const { address } = proof
    const rpcUrl = config.rpc_url || DEFAULT_RPC_URL
    const minState = config.min_state || DEFAULT_MIN_STATE

    if (!address) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Address is required',
      }
    }

    // Validate address format (Idena uses 0x prefixed addresses)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: 'Invalid Idena address format',
      }
    }

    try {
      // Call Idena RPC API
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'dna_identity',
          params: [address.toLowerCase()],
          id: 1,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          provider: this.provider,
          unique_id: '',
          error: `Idena RPC error: ${response.status} ${errorText}`,
        }
      }

      const data = (await response.json()) as IdenaIdentityResponse

      if (data.error) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          error: `Idena RPC error: ${data.error.message}`,
        }
      }

      if (!data.result) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          error: 'Identity not found on Idena network',
        }
      }

      const { state, age, online } = data.result

      // Check if identity state meets minimum requirement
      if (!meetsMinState(state, minState)) {
        return {
          success: false,
          provider: this.provider,
          unique_id: address.toLowerCase(),
          verification_level: getVerificationLevel(state),
          error: `Identity state '${state}' does not meet minimum required state '${minState}'`,
          raw_data: {
            address: address.toLowerCase(),
            state,
            state_level: IDENA_STATE_LEVELS[state],
            min_state: minState,
            min_state_level: IDENA_STATE_LEVELS[minState],
            age,
            online,
          },
        }
      }

      return {
        success: true,
        provider: this.provider,
        unique_id: address.toLowerCase(),
        verification_level: getVerificationLevel(state),
        raw_data: {
          address: address.toLowerCase(),
          state,
          state_level: IDENA_STATE_LEVELS[state],
          age,
          online,
        },
      }
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        unique_id: '',
        error: `Idena verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Convert verification result to HumanProof
   */
  toHumanProof(result: VerificationResult, signal: string): HumanProof {
    // Hash the address for nullifier
    const nullifierHash = sha256(`idena:${result.unique_id}`)

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
registerVerifier(POP_PROVIDERS.IDENA, IdenaVerifier)
