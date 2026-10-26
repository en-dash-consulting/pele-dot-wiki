#!/usr/bin/env node
// Renders public/og-image.png (1200×630) in the site's plain style, and public/footballer/og-image.png for the
// footballer wiki, with Playwright.
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const font = (_pkg, file) => pathToFileURL(join(ROOT, 'public/fonts', file)).href
const html = `<!doctype html><html><head><style>
body { margin: 0; width: 1200px; height: 630px; background: #fff; color: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; overflow: hidden; position: relative; }
.top { display: flex; align-items: center; gap: 16px; padding: 64px 80px 0; font-size: 34px; font-weight: 600; }
.top img { width: 48px; height: 36px; }
.top span b { color: #5a5a5a; font-weight: 600; }
h1 { font-size: 64px; line-height: 1.15; font-weight: 600; letter-spacing: -1px; margin: 72px 80px 0; width: 900px; }
p { position: absolute; left: 80px; bottom: 72px; margin: 0; font-size: 30px; color: #5a5a5a; width: 1000px; line-height: 1.4; }
.rule { position: absolute; left: 80px; right: 80px; bottom: 150px; height: 1px; background: #e3e3e0; }
</style></head><body>
<div class="top"><img src="${pathToFileURL(join(ROOT, 'public/brand/pele.svg')).href}" alt="" /><span>pele<b>.wiki</b></span></div>
<h1>Live demos of Pele, kepano's Mermaid renderer</h1>
<div class="rule"></div>
<p>Pele and Mermaid.js, side by side in your browser: typing, streaming, theming, narrow screens, 200 diagrams, untrusted input.</p>
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
