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
        className="bg-gray-300 text-gray-500 px-8 py-4 rounded-lg text-xl font-semibold cursor-not-allowed"
      >
        👁️ Verify with World ID
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
          className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-lg text-xl font-semibold hover:opacity-80 transition-opacity"
        >
          👁️ Verify with World ID
        </button>
      )}
    </IDKitWidget>
  )
}
