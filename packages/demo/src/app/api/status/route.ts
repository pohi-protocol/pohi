import { NextRequest, NextResponse } from 'next/server'
import { attestationStore } from '@/lib/store'

/**
 * GET /api/status
 * Check the approval status for a specific repository and commit
 * Used by GitHub Actions to poll for approval
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const repo = searchParams.get('repo')
  const commit = searchParams.get('commit')

  if (!repo || !commit) {
    return NextResponse.json(
      { error: 'Missing required parameters: repo and commit' },
      { status: 400 }
    )
  }

  const record = attestationStore.get(repo, commit)

  if (!record) {
    return NextResponse.json({
      status: 'pending',
      repository: repo,
      commit_sha: commit,
    })
  }

  return NextResponse.json({
    status: 'approved',
    repository: repo,
    commit_sha: commit,
    attestation: record.attestation,
    approved_at: record.createdAt.toISOString(),
  })
}
