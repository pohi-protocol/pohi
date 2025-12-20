import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POP_PROVIDERS } from '../types'
import {
  MockVerifier,
  isMockMode,
  getVerifier,
  hasVerifier,
  getAvailableProviders,
} from './mock'
import { GitcoinPassportVerifier } from './gitcoin-passport'
import { BrightIDVerifier } from './brightid'
import { CivicVerifier } from './civic'
import { ProofOfHumanityVerifier } from './proof-of-humanity'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('MockVerifier', () => {
  it('should return success for any provider', async () => {
    const verifier = new MockVerifier('test_provider')
    const result = await verifier.verify({}, {})

    expect(result.success).toBe(true)
    expect(result.provider).toBe('test_provider')
    expect(result.unique_id).toContain('mock_test_provider_')
    expect(result.verification_level).toBe('mock')
  })

  it('should create valid HumanProof', async () => {
    const verifier = new MockVerifier('test_provider')
    const result = await verifier.verify({}, {})
    const humanProof = verifier.toHumanProof(result, 'test_signal')

    expect(humanProof.method).toBe('test_provider')
    expect(humanProof.verification_level).toBe('mock')
    expect(humanProof.signal).toBe('test_signal')
    expect(humanProof.nullifier_hash).toBeTruthy()
  })
})

describe('isMockMode', () => {
  const originalEnv = process.env.POHI_MOCK_PROVIDERS

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.POHI_MOCK_PROVIDERS
    } else {
      process.env.POHI_MOCK_PROVIDERS = originalEnv
    }
  })

  it('should return false when not set', () => {
    delete process.env.POHI_MOCK_PROVIDERS
    expect(isMockMode()).toBe(false)
  })

  it('should return true when set to "true"', () => {
    process.env.POHI_MOCK_PROVIDERS = 'true'
    expect(isMockMode()).toBe(true)
  })

  it('should return false when set to other value', () => {
    process.env.POHI_MOCK_PROVIDERS = 'false'
    expect(isMockMode()).toBe(false)
  })
})

describe('getVerifier', () => {
  const originalEnv = process.env.POHI_MOCK_PROVIDERS

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.POHI_MOCK_PROVIDERS
    } else {
      process.env.POHI_MOCK_PROVIDERS = originalEnv
    }
  })

  it('should return MockVerifier in mock mode', () => {
    process.env.POHI_MOCK_PROVIDERS = 'true'
    const verifier = getVerifier('any_provider')
    expect(verifier).toBeInstanceOf(MockVerifier)
  })

  it('should return registered verifier when not in mock mode', () => {
    delete process.env.POHI_MOCK_PROVIDERS
    const verifier = getVerifier(POP_PROVIDERS.GITCOIN_PASSPORT)
    expect(verifier).toBeInstanceOf(GitcoinPassportVerifier)
  })

  it('should throw for unknown provider when not in mock mode', () => {
    delete process.env.POHI_MOCK_PROVIDERS
    expect(() => getVerifier('unknown_provider')).toThrow()
  })
})

describe('hasVerifier', () => {
  const originalEnv = process.env.POHI_MOCK_PROVIDERS

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.POHI_MOCK_PROVIDERS
    } else {
      process.env.POHI_MOCK_PROVIDERS = originalEnv
    }
  })

  it('should return true for registered providers', () => {
    delete process.env.POHI_MOCK_PROVIDERS
    expect(hasVerifier(POP_PROVIDERS.GITCOIN_PASSPORT)).toBe(true)
    expect(hasVerifier(POP_PROVIDERS.BRIGHTID)).toBe(true)
    expect(hasVerifier(POP_PROVIDERS.CIVIC)).toBe(true)
    expect(hasVerifier(POP_PROVIDERS.PROOF_OF_HUMANITY)).toBe(true)
  })

  it('should return true for any provider in mock mode', () => {
    process.env.POHI_MOCK_PROVIDERS = 'true'
    expect(hasVerifier('any_provider')).toBe(true)
  })
})

describe('getAvailableProviders', () => {
  const originalEnv = process.env.POHI_MOCK_PROVIDERS

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.POHI_MOCK_PROVIDERS
    } else {
      process.env.POHI_MOCK_PROVIDERS = originalEnv
    }
  })

  it('should return all providers in mock mode', () => {
    process.env.POHI_MOCK_PROVIDERS = 'true'
    const providers = getAvailableProviders()
    expect(providers).toContain(POP_PROVIDERS.WORLD_ID)
    expect(providers).toContain(POP_PROVIDERS.GITCOIN_PASSPORT)
    expect(providers).toContain(POP_PROVIDERS.BRIGHTID)
    expect(providers).toContain(POP_PROVIDERS.CIVIC)
    expect(providers).toContain(POP_PROVIDERS.PROOF_OF_HUMANITY)
  })
})

describe('GitcoinPassportVerifier', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should verify valid passport with sufficient score', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        address: '0x1234567890123456789012345678901234567890',
        score: '25.5',
        status: 'DONE',
        last_score_timestamp: '2024-01-01T00:00:00Z',
      }),
    })

    const verifier = new GitcoinPassportVerifier()
    const result = await verifier.verify(
      { address: '0x1234567890123456789012345678901234567890', score: 0, score_timestamp: '' },
      { api_key: 'test_key', min_score: 20 }
    )

    expect(result.success).toBe(true)
    expect(result.verification_level).toBe('trusted')
  })

  it('should reject passport below min score', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        address: '0x1234567890123456789012345678901234567890',
        score: '10',
        status: 'DONE',
        last_score_timestamp: '2024-01-01T00:00:00Z',
      }),
    })

    const verifier = new GitcoinPassportVerifier()
    const result = await verifier.verify(
      { address: '0x1234567890123456789012345678901234567890', score: 0, score_timestamp: '' },
      { api_key: 'test_key', min_score: 20 }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('below minimum threshold')
  })

  it('should require address', async () => {
    const verifier = new GitcoinPassportVerifier()
    const result = await verifier.verify(
      { address: '', score: 0, score_timestamp: '' },
      { api_key: 'test_key' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Address is required')
  })

  it('should require API key', async () => {
    const verifier = new GitcoinPassportVerifier()
    const result = await verifier.verify(
      { address: '0x123', score: 0, score_timestamp: '' },
      { api_key: '' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Gitcoin Passport API key is required')
  })
})

describe('BrightIDVerifier', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should verify unique BrightID user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          unique: true,
          contextIds: ['test_context_id'],
          timestamp: Date.now(),
          verification: 'meets',
        },
      }),
    })

    const verifier = new BrightIDVerifier()
    const result = await verifier.verify(
      { context_id: 'test_context_id', unique: false, timestamp: 0, sig: { r: '', s: '', v: 0 } },
      { context: 'pohi' }
    )

    expect(result.success).toBe(true)
    expect(result.verification_level).toBe('meets')
  })

  it('should reject non-unique user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          unique: false,
          contextIds: ['test_context_id'],
          timestamp: Date.now(),
        },
      }),
    })

    const verifier = new BrightIDVerifier()
    const result = await verifier.verify(
      { context_id: 'test_context_id', unique: false, timestamp: 0, sig: { r: '', s: '', v: 0 } },
      { context: 'pohi' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('not verified as unique')
  })

  it('should require context_id', async () => {
    const verifier = new BrightIDVerifier()
    const result = await verifier.verify(
      { context_id: '', unique: false, timestamp: 0, sig: { r: '', s: '', v: 0 } },
      { context: 'pohi' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Context ID is required')
  })
})

describe('CivicVerifier', () => {
  it('should verify valid gateway pass', async () => {
    const verifier = new CivicVerifier()
    const result = await verifier.verify(
      {
        user_id: 'test_user',
        verifications: ['uniqueness', 'liveness'],
      },
      { gatekeeper_network: 'test_network' }
    )

    expect(result.success).toBe(true)
    expect(result.verification_level).toBe('liveness')
  })

  it('should reject expired token', async () => {
    const verifier = new CivicVerifier()
    const result = await verifier.verify(
      {
        user_id: 'test_user',
        verifications: ['uniqueness'],
        expiration: '2020-01-01T00:00:00Z',
      },
      { gatekeeper_network: 'test_network' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('expired')
  })

  it('should check required verification types', async () => {
    const verifier = new CivicVerifier()
    const result = await verifier.verify(
      {
        user_id: 'test_user',
        verifications: ['captcha'],
      },
      { gatekeeper_network: 'test_network', required_verifications: ['uniqueness'] }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('Missing required verification')
  })

  it('should require user_id', async () => {
    const verifier = new CivicVerifier()
    const result = await verifier.verify(
      { user_id: '', verifications: [] },
      { gatekeeper_network: 'test_network' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('User ID is required')
  })
})

describe('ProofOfHumanityVerifier', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should verify registered human', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          submission: {
            id: '0x1234567890123456789012345678901234567890',
            status: 'None',
            registered: true,
            submissionTime: '1640000000',
          },
        },
      }),
    })

    const verifier = new ProofOfHumanityVerifier()
    const result = await verifier.verify(
      { address: '0x1234567890123456789012345678901234567890', status: 'registered' },
      {}
    )

    expect(result.success).toBe(true)
    expect(result.verification_level).toBe('registered')
  })

  it('should reject unregistered address', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          submission: null,
        },
      }),
    })

    const verifier = new ProofOfHumanityVerifier()
    const result = await verifier.verify(
      { address: '0x1234567890123456789012345678901234567890', status: 'registered' },
      {}
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('not found')
  })

  it('should reject challenged submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          submission: {
            id: '0x1234567890123456789012345678901234567890',
            status: 'Challenged',
            registered: false,
            submissionTime: '1640000000',
          },
        },
      }),
    })

    const verifier = new ProofOfHumanityVerifier()
    const result = await verifier.verify(
      { address: '0x1234567890123456789012345678901234567890', status: 'registered' },
      {}
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('challenged')
  })

  it('should require address', async () => {
    const verifier = new ProofOfHumanityVerifier()
    const result = await verifier.verify(
      { address: '', status: 'registered' },
      {}
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Address is required')
  })
})
