import { test, expect } from '@playwright/test'
test('banner: shows, dismisses by keyboard, stays dismissed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 }); await page.goto('/')
  const banner = page.getByRole('complementary', { name: 'Announcement' })
  await expect(banner).toBeVisible(); await expect(banner.getByRole('link', { name: 'Graview' })).toHaveAttribute('href', 'https://graview.dev')
  await page.getByRole('button', { name: 'Dismiss announcement' }).focus(); await page.keyboard.press('Enter')
  await expect(banner).toBeHidden()
  await page.goto('/pages/faq.html'); await expect(page.locator('.site-banner')).toBeHidden()
})
