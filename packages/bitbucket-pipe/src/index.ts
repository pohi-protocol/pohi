/**
 * PoHI Bitbucket Pipe - Human Approval
 *
 * This script runs in a Bitbucket Pipeline to request and wait for
 * human approval via World ID verification.
 *
 * Environment Variables (Bitbucket Pipelines predefined):
 * - BITBUCKET_WORKSPACE: Workspace name
 * - BITBUCKET_REPO_SLUG: Repository slug
 * - BITBUCKET_COMMIT: Full commit SHA
 * - BITBUCKET_PR_ID: PR ID (only in PR pipelines)
 *
 * Environment Variables (user-provided):
 * - POHI_APPROVAL_URL: Base URL of approval server
 * - POHI_WORLD_ID_APP_ID: World ID App ID
 * - POHI_WORLD_ID_ACTION: World ID Action
 * - POHI_VERIFICATION_LEVEL: Verification level (orb/device)
 * - POHI_TIMEOUT_MINUTES: Timeout in minutes
 * - POHI_POLL_INTERVAL_SECONDS: Poll interval in seconds
 * - BITBUCKET_TOKEN: Bitbucket API token (App Password or OAuth token)
 */

import {
  buildApprovalUrl,
  createPendingStatus,
  createSuccessStatus,
  createFailureStatus,
  createPRComment,
  updatePRCommentSuccess,
  updatePRCommentTimeout,
  type BitbucketConfig,
} from './bitbucket.js'
import { writeFileSync } from 'fs'

interface StatusResponse {
  status: 'pending' | 'approved'
  repository: string
  commit_sha: string
  attestation?: {
    version: string
    type: string
    subject: {
      repository: string
      commit_sha: string
    }
    human_proof: {
      method: string
      verification_level: string
      nullifier_hash: string
      signal: string
    }
    timestamp: string
    attestation_hash: string
  }
  approved_at?: string
}

async function checkStatus(statusUrl: string): Promise<StatusResponse> {
  const response = await fetch(statusUrl)
  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getEnv(name: string, required: boolean = false): string {
  const value = process.env[name] || ''
  if (required && !value) {
    console.error(`ERROR: Required environment variable ${name} is not set`)
    process.exit(1)
  }
  return value
}

async function run(): Promise<void> {
  try {
    // Get Bitbucket Pipelines environment variables
    const workspace = getEnv('BITBUCKET_WORKSPACE', true)
    const repoSlug = getEnv('BITBUCKET_REPO_SLUG', true)
    const commitSha = getEnv('BITBUCKET_COMMIT', true)
    const prId = getEnv('BITBUCKET_PR_ID') // Only in PR pipelines
    const token = getEnv('BITBUCKET_TOKEN', true)

    // Get PoHI configuration
    const approvalBaseUrl = getEnv('POHI_APPROVAL_URL', true)
    const worldIdAppId = getEnv('POHI_WORLD_ID_APP_ID', true)
    const worldIdAction = getEnv('POHI_WORLD_ID_ACTION', true)
    const verificationLevel = getEnv('POHI_VERIFICATION_LEVEL') || 'orb'
    const timeoutMinutes = parseInt(getEnv('POHI_TIMEOUT_MINUTES') || '30', 10)
    const pollIntervalSeconds = parseInt(getEnv('POHI_POLL_INTERVAL_SECONDS') || '10', 10)

    // Build repository identifier
    const repo = `${workspace}/${repoSlug}`

    const config: BitbucketConfig = {
      apiUrl: 'https://api.bitbucket.org/2.0',
      workspace,
      repoSlug,
      token,
    }

    console.log(`Starting PoHI approval for ${repo}@${commitSha.slice(0, 7)}`)
    console.log(`Verification level: ${verificationLevel}`)
    console.log(`Timeout: ${timeoutMinutes} minutes`)

    // Build URLs
    const approvalUrl = buildApprovalUrl({
      baseUrl: approvalBaseUrl,
      repo,
      commitSha,
      appId: worldIdAppId,
      action: worldIdAction,
    })

    const statusUrl = new URL('/api/status', approvalBaseUrl)
    statusUrl.searchParams.set('repo', repo)
    statusUrl.searchParams.set('commit', commitSha)

    // Create pending status
    await createPendingStatus(config, commitSha, approvalUrl)

    // Create PR comment if in PR pipeline
    let commentId: number | null = null
    if (prId) {
      try {
        commentId = await createPRComment(config, prId, approvalUrl)
      } catch (error) {
        console.warn(`Warning: Could not create PR comment: ${error}`)
      }
    }

    // Log approval URL
    console.log('')
    console.log('━'.repeat(60))
    console.log('🔐 HUMAN APPROVAL REQUIRED')
    console.log('━'.repeat(60))
    console.log('')
    console.log(`Approval URL: ${approvalUrl}`)
    console.log('')
    console.log('━'.repeat(60))
    console.log('')

    // Poll for approval
    const startTime = Date.now()
    const timeoutMs = timeoutMinutes * 60 * 1000
    let approved = false
    let attestation: StatusResponse['attestation'] | undefined

    while (Date.now() - startTime < timeoutMs) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.ceil((timeoutMs - (Date.now() - startTime)) / 1000 / 60)

      console.log(`Checking status... (${elapsed}s elapsed, ${remaining}min remaining)`)

      try {
        const status = await checkStatus(statusUrl.toString())

        if (status.status === 'approved' && status.attestation) {
          approved = true
          attestation = status.attestation
          console.log('✅ Approval received!')
          break
        }
      } catch (error) {
        console.warn(`Status check error: ${error}`)
      }

      await sleep(pollIntervalSeconds * 1000)
    }

    if (!approved || !attestation) {
      // Timeout
      console.error(`Timed out waiting for approval after ${timeoutMinutes} minutes`)

      await createFailureStatus(config, commitSha, `Timed out after ${timeoutMinutes} minutes`)

      if (prId && commentId) {
        try {
          await updatePRCommentTimeout(config, prId, commentId, timeoutMinutes)
        } catch (error) {
          console.warn(`Warning: Could not update PR comment: ${error}`)
        }
      }

      process.exit(1)
    }

    // Success - write output to dotenv file for artifacts
    const outputEnv = [
      `POHI_ATTESTATION=${JSON.stringify(attestation)}`,
      `POHI_ATTESTATION_HASH=${attestation.attestation_hash}`,
      `POHI_NULLIFIER_HASH=${attestation.human_proof.nullifier_hash}`,
      `POHI_APPROVED_AT=${attestation.timestamp}`,
    ].join('\n')

    writeFileSync('pohi-approval.env', outputEnv)
    console.log('Wrote attestation to pohi-approval.env')

    // Update Bitbucket status
    await createSuccessStatus(config, commitSha, attestation.attestation_hash)

    if (prId && commentId) {
      try {
        await updatePRCommentSuccess(
          config,
          prId,
          commentId,
          attestation.attestation_hash,
          attestation.human_proof.nullifier_hash
        )
      } catch (error) {
        console.warn(`Warning: Could not update PR comment: ${error}`)
      }
    }

    console.log('')
    console.log('━'.repeat(60))
    console.log('✅ HUMAN APPROVAL VERIFIED')
    console.log('━'.repeat(60))
    console.log(`Attestation Hash: ${attestation.attestation_hash}`)
    console.log(`Nullifier Hash: ${attestation.human_proof.nullifier_hash}`)
    console.log(`Verified At: ${attestation.timestamp}`)
    console.log('━'.repeat(60))

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

run()
