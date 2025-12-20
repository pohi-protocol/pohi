import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/idkit-core/backend'
import type { ISuccessResult } from '@worldcoin/idkit'
import {
  createAttestation,
  POP_PROVIDERS,
  isKnownProvider,
  getVerifier,
  isMockMode,
  type ApprovalSubject,
  type HumanProof,
} from '@pohi-protocol/core'
import { attestationStore } from '@/lib/store'
import { getProviderConfig, isMockModeEnabled } from '@/lib/provider-config'

interface VerifyRequestBody {
  provider?: string
  proof: unknown
  subject: ApprovalSubject
  signal: string
}

/**
 * Verify World ID proof using IDKit v2
 */
async function verifyWorldID(
  proof: ISuccessResult,
  signal: string
): Promise<{ success: boolean; humanProof?: HumanProof; error?: string }> {
  const appId = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_${string}`
  const action = process.env.NEXT_PUBLIC_WORLD_ID_ACTION!

  if (!appId || !action) {
    return { success: false, error: 'World ID not configured' }
  }

  const verifyResponse: IVerifyResponse = await verifyCloudProof(
    proof,
    appId,
    action,
    signal || undefined
  )

  if (!verifyResponse.success) {
    return {
      success: false,
      error: verifyResponse.detail || verifyResponse.code || 'Verification failed',
    }
  }

  const humanProof: HumanProof = {
    method: POP_PROVIDERS.WORLD_ID,
    verification_level: String(proof.verification_level),
    nullifier_hash: proof.nullifier_hash,
    signal,
  }

  return { success: true, humanProof }
}

/**
 * Verify using other PoP providers
 */
async function verifyOtherProvider(
  provider: string,
  proof: unknown,
  signal: string
): Promise<{ success: boolean; humanProof?: HumanProof; error?: string }> {
  try {
    const verifier = getVerifier(provider)
    const config = getProviderConfig(provider)

    const result = await verifier.verify(proof, config)

    if (!result.success) {
      return { success: false, error: result.error || 'Verification failed' }
    }

    const humanProof = verifier.toHumanProof(result, signal)
    return { success: true, humanProof }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequestBody = await request.json()
    const { provider = POP_PROVIDERS.WORLD_ID, proof, subject, signal } = body

    // Validate provider
    if (!isKnownProvider(provider)) {
      return NextResponse.json(
        { success: false, error: `Unknown provider: ${provider}` },
        { status: 400 }
      )
    }

    // Check mock mode
    const mockEnabled = isMockModeEnabled() || isMockMode()

    let verificationResult: {
      success: boolean
      humanProof?: HumanProof
      error?: string
    }

    if (provider === POP_PROVIDERS.WORLD_ID && !mockEnabled) {
      // World ID uses its own verification flow
      const worldIdProof = proof as ISuccessResult
      if (!worldIdProof?.nullifier_hash || !worldIdProof?.merkle_root || !worldIdProof?.proof) {
        return NextResponse.json(
          { success: false, error: 'Invalid World ID proof data' },
          { status: 400 }
        )
      }
      verificationResult = await verifyWorldID(worldIdProof, signal)
    } else {
      // Use unified verifier for other providers (or mock mode)
      verificationResult = await verifyOtherProvider(provider, proof, signal)
    }

    if (!verificationResult.success || !verificationResult.humanProof) {
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Verification failed' },
        { status: 400 }
      )
    }

    // Create attestation using core library (SHA-256 hash)
    const attestation = createAttestation(subject, verificationResult.humanProof)

    // Store attestation for status polling (used by GitHub Actions)
    if (subject.repository && subject.commit_sha) {
      attestationStore.set(subject.repository, subject.commit_sha, attestation)
    }

    return NextResponse.json({
      success: true,
      attestation,
      provider,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
