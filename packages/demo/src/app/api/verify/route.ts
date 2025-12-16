import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/idkit-core/backend'
import type { ISuccessResult } from '@worldcoin/idkit'
import {
  createAttestation,
  POP_PROVIDERS,
  type ApprovalSubject,
  type HumanProof,
} from '@pohi-protocol/core'
import { attestationStore } from '@/lib/store'

interface VerifyRequestBody {
  proof: ISuccessResult
  subject: ApprovalSubject
  signal: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequestBody = await request.json()
    const { proof, subject, signal } = body

    if (!proof?.nullifier_hash || !proof?.merkle_root || !proof?.proof) {
      return NextResponse.json({ success: false, error: 'Invalid proof data' }, { status: 400 })
    }

    const appId = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_${string}`
    const action = process.env.NEXT_PUBLIC_WORLD_ID_ACTION!

    if (!appId || !action) {
      return NextResponse.json({ success: false, error: 'World ID not configured' }, { status: 500 })
    }

    // Use IDKit v2's verifyCloudProof helper
    const verifyResponse: IVerifyResponse = await verifyCloudProof(
      proof,
      appId,
      action,
      signal || undefined
    )

    if (!verifyResponse.success) {
      return NextResponse.json(
        { success: false, error: verifyResponse.detail || verifyResponse.code || 'Verification failed' },
        { status: 400 }
      )
    }

    // Create human proof from World ID verification
    const humanProof: HumanProof = {
      method: POP_PROVIDERS.WORLD_ID,
      verification_level: String(proof.verification_level),
      nullifier_hash: proof.nullifier_hash,
      signal,
    }

    // Create attestation using core library (SHA-256 hash)
    const attestation = createAttestation(subject, humanProof)

    // Store attestation for status polling (used by GitHub Actions)
    if (subject.repository && subject.commit_sha) {
      attestationStore.set(subject.repository, subject.commit_sha, attestation)
    }

    return NextResponse.json({ success: true, attestation })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
