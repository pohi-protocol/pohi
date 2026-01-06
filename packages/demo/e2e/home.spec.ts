import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays main heading and tagline', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Proof of Human Intent' })).toBeVisible()
    await expect(page.getByText('AI executes. Humans authorize. Machines verify.')).toBeVisible()
  })

  test('displays approval request form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Approval Request' })).toBeVisible()
    await expect(page.getByLabel('Repository')).toBeVisible()
    await expect(page.getByLabel('Commit SHA')).toBeVisible()
    await expect(page.getByLabel('Description')).toBeVisible()
  })

  test('displays provider selection', async ({ page }) => {
    await expect(page.getByText('World ID')).toBeVisible()
    await expect(page.getByText('Gitcoin Passport')).toBeVisible()
    await expect(page.getByText('BrightID')).toBeVisible()
    await expect(page.getByText('Civic')).toBeVisible()
  })

  test('displays How it works section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible()
    await expect(page.getByText('Choose Provider')).toBeVisible()
    await expect(page.getByText('Verify Human')).toBeVisible()
    await expect(page.getByText('Create Attestation')).toBeVisible()
  })

  test('displays Supported Providers section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Supported Providers' })).toBeVisible()
    await expect(page.getByText('ZK Proofs')).toBeVisible()
    await expect(page.getByText('Web3 Score')).toBeVisible()
  })

  test('displays FAQ section', async ({ page }) => {
    await expect(page.getByText('What is Proof of Human Intent?')).toBeVisible()
  })

  test('displays footer with links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Apache 2.0' })).toBeVisible()
  })
})

test.describe('Form Interaction', () => {
  test('allows editing repository input', async ({ page }) => {
    await page.goto('/')

    const repoInput = page.getByLabel('Repository')
    await repoInput.clear()
    await repoInput.fill('test-owner/test-repo')

    await expect(repoInput).toHaveValue('test-owner/test-repo')
  })

  test('allows editing commit SHA input', async ({ page }) => {
    await page.goto('/')

    const commitInput = page.getByLabel('Commit SHA')
    await commitInput.clear()
    await commitInput.fill('def456789')

    await expect(commitInput).toHaveValue('def456789')
  })

  test('allows editing description input', async ({ page }) => {
    await page.goto('/')

    const descInput = page.getByLabel('Description')
    await descInput.clear()
    await descInput.fill('Test approval description')

    await expect(descInput).toHaveValue('Test approval description')
  })
})

test.describe('URL Parameters', () => {
  test('populates form from URL params', async ({ page }) => {
    await page.goto('/?repo=my-org/my-repo&commit=abc123def')

    await expect(page.getByLabel('Repository')).toHaveValue('my-org/my-repo')
    await expect(page.getByLabel('Commit SHA')).toHaveValue('abc123def')
  })

  test('shows GitHub Action badge when params present', async ({ page }) => {
    await page.goto('/?repo=my-org/my-repo&commit=abc123def')

    await expect(page.getByText('GitHub Action Approval Request')).toBeVisible()
  })

  test('makes form fields readonly when params present', async ({ page }) => {
    await page.goto('/?repo=my-org/my-repo&commit=abc123def')

    const repoInput = page.getByLabel('Repository')
    await expect(repoInput).toHaveAttribute('readonly')
  })
})

test.describe('Theme Toggle', () => {
  test('toggles between light and dark mode', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle button
    const themeToggle = page.locator('button').filter({ has: page.locator('svg') }).first()

    // Get initial state
    const html = page.locator('html')
    const initialClass = await html.getAttribute('class')

    // Click toggle
    await themeToggle.click()

    // Verify class changed
    const newClass = await html.getAttribute('class')
    expect(newClass).not.toBe(initialClass)
  })
})
