import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  computeEvmAttestationHash,
  computeEvmSignal,
  commitShaToBytes32,
  nullifierToBytes32,
  toEvmAttestation,
  isHexString,
  isBytes32,
} from './index'
import type { HumanApprovalAttestation, ApprovalSubject, HumanProof } from 'pohi-core'

// ============ Test Fixtures ============

const validSubject: ApprovalSubject = {
  repository: 'owner/repo',
  commit_sha: 'abc123def456',
  action: 'DEPLOY',
  description: 'Production deployment',
}

const validProof: HumanProof = {
  method: 'world_id',
  verification_level: 'orb',
  nullifier_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  signal: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
}

const createTestAttestation = (timestamp: string): HumanApprovalAttestation => ({
  version: '1.0',
  type: 'HumanApprovalAttestation',
  subject: validSubject,
  human_proof: validProof,
  timestamp,
})

// ============ computeEvmAttestationHash Tests ============

describe('computeEvmAttestationHash', () => {
  it('should return keccak256 hash with 0x prefix', () => {
    const attestation = createTestAttestation('2024-01-15T10:30:00.000Z')
    const hash = computeEvmAttestationHash(attestation)

    expect(hash).toMatch(/^0x[a-f0-9]{64}$/)
  })

  it('should return consistent hash for same attestation', () => {
    const attestation = createTestAttestation('2024-01-15T10:30:00.000Z')
    const hash1 = computeEvmAttestationHash(attestation)
    const hash2 = computeEvmAttestationHash(attestation)

    expect(hash1).toBe(hash2)
  })

  it('should return different hash for different repository', () => {
    const attestation1 = createTestAttestation('2024-01-15T10:30:00.000Z')
    const attestation2 = {
      ...attestation1,
      subject: { ...validSubject, repository: 'other/repo' },
    }

    const hash1 = computeEvmAttestationHash(attestation1)
    const hash2 = computeEvmAttestationHash(attestation2)

    expect(hash1).not.toBe(hash2)
  })

  it('should return different hash for different timestamp', () => {
    const attestation1 = createTestAttestation('2024-01-15T10:30:00.000Z')
    const attestation2 = createTestAttestation('2024-01-15T10:31:00.000Z')

    const hash1 = computeEvmAttestationHash(attestation1)
    const hash2 = computeEvmAttestationHash(attestation2)

    expect(hash1).not.toBe(hash2)
  })
})

// ============ computeEvmSignal Tests ============

describe('computeEvmSignal', () => {
  it('should return keccak256 hash with 0x prefix', () => {
    const signal = computeEvmSignal('owner/repo', 'abc123')
    expect(signal).toMatch(/^0x[a-f0-9]{64}$/)
  })

  it('should return consistent signal for same input', () => {
    const signal1 = computeEvmSignal('owner/repo', 'abc123')
    const signal2 = computeEvmSignal('owner/repo', 'abc123')
    expect(signal1).toBe(signal2)
  })

  it('should return different signal for different repository', () => {
    const signal1 = computeEvmSignal('owner/repo1', 'abc123')
    const signal2 = computeEvmSignal('owner/repo2', 'abc123')
    expect(signal1).not.toBe(signal2)
  })

  it('should return different signal for different commit', () => {
    const signal1 = computeEvmSignal('owner/repo', 'abc123')
    const signal2 = computeEvmSignal('owner/repo', 'def456')
    expect(signal1).not.toBe(signal2)
  })
})

// ============ commitShaToBytes32 Tests ============

describe('commitShaToBytes32', () => {
  it('should pad short commit SHA to 64 characters', () => {
    const result = commitShaToBytes32('abc123')
    expect(result).toBe('0xabc1230000000000000000000000000000000000000000000000000000000000')
  })

  it('should handle 0x prefix', () => {
    const result = commitShaToBytes32('0xabc123')
    expect(result).toBe('0xabc1230000000000000000000000000000000000000000000000000000000000')
  })

  it('should handle full 64-char SHA', () => {
    const fullSha = 'a'.repeat(64)
    const result = commitShaToBytes32(fullSha)
    expect(result).toBe(`0x${fullSha}`)
  })
})

// ============ nullifierToBytes32 Tests ============

describe('nullifierToBytes32', () => {
  it('should return value with 0x prefix if already has one', () => {
    const result = nullifierToBytes32('0x1234')
    expect(result).toBe('0x1234')
  })

  it('should add 0x prefix if missing', () => {
    const result = nullifierToBytes32('1234')
    expect(result).toBe('0x1234')
  })
})

// ============ toEvmAttestation Tests ============

describe('toEvmAttestation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should convert attestation to EVM format', () => {
    const attestation = createTestAttestation('2024-01-15T10:30:00.000Z')
    const evmAttestation = toEvmAttestation(attestation)

    expect(evmAttestation.attestationHash).toMatch(/^0x[a-f0-9]{64}$/)
    expect(evmAttestation.repository).toBe('owner/repo')
    expect(evmAttestation.commitSha).toMatch(/^0x[a-f0-9]{64}$/)
    expect(evmAttestation.nullifierHash).toMatch(/^0x/)
    expect(evmAttestation.verificationLevel).toBe(1) // orb = 1
    expect(evmAttestation.timestamp).toBe(BigInt(1705314600)) // 2024-01-15T10:30:00.000Z in seconds
  })

  it('should convert verification level correctly', () => {
    const attestationDevice = createTestAttestation('2024-01-15T10:30:00.000Z')
    attestationDevice.human_proof.verification_level = 'device'
    expect(toEvmAttestation(attestationDevice).verificationLevel).toBe(0)

    const attestationOrb = createTestAttestation('2024-01-15T10:30:00.000Z')
    attestationOrb.human_proof.verification_level = 'orb'
    expect(toEvmAttestation(attestationOrb).verificationLevel).toBe(1)

    const attestationSecure = createTestAttestation('2024-01-15T10:30:00.000Z')
    attestationSecure.human_proof.verification_level = 'secure_document'
    expect(toEvmAttestation(attestationSecure).verificationLevel).toBe(2)
  })
})

// ============ isHexString Tests ============

describe('isHexString', () => {
  it('should return true for valid hex string', () => {
    expect(isHexString('0x1234abcd')).toBe(true)
    expect(isHexString('0xABCDEF')).toBe(true)
    expect(isHexString('0x0')).toBe(true)
    expect(isHexString('0x')).toBe(true)
  })

  it('should return false for invalid hex string', () => {
    expect(isHexString('1234')).toBe(false)
    expect(isHexString('0xGHIJ')).toBe(false)
    expect(isHexString('hello')).toBe(false)
    expect(isHexString('')).toBe(false)
  })
})

// ============ isBytes32 Tests ============

describe('isBytes32', () => {
  it('should return true for valid bytes32', () => {
    const valid = '0x' + 'a'.repeat(64)
    expect(isBytes32(valid)).toBe(true)
  })

  it('should return false for too short hex', () => {
    const short = '0x' + 'a'.repeat(63)
    expect(isBytes32(short)).toBe(false)
  })

  it('should return false for too long hex', () => {
    const long = '0x' + 'a'.repeat(65)
    expect(isBytes32(long)).toBe(false)
  })

  it('should return false for non-hex', () => {
    expect(isBytes32('hello')).toBe(false)
  })
})
