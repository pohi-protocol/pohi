'use client'

import { useState } from 'react'
import type { HumanApprovalAttestation, ApprovalSubject } from '@/types'
import { ProviderSelector } from '@/components/ProviderSelector'
import {
  WorldIDVerification,
  GitcoinPassportVerification,
  BrightIDVerification,
  CivicVerification,
  ProofOfHumanityVerification,
} from '@/components/verification'

export default function Home() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'success' | 'error'
  >('idle')
  const [attestation, setAttestation] =
    useState<HumanApprovalAttestation | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Demo: subject to approve
  const [subject, setSubject] = useState<ApprovalSubject>({
    action: 'GENERIC',
    description: 'Demo approval request',
    repository: 'pohi-protocol/pohi',
    commit_sha: 'abc123def456',
  })

  // Signal for verification - binds the proof to the commit SHA
  const signal = subject.commit_sha || ''

  const handleVerify = async (provider: string, proof: unknown) => {
    setVerificationStatus('verifying')
    setError(null)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          proof,
          subject,
          signal,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationStatus('success')
        setAttestation(data.attestation)
      } else {
        setVerificationStatus('error')
        setError(data.error || 'Verification failed')
      }
    } catch (err) {
      setVerificationStatus('error')
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleReset = () => {
    setSelectedProvider(null)
    setVerificationStatus('idle')
    setAttestation(null)
    setError(null)
  }

  const renderVerificationComponent = () => {
    const isVerifying = verificationStatus === 'verifying'

    switch (selectedProvider) {
      case 'world_id':
        return (
          <WorldIDVerification
            signal={signal}
            onVerify={handleVerify}
            disabled={isVerifying}
          />
        )
      case 'gitcoin_passport':
        return (
          <GitcoinPassportVerification
            onVerify={handleVerify}
            disabled={isVerifying}
          />
        )
      case 'brightid':
        return (
          <BrightIDVerification onVerify={handleVerify} disabled={isVerifying} />
        )
      case 'civic':
        return (
          <CivicVerification onVerify={handleVerify} disabled={isVerifying} />
        )
      case 'proof_of_humanity':
        return (
          <ProofOfHumanityVerification
            onVerify={handleVerify}
            disabled={isVerifying}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Proof of Human Intent</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          AI executes. Humans authorize. Machines verify.
        </p>
      </div>

      {/* Approval Subject */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Approval Request</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Repository</label>
            <input
              type="text"
              value={subject.repository || ''}
              onChange={(e) =>
                setSubject({ ...subject, repository: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="owner/repo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Commit SHA</label>
            <input
              type="text"
              value={subject.commit_sha || ''}
              onChange={(e) =>
                setSubject({ ...subject, commit_sha: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="abc123..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={subject.description || ''}
              onChange={(e) =>
                setSubject({ ...subject, description: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="What are you approving?"
            />
          </div>
        </div>
      </div>

      {/* Provider Selection and Verification */}
      <div className="mb-8">
        {!selectedProvider && verificationStatus === 'idle' && (
          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider}
          />
        )}

        {selectedProvider && verificationStatus === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Verify Your Identity</h2>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change provider
              </button>
            </div>
            {renderVerificationComponent()}
          </div>
        )}

        {verificationStatus === 'verifying' && (
          <div className="text-center py-8">
            <span className="text-xl animate-pulse">Verifying...</span>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="text-xl text-green-600 dark:text-green-400">
              Human Verified!
            </div>
            <button
              onClick={handleReset}
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Start new verification
            </button>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="text-center py-8 space-y-4">
            <div className="text-xl text-red-600 dark:text-red-400">
              Verification Failed
            </div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={handleReset}
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Attestation Result */}
      {attestation && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">
            Attestation Created
          </h2>
          <pre className="bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(attestation, null, 2)}
          </pre>
        </div>
      )}

      {/* How it works */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">1.</div>
            <h3 className="font-semibold">Choose Provider</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Select your preferred proof-of-personhood provider
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">2.</div>
            <h3 className="font-semibold">Verify Human</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Complete verification to prove you&apos;re a unique human
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">3.</div>
            <h3 className="font-semibold">Create Attestation</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Attestation is created binding your approval to the action
            </p>
          </div>
        </div>
      </div>

      {/* Supported Providers */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">Supported Providers</h2>
        <div className="grid md:grid-cols-5 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl mb-1">World ID</div>
            <span className="text-gray-500">ZK Proofs</span>
          </div>
          <div>
            <div className="text-2xl mb-1">Gitcoin Passport</div>
            <span className="text-gray-500">Web3 Score</span>
          </div>
          <div>
            <div className="text-2xl mb-1">BrightID</div>
            <span className="text-gray-500">Social Graph</span>
          </div>
          <div>
            <div className="text-2xl mb-1">Civic</div>
            <span className="text-gray-500">Gateway Pass</span>
          </div>
          <div>
            <div className="text-2xl mb-1">PoH</div>
            <span className="text-gray-500">Kleros</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
        <p>
          <a
            href="https://github.com/pohi-protocol/pohi"
            className="hover:text-gray-700 dark:hover:text-gray-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          {' · '}
          <a
            href="https://github.com/pohi-protocol/pohi/blob/main/LICENSE"
            className="hover:text-gray-700 dark:hover:text-gray-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apache 2.0
          </a>
        </p>
      </footer>
    </main>
  )
}
