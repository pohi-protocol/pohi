'use client'

import { useState } from 'react'

interface CivicVerificationProps {
  onVerify: (provider: string, proof: unknown) => Promise<void>
  disabled?: boolean
}

export function CivicVerification({
  onVerify,
  disabled = false,
}: CivicVerificationProps) {
  const [userId, setUserId] = useState<string>('')
  const [gatewayToken, setGatewayToken] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setError(null)

    // Check if MetaMask is available
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        })
        if (accounts && accounts.length > 0) {
          setUserId(accounts[0])
        }
      } catch (err) {
        setError('Failed to connect wallet')
      }
    } else {
      setError('MetaMask not found. Enter user ID manually.')
    }
  }

  const handleVerify = async () => {
    if (!userId) {
      setError('Please connect wallet or enter user ID')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onVerify('civic', {
        user_id: userId.toLowerCase(),
        gateway_token: gatewayToken || undefined,
        verifications: ['uniqueness'], // Default verification type
        expiration: undefined,
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
        🆔 Verify with Civic
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID or Wallet Address"
          className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Connect Wallet
        </button>
      </div>

      <div>
        <input
          type="text"
          value={gatewayToken}
          onChange={(e) => setGatewayToken(e.target.value)}
          placeholder="Gateway Token (optional)"
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <p className="text-xs text-gray-500 mt-1">
          If you have an existing Civic Gateway Pass token
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleVerify}
        disabled={loading || !userId}
        className={`
          w-full px-8 py-4 rounded-lg text-xl font-semibold transition-all
          ${
            loading || !userId
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }
        `}
      >
        {loading ? '⏳ Verifying...' : '🆔 Verify with Civic'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Civic Gateway Pass provides identity verification for Web3
      </p>
    </div>
  )
}
