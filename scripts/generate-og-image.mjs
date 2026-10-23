#!/usr/bin/env node
// Renders public/og-image.png (1200×630) in the site's transit-map style, and public/footballer/og-image.png for the
// footballer wiki, with Playwright and the site's own fonts.
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const font = (_pkg, file) => pathToFileURL(join(ROOT, 'public/fonts', file)).href
const html = `<!doctype html><html><head><style>
@font-face { font-family: Montserrat; font-weight: 100 900; src: url(${font('', 'montserrat-latin-wght-normal.woff2')}); }
@font-face { font-family: Merriweather; font-weight: 400; src: url(${font('', 'merriweather-latin-400-normal.woff2')}); }
@font-face { font-family: Merriweather; font-weight: 700; src: url(${font('', 'merriweather-latin-700-normal.woff2')}); }
body { margin: 0; width: 1200px; height: 630px; background: #fff; color: #111; font-family: Merriweather; overflow: hidden; position: relative; }
.bar { height: 22px; display: flex; } .bar i { flex: 1; } 
.top { background: #111; color: #fff; height: 96px; display: flex; align-items: center; padding: 0 72px; font: 800 42px Montserrat; letter-spacing: -1.2px; gap: 18px; }
.top img { width: 56px; height: 42px; }
.top b { color: #f5a800; }
h1 { font: 800 60px/1.08 Montserrat; letter-spacing: -2px; margin: 52px 72px 0; width: 600px; }
h1 span { background: linear-gradient(transparent 62%, #f5a800 62%); }
p { position: absolute; left: 72px; bottom: 64px; margin: 0; font-size: 28px; color: #333; }
p strong { color: #111; }
svg { position: absolute; right: 40px; top: 150px; }
.line { fill: none; stroke-width: 14; stroke-linecap: round; stroke-linejoin: round; }
.stop { fill: #fff; stroke: #111; stroke-width: 6; }
text { font: 700 22px Montserrat; fill: #111; }
</style></head><body>
<div class="top"><img src="${pathToFileURL(join(ROOT, 'public/brand/pele.svg')).href}" alt="" /><span>pele<b>.</b>wiki</span></div>
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
const footballer = `<!doctype html><html><head><style>
@font-face { font-family: Montserrat; font-weight: 100 900; src: url(${font('', 'montserrat-latin-wght-normal.woff2')}); }
body { margin: 0; width: 1200px; height: 630px; overflow: hidden; position: relative; color: #fff; font-family: Montserrat;
  background: repeating-linear-gradient(90deg, transparent 0 100px, rgba(255,255,255,.04) 100px 200px), #053d22; }
.k { position: absolute; left: 80px; top: 76px; font: 800 26px Montserrat; letter-spacing: 5px; color: #ffd21f; }
h1 { position: absolute; left: 70px; top: 120px; margin: 0; font: 900 250px/1 Montserrat; letter-spacing: -14px; }
.full { position: absolute; left: 80px; top: 400px; font: 700 36px Montserrat; color: #ffd21f; }
.sub { position: absolute; left: 80px; top: 460px; font: 600 30px Montserrat; color: #dfeee5; }
.ten { position: absolute; right: 50px; top: 90px; font: 900 400px/1 Montserrat; letter-spacing: -30px; color: #ffd21f; opacity: .92; }
.url { position: absolute; right: 72px; bottom: 50px; font: 800 28px Montserrat; }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 20px; display: flex; } .bar i { flex: 1; }
</style></head><body>
<div class="k">THE WIKI · 1940–2022</div><h1>Pelé</h1><div class="ten">10</div>
<div class="full">Edson Arantes do Nascimento · O Rei</div>
<div class="sub">His life, four World Cups, Santos, the Cosmos, the goals</div>
<div class="url">pele.wiki/footballer</div>
<div class="bar"><i style="background:#ffd21f"></i><i style="background:#009c3b"></i><i style="background:#2a5bd7"></i></div>
</body></html>`
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
for (const [doc, out] of [[html, 'og-image.png'], [footballer, 'footballer/og-image.png']]) {
  const tmp = join(ROOT, 'node_modules', '.og.html')
  writeFileSync(tmp, doc)
  await page.goto(pathToFileURL(tmp).href); await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(ROOT, 'public', out) })
}
await browser.close()
console.log('og images written')
