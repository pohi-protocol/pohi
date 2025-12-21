/**
 * GitLab API Client for PoHI Human Approval
 *
 * Provides functions to interact with GitLab's REST API for:
 * - Commit status updates
 * - Merge Request notes (comments)
 */

export interface GitLabConfig {
  apiUrl: string
  projectId: string
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
 * Create a pending commit status
 */
export async function createPendingStatus(
  config: GitLabConfig,
  sha: string,
  approvalUrl: string
): Promise<void> {
  const url = `${config.apiUrl}/projects/${encodeURIComponent(config.projectId)}/statuses/${sha}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PRIVATE-TOKEN': config.token,
    },
    body: JSON.stringify({
      state: 'pending',
      name: 'pohi/human-approval',
      description: 'Waiting for human approval via World ID',
      target_url: approvalUrl,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create pending status: ${response.status} ${text}`)
  }

  console.log(`Created pending status with approval URL: ${approvalUrl}`)
}

/**
 * Update commit status to success
 */
export async function createSuccessStatus(
  config: GitLabConfig,
  sha: string,
  attestationHash: string
): Promise<void> {
  const url = `${config.apiUrl}/projects/${encodeURIComponent(config.projectId)}/statuses/${sha}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PRIVATE-TOKEN': config.token,
    },
    body: JSON.stringify({
      state: 'success',
      name: 'pohi/human-approval',
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
 * Update commit status to failure
 */
export async function createFailureStatus(
  config: GitLabConfig,
  sha: string,
  reason: string
): Promise<void> {
  const url = `${config.apiUrl}/projects/${encodeURIComponent(config.projectId)}/statuses/${sha}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PRIVATE-TOKEN': config.token,
    },
    body: JSON.stringify({
      state: 'failed',
      name: 'pohi/human-approval',
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
 * Create a note (comment) on a Merge Request
 */
export async function createMRNote(
  config: GitLabConfig,
  mrIid: string,
  approvalUrl: string
): Promise<number> {
  const url = `${config.apiUrl}/projects/${encodeURIComponent(config.projectId)}/merge_requests/${mrIid}/notes`

  const body = `## 🔐 Human Approval Required

This merge request requires human verification via World ID before proceeding.

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
      'PRIVATE-TOKEN': config.token,
    },
    body: JSON.stringify({ body }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create MR note: ${response.status} ${text}`)
  }

  const data = await response.json()
  console.log(`Created approval note on MR !${mrIid}`)
  return data.id
}

/**
 * Update an existing MR note with success status
 */
export async function updateMRNoteSuccess(
  config: GitLabConfig,
  mrIid: string,
  noteId: number,
  attestationHash: string,
  nullifierHash: string
): Promise<void> {
  const url = `${config.apiUrl}/projects/${encodeURIComponent(config.projectId)}/merge_requests/${mrIid}/notes/${noteId}`

  const body = `## ✅ Human Approval Verified

This merge request has been approved by a verified human via World ID.

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
      'PRIVATE-TOKEN': config.token,
    },
    body: JSON.stringify({ body }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update MR note: ${response.status} ${text}`)
  }

  console.log('Updated note with success status')
}

/**
 * Update an existing MR note with timeout status
 */
export async function updateMRNoteTimeout(
  config: GitLabConfig,
  mrIid: string,
  noteId: number,
  timeoutMinutes: number
): Promise<void> {
  const url = `${config.apiUrl}/projects/${encodeURIComponent(config.projectId)}/merge_requests/${mrIid}/notes/${noteId}`

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
      'PRIVATE-TOKEN': config.token,
    },
    body: JSON.stringify({ body }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update MR note: ${response.status} ${text}`)
  }

  console.log('Updated note with timeout status')
}
