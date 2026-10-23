#!/usr/bin/env node
// Writes the footballer wiki's static pages into dist/ after `vite build`: one HTML file per route, rendered
// from the same React pages the browser runs (src/footballer/ssr.tsx), plus its sitemap, llms.txt files and
// Markdown copies. GitHub Pages serves each address as a real page; Graview takes over once the script runs.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'
import { GA } from './ga.mjs'
import { dock } from './dock.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SITE = 'https://pele.wiki'
const OUT = join(ROOT, 'node_modules/.footballer-ssr')
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

await build({ root: ROOT, logLevel: 'warn', configFile: false, build: { ssr: 'src/footballer/ssr.tsx', outDir: OUT, emptyOutDir: true, rollupOptions: { output: { format: 'es', entryFileNames: 'ssr.mjs' } } }, ssr: { noExternal: [/^@graview\//] } })
const { routes, llms } = await import(pathToFileURL(join(OUT, 'ssr.mjs')).href)

// Vite's footballer/index.html is the template; it is kept beside dist so the script can run again.
const KEPT = join(ROOT, 'node_modules/.footballer-template.html')
const built = readFileSync(join(DIST, 'footballer/index.html'), 'utf8')
if (built.includes('<div id="app"></div>')) writeFileSync(KEPT, built)
if (!existsSync(KEPT)) throw new Error('build-footballer: no template; run vite build first')
const template = readFileSync(KEPT, 'utf8')
const lastmod = new Date().toISOString().slice(0, 10)
const all = routes()

function page(r) {
  const url = SITE + r.path
  const image = r.image ?? `${SITE}/footballer/og-image.png`
  const head = `${GA}
  <title>${esc(r.title)}</title>
  <meta name="description" content="${esc(r.description)}" />
  <meta name="robots" content="${r.index ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, follow'}" />
  <link rel="canonical" href="${url}" />
  ${r.md ? `<link rel="alternate" type="text/markdown" href="/md${r.path.replace(/\/$/, '/index')}.md" title="Markdown version" />` : ''}
  <meta name="theme-color" content="#053d22" />
  <meta property="og:type" content="${r.path.endsWith('/') ? 'website' : 'article'}" />
  <meta property="og:site_name" content="pele.wiki" />
  <meta property="og:title" content="${esc(r.title)}" />
  <meta property="og:description" content="${esc(r.description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(r.title)}" />
  <meta name="twitter:description" content="${esc(r.description)}" />
  <meta name="twitter:image" content="${image}" />
  <script type="application/ld+json">
${r.jsonLd}
  </script>`
  return template.replace(/<title>[\s\S]*?<\/title>/, '').replace('<!--head-->', head).replace('<div id="app"></div>', `<div id="app">${r.html}</div>`).replace('<!--dock-->', dock('footballer'))
}

for (const r of all) {
  const html = page(r)
  for (const f of r.files) { mkdirSync(dirname(join(DIST, f)), { recursive: true }); writeFileSync(join(DIST, f), html) }
  if (r.md) { const f = join(DIST, 'md', r.path.replace(/\/$/, '/index') + '.md'); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, r.md) }
}
const indexable = all.filter(r => r.index)
writeFileSync(join(DIST, 'sitemap-footballer.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexable.map(r => `  <url><loc>${SITE}${r.path}</loc><lastmod>${lastmod}</lastmod><priority>${r.path === '/footballer/' ? '1.0' : r.path.endsWith('/') ? '0.8' : '0.7'}</priority>${r.image ? `<image:image><image:loc>${r.image}</image:loc></image:image>` : ''}</url>`).join('\n')}
</urlset>
`)
const { short, full } = llms()
writeFileSync(join(DIST, 'footballer/llms.txt'), short)
writeFileSync(join(DIST, 'footballer/llms-full.txt'), full)
if (!existsSync(join(DIST, 'footballer/places/overview.html'))) throw new Error('build-footballer: the scene page was not written')
console.log(`build-footballer: wrote ${all.length} pages (${indexable.length} in the sitemap)`)
