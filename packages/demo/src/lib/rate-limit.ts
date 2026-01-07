/**
 * Simple in-memory rate limiter using sliding window algorithm
 *
 * NOTE: This is suitable for single-instance deployments.
 * For production with multiple instances, use Redis-based rate limiting
 * (e.g., @upstash/ratelimit or similar)
 */

interface RateLimitEntry {
  tokens: number
  lastRefill: number
}

interface RateLimiterConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private config: RateLimiterConfig

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Clean up old entries periodically
    setInterval(() => this.cleanup(), this.config.windowMs * 2)
  }

  /**
   * Check if a request should be allowed
   * @param key - Unique identifier (e.g., IP address)
   * @returns Object with success status and remaining tokens
   */
  check(key: string): { success: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry) {
      // First request from this key
      this.store.set(key, {
        tokens: this.config.maxRequests - 1,
        lastRefill: now,
      })
      return {
        success: true,
        remaining: this.config.maxRequests - 1,
        resetIn: this.config.windowMs,
      }
    }

    // Calculate token refill based on time elapsed
    const elapsed = now - entry.lastRefill
    const refillAmount = Math.floor(elapsed / this.config.windowMs) * this.config.maxRequests

    if (refillAmount > 0) {
      entry.tokens = Math.min(this.config.maxRequests, entry.tokens + refillAmount)
      entry.lastRefill = now
    }

    if (entry.tokens <= 0) {
      const resetIn = this.config.windowMs - (now - entry.lastRefill)
      return {
        success: false,
        remaining: 0,
        resetIn: Math.max(0, resetIn),
      }
    }

    entry.tokens--
    return {
      success: true,
      remaining: entry.tokens,
      resetIn: this.config.windowMs - (now - entry.lastRefill),
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const expiry = this.config.windowMs * 2

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.lastRefill > expiry) {
        this.store.delete(key)
      }
    }
  }
}

// Singleton instance for the verify endpoint
// 10 requests per minute per IP
export const verifyRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
})

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback for local development
  return '127.0.0.1'
}
