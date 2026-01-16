'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { HumanApprovalAttestation, ApprovalSubject } from '@/types'
import { ProviderSelector } from '@/components/ProviderSelector'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CopyButton } from '@/components/CopyButton'
import { FAQ } from '@/components/FAQ'
import { useTranslation } from '@/lib/i18n'
import {
  WorldIDVerification,
  GitcoinPassportVerification,
  BrightIDVerification,
  CivicVerification,
  ProofOfHumanityVerification,
} from '@/components/verification'

function HomeContent() {
  const t = useTranslation()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'success' | 'error' | 'already_approved' | 'checking'
  >('idle')
  const [attestation, setAttestation] = useState<HumanApprovalAttestation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approvedAt, setApprovedAt] = useState<string | null>(null)

  // URL params state
  const [repoParam, setRepoParam] = useState<string | null>(null)
  const [commitParam, setCommitParam] = useState<string | null>(null)

  // Demo: subject to approve
  const [subject, setSubject] = useState<ApprovalSubject>({
    action: 'GENERIC',
    description: 'Demo approval request',
    repository: 'pohi-protocol/pohi',
    commit_sha: 'abc123def456',
  })

  // Read URL params directly from window.location on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const repo = params.get('repo')
      const commit = params.get('commit')

      setRepoParam(repo)
      setCommitParam(commit)

      if (repo || commit) {
        setSubject({
          action: 'GENERIC',
          description:
            repo && commit
              ? `Approve commit ${commit.slice(0, 7)} in ${repo}`
              : 'Demo approval request',
          repository: repo || 'pohi-protocol/pohi',
          commit_sha: commit || 'abc123def456',
        })

        // Check if this commit is already approved
        if (repo && commit) {
          setVerificationStatus('checking')
          fetch(`/api/status?repo=${encodeURIComponent(repo)}&commit=${encodeURIComponent(commit)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.status === 'approved') {
                setVerificationStatus('already_approved')
                setAttestation(data.attestation)
                setApprovedAt(data.approved_at)
              } else {
                setVerificationStatus('idle')
              }
            })
            .catch(() => {
              setVerificationStatus('idle')
            })
        }
      }
    }
  }, [])

  // Check if this is a GitHub Action request (has repo and commit params)
  const isGitHubActionRequest = !!(repoParam && commitParam)

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
      } else if (data.alreadyApproved) {
        // Handle already approved case (409 Conflict)
        setVerificationStatus('already_approved')
        setAttestation(data.attestation)
        setApprovedAt(data.approvedAt)
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
          <WorldIDVerification signal={signal} onVerify={handleVerify} disabled={isVerifying} />
        )
      case 'gitcoin_passport':
        return <GitcoinPassportVerification onVerify={handleVerify} disabled={isVerifying} />
      case 'brightid':
        return <BrightIDVerification onVerify={handleVerify} disabled={isVerifying} />
      case 'civic':
        return <CivicVerification onVerify={handleVerify} disabled={isVerifying} />
      case 'proof_of_humanity':
        return <ProofOfHumanityVerification onVerify={handleVerify} disabled={isVerifying} />
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-end items-center gap-4 mb-4">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('dashboard')}
        </Link>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{t('tagline')}</p>
        {isGitHubActionRequest && (
          <div className="mt-4 inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg">
            {t('githubActionRequest')}
          </div>
        )}
      </div>

      {/* Approval Subject */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('approvalRequest')}</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="repository" className="block text-sm font-medium mb-1">
              {t('repository')}
            </label>
            <input
              id="repository"
              type="text"
              value={subject.repository || ''}
              onChange={(e) => setSubject({ ...subject, repository: e.target.value })}
              readOnly={!!isGitHubActionRequest}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${isGitHubActionRequest ? 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              placeholder="owner/repo"
            />
          </div>

          <div>
            <label htmlFor="commit-sha" className="block text-sm font-medium mb-1">
              {t('commitSha')}
            </label>
            <input
              id="commit-sha"
              type="text"
              value={subject.commit_sha || ''}
              onChange={(e) => setSubject({ ...subject, commit_sha: e.target.value })}
              readOnly={!!isGitHubActionRequest}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${isGitHubActionRequest ? 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              placeholder="abc123..."
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              {t('description')}
            </label>
            <input
              id="description"
              type="text"
              value={subject.description || ''}
              onChange={(e) => setSubject({ ...subject, description: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>
        </div>
      </div>

      {/* Provider Selection and Verification */}
      <div className="mb-8">
        {!selectedProvider && verificationStatus === 'idle' && (
          <ProviderSelector selectedProvider={selectedProvider} onSelect={setSelectedProvider} />
        )}

        {selectedProvider && verificationStatus === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('verifyIdentity')}</h2>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('changeProvider')}
              </button>
            </div>
            {renderVerificationComponent()}
          </div>
        )}

        {verificationStatus === 'checking' && (
          <div className="text-center py-8">
            <span className="text-xl animate-pulse">{t('checkingStatus')}</span>
          </div>
        )}

        {verificationStatus === 'verifying' && (
          <div className="text-center py-8">
            <span className="text-xl animate-pulse">{t('verifying')}</span>
          </div>
        )}

        {verificationStatus === 'already_approved' && (
          <div className="text-center py-8 space-y-4">
            <div className="text-xl text-blue-600 dark:text-blue-400">{t('alreadyApproved')}</div>
            <p className="text-gray-600 dark:text-gray-400">{t('alreadyApprovedDesc')}</p>
            {approvedAt && (
              <p className="text-sm text-gray-500">
                {t('approvedAt')}: {new Date(approvedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="text-xl text-green-600 dark:text-green-400">{t('humanVerified')}</div>
            <button onClick={handleReset} className="text-blue-600 dark:text-blue-400 underline">
              {t('startNewVerification')}
            </button>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="text-center py-8 space-y-4">
            <div className="text-xl text-red-600 dark:text-red-400">{t('verificationFailed')}</div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button onClick={handleReset} className="text-blue-600 dark:text-blue-400 underline">
              {t('tryAgain')}
            </button>
          </div>
        )}
      </div>

      {/* Attestation Result */}
      {attestation && (
        <div
          className={`${verificationStatus === 'already_approved' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'} border rounded-lg p-6 mb-8`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-xl font-semibold ${verificationStatus === 'already_approved' ? 'text-blue-800 dark:text-blue-200' : 'text-green-800 dark:text-green-200'}`}
            >
              {verificationStatus === 'already_approved'
                ? t('alreadyApproved')
                : t('attestationCreated')}
            </h2>
            <div className="flex gap-2">
              <CopyButton text={JSON.stringify(attestation, null, 2)} label={t('copyJson')} />
              {attestation.attestation_hash && (
                <CopyButton text={attestation.attestation_hash} label={t('copyHash')} />
              )}
            </div>
          </div>
          {attestation.attestation_hash && (
            <div
              className={`mb-4 p-3 bg-white dark:bg-gray-900 rounded border ${verificationStatus === 'already_approved' ? 'border-blue-200 dark:border-blue-700' : 'border-green-200 dark:border-green-700'}`}
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('attestationHash')}
              </div>
              <code className="text-sm font-mono break-all">{attestation.attestation_hash}</code>
            </div>
          )}
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              {t('viewFullJson')}
            </summary>
            <pre className="mt-2 bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(attestation, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* How it works */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">{t('howItWorks')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">1.</div>
            <h3 className="font-semibold">{t('step1Title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('step1Desc')}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">2.</div>
            <h3 className="font-semibold">{t('step2Title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('step2Desc')}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">3.</div>
            <h3 className="font-semibold">{t('step3Title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('step3Desc')}</p>
          </div>
        </div>
      </div>

      {/* Supported Providers */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">{t('supportedProviders')}</h2>
        <div className="grid md:grid-cols-5 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl mb-1">{t('worldId')}</div>
            <span className="text-gray-500">{t('zkProofs')}</span>
          </div>
          <div>
            <div className="text-2xl mb-1">{t('gitcoinPassport')}</div>
            <span className="text-gray-500">{t('web3Score')}</span>
          </div>
          <div>
            <div className="text-2xl mb-1">{t('brightId')}</div>
            <span className="text-gray-500">{t('socialGraph')}</span>
          </div>
          <div>
            <div className="text-2xl mb-1">{t('civic')}</div>
            <span className="text-gray-500">{t('gatewayPass')}</span>
          </div>
          <div>
            <div className="text-2xl mb-1">PoH</div>
            <span className="text-gray-500">{t('kleros')}</span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />

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

export default function Home() {
  return <HomeContent />
}
