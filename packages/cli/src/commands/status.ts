import { Command } from 'commander'
import { getConfigWithEnv } from '../utils/config.js'
import { success, error, info, header, isJsonOutput, log } from '../utils/output.js'

interface StatusOptions {
  hash?: string
  repo?: string
  commit?: string
  network?: 'mainnet' | 'sepolia'
}

export const statusCommand = new Command('status')
  .description('Check attestation status on-chain')
  .option('-H, --hash <hash>', 'Attestation hash')
  .option('-r, --repo <repository>', 'Repository (with -c/--commit)')
  .option('-c, --commit <sha>', 'Commit SHA (with -r/--repo)')
  .option('-n, --network <network>', 'Network (mainnet/sepolia)', 'sepolia')
  .action(async (options: StatusOptions) => {
    const hasHash = !!options.hash
    const hasRepoCommit = options.repo && options.commit

    if (!hasHash && !hasRepoCommit) {
      error('Must specify --hash or both --repo and --commit')
      process.exit(1)
    }

    const network = (options.network || getConfigWithEnv('network', 'POHI_NETWORK') || 'sepolia') as 'mainnet' | 'sepolia'

    if (!isJsonOutput()) {
      header('On-Chain Status')
      info(`Network: ${network}`)
    }

    try {
      const { PoHIClient } = await import('pohi-sdk')
      const client = new PoHIClient({ network })

      if (hasHash) {
        await checkHashStatus(client, options.hash!)
      } else {
        await checkCommitStatus(client, options.repo!, options.commit!)
      }
    } catch (err) {
      error('Failed to check status', err)
      process.exit(1)
    }
  })

async function checkHashStatus(client: InstanceType<typeof import('pohi-sdk').PoHIClient>, hash: string) {
  const attestationHash = hash.startsWith('0x') ? hash : `0x${hash}`

  if (!isJsonOutput()) {
    info(`Hash: ${attestationHash}`)
    log('')
  }

  const isValid = await client.isValidAttestation(attestationHash as `0x${string}`)

  if (!isValid) {
    // Check if it exists but is revoked
    try {
      const data = await client.getAttestation(attestationHash as `0x${string}`)
      if (data.revoked) {
        error('Attestation has been revoked', {
          repository: data.repository,
          timestamp: new Date(Number(data.timestamp) * 1000).toISOString(),
        })
      } else {
        error('Attestation not found')
      }
    } catch {
      error('Attestation not found')
    }
    process.exit(1)
  }

  const data = await client.getAttestation(attestationHash as `0x${string}`)

  success('Attestation is valid', {
    hash: attestationHash,
    repository: data.repository,
    commitSha: data.commitSha,
    verificationLevel: data.verificationLevel === 1 ? 'orb' : 'device',
    timestamp: new Date(Number(data.timestamp) * 1000).toISOString(),
    recorder: data.recorder,
    revoked: data.revoked,
  })
}

async function checkCommitStatus(
  client: InstanceType<typeof import('pohi-sdk').PoHIClient>,
  repo: string,
  commit: string
) {
  if (!isJsonOutput()) {
    info(`Repository: ${repo}`)
    info(`Commit: ${commit}`)
    log('')
  }

  const hasValid = await client.hasValidAttestation(repo, commit)
  const count = await client.getValidAttestationCount(repo, commit)
  const hashes = await client.getAttestationsForCommit(repo, commit)

  if (!hasValid || count === 0n) {
    error('No valid attestations found for this commit')
    process.exit(1)
  }

  success('Commit has valid attestations', {
    repository: repo,
    commit,
    validCount: count.toString(),
    totalHashes: hashes.length,
  })

  if (!isJsonOutput()) {
    log('')
    info('Attestations:')

    for (const hash of hashes) {
      try {
        const data = await client.getAttestation(hash)
        const status = data.revoked ? '(revoked)' : '(valid)'
        const level = data.verificationLevel === 1 ? 'orb' : 'device'
        log(`  ${hash.slice(0, 18)}... ${status}`)
        log(`    Level: ${level}, Time: ${new Date(Number(data.timestamp) * 1000).toISOString()}`)
      } catch {
        log(`  ${hash.slice(0, 18)}... (error reading)`)
      }
    }
  }
}
