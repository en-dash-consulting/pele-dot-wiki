// Build-time render of the footballer wiki: one page per route, each with its own title, description,
// canonical address, schema.org graph and Markdown copy. scripts/build-footballer.mjs writes them out.
import { renderToString } from 'react-dom/server'
import { compileDocument } from '@graview/core/check'
import { placesOf } from '@graview/core/seat'
import doc from './data/app.json'
import seed from './data/seed.json'
import { BASE, KINDS, ORDER, SITE, INFOBOX, kindHref, labelOf, plain, readWiki, recordHref, sayDate, sayField, summaryOf, type Kind, type Rec, type Snapshot } from './model'
import { Home, KindList, RecordPage, Shell } from './ui'

export interface Route {
  /** The address the page is read at, under the site. */
  readonly path: string
  /** Where its HTML goes, under dist/. */
  readonly files: readonly string[]
  readonly title: string
  readonly description: string
  readonly html: string
  readonly jsonLd: string
  readonly md?: string
  readonly image?: string
  readonly index: boolean
}

const wiki = readWiki(seed as unknown as Snapshot)
const pele = wiki.pele
const PERSON_ID = `${SITE}${BASE}/#pele`
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'pele.wiki', url: `${SITE}/` }
const ORG = { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'En Dash Consulting', url: 'https://endash.us' }
const Plural = (k: Kind) => KINDS[k].plural.charAt(0).toUpperCase() + KINDS[k].plural.slice(1)
const abs = (path: string) => SITE + path
const img = (r?: Rec) => r?.photo ? abs(r.photo) : undefined

function personLd(r: Rec, full: boolean) {
  const bornIn = wiki.out(r.id, 'bornIn')[0]
  const teams = wiki.out(r.id, 'playedFor')
  return {
    '@type': 'Person', '@id': r.id === 'pele' ? PERSON_ID : `${abs(recordHref(r))}#person`, name: r.name, url: abs(recordHref(r)),
    ...(r.fullName ? { alternateName: [r.fullName, ...(r.id === 'pele' ? ['O Rei', 'Pele', 'Pelé the footballer'] : [])] } : {}),
    ...(r.born ? { birthDate: r.born } : {}), ...(r.died ? { deathDate: r.died } : {}),
    ...(bornIn ? { birthPlace: { '@type': 'Place', name: bornIn.name } } : {}),
    ...(r.nationality ? { nationality: r.nationality } : {}),
    ...(r.headline ? { description: r.headline } : {}), ...(img(r) ? { image: img(r) } : {}),
    ...(teams.length ? { memberOf: teams.map(t => ({ '@type': 'SportsTeam', name: t.name, url: abs(recordHref(t)) })) } : {}),
    ...(r.id === 'pele' ? {
      jobTitle: 'Footballer', disambiguatingDescription: 'Brazilian footballer, not the Pele Mermaid diagram renderer that pele.wiki also covers.',
      sameAs: ['https://en.wikipedia.org/wiki/Pel%C3%A9', 'https://www.wikidata.org/wiki/Q12897', 'https://www.britannica.com/biography/Pele-Brazilian-athlete'],
      ...(full ? { award: wiki.of('honour').map(h => `${h.name}${h.year ? ` (${h.year})` : ''}`) } : {}),
    } : r.source ? { sameAs: [r.source] } : {}),
  }
}
const teamLd = (t: Rec) => ({ '@type': 'SportsTeam', name: t.name, url: abs(recordHref(t)), sport: 'Association football' })
const placeLd = (p: Rec) => ({ '@type': p.type === 'stadium' ? 'StadiumOrArena' : p.type === 'country' ? 'Country' : 'City', name: p.name, url: abs(recordHref(p)) })

function entityLd(r: Rec): Record<string, unknown> {
  const url = abs(recordHref(r))
  const base = { '@id': `${url}#thing`, name: r.name, url, ...(r.headline ? { description: r.headline } : {}), ...(img(r) ? { image: img(r) } : {}), ...(r.source ? { sameAs: [r.source] } : {}) }
  switch (r.kind) {
    case 'person': return personLd(r, true)
    case 'match': {
      const at = wiki.out(r.id, 'playedAt')[0], us = wiki.out(r.id, 'forTeam')[0], them = wiki.out(r.id, 'against')[0], of = wiki.out(r.id, 'partOf')[0]
      return { '@type': 'SportsEvent', ...base, sport: 'Association football', ...(r.date ? { startDate: r.date } : {}), eventStatus: 'https://schema.org/EventScheduled',
        ...(at ? { location: placeLd(at) } : {}), ...(us && them ? { competitor: [teamLd(us), teamLd(them)], homeTeam: teamLd(us), awayTeam: teamLd(them) } : {}),
        ...(of ? { superEvent: { '@type': 'SportsEvent', name: of.name, url: abs(recordHref(of)) } } : {}), performer: { '@id': PERSON_ID } }
    }
    case 'tournament': {
      const matches = wiki.in(r.id, 'partOf')
      return { '@type': 'SportsEvent', ...base, sport: 'Association football', ...(r.year ? { startDate: String(r.year) } : {}),
        location: wiki.out(r.id, 'hostedIn').map(placeLd), subEvent: matches.map(m => ({ '@type': 'SportsEvent', name: m.name, startDate: m.date, url: abs(recordHref(m)) })), performer: { '@id': PERSON_ID } }
    }
    case 'club': return { '@type': 'SportsTeam', ...base, sport: 'Association football', ...(r.years ? { athlete: { '@id': PERSON_ID } } : {}) }
    case 'place': return { ...placeLd(r), ...base }
    case 'work': return { '@type': r.type === 'book' ? 'Book' : r.type === 'song' ? 'MusicRecording' : 'Movie', ...base, ...(r.year ? { datePublished: String(r.year) } : {}), about: { '@id': PERSON_ID } }
    case 'question': return { '@type': 'Question', '@id': `${url}#question`, name: r.name, url, answerCount: 1, acceptedAnswer: { '@type': 'Answer', text: plain(String(r.answer ?? '')), url } }
    default: return { '@type': 'Thing', ...base }
  }
}

function graph(page: Record<string, unknown>, crumbs: { name: string; path: string }[], extra: unknown[] = []) {
  const breadcrumb = { '@type': 'BreadcrumbList', '@id': `${page['url']}#breadcrumb`, itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })) }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [WEBSITE, ORG, { ...page, isPartOf: { '@id': `${SITE}/#website` }, publisher: { '@id': `${SITE}/#org` }, inLanguage: 'en', breadcrumb: { '@id': breadcrumb['@id'] } }, breadcrumb, ...extra] }, null, 1).replace(/</g, '\\u003c')
}

// ——— Markdown copies, for answer engines and llms-full.txt ———
function recordMd(r: Rec): string {
  const facts = INFOBOX[r.kind].map(f => [labelOf(r.kind, f), sayField(r.kind, f, r[f])] as const).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`)
  const links = wiki.links(r.id).map(g => `- ${g.words.charAt(0).toUpperCase() + g.words.slice(1)}: ${g.records.map(x => `[${x.name}](${abs(recordHref(x))})`).join(', ')}`)
  return [`# ${r.name}`, '', r.headline ? `> ${r.headline}` : '', '', `Source page: ${abs(recordHref(r))}`, r.source ? `Reference: ${r.source}` : '', '',
    r.kind === 'question' ? String(r.answer ?? '') : '', facts.length ? facts.join('\n') : '', '', r.story ?? '', '', links.length ? `## Related\n\n${links.join('\n')}` : '']
    .join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

const render = (node: React.ReactNode, here?: Kind | 'home') => renderToString(<Shell here={here}>{node}</Shell>)
const listFiles = (k: Kind) => [`footballer/${kindHref(k).slice(BASE.length + 1)}.html`, `footballer/${kindHref(k).slice(BASE.length + 1)}/index.html`]

export function routes(): Route[] {
  const out: Route[] = []
  const peleDesc = summaryOf(pele ?? { id: 'pele', kind: 'person', name: 'Pelé' })
  // Home
  out.push({
    path: `${BASE}/`, files: ['footballer/index.html'], index: true, image: img(pele),
    title: 'Pelé: the wiki on the Brazilian footballer, 1940–2022 | pele.wiki',
    description: 'Pelé (Edson Arantes do Nascimento), the Brazilian footballer: his life in chapters, his four World Cups, Santos and the Cosmos, his famous goals and honours, with sources.'.slice(0, 160),
    html: render(<Home wiki={wiki} />, 'home'),
    jsonLd: graph({ '@type': 'WebPage', '@id': `${SITE}${BASE}/#page`, url: `${SITE}${BASE}/`, name: 'Pelé, the wiki', description: peleDesc, about: { '@id': PERSON_ID }, mainEntity: { '@id': PERSON_ID } },
      [{ name: 'pele.wiki', path: '/' }, { name: 'Pelé the footballer', path: `${BASE}/` }], pele ? [personLd(pele, true)] : []),
    md: `# Pelé, the wiki\n\n> ${peleDesc}\n\n${wiki.of('chapter').map(c => `- [${c.name}](${abs(recordHref(c))}): ${c.headline ?? ''}`).join('\n')}\n`,
  })
  // Lists
  for (const k of ORDER) {
    const records = wiki.of(k)
    const isFaq = k === 'question'
    out.push({
      path: `${kindHref(k)}/`, files: listFiles(k), index: true,
      title: isFaq ? 'Pelé FAQ: his goals, World Cups, name and more | pele.wiki' : `${Plural(k)} · Pelé, the wiki | pele.wiki`,
      description: isFaq ? 'Straight answers to what people ask about Pelé: his real name, how many goals and World Cups, his clubs, his number and how he died.' : `${KINDS[k].description} ${records.length} ${records.length === 1 ? KINDS[k].noun : KINDS[k].plural}, each with its source.`.slice(0, 160),
      html: render(<KindList wiki={wiki} kind={k} />, k),
      jsonLd: graph(isFaq
        ? { '@type': 'FAQPage', '@id': `${abs(kindHref(k))}/#page`, url: `${abs(kindHref(k))}/`, name: 'Pelé FAQ', mainEntity: records.map(q => ({ '@type': 'Question', name: q.name, acceptedAnswer: { '@type': 'Answer', text: plain(String(q.answer ?? '')) } })) }
        : { '@type': 'CollectionPage', '@id': `${abs(kindHref(k))}/#page`, url: `${abs(kindHref(k))}/`, name: `${Plural(k)}: Pelé`, about: { '@id': PERSON_ID }, mainEntity: { '@type': 'ItemList', numberOfItems: records.length, itemListElement: records.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r.name, url: abs(recordHref(r)) })) } },
      [{ name: 'pele.wiki', path: '/' }, { name: 'Pelé the footballer', path: `${BASE}/` }, { name: Plural(k), path: `${kindHref(k)}/` }]),
      md: `# ${Plural(k)}: Pelé, the wiki\n\n> ${KINDS[k].description}\n\n${records.map(r => isFaq ? `## ${r.name}\n\n${r.answer}\n` : `- [${r.name}](${abs(recordHref(r))})${r.headline ? `: ${r.headline}` : ''}`).join('\n')}\n`,
    })
  }
  // Records
  for (const r of wiki.all) {
    const url = abs(recordHref(r))
    const isPele = r.id === 'pele'
    const entity = entityLd(r)
    const page = r.kind === 'question'
      ? { '@type': 'QAPage', '@id': `${url}#page`, url, name: r.name, mainEntity: { '@id': `${url}#question` } }
      : { '@type': isPele ? 'ProfilePage' : 'WebPage', '@id': `${url}#page`, url, name: r.name, description: summaryOf(r), mainEntity: { '@id': entity['@id'] }, about: { '@id': PERSON_ID }, ...(img(r) ? { primaryImageOfPage: img(r) } : {}) }
    out.push({
      path: recordHref(r), files: [`footballer/${recordHref(r).slice(BASE.length + 1)}.html`], index: true, image: img(r),
      title: `${isPele ? 'Pelé: life, goals, World Cups and legacy' : r.name}${r.kind === 'match' && r.date ? ` (${sayDate(r.date)})` : ''} · Pelé, the wiki`.slice(0, 70) + ' | pele.wiki',
      description: summaryOf(r) || `${r.name}: ${KINDS[r.kind].noun} in the story of Pelé.`,
      html: render(<RecordPage wiki={wiki} id={r.id} />, r.kind),
      jsonLd: graph(page, [{ name: 'pele.wiki', path: '/' }, { name: 'Pelé the footballer', path: `${BASE}/` }, { name: Plural(r.kind), path: `${kindHref(r.kind)}/` }, { name: r.name, path: recordHref(r) }], [entity]),
      md: recordMd(r),
    })
  }
  // Graview's own places: the scene, the lenses, the map and Find. Drawn in the browser; the HTML only says what is coming.
  const compiled = compileDocument(doc as never)
  const places = compiled.ok ? placesOf(compiled.app).filter(p => typeof p.address === 'string' && p.address.startsWith('/places/')) : []
  const graviewPages = [
    { path: '/places/overview', title: 'The scene: Pelé’s story as a city', text: 'Every record in the wiki, drawn as a city: each kind a district, each link a road.' },
    ...places.filter(p => p.address !== '/places/overview').map(p => ({ path: p.address as string, title: `${p.title ?? p.address}`, text: 'A picture of the wiki’s data, drawn by Graview.' })),
    { path: '/map', title: 'How the wiki connects', text: 'Every relation between the kinds of record in this wiki, with live counts.' },
    { path: '/search', title: 'Find in the wiki', text: 'Search every record in the wiki.' },
  ]
  for (const g of graviewPages) out.push({
    path: BASE + g.path, files: [`footballer${g.path}.html`], index: g.path.startsWith('/places/'),
    title: `${g.title} · Pelé, the wiki | pele.wiki`, description: `${g.text} Built with Graview.`,
    html: render(<header className="fw-head"><p className="fw-kicker">Under the hood</p><h1>{g.title}</h1><p className="fw-lede">{g.text} It needs JavaScript; every record is also a plain page, starting from <a href={`${BASE}/`}>the wiki’s front page</a>.</p></header>),
    jsonLd: graph({ '@type': 'WebPage', '@id': `${SITE}${BASE}${g.path}#page`, url: `${SITE}${BASE}${g.path}`, name: g.title, about: { '@id': PERSON_ID } }, [{ name: 'pele.wiki', path: '/' }, { name: 'Pelé the footballer', path: `${BASE}/` }, { name: g.title, path: BASE + g.path }]),
  })
  return out
}

export function llms(): { short: string; full: string } {
  const line = (r: Rec) => `- [${r.name}](${abs(recordHref(r))}): ${summaryOf(r)} (markdown: ${SITE}/md${recordHref(r)}.md)`
  const brazil = wiki.get('brazil'), santos = wiki.get('santos'), cosmos = wiki.get('cosmos')
  const facts = [
    pele ? `- Pelé: ${pele.fullName ?? 'Edson Arantes do Nascimento'}, born ${sayDate(pele.born)}${wiki.out('pele', 'bornIn')[0] ? ` in ${wiki.out('pele', 'bornIn')[0]!.name}` : ''}, died ${sayDate(pele.died)}.` : '',
    `- World Cups won: ${wiki.of('honour').filter(h => h.category === 'world cup').map(h => h.year).join(', ')}; he played in ${wiki.of('tournament').filter(t => /world cup/i.test(t.name)).map(t => t.year).join(', ')}.`,
    ...[santos, cosmos, brazil].filter(Boolean).map(t => `- ${t!.name}: ${t!.years ?? ''}, ${t!.goals ?? '?'} goals in ${t!.apps ?? '?'} official matches (as counted by ${t!.source ?? 'the cited source'}).`),
  ].filter(Boolean).join('\n')
  const short = `# Pelé the footballer, on pele.wiki

> A sourced wiki on Pelé (Edson Arantes do Nascimento, 1940–2022), the Brazilian footballer: his life in chapters, his four World Cups, his clubs, the matches and goals that made him, the people around him and his honours. Unofficial, by En Dash Consulting. Not the same as Pele, the Mermaid diagram renderer covered at ${SITE}/ (see ${SITE}/llms.txt).

Key facts (each page links its source; disputed figures are said to be disputed):
${facts}

${ORDER.map(k => `## ${Plural(k)}\n${wiki.of(k).map(line).join('\n')}`).join('\n\n')}

## Optional
- [llms-full.txt](${SITE}${BASE}/llms-full.txt): every record's full text
- [The scene](${SITE}${BASE}/places/overview): the same data drawn as a city, by Graview
`
  const full = `# Pelé the footballer, on pele.wiki — full text\n\n> Every record of ${SITE}${BASE}/ as Markdown.\n\n` + wiki.all.map(r => `---\n\n${recordMd(r)}`).join('\n')
  return { short, full }
}
