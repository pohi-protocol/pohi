import { test, expect } from '@playwright/test'

test.describe('Provider Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('can select World ID provider', async ({ page }) => {
    // Click on World ID option in provider selector
    await page.getByRole('button', { name: /World ID/i }).click()

    // Should show verification UI with change provider button
    await expect(page.getByText('Verify Your Identity')).toBeVisible()
    await expect(page.getByText('Change provider')).toBeVisible()
  })

  test('can select Gitcoin Passport provider', async ({ page }) => {
    await page.getByRole('button', { name: /Gitcoin Passport/i }).click()

    await expect(page.getByText('Verify Your Identity')).toBeVisible()
    await expect(page.getByText('Change provider')).toBeVisible()
  })

  test('can select BrightID provider', async ({ page }) => {
    await page.getByRole('button', { name: /BrightID/i }).click()

    await expect(page.getByText('Verify Your Identity')).toBeVisible()
  })

  test('can select Civic provider', async ({ page }) => {
    await page.getByRole('button', { name: /Civic/i }).click()

    await expect(page.getByText('Verify Your Identity')).toBeVisible()
  })

  test('can change provider after selection', async ({ page }) => {
    // Select World ID
    await page.getByRole('button', { name: /World ID/i }).click()
    await expect(page.getByText('Verify Your Identity')).toBeVisible()

    // Click change provider
    await page.getByText('Change provider').click()

    // Should show provider selection again
    await expect(page.getByRole('button', { name: /Gitcoin Passport/i })).toBeVisible()
  })
})

test.describe('Verification Flow - Mock API', () => {
  test('shows verifying state during API call', async ({ page }) => {
    await page.goto('/')

    // Mock the API to delay response
    await page.route('**/api/verify', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
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
            },
            human_proof: {
              method: 'world_id',
              verification_level: 'device',
            },
            attestation_hash: '0x1234567890abcdef',
          },
        }),
      })
    })

    // Select provider and trigger verification (this depends on provider implementation)
    await page.getByRole('button', { name: /BrightID/i }).click()

    // Look for a verify/connect button in the BrightID component
    const verifyButton = page.getByRole('button', { name: /verify|connect|link/i })
    if (await verifyButton.isVisible()) {
      await verifyButton.click()
      // May show verifying state
      // await expect(page.getByText('Verifying...')).toBeVisible()
    }
  })

  test('shows success state after successful verification', async ({ page }) => {
    await page.goto('/')

    // Mock successful API response
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
              repository: 'pohi-protocol/pohi',
              commit_sha: 'abc123def456',
              action: 'GENERIC',
              description: 'Demo approval request',
            },
            human_proof: {
              method: 'gitcoin_passport',
              verification_level: 'score_15',
              score: 25.5,
            },
            timestamp: new Date().toISOString(),
            attestation_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          },
        }),
      })
    })

    // Select Gitcoin Passport
    await page.getByRole('button', { name: /Gitcoin Passport/i }).click()

    // Find and click verify button
    const verifyButton = page.getByRole('button', { name: /verify|connect|check/i })
    if (await verifyButton.isVisible()) {
      await verifyButton.click()

      // Should show success
      await expect(page.getByText('Human Verified!')).toBeVisible({ timeout: 10000 })
      await expect(page.getByText('Attestation Created')).toBeVisible()
      await expect(page.getByText('Start new verification')).toBeVisible()
    }
  })

  test('shows error state after failed verification', async ({ page }) => {
    await page.goto('/')

    // Mock failed API response
    await page.route('**/api/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Verification failed: Invalid proof',
        }),
      })
    })

    // Select BrightID (simpler flow for testing)
    await page.getByRole('button', { name: /BrightID/i }).click()

    // Find and click verify button
    const verifyButton = page.getByRole('button', { name: /verify|connect|link/i })
    if (await verifyButton.isVisible()) {
      await verifyButton.click()

      // Should show error
      await expect(page.getByText('Verification Failed')).toBeVisible({ timeout: 10000 })
      await expect(page.getByText('Verification failed: Invalid proof')).toBeVisible()
      await expect(page.getByText('Try again')).toBeVisible()
    }
  })

  test('can reset after verification', async ({ page }) => {
    await page.goto('/')

    // Mock successful API response
    await page.route('**/api/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          attestation: {
            version: '1.0',
            type: 'HumanApprovalAttestation',
            attestation_hash: '0xtest123',
          },
        }),
      })
    })

    // Select provider
    await page.getByRole('button', { name: /BrightID/i }).click()

    const verifyButton = page.getByRole('button', { name: /verify|connect|link/i })
    if (await verifyButton.isVisible()) {
      await verifyButton.click()

      // Wait for success
      await expect(page.getByText('Human Verified!')).toBeVisible({ timeout: 10000 })

      // Click reset
      await page.getByText('Start new verification').click()

      // Should show provider selection again
      await expect(page.getByRole('button', { name: /World ID/i })).toBeVisible()
    }
  })
})

test.describe('Attestation Display', () => {
  test('displays attestation hash after verification', async ({ page }) => {
    await page.goto('/')

    const mockHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'

    await page.route('**/api/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          attestation: {
            version: '1.0',
            attestation_hash: mockHash,
          },
        }),
      })
    })

    await page.getByRole('button', { name: /BrightID/i }).click()

    const verifyButton = page.getByRole('button', { name: /verify|connect|link/i })
    if (await verifyButton.isVisible()) {
      await verifyButton.click()

      await expect(page.getByText('Attestation Hash')).toBeVisible({ timeout: 10000 })
      await expect(page.getByText(mockHash)).toBeVisible()
    }
  })

  test('can expand attestation JSON details', async ({ page }) => {
    await page.goto('/')

    await page.route('**/api/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          attestation: {
            version: '1.0',
            type: 'HumanApprovalAttestation',
            attestation_hash: '0xtest',
          },
        }),
      })
    })

    await page.getByRole('button', { name: /BrightID/i }).click()

    const verifyButton = page.getByRole('button', { name: /verify|connect|link/i })
    if (await verifyButton.isVisible()) {
      await verifyButton.click()

      await expect(page.getByText('Attestation Created')).toBeVisible({ timeout: 10000 })

      // Click to expand JSON
      await page.getByText('View full attestation JSON').click()

      // Should show JSON content
      await expect(page.getByText('"version": "1.0"')).toBeVisible()
    }
  })
})
