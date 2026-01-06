'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

// Contract address on World Chain Sepolia
const REGISTRY_ADDRESS = '0xe3aF97c1Eb0c1Bfa872059270a947e8A10FFD9d1'
const EXPLORER_URL = 'https://worldchain-sepolia.explorer.alchemy.com'

interface AttestationRecord {
  id: string
  attestationHash: string
  repository: string
  commitSha: string
  nullifierHash: string
  verificationLevel: number
  timestamp: number
  revoked: boolean
  recorder: string
  txHash?: string
}

interface Stats {
  totalAttestations: number
  activeAttestations: number
  revokedAttestations: number
  uniqueRepositories: number
  byVerificationLevel: {
    device: number
    orb: number
    secureDocument: number
  }
}

// Mock data for demonstration (in production, fetch from blockchain)
const MOCK_ATTESTATIONS: AttestationRecord[] = [
  {
    id: '1',
    attestationHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    repository: 'pohi-protocol/pohi',
    commitSha: '0xd73775c1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    nullifierHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    verificationLevel: 1,
    timestamp: Date.now() - 86400000,
    revoked: false,
    recorder: '0x839395e20bbB182fa440d08F850E6c7A8f6F0780',
    txHash: '0xabc123...',
  },
  {
    id: '2',
    attestationHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    repository: 'pohi-protocol/pohi',
    commitSha: '0x14b39dd1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    nullifierHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
    verificationLevel: 0,
    timestamp: Date.now() - 172800000,
    revoked: false,
    recorder: '0x839395e20bbB182fa440d08F850E6c7A8f6F0780',
    txHash: '0xdef456...',
  },
  {
    id: '3',
    attestationHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
    repository: 'example/demo-app',
    commitSha: '0x9d334cd1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    nullifierHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
    verificationLevel: 1,
    timestamp: Date.now() - 259200000,
    revoked: true,
    recorder: '0x1234567890123456789012345678901234567890',
    txHash: '0xghi789...',
  },
]

function calculateStats(attestations: AttestationRecord[]): Stats {
  const active = attestations.filter((a) => !a.revoked)
  const revoked = attestations.filter((a) => a.revoked)
  const repos = new Set(attestations.map((a) => a.repository))

  return {
    totalAttestations: attestations.length,
    activeAttestations: active.length,
    revokedAttestations: revoked.length,
    uniqueRepositories: repos.size,
    byVerificationLevel: {
      device: attestations.filter((a) => a.verificationLevel === 0).length,
      orb: attestations.filter((a) => a.verificationLevel === 1).length,
      secureDocument: attestations.filter((a) => a.verificationLevel === 2).length,
    },
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function truncateHash(hash: string, length = 8): string {
  if (hash.length <= length * 2 + 2) return hash
  return `${hash.slice(0, length + 2)}...${hash.slice(-length)}`
}

function getVerificationLevelName(level: number): string {
  const levels = ['Device', 'Orb', 'Secure Document']
  return levels[level] || 'Unknown'
}

function getVerificationLevelColor(level: number): string {
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ]
  return colors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export default function DashboardPage() {
  const [attestations, setAttestations] = useState<AttestationRecord[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // In production, fetch from blockchain using viem/ethers
    // For demo, use mock data
    const fetchData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setAttestations(MOCK_ATTESTATIONS)
      setStats(calculateStats(MOCK_ATTESTATIONS))
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredAttestations = attestations.filter((a) => {
    if (filter === 'active' && a.revoked) return false
    if (filter === 'revoked' && !a.revoked) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        a.repository.toLowerCase().includes(term) ||
        a.attestationHash.toLowerCase().includes(term) ||
        a.commitSha.toLowerCase().includes(term)
      )
    }
    return true
  })

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            &larr; Back to Demo
          </Link>
          <h1 className="text-3xl font-bold mt-2">PoHI Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">On-chain attestation explorer</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Contract Info */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Registry Contract</span>
            <div className="font-mono text-sm">
              <a
                href={`${EXPLORER_URL}/address/${REGISTRY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {REGISTRY_ADDRESS}
              </a>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Network: World Chain Sepolia (4801)
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalAttestations}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Attestations</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.activeAttestations}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.revokedAttestations}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Revoked</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.uniqueRepositories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Repositories</div>
              </div>
            </div>
          )}

          {/* Verification Level Breakdown */}
          {stats && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
              <h2 className="text-lg font-semibold mb-4">By Verification Level</h2>
              <div className="flex gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span>Device: {stats.byVerificationLevel.device}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span>Orb: {stats.byVerificationLevel.orb}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-500"></div>
                  <span>Secure Document: {stats.byVerificationLevel.secureDocument}</span>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by repository, hash, or commit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('revoked')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'revoked'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Revoked
              </button>
            </div>
          </div>

          {/* Attestations Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Repository
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Commit
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                      Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAttestations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No attestations found
                      </td>
                    </tr>
                  ) : (
                    filteredAttestations.map((attestation) => (
                      <tr
                        key={attestation.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-3">
                          <a
                            href={`https://github.com/${attestation.repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {attestation.repository}
                          </a>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {truncateHash(attestation.commitSha, 6)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationLevelColor(attestation.verificationLevel)}`}
                          >
                            {getVerificationLevelName(attestation.verificationLevel)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {attestation.revoked ? (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              Revoked
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(attestation.timestamp)}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          <a
                            href={`${EXPLORER_URL}/tx/${attestation.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {truncateHash(attestation.attestationHash, 6)}
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Data is fetched from World Chain Sepolia.{' '}
              <a
                href={`${EXPLORER_URL}/address/${REGISTRY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View on Explorer
              </a>
            </p>
          </div>
        </>
      )}
    </main>
  )
}
