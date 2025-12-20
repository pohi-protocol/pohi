/**
 * Provider Configuration
 *
 * Loads provider-specific configuration from environment variables.
 */

import { POP_PROVIDERS } from 'pohi-core'
import type {
  GitcoinPassportConfig,
  BrightIDConfig,
  CivicConfig,
  ProofOfHumanityConfig,
} from 'pohi-core'

/**
 * Get configuration for Gitcoin Passport
 */
export function getGitcoinPassportConfig(): GitcoinPassportConfig {
  return {
    api_key: process.env.GITCOIN_PASSPORT_API_KEY || '',
    min_score: parseInt(process.env.GITCOIN_PASSPORT_MIN_SCORE || '20', 10),
  }
}

/**
 * Get configuration for BrightID
 */
export function getBrightIDConfig(): BrightIDConfig {
  return {
    context: process.env.BRIGHTID_CONTEXT || 'pohi',
    node_url:
      process.env.BRIGHTID_NODE_URL || 'https://app.brightid.org/node/v5',
  }
}

/**
 * Get configuration for Civic
 */
export function getCivicConfig(): CivicConfig {
  return {
    gatekeeper_network:
      process.env.CIVIC_GATEKEEPER_NETWORK ||
      'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
  }
}

/**
 * Get configuration for Proof of Humanity
 */
export function getProofOfHumanityConfig(): ProofOfHumanityConfig {
  return {
    subgraph_url:
      process.env.POH_SUBGRAPH_URL ||
      'https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-mainnet',
  }
}

/**
 * Get provider configuration by provider ID
 */
export function getProviderConfig(provider: string): unknown {
  switch (provider) {
    case POP_PROVIDERS.GITCOIN_PASSPORT:
      return getGitcoinPassportConfig()
    case POP_PROVIDERS.BRIGHTID:
      return getBrightIDConfig()
    case POP_PROVIDERS.CIVIC:
      return getCivicConfig()
    case POP_PROVIDERS.PROOF_OF_HUMANITY:
      return getProofOfHumanityConfig()
    default:
      return {}
  }
}

/**
 * Check if mock mode is enabled
 */
export function isMockModeEnabled(): boolean {
  return process.env.POHI_MOCK_PROVIDERS === 'true'
}
