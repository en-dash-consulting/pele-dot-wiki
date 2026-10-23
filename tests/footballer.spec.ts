import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'

// Never send test traffic to the real GA4 property.
test.beforeEach(async ({ page }) => { await page.route(/googletagmanager\.com|google-analytics\.com/, r => r.fulfill({ status: 204, body: '' })) })

const seed = JSON.parse(readFileSync('src/footballer/data/seed.json', 'utf8')) as { nodes: { id: string; kind: string; name: string }[] }
const pele = seed.nodes.find(n => n.id === 'pele')!
const aMatch = seed.nodes.find(n => n.kind === 'match')!
const live = async (page: Page) => { await expect(page.locator('header.graview-bar')).toBeVisible({ timeout: 15000 }) }
const pages = ['/footballer/', '/footballer/people/pele', '/footballer/matches', `/footballer/matches/${aMatch.id}`, '/footballer/questions', '/footballer/chapters']

test('home: the wiki is drawn at build time, then Graview takes over', async ({ page, request }) => {
  const html = await (await request.get('/footballer/')).text()
  expect(html).toMatch(/<h1 class="fw-hero-name">Pelé<\/h1>/)
  expect(html).toContain('"@type": "Person"')
  await page.goto('/footballer/'); await live(page)
  await expect(page.getByRole('heading', { level: 1, name: 'Pelé' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Four World Cups' })).toBeVisible()
})

test('every record is a real page, readable without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false }); const page = await ctx.newPage()
  await page.goto(`/footballer/matches/${aMatch.id}`)
  await expect(page.getByRole('heading', { level: 1, name: aMatch.name })).toBeVisible()
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://pele.wiki/footballer/matches/${aMatch.id}`)
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}')
  expect(ld['@graph'].some((n: { '@type': string }) => n['@type'] === 'SportsEvent')).toBe(true)
  await ctx.close()
})

test('deep link to Pelé, then move through the wiki without reloading', async ({ page }) => {
  await page.goto('/footballer/people/pele'); await live(page)
  await expect(page.getByRole('heading', { level: 1, name: pele.name })).toBeVisible()
  await page.evaluate(() => { (window as unknown as { stay: boolean }).stay = true })
  await page.getByRole('navigation', { name: 'You are here' }).getByRole('link', { name: 'People' }).click()
  await expect(page).toHaveURL(/\/footballer\/people$/)
  await expect(page.getByRole('heading', { level: 1, name: 'People' })).toBeVisible()
  expect(await page.evaluate(() => (window as unknown as { stay?: boolean }).stay)).toBe(true)
})

test('the FAQ is marked up for answer engines', async ({ request }) => {
  const html = await (await request.get('/footballer/questions/')).text()
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]!)
  const faq = ld['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage')
  expect(faq.mainEntity.length).toBeGreaterThan(5)
  expect(faq.mainEntity[0].acceptedAnswer.text.length).toBeGreaterThan(20)
})

test('sitemap, llms.txt and Markdown copies cover the wiki', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap-footballer.xml')).text()
  expect(sitemap).toContain('<loc>https://pele.wiki/footballer/people/pele</loc>')
  expect((sitemap.match(/<loc>/g) ?? []).length).toBeGreaterThan(seed.nodes.length)
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://pele.wiki/sitemap-footballer.xml')
  const llms = await (await request.get('/footballer/llms.txt')).text()
  expect(llms).toContain('# Pelé the footballer, on pele.wiki')
  expect(llms).toContain('https://pele.wiki/footballer/people/pele')
  expect(await (await request.get('/md/footballer/people/pele.md')).text()).toContain(`# ${pele.name}`)
})

test('the renderer site ships no Graview or React', async ({ request }) => {
  for (const path of ['/', '/pages/stream.html', '/pages/faq.html']) {
    const html = await (await request.get(path)).text()
    expect(html, path).not.toMatch(/footballer-[\w-]+\.js/)
    for (const src of html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)) {
      const js = await (await request.get(src[1]!)).text()
      expect(js, `${path} → ${src[1]}`).not.toContain('graview-embed')
    }
  }
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`footballer ${scheme}`, () => {
    test.use({ colorScheme: scheme })
    for (const path of pages) {
      test(`axe ${scheme}: ${path}`, async ({ page }) => {
        await page.goto(path); await live(page); await page.waitForTimeout(300)
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze()
        expect(r.violations.map(v => `${v.impact} ${v.id}: ${v.nodes.slice(0, 4).map(n => n.target.join(' ')).join(', ')}`)).toEqual([])
      })
    }
  })
}

for (const width of [320, 390, 768, 1280]) {
  test(`footballer: no horizontal scroll @${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const bad: string[] = []
    for (const path of pages) {
      await page.goto(path); await live(page)
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (over > 0) bad.push(`${path} +${over}px`)
    }
    expect(bad).toEqual([])
  })
}

test('every page in the footballer sitemap is complete for search and answer engines', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap-footballer.xml')).text()
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]!)
  const titles = new Map<string, string>(), bad: string[] = []
  for (const url of urls) {
    const path = new URL(url).pathname
    const res = await request.get(path)
    const html = await res.text()
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
    const description = (html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '').replace(/&(quot|amp|lt|gt|#39);/g, '_')
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
    if (res.status() !== 200) bad.push(`${path}: ${res.status()}`)
    if (canonical !== url) bad.push(`${path}: canonical ${canonical}`)
    if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) bad.push(`${path}: not one h1`)
    if (title.length < 15 || title.length > 90) bad.push(`${path}: title "${title}"`)
    if (description.length < 30 || description.length > 170) bad.push(`${path}: description is ${description.length} chars`)
    if (titles.has(title)) bad.push(`${path}: same title as ${titles.get(title)}`)
    titles.set(title, path)
    try { if (!JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]!)['@graph']?.length) bad.push(`${path}: empty JSON-LD`) } catch { bad.push(`${path}: JSON-LD does not parse`) }
  }
  expect(bad).toEqual([])
})
