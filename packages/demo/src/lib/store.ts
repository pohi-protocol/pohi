import type { HumanApprovalAttestation } from 'pohi-core'

/**
 * Record structure for storing attestations
 */
export interface AttestationRecord {
  attestation: HumanApprovalAttestation
  createdAt: string // ISO string for JSON serialization
}

/**
 * Interface for attestation storage backends
 */
export interface IAttestationStore {
  set(repository: string, commitSha: string, attestation: HumanApprovalAttestation): Promise<void>
  get(repository: string, commitSha: string): Promise<AttestationRecord | null>
  has(repository: string, commitSha: string): Promise<boolean>
  delete(repository: string, commitSha: string): Promise<boolean>
}

/**
 * Generate a unique key for repository + commit
 */
function getKey(repository: string, commitSha: string): string {
  return `pohi:attestation:${repository}:${commitSha}`
}

/**
 * In-memory store for development and testing
 *
 * ⚠️  Limitations:
 * - Data is lost on server restart
 * - Does not scale across multiple instances
 * - Potential memory leak with unbounded growth
 */
class InMemoryStore implements IAttestationStore {
  private store = new Map<string, AttestationRecord>()

  async set(repository: string, commitSha: string, attestation: HumanApprovalAttestation): Promise<void> {
    const key = getKey(repository, commitSha)
    this.store.set(key, {
      attestation,
      createdAt: new Date().toISOString(),
    })
  }

  async get(repository: string, commitSha: string): Promise<AttestationRecord | null> {
    const key = getKey(repository, commitSha)
    return this.store.get(key) ?? null
  }

  async has(repository: string, commitSha: string): Promise<boolean> {
    const key = getKey(repository, commitSha)
    return this.store.has(key)
  }

  async delete(repository: string, commitSha: string): Promise<boolean> {
    const key = getKey(repository, commitSha)
    return this.store.delete(key)
  }

  // Development helper methods
  clear(): void {
    this.store.clear()
  }

  getAll(): Map<string, AttestationRecord> {
    return new Map(this.store)
  }
}

/**
 * Vercel KV store for production
 *
 * Uses Redis-compatible Vercel KV for persistent storage.
 * Requires KV_REST_API_URL and KV_REST_API_TOKEN environment variables.
 *
 * Features:
 * - Persistent storage across restarts
 * - Scales across multiple instances
 * - 30-day TTL for attestations (configurable)
 */
class VercelKVStore implements IAttestationStore {
  private kv: typeof import('@vercel/kv').kv | null = null
  private ttlSeconds: number

  constructor(ttlSeconds: number = 30 * 24 * 60 * 60) { // 30 days default
    this.ttlSeconds = ttlSeconds
  }

  private async getKV() {
    if (!this.kv) {
      const { kv } = await import('@vercel/kv')
      this.kv = kv
    }
    return this.kv
  }

  async set(repository: string, commitSha: string, attestation: HumanApprovalAttestation): Promise<void> {
    const kv = await this.getKV()
    const key = getKey(repository, commitSha)
    const record: AttestationRecord = {
      attestation,
      createdAt: new Date().toISOString(),
    }
    await kv.set(key, JSON.stringify(record), { ex: this.ttlSeconds })
  }

  async get(repository: string, commitSha: string): Promise<AttestationRecord | null> {
    const kv = await this.getKV()
    const key = getKey(repository, commitSha)
    const data = await kv.get<string>(key)
    if (!data) return null

    try {
      // Handle both string and object responses from Vercel KV
      if (typeof data === 'string') {
        return JSON.parse(data) as AttestationRecord
      }
      return data as unknown as AttestationRecord
    } catch {
      console.error('Failed to parse attestation record:', key)
      return null
    }
  }

  async has(repository: string, commitSha: string): Promise<boolean> {
    const kv = await this.getKV()
    const key = getKey(repository, commitSha)
    const exists = await kv.exists(key)
    return exists > 0
  }

  async delete(repository: string, commitSha: string): Promise<boolean> {
    const kv = await this.getKV()
    const key = getKey(repository, commitSha)
    const deleted = await kv.del(key)
    return deleted > 0
  }
}

/**
 * Create the appropriate store based on environment
 */
function createStore(): IAttestationStore {
  // Use Vercel KV if credentials are available
  const hasKVCredentials = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

  if (hasKVCredentials) {
    console.log('[PoHI] Using Vercel KV store for attestations')
    return new VercelKVStore()
  }

  console.log('[PoHI] Using in-memory store for attestations (development mode)')
  return new InMemoryStore()
}

// Singleton instance
export const attestationStore = createStore()

// Export for testing
export { InMemoryStore, VercelKVStore }
