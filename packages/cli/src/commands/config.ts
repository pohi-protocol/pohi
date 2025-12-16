import { Command } from 'commander'
import {
  getConfig,
  setConfig,
  deleteConfigValue,
  clearConfig,
  getConfigPath,
} from '../utils/config.js'
import { success, error, info, log, header } from '../utils/output.js'

export const configCommand = new Command('config')
  .description('Manage PoHI CLI configuration')

configCommand
  .command('get [key]')
  .description('Get configuration value(s)')
  .action((key?: string) => {
    const config = getConfig()

    if (key) {
      const value = config[key as keyof typeof config]
      if (value !== undefined) {
        log(String(value))
      } else {
        error(`Configuration key "${key}" not set`)
        process.exit(1)
      }
    } else {
      header('Configuration')
      if (Object.keys(config).length === 0) {
        info('No configuration set')
      } else {
        Object.entries(config).forEach(([k, v]) => {
          if (k === 'privateKey') {
            log(`${k}: ***`)
          } else {
            log(`${k}: ${v}`)
          }
        })
      }
      log('')
      info(`Config file: ${getConfigPath()}`)
    }
  })

configCommand
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key: string, value: string) => {
    const validKeys = [
      'approvalUrl',
      'worldIdAppId',
      'worldIdAction',
      'network',
      'contractAddress',
      'privateKey',
    ]

    if (!validKeys.includes(key)) {
      error(`Invalid configuration key: ${key}`)
      info(`Valid keys: ${validKeys.join(', ')}`)
      process.exit(1)
    }

    if (key === 'network' && !['mainnet', 'sepolia'].includes(value)) {
      error('Network must be "mainnet" or "sepolia"')
      process.exit(1)
    }

    setConfig(key as keyof ReturnType<typeof getConfig>, value as never)
    success(`Set ${key}`, { [key]: key === 'privateKey' ? '***' : value })
  })

configCommand
  .command('delete <key>')
  .description('Delete a configuration value')
  .action((key: string) => {
    deleteConfigValue(key as keyof ReturnType<typeof getConfig>)
    success(`Deleted ${key}`)
  })

configCommand
  .command('clear')
  .description('Clear all configuration')
  .action(() => {
    clearConfig()
    success('Configuration cleared')
  })

configCommand
  .command('path')
  .description('Show configuration file path')
  .action(() => {
    log(getConfigPath())
  })
