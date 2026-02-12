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

/* ────────────────────────────────────────────
   Inline SVG Icons
   ──────────────────────────────────────────── */

function ShieldCheckIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function LinkIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.25 9.75" />
    </svg>
  )
}

function DocumentCheckIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      <path d="M10.125 2.25A9 9 0 0119.5 11.25M10.125 2.25V6.375c0 .621.504 1.125 1.125 1.125H15.375" />
      <path d="M9 15l2.25 2.25L15 12" />
    </svg>
  )
}

function ArrowRightIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function XCircleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */

function HomeContent() {
  const t = useTranslation()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'success' | 'error' | 'already_approved' | 'checking'
  >('idle')
  const [attestation, setAttestation] = useState<HumanApprovalAttestation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approvedAt, setApprovedAt] = useState<string | null>(null)

  const [repoParam, setRepoParam] = useState<string | null>(null)
  const [commitParam, setCommitParam] = useState<string | null>(null)

  const [subject, setSubject] = useState<ApprovalSubject>({
    action: 'GENERIC',
    description: 'Demo approval request',
    repository: 'pohi-protocol/pohi',
    commit_sha: 'abc123def456',
  })

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

  const isGitHubActionRequest = !!(repoParam && commitParam)
  const signal = subject.commit_sha || ''

  const handleVerify = async (provider: string, proof: unknown) => {
    setVerificationStatus('verifying')
    setError(null)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, proof, subject, signal }),
      })

      const data = await response.json()

      if (data.success) {
        setVerificationStatus('success')
        setAttestation(data.attestation)
      } else if (data.alreadyApproved) {
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
    <div className="relative min-h-screen">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-world-500/[0.07] dark:bg-world-400/[0.04] blur-[100px]" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] rounded-full bg-blue-500/[0.05] dark:bg-blue-400/[0.03] blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-world-500/[0.05] dark:bg-world-400/[0.03] blur-[80px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[rgb(2,6,23)]/80 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-world-500 to-blue-500 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">PoHI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors hidden sm:inline"
            >
              {t('dashboard')}
            </Link>
            <a
              href="https://github.com/pohi-protocol/pohi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors hidden sm:inline"
            >
              {t('github')}
            </a>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* ══════════════════════════════════════
           HERO SECTION
           ══════════════════════════════════════ */}
        <section className="hero-gradient">
          <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-world-500/20 dark:border-world-400/20 bg-world-500/5 dark:bg-world-400/5 text-sm text-world-600 dark:text-world-400 mb-8 animate-fade-in-down">
                <div className="w-1.5 h-1.5 rounded-full bg-world-500 dark:bg-world-400 animate-pulse" />
                {t('heroBadge')} v0.3
              </div>

              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up opacity-0"
                style={{ animationDelay: '0.1s' }}
              >
                <span className="gradient-text">{t('heroTitle')}</span>
              </h1>

              <p
                className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto animate-fade-in-up opacity-0"
                style={{ animationDelay: '0.2s' }}
              >
                {t('heroSubtitle')}
              </p>

              <p
                className="font-mono text-sm text-gray-500 dark:text-gray-500 mb-10 animate-fade-in-up opacity-0"
                style={{ animationDelay: '0.3s' }}
              >
                {t('heroTagline')}
              </p>

              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0"
                style={{ animationDelay: '0.4s' }}
              >
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-world-500 to-world-600 dark:from-world-400 dark:to-world-500 text-white font-semibold shadow-lg shadow-world-500/25 dark:shadow-world-400/20 hover:shadow-world-500/40 dark:hover:shadow-world-400/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {t('heroCta')}
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/pohi-protocol/pohi/blob/main/SPEC.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
                >
                  {t('heroCtaSecondary')}
                </a>
              </div>

              {/* Stats */}
              <div
                className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-in-up opacity-0"
                style={{ animationDelay: '0.5s' }}
              >
                {[
                  { value: '9', label: t('statsProviders') },
                  { value: '8', label: t('statsPackages') },
                  { value: '0', label: t('statsZeroDeps') },
                  { value: 'EVM', label: t('statsChains') },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
           PROTOCOL FLOW
           ══════════════════════════════════════ */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('flowTitle')}</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('flowSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  icon: <ShieldCheckIcon className="w-8 h-8" />,
                  title: t('flowStep1Title'),
                  desc: t('flowStep1Desc'),
                  label: t('flowVerify'),
                  color: 'world',
                },
                {
                  step: '02',
                  icon: <LinkIcon className="w-8 h-8" />,
                  title: t('flowStep2Title'),
                  desc: t('flowStep2Desc'),
                  label: t('flowBind'),
                  color: 'blue',
                },
                {
                  step: '03',
                  icon: <DocumentCheckIcon className="w-8 h-8" />,
                  title: t('flowStep3Title'),
                  desc: t('flowStep3Desc'),
                  label: t('flowRecord'),
                  color: 'purple',
                },
              ].map((item, i) => (
                <div key={item.step} className="relative group">
                  <div className="p-8 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-white/[0.02] card-hover h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-600">
                        {item.step}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          item.color === 'world'
                            ? 'bg-world-500/10 text-world-600 dark:bg-world-400/10 dark:text-world-400'
                            : item.color === 'blue'
                              ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
                              : 'bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div
                      className={`mb-4 ${
                        item.color === 'world'
                          ? 'text-world-600 dark:text-world-400'
                          : item.color === 'blue'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  {/* Arrow between cards */}
                  {i < 2 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-gray-300 dark:text-gray-700">
                      <ArrowRightIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-4xl mx-auto" />

        {/* ══════════════════════════════════════
           LIVE DEMO SECTION
           ══════════════════════════════════════ */}
        <section id="demo" className="py-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('tryDemo')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('flowSubtitle')}</p>
            </div>

            {isGitHubActionRequest && (
              <div className="mb-8 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/10 text-center">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('githubActionRequest')}
                </span>
              </div>
            )}

            {/* Approval Subject */}
            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8 mb-8">
              <h3 className="text-lg font-semibold mb-6">{t('approvalRequest')}</h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="repository"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {t('repository')}
                  </label>
                  <input
                    id="repository"
                    type="text"
                    value={subject.repository || ''}
                    onChange={(e) => setSubject({ ...subject, repository: e.target.value })}
                    readOnly={!!isGitHubActionRequest}
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-world-500/50 dark:focus:ring-world-400/50 transition-all ${isGitHubActionRequest ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                    placeholder="owner/repo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="commit-sha"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {t('commitSha')}
                  </label>
                  <input
                    id="commit-sha"
                    type="text"
                    value={subject.commit_sha || ''}
                    onChange={(e) => setSubject({ ...subject, commit_sha: e.target.value })}
                    readOnly={!!isGitHubActionRequest}
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-world-500/50 dark:focus:ring-world-400/50 transition-all ${isGitHubActionRequest ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                    placeholder="abc123..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {t('description')}
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={subject.description || ''}
                    onChange={(e) => setSubject({ ...subject, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-world-500/50 dark:focus:ring-world-400/50 transition-all"
                    placeholder={t('descriptionPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* Provider Selection and Verification */}
            <div className="mb-8">
              {!selectedProvider && verificationStatus === 'idle' && (
                <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8">
                  <ProviderSelector
                    selectedProvider={selectedProvider}
                    onSelect={setSelectedProvider}
                  />
                </div>
              )}

              {selectedProvider && verificationStatus === 'idle' && (
                <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-white/[0.02] p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{t('verifyIdentity')}</h2>
                    <button
                      onClick={() => setSelectedProvider(null)}
                      className="text-sm text-world-600 dark:text-world-400 hover:underline"
                    >
                      {t('changeProvider')}
                    </button>
                  </div>
                  {renderVerificationComponent()}
                </div>
              )}

              {verificationStatus === 'checking' && (
                <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-white/[0.02] p-12 text-center">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-world-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {t('checkingStatus')}
                    </span>
                  </div>
                </div>
              )}

              {verificationStatus === 'verifying' && (
                <div className="rounded-2xl border border-world-200 dark:border-world-800/50 bg-world-50/50 dark:bg-world-900/10 p-12 text-center">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-world-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg font-medium text-world-700 dark:text-world-300">
                      {t('verifying')}
                    </span>
                  </div>
                </div>
              )}

              {verificationStatus === 'already_approved' && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 p-8 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2">
                    <CheckCircleIcon className="w-7 h-7" />
                  </div>
                  <div className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                    {t('alreadyApproved')}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{t('alreadyApprovedDesc')}</p>
                  {approvedAt && (
                    <p className="text-sm text-gray-500">
                      {t('approvedAt')}: {new Date(approvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {verificationStatus === 'success' && (
                <div className="rounded-2xl border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-2">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {t('humanVerified')}
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-sm text-world-600 dark:text-world-400 hover:underline"
                  >
                    {t('startNewVerification')}
                  </button>
                </div>
              )}

              {verificationStatus === 'error' && (
                <div className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-2">
                    <XCircleIcon className="w-8 h-8" />
                  </div>
                  <div className="text-xl font-semibold text-red-700 dark:text-red-300">
                    {t('verificationFailed')}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
                  <button
                    onClick={handleReset}
                    className="text-sm text-world-600 dark:text-world-400 hover:underline"
                  >
                    {t('tryAgain')}
                  </button>
                </div>
              )}
            </div>

            {/* Attestation Result */}
            {attestation && (
              <div
                className={`rounded-2xl border p-6 sm:p-8 ${
                  verificationStatus === 'already_approved'
                    ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-900/5'
                    : 'border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-900/5'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className={`text-lg font-semibold ${
                      verificationStatus === 'already_approved'
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-green-700 dark:text-green-300'
                    }`}
                  >
                    {verificationStatus === 'already_approved'
                      ? t('alreadyApproved')
                      : t('attestationCreated')}
                  </h3>
                  <div className="flex gap-2">
                    <CopyButton text={JSON.stringify(attestation, null, 2)} label={t('copyJson')} />
                    {attestation.attestation_hash && (
                      <CopyButton text={attestation.attestation_hash} label={t('copyHash')} />
                    )}
                  </div>
                </div>

                {attestation.attestation_hash && (
                  <div className="mb-4 p-4 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                      {t('attestationHash')}
                    </div>
                    <code className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">
                      {attestation.attestation_hash}
                    </code>
                  </div>
                )}

                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    {t('viewFullJson')}
                  </summary>
                  <pre className="mt-3 bg-white dark:bg-gray-900/50 p-4 rounded-xl overflow-x-auto text-xs font-mono border border-gray-200 dark:border-gray-800">
                    {JSON.stringify(attestation, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </section>

        <div className="section-divider max-w-4xl mx-auto" />

        {/* ══════════════════════════════════════
           USE CASES
           ══════════════════════════════════════ */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('useCasesTitle')}</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('useCasesSubtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  ),
                  title: t('useCase1Title'),
                  desc: t('useCase1Desc'),
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  ),
                  title: t('useCase2Title'),
                  desc: t('useCase2Desc'),
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                    </svg>
                  ),
                  title: t('useCase3Title'),
                  desc: t('useCase3Desc'),
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  ),
                  title: t('useCase4Title'),
                  desc: t('useCase4Desc'),
                },
              ].map((uc) => (
                <div
                  key={uc.title}
                  className="p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-white/[0.02] card-hover"
                >
                  <div className="w-10 h-10 rounded-lg bg-world-500/10 dark:bg-world-400/10 flex items-center justify-center text-world-600 dark:text-world-400 mb-4">
                    {uc.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{uc.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {uc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-4xl mx-auto" />

        {/* ══════════════════════════════════════
           INTEGRATION CODE SNIPPET
           ══════════════════════════════════════ */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('integrationTitle')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('integrationSubtitle')}</p>
            </div>

            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 overflow-hidden">
              {/* Tab Header */}
              <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                <div className="px-5 py-3 text-sm font-medium text-world-600 dark:text-world-400 border-b-2 border-world-500 dark:border-world-400">
                  {t('integrationTab1')}
                </div>
              </div>
              {/* Code */}
              <div className="p-6 bg-gray-950 dark:bg-black overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  <code>
                    <span className="text-gray-500"># .github/workflows/human-approval.yml</span>
                    {'\n'}
                    <span className="text-purple-400">name</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">Require Human Approval</span>
                    {'\n\n'}
                    <span className="text-purple-400">on</span>
                    <span className="text-gray-400">:</span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">pull_request</span>
                    <span className="text-gray-400">:</span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">types</span>
                    <span className="text-gray-400">: [</span>
                    <span className="text-green-400">labeled</span>
                    <span className="text-gray-400">]</span>
                    {'\n\n'}
                    <span className="text-purple-400">jobs</span>
                    <span className="text-gray-400">:</span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">verify</span>
                    <span className="text-gray-400">:</span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">if</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-yellow-300">
                      github.event.label.name == &apos;ready-to-merge&apos;
                    </span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">runs-on</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">ubuntu-latest</span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">steps</span>
                    <span className="text-gray-400">:</span>
                    {'\n'}
                    <span className="text-gray-400"> - </span>
                    <span className="text-purple-400">uses</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-cyan-400">pohi-protocol/action@v1</span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">with</span>
                    <span className="text-gray-400">:</span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">world-id-app</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-yellow-300">{'${{ secrets.WORLD_ID_APP_ID }}'}</span>
                    {'\n'}
                    <span className="text-gray-400"> </span>
                    <span className="text-purple-400">required-level</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">orb</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-4xl mx-auto" />

        {/* ══════════════════════════════════════
           ARCHITECTURE
           ══════════════════════════════════════ */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('architectureTitle')}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('architectureSubtitle')}</p>
            </div>

            <div className="space-y-4">
              {[
                { layer: t('archLayer1'), desc: t('archLayer1Desc'), color: 'world' },
                { layer: t('archLayer2'), desc: t('archLayer2Desc'), color: 'blue' },
                { layer: t('archLayer3'), desc: t('archLayer3Desc'), color: 'purple' },
                { layer: t('archLayer4'), desc: t('archLayer4Desc'), color: 'green' },
              ].map((item) => (
                <div
                  key={item.layer}
                  className="flex items-center gap-6 p-5 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-white/[0.02]"
                >
                  <div
                    className={`w-2 h-12 rounded-full flex-shrink-0 ${
                      item.color === 'world'
                        ? 'bg-world-500'
                        : item.color === 'blue'
                          ? 'bg-blue-500'
                          : item.color === 'purple'
                            ? 'bg-purple-500'
                            : 'bg-green-500'
                    }`}
                  />
                  <div>
                    <div className="font-semibold">{item.layer}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-4xl mx-auto" />

        {/* FAQ */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-6">
            <FAQ />
          </div>
        </section>

        {/* ══════════════════════════════════════
           FOOTER
           ══════════════════════════════════════ */}
        <footer className="border-t border-gray-200/50 dark:border-gray-800/50 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-world-500 to-blue-500 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('footer')}</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <a
                  href="https://github.com/pohi-protocol/pohi"
                  className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href="https://github.com/pohi-protocol/pohi/blob/main/SPEC.md"
                  className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('footerSpecification')}
                </a>
                <a
                  href="https://github.com/pohi-protocol/pohi/blob/main/paper/"
                  className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('footerPaper')}
                </a>
                <a
                  href="https://github.com/pohi-protocol/pohi/blob/main/LICENSE"
                  className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apache 2.0
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}
