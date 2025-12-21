/**
 * Bitbucket API Client for PoHI Human Approval
 *
 * Provides functions to interact with Bitbucket's REST API for:
 * - Build status updates
 * - Pull Request comments
 */

export interface BitbucketConfig {
  apiUrl: string
  workspace: string
  repoSlug: string
  token: string
}

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
 * Create a pending build status
 */
export async function createPendingStatus(
  config: BitbucketConfig,
  sha: string,
  approvalUrl: string
): Promise<void> {
  const url = `${config.apiUrl}/repositories/${config.workspace}/${config.repoSlug}/commit/${sha}/statuses/build/pohi-human-approval`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: JSON.stringify({
      state: 'INPROGRESS',
      key: 'pohi-human-approval',
      name: 'PoHI Human Approval',
      description: 'Waiting for human approval via World ID',
      url: approvalUrl,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create pending status: ${response.status} ${text}`)
  }

  console.log(`Created pending status with approval URL: ${approvalUrl}`)
}

/**
 * Update build status to success
 */
export async function createSuccessStatus(
  config: BitbucketConfig,
  sha: string,
  attestationHash: string
): Promise<void> {
  const url = `${config.apiUrl}/repositories/${config.workspace}/${config.repoSlug}/commit/${sha}/statuses/build/pohi-human-approval`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: JSON.stringify({
      state: 'SUCCESSFUL',
      key: 'pohi-human-approval',
      name: 'PoHI Human Approval',
      description: `Approved by verified human (${attestationHash.slice(0, 10)}...)`,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create success status: ${response.status} ${text}`)
  }

  console.log('Updated status to success')
}

/**
 * Update build status to failure
 */
export async function createFailureStatus(
  config: BitbucketConfig,
  sha: string,
  reason: string
): Promise<void> {
  const url = `${config.apiUrl}/repositories/${config.workspace}/${config.repoSlug}/commit/${sha}/statuses/build/pohi-human-approval`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: JSON.stringify({
      state: 'FAILED',
      key: 'pohi-human-approval',
      name: 'PoHI Human Approval',
      description: reason,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create failure status: ${response.status} ${text}`)
  }

  console.log(`Updated status to failure: ${reason}`)
}

/**
 * Create a comment on a Pull Request
 */
export async function createPRComment(
  config: BitbucketConfig,
  prId: string,
  approvalUrl: string
): Promise<number> {
  const url = `${config.apiUrl}/repositories/${config.workspace}/${config.repoSlug}/pullrequests/${prId}/comments`

  const body = `## 🔐 Human Approval Required

This pull request requires human verification via World ID before proceeding.

**[Click here to approve](${approvalUrl})**

### Requirements
- World ID verified account (Orb or Device level)
- Scan QR code with World App

### Status
⏳ Waiting for approval...

---
*Powered by [PoHI Protocol](https://github.com/pohi-protocol) - Proof of Human Intent*`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: JSON.stringify({
      content: { raw: body },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create PR comment: ${response.status} ${text}`)
  }

  const data = await response.json()
  console.log(`Created approval comment on PR #${prId}`)
  return data.id
}

/**
 * Update an existing PR comment with success status
 */
export async function updatePRCommentSuccess(
  config: BitbucketConfig,
  prId: string,
  commentId: number,
  attestationHash: string,
  nullifierHash: string
): Promise<void> {
  const url = `${config.apiUrl}/repositories/${config.workspace}/${config.repoSlug}/pullrequests/${prId}/comments/${commentId}`

  const body = `## ✅ Human Approval Verified

This pull request has been approved by a verified human via World ID.

### Attestation Details
- **Hash:** \`${attestationHash}\`
- **Nullifier:** \`${nullifierHash.slice(0, 20)}...\`
- **Verified at:** ${new Date().toISOString()}

---
*Powered by [PoHI Protocol](https://github.com/pohi-protocol) - Proof of Human Intent*`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: JSON.stringify({
      content: { raw: body },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update PR comment: ${response.status} ${text}`)
  }

  console.log('Updated comment with success status')
}

/**
 * Update an existing PR comment with timeout status
 */
export async function updatePRCommentTimeout(
  config: BitbucketConfig,
  prId: string,
  commentId: number,
  timeoutMinutes: number
): Promise<void> {
  const url = `${config.apiUrl}/repositories/${config.workspace}/${config.repoSlug}/pullrequests/${prId}/comments/${commentId}`

  const body = `## ❌ Human Approval Timed Out

No approval was received within ${timeoutMinutes} minutes.

### Next Steps
- Re-run the pipeline to request approval again
- Ensure you have access to a World ID verified account

---
*Powered by [PoHI Protocol](https://github.com/pohi-protocol) - Proof of Human Intent*`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: JSON.stringify({
      content: { raw: body },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update PR comment: ${response.status} ${text}`)
  }

  console.log('Updated comment with timeout status')
}
