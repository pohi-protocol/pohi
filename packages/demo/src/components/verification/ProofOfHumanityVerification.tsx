'use client'

import { useState } from 'react'

interface ProofOfHumanityVerificationProps {
  onVerify: (provider: string, proof: unknown) => Promise<void>
  disabled?: boolean
}

export function ProofOfHumanityVerification({
  onVerify,
  disabled = false,
}: ProofOfHumanityVerificationProps) {
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
      await onVerify('proof_of_humanity', {
        address: address.toLowerCase(),
        status: 'registered', // Will be verified by backend
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
        👤 Verify with Proof of Humanity
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
          placeholder="0x... (Ethereum address registered with PoH)"
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
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {loading ? '⏳ Checking Registration...' : '👤 Verify with Proof of Humanity'}
      </button>

      <div className="text-sm text-gray-500 text-center space-y-1">
        <p>Your address must be registered on the Proof of Humanity protocol</p>
        <a
          href="https://proofofhumanity.id"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Register at proofofhumanity.id
        </a>
      </div>
    </div>
  )
}
