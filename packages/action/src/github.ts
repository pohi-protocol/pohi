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
 * Find PR number by commit SHA
 */
async function findPRByCommit(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string
): Promise<number | null> {
  try {
    const { data: prs } = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      owner,
      repo,
      commit_sha: sha,
    })

    // Return the first open PR, or the first PR if none are open
    const openPR = prs.find((pr) => pr.state === 'open')
    return openPR?.number ?? prs[0]?.number ?? null
  } catch (error) {
    core.warning(`Failed to find PR by commit: ${error}`)
    return null
  }
}

/**
 * Find existing PoHI comment on a PR
 */
async function findExistingPohiComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<number | null> {
  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
    })

    // Find comment with PoHI markers
    const pohiComment = comments.find(
      (c) =>
        c.body?.includes('Human Approval Required') ||
        c.body?.includes('Human Approval Verified') ||
        c.body?.includes('Approve with World ID')
    )

    return pohiComment?.id ?? null
  } catch (error) {
    core.warning(`Failed to find existing PoHI comment: ${error}`)
    return null
  }
}

/**
 * Create or find approval comment on PR
 */
export async function createApprovalComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  approvalUrl: string
): Promise<number> {
  const shortSha = sha.slice(0, 7)

  // First, try to find the PR
  const prNumber = await findPRByCommit(octokit, owner, repo, sha)

  if (prNumber) {
    // Check if there's already a PoHI comment on this PR
    const existingCommentId = await findExistingPohiComment(octokit, owner, repo, prNumber)

    if (existingCommentId) {
      core.info(`Found existing PoHI comment ${existingCommentId} on PR #${prNumber}`)
      return existingCommentId
    }

    // Create new PR comment
    const body = `## 🔏 Human Approval Required

This PR requires human verification before it can be merged.

- **Repository:** \`${owner}/${repo}\`
- **Commit:** \`${shortSha}\`
- **PR:** #${prNumber}

### 👉 [Approve with World ID](${approvalUrl})

Once approved, the attestation hash will be recorded on-chain.

---
_Powered by [PoHI Protocol](https://github.com/pohi-protocol/pohi) - Proof of Human Intent_`

    const response = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    })

    core.info(`Created approval comment on PR #${prNumber}: ${response.data.html_url}`)
    return response.data.id
  }

  // Fallback: create commit comment if no PR found
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

  core.info(`Created approval comment on commit: ${response.data.html_url}`)
  // Return negative ID to indicate it's a commit comment
  return -response.data.id
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

This PR has been approved by a verified human.

- **Provider:** World ID
- **Approved at:** ${new Date().toISOString()}
- **Attestation Hash:** \`${attestationHash.slice(0, 16)}...\`

### Verification Complete

The attestation has been recorded. This commit can now be merged.

<details>
<summary>Attestation Details</summary>

- **Full Hash:** \`${attestationHash}\`
- **Nullifier:** \`${nullifierHash}\`

</details>

---
_Powered by [PoHI Protocol](https://github.com/pohi-protocol/pohi) - Proof of Human Intent_`

  // Check if it's a PR comment (positive) or commit comment (negative)
  if (commentId > 0) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: commentId,
      body,
    })
    core.info('Updated PR comment with success status')
  } else {
    await octokit.rest.repos.updateCommitComment({
      owner,
      repo,
      comment_id: Math.abs(commentId),
      body,
    })
    core.info('Updated commit comment with success status')
  }
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
_Powered by [PoHI Protocol](https://github.com/pohi-protocol/pohi) - Proof of Human Intent_`

  // Check if it's a PR comment (positive) or commit comment (negative)
  if (commentId > 0) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: commentId,
      body,
    })
    core.info('Updated PR comment with timeout status')
  } else {
    await octokit.rest.repos.updateCommitComment({
      owner,
      repo,
      comment_id: Math.abs(commentId),
      body,
    })
    core.info('Updated commit comment with timeout status')
  }
}
