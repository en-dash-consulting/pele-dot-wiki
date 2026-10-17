import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readdirSync } from 'node:fs'

// Never send test traffic to the real GA4 property.
test.beforeEach(async ({ page }) => { await page.route(/googletagmanager\.com|google-analytics\.com/, r => r.fulfill({ status: 204, body: '' })) })


const pages = ['/', '/404.html', ...readdirSync('pages').filter(f => f.endsWith('.html')).map(f => `/pages/${f}`)]
const settle = async (page: Page) => { await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300) }

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme })
    for (const path of pages) {
      test(`axe ${scheme}: ${path}`, async ({ page }) => {
        await page.goto(path); await settle(page)
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
        expect(r.violations.map(v => `${v.impact} ${v.id}: ${v.nodes.slice(0, 4).map(n => n.target.join(' ')).join(', ')}`)).toEqual([])
      })
    }
  })
}

for (const width of [320, 375, 768, 1024, 1280, 1440]) {
  test(`no horizontal scroll on any page @${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const bad: string[] = []
    for (const path of pages) {
      await page.goto(path); await settle(page)
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (over > 0) bad.push(`${path} +${over}px`)
    }
    expect(bad).toEqual([])
  })
}

for (const width of [320, 375, 768]) {
  test(`touch targets ≥ 44px on demos and nav @${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const bad: string[] = []
    for (const path of ['/', '/pages/stream.html', '/pages/theme-lab.html', '/pages/phone.html', '/pages/docs-page.html', '/pages/gallery.html', '/pages/safety.html']) {
      await page.goto(path); await settle(page)
      const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('button, select, input:not([type=range]), [role=slider], .site-header a, .button')]
        .filter(el => el.offsetParent !== null)
        .map(el => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && (r.height < 44 || r.width < 44))
        .map(({ el, r }) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${el.className} "${(el.textContent || '').trim().slice(0, 20)}" ${Math.round(r.width)}x${Math.round(r.height)}`))
      bad.push(...small.map(s => `${path}: ${s}`))
    }
    expect(bad).toEqual([])
  })
}

test('GA4 tag (G-F3D7B604E2) is on every page, exactly once', async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, r => r.fulfill({ status: 204, body: '' }))
  for (const path of pages) {
    await page.goto(path)
    await expect(page.locator('script[src="https://www.googletagmanager.com/gtag/js?id=G-F3D7B604E2"]')).toHaveCount(1)
    expect(await page.locator('script:not([src])').evaluateAll(els => els.filter(e => e.textContent?.includes("gtag('config', 'G-F3D7B604E2'")).length)).toBe(1)
  }
})

test('home, theme lab and phone ship a finished Pele drawing in the HTML', async ({ request }) => {
  for (const [path, n] of [['/', 1], ['/pages/theme-lab.html', 3], ['/pages/phone.html', 1]] as const) {
    const html = await (await request.get(path)).text()
    const pre = [...html.matchAll(/<div data-prerendered[^>]*>\s*<svg/g)]
    expect(pre.length, `${path}: build-time drawings (run npm run prerender if stale)`).toBe(n)
  }
})

test('CSS ships inside each page, with no render-blocking stylesheet', async ({ request }) => {
  for (const path of ['/', '/pages/stream.html', '/pages/faq.html']) {
    const html = await (await request.get(path)).text()
    expect(html).not.toMatch(/<link rel="stylesheet"/)
    expect(html).toMatch(/<style>[^<]{2000,}<\/style>/)
  }
})

test('GA: page view is queued at once and gtag.js loads after load or first interaction', async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, r => r.fulfill({ status: 204, body: '' }))
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  expect(await page.evaluate(() => (window as unknown as { dataLayer: IArguments[] }).dataLayer.some(a => a[0] === 'config' && a[1] === 'G-F3D7B604E2'))).toBe(true)
  await page.mouse.move(10, 10); await page.mouse.down(); await page.mouse.up()
  await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1)
})

test('mobile nav opens and closes with keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Menu' })
  await toggle.focus(); await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'FAQ' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
})

test('skip link is first and moves focus to main', async ({ page }) => {
  await page.goto('/pages/faq.html')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: /skip to/i })
  await expect(skip).toBeFocused(); await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main/)
})

test('every page has one h1, a title, a description, and a visible focus ring', async ({ page }) => {
  for (const path of pages) {
    await page.goto(path)
    await expect(page.locator('h1')).toHaveCount(1)
    expect((await page.title()).length).toBeGreaterThan(10)
    expect(await page.locator('meta[name=description]').getAttribute('content')).toBeTruthy()
  }
  await page.goto('/'); await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)
  expect(outline).not.toBe('none')
})

test('every SVG diagram has an accessible name or is hidden', async ({ page }) => {
  const bad: string[] = []
  for (const path of ['/', '/pages/stream.html', '/pages/theme-lab.html', '/pages/phone.html', '/pages/gallery.html', '/pages/safety.html']) {
    await page.goto(path); await settle(page); await page.waitForTimeout(1500)
    bad.push(...await page.evaluate(p => [...document.querySelectorAll('svg')].filter(s => {
      if (s.closest('[aria-hidden=true], [role=img]')) return false
      return !(s.getAttribute('aria-label') || s.getAttribute('aria-labelledby') || s.querySelector('title') || s.getAttribute('aria-hidden') === 'true')
    }).map(s => `${p}: ${s.getAttribute('class')}`), path))
  }
  expect(bad).toEqual([])
})

test('reduced motion: no phone nudge, no smooth scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/pages/phone.html'); await page.locator('#ph-phones').scrollIntoViewIfNeeded(); await page.waitForTimeout(500)
  await expect(page.locator('#ph-phones')).not.toHaveClass(/nudge/)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).not.toBe('smooth')
})
