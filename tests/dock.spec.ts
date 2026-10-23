import { test, expect } from '@playwright/test'

// Never send test traffic to the real GA4 property.
test.beforeEach(async ({ page }) => { await page.route(/googletagmanager\.com|google-analytics\.com/, r => r.fulfill({ status: 204, body: '' })) })

test('dock: credits Graview and n-dx, points to the other Pelé, shrinks by keyboard and stays shrunk', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await page.goto('/')
  const dock = page.getByRole('complementary', { name: 'About this site' })
  await expect(dock.getByRole('link', { name: /Built with Graview/ })).toHaveAttribute('href', 'https://graview.dev')
  await expect(dock.getByRole('link', { name: 'n-dx' })).toHaveAttribute('href', 'https://github.com/en-dash-consulting/n-dx')
  await expect(dock.getByRole('link', { name: /Pelé the footballer/ }).first()).toHaveAttribute('href', '/footballer/')
  await page.getByRole('button', { name: 'Shrink this bar' }).focus(); await page.keyboard.press('Enter')
  await expect(dock.getByRole('link', { name: 'Built with Graview' })).toBeVisible()
  await expect(dock.getByText('n-dx')).toBeHidden()
  await page.goto('/footballer/')
  await expect(page.getByRole('button', { name: 'Show the full bar' })).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('complementary', { name: 'About this site' }).getByRole('link', { name: /Mermaid diagram renderer/ })).toHaveAttribute('href', '/')
})

test('no announcement banner above the header', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.site-banner')).toHaveCount(0)
})
