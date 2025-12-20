'use client'

import { POP_PROVIDERS } from 'pohi-core'

interface Provider {
  id: string
  name: string
  icon: string
  description: string
  available: boolean
}

const PROVIDERS: Provider[] = [
  {
    id: POP_PROVIDERS.WORLD_ID,
    name: 'World ID',
    icon: '👁️',
    description: 'ZK proof with Orb verification',
    available: true,
  },
  {
    id: POP_PROVIDERS.GITCOIN_PASSPORT,
    name: 'Gitcoin Passport',
    icon: '🛂',
    description: 'Web3 identity score',
    available: true,
  },
  {
    id: POP_PROVIDERS.BRIGHTID,
    name: 'BrightID',
    icon: '☀️',
    description: 'Social identity network',
    available: true,
  },
  {
    id: POP_PROVIDERS.CIVIC,
    name: 'Civic',
    icon: '🆔',
    description: 'Gateway pass verification',
    available: true,
  },
  {
    id: POP_PROVIDERS.PROOF_OF_HUMANITY,
    name: 'Proof of Humanity',
    icon: '👤',
    description: 'Kleros verified humans',
    available: true,
  },
]

interface ProviderSelectorProps {
  selectedProvider: string | null
  onSelect: (provider: string) => void
}

export function ProviderSelector({
  selectedProvider,
  onSelect,
}: ProviderSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        🔐 Select Verification Method
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            onClick={() => provider.available && onSelect(provider.id)}
            disabled={!provider.available}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${
                selectedProvider === provider.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : provider.available
                    ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{provider.icon}</span>
              <div>
                <div className="font-semibold">{provider.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {provider.description}
                </div>
              </div>
            </div>
            {!provider.available && (
              <div className="mt-2 text-xs text-gray-500">Coming soon</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
