import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sha256,
  computeSignal,
  createAttestation,
  validateAttestation,
  isValidAttestation,
  verificationLevelToNumber,
  numberToVerificationLevel,
  getAttestationKey,
  serializeAttestation,
  serializeAttestationPretty,
  parseAttestation,
  canonicalizeAttestation,
  computeAttestationHash,
} from './attestation'
import type { HumanApprovalAttestation, ApprovalSubject, HumanProof } from './types'

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
  nullifier_hash: '0x1234567890abcdef',
  signal: '0xabcdef1234567890',
}

// ============ sha256 Tests ============

describe('sha256', () => {
  it('should return hex string with 0x prefix', () => {
    const hash = sha256('hello')
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/)
  })

  it('should return consistent hash for same input', () => {
    const hash1 = sha256('test')
    const hash2 = sha256('test')
    expect(hash1).toBe(hash2)
  })

  it('should return different hash for different input', () => {
    const hash1 = sha256('test1')
    const hash2 = sha256('test2')
    expect(hash1).not.toBe(hash2)
  })

  it('should handle empty string', () => {
    const hash = sha256('')
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/)
  })

  it('should handle Buffer input', () => {
    const hash = sha256(Buffer.from('hello'))
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/)
  })
})

// ============ computeSignal Tests ============

describe('computeSignal', () => {
  it('should compute signal from repository and commit', () => {
    const signal = computeSignal('owner/repo', 'abc123')
    expect(signal).toMatch(/^0x[a-f0-9]{64}$/)
  })

  it('should return consistent signal for same input', () => {
    const signal1 = computeSignal('owner/repo', 'abc123')
    const signal2 = computeSignal('owner/repo', 'abc123')
    expect(signal1).toBe(signal2)
  })

  it('should return different signal for different repository', () => {
    const signal1 = computeSignal('owner/repo1', 'abc123')
    const signal2 = computeSignal('owner/repo2', 'abc123')
    expect(signal1).not.toBe(signal2)
  })

  it('should return different signal for different commit', () => {
    const signal1 = computeSignal('owner/repo', 'abc123')
    const signal2 = computeSignal('owner/repo', 'def456')
    expect(signal1).not.toBe(signal2)
  })
})

// ============ createAttestation Tests ============

describe('createAttestation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create attestation with correct structure', () => {
    const attestation = createAttestation(validSubject, validProof)

    expect(attestation.version).toBe('1.0')
    expect(attestation.type).toBe('HumanApprovalAttestation')
    expect(attestation.subject).toEqual(validSubject)
    expect(attestation.human_proof).toEqual(validProof)
    expect(attestation.timestamp).toBe('2024-01-15T10:30:00.000Z')
  })

  it('should compute attestation hash', () => {
    const attestation = createAttestation(validSubject, validProof)
    expect(attestation.attestation_hash).toMatch(/^0x[a-f0-9]{64}$/)
  })

  it('should create consistent hash for same input', () => {
    const attestation1 = createAttestation(validSubject, validProof)
    const attestation2 = createAttestation(validSubject, validProof)
    expect(attestation1.attestation_hash).toBe(attestation2.attestation_hash)
  })
})

// ============ validateAttestation Tests ============

describe('validateAttestation', () => {
  it('should validate correct attestation', () => {
    const attestation = createAttestation(validSubject, validProof)
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject invalid version', () => {
    const attestation = createAttestation(validSubject, validProof)
    ;(attestation as any).version = '2.0'
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Unknown version: 2.0')
  })

  it('should reject invalid type', () => {
    const attestation = createAttestation(validSubject, validProof)
    ;(attestation as any).type = 'InvalidType'
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid type: InvalidType')
  })

  it('should reject missing repository', () => {
    const attestation = createAttestation(
      { ...validSubject, repository: '' },
      validProof
    )
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing subject.repository')
  })

  it('should reject missing commit_sha', () => {
    const attestation = createAttestation(
      { ...validSubject, commit_sha: '' },
      validProof
    )
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing subject.commit_sha')
  })

  it('should reject missing action', () => {
    const attestation = createAttestation(
      { ...validSubject, action: '' },
      validProof
    )
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing subject.action')
  })

  it('should reject missing method', () => {
    const attestation = createAttestation(validSubject, {
      ...validProof,
      method: '',
    })
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing human_proof.method')
  })

  it('should reject missing nullifier_hash', () => {
    const attestation = createAttestation(validSubject, {
      ...validProof,
      nullifier_hash: '',
    })
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing human_proof.nullifier_hash')
  })

  it('should reject missing timestamp', () => {
    const attestation = createAttestation(validSubject, validProof)
    ;(attestation as any).timestamp = ''
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing timestamp')
  })

  it('should reject invalid timestamp format', () => {
    const attestation = createAttestation(validSubject, validProof)
    attestation.timestamp = 'invalid-date'
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid timestamp format')
  })

  it('should detect hash tampering', () => {
    const attestation = createAttestation(validSubject, validProof)
    attestation.subject.description = 'Modified description'
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Hash mismatch - attestation data may have been tampered')
  })

  it('should allow unknown action types for extensibility', () => {
    const attestation = createAttestation(
      { ...validSubject, action: 'CUSTOM_ACTION' },
      validProof
    )
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(true)
  })

  it('should allow unknown providers for extensibility', () => {
    const attestation = createAttestation(validSubject, {
      ...validProof,
      method: 'custom_provider',
    })
    const result = validateAttestation(attestation)

    expect(result.valid).toBe(true)
  })
})

// ============ isValidAttestation Tests ============

describe('isValidAttestation', () => {
  it('should return true for valid attestation', () => {
    const attestation = createAttestation(validSubject, validProof)
    expect(isValidAttestation(attestation)).toBe(true)
  })

  it('should return false for invalid attestation', () => {
    const attestation = createAttestation(validSubject, validProof)
    ;(attestation as any).version = '2.0'
    expect(isValidAttestation(attestation)).toBe(false)
  })
})

// ============ verificationLevelToNumber Tests ============

describe('verificationLevelToNumber', () => {
  it('should convert device to 0', () => {
    expect(verificationLevelToNumber('device')).toBe(0)
  })

  it('should convert orb to 1', () => {
    expect(verificationLevelToNumber('orb')).toBe(1)
  })

  it('should convert secure_document to 2', () => {
    expect(verificationLevelToNumber('secure_document')).toBe(2)
  })

  it('should convert document to 2', () => {
    expect(verificationLevelToNumber('document')).toBe(2)
  })

  it('should return 0 for unknown level', () => {
    expect(verificationLevelToNumber('unknown')).toBe(0)
  })

  it('should return 0 for undefined', () => {
    expect(verificationLevelToNumber(undefined)).toBe(0)
  })
})

// ============ numberToVerificationLevel Tests ============

describe('numberToVerificationLevel', () => {
  it('should convert 0 to device', () => {
    expect(numberToVerificationLevel(0)).toBe('device')
  })

  it('should convert 1 to orb', () => {
    expect(numberToVerificationLevel(1)).toBe('orb')
  })

  it('should convert 2 to secure_document', () => {
    expect(numberToVerificationLevel(2)).toBe('secure_document')
  })

  it('should return device for out of range number', () => {
    expect(numberToVerificationLevel(99)).toBe('device')
  })
})

// ============ getAttestationKey Tests ============

describe('getAttestationKey', () => {
  it('should generate key from repository and commit', () => {
    const key = getAttestationKey('owner/repo', 'abc123')
    expect(key).toBe('owner/repo:abc123')
  })
})

// ============ Serialization Tests ============

describe('serializeAttestation', () => {
  it('should serialize to canonical JSON', () => {
    const attestation = createAttestation(validSubject, validProof)
    const json = serializeAttestation(attestation)

    expect(typeof json).toBe('string')
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('should produce consistent output', () => {
    const attestation = createAttestation(validSubject, validProof)
    const json1 = serializeAttestation(attestation)
    const json2 = serializeAttestation(attestation)
    expect(json1).toBe(json2)
  })
})

describe('serializeAttestationPretty', () => {
  it('should serialize to pretty-printed JSON', () => {
    const attestation = createAttestation(validSubject, validProof)
    const json = serializeAttestationPretty(attestation)

    expect(json).toContain('\n')
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

describe('parseAttestation', () => {
  it('should parse JSON string to attestation', () => {
    const attestation = createAttestation(validSubject, validProof)
    const json = JSON.stringify(attestation)
    const parsed = parseAttestation(json)

    expect(parsed.version).toBe(attestation.version)
    expect(parsed.type).toBe(attestation.type)
    expect(parsed.subject).toEqual(attestation.subject)
    expect(parsed.human_proof).toEqual(attestation.human_proof)
  })
})

// ============ canonicalizeAttestation Tests ============

describe('canonicalizeAttestation', () => {
  it('should produce deterministic output regardless of field order', () => {
    const attestation1: HumanApprovalAttestation = {
      version: '1.0',
      type: 'HumanApprovalAttestation',
      subject: validSubject,
      human_proof: validProof,
      timestamp: '2024-01-15T10:30:00.000Z',
    }

    // Create same attestation with different field order
    const attestation2: HumanApprovalAttestation = {
      timestamp: '2024-01-15T10:30:00.000Z',
      human_proof: validProof,
      type: 'HumanApprovalAttestation',
      subject: validSubject,
      version: '1.0',
    }

    expect(canonicalizeAttestation(attestation1)).toBe(canonicalizeAttestation(attestation2))
  })

  it('should exclude attestation_hash and chain_record from canonical form', () => {
    const attestation = createAttestation(validSubject, validProof)
    attestation.chain_record = {
      chain_id: 480,
      tx_hash: '0x123',
      block_number: 12345,
    }

    const canonical = canonicalizeAttestation(attestation)
    expect(canonical).not.toContain('attestation_hash')
    expect(canonical).not.toContain('chain_record')
  })
})

// ============ computeAttestationHash Tests ============

describe('computeAttestationHash', () => {
  it('should compute hash from canonical form', () => {
    const attestation = createAttestation(validSubject, validProof)
    const hash = computeAttestationHash(attestation)
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/)
  })

  it('should produce same hash for same attestation', () => {
    const attestation = createAttestation(validSubject, validProof)
    const hash1 = computeAttestationHash(attestation)
    const hash2 = computeAttestationHash(attestation)
    expect(hash1).toBe(hash2)
  })

  it('should produce different hash when content changes', () => {
    const attestation1 = createAttestation(validSubject, validProof)
    const attestation2 = createAttestation(
      { ...validSubject, description: 'Different' },
      validProof
    )

    const hash1 = computeAttestationHash(attestation1)
    const hash2 = computeAttestationHash(attestation2)
    expect(hash1).not.toBe(hash2)
  })
})
