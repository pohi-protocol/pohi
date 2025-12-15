import type { HumanApprovalAttestation } from '@/types'

interface AttestationRecord {
  attestation: HumanApprovalAttestation
  createdAt: Date
}

/**
 * Simple in-memory store for attestations
 * In production, this should be replaced with a database (Redis, PostgreSQL, etc.)
 */
class AttestationStore {
  private store = new Map<string, AttestationRecord>()

  /**
   * Generate a unique key for repository + commit
   */
  private getKey(repository: string, commitSha: string): string {
    return `${repository}:${commitSha}`
  }

  /**
   * Store an attestation
   */
  set(repository: string, commitSha: string, attestation: HumanApprovalAttestation): void {
    const key = this.getKey(repository, commitSha)
    this.store.set(key, {
      attestation,
      createdAt: new Date(),
    })
  }

  /**
   * Get an attestation by repository and commit
   */
  get(repository: string, commitSha: string): AttestationRecord | undefined {
    const key = this.getKey(repository, commitSha)
    return this.store.get(key)
  }

  /**
   * Check if an attestation exists
   */
  has(repository: string, commitSha: string): boolean {
    const key = this.getKey(repository, commitSha)
    return this.store.has(key)
  }

  /**
   * Delete an attestation
   */
  delete(repository: string, commitSha: string): boolean {
    const key = this.getKey(repository, commitSha)
    return this.store.delete(key)
  }

  /**
   * Get all attestations (for debugging)
   */
  getAll(): Map<string, AttestationRecord> {
    return new Map(this.store)
  }

  /**
   * Clear all attestations
   */
  clear(): void {
    this.store.clear()
  }
}

// Singleton instance
export const attestationStore = new AttestationStore()
