'use client'

import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'

interface WorldIDVerificationProps {
  signal: string
  onVerify: (provider: string, proof: unknown) => Promise<void>
  disabled?: boolean
}

export function WorldIDVerification({
  signal,
  onVerify,
  disabled = false,
}: WorldIDVerificationProps) {
  const handleVerify = async (proof: ISuccessResult) => {
    await onVerify('world_id', proof)
  }

  const onSuccess = () => {
    console.log('World ID verification modal closed successfully')
  }

  if (disabled) {
    return (
      <button
        disabled
        className="w-full sm:w-auto bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold cursor-not-allowed"
      >
        <span className="flex items-center justify-center gap-3">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
          Verify with World ID
        </span>
      </button>
    )
  }

  return (
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
          className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
            Verify with World ID
          </span>
        </button>
      )}
    </IDKitWidget>
  )
}
