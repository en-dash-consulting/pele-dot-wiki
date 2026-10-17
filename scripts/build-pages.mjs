#!/usr/bin/env node
// Generates every HTML page (index.html, pages/*.html), markdown copies (public/md),
// llms.txt, llms-full.txt and sitemap.xml from content/*.md. Run: npm run pages
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { TYPE_RACE, HERO_ART } from './demo-ui.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://pele.wiki'
const PELE_VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).dependencies.pele
// Google Analytics: set "gaId" in site.config.json (e.g. "G-XXXXXXX"). Empty means no tag is emitted.
const GA_ID = (process.env.GA_ID ?? JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8')).gaId ?? '').trim()
if (GA_ID && !/^G-[A-Z0-9]+$/.test(GA_ID)) throw new Error(`site.config.json gaId looks wrong: ${GA_ID}`)
export const GA = GA_ID ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments)} gtag('js', new Date()); gtag('config', '${GA_ID}');</script>` : ''
const PELE_REPO = 'https://github.com/obsidianmd/pele'
const PELE_SITE = 'https://pele.run'
const NAV = ['what-is-pele', 'getting-started', 'faq', 'about']
const ORDER = ['index', ...NAV]
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()

function parse(file) {
  const raw = readFileSync(join(ROOT, 'content', file), 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/)
  const meta = {}; let list = null
  for (const line of m[1].split('\n')) {
    const item = line.match(/^\s+-\s+(.*)$/)
    if (item && list) { meta[list].push(JSON.parse(item[1])); continue }
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (!kv) continue
    if (kv[2] === '') { list = kv[1]; meta[list] = []; continue }
    meta[kv[1]] = kv[2].startsWith('"') ? JSON.parse(kv[2]) : kv[2]
  }
  meta.body = raw.slice(m[0].length)
  let lastmod
  try { lastmod = execSync(`git log -1 --format=%cs -- content/${file}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch {}
  meta.lastmod = lastmod || new Date().toISOString().slice(0, 10)
  return meta
}
const pages = readdirSync(join(ROOT, 'content')).filter(f => f.endsWith('.md')).map(parse)
  .sort((a, b) => (ORDER.indexOf(a.slug) + 1 || 99) - (ORDER.indexOf(b.slug) + 1 || 99))
const bySlug = Object.fromEntries(pages.map(p => [p.slug, p]))
const path = slug => slug === 'index' ? '/' : `/pages/${slug}.html`
const url = slug => SITE + path(slug)
const navLabel = slug => bySlug[slug]?.nav ?? slug

const DEMOS = { 'type-race': TYPE_RACE() }

function jsonLd(p) {
  const org = { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'En Dash Consulting', url: 'https://endash.us' }
  const website = { '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'pele.wiki', url: SITE + '/', publisher: { '@id': `${SITE}/#org` }, inLanguage: 'en', description: bySlug.index.description }
  const kepano = { '@type': 'Person', '@id': `${SITE}/#kepano`, name: 'Steph Ango (kepano)', alternateName: 'kepano', url: 'https://stephango.com', sameAs: ['https://github.com/kepano', 'https://x.com/kepano'] }
  const software = { '@type': 'SoftwareSourceCode', '@id': `${SITE}/#pele`, name: 'Pele', alternateName: ['pele.run', 'obsidianmd/pele', 'Pele Mermaid renderer'],
    description: 'A fast, lightweight Mermaid renderer that outputs themeable SVG.',
    codeRepository: PELE_REPO, url: PELE_SITE, author: { '@id': `${SITE}/#kepano` }, license: 'https://opensource.org/licenses/MIT',
    programmingLanguage: ['TypeScript', 'JavaScript'], runtimePlatform: 'Web browsers, Node.js', version: PELE_VERSION }
  const crumbs = [{ name: 'Home', item: SITE + '/' }]
  if (p.slug !== 'index') crumbs.push({ name: strip(p.h1), item: url(p.slug) })
  const breadcrumb = { '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, ...c })) }
  const base = { '@id': `${url(p.slug)}#page`, url: url(p.slug), name: p.title, headline: strip(p.h1), description: p.description, inLanguage: 'en',
    isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#pele` }, publisher: { '@id': `${SITE}/#org` }, dateModified: p.lastmod,
    image: `${SITE}/og-image.png` }
  let page
  if (p.type === 'home') page = { '@type': 'WebPage', ...base }
  else if (p.type === 'faq') page = { '@type': 'FAQPage', ...base, mainEntity: p.qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  else if (p.type === 'howto') page = { '@type': 'HowTo', ...base, name: strip(p.h1), step: p.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })) }
  else page = { '@type': 'TechArticle', ...base, author: { '@id': `${SITE}/#org` }, proficiencyLevel: 'Beginner' }
  const graph = [website, org, kepano, software, page]
  if (p.slug !== 'index') graph.push(breadcrumb)
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1).replace(/</g, '\\u003c')
}

const brandMark = `<svg class="brand-mark" aria-hidden="true" width="22" height="22" viewBox="0 0 22 22"><path d="M2 19 L8.5 6 L11 9.5 L13.5 6 L20 19 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path class="brand-lava" d="M9 3.5 Q11 1 13 3.5" fill="none" stroke-width="2" stroke-linecap="round"/></svg>`

function header(active) {
  const links = NAV.map(s => `<li><a href="${path(s)}"${s === active ? ' aria-current="page"' : ''}>${navLabel(s)}</a></li>`).join('')
  return `<a class="skip-link" href="#main">Skip to content</a>
  <aside class="site-banner" aria-label="Announcement"><p>New from En Dash: <a href="https://graview.dev" rel="noopener">Graview</a>, an agent-first context-graph–based app development kit</p><button type="button" class="banner-close" aria-label="Dismiss announcement"><span aria-hidden="true">×</span></button></aside>
  <header class="site-header">
    <a class="brand" href="/" aria-label="pele.wiki home">${brandMark}<span>pele<span class="brand-tld">.wiki</span></span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" aria-label="Main"><ul>${links}</ul></nav>
  </header>`
}
const footer = `<footer class="site-footer">
    <p><strong>pele.wiki</strong> is an independent community resource by <a href="https://endash.us">En Dash Consulting</a>. It is not affiliated with or endorsed by Obsidian or kepano.</p>
    <p>Pele © 2026 <a href="https://github.com/kepano">kepano</a>, MIT license · <a href="${PELE_REPO}">github.com/obsidianmd/pele</a> · <a href="${PELE_SITE}">official docs at pele.run</a>. Demos run pele@${PELE_VERSION}.</p>
    <p><a href="/llms.txt">llms.txt</a> · <a href="/sitemap.xml">sitemap</a> · <a href="https://github.com/en-dash-consulting/pele-dot-wiki">site source</a></p>
  </footer>`

function hero(p) {
  return `<section class="hero" aria-labelledby="hero-title">
        ${HERO_ART}
        <div class="hero-copy">
          <p class="kicker">kepano's Mermaid renderer · explained, live</p>
          <h1 id="hero-title">${p.h1}</h1>
          <p class="sub">${p.sub}</p>
          <p class="hero-cta"><a class="button" href="#tr-title">Race it live ↓</a> <code class="install">npm install pele</code></p>
        </div>
      </section>
      ${TYPE_RACE(true)}`
}

function render(p) {
  let html = marked.parse(p.body.replace('<!-- demo -->', '@@DEMO@@'))
  html = html.replace(/<p>@@DEMO@@<\/p>|@@DEMO@@/, p.demo ? DEMOS[p.demo] : '')
  html = html.replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="Table"><table>').replace(/<\/table>/g, '</table></div>')
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" rel="noopener"')
  if (p.type === 'faq') p.qa = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>\s*<p>([\s\S]*?)<\/p>/g)].map(m => [strip(m[1]), strip(m[2])])
  const crumbs = p.slug === 'index' ? '' : `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">${p.h1}</li></ol></nav>`
  const script = p.type === 'home' || p.demo ? '/src/pages/home.ts' : '/src/pages/content.ts'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${GA}
  <script>try{var t=new URLSearchParams(location.search).get('theme');if(t)sessionStorage.setItem('pw-theme',t);t=t||sessionStorage.getItem('pw-theme');document.documentElement.dataset.theme=/^[abc]$/.test(t)?t:'a';if(localStorage.getItem('pw-banner-graview')==='dismissed')document.documentElement.classList.add('banner-dismissed')}catch(e){document.documentElement.dataset.theme='a'}</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}" />
  <meta name="author" content="En Dash Consulting" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${url(p.slug)}" />
  <link rel="alternate" type="text/markdown" href="/md/${p.slug}.md" title="Markdown version" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta property="og:type" content="${p.type === 'home' ? 'website' : 'article'}" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:url" content="${url(p.slug)}" />
  <meta property="og:site_name" content="pele.wiki" />
  <meta property="og:image" content="${SITE}/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="pele.wiki: live demos and guides for Pele, kepano's fast Mermaid renderer" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(p.title)}" />
  <meta name="twitter:description" content="${esc(p.description)}" />
  <meta name="twitter:image" content="${SITE}/og-image.png" />
  <script type="application/ld+json">
${jsonLd(p)}
  </script>
</head>
<body>
  ${header(p.slug)}
  <main id="main" class="page${p.type === 'home' ? ' home' : ''}" tabindex="-1">
    ${crumbs}
    <article>
      ${p.type === 'home' ? hero(p) : `<h1>${p.h1}</h1>`}
      ${html}
    </article>
  </main>
  ${footer}
  <script type="module" src="${script}"></script>
</body>
</html>
`.replace(/<pre(?![^>]*tabindex)/g, '<pre tabindex="0"')
}

mkdirSync(join(ROOT, 'pages'), { recursive: true })
mkdirSync(join(ROOT, 'public/md'), { recursive: true })
for (const p of pages) {
  writeFileSync(join(ROOT, p.slug === 'index' ? 'index.html' : `pages/${p.slug}.html`), render(p))
  const md = `# ${strip(p.h1)}\n\n> ${p.description}\n\nSource: ${url(p.slug)}\n\n${p.body.replace('<!-- demo -->', `*(Interactive demo: open ${url(p.slug)})*`)}`
  writeFileSync(join(ROOT, `public/md/${p.slug}.md`), md)
}
writeFileSync(join(ROOT, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${url(p.slug)}</loc><lastmod>${p.lastmod}</lastmod><changefreq>${p.slug === 'index' ? 'weekly' : 'monthly'}</changefreq><priority>${p.slug === 'index' ? '1.0' : p.type === 'demo' ? '0.7' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`)
const line = p => `- [${strip(p.h1)}](${url(p.slug)}): ${p.description} (markdown: ${SITE}/md/${p.slug}.md)`
writeFileSync(join(ROOT, 'public/llms.txt'), `# pele.wiki

> Independent learning resource and live demo gallery for Pele, the open-source Mermaid renderer by kepano (Steph Ango) built for Obsidian. Pele turns Mermaid diagram syntax into themeable SVG with zero dependencies. Official docs: ${PELE_SITE} · source: ${PELE_REPO} (MIT).

Key facts:
- Install: \`npm install pele\`. Use: \`import { render } from 'pele'; const { svg } = render(mermaidText)\`. In a browser, \`mount(element, text)\` renders, reads fonts from CSS and adapts the layout to the container width.
- Pele reads Mermaid syntax (targets Mermaid 12.1.0) and supports every diagram type built into Mermaid 12.1.0; layout and visual style are Pele's own, so output does not look identical to Mermaid.js.
- Official numbers (pele.run): about 230 kB gzip vs 1.6 MB for Mermaid.js; 0.05–0.3 ms per render vs 6–82 ms; 0 direct dependencies vs 23.
- Theming is CSS variables (--pele-bg, --pele-fg, --pele-accent, --pele-font, --pele-series-1..8 and more); colour changes apply without re-rendering.
- Rendering is synchronous; \`pele/core\` + \`register()\` and \`pele/lazy\` + \`renderAsync()\` reduce bundle size.
- pele.wiki is not affiliated with Obsidian or kepano; it is run by En Dash Consulting (https://endash.us). Demos use pele@${PELE_VERSION}.

## Guides
${pages.filter(p => !p.demo && p.slug !== 'faq').map(line).join('\n')}

## FAQ
${bySlug.faq ? line(bySlug.faq) : ''}

## Optional
- [llms-full.txt](${SITE}/llms-full.txt): every page's full text in one file
- [Official Pele docs](${PELE_SITE})
`)
writeFileSync(join(ROOT, 'public/llms-full.txt'), `# pele.wiki — full text\n\n> All pages of pele.wiki as markdown, for one-shot ingestion. Independent resource about Pele by kepano (${PELE_REPO}).\n\n` +
  pages.map(p => `---\n\n# ${strip(p.h1)}\n\nURL: ${url(p.slug)}\n\n${p.body.replace('<!-- demo -->', '*(Interactive demo on the page.)*').replace(/<[^>]+>/g, '')}`).join('\n\n'))
console.log(`built ${pages.length} pages`)
