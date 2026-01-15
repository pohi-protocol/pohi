/**
 * PoP Provider Definitions
 *
 * This file contains type definitions and utilities for various
 * Proof of Personhood (PoP) providers supported by PoHI.
 */

import { POP_PROVIDERS } from './types'

// ============ World ID ============

/**
 * World ID verification levels
 */
export type WorldIDVerificationLevel = 'device' | 'orb' | 'secure_document'

/**
 * World ID proof structure (from IDKit)
 */
export interface WorldIDProofData {
  /** Merkle root of the World ID identity set */
  merkle_root: string
  /** Unique nullifier for this action scope */
  nullifier_hash: string
  /** ZK proof data */
  proof: string
  /** Verification level achieved */
  verification_level: WorldIDVerificationLevel
  /** Credential type (optional) */
  credential_type?: string
}

/**
 * World ID provider configuration
 */
export interface WorldIDConfig {
  app_id: string
  action: string
  signal?: string
  verification_level?: WorldIDVerificationLevel
}

// ============ Gitcoin Passport ============

/**
 * Gitcoin Passport score thresholds
 */
export const GITCOIN_PASSPORT_THRESHOLDS = {
  /** Minimum score for basic verification */
  BASIC: 15,
  /** Score for trusted verification */
  TRUSTED: 25,
  /** Score for high-trust verification */
  HIGH_TRUST: 35,
} as const

/**
 * Gitcoin Passport proof structure
 */
export interface GitcoinPassportProofData {
  /** Passport score (0-100) */
  score: number
  /** Ethereum address of the passport holder */
  address: string
  /** Timestamp of score calculation */
  score_timestamp: string
  /** List of stamps (credentials) */
  stamps?: GitcoinPassportStamp[]
  /** Signature from Gitcoin API */
  signature?: string
}

/**
 * Gitcoin Passport stamp (individual credential)
 */
export interface GitcoinPassportStamp {
  /** Provider name (e.g., 'Google', 'Twitter', 'ENS') */
  provider: string
  /** Credential hash */
  hash: string
  /** Issuance timestamp */
  issuance_date: string
  /** Expiration timestamp */
  expiration_date?: string
}

/**
 * Gitcoin Passport provider configuration
 */
export interface GitcoinPassportConfig {
  /** API key for Gitcoin Passport API (from developer.passport.xyz) */
  api_key: string
  /** Scorer ID from developer.passport.xyz */
  scorer_id: string
  /** Minimum score required (default: 20) */
  min_score?: number
  /** Required stamps (optional) */
  required_stamps?: string[]
}

// ============ BrightID ============

/**
 * BrightID verification levels
 */
export type BrightIDVerificationLevel = 'meets' | 'bitu'

/**
 * BrightID proof structure
 */
export interface BrightIDProofData {
  /** BrightID unique identifier (contextId) */
  context_id: string
  /** Whether the user is verified */
  unique: boolean
  /** Verification timestamp */
  timestamp: number
  /** Signature from BrightID node */
  sig: {
    r: string
    s: string
    v: number
  }
  /** Verification level */
  verification_level?: BrightIDVerificationLevel
}

/**
 * BrightID provider configuration
 */
export interface BrightIDConfig {
  /** BrightID context name */
  context: string
  /** BrightID node URL */
  node_url?: string
}

// ============ Civic ============

/**
 * Civic verification types
 */
export type CivicVerificationType = 'uniqueness' | 'captcha' | 'liveness' | 'id_verification'

/**
 * Civic proof structure
 */
export interface CivicProofData {
  /** Civic user identifier */
  user_id: string
  /** Gateway token (on-chain pass) */
  gateway_token?: string
  /** Verification types passed */
  verifications: CivicVerificationType[]
  /** Expiration timestamp */
  expiration?: string
  /** Chain ID where the pass is issued */
  chain_id?: number
}

/**
 * Civic provider configuration
 */
export interface CivicConfig {
  /** Civic gatekeeper network */
  gatekeeper_network: string
  /** Required verification types */
  required_verifications?: CivicVerificationType[]
}

// ============ Proof of Humanity ============

/**
 * Proof of Humanity status
 */
export type PoHStatus = 'registered' | 'vouching' | 'pending' | 'challenged' | 'removed'

/**
 * Proof of Humanity proof structure
 */
export interface ProofOfHumanityProofData {
  /** Ethereum address registered with PoH */
  address: string
  /** Registration status */
  status: PoHStatus
  /** Submission ID */
  submission_id?: string
  /** Registration timestamp */
  registered_at?: string
}

/**
 * Proof of Humanity provider configuration
 */
export interface ProofOfHumanityConfig {
  /** Subgraph URL for querying */
  subgraph_url?: string
}

// ============ Holonym ============

/**
 * Holonym credential types for verification
 */
export type HolonymCredentialType = 'gov-id' | 'epassport' | 'phone'

/**
 * Holonym supported chains
 */
export type HolonymChain =
  | 'ethereum'
  | 'optimism'
  | 'base'
  | 'arbitrum'
  | 'polygon'
  | 'celo'
  | 'avalanche'
  | 'linea'
  | 'scroll'
  | 'world-chain'

/**
 * Holonym proof structure
 */
export interface HolonymProofData {
  /** Ethereum address to verify */
  address: string
  /** Type of credential used for verification */
  credential_type: HolonymCredentialType
  /** Chain where the proof exists */
  chain?: HolonymChain
  /** Action ID for custom sybil resistance (default: 123456789) */
  action_id?: string
}

/**
 * Holonym provider configuration
 */
export interface HolonymConfig {
  /** Chain to verify on (default: optimism) */
  chain?: HolonymChain
  /** Required credential type(s) */
  required_credentials?: HolonymCredentialType[]
  /** Custom action ID for sybil resistance (default: 123456789) */
  action_id?: string
}

// ============ Idena ============

/**
 * Idena identity states
 * Based on validation ceremony participation and scores
 */
export type IdenaIdentityState =
  | 'Undefined'
  | 'Invite'
  | 'Candidate'
  | 'Newbie'
  | 'Verified'
  | 'Suspended'
  | 'Zombie'
  | 'Killed'
  | 'Human'

/**
 * Idena proof structure
 */
export interface IdenaProofData {
  /** Idena address to verify */
  address: string
}

/**
 * Idena provider configuration
 */
export interface IdenaConfig {
  /** RPC endpoint URL (default: https://rpc.idena.dev) */
  rpc_url?: string
  /** Minimum required identity state */
  min_state?: IdenaIdentityState
}

/**
 * Idena identity state hierarchy for comparison
 * Higher number = more verified
 */
export const IDENA_STATE_LEVELS: Record<IdenaIdentityState, number> = {
  Undefined: 0,
  Invite: 1,
  Candidate: 2,
  Newbie: 3,
  Verified: 4,
  Suspended: 3, // Same as Newbie (can still participate)
  Zombie: 1,
  Killed: 0,
  Human: 5, // Highest level
} as const

// ============ Coinbase Verifications ============

/**
 * Coinbase Verifications attestation types
 */
export type CoinbaseVerificationType =
  | 'verified_account'
  | 'verified_country'
  | 'coinbase_one'

/**
 * Coinbase Verifications schema IDs on Base
 */
export const COINBASE_SCHEMA_IDS = {
  /** Coinbase Verified Account schema */
  VERIFIED_ACCOUNT: '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9',
  /** Coinbase Verified Country schema */
  VERIFIED_COUNTRY: '0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065',
  /** Coinbase One membership schema */
  COINBASE_ONE: '0x12e65a5df2488073e45d1d29d96a8a6f0c42b4d66c0bc5e1e4e3a4e0e5e7e9f1',
} as const

/**
 * Coinbase Verifications proof structure
 */
export interface CoinbaseVerificationsProofData {
  /** Ethereum address to verify */
  address: string
  /** Attestation type to check */
  attestation_type?: CoinbaseVerificationType
}

/**
 * Coinbase Verifications provider configuration
 */
export interface CoinbaseVerificationsConfig {
  /** GraphQL endpoint (default: https://base.easscan.org/graphql) */
  graphql_url?: string
  /** Required attestation types */
  required_attestations?: CoinbaseVerificationType[]
  /** Allow revoked attestations (default: false) */
  allow_revoked?: boolean
}

// ============ Provider Utilities ============

/**
 * Get human-readable name for a provider
 */
export function getProviderName(provider: string): string {
  const names: Record<string, string> = {
    [POP_PROVIDERS.WORLD_ID]: 'World ID',
    [POP_PROVIDERS.GITCOIN_PASSPORT]: 'Gitcoin Passport',
    [POP_PROVIDERS.PROOF_OF_HUMANITY]: 'Proof of Humanity',
    [POP_PROVIDERS.CIVIC]: 'Civic',
    [POP_PROVIDERS.BRIGHTID]: 'BrightID',
    [POP_PROVIDERS.HOLONYM]: 'Holonym',
    [POP_PROVIDERS.IDENA]: 'Idena',
    [POP_PROVIDERS.COINBASE_VERIFICATIONS]: 'Coinbase Verifications',
  }
  return names[provider] || provider
}

/**
 * Get provider documentation URL
 */
export function getProviderDocsUrl(provider: string): string {
  const urls: Record<string, string> = {
    [POP_PROVIDERS.WORLD_ID]: 'https://docs.world.org/world-id',
    [POP_PROVIDERS.GITCOIN_PASSPORT]: 'https://docs.passport.gitcoin.co',
    [POP_PROVIDERS.PROOF_OF_HUMANITY]: 'https://proofofhumanity.id',
    [POP_PROVIDERS.CIVIC]: 'https://docs.civic.com',
    [POP_PROVIDERS.BRIGHTID]: 'https://brightid.gitbook.io',
    [POP_PROVIDERS.HOLONYM]: 'https://docs.holonym.id',
    [POP_PROVIDERS.IDENA]: 'https://docs.idena.io',
    [POP_PROVIDERS.COINBASE_VERIFICATIONS]: 'https://github.com/coinbase/verifications',
  }
  return urls[provider] || ''
}

/**
 * Check if a provider is known/supported
 */
export function isKnownProvider(provider: string): boolean {
  return Object.values(POP_PROVIDERS).includes(provider as any)
}

/**
 * Provider feature support matrix
 */
export interface ProviderFeatures {
  /** Supports zero-knowledge proofs */
  zk_proofs: boolean
  /** Sybil resistance level (1-5) */
  sybil_resistance: number
  /** Requires hardware (e.g., Orb) */
  requires_hardware: boolean
  /** Available globally */
  global_availability: boolean
  /** Supports on-chain verification */
  onchain_verification: boolean
}

/**
 * Get feature matrix for a provider
 */
export function getProviderFeatures(provider: string): ProviderFeatures {
  const features: Record<string, ProviderFeatures> = {
    [POP_PROVIDERS.WORLD_ID]: {
      zk_proofs: true,
      sybil_resistance: 5, // Orb level
      requires_hardware: true, // For Orb level
      global_availability: false, // Limited Orb locations
      onchain_verification: true,
    },
    [POP_PROVIDERS.GITCOIN_PASSPORT]: {
      zk_proofs: false,
      sybil_resistance: 3,
      requires_hardware: false,
      global_availability: true,
      onchain_verification: true,
    },
    [POP_PROVIDERS.PROOF_OF_HUMANITY]: {
      zk_proofs: false,
      sybil_resistance: 4,
      requires_hardware: false,
      global_availability: true,
      onchain_verification: true,
    },
    [POP_PROVIDERS.CIVIC]: {
      zk_proofs: false,
      sybil_resistance: 3,
      requires_hardware: false,
      global_availability: true,
      onchain_verification: true,
    },
    [POP_PROVIDERS.BRIGHTID]: {
      zk_proofs: false,
      sybil_resistance: 3,
      requires_hardware: false,
      global_availability: true,
      onchain_verification: true,
    },
    [POP_PROVIDERS.HOLONYM]: {
      zk_proofs: true,
      sybil_resistance: 4, // Government ID / ePassport based
      requires_hardware: false,
      global_availability: true,
      onchain_verification: true,
    },
    [POP_PROVIDERS.IDENA]: {
      zk_proofs: false,
      sybil_resistance: 5, // Regular validation ceremonies
      requires_hardware: false,
      global_availability: true,
      onchain_verification: true,
    },
    [POP_PROVIDERS.COINBASE_VERIFICATIONS]: {
      zk_proofs: false,
      sybil_resistance: 4, // KYC-based via Coinbase
      requires_hardware: false,
      global_availability: true, // Via Coinbase account
      onchain_verification: true, // EAS on Base
    },
  }
  return features[provider] || {
    zk_proofs: false,
    sybil_resistance: 1,
    requires_hardware: false,
    global_availability: true,
    onchain_verification: false,
  }
}
