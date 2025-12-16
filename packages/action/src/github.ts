import * as core from '@actions/core'
import * as github from '@actions/github'

type Octokit = ReturnType<typeof github.getOctokit>

export interface ApprovalUrlParams {
  baseUrl: string
  repo: string
  commitSha: string
  appId: string
  action: string
}

/**
 * Build the approval URL with query parameters
 */
export function buildApprovalUrl(params: ApprovalUrlParams): string {
  const url = new URL(params.baseUrl)
  url.searchParams.set('repo', params.repo)
  url.searchParams.set('commit', params.commitSha)
  url.searchParams.set('app_id', params.appId)
  url.searchParams.set('action', params.action)
  return url.toString()
}

/**
 * Create a pending commit status with approval link
 */
export async function createPendingStatus(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  approvalUrl: string
): Promise<void> {
  await octokit.rest.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state: 'pending',
    context: 'pohi/human-approval',
    description: 'Waiting for human approval via World ID',
    target_url: approvalUrl,
  })
  core.info(`Created pending status with approval URL: ${approvalUrl}`)
}

/**
 * Update commit status to success
 */
export async function createSuccessStatus(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  attestationHash: string
): Promise<void> {
  await octokit.rest.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state: 'success',
    context: 'pohi/human-approval',
    description: `Approved by verified human (${attestationHash.slice(0, 10)}...)`,
  })
  core.info('Updated status to success')
}

/**
 * Update commit status to failure
 */
export async function createFailureStatus(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  reason: string
): Promise<void> {
  await octokit.rest.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state: 'failure',
    context: 'pohi/human-approval',
    description: reason,
  })
  core.info(`Updated status to failure: ${reason}`)
}

/**
 * Create a comment on the commit with approval request
 */
export async function createApprovalComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  approvalUrl: string
): Promise<number> {
  const body = `## 🔐 Human Approval Required

This commit requires human verification via World ID before proceeding.

**[Click here to approve](${approvalUrl})**

### Requirements
- World ID verified account (Orb or Device level)
- Scan QR code with World App

### Status
⏳ Waiting for approval...

---
*Powered by [PoHI Protocol](https://github.com/pohi-protocol) - Proof of Human Intent*`

  const response = await octokit.rest.repos.createCommitComment({
    owner,
    repo,
    commit_sha: sha,
    body,
  })

  core.info(`Created approval comment: ${response.data.html_url}`)
  return response.data.id
}

/**
 * Update the approval comment with success status
 */
export async function updateCommentSuccess(
  octokit: Octokit,
  owner: string,
  repo: string,
  commentId: number,
  attestationHash: string,
  nullifierHash: string
): Promise<void> {
  const body = `## ✅ Human Approval Verified

This commit has been approved by a verified human via World ID.

### Attestation Details
- **Hash:** \`${attestationHash}\`
- **Nullifier:** \`${nullifierHash.slice(0, 20)}...\`
- **Verified at:** ${new Date().toISOString()}

---
*Powered by [PoHI Protocol](https://github.com/pohi-protocol) - Proof of Human Intent*`

  await octokit.rest.repos.updateCommitComment({
    owner,
    repo,
    comment_id: commentId,
    body,
  })
  core.info('Updated comment with success status')
}

/**
 * Update the approval comment with timeout status
 */
export async function updateCommentTimeout(
  octokit: Octokit,
  owner: string,
  repo: string,
  commentId: number,
  timeoutMinutes: number
): Promise<void> {
  const body = `## ❌ Human Approval Timed Out

No approval was received within ${timeoutMinutes} minutes.

### Next Steps
- Re-run the workflow to request approval again
- Ensure you have access to a World ID verified account

---
*Powered by [PoHI Protocol](https://github.com/pohi-protocol) - Proof of Human Intent*`

  await octokit.rest.repos.updateCommitComment({
    owner,
    repo,
    comment_id: commentId,
    body,
  })
  core.info('Updated comment with timeout status')
}
