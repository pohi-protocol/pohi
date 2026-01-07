/**
 * Webhook Notification System for PoHI
 *
 * Sends notifications to configured webhook endpoints when:
 * - An attestation is approved
 * - A verification fails
 * - Other important events occur
 *
 * Environment Variables:
 * - POHI_WEBHOOK_URL: Primary webhook URL (optional)
 * - POHI_WEBHOOK_SECRET: Secret for signing webhook payloads (optional)
 * - POHI_WEBHOOK_TIMEOUT_MS: Request timeout in milliseconds (default: 10000)
 */

import { createHmac } from 'crypto'
import type { HumanApprovalAttestation, ApprovalSubject } from 'pohi-core'

export interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: WebhookEventData
}

export type WebhookEvent =
  | 'attestation.approved'
  | 'verification.failed'
  | 'verification.timeout'

export interface AttestationApprovedData {
  attestation: HumanApprovalAttestation
  subject: ApprovalSubject
  provider: string
}

export interface VerificationFailedData {
  subject: ApprovalSubject
  provider: string
  error: string
}

export interface VerificationTimeoutData {
  subject: ApprovalSubject
  timeout_minutes: number
}

export type WebhookEventData =
  | AttestationApprovedData
  | VerificationFailedData
  | VerificationTimeoutData

export interface WebhookConfig {
  url: string
  secret?: string
  timeoutMs?: number
}

export interface WebhookResult {
  success: boolean
  statusCode?: number
  error?: string
  duration?: number
}

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function generateSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

/**
 * Get webhook configuration from environment
 */
export function getWebhookConfig(): WebhookConfig | null {
  const url = process.env.POHI_WEBHOOK_URL

  if (!url) {
    return null
  }

  return {
    url,
    secret: process.env.POHI_WEBHOOK_SECRET,
    timeoutMs: parseInt(process.env.POHI_WEBHOOK_TIMEOUT_MS || '10000', 10),
  }
}

/**
 * Send webhook notification
 */
export async function sendWebhook(
  config: WebhookConfig,
  event: WebhookEvent,
  data: WebhookEventData
): Promise<WebhookResult> {
  const startTime = Date.now()

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  }

  const payloadString = JSON.stringify(payload)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-PoHI-Event': event,
    'X-PoHI-Timestamp': payload.timestamp,
  }

  // Add signature if secret is configured
  if (config.secret) {
    const signature = generateSignature(payloadString, config.secret)
    headers['X-PoHI-Signature'] = `sha256=${signature}`
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 10000)

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const duration = Date.now() - startTime

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
        duration,
      }
    }

    return {
      success: true,
      statusCode: response.status,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: `Webhook request timed out after ${config.timeoutMs}ms`,
        duration,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    }
  }
}

/**
 * Notify webhook about an approved attestation
 */
export async function notifyAttestationApproved(
  attestation: HumanApprovalAttestation,
  subject: ApprovalSubject,
  provider: string
): Promise<WebhookResult | null> {
  const config = getWebhookConfig()

  if (!config) {
    return null // Webhook not configured
  }

  const data: AttestationApprovedData = {
    attestation,
    subject,
    provider,
  }

  console.log(`Sending webhook notification: attestation.approved to ${config.url}`)

  const result = await sendWebhook(config, 'attestation.approved', data)

  if (result.success) {
    console.log(`Webhook sent successfully (${result.duration}ms)`)
  } else {
    console.error(`Webhook failed: ${result.error}`)
  }

  return result
}

/**
 * Notify webhook about a failed verification
 */
export async function notifyVerificationFailed(
  subject: ApprovalSubject,
  provider: string,
  error: string
): Promise<WebhookResult | null> {
  const config = getWebhookConfig()

  if (!config) {
    return null // Webhook not configured
  }

  const data: VerificationFailedData = {
    subject,
    provider,
    error,
  }

  console.log(`Sending webhook notification: verification.failed to ${config.url}`)

  const result = await sendWebhook(config, 'verification.failed', data)

  if (!result.success) {
    console.error(`Webhook failed: ${result.error}`)
  }

  return result
}

/**
 * Verify incoming webhook signature
 * Use this in your webhook receiver to validate authenticity
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = `sha256=${generateSignature(payload, secret)}`

  // Use timing-safe comparison
  if (signature.length !== expectedSignature.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }

  return result === 0
}
