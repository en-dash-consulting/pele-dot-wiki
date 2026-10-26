import { expect, test } from '@playwright/test'

// The bar at the foot of the footballer wiki. The renderer's pages have none.
test('dock: on the footballer wiki only; credits Graview, points back to the renderer, shrinks by keyboard and stays shrunk', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('complementary', { name: 'About this site' })).toHaveCount(0)
  await page.goto('/footballer/')
  const dock = page.getByRole('complementary', { name: 'About this site' })
  await expect(dock.getByRole('link', { name: /Built with Graview/ })).toHaveAttribute('href', 'https://graview.dev')
  await expect(dock.getByRole('link', { name: /Mermaid renderer/ }).first()).toHaveAttribute('href', '/')
  await dock.getByRole('button', { name: 'Shrink this bar' }).focus(); await page.keyboard.press('Enter')
  await expect(dock.getByRole('link', { name: 'Built with Graview' })).toBeVisible()
  await expect(dock.getByText('Looking for')).toBeHidden()
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'About this site' }).getByRole('button', { name: 'Show the full bar' })).toBeVisible()
})

test('no announcement banner above the header', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.site-banner')).toHaveCount(0)
})
