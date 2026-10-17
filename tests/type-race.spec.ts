import { test, expect } from '@playwright/test'
test('type race: Pele redraws on every edit, Mermaid.js renders too', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('/')
  await expect(page.locator('#tr-pele svg.pele')).toBeVisible()
  await expect(page.locator('#tr-mm svg')).toBeVisible({ timeout: 15000 })
  await page.fill('#tr-src', 'flowchart LR\n  Lava --> Rock\n  Rock --> Island')
  await expect(page.locator('#tr-pele svg')).toContainText('Island')
  await expect(page.locator('#tr-pele-ms')).toHaveText(/ms$/)
  await page.click('#tr-auto')
  await expect(page.locator('#tr-verdict')).toContainText('Pele drew', { timeout: 20000 })
  expect(errors).toEqual([])
})
