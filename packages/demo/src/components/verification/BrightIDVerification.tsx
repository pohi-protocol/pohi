'use client'

import { useState, useEffect } from 'react'

interface BrightIDVerificationProps {
  onVerify: (provider: string, proof: unknown) => Promise<void>
  disabled?: boolean
}

const BRIGHTID_CONTEXT = process.env.NEXT_PUBLIC_BRIGHTID_CONTEXT || 'pohi'
const BRIGHTID_NODE_URL =
  process.env.NEXT_PUBLIC_BRIGHTID_NODE_URL ||
  'https://app.brightid.org/node/v5'

export function BrightIDVerification({
  onVerify,
  disabled = false,
}: BrightIDVerificationProps) {
  const [contextId, setContextId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deepLink, setDeepLink] = useState<string | null>(null)

  // Generate a random context ID for the user
  useEffect(() => {
    const generateContextId = () => {
      const array = new Uint8Array(16)
      crypto.getRandomValues(array)
      return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
    }
    setContextId(generateContextId())
  }, [])

  // Generate BrightID deep link
  useEffect(() => {
    if (contextId) {
      const link = `brightid://link-verification/${BRIGHTID_CONTEXT}/${contextId}`
      setDeepLink(link)
    }
  }, [contextId])

  const handleVerify = async () => {
    if (!contextId) {
      setError('Context ID not generated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Check verification status from BrightID
      const response = await fetch(
        `${BRIGHTID_NODE_URL}/verifications/${BRIGHTID_CONTEXT}/${contextId}`
      )
      const data = await response.json()

      if (data.error) {
        setError(data.errorMessage || 'Not verified in BrightID yet')
        setLoading(false)
        return
      }

      await onVerify('brightid', {
        context_id: contextId,
        unique: data.data?.unique || false,
        timestamp: data.data?.timestamp || Date.now(),
        sig: data.data?.sig,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (disabled) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-500 px-8 py-4 rounded-lg text-xl font-semibold cursor-not-allowed"
      >
        ☀️ Verify with BrightID
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Step 1: Link your BrightID</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Open BrightID app and scan this link or tap on mobile:
        </p>

        {deepLink && (
          <div className="space-y-2">
            <a
              href={deepLink}
              className="block bg-yellow-500 text-white text-center py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Open BrightID App
            </a>
            <p className="text-xs text-gray-500 break-all">{deepLink}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Step 2: Check Verification</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          After linking in BrightID, click to verify:
        </p>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`
            w-full px-8 py-4 rounded-lg text-xl font-semibold transition-all
            ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }
          `}
        >
          {loading ? '⏳ Checking...' : '☀️ Verify with BrightID'}
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        Your Context ID: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{contextId}</code>
      </p>
    </div>
  )
}
