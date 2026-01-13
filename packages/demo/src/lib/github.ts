/**
 * GitHub Integration for PoHI
 *
 * Updates PR comments after successful human approval verification.
 *
 * Environment Variables:
 * - GITHUB_TOKEN: GitHub Personal Access Token or GitHub App token with PR write permissions
 */

import type { HumanApprovalAttestation, ApprovalSubject } from 'pohi-core'

export interface GitHubConfig {
  token: string
}

export interface UpdateResult {
  success: boolean
  error?: string
  commentId?: number
}

/**
 * Get GitHub configuration from environment
 */
export function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    return null
  }

  return { token }
}

/**
 * Parse owner and repo from repository string (e.g., "owner/repo")
 */
function parseRepository(repository: string): { owner: string; repo: string } | null {
  const parts = repository.split('/')
  if (parts.length !== 2) {
    return null
  }
  return { owner: parts[0], repo: parts[1] }
}

/**
 * Find PoHI approval comment on a PR
 */
async function findPoHIComment(
  config: GitHubConfig,
  owner: string,
  repo: string,
  prNumber: number
): Promise<{ id: number; body: string } | null> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'PoHI-Demo',
      },
    }
  )

  if (!response.ok) {
    console.error(`Failed to fetch PR comments: ${response.status}`)
    return null
  }

  const comments = (await response.json()) as Array<{ id: number; body: string; user: { login: string } }>

  // Find the PoHI approval comment (contains the approval link)
  const pohiComment = comments.find(
    (c) =>
      c.body.includes('## 🔏 Human Approval Required') ||
      c.body.includes('Approve with World ID')
  )

  if (!pohiComment) {
    return null
  }

  return { id: pohiComment.id, body: pohiComment.body }
}

/**
 * Find PR number by commit SHA
 */
async function findPRByCommit(
  config: GitHubConfig,
  owner: string,
  repo: string,
  commitSha: string
): Promise<number | null> {
  // Search for PRs containing this commit
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}/pulls`,
    {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'PoHI-Demo',
      },
    }
  )

  if (!response.ok) {
    console.error(`Failed to find PR by commit: ${response.status}`)
    return null
  }

  const prs = (await response.json()) as Array<{ number: number; state: string }>

  // Return the first open PR, or the first PR if none are open
  const openPR = prs.find((pr) => pr.state === 'open')
  return openPR?.number ?? prs[0]?.number ?? null
}

/**
 * Update a comment on a PR
 */
async function updateComment(
  config: GitHubConfig,
  owner: string,
  repo: string,
  commentId: number,
  body: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/comments/${commentId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'PoHI-Demo',
      },
      body: JSON.stringify({ body }),
    }
  )

  return response.ok
}

/**
 * Generate the approved comment body
 */
function generateApprovedCommentBody(
  subject: ApprovalSubject,
  attestation: HumanApprovalAttestation,
  provider: string
): string {
  const shortSha = subject.commit_sha?.substring(0, 7) || 'unknown'
  const approvedAt = new Date().toISOString()
  const attestationHash = attestation.attestation_hash || 'N/A'

  return [
    '## ✅ Human Approval Verified',
    '',
    'This PR has been approved by a verified human.',
    '',
    '- **Repository:** `' + subject.repository + '`',
    '- **Commit:** `' + shortSha + '`',
    '- **Provider:** ' + formatProvider(provider),
    '- **Approved at:** ' + approvedAt,
    '- **Attestation Hash:** `' + attestationHash.substring(0, 16) + '...`',
    '',
    '### 🔐 Verification Complete',
    '',
    'The attestation has been recorded. This commit can now be merged.',
    '',
    '<details>',
    '<summary>Attestation Details</summary>',
    '',
    '```json',
    JSON.stringify(attestation, null, 2),
    '```',
    '',
    '</details>',
    '',
    '---',
    '_Powered by [PoHI Protocol](https://github.com/pohi-protocol/pohi) - Proof of Human Intent_',
  ].join('\n')
}

/**
 * Format provider name for display
 */
function formatProvider(provider: string): string {
  const providerNames: Record<string, string> = {
    world_id: '🌐 World ID',
    gitcoin_passport: '🛂 Gitcoin Passport',
    brightid: '💡 BrightID',
    civic: '🏛️ Civic',
    proof_of_humanity: '👤 Proof of Humanity',
  }
  return providerNames[provider] || provider
}

/**
 * Update PR comment after successful approval
 */
export async function updatePRCommentAfterApproval(
  subject: ApprovalSubject,
  attestation: HumanApprovalAttestation,
  provider: string
): Promise<UpdateResult> {
  const config = getGitHubConfig()

  if (!config) {
    console.log('[GitHub] No GITHUB_TOKEN configured, skipping PR comment update')
    return { success: false, error: 'GitHub token not configured' }
  }

  if (!subject.repository || !subject.commit_sha) {
    return { success: false, error: 'Repository or commit SHA not provided' }
  }

  const parsed = parseRepository(subject.repository)
  if (!parsed) {
    return { success: false, error: 'Invalid repository format' }
  }

  const { owner, repo } = parsed

  try {
    // Find PR by commit
    const prNumber = await findPRByCommit(config, owner, repo, subject.commit_sha)
    if (!prNumber) {
      console.log(`[GitHub] No PR found for commit ${subject.commit_sha}`)
      return { success: false, error: 'No PR found for this commit' }
    }

    // Find the PoHI comment
    const comment = await findPoHIComment(config, owner, repo, prNumber)
    if (!comment) {
      console.log(`[GitHub] No PoHI comment found on PR #${prNumber}`)
      return { success: false, error: 'No PoHI comment found on PR' }
    }

    // Generate and update comment
    const newBody = generateApprovedCommentBody(subject, attestation, provider)
    const success = await updateComment(config, owner, repo, comment.id, newBody)

    if (success) {
      console.log(`[GitHub] Updated PR #${prNumber} comment ${comment.id} to approved status`)
      return { success: true, commentId: comment.id }
    } else {
      return { success: false, error: 'Failed to update comment' }
    }
  } catch (error) {
    console.error('[GitHub] Error updating PR comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
