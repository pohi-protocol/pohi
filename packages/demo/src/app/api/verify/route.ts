import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/idkit-core/backend'
import type { ISuccessResult } from '@worldcoin/idkit'
import type { HumanApprovalAttestation, ApprovalSubject } from '@/types'

interface VerifyRequestBody {
  proof: ISuccessResult
  subject: ApprovalSubject
  signal: string
}

function createAttestation(
  proof: ISuccessResult,
  subject: ApprovalSubject,
  signal: string
): HumanApprovalAttestation {
  return {
    version: '1.0',
    type: 'HumanApprovalAttestation',
    subject,
    human_proof: {
      method: 'world_id',
      verification_level: String(proof.verification_level), // Convert enum to string
      nullifier_hash: proof.nullifier_hash,
      signal,
    },
    timestamp: new Date().toISOString(),
  }
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
      signal || undefined // Pass undefined if signal is empty
    )

    if (!verifyResponse.success) {
      return NextResponse.json(
        { success: false, error: verifyResponse.detail || verifyResponse.code || 'Verification failed' },
        { status: 400 }
      )
    }

    const attestation = createAttestation(proof, subject, signal)

    return NextResponse.json({ success: true, attestation })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
