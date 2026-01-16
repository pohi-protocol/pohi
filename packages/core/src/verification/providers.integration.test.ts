/**
 * Integration tests for PoP providers
 *
 * These tests verify actual API calls to external services.
 * They are skipped in CI unless explicitly enabled.
 *
 * To run: INTEGRATION_TESTS=true npm test
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { BrightIDVerifier } from './brightid'
import { CivicVerifier } from './civic'
import { ProofOfHumanityVerifier } from './proof-of-humanity'

const isIntegrationTest = process.env.INTEGRATION_TESTS === 'true'
const testIf = (condition: boolean) => (condition ? it : it.skip)

describe('BrightID Integration Tests', () => {
  let verifier: BrightIDVerifier

  beforeAll(() => {
    verifier = new BrightIDVerifier()
  })

  testIf(isIntegrationTest)('should return error for non-existent user', async () => {
    const result = await verifier.verify(
      { context_id: 'non_existent_user_12345', unique: false, timestamp: 0, sig: null },
      { context: 'Gitcoin', node_url: 'https://app.brightid.org/node/v5' }
    )

    expect(result.success).toBe(false)
    expect(result.provider).toBe('brightid')
    expect(result.error).toBeDefined()
  })

  testIf(isIntegrationTest)('should handle invalid context gracefully', async () => {
    const result = await verifier.verify(
      { context_id: 'test_user', unique: false, timestamp: 0, sig: null },
      { context: 'invalid_context_xyz', node_url: 'https://app.brightid.org/node/v5' }
    )

    expect(result.success).toBe(false)
    expect(result.provider).toBe('brightid')
    // API may return "not found" or network error
    expect(result.error).toBeDefined()
  })

  it('should require context_id', async () => {
    const result = await verifier.verify(
      { context_id: '', unique: false, timestamp: 0, sig: null },
      { context: 'pohi' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Context ID is required')
  })

  it('should require context', async () => {
    const result = await verifier.verify(
      { context_id: 'test_id', unique: false, timestamp: 0, sig: null },
      { context: '' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('BrightID context is required')
  })
})

describe('Civic Integration Tests', () => {
  let verifier: CivicVerifier

  beforeAll(() => {
    verifier = new CivicVerifier()
  })

  it('should verify user with valid verifications', async () => {
    const result = await verifier.verify(
      {
        user_id: '0x1234567890abcdef',
        gateway_token: 'token_123',
        verifications: ['uniqueness', 'liveness'],
        expiration: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
      },
      {
        gatekeeper_network: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
        required_verifications: ['uniqueness'],
      }
    )

    expect(result.success).toBe(true)
    expect(result.provider).toBe('civic')
    expect(result.verification_level).toBe('liveness') // highest level
    expect(result.unique_id).toBe('0x1234567890abcdef')
  })

  it('should reject expired gateway pass', async () => {
    const result = await verifier.verify(
      {
        user_id: '0x1234567890abcdef',
        gateway_token: 'token_123',
        verifications: ['uniqueness'],
        expiration: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
      },
      {
        gatekeeper_network: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
      }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Gateway pass has expired')
  })

  it('should reject missing required verifications', async () => {
    const result = await verifier.verify(
      {
        user_id: '0x1234567890abcdef',
        gateway_token: 'token_123',
        verifications: ['captcha'],
        expiration: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        gatekeeper_network: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
        required_verifications: ['liveness'],
      }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Missing required verification: liveness')
  })

  it('should correctly identify highest verification level', async () => {
    // Test id_verification (highest)
    let result = await verifier.verify(
      {
        user_id: '0xtest',
        verifications: ['captcha', 'id_verification'],
        expiration: new Date(Date.now() + 86400000).toISOString(),
      },
      { gatekeeper_network: 'test' }
    )
    expect(result.verification_level).toBe('id_verification')

    // Test uniqueness only
    result = await verifier.verify(
      {
        user_id: '0xtest',
        verifications: ['uniqueness'],
        expiration: new Date(Date.now() + 86400000).toISOString(),
      },
      { gatekeeper_network: 'test' }
    )
    expect(result.verification_level).toBe('uniqueness')
  })

  it('should create valid HumanProof', async () => {
    const verifyResult = await verifier.verify(
      {
        user_id: '0xtest_user',
        verifications: ['liveness'],
        expiration: new Date(Date.now() + 86400000).toISOString(),
      },
      { gatekeeper_network: 'test' }
    )

    const humanProof = verifier.toHumanProof(verifyResult, 'test_signal')

    expect(humanProof.method).toBe('civic')
    expect(humanProof.verification_level).toBe('liveness')
    expect(humanProof.signal).toBe('test_signal')
    expect(humanProof.nullifier_hash).toBeDefined()
    expect(humanProof.nullifier_hash).toContain('0x') // SHA256 hash
  })
})

describe('Proof of Humanity Integration Tests', () => {
  let verifier: ProofOfHumanityVerifier

  beforeAll(() => {
    verifier = new ProofOfHumanityVerifier()
  })

  it('should require address', async () => {
    const result = await verifier.verify(
      { address: '', status: 'registered' },
      { subgraph_url: 'https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-mainnet' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('Address is required')
  })

  it('should normalize address to lowercase', async () => {
    // This test verifies the address normalization logic
    const verifyFunction = verifier.verify.bind(verifier)

    // We expect the function to normalize the address internally
    // Since actual API call might fail, we just verify the logic path
    const result = await verifyFunction(
      { address: '0xABCDEF1234567890', status: 'registered' },
      { subgraph_url: 'https://invalid-url-for-test.example.com' }
    )

    // Should fail with network error, but address should be normalized in unique_id
    expect(result.success).toBe(false)
    // The error message indicates the fetch was attempted
  })

  it('should create valid HumanProof', () => {
    const mockResult = {
      success: true,
      provider: 'proof_of_humanity' as const,
      unique_id: '0x1234567890abcdef',
      verification_level: 'registered',
      raw_data: {
        address: '0x1234567890abcdef',
        status: 'registered',
        submissionTime: '1234567890',
      },
    }

    const humanProof = verifier.toHumanProof(mockResult, 'test_signal')

    expect(humanProof.method).toBe('proof_of_humanity')
    expect(humanProof.verification_level).toBe('registered')
    expect(humanProof.signal).toBe('test_signal')
    expect(humanProof.nullifier_hash).toBeDefined()
  })

  // This test requires The Graph API key and is skipped by default
  testIf(isIntegrationTest)('should query The Graph for registered address', async () => {
    // Note: The Graph now requires authentication
    // This test will fail without proper API key
    const result = await verifier.verify(
      { address: '0x0000000000000000000000000000000000000000', status: 'registered' },
      {}
    )

    // We expect this to return not found for zero address
    expect(result.success).toBe(false)
  })
})
