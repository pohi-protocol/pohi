import { Command } from 'commander'
import ora from 'ora'
import qrcode from 'qrcode-terminal'
import { getConfigWithEnv } from '../utils/config.js'
import { success, error, info, log, header, outputAttestation, isJsonOutput } from '../utils/output.js'

interface AttestOptions {
  repo: string
  commit: string
  approvalUrl?: string
  appId?: string
  action?: string
  record?: boolean
  network?: 'mainnet' | 'sepolia'
  timeout?: string
  pollInterval?: string
}

interface StatusResponse {
  status: 'pending' | 'approved'
  attestation?: Record<string, unknown>
}

export const attestCommand = new Command('attest')
  .description('Request human approval attestation for a commit')
  .requiredOption('-r, --repo <repository>', 'Repository (e.g., owner/repo)')
  .requiredOption('-c, --commit <sha>', 'Commit SHA')
  .option('-u, --approval-url <url>', 'Approval server URL')
  .option('-a, --app-id <id>', 'World ID App ID')
  .option('-A, --action <name>', 'World ID Action name')
  .option('--record', 'Record attestation on-chain after approval')
  .option('-n, --network <network>', 'Network for on-chain recording (mainnet/sepolia)')
  .option('-t, --timeout <minutes>', 'Timeout in minutes', '30')
  .option('-p, --poll-interval <seconds>', 'Poll interval in seconds', '5')
  .action(async (options: AttestOptions) => {
    const approvalUrl = options.approvalUrl || getConfigWithEnv('approvalUrl', 'POHI_APPROVAL_URL')
    const appId = options.appId || getConfigWithEnv('worldIdAppId', 'POHI_APP_ID')
    const action = options.action || getConfigWithEnv('worldIdAction', 'POHI_ACTION')

    if (!approvalUrl) {
      error('Approval URL required. Set via --approval-url, config, or POHI_APPROVAL_URL')
      process.exit(1)
    }

    if (!appId || !action) {
      error('World ID App ID and Action required')
      info('Set via --app-id/--action, config, or POHI_APP_ID/POHI_ACTION')
      process.exit(1)
    }

    const timeoutMinutes = parseInt(options.timeout || '30', 10)
    const pollIntervalSeconds = parseInt(options.pollInterval || '5', 10)

    // Build approval URL
    const url = new URL(approvalUrl)
    url.searchParams.set('repo', options.repo)
    url.searchParams.set('commit', options.commit)
    url.searchParams.set('app_id', appId)
    url.searchParams.set('action', action)
    const fullApprovalUrl = url.toString()

    // Build status URL
    const statusUrl = new URL('/api/status', approvalUrl)
    statusUrl.searchParams.set('repo', options.repo)
    statusUrl.searchParams.set('commit', options.commit)

    if (!isJsonOutput()) {
      header('Human Approval Required')
      log('')
      log('Scan this QR code with World App:')
      log('')

      // Generate QR code
      qrcode.generate(fullApprovalUrl, { small: true }, (qr: string) => {
        console.log(qr)
      })

      log('')
      info(`Or visit: ${fullApprovalUrl}`)
      log('')
    }

    // Poll for approval
    const spinner = ora('Waiting for human approval...').start()
    const startTime = Date.now()
    const timeoutMs = timeoutMinutes * 60 * 1000

    let approved = false
    let attestation: Record<string, unknown> | undefined

    while (Date.now() - startTime < timeoutMs) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.ceil((timeoutMs - (Date.now() - startTime)) / 1000 / 60)
      spinner.text = `Waiting for human approval... (${elapsed}s elapsed, ${remaining}min remaining)`

      try {
        const response = await fetch(statusUrl.toString())
        if (response.ok) {
          const status: StatusResponse = await response.json()
          if (status.status === 'approved' && status.attestation) {
            approved = true
            attestation = status.attestation
            break
          }
        }
      } catch {
        // Ignore polling errors
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalSeconds * 1000))
    }

    if (!approved || !attestation) {
      spinner.fail('Approval timed out')
      error(`No approval received within ${timeoutMinutes} minutes`)
      process.exit(1)
    }

    spinner.succeed('Human approval verified!')

    // Display attestation
    outputAttestation(attestation)

    // Optional: Record on-chain
    if (options.record) {
      const network = options.network || getConfigWithEnv('network', 'POHI_NETWORK') || 'sepolia'
      const privateKey = getConfigWithEnv('privateKey', 'POHI_PRIVATE_KEY')

      if (!privateKey) {
        error('Private key required for on-chain recording')
        info('Set via config or POHI_PRIVATE_KEY environment variable')
        process.exit(1)
      }

      const recordSpinner = ora('Recording attestation on-chain...').start()

      try {
        const { PoHIClient } = await import('@pohi-protocol/sdk')

        const client = new PoHIClient({
          network: network as 'mainnet' | 'sepolia',
          privateKey: privateKey as `0x${string}`,
        })

        const txHash = await client.recordAttestation(attestation as never)
        await client.waitForTransaction(txHash)

        recordSpinner.succeed('Attestation recorded on-chain!')
        success('Transaction confirmed', { txHash, network })
      } catch (err) {
        recordSpinner.fail('Failed to record on-chain')
        error('On-chain recording failed', err)
        process.exit(1)
      }
    }

    success('Attestation complete', {
      repository: options.repo,
      commit: options.commit,
      attestationHash: attestation.attestation_hash as string,
    })
  })
