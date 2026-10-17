import { test } from '@playwright/test'

// Never send test traffic to the real GA4 property.
test.beforeEach(async ({ page }) => { await page.route(/googletagmanager\.com|google-analytics\.com/, r => r.fulfill({ status: 204, body: '' })) })

// SHOTS=1 npx playwright test tests/screenshots.spec.ts → screenshots-review/<page>-<scheme>-<width>.png
test.skip(!process.env.SHOTS, 'screenshots only on demand')
const shots: [string, string][] = [['home', '/'], ['stream', '/pages/stream.html'], ['theme-lab', '/pages/theme-lab.html'], ['phone', '/pages/phone.html'], ['docs-page', '/pages/docs-page.html'], ['gallery', '/pages/gallery.html'], ['safety', '/pages/safety.html'], ['faq', '/pages/faq.html'], ['pele-vs-mermaid', '/pages/pele-vs-mermaid.html'], ['getting-started', '/pages/getting-started.html']]
for (const scheme of ['light', 'dark'] as const) {
  for (const width of [375, 768, 1280]) {
    for (const [name, path] of shots) {
      test(`${name} ${scheme} @${width}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme })
        await page.setViewportSize({ width, height: width < 500 ? 812 : 800 })
        await page.goto(path); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(2500)
        await page.screenshot({ path: `screenshots-review/${name}-${scheme}-${width}.png`, fullPage: name !== 'home' || width !== 1280 })
        if (name === 'home') await page.screenshot({ path: `screenshots-review/${name}-${scheme}-${width}-fold.png` })
      })
    }
  }
}
