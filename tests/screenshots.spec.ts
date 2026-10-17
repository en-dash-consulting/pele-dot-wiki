import { test } from '@playwright/test'
// SHOTS=1 npx playwright test tests/screenshots.spec.ts → screenshots-review/home-<theme>-<width>.png
test.skip(!process.env.SHOTS, 'screenshots only on demand')
for (const theme of ['a', 'b', 'c']) {
  for (const width of [1280, 390]) {
    test(`shot ${theme} @${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width > 500 ? 900 : 844 })
      await page.goto(`/?theme=${theme}`)
      await page.locator('#tr-mm svg').waitFor({ timeout: 15000 })
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: `screenshots-review/home-${theme}-${width}.png`, fullPage: true })
    })
  }
}
