'use client'

import { useState } from 'react'

interface GitcoinPassportVerificationProps {
  onVerify: (provider: string, proof: unknown) => Promise<void>
  disabled?: boolean
}

export function GitcoinPassportVerification({
  onVerify,
  disabled = false,
}: GitcoinPassportVerificationProps) {
  const [address, setAddress] = useState<string>('')
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
          setAddress(accounts[0])
        }
      } catch (err) {
        setError('Failed to connect wallet')
      }
    } else {
      // For demo: allow manual address input
      setError('MetaMask not found. Enter address manually.')
    }
  }

  const handleVerify = async () => {
    if (!address) {
      setError('Please enter or connect an address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onVerify('gitcoin_passport', {
        address: address.toLowerCase(),
        score: 0, // Will be fetched by backend
        score_timestamp: new Date().toISOString(),
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
        🛂 Verify with Gitcoin Passport
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x... (Ethereum address)"
          className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Connect Wallet
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleVerify}
        disabled={loading || !address}
        className={`
          w-full px-8 py-4 rounded-lg text-xl font-semibold transition-all
          ${
            loading || !address
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }
        `}
      >
        {loading ? '⏳ Checking Passport...' : '🛂 Verify with Gitcoin Passport'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Your passport score will be checked against the minimum threshold
      </p>
    </div>
  )
}
