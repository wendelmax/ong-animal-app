import { expect, test } from '@playwright/test'

const baseUrl = process.env.NODEPRESS_SMOKE_BASE_URL

test.describe('NodePress coexistence public smoke', () => {
  test.skip(!baseUrl, 'Configure NODEPRESS_SMOKE_BASE_URL for staging smoke tests')

  test('keeps the public URL contract while routing is under coexistence control', async ({ page }) => {
    await page.goto(baseUrl as string)
    await expect(page).toHaveTitle(/ONG|Viralatinhas/i)
    await expect(page.locator('header')).toBeVisible()
  })
})
