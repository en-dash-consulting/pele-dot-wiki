#!/usr/bin/env node
// Renders public/og-image.png (1200×630) with Playwright. Favicons are En Dash's (copied from html-in-canvas-dot-dev), not generated.
// TODO(theme): restyle once a visual direction is picked.
import { chromium } from '@playwright/test'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const og = `<html><body style="margin:0;width:1200px;height:630px;background:#e3e4e0;color:#1c1d1f;font-family:system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box">
<div style="font:500 30px ui-monospace,Menlo,monospace;color:#a52a05;margin-bottom:28px">pele.wiki</div>
<div style="font-weight:900;font-size:84px;line-height:1;letter-spacing:-2px;max-width:980px;text-transform:uppercase">Mermaid diagrams as fast as you can type</div>
<div style="margin-top:40px;font-size:26px;color:#4c4f52">Live demos &amp; guides for Pele by kepano · independent, by En Dash</div>
</body></html>`
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(og); await page.screenshot({ path: join(OUT, 'og-image.png') })
await browser.close()
console.log('og image written')
