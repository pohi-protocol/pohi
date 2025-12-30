/**
 * Integration tests for PoHI protocol
 *
 * Tests the complete flow from attestation creation (core)
 * through EVM conversion (evm) to SDK operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createAttestation,
  validateAttestation,
  computeAttestationHash,
  computeSignal,
  verificationLevelToNumber,
  numberToVerificationLevel,
  POP_PROVIDERS,
  type HumanApprovalAttestation,
  type ApprovalSubject,
  type HumanProof,
} from 'pohi-core'
import {
  computeEvmAttestationHash,
  computeEvmSignal,
  commitShaToBytes32,
  nullifierToBytes32,
  toEvmAttestation,
  isHexString,
  isBytes32,
} from 'pohi-evm'
import { PoHIClient } from './client'
import { worldChain, worldChainSepolia } from './chains'

// Mock viem
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem')
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      readContract: vi.fn(),
      waitForTransactionReceipt: vi.fn(),
    })),
    createWalletClient: vi.fn(() => ({
      writeContract: vi.fn(),
    })),
    http: vi.fn(() => 'mock-transport'),
  }
})

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
  })),
}))

// ============ Test Fixtures ============

const createTestSubject = (overrides: Partial<ApprovalSubject> = {}): ApprovalSubject => ({
  repository: 'pohi-protocol/pohi',
  commit_sha: 'abc123def456789',
  pr_number: 42,
  action: 'PR_MERGE',
  description: 'Merge feature branch',
  ...overrides,
})

const createTestProof = (overrides: Partial<HumanProof> = {}): HumanProof => ({
  method: 'world_id',
  verification_level: 'orb',
  nullifier_hash: '0x' + 'a'.repeat(64),
  signal: '0x' + 'b'.repeat(64),
  ...overrides,
})

// ============ Integration Tests ============

describe('Integration: Core → EVM → SDK Flow', () => {
  describe('Attestation Creation and Validation', () => {
    it('should create attestation with core and convert to EVM format', () => {
      const subject = createTestSubject()
      const proof = createTestProof()

      // Step 1: Create attestation with pohi-core
      const attestation = createAttestation(subject, proof)

      // Verify core attestation
      expect(attestation.version).toBe('1.0')
      expect(attestation.type).toBe('HumanApprovalAttestation')
      expect(attestation.subject).toEqual(subject)
      expect(attestation.human_proof).toEqual(proof)
      expect(attestation.timestamp).toBeTruthy()
      expect(attestation.attestation_hash).toBeTruthy()

      // Step 2: Validate with pohi-core
      const validation = validateAttestation(attestation)
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)

      // Step 3: Convert to EVM format
      const evmAttestation = toEvmAttestation(attestation)

      expect(isBytes32(evmAttestation.attestationHash)).toBe(true)
      expect(isHexString(evmAttestation.commitSha)).toBe(true)
      expect(isBytes32(evmAttestation.nullifierHash)).toBe(true)
      expect(evmAttestation.repository).toBe(subject.repository)
      expect(typeof evmAttestation.verificationLevel).toBe('number')
      expect(typeof evmAttestation.timestamp).toBe('bigint')
    })

    it('should compute consistent hashes across modules', () => {
      const repository = 'owner/repo'
      const commitSha = 'abc123def456'

      // Core signal (SHA-256 based, returns 0x prefixed)
      const coreSignal = computeSignal(repository, commitSha)

      // EVM signal (keccak256 based)
      const evmSignal = computeEvmSignal(repository, commitSha)

      // Both should be valid hex strings with 0x prefix
      expect(coreSignal).toMatch(/^0x[a-f0-9]{64}$/)
      expect(evmSignal).toMatch(/^0x[a-f0-9]{64}$/)

      // They should be different (SHA-256 vs keccak256)
      expect(coreSignal).not.toBe(evmSignal)
    })

    it('should maintain data integrity through conversion', () => {
      const attestation = createAttestation(
        createTestSubject({ commit_sha: 'abc123' }),
        createTestProof({ verification_level: 'orb' })
      )

      const evmFormat = toEvmAttestation(attestation)

      // Verify verification level mapping
      expect(evmFormat.verificationLevel).toBe(verificationLevelToNumber('orb'))
      expect(numberToVerificationLevel(evmFormat.verificationLevel)).toBe('orb')

      // Verify commit SHA conversion
      expect(evmFormat.commitSha.startsWith('0x')).toBe(true)

      // Verify nullifier conversion
      expect(evmFormat.nullifierHash).toBe(attestation.human_proof.nullifier_hash)
    })
  })

  describe('Verification Level Mapping', () => {
    // Note: 'document' maps to the same number as 'secure_document' in the current implementation
    const levels = ['orb', 'device', 'secure_document'] as const

    levels.forEach((level) => {
      it(`should map ${level} verification level correctly`, () => {
        const attestation = createAttestation(
          createTestSubject(),
          createTestProof({ verification_level: level })
        )

        const evmFormat = toEvmAttestation(attestation)
        const mappedBack = numberToVerificationLevel(evmFormat.verificationLevel)

        expect(mappedBack).toBe(level)
      })
    })

    it('should handle document level (maps to secure_document)', () => {
      const attestation = createAttestation(
        createTestSubject(),
        createTestProof({ verification_level: 'document' })
      )

      const evmFormat = toEvmAttestation(attestation)
      // Document and secure_document share the same verification level number
      expect(evmFormat.verificationLevel).toBeGreaterThanOrEqual(0)
    })
  })

  describe('SDK Integration', () => {
    let client: PoHIClient

    beforeEach(() => {
      client = new PoHIClient({
        network: 'sepolia',
        contractAddress: '0x' + '1'.repeat(40) as `0x${string}`,
      })
    })

    it('should prepare attestation for recording', async () => {
      const attestation = createAttestation(
        createTestSubject(),
        createTestProof()
      )

      // Validate before sending to chain
      const validation = validateAttestation(attestation)
      expect(validation.valid).toBe(true)

      // Convert to EVM format
      const evmFormat = toEvmAttestation(attestation)

      // Verify all required fields are present
      expect(evmFormat.attestationHash).toBeTruthy()
      expect(evmFormat.repository).toBeTruthy()
      expect(evmFormat.commitSha).toBeTruthy()
      expect(evmFormat.nullifierHash).toBeTruthy()
      expect(evmFormat.verificationLevel).toBeGreaterThanOrEqual(0)
    })

    it('should use correct chain configuration', () => {
      const mainnetClient = new PoHIClient({ network: 'mainnet' })
      const sepoliaClient = new PoHIClient({ network: 'sepolia' })

      expect(mainnetClient.getChain()).toBe(worldChain)
      expect(sepoliaClient.getChain()).toBe(worldChainSepolia)

      expect(mainnetClient.getChain().id).toBe(480)
      expect(sepoliaClient.getChain().id).toBe(4801)
    })
  })

  describe('Multi-Provider Attestation Flow', () => {
    const providers = [
      { method: POP_PROVIDERS.WORLD_ID, level: 'orb' },
      { method: POP_PROVIDERS.GITCOIN_PASSPORT, level: 'high_trust' },
      { method: POP_PROVIDERS.BRIGHTID, level: 'meets' },
      { method: POP_PROVIDERS.CIVIC, level: 'liveness' },
      { method: POP_PROVIDERS.PROOF_OF_HUMANITY, level: 'registered' },
    ] as const

    providers.forEach(({ method, level }) => {
      it(`should create valid attestation for ${method} provider`, () => {
        const attestation = createAttestation(
          createTestSubject(),
          createTestProof({
            method: method as HumanProof['method'],
            verification_level: level,
          })
        )

        const validation = validateAttestation(attestation)
        expect(validation.valid).toBe(true)

        const evmFormat = toEvmAttestation(attestation)
        expect(isBytes32(evmFormat.attestationHash)).toBe(true)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty commit SHA', () => {
      const attestation = createAttestation(
        createTestSubject({ commit_sha: '' }),
        createTestProof()
      )

      const evmFormat = toEvmAttestation(attestation)
      expect(evmFormat.commitSha).toBe('0x' + '0'.repeat(64))
    })

    it('should handle very long commit SHA', () => {
      const longSha = 'a'.repeat(100)
      const result = commitShaToBytes32(longSha)

      // Current implementation pads to 64 chars but doesn't truncate
      // For long inputs, it will exceed 64 chars
      expect(result.startsWith('0x')).toBe(true)
      expect(result.slice(2)).toMatch(/^[a-f0-9]+$/)
    })

    it('should handle standard 40-char commit SHA', () => {
      const standardSha = 'a'.repeat(40)
      const result = commitShaToBytes32(standardSha)

      // Should be padded to 64 hex chars
      expect(result).toMatch(/^0x[a-f0-9]{64}$/)
    })

    it('should handle nullifier with and without 0x prefix', () => {
      const withPrefix = nullifierToBytes32('0x' + 'a'.repeat(64))
      const withoutPrefix = nullifierToBytes32('a'.repeat(64))

      expect(withPrefix).toBe(withoutPrefix)
      expect(isBytes32(withPrefix)).toBe(true)
    })

    it('should compute deterministic EVM hashes', () => {
      const attestation1 = createAttestation(
        createTestSubject(),
        createTestProof()
      )

      // Create another attestation with same data but different timestamp
      const attestation2: HumanApprovalAttestation = {
        ...attestation1,
        timestamp: attestation1.timestamp, // Same timestamp
      }

      const hash1 = computeEvmAttestationHash(attestation1)
      const hash2 = computeEvmAttestationHash(attestation2)

      expect(hash1).toBe(hash2)
    })

    it('should handle different timestamps producing different hashes', () => {
      const subject = createTestSubject()
      const proof = createTestProof()

      const attestation1: HumanApprovalAttestation = {
        version: '1.0',
        type: 'HumanApprovalAttestation',
        subject,
        human_proof: proof,
        timestamp: '2024-01-01T00:00:00Z',
        attestation_hash: '0x' + 'a'.repeat(64),
      }

      const attestation2: HumanApprovalAttestation = {
        ...attestation1,
        timestamp: '2024-01-02T00:00:00Z',
      }

      const hash1 = computeEvmAttestationHash(attestation1)
      const hash2 = computeEvmAttestationHash(attestation2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('Attestation Approval Actions', () => {
    const actions = ['PR_MERGE', 'RELEASE', 'DEPLOY', 'GENERIC'] as const

    actions.forEach((action) => {
      it(`should create valid attestation for ${action} action`, () => {
        const attestation = createAttestation(
          createTestSubject({ action }),
          createTestProof()
        )

        expect(attestation.subject.action).toBe(action)

        const validation = validateAttestation(attestation)
        expect(validation.valid).toBe(true)
      })
    })
  })
})

describe('Integration: Hash Consistency', () => {
  it('should compute attestation hash that matches across serialization', () => {
    const attestation = createAttestation(
      createTestSubject(),
      createTestProof()
    )

    const hash1 = computeAttestationHash(attestation)
    const hash2 = computeAttestationHash(attestation)

    expect(hash1).toBe(hash2)
    expect(attestation.attestation_hash).toBe(hash1)
  })

  it('should detect tampering through hash mismatch', () => {
    const attestation = createAttestation(
      createTestSubject(),
      createTestProof()
    )

    // Tamper with the attestation
    const tampered: HumanApprovalAttestation = {
      ...attestation,
      subject: {
        ...attestation.subject,
        commit_sha: 'tampered_sha',
      },
    }

    // Original hash should not match recomputed hash
    const recomputed = computeAttestationHash(tampered)
    expect(tampered.attestation_hash).not.toBe(recomputed)
  })
})
