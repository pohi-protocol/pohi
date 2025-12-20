import { Command } from 'commander'
import { readFileSync } from 'fs'
import { validateAttestation, isValidAttestation as checkAttestation, computeAttestationHash } from 'pohi-core'
import { getConfigWithEnv } from '../utils/config.js'
import { success, error, info, header, outputAttestation, isJsonOutput, log } from '../utils/output.js'

interface VerifyOptions {
  file?: string
  hash?: string
  repo?: string
  commit?: string
  network?: 'mainnet' | 'sepolia'
  onchain?: boolean
}

export const verifyCommand = new Command('verify')
  .description('Verify an attestation')
  .option('-f, --file <path>', 'Path to attestation JSON file')
  .option('-H, --hash <hash>', 'Attestation hash to verify on-chain')
  .option('-r, --repo <repository>', 'Repository (with -c/--commit)')
  .option('-c, --commit <sha>', 'Commit SHA (with -r/--repo)')
  .option('-n, --network <network>', 'Network for on-chain verification (mainnet/sepolia)')
  .option('--onchain', 'Verify on-chain status')
  .action(async (options: VerifyOptions) => {
    // Validate input combinations
    const hasFile = !!options.file
    const hasHash = !!options.hash
    const hasRepoCommit = options.repo && options.commit

    if (!hasFile && !hasHash && !hasRepoCommit) {
      error('Must specify --file, --hash, or both --repo and --commit')
      process.exit(1)
    }

    // Verify from file
    if (hasFile) {
      await verifyFromFile(options.file!, options.onchain, options.network)
      return
    }

    // Verify from hash (on-chain only)
    if (hasHash) {
      await verifyFromHash(options.hash!, options.network)
      return
    }

    // Verify from repo + commit (check on-chain)
    if (hasRepoCommit) {
      await verifyFromCommit(options.repo!, options.commit!, options.network)
      return
    }
  })

async function verifyFromFile(filePath: string, onchain?: boolean, network?: string) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const attestation = JSON.parse(content)

    if (!isJsonOutput()) {
      header('Verifying Attestation from File')
    }

    // Validate structure
    const validationResult = validateAttestation(attestation)
    if (!validationResult.valid) {
      error('Invalid attestation structure')
      validationResult.errors.forEach(e => info(`  - ${e}`))
      process.exit(1)
    }

    // Verify hash integrity
    if (attestation.attestation_hash) {
      const computedHash = computeAttestationHash(attestation)
      if (computedHash !== attestation.attestation_hash) {
        error('Hash mismatch - attestation may have been tampered with')
        info(`Expected: ${attestation.attestation_hash}`)
        info(`Computed: ${computedHash}`)
        process.exit(1)
      }
      success('Hash integrity verified')
    }

    // Check on-chain if requested
    if (onchain && attestation.attestation_hash) {
      const networkToUse = (network || getConfigWithEnv('network', 'POHI_NETWORK') || 'sepolia') as 'mainnet' | 'sepolia'

      info(`Checking on-chain status on ${networkToUse}...`)

      const { PoHIClient } = await import('pohi-sdk')
      const client = new PoHIClient({ network: networkToUse })

      const isValid = await client.isValidAttestation(attestation.attestation_hash)

      if (isValid) {
        success('Attestation is recorded and valid on-chain')
      } else {
        info('Attestation not found or revoked on-chain')
      }
    }

    outputAttestation(attestation)
    success('Attestation is valid')

  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      error(`File not found: ${filePath}`)
    } else if (err instanceof SyntaxError) {
      error('Invalid JSON in attestation file')
    } else {
      error('Verification failed', err)
    }
    process.exit(1)
  }
}

async function verifyFromHash(hash: string, network?: string) {
  const networkToUse = (network || getConfigWithEnv('network', 'POHI_NETWORK') || 'sepolia') as 'mainnet' | 'sepolia'

  if (!isJsonOutput()) {
    header('Verifying Attestation On-Chain')
    info(`Network: ${networkToUse}`)
    info(`Hash: ${hash}`)
  }

  try {
    const { PoHIClient } = await import('pohi-sdk')
    const client = new PoHIClient({ network: networkToUse })

    const attestationHash = hash.startsWith('0x') ? hash : `0x${hash}`

    const isValid = await client.isValidAttestation(attestationHash as `0x${string}`)

    if (!isValid) {
      error('Attestation not found or revoked')
      process.exit(1)
    }

    const onChainData = await client.getAttestation(attestationHash as `0x${string}`)

    success('Attestation is valid on-chain', {
      repository: onChainData.repository,
      commitSha: onChainData.commitSha,
      verificationLevel: onChainData.verificationLevel === 1 ? 'orb' : 'device',
      timestamp: new Date(Number(onChainData.timestamp) * 1000).toISOString(),
      recorder: onChainData.recorder,
    })

  } catch (err) {
    error('On-chain verification failed', err)
    process.exit(1)
  }
}

async function verifyFromCommit(repo: string, commit: string, network?: string) {
  const networkToUse = (network || getConfigWithEnv('network', 'POHI_NETWORK') || 'sepolia') as 'mainnet' | 'sepolia'

  if (!isJsonOutput()) {
    header('Verifying Commit Attestations')
    info(`Repository: ${repo}`)
    info(`Commit: ${commit}`)
    info(`Network: ${networkToUse}`)
  }

  try {
    const { PoHIClient } = await import('pohi-sdk')
    const client = new PoHIClient({ network: networkToUse })

    const hasValid = await client.hasValidAttestation(repo, commit)

    if (!hasValid) {
      error('No valid attestations found for this commit')
      process.exit(1)
    }

    const count = await client.getValidAttestationCount(repo, commit)
    const hashes = await client.getAttestationsForCommit(repo, commit)

    success('Commit has valid attestations', {
      validCount: count.toString(),
      attestationHashes: hashes.join(', '),
    })

    // Show details for each attestation
    if (!isJsonOutput() && hashes.length > 0) {
      log('')
      info('Attestation details:')
      for (const hash of hashes) {
        try {
          const data = await client.getAttestation(hash)
          if (!data.revoked) {
            log(`  ${hash.slice(0, 18)}...`)
            log(`    Level: ${data.verificationLevel === 1 ? 'orb' : 'device'}`)
            log(`    Time: ${new Date(Number(data.timestamp) * 1000).toISOString()}`)
          }
        } catch {
          // Skip invalid attestations
        }
      }
    }

  } catch (err) {
    error('Verification failed', err)
    process.exit(1)
  }
}
