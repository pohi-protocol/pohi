import * as core from '@actions/core'
import * as github from '@actions/github'
import {
  buildApprovalUrl,
  createPendingStatus,
  createSuccessStatus,
  createFailureStatus,
  createApprovalComment,
  updateCommentSuccess,
  updateCommentTimeout,
} from './github'

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

async function run(): Promise<void> {
  try {
    // Get inputs
    const approvalBaseUrl = core.getInput('approval-url', { required: true })
    const worldIdAppId = core.getInput('world-id-app-id', { required: true })
    const worldIdAction = core.getInput('world-id-action', { required: true })
    const verificationLevel = core.getInput('verification-level') || 'orb'
    const timeoutMinutes = parseInt(core.getInput('timeout-minutes') || '30', 10)
    const pollIntervalSeconds = parseInt(core.getInput('poll-interval-seconds') || '10', 10)
    const githubToken = core.getInput('github-token') || process.env.GITHUB_TOKEN

    // Get context
    const { owner, repo } = github.context.repo
    const sha = github.context.sha
    const fullRepo = `${owner}/${repo}`

    core.info(`Starting PoHI approval for ${fullRepo}@${sha.slice(0, 7)}`)
    core.info(`Verification level: ${verificationLevel}`)
    core.info(`Timeout: ${timeoutMinutes} minutes`)

    // Build URLs
    const approvalUrl = buildApprovalUrl({
      baseUrl: approvalBaseUrl,
      repo: fullRepo,
      commitSha: sha,
      appId: worldIdAppId,
      action: worldIdAction,
    })

    const statusUrl = new URL('/api/status', approvalBaseUrl)
    statusUrl.searchParams.set('repo', fullRepo)
    statusUrl.searchParams.set('commit', sha)

    // Create GitHub client
    let octokit: ReturnType<typeof github.getOctokit> | null = null
    let commentId: number | null = null

    if (githubToken) {
      octokit = github.getOctokit(githubToken)

      // Create pending status and comment
      await createPendingStatus(octokit, owner, repo, sha, approvalUrl)
      commentId = await createApprovalComment(octokit, owner, repo, sha, approvalUrl)
    } else {
      core.warning('No GitHub token provided, skipping status updates')
    }

    // Log approval URL for manual access
    core.info('')
    core.info('━'.repeat(60))
    core.info('🔐 HUMAN APPROVAL REQUIRED')
    core.info('━'.repeat(60))
    core.info('')
    core.info(`Approval URL: ${approvalUrl}`)
    core.info('')
    core.info('━'.repeat(60))
    core.info('')

    // Poll for approval
    const startTime = Date.now()
    const timeoutMs = timeoutMinutes * 60 * 1000
    let approved = false
    let attestation: StatusResponse['attestation'] | undefined

    while (Date.now() - startTime < timeoutMs) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.ceil((timeoutMs - (Date.now() - startTime)) / 1000 / 60)

      core.info(`Checking status... (${elapsed}s elapsed, ${remaining}min remaining)`)

      try {
        const status = await checkStatus(statusUrl.toString())

        if (status.status === 'approved' && status.attestation) {
          approved = true
          attestation = status.attestation
          core.info('✅ Approval received!')
          break
        }
      } catch (error) {
        core.warning(`Status check error: ${error}`)
      }

      await sleep(pollIntervalSeconds * 1000)
    }

    if (!approved || !attestation) {
      // Timeout
      core.error(`Timed out waiting for approval after ${timeoutMinutes} minutes`)

      if (octokit) {
        await createFailureStatus(octokit, owner, repo, sha, `Timed out after ${timeoutMinutes} minutes`)
        if (commentId) {
          await updateCommentTimeout(octokit, owner, repo, commentId, timeoutMinutes)
        }
      }

      core.setFailed('Human approval timed out')
      return
    }

    // Success - set outputs
    core.setOutput('attestation', JSON.stringify(attestation))
    core.setOutput('attestation-hash', attestation.attestation_hash)
    core.setOutput('nullifier-hash', attestation.human_proof.nullifier_hash)
    core.setOutput('approved-at', attestation.timestamp)

    // Update GitHub status
    if (octokit) {
      await createSuccessStatus(octokit, owner, repo, sha, attestation.attestation_hash)
      if (commentId) {
        await updateCommentSuccess(
          octokit,
          owner,
          repo,
          commentId,
          attestation.attestation_hash,
          attestation.human_proof.nullifier_hash
        )
      }
    }

    core.info('')
    core.info('━'.repeat(60))
    core.info('✅ HUMAN APPROVAL VERIFIED')
    core.info('━'.repeat(60))
    core.info(`Attestation Hash: ${attestation.attestation_hash}`)
    core.info(`Nullifier Hash: ${attestation.human_proof.nullifier_hash}`)
    core.info(`Verified At: ${attestation.timestamp}`)
    core.info('━'.repeat(60))

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unexpected error occurred')
    }
  }
}

run()
