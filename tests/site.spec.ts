import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readdirSync } from 'node:fs'

const pages = ['/', ...readdirSync('pages').filter(f => f.endsWith('.html')).map(f => `/pages/${f}`)]

for (const theme of ['a', 'b', 'c']) {
  for (const path of pages) {
    test(`axe theme ${theme}: ${path}`, async ({ page }) => {
      await page.goto(`${path}?theme=${theme}`)
      await page.waitForLoadState('networkidle')
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze()
      const bad = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
      expect(bad.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)).toEqual([])
    })
  }
}

for (const width of [390, 768, 1280]) {
  for (const theme of ['a', 'b', 'c']) {
    test(`no horizontal scroll @${width} theme ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/?theme=${theme}`)
      await page.waitForLoadState('networkidle')
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)
    })
  }
}

test('no analytics tag while gaId is unset', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('script[src*="googletagmanager"]').count()).toBe(0)
})

test('mobile nav opens with keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Menu' })
  await toggle.focus(); await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'FAQ' })).toBeVisible()
})
