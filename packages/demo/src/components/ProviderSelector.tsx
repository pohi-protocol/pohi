'use client'

import { POP_PROVIDERS } from 'pohi-core'
import { useTranslation } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n/translations'

interface Provider {
  id: string
  nameKey: TranslationKey
  descKey: TranslationKey
  icon: React.ReactNode
  sybilResistance: 'high' | 'medium'
  available: boolean
  featured?: boolean
}

function WorldIDIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IdCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4M14 14h4" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function PuzzleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 01-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 10-3.214 3.214c.446.166.855.497.925.968a.979.979 0 01-.276.837l-1.61 1.61a2.404 2.404 0 01-1.705.707 2.402 2.402 0 01-1.704-.706l-1.568-1.568a1.026 1.026 0 00-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 11-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 00-.289-.877l-1.568-1.568A2.402 2.402 0 011.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 103.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0112 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 113.237 3.237c-.464.18-.894.527-.967 1.02z" />
    </svg>
  )
}

function CheckBadgeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  )
}

function HandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075-5.925a1.575 1.575 0 013.15 0v1.5m-3.15-1.5v5.925m3.15-5.925v2.7a1.575 1.575 0 013.15 0v2.7m0 0v2.175a6.3 6.3 0 01-6.3 6.3h-.525a6.3 6.3 0 01-6.3-6.3v-3.675a1.575 1.575 0 013.15 0v3.675" />
    </svg>
  )
}

const PROVIDERS: Provider[] = [
  {
    id: POP_PROVIDERS.WORLD_ID,
    nameKey: 'worldId',
    descKey: 'worldIdDesc',
    icon: <WorldIDIcon />,
    sybilResistance: 'high',
    available: true,
    featured: true,
  },
  {
    id: POP_PROVIDERS.GITCOIN_PASSPORT,
    nameKey: 'gitcoinPassport',
    descKey: 'gitcoinPassportDesc',
    icon: <ShieldIcon />,
    sybilResistance: 'medium',
    available: true,
  },
  {
    id: POP_PROVIDERS.BRIGHTID,
    nameKey: 'brightId',
    descKey: 'brightIdDesc',
    icon: <SunIcon />,
    sybilResistance: 'medium',
    available: true,
  },
  {
    id: POP_PROVIDERS.CIVIC,
    nameKey: 'civic',
    descKey: 'civicDesc',
    icon: <IdCardIcon />,
    sybilResistance: 'medium',
    available: true,
  },
  {
    id: POP_PROVIDERS.PROOF_OF_HUMANITY,
    nameKey: 'proofOfHumanity',
    descKey: 'proofOfHumanityDesc',
    icon: <UserIcon />,
    sybilResistance: 'high',
    available: true,
  },
  {
    id: 'holonym',
    nameKey: 'holonym',
    descKey: 'holonymDesc',
    icon: <LockIcon />,
    sybilResistance: 'high',
    available: false,
  },
  {
    id: 'idena',
    nameKey: 'idena',
    descKey: 'idenaDesc',
    icon: <PuzzleIcon />,
    sybilResistance: 'high',
    available: false,
  },
  {
    id: 'coinbase_verifications',
    nameKey: 'coinbaseVerifications',
    descKey: 'coinbaseVerificationsDesc',
    icon: <CheckBadgeIcon />,
    sybilResistance: 'high',
    available: false,
  },
  {
    id: 'humanity_protocol',
    nameKey: 'humanityProtocol',
    descKey: 'humanityProtocolDesc',
    icon: <HandIcon />,
    sybilResistance: 'high',
    available: false,
  },
]

interface ProviderSelectorProps {
  selectedProvider: string | null
  onSelect: (provider: string) => void
}

export function ProviderSelector({ selectedProvider, onSelect }: ProviderSelectorProps) {
  const t = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('selectProvider')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('providersSubtitle')}</p>
      </div>

      {/* Featured Provider - World ID */}
      {PROVIDERS.filter((p) => p.featured).map((provider) => (
        <button
          key={provider.id}
          onClick={() => provider.available && onSelect(provider.id)}
          className={`
            w-full p-5 rounded-xl text-left transition-all duration-300 relative overflow-hidden
            ${
              selectedProvider === provider.id
                ? 'bg-world-500/10 border-2 border-world-500 dark:bg-world-400/10 dark:border-world-400'
                : 'border-2 border-world-500/30 dark:border-world-400/30 hover:border-world-500 dark:hover:border-world-400 hover:bg-world-500/5 dark:hover:bg-world-400/5'
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-world-500/10 dark:bg-world-400/10 flex items-center justify-center text-world-600 dark:text-world-400">
              {provider.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{t(provider.nameKey)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-world-500/10 text-world-600 dark:bg-world-400/10 dark:text-world-400 font-medium">
                  {t('recommended')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400 font-medium">
                  {t('highSybilResistance')}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {t(provider.descKey)}
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}

      {/* Other Providers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDERS.filter((p) => !p.featured).map((provider) => (
          <button
            key={provider.id}
            onClick={() => provider.available && onSelect(provider.id)}
            disabled={!provider.available}
            className={`
              p-4 rounded-xl text-left transition-all duration-200 card-hover
              ${
                selectedProvider === provider.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400'
                  : provider.available
                    ? 'border border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 bg-white/50 dark:bg-white/[0.02]'
                    : 'border border-gray-200/50 dark:border-gray-800 opacity-50 cursor-not-allowed bg-gray-50/50 dark:bg-white/[0.01]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  provider.available
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    : 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600'
                }`}
              >
                {provider.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{t(provider.nameKey)}</span>
                  {provider.sybilResistance === 'high' && provider.available && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400 font-medium whitespace-nowrap">
                      High
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate">
                  {t(provider.descKey)}
                </div>
                {!provider.available && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 font-medium">
                    Coming soon
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
