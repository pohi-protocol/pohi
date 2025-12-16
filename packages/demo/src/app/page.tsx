'use client'

import { useState } from 'react'
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'
import type { HumanApprovalAttestation, ApprovalSubject } from '@/types'

export default function Home() {
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [attestation, setAttestation] = useState<HumanApprovalAttestation | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Demo: subject to approve
  const [subject, setSubject] = useState<ApprovalSubject>({
    action: 'GENERIC',
    description: 'Demo approval request',
    repository: 'pohi-protocol/pohi',
    commit_sha: 'abc123def456',
  })

  // Signal for World ID verification - binds the proof to the commit SHA
  // Using IDKit v2 which handles signal encoding properly
  const signal = subject.commit_sha || ''

  const handleVerify = async (proof: ISuccessResult) => {
    setVerificationStatus('verifying')
    setError(null)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

  const onSuccess = () => {
    console.log('World ID verification modal closed successfully')
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🔏 Proof of Human Intent</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          AI executes. Humans authorize. Machines verify.
        </p>
      </div>

      {/* Approval Subject */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📋 Approval Request</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Repository</label>
            <input
              type="text"
              value={subject.repository || ''}
              onChange={(e) => setSubject({ ...subject, repository: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="owner/repo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Commit SHA</label>
            <input
              type="text"
              value={subject.commit_sha || ''}
              onChange={(e) => setSubject({ ...subject, commit_sha: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="abc123..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={subject.description || ''}
              onChange={(e) => setSubject({ ...subject, description: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="What are you approving?"
            />
          </div>
        </div>
      </div>

      {/* World ID Verification */}
      <div className="text-center mb-8">
        {verificationStatus === 'idle' && (
          <IDKitWidget
            app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_${string}`}
            action={process.env.NEXT_PUBLIC_WORLD_ID_ACTION!}
            signal={signal}
            onSuccess={onSuccess}
            handleVerify={handleVerify}
            verification_level={VerificationLevel.Orb}
          >
            {({ open }) => (
              <button
                onClick={open}
                className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-lg text-xl font-semibold hover:opacity-80 transition-opacity"
              >
                👁️ Verify with World ID
              </button>
            )}
          </IDKitWidget>
        )}

        {verificationStatus === 'verifying' && (
          <div className="text-xl">
            <span className="animate-pulse">⏳ Verifying...</span>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-xl text-green-600 dark:text-green-400">
            ✅ Human Verified!
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="space-y-4">
            <div className="text-xl text-red-600 dark:text-red-400">
              ❌ Verification Failed
            </div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => setVerificationStatus('idle')}
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Attestation Result */}
      {attestation && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">
            📜 Attestation Created
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
            <div className="text-4xl mb-2">👁️</div>
            <h3 className="font-semibold">1. Verify Human</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              World ID proves you&apos;re a unique human using ZK proofs
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔗</div>
            <h3 className="font-semibold">2. Bind to Action</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Proof is cryptographically bound to the commit SHA
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📜</div>
            <h3 className="font-semibold">3. Create Attestation</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Immutable record proves human approved this action
            </p>
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
