import { describe, it, expect } from 'vitest'
import {
  getProviderName,
  getProviderDocsUrl,
  isKnownProvider,
  getProviderFeatures,
  GITCOIN_PASSPORT_THRESHOLDS,
} from './providers'
import { POP_PROVIDERS } from './types'

describe('getProviderName', () => {
  it('should return human-readable name for World ID', () => {
    expect(getProviderName(POP_PROVIDERS.WORLD_ID)).toBe('World ID')
  })

  it('should return human-readable name for Gitcoin Passport', () => {
    expect(getProviderName(POP_PROVIDERS.GITCOIN_PASSPORT)).toBe('Gitcoin Passport')
  })

  it('should return human-readable name for BrightID', () => {
    expect(getProviderName(POP_PROVIDERS.BRIGHTID)).toBe('BrightID')
  })

  it('should return human-readable name for Civic', () => {
    expect(getProviderName(POP_PROVIDERS.CIVIC)).toBe('Civic')
  })

  it('should return human-readable name for Proof of Humanity', () => {
    expect(getProviderName(POP_PROVIDERS.PROOF_OF_HUMANITY)).toBe('Proof of Humanity')
  })

  it('should return original string for unknown provider', () => {
    expect(getProviderName('unknown_provider')).toBe('unknown_provider')
  })
})

describe('getProviderDocsUrl', () => {
  it('should return docs URL for World ID', () => {
    expect(getProviderDocsUrl(POP_PROVIDERS.WORLD_ID)).toBe('https://docs.world.org/world-id')
  })

  it('should return docs URL for Gitcoin Passport', () => {
    expect(getProviderDocsUrl(POP_PROVIDERS.GITCOIN_PASSPORT)).toBe('https://docs.passport.gitcoin.co')
  })

  it('should return empty string for unknown provider', () => {
    expect(getProviderDocsUrl('unknown_provider')).toBe('')
  })
})

describe('isKnownProvider', () => {
  it('should return true for known providers', () => {
    expect(isKnownProvider(POP_PROVIDERS.WORLD_ID)).toBe(true)
    expect(isKnownProvider(POP_PROVIDERS.GITCOIN_PASSPORT)).toBe(true)
    expect(isKnownProvider(POP_PROVIDERS.BRIGHTID)).toBe(true)
    expect(isKnownProvider(POP_PROVIDERS.CIVIC)).toBe(true)
    expect(isKnownProvider(POP_PROVIDERS.PROOF_OF_HUMANITY)).toBe(true)
  })

  it('should return false for unknown provider', () => {
    expect(isKnownProvider('unknown_provider')).toBe(false)
  })
})

describe('getProviderFeatures', () => {
  it('should return features for World ID', () => {
    const features = getProviderFeatures(POP_PROVIDERS.WORLD_ID)
    expect(features.zk_proofs).toBe(true)
    expect(features.sybil_resistance).toBe(5)
    expect(features.requires_hardware).toBe(true)
    expect(features.onchain_verification).toBe(true)
  })

  it('should return features for Gitcoin Passport', () => {
    const features = getProviderFeatures(POP_PROVIDERS.GITCOIN_PASSPORT)
    expect(features.zk_proofs).toBe(false)
    expect(features.sybil_resistance).toBe(3)
    expect(features.requires_hardware).toBe(false)
    expect(features.global_availability).toBe(true)
  })

  it('should return features for BrightID', () => {
    const features = getProviderFeatures(POP_PROVIDERS.BRIGHTID)
    expect(features.zk_proofs).toBe(false)
    expect(features.sybil_resistance).toBe(3)
    expect(features.onchain_verification).toBe(true)
  })

  it('should return default features for unknown provider', () => {
    const features = getProviderFeatures('unknown_provider')
    expect(features.zk_proofs).toBe(false)
    expect(features.sybil_resistance).toBe(1)
    expect(features.onchain_verification).toBe(false)
  })
})

describe('GITCOIN_PASSPORT_THRESHOLDS', () => {
  it('should have correct threshold values', () => {
    expect(GITCOIN_PASSPORT_THRESHOLDS.BASIC).toBe(15)
    expect(GITCOIN_PASSPORT_THRESHOLDS.TRUSTED).toBe(25)
    expect(GITCOIN_PASSPORT_THRESHOLDS.HIGH_TRUST).toBe(35)
  })
})
