import { test, expect } from '@playwright/test'

test('home race: Pele draws on every keystroke, Mermaid catches up', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#tr-pele svg')).toBeVisible()
  await expect(page.locator('#tr-mm svg')).toBeVisible({ timeout: 20000 })
  const src = page.locator('#tr-src')
  await src.click(); await page.keyboard.press('End'); await page.keyboard.type('\n  Notify --> Done[All set]', { delay: 15 })
  await expect(page.locator('#tr-pele svg')).toContainText('All set')
  await expect(page.locator('#tr-mm svg')).toContainText('All set', { timeout: 20000 })
  await expect(page.locator('#tr-pele-ms')).toHaveText(/ms/)
})

test('home race: example switch and auto-type', async ({ page }) => {
  await page.goto('/')
  await page.locator('#tr-example').selectOption({ index: 1 })
  await expect(page.locator('#tr-pele svg')).toHaveClass(/pele-sequence/)
  await page.locator('#tr-auto').click()
  await expect(page.locator('#tr-auto')).toHaveAttribute('aria-pressed', 'true')
})

test('above the fold: race visible at 1280x800, CTA at 375x667', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 }); await page.goto('/')
  const box = await page.locator('#tr-pele').boundingBox()
  expect(box!.y).toBeLessThan(800 - 120)
  await page.setViewportSize({ width: 375, height: 667 }); await page.goto('/')
  const cta = await page.getByRole('link', { name: /try it live/i }).boundingBox()
  expect(cta!.y + cta!.height).toBeLessThan(667)
})

test('stream: both chats finish and Pele redraws many times', async ({ page }) => {
  await page.goto('/pages/stream.html')
  await page.locator('#st-speed').selectOption({ index: 0 })
  await page.locator('#st-ask').click()
  await expect(page.locator('#st-pele-dia svg')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('#st-verdict')).not.toBeEmpty({ timeout: 30000 })
  await expect(page.locator('#st-mm-dia svg')).toBeVisible()
  const n = Number((await page.locator('#st-pele-count').textContent())!.match(/\d+/)![0])
  expect(n).toBeGreaterThan(20)
})

test('theme lab: colour change restyles without a Pele redraw', async ({ page }) => {
  await page.goto('/pages/theme-lab.html')
  await expect(page.locator('#lab-board svg').first()).toBeVisible()
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Blueprint' }).click(); await page.waitForTimeout(300)
  await expect(page.getByRole('button', { name: 'Blueprint' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#lab-pele-n')).toHaveText('0')
  const bg = await page.locator('#lab-board').evaluate(el => getComputedStyle(el).getPropertyValue('--pele-bg').trim())
  expect(bg.toLowerCase()).toBe('#0b3d91')
  await expect(page.locator('#lab-code')).toContainText('#0b3d91')
})

test('phone: keyboard handle resizes and Pele flips the flow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/pages/phone.html')
  const h = page.getByRole('slider').first()
  await h.focus(); await page.keyboard.press('End')
  const wide = Number(await h.getAttribute('aria-valuenow'))
  expect(wide).toBeGreaterThan(500)
  await expect(page.locator('#ph-mode')).toContainText('left-to-right')
  await page.keyboard.press('Home')
  await expect(h).toHaveAttribute('aria-valuenow', '220')
  await expect(page.locator('#ph-mode')).toContainText('top-to-bottom')
  await expect(page.locator('#ph-w')).toHaveText('220 px')
})

test('phone: drag the handle with a pointer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/pages/phone.html')
  const h = page.getByRole('slider').first()
  const b = (await h.boundingBox())!
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down()
  await page.mouse.move(b.x + 200, b.y + b.height / 2, { steps: 8 }); await page.mouse.up()
  expect(Number(await h.getAttribute('aria-valuenow'))).toBeGreaterThan(480)
})

test('docs page: Pele draws 200, Mermaid makes progress and can be stopped', async ({ page }) => {
  await page.goto('/pages/docs-page.html')
  await page.locator('#dp-go').click()
  await expect(page.locator('#dp-pele-msg')).toContainText('arrived: all 200', { timeout: 15000 })
  await expect(page.locator('#dp-pele svg')).toHaveCount(200)
  await expect(page.locator('#dp-mm-msg')).toContainText(/diagram \d+ of 200/, { timeout: 20000 })
  await page.locator('#dp-stop').click()
  await expect(page.locator('#dp-mm-msg')).toContainText(/stopped|arrived/)
})

test('gallery: all 32 types render, filter works, edit redraws', async ({ page }) => {
  await page.goto('/pages/gallery.html')
  await expect(page.locator('.gl-card')).toHaveCount(32)
  await expect(page.locator('.gl-card .gl-canvas > svg')).toHaveCount(32)
  await page.locator('#gl-filter').fill('sankey')
  await expect(page.locator('.gl-card:visible')).toHaveCount(1)
  await page.locator('#gl-filter').fill('')
  const card = page.locator('#type-pie')
  await card.getByRole('button', { name: /edit/i }).click()
  const ta = card.locator('textarea'); await ta.fill('pie title Lines\n  "Red" : 3\n  "Green" : 2')
  await expect(card.locator('.gl-canvas svg')).toContainText('Lines')
})

test('safety: nothing runs, and huge input is refused quickly', async ({ page }) => {
  let dialogs = 0; page.on('dialog', d => { dialogs++; void d.dismiss() })
  await page.goto('/pages/safety.html')
  for (const name of ['A script in a label', 'A javascript: link', 'A click callback', 'Sneaky CSS']) {
    await page.getByRole('button', { name }).click()
    await expect(page.locator('#sf-checks')).toContainText('Nothing ran')
    expect(await page.locator('#sf-result script, #sf-result foreignObject, #sf-result [onerror]').count()).toBe(0)
    expect(await page.locator('#sf-result a[href^="javascript"]').count()).toBe(0)
  }
  const t = Date.now()
  await page.getByRole('button', { name: 'A million arrows' }).click()
  await expect(page.locator('#sf-result')).toContainText('Refused')
  expect(Date.now() - t).toBeLessThan(3000)
  await page.getByRole('button', { name: 'Not a diagram at all' }).click()
  await expect(page.locator('#sf-result')).toContainText('Refused')
  expect(dialogs).toBe(0)
})
