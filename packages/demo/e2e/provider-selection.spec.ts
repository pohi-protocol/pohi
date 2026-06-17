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
  test('processes verification and shows result', async ({ page }) => {
    await page.goto('/')

    // Mock successful API response (no delay needed)
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
            },
            human_proof: {
              method: 'gitcoin_passport',
              verification_level: 'score_15',
            },
            attestation_hash: '0x1234567890abcdef',
          },
        }),
      })
    })

    // Select Gitcoin Passport (simpler flow)
    await page.getByRole('button', { name: /Gitcoin Passport/i }).click()

    // Fill in an Ethereum address
    const addressInput = page.getByPlaceholder('0x...')
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')

    // Click verify button
    const verifyButton = page.getByRole('button', { name: /Verify with Gitcoin/i })
    await verifyButton.click()

    // Should show success state after verification completes
    await expect(page.getByText('Human Verified')).toBeVisible({ timeout: 10000 })
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

    // Select Gitcoin Passport (simpler flow - just needs address input)
    await page.getByRole('button', { name: /Gitcoin Passport/i }).click()

    // Fill in an Ethereum address (required for Gitcoin Passport)
    const addressInput = page.getByPlaceholder('0x...')
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')

    // Find and click verify button
    const verifyButton = page.getByRole('button', { name: /Verify with Gitcoin/i })
    await verifyButton.click()

    // Should show success
    await expect(page.getByText('Human Verified')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Attestation Created')).toBeVisible()
    await expect(page.getByText('Start new verification')).toBeVisible()
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

    // Select Gitcoin Passport (simpler flow - just needs address input)
    await page.getByRole('button', { name: /Gitcoin Passport/i }).click()

    // Fill in an Ethereum address
    const addressInput = page.getByPlaceholder('0x...')
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')

    // Click verify button
    const verifyButton = page.getByRole('button', { name: /Verify with Gitcoin/i })
    await verifyButton.click()

    // Should show error (use exact match to avoid matching error message too)
    await expect(page.getByText('Verification Failed', { exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Verification failed: Invalid proof')).toBeVisible()
    await expect(page.getByText('Try again')).toBeVisible()
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

    // Select Gitcoin Passport
    await page.getByRole('button', { name: /Gitcoin Passport/i }).click()

    // Fill in an Ethereum address
    const addressInput = page.getByPlaceholder('0x...')
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')

    // Click verify button
    const verifyButton = page.getByRole('button', { name: /Verify with Gitcoin/i })
    await verifyButton.click()

    // Wait for success
    await expect(page.getByText('Human Verified')).toBeVisible({ timeout: 10000 })

    // Click reset
    await page.getByText('Start new verification').click()

    // Should show provider selection again
    await expect(page.getByRole('button', { name: /World ID/i })).toBeVisible()
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

    // Select Gitcoin Passport
    await page.getByRole('button', { name: /Gitcoin Passport/i }).click()

    // Fill in an Ethereum address
    const addressInput = page.getByPlaceholder('0x...')
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')

    // Click verify button
    const verifyButton = page.getByRole('button', { name: /Verify with Gitcoin/i })
    await verifyButton.click()

    await expect(page.getByText('Attestation Hash')).toBeVisible({ timeout: 10000 })
    // Use first() to avoid strict mode violation (hash appears in both code element and JSON pre)
    await expect(page.getByText(mockHash).first()).toBeVisible()
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

    // Select Gitcoin Passport
    await page.getByRole('button', { name: /Gitcoin Passport/i }).click()

    // Fill in an Ethereum address
    const addressInput = page.getByPlaceholder('0x...')
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')

    // Click verify button
    const verifyButton = page.getByRole('button', { name: /Verify with Gitcoin/i })
    await verifyButton.click()

    await expect(page.getByText('Attestation Created')).toBeVisible({ timeout: 10000 })

    // Click to expand JSON
    await page.getByText('View full attestation JSON').click()

    // Should show JSON content
    await expect(page.getByText('"version": "1.0"')).toBeVisible()
  })
})
