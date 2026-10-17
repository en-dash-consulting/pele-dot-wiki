#!/usr/bin/env node
// Renders public/og-image.png (1200×630) in the site's transit-map style, with Playwright and the site's own fonts.
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const font = (pkg, file) => pathToFileURL(join(ROOT, 'node_modules/@fontsource', pkg, 'files', file)).href
const html = `<!doctype html><html><head><style>
@font-face { font-family: Unbounded; font-weight: 800; src: url(${font('unbounded', 'unbounded-latin-800-normal.woff2')}); }
@font-face { font-family: 'Public Sans'; font-weight: 400; src: url(${font('public-sans', 'public-sans-latin-400-normal.woff2')}); }
@font-face { font-family: 'Public Sans'; font-weight: 700; src: url(${font('public-sans', 'public-sans-latin-700-normal.woff2')}); }
body { margin: 0; width: 1200px; height: 630px; background: #fff; color: #111; font-family: 'Public Sans'; overflow: hidden; position: relative; }
.bar { height: 22px; display: flex; } .bar i { flex: 1; } 
.top { background: #111; color: #fff; height: 96px; display: flex; align-items: center; padding: 0 72px; font: 800 40px Unbounded; letter-spacing: -1px; }
.top b { color: #f5a800; }
h1 { font: 800 62px/1.05 Unbounded; letter-spacing: -2px; margin: 48px 72px 0; width: 660px; }
h1 span { background: linear-gradient(transparent 62%, #f5a800 62%); }
p { position: absolute; left: 72px; bottom: 64px; margin: 0; font-size: 28px; color: #333; }
p strong { color: #111; }
svg { position: absolute; right: 40px; top: 150px; }
.line { fill: none; stroke-width: 14; stroke-linecap: round; stroke-linejoin: round; }
.stop { fill: #fff; stroke: #111; stroke-width: 6; }
text { font: 700 22px 'Public Sans'; fill: #111; }
</style></head><body>
<div class="top">pele<b>.</b>wiki</div>
<h1>Mermaid diagrams, drawn <span>before your next keystroke</span></h1>
<svg width="460" height="400" viewBox="0 0 460 400" aria-hidden="true">
  <path class="line" stroke="#d52b1e" d="M20 50 H180 L240 110 V250 L290 300 H440"/>
  <path class="line" stroke="#00843d" d="M20 180 H440"/>
  <path class="line" stroke="#f5a800" d="M90 370 V320 L150 260 H330 L390 200 V20"/>
  ${[[20, 50], [180, 50], [440, 300], [20, 180], [440, 180], [90, 370], [330, 260], [390, 20]].map(([x, y]) => `<circle class="stop" cx="${x}" cy="${y}" r="13"/>`).join('')}
  <circle class="stop" cx="240" cy="180" r="24"/>
  <text x="20" y="28">text</text><text x="180" y="28" text-anchor="middle">parse</text><text x="270" y="160">layout</text><text x="330" y="240" text-anchor="middle">theme</text><text x="440" y="345" text-anchor="end">phone</text>
</svg>
<p><strong>Live demos and guides for Pele</strong>, kepano's Mermaid renderer</p>
<div class="bar" style="position:absolute;left:0;right:0;bottom:0"><i style="background:#d52b1e"></i><i style="background:#00843d"></i><i style="background:#f5a800"></i></div>
</body></html>`
const tmp = join(ROOT, 'node_modules', '.og.html')
writeFileSync(tmp, html)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(pathToFileURL(tmp).href); await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: join(ROOT, 'public', 'og-image.png') })
await browser.close()
console.log('og image written')
