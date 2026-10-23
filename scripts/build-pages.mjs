#!/usr/bin/env node
// Generates every HTML page (index.html, 404.html, pages/*.html), markdown copies (public/md),
// llms.txt, llms-full.txt and sitemap.xml from content/*.md. Run: npm run pages
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { SNAPSHOT, prerenderKey } from './prerender-key.mjs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { HERO_ART, TYPE_RACE, STREAM, THEME_LAB, PHONE, DOCS_PAGE, GALLERY, SAFETY } from './demo-ui.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const GALLERY_TYPES = JSON.parse(readFileSync(join(ROOT, 'src/demos/gallery-data.ts'), 'utf8').replace(/^[\s\S]*?export const GALLERY = /, '').replace(/\s*(as const)?;?\s*$/, ''))
const SITE = 'https://pele.wiki'
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const PELE_VERSION = PKG.dependencies.pele
const MERMAID_VERSION = PKG.dependencies.mermaid
import { GA } from './ga.mjs'
import { dock } from './dock.mjs'
export { GA }
const PELE_REPO = 'https://github.com/obsidianmd/pele'
const PELE_SITE = 'https://pele.run'
const NAV = ['demos', 'gallery', 'guides', 'compare', 'faq']
const SECTIONS = { demo: ['demos', 'Demos'], guide: ['guides', 'Guides'], compare: ['compare', 'Compare'] }
// The Pele line: one stop per demo.
const LINE = [
  { n: 1, slug: 'index', anchor: '#tr-title', name: 'Type a diagram', desc: 'Pele redraws on every keystroke. Mermaid.js falls behind.' },
  { n: 2, slug: 'stream', name: 'Stream an AI answer', desc: 'Watch the diagram grow while the chatbot is still typing.' },
  { n: 3, slug: 'theme-lab', name: 'Theme lab', desc: 'Recolour every diagram with CSS. Zero redraws.' },
  { n: 4, slug: 'phone', name: 'Phone in your pocket', desc: 'Drag a phone narrower. Pele re-flows; Mermaid shrinks.' },
  { n: 5, slug: 'docs-page', name: 'A page with 200 diagrams', desc: 'Race to the last diagram on a long docs page.' },
  { n: 6, slug: 'safety', name: 'Paste anything', desc: 'Throw hostile diagrams at it. Nothing runs.' },
]
const lineVar = n => `--line:var(--l${n});--on-line:var(--on-l${n})`
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()

function parse(file) {
  const raw = readFileSync(join(ROOT, 'content', file), 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) throw new Error(`${file}: missing front matter`)
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
  meta.order = Number(meta.order ?? 50)
  let lastmod
  try { lastmod = execSync(`git log -1 --format=%cs -- content/${file}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch {}
  meta.lastmod = lastmod || new Date().toISOString().slice(0, 10)
  for (const k of ['title', 'description', 'h1', 'type']) if (!meta[k]) throw new Error(`${file}: missing ${k}`)
  if (meta.description.length > 160) console.warn(`! ${file}: description is ${meta.description.length} chars`)
  if (meta.title.length > 65) console.warn(`! ${file}: title is ${meta.title.length} chars`)
  return meta
}
const pages = readdirSync(join(ROOT, 'content')).filter(f => f.endsWith('.md')).map(parse).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
const bySlug = Object.fromEntries(pages.map(p => [p.slug, p]))
const path = slug => slug === 'index' ? '/' : `/pages/${slug}.html`
const url = slug => SITE + path(slug)
const sectionOf = p => SECTIONS[p.section] ?? null
const inSection = s => pages.filter(p => p.section === s)

const DEMOS = { stream: STREAM, 'theme-lab': THEME_LAB, phone: PHONE, 'docs-page': DOCS_PAGE, gallery: () => GALLERY(GALLERY_TYPES), safety: SAFETY }

function crumbsOf(p) {
  const c = [{ name: 'Home', path: '/' }]
  const s = sectionOf(p)
  if (s && p.slug !== s[0]) c.push({ name: s[1], path: path(s[0]) })
  if (p.slug !== 'index') c.push({ name: p.nav ?? strip(p.h1), path: path(p.slug) })
  return c
}

function jsonLd(p) {
  const org = { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'En Dash Consulting', url: 'https://endash.us' }
  const website = { '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'pele.wiki', url: SITE + '/', publisher: { '@id': `${SITE}/#org` }, inLanguage: 'en', description: bySlug.index.description }
  const kepano = { '@type': 'Person', '@id': `${SITE}/#kepano`, name: 'Steph Ango', alternateName: 'kepano', url: 'https://stephango.com', jobTitle: 'CEO', worksFor: { '@type': 'Organization', name: 'Obsidian', url: 'https://obsidian.md' }, sameAs: ['https://github.com/kepano', 'https://x.com/kepano'] }
  const software = { '@type': 'SoftwareSourceCode', '@id': `${SITE}/#pele`, name: 'Pele', alternateName: ['pele.run', 'obsidianmd/pele', 'Pele Mermaid renderer', 'pele npm'],
    disambiguatingDescription: 'The JavaScript Mermaid diagram renderer by kepano, not the Brazilian footballer Pelé.',
    description: 'A fast, lightweight Mermaid renderer that outputs themeable SVG. Zero dependencies, synchronous, themed with CSS variables.',
    codeRepository: PELE_REPO, url: PELE_SITE, sameAs: ['https://www.npmjs.com/package/pele'], author: { '@id': `${SITE}/#kepano` }, license: 'https://opensource.org/licenses/MIT',
    programmingLanguage: ['TypeScript', 'JavaScript'], runtimePlatform: 'Web browsers, Node.js', version: PELE_VERSION, keywords: 'mermaid, diagrams, svg, flowchart, renderer, obsidian' }
  const crumbs = crumbsOf(p)
  const breadcrumb = { '@type': 'BreadcrumbList', '@id': `${url(p.slug)}#breadcrumb`, itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE + c.path })) }
  const base = { '@id': `${url(p.slug)}#page`, url: url(p.slug), name: p.title, headline: strip(p.h1), description: p.description, inLanguage: 'en',
    isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#pele` }, publisher: { '@id': `${SITE}/#org` }, dateModified: p.lastmod,
    image: `${SITE}/og-image.png`, ...(p.slug !== 'index' ? { breadcrumb: { '@id': `${url(p.slug)}#breadcrumb` } } : {}) }
  const list = items => ({ '@type': 'ItemList', itemListElement: items.map((d, i) => ({ '@type': 'ListItem', position: i + 1, url: url(d.slug), name: strip(d.h1) })) })
  let page
  if (p.type === 'home') page = { '@type': 'WebPage', ...base, mainEntity: { '@id': `${SITE}/#pele` }, mentions: { '@id': FOOTBALLER.id } }
  else if (p.type === 'faq') page = { '@type': 'FAQPage', ...base, mainEntity: p.qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  else if (p.type === 'howto') page = { '@type': 'HowTo', ...base, name: strip(p.h1), totalTime: 'PT5M', tool: [{ '@type': 'HowToTool', name: 'npm' }], step: p.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.split(':')[0], text: s })) }
  else if (p.type === 'hub') page = { '@type': 'CollectionPage', ...base, mainEntity: list(hubItems(p)) }
  else if (p.slug === 'gallery') page = { '@type': 'CollectionPage', ...base, mainEntity: { '@type': 'ItemList', numberOfItems: GALLERY_TYPES.length, itemListElement: GALLERY_TYPES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: `${g.name} (${g.key})`, url: `${url('gallery')}#type-${g.type}` })) } }
  else page = { '@type': 'TechArticle', ...base, author: { '@id': `${SITE}/#org` }, proficiencyLevel: p.type === 'compare' ? 'Intermediate' : 'Beginner', ...(p.demo ? { learningResourceType: 'Interactive demo', isAccessibleForFree: true } : {}) }
  const graph = [website, org, kepano, software, page]
  if (p.type === 'home') graph.push(footballerEntity)
  if (p.slug !== 'index') graph.push(breadcrumb)
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1).replace(/</g, '\\u003c')
}

// pele.wiki also answers people looking for Pelé the footballer: his wiki lives at /footballer/.
const FOOTBALLER = { path: '/footballer/', id: `${SITE}/footballer/#pele` }
const footballerEntity = { '@type': 'Person', '@id': FOOTBALLER.id, name: 'Pelé', alternateName: ['Edson Arantes do Nascimento', 'O Rei', 'Pele'], description: 'Brazilian footballer (1940–2022), three-time FIFA World Cup winner.', url: SITE + FOOTBALLER.path, sameAs: ['https://en.wikipedia.org/wiki/Pel%C3%A9', 'https://www.wikidata.org/wiki/Q12897'] }
// The home page opens by sorting its two audiences: footballer fans to their wiki, everyone else reads on.
const twoPeles = `<section class="two" aria-label="Two Pelés">
        <div class="two-ball">
          <div class="two-copy">
            <p class="two-kicker">Two Pelés live at pele.wiki</p>
            <p class="two-title">Here for <em>Pelé</em>, the footballer?</p>
            <p class="two-text">We built O Rei a wiki: his life in twelve chapters, four World Cups, the 1,000th goal, every record sourced. It runs on <a href="https://graview.dev">Graview</a>, so you can walk the same data as a city.</p>
            <p class="two-cta"><a class="two-go" href="${FOOTBALLER.path}">Open the Pelé wiki <span aria-hidden="true">→</span></a></p>
          </div>
          <img class="two-photo" src="/footballer/img/pele-schiphol-1962-640.jpg" alt="Pelé arriving at Schiphol airport in 1962" width="509" height="640" fetchpriority="low" />
          <p class="two-credit">Photo: Joop van Bilsen, Anefo / Nationaal Archief, CC0</p>
        </div>
        <a class="two-read" href="#hero-title">Here for the diagram library? Read on <span aria-hidden="true">↓</span></a>
      </section>`
const hatnote = `<p class="hatnote">This page is about Pele, the Mermaid diagram renderer. For the Brazilian footballer, see <a href="${FOOTBALLER.path}">Pelé (footballer)</a>.</p>`
const HATNOTE_ON = ['what-is-pele', 'faq', 'about']

const brandMark = `<img class="brand-mark" src="/brand/pele.svg" alt="Pele" width="32" height="24" />`

function header(p) {
  const active = sectionOf(p)?.[0] ?? p.slug
  const links = NAV.map(s => `<li><a href="${path(s)}"${s === active ? ' aria-current="page"' : ''}>${bySlug[s].nav}</a></li>`).join('') + `<li class="nav-other"><a href="${FOOTBALLER.path}">Pelé the footballer</a></li>`
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="/">${brandMark}<span>pele<span class="brand-tld">.wiki</span></span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" aria-label="Main"><ul>${links}</ul></nav>
  </header>`
}
const footer = `<footer class="site-footer"><div class="foot-inner">
    <nav aria-label="Footer"><ul class="foot-links">${['demos', 'gallery', 'getting-started', 'api', 'theming', 'migrating', 'compare', 'faq', 'about'].map(s => `<li><a href="${path(s)}">${esc(bySlug[s].nav)}</a></li>`).join('')}</ul></nav>
    <p><strong>pele.wiki</strong> is an independent learning site by <a href="https://endash.us">En Dash Consulting</a>, built with <a href="https://github.com/en-dash-consulting/n-dx">n-dx</a>. It is not affiliated with or endorsed by Obsidian or kepano.</p>
    <p>Pele © 2026 <a href="https://github.com/kepano">kepano</a>, MIT license · source at <a href="${PELE_REPO}">github.com/obsidianmd/pele</a> · official docs at <a href="${PELE_SITE}">pele.run</a>. Demos run pele ${PELE_VERSION} and Mermaid.js ${MERMAID_VERSION}.</p>
    <p>Looking for the footballer? <a href="${FOOTBALLER.path}">Pelé (1940–2022), the wiki</a>: his clubs, his four World Cups and his goals.</p>
    <p><a href="/llms.txt">llms.txt</a> · <a href="/sitemap.xml">sitemap</a> · <a href="https://github.com/en-dash-consulting/pele-dot-wiki">site source</a></p>
  </div></footer>`

const lineMap = (cls = '') => `<ol class="line-map ${cls}" aria-label="The Pele line: six live demos">${LINE.map(s => `<li style="${lineVar(s.n)}"><a href="${s.slug === 'index' ? '/' + (s.anchor ?? '') : path(s.slug)}"><span class="stop-dot" aria-hidden="true"></span><span class="stop-n">Stop ${s.n}</span><span class="stop-name">${esc(s.name)}</span><span class="stop-desc">${esc(s.desc)}</span></a></li>`).join('')}</ol>`

function hero(p) {
  return `<section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="kicker">kepano's Mermaid renderer, explained live</p>
          <h1 id="hero-title">${p.h1}</h1>
          <p class="sub">${p.sub}</p>
          <p class="hero-cta"><a class="button" href="#tr-title">Try it live ↓</a> <button type="button" class="install" data-copy="npm install pele" ><span class="visually-hidden">Copy the install command: </span>npm install pele <span class="copy-label" aria-hidden="true">Copy</span></button></p>
        </div>
        <div class="hero-art-cell">${HERO_ART}</div>
      </section>
      ${TYPE_RACE()}`
}

function demoHead(p) {
  const stop = LINE.find(s => s.slug === p.slug)
  const badge = stop ? `<span class="roundel" style="${lineVar(stop.n)}" aria-hidden="true">${stop.n}</span>` : ''
  return `<div class="demo-head">${badge}<div>${stop ? `<p class="kicker">Stop ${stop.n} on the Pele line</p>` : ''}<h1>${p.h1}</h1></div></div>${p.intro ? `<p class="demo-intro">${p.intro}</p>` : ''}`
}
function nextStop(p) {
  const i = LINE.findIndex(s => s.slug === p.slug)
  if (i < 0) return ''
  const link = (s, label) => s ? `<a href="${s.slug === 'index' ? '/' + (s.anchor ?? '') : path(s.slug)}"><span class="roundel" style="${lineVar(s.n)}" aria-hidden="true">${s.n}</span><span>${label}: ${esc(s.name)}</span></a>` : `<a href="${path('gallery')}"><span class="roundel" style="${lineVar(5)}" aria-hidden="true">G</span><span>End of the line: the gallery</span></a>`
  return `<nav class="next-stop" aria-label="Demo line">${i > 0 ? link(LINE[i - 1], 'Previous stop') : '<span></span>'}${link(LINE[i + 1], 'Next stop')}</nav>`
}
const DEMO_FOR = { theming: 'theme-lab', responsive: 'phone', 'streaming-ai': 'stream', security: 'safety', 'what-is-pele': 'index', 'getting-started': 'gallery', migrating: 'gallery', api: 'gallery', 'pele-vs-mermaid': 'index', 'pele-vs-d2': 'docs-page', 'pele-vs-excalidraw': 'gallery' }
function related(p) {
  if (p.type === 'hub' || p.type === 'home' || !['guide', 'compare'].includes(p.section)) return ''
  const sib = inSection(p.section).filter(x => x.slug !== p.slug && x.type !== 'hub')
  const i = Math.max(0, inSection(p.section).findIndex(x => x.slug === p.slug))
  const picks = [...sib.slice(i), ...sib.slice(0, i)].slice(0, 3)
  const other = p.section === 'guide' ? bySlug['pele-vs-mermaid'] : bySlug['what-is-pele']
  if (other && !picks.includes(other)) picks.push(other)
  const d = DEMO_FOR[p.slug]
  const demo = d === 'index' ? { href: '/#tr-title', name: 'Live demo: the typing race' } : d && bySlug[d] ? { href: path(d), name: `Live demo: ${strip(bySlug[d].nav ?? bySlug[d].h1)}` } : null
  const items = picks.map(x => `<li><a href="${path(x.slug)}">${esc(strip(x.nav ?? x.h1))}</a></li>`).join('') + (demo ? `<li><a href="${demo.href}">${esc(demo.name)}</a></li>` : '')
  return `<nav class="related" aria-labelledby="related-title"><h2 id="related-title">Keep reading</h2><ul>${items}</ul></nav>`
}
function hubItems(p) {
  if (p.slug === 'demos') return LINE.map(s => bySlug[s.slug]).concat([bySlug.gallery])
  return inSection(p.section).filter(x => x.slug !== p.slug)
}
function hubList(p) {
  if (p.slug === 'demos') return lineMap() + `<div class="card-grid"><a class="card" href="${path('gallery')}"><h2 class="card-title">The gallery</h2><p>Every diagram type Pele draws, live and editable, with a Mermaid.js comparison on each card.</p></a></div>`
  const items = hubItems(p)
  return `<div class="card-grid">${items.map(d => `<a class="card" href="${path(d.slug)}"><h2 class="card-title">${d.nav ?? strip(d.h1)}</h2><p>${esc(d.description)}</p></a>`).join('')}</div>`
}

function render(p) {
  let html = marked.parse(p.body.replace('<!-- demo -->', '@@DEMO@@').replace('<!-- line -->', '@@LINE@@').replace('<!-- hub -->', '@@HUB@@'))
  html = html.replace(/<p>@@DEMO@@<\/p>|@@DEMO@@/, p.demo ? DEMOS[p.demo]() : '')
  html = html.replace(/<p>@@LINE@@<\/p>|@@LINE@@/, lineMap())
  html = html.replace(/<p>@@HUB@@<\/p>|@@HUB@@/, hubList(p))
  let tableN = 0
  html = html.replace(/<table>([\s\S]*?)<\/table>/g, (_, inner) => {
    const heads = [...inner.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m => strip(m[1])).filter(Boolean).join(', ')
    return `<div class="table-scroll" tabindex="0" role="region" aria-label="Table ${++tableN}: ${esc(heads)}"><table>${inner}</table></div>`
  })
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" rel="noopener"')
  html = html.replace(/<pre>/g, '<pre tabindex="0">')
  // Short inline code (CSS variables, option names) should never split at its hyphens on a narrow screen.
  html = html.replace(/<code>([^<]{1,30})<\/code>/g, '<code class="nw">$1</code>')
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, t) => `<h2 id="${strip(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${t}</h2>`)
  if (p.type === 'faq') p.qa = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>\s*<p>([\s\S]*?)<\/p>/g)].map(m => [strip(m[1]), strip(m[2])])
  const crumbs = p.slug === 'index' || p.slug === '404' ? '' : `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${crumbsOf(p).map((c, i, a) => i === a.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.path}">${esc(c.name)}</a></li>`).join('')}</ol></nav>`
  const script = p.type === 'home' ? '/src/pages/home.ts' : p.demo ? '/src/pages/demo.ts' : '/src/pages/content.ts'
  const head = p.type === 'home' ? twoPeles + hero(p) : p.type === 'demo' ? demoHead(p) : `<h1>${p.h1}</h1>${HATNOTE_ON.includes(p.slug) ? hatnote : ''}${p.intro ? `<p class="lede">${p.intro}</p>` : ''}`
  const robots = p.slug === '404' ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${GA}
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}" />
  <meta name="author" content="En Dash Consulting" />
  <meta name="robots" content="${robots}" />
  <meta name="theme-color" content="#111111" />
  <meta name="color-scheme" content="light dark" />
  ${p.slug === '404' ? '' : `<link rel="canonical" href="${url(p.slug)}" />
  <link rel="alternate" type="text/markdown" href="/md/${p.slug}.md" title="Markdown version" />`}
  <link rel="preload" href="/fonts/montserrat-latin-wght-normal-core.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/merriweather-latin-400-normal-core.woff2" as="font" type="font/woff2" crossorigin />
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
  <meta property="og:image:alt" content="pele.wiki: live demos and guides for Pele, kepano's fast Mermaid renderer, drawn as a transit map" />
  <meta property="og:locale" content="en_US" />
  ${p.type !== 'home' ? `<meta property="article:modified_time" content="${p.lastmod}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(p.title)}" />
  <meta name="twitter:description" content="${esc(p.description)}" />
  <meta name="twitter:image" content="${SITE}/og-image.png" />
  <meta name="twitter:image:alt" content="pele.wiki: live demos and guides for Pele, kepano's fast Mermaid renderer" />
  ${p.slug === '404' ? '' : `<script type="application/ld+json">
${jsonLd(p)}
  </script>`}
</head>
<body>
  ${header(p)}
  <main id="main" class="page${p.type === 'home' ? ' home' : ''}${p.demo ? ' demo-page' : ''}" tabindex="-1">
    ${crumbs}
    <article>
      ${head}
      ${html}
    </article>
    ${p.demo ? '<p id="demo-status" class="hint demo-status" role="status">Loading the live demo…</p>' : ''}
    ${nextStop(p)}${related(p)}
  </main>
  ${footer}
  ${dock('renderer')}
  <script type="module" src="${script}"></script>
</body>
</html>
`
}

rmSync(join(ROOT, 'pages'), { recursive: true, force: true })
mkdirSync(join(ROOT, 'pages'), { recursive: true })
rmSync(join(ROOT, 'public/md'), { recursive: true, force: true })
mkdirSync(join(ROOT, 'public/md'), { recursive: true })
const md = p => `# ${strip(p.h1)}\n\n> ${p.description}\n\nSource: ${url(p.slug)} · Last updated ${p.lastmod}\n\n${p.intro ? strip(p.intro) + '\n\n' : ''}${p.body.replace('<!-- demo -->', `*(Interactive demo: open ${url(p.slug)})*`).replace('<!-- line -->', LINE.map(s => `- Stop ${s.n}: [${s.name}](${s.slug === 'index' ? SITE + '/' : url(s.slug)}): ${s.desc}`).join('\n')).replace('<!-- hub -->', '')}`

// Build-time Pele drawings (scripts/prerender.mjs), so the first paint shows the finished diagram.
const SNAP = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf8')) : null
const SNAP_OK = SNAP?.key === prerenderKey()
if (!SNAP_OK) console.warn('build-pages: src/prerender.json is missing or stale; run `npm run prerender`. Shipping without build-time drawings.')
function prerendered(slug, html) {
  if (!SNAP_OK) return html
  for (const it of SNAP.items.filter(i => i.page === slug)) {
    const re = new RegExp('(<div[^>]*' + it.attr.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&') + '[^>]*>)(</div>)')
    if (!re.test(html)) throw new Error(`prerender: no empty ${it.attr} on ${slug}`)
    html = html.replace(re, (_, a, b) => `${a.replace('<div', '<div data-prerendered')}${it.html}${b}`)
  }
  return html
}

for (const p of pages) {
  writeFileSync(join(ROOT, p.slug === 'index' ? 'index.html' : p.slug === '404' ? '404.html' : `pages/${p.slug}.html`), prerendered(p.slug, render(p)))
  if (p.slug !== '404') writeFileSync(join(ROOT, `public/md/${p.slug}.md`), md(p))
}
const indexable = pages.filter(p => p.slug !== '404')
writeFileSync(join(ROOT, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map(p => `  <url><loc>${url(p.slug)}</loc><lastmod>${p.lastmod}</lastmod><changefreq>${p.slug === 'index' ? 'weekly' : 'monthly'}</changefreq><priority>${p.slug === 'index' ? '1.0' : p.type === 'demo' || p.type === 'hub' ? '0.8' : '0.7'}</priority></url>`).join('\n')}
</urlset>
`)
const line = p => `- [${strip(p.h1)}](${url(p.slug)}): ${p.description} (markdown: ${SITE}/md/${p.slug}.md)`
writeFileSync(join(ROOT, 'public/llms.txt'), `# pele.wiki

> Two Pelés live here. This file is about Pele the Mermaid renderer (everything at / and /pages/). For Pelé the Brazilian footballer (Edson Arantes do Nascimento, 1940–2022), see ${SITE}${FOOTBALLER.path} and its own ${SITE}/footballer/llms.txt.

> Independent learning site and live demo gallery for Pele, the open-source Mermaid renderer by kepano (Steph Ango, CEO of Obsidian), built for Obsidian. Pele turns Mermaid diagram text into themeable SVG, synchronously, with zero dependencies. Official docs: ${PELE_SITE} · source: ${PELE_REPO} (MIT) · npm: https://www.npmjs.com/package/pele

Key facts:
- Install: \`npm install pele\`. Use: \`import { render } from 'pele'; const { svg } = render(mermaidText)\`. In a browser, \`mount(element, text)\` draws into an element, reads fonts from CSS and redraws when the element's width changes.
- Pele reads Mermaid syntax (it targets Mermaid 12.1.0) and supports every diagram type built into Mermaid 12.1.0: 32 kinds plus \`info\`. Its layout and look are its own, so diagrams do not look identical to Mermaid.js. Mermaid themes and themeVariables do not apply; colours come from CSS variables.
- Official figures (pele.run): about 230 kB gzip vs 1.6 MB for Mermaid.js; 0.05–0.3 ms per render vs 6–82 ms; 0 direct dependencies vs 23.
- Theming: CSS variables such as --pele-bg, --pele-fg, --pele-line, --pele-surface, --pele-border, --pele-accent, --pele-font, --pele-radius and --pele-series-1 to --pele-series-8. Colour changes apply without re-rendering.
- Narrow screens: pass maxWidth (mount does this for you); below 640 px a left-to-right flowchart can switch to top-to-bottom instead of shrinking.
- Safety: output has no scripts, event handlers or HTML labels; javascript:, data: and vbscript: links are always blocked; limits of 50,000 source characters, 4,000,000 SVG characters and 5,000 flowchart edges.
- Smaller bundles: \`pele/core\` + \`register()\` for chosen types, or \`pele/lazy\` + \`renderAsync()\` to load types on demand.
- When to keep Mermaid.js: you need its exact look, JavaScript click callbacks, or plugins such as ZenUML.
- pele.wiki is not affiliated with Obsidian or kepano; it is made by En Dash Consulting (https://endash.us). Demos use pele ${PELE_VERSION} and Mermaid.js ${MERMAID_VERSION}.

## Live demos
${LINE.map(s => bySlug[s.slug]).concat([bySlug.gallery]).map(line).join('\n')}

## Guides
${inSection('guide').filter(p => p.slug !== 'guides').map(line).join('\n')}

## Comparisons
${inSection('compare').filter(p => p.slug !== 'compare').map(line).join('\n')}

## FAQ
${line(bySlug.faq)}

## Pelé the footballer (a separate wiki on this site)
- [Pelé, the wiki](${SITE}${FOOTBALLER.path}): Edson Arantes do Nascimento (1940–2022), the Brazilian footballer: his life in chapters, his four World Cups, his clubs, matches, goals and honours, every record sourced
- [His life, in chapters](${SITE}${FOOTBALLER.path}chapters/)
- [Pelé FAQ](${SITE}${FOOTBALLER.path}questions/): his real name, how many goals and World Cups, his clubs, his number, how he died
- [llms.txt for the footballer wiki](${SITE}${FOOTBALLER.path}llms.txt) · [its full text](${SITE}${FOOTBALLER.path}llms-full.txt)

## Optional
- [llms-full.txt](${SITE}/llms-full.txt): every page's full text in one file
- [About pele.wiki](${url('about')})
- [Official Pele docs](${PELE_SITE})
`)
writeFileSync(join(ROOT, 'public/llms-full.txt'), `# pele.wiki — full text\n\n> Every page of pele.wiki as markdown, for one-shot reading. Independent site about Pele by kepano (${PELE_REPO}).\n\n` +
  indexable.map(p => `---\n\n${md(p).replace(/<[^>]+>/g, '')}`).join('\n\n'))
console.log(`built ${pages.length} pages`)
