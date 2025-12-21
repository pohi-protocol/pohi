/**
 * PoHI GitLab CI Component - Human Approval
 *
 * This script runs in a GitLab CI job to request and wait for
 * human approval via World ID verification.
 *
 * Environment Variables (GitLab CI predefined):
 * - CI_PROJECT_ID: Project ID
 * - CI_COMMIT_SHA: Full commit SHA
 * - CI_MERGE_REQUEST_IID: MR internal ID (only in MR pipelines)
 * - CI_JOB_TOKEN: Job authentication token
 * - CI_API_V4_URL: GitLab API base URL
 *
 * Environment Variables (user-provided):
 * - POHI_APPROVAL_URL: Base URL of approval server
 * - POHI_WORLD_ID_APP_ID: World ID App ID
 * - POHI_WORLD_ID_ACTION: World ID Action
 * - POHI_VERIFICATION_LEVEL: Verification level (orb/device)
 * - POHI_TIMEOUT_MINUTES: Timeout in minutes
 * - POHI_POLL_INTERVAL_SECONDS: Poll interval in seconds
 * - GITLAB_TOKEN: Optional custom token (defaults to CI_JOB_TOKEN)
 */

import {
  buildApprovalUrl,
  createPendingStatus,
  createSuccessStatus,
  createFailureStatus,
  createMRNote,
  updateMRNoteSuccess,
  updateMRNoteTimeout,
  type GitLabConfig,
} from './gitlab.js'
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
    // Get GitLab CI environment variables
    const projectId = getEnv('CI_PROJECT_ID', true)
    const commitSha = getEnv('CI_COMMIT_SHA', true)
    const mrIid = getEnv('CI_MERGE_REQUEST_IID') // Only in MR pipelines
    const apiUrl = getEnv('CI_API_V4_URL') || 'https://gitlab.com/api/v4'
    const token = getEnv('GITLAB_TOKEN') || getEnv('CI_JOB_TOKEN', true)

    // Get PoHI configuration
    const approvalBaseUrl = getEnv('POHI_APPROVAL_URL', true)
    const worldIdAppId = getEnv('POHI_WORLD_ID_APP_ID', true)
    const worldIdAction = getEnv('POHI_WORLD_ID_ACTION', true)
    const verificationLevel = getEnv('POHI_VERIFICATION_LEVEL') || 'orb'
    const timeoutMinutes = parseInt(getEnv('POHI_TIMEOUT_MINUTES') || '30', 10)
    const pollIntervalSeconds = parseInt(getEnv('POHI_POLL_INTERVAL_SECONDS') || '10', 10)

    // Get repository info from CI_PROJECT_PATH or construct from ID
    const projectPath = getEnv('CI_PROJECT_PATH') || `project-${projectId}`

    const config: GitLabConfig = {
      apiUrl,
      projectId,
      token,
    }

    console.log(`Starting PoHI approval for ${projectPath}@${commitSha.slice(0, 7)}`)
    console.log(`Verification level: ${verificationLevel}`)
    console.log(`Timeout: ${timeoutMinutes} minutes`)

    // Build URLs
    const approvalUrl = buildApprovalUrl({
      baseUrl: approvalBaseUrl,
      repo: projectPath,
      commitSha,
      appId: worldIdAppId,
      action: worldIdAction,
    })

    const statusUrl = new URL('/api/status', approvalBaseUrl)
    statusUrl.searchParams.set('repo', projectPath)
    statusUrl.searchParams.set('commit', commitSha)

    // Create pending status
    await createPendingStatus(config, commitSha, approvalUrl)

    // Create MR note if in MR pipeline
    let noteId: number | null = null
    if (mrIid) {
      try {
        noteId = await createMRNote(config, mrIid, approvalUrl)
      } catch (error) {
        console.warn(`Warning: Could not create MR note: ${error}`)
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

      if (mrIid && noteId) {
        try {
          await updateMRNoteTimeout(config, mrIid, noteId, timeoutMinutes)
        } catch (error) {
          console.warn(`Warning: Could not update MR note: ${error}`)
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

    // Update GitLab status
    await createSuccessStatus(config, commitSha, attestation.attestation_hash)

    if (mrIid && noteId) {
      try {
        await updateMRNoteSuccess(
          config,
          mrIid,
          noteId,
          attestation.attestation_hash,
          attestation.human_proof.nullifier_hash
        )
      } catch (error) {
        console.warn(`Warning: Could not update MR note: ${error}`)
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
