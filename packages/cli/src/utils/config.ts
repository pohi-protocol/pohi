import Conf from 'conf'

interface PoHIConfig {
  approvalUrl?: string
  worldIdAppId?: string
  worldIdAction?: string
  network?: 'mainnet' | 'sepolia'
  contractAddress?: string
  privateKey?: string
}

const config = new Conf<PoHIConfig>({
  projectName: 'pohi',
  schema: {
    approvalUrl: {
      type: 'string',
    },
    worldIdAppId: {
      type: 'string',
    },
    worldIdAction: {
      type: 'string',
    },
    network: {
      type: 'string',
      enum: ['mainnet', 'sepolia'],
    },
    contractAddress: {
      type: 'string',
    },
    privateKey: {
      type: 'string',
    },
  },
})

export function getConfig(): PoHIConfig {
  return config.store
}

export function setConfig<K extends keyof PoHIConfig>(key: K, value: PoHIConfig[K]): void {
  config.set(key, value)
}

export function getConfigValue<K extends keyof PoHIConfig>(key: K): PoHIConfig[K] | undefined {
  return config.get(key)
}

export function deleteConfigValue<K extends keyof PoHIConfig>(key: K): void {
  config.delete(key)
}

export function clearConfig(): void {
  config.clear()
}

export function getConfigPath(): string {
  return config.path
}

/**
 * Get a config value with environment variable fallback
 */
export function getConfigWithEnv<K extends keyof PoHIConfig>(key: K, envVar: string): PoHIConfig[K] | undefined {
  const envValue = process.env[envVar]
  if (envValue) {
    return envValue as PoHIConfig[K]
  }
  return config.get(key)
}
