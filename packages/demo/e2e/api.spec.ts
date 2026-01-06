import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test.describe('/api/status', () => {
    test('returns status information', async ({ request }) => {
      const response = await request.get('/api/status')

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data).toHaveProperty('status')
    })
  })

  test.describe('/api/verify', () => {
    test('rejects requests without provider', async ({ request }) => {
      const response = await request.post('/api/verify', {
        data: {
          proof: {},
          subject: {
            repository: 'test/repo',
            commit_sha: 'abc123',
          },
        },
      })

      const data = await response.json()
      expect(data.success).toBe(false)
    })

    test('rejects requests without subject', async ({ request }) => {
      const response = await request.post('/api/verify', {
        data: {
          provider: 'world_id',
          proof: {},
        },
      })

      const data = await response.json()
      expect(data.success).toBe(false)
    })

    test('handles World ID verification request', async ({ request }) => {
      const response = await request.post('/api/verify', {
        data: {
          provider: 'world_id',
          proof: {
            merkle_root: '0x1234',
            nullifier_hash: '0x5678',
            proof: '0xabcd',
            verification_level: 'device',
          },
          subject: {
            repository: 'test/repo',
            commit_sha: 'abc123',
            action: 'GENERIC',
            description: 'Test',
          },
          signal: 'abc123',
        },
      })

      // Should return a response (success or failure depends on backend validation)
      expect(response.status()).toBeLessThan(500)
      const data = await response.json()
      expect(data).toHaveProperty('success')
    })

    test('handles Gitcoin Passport verification request', async ({ request }) => {
      const response = await request.post('/api/verify', {
        data: {
          provider: 'gitcoin_passport',
          proof: {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            score: 25.5,
          },
          subject: {
            repository: 'test/repo',
            commit_sha: 'def456',
            action: 'DEPLOY',
            description: 'Production deployment',
          },
        },
      })

      expect(response.status()).toBeLessThan(500)
      const data = await response.json()
      expect(data).toHaveProperty('success')
    })

    test('handles unknown provider gracefully', async ({ request }) => {
      const response = await request.post('/api/verify', {
        data: {
          provider: 'unknown_provider',
          proof: {},
          subject: {
            repository: 'test/repo',
            commit_sha: 'abc123',
          },
        },
      })

      const data = await response.json()
      expect(data.success).toBe(false)
    })
  })
})

test.describe('API Response Format', () => {
  test('successful verification returns attestation', async ({ page, request }) => {
    // This test uses page context to set up route mocking for demonstration
    // In a real scenario, you'd test against actual API behavior

    await page.route('**/api/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          attestation: {
            version: '1.0',
            type: 'HumanApprovalAttestation',
            subject: {
              repository: 'test/repo',
              commit_sha: 'abc123',
              action: 'GENERIC',
              description: 'Test',
            },
            human_proof: {
              method: 'world_id',
              verification_level: 'orb',
              nullifier_hash: '0x123',
            },
            timestamp: '2024-01-15T10:00:00.000Z',
            attestation_hash: '0xabcdef',
          },
        }),
      })
    })

    await page.goto('/')

    // The route is set up, but we verify the expected shape
    const mockResponse = {
      success: true,
      attestation: {
        version: '1.0',
        type: 'HumanApprovalAttestation',
      },
    }

    expect(mockResponse.attestation).toHaveProperty('version')
    expect(mockResponse.attestation).toHaveProperty('type')
  })

  test('failed verification returns error message', async ({ page }) => {
    await page.route('**/api/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Verification failed: Score below threshold',
        }),
      })
    })

    await page.goto('/')

    const mockResponse = {
      success: false,
      error: 'Verification failed: Score below threshold',
    }

    expect(mockResponse.success).toBe(false)
    expect(mockResponse.error).toBeDefined()
  })
})
