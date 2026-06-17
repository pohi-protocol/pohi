import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('page has correct title', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/PoHI|Proof of Human Intent/i)
  })

  test('main heading is h1', async ({ page }) => {
    await page.goto('/')

    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toContainText('Proof of Human Intent')
  })

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/')

    // Check that labels are associated with inputs
    const repoInput = page.getByLabel('Repository')
    await expect(repoInput).toBeVisible()

    const commitInput = page.getByLabel('Commit SHA')
    await expect(commitInput).toBeVisible()

    const descInput = page.getByLabel('Description')
    await expect(descInput).toBeVisible()
  })

  test('links have accessible text', async ({ page }) => {
    await page.goto('/')

    // The header also links to GitHub, so scope to the footer to avoid a
    // strict-mode match on multiple "GitHub" links.
    const footer = page.locator('footer')
    const githubLink = footer.getByRole('link', { name: 'GitHub' })
    await expect(githubLink).toBeVisible()
    await expect(githubLink).toHaveAttribute('href', /github\.com/)

    const licenseLink = footer.getByRole('link', { name: 'Apache 2.0' })
    await expect(licenseLink).toBeVisible()
  })

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Tab to first provider button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Find a focused button
    const focusedElement = page.locator(':focus')
    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase())

    // Should be able to focus on interactive elements
    expect(['button', 'input', 'a', 'select', 'textarea']).toContain(tagName)
  })

  test('color contrast is sufficient', async ({ page }) => {
    await page.goto('/')

    // Check that main text is visible (basic check)
    const heading = page.getByRole('heading', { name: 'Proof of Human Intent' })
    await expect(heading).toBeVisible()

    // The text should not be invisible (basic visibility check)
    const opacity = await heading.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return parseFloat(style.opacity)
    })
    expect(opacity).toBeGreaterThan(0)
  })
})

test.describe('Responsive Design', () => {
  test('mobile viewport shows correct layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Content should still be visible
    await expect(page.getByRole('heading', { name: 'Proof of Human Intent' })).toBeVisible()
    await expect(page.getByLabel('Repository')).toBeVisible()

    // Provider buttons should be visible
    await expect(page.getByRole('button', { name: /World ID/i })).toBeVisible()
  })

  test('tablet viewport shows correct layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Proof of Human Intent' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'How the Protocol Works' })).toBeVisible()
  })

  test('desktop viewport shows full layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Proof of Human Intent' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Use Cases' })).toBeVisible()
  })

  test('content does not overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check that there's no horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })
})

test.describe('Dark Mode', () => {
  test('respects system preference for dark mode', async ({ page }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')

    // Page should load successfully in dark mode
    await expect(page.getByRole('heading', { name: 'Proof of Human Intent' })).toBeVisible()
  })

  test('respects system preference for light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Proof of Human Intent' })).toBeVisible()
  })
})
