// The wiki's own pages, drawn from the one model (model.ts). They render twice: at build time to static
// HTML (ssr.tsx, so every URL is a real page for readers without JS and for search and answer engines)
// and in the browser as Graview's routed face (main.tsx), where links move without reloading.
import { createContext, useContext, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { markdownHtml } from '@graview/core/markdown'
import { BASE, INFOBOX, KINDS, ORDER, kindHref, labelOf, recordHref, sayDate, sayField, sceneHref, yearOf, type Kind, type Rec, type Wiki } from './model'

/** Set inside Graview's router: moves to a basename-relative path. Absent at build time, where links are plain. */
export const Navigate = createContext<((to: string) => void) | null>(null)

export function Go({ to, children, className, ...rest }: { to: string; children: ReactNode; className?: string; 'aria-current'?: 'page'; 'aria-label'?: string }) {
  const nav = useContext(Navigate)
  const inside = to.startsWith(BASE + '/') && !to.startsWith(BASE + '/places/')
  const click = nav && inside ? (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault(); nav(to.slice(BASE.length)); window.scrollTo(0, 0)
  } : undefined
  return <a href={to} className={className} onClick={click} {...rest}>{children}</a>
}

const Md = ({ text, className }: { text: string; className?: string }) => <div className={className ?? 'fw-prose'} dangerouslySetInnerHTML={{ __html: markdownHtml(text) }} />
const noun = (k: Kind) => KINDS[k].noun.charAt(0).toUpperCase() + KINDS[k].noun.slice(1)
const Plural = (k: Kind) => KINDS[k].plural.charAt(0).toUpperCase() + KINDS[k].plural.slice(1)
const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }

// ——— Shell ———

export const NAV: Kind[] = ['chapter', 'tournament', 'match', 'goal', 'person', 'honour', 'question']
const NAV_WORDS: Partial<Record<Kind, string>> = { chapter: 'Story', tournament: 'World Cups', question: 'FAQ' }

/** The shell around every page. `live` is the Graview face, whose app bar sits above it; built pages draw a bar of their own.
 *  The page's <main> is the host's (footballer/index.html): the embed is a named region, and a main may not sit inside one. */
export function Shell({ children, live, here }: { children: ReactNode; live?: boolean; here?: Kind | 'home' }) {
  return (
    <div className="fw">
      {live ? null : (
        <nav className="fw-bar" aria-label="Wiki">
          <Go to={`${BASE}/`} className="fw-bar-name">Pelé</Go>
          <ul>{NAV.map(k => <li key={k}><Go to={kindHref(k)} aria-current={here === k ? 'page' : undefined}>{NAV_WORDS[k] ?? Plural(k)}</Go></li>)}</ul>
          <a className="fw-bar-scene" href={sceneHref()}>Scene</a>
        </nav>
      )}
      <div className="fw-main">{children}</div>
      <footer className="fw-foot">
        <p><strong>pele.wiki/footballer</strong> is an independent, unofficial wiki by <a href="https://endash.us">En Dash Consulting</a>. It is not affiliated with or endorsed by Pelé's family, estate or business. Every record links to its source; photos are public domain or Creative Commons, credited where they appear.</p>
        <p>Built with <a href="https://graview.dev">Graview</a> and <a href="https://github.com/en-dash-consulting/n-dx">n-dx</a>: open <a href={sceneHref()}>the scene</a> to walk the same data as a city. <a href="/footballer/llms.txt">llms.txt</a> · <a href="/sitemap-footballer.xml">sitemap</a> · <a href="/">which Pelé?</a></p>
      </footer>
    </div>
  )
}

// ——— Pieces ———

// Each kind of card borrows the object a fan kept from it: a match is a ticket stub, a goal is the
// scoreboard at that minute, a team is the pennant on the bedroom wall.
function Card({ r, wiki, big }: { r: Rec; wiki: Wiki; big?: boolean }) {
  if (r.kind === 'match') return <Ticket r={r} wiki={wiki} />
  if (r.kind === 'goal') return <Scoreboard r={r} wiki={wiki} />
  if (r.kind === 'club' && big) return <Pennant r={r} />
  return (
    <Go to={recordHref(r)} className={`fw-card fw-k-${r.kind}${big ? ' fw-card-big' : ''}`}>
      <span className="fw-card-kicker">{kicker(r, wiki)}</span>
      <span className="fw-card-title">{r.name}</span>
      {r.headline ? <span className="fw-card-text">{r.headline}</span> : null}
    </Go>
  )
}
function Ticket({ r, wiki }: { r: Rec; wiki: Wiki }) {
  const at = wiki.out(r.id, 'playedAt')[0], of = wiki.out(r.id, 'partOf')[0]
  const [day, month, year] = sayDate(r.date).split(' ')
  return (
    <Go to={recordHref(r)} className="fw-ticket">
      <span className="fw-ticket-main">
        <span className="fw-ticket-event">{[of?.name, r.stage].filter(Boolean).join(' · ') || 'Match'}</span>
        <span className="fw-ticket-title">{r.name}</span>
        {at ? <span className="fw-ticket-venue">{at.name}</span> : null}
        {r.result ? <span className={`fw-stamp fw-stamp-${r.result}`}>{String(r.result)}</span> : null}
      </span>
      <span className="fw-ticket-stub" aria-label={sayDate(r.date)}><span className="fw-ticket-day">{day}</span><span>{month?.slice(0, 3)}</span><span>{year}</span></span>
    </Go>
  )
}
function Scoreboard({ r, wiki }: { r: Rec; wiki: Wiki }) {
  const match = wiki.out(r.id, 'scoredIn')[0]
  const missed = r.scored === false
  return (
    <Go to={recordHref(r)} className={`fw-goal${missed ? ' fw-goal-missed' : ''}`}>
      <span className="fw-board">
        {r.minute ? <span className="fw-board-min">{String(r.minute)}′</span> : <span className="fw-board-min fw-board-year">{yearOf(r.date)}</span>}
        <span className="fw-board-match">{match?.name ?? yearOf(r.date)}<span>{sayDate(r.date)}</span></span>
        {missed ? <span className="fw-board-no">No goal</span> : null}
      </span>
      <span className="fw-goal-body">
        <span className="fw-card-title">{r.name}</span>
        {r.headline ? <span className="fw-card-text">{r.headline}</span> : null}
      </span>
    </Go>
  )
}
// The colours each of his teams wore, for the pennants. Teams not listed fly the wiki's own green and gold.
const KIT: Record<string, [string, string]> = { santos: ['#f4f4f0', '#111111'], brazil: ['#ffd21f', '#00843d'], cosmos: ['#00703c', '#ffd21f'] }
function Pennant({ r }: { r: Rec }) {
  const [field, trim] = KIT[r.id] ?? ['#053d22', '#ffd21f']
  return (
    <Go to={recordHref(r)} className="fw-pennant">
      <span className="fw-pennant-flag" style={{ '--fw-field': field, '--fw-trim': trim } as CSSProperties} aria-hidden="true"><span>{r.name}</span></span>
      <span className="fw-pennant-name">{r.name}</span>
      <span className="fw-pennant-years">{String(r.years ?? '')}</span>
      {r.goals != null ? <span className="fw-pennant-stat"><b>{Number(r.goals).toLocaleString('en-US')}</b> goals{r.apps != null ? ` in ${Number(r.apps).toLocaleString('en-US')} matches` : ''}</span> : null}
    </Go>
  )
}
function kicker(r: Rec, wiki: Wiki): string {
  switch (r.kind) {
    case 'match': return [sayDate(r.date), r.stage].filter(Boolean).join(' · ')
    case 'goal': return [r.scored === false ? 'Not a goal' : null, sayDate(r.date), r.minute ? `${r.minute}′` : null].filter(Boolean).join(' · ')
    case 'tournament': return [r.year, r.result].filter(Boolean).join(' · ')
    case 'chapter': return years(r)
    case 'honour': return [r.year, r.category].filter(Boolean).join(' · ')
    case 'person': return String(r.role ?? '')
    case 'club': return [r.type, r.years].filter(Boolean).join(' · ')
    case 'work': return [r.type, r.year].filter(Boolean).join(' · ')
    case 'place': { const w = wiki.out(r.id, 'within')[0]; return [r.type, w?.name].filter(Boolean).join(' · ') }
    default: return noun(r.kind)
  }
}
const years = (r: Rec) => [...new Set([yearOf(r.began), yearOf(r.ended)].filter(Boolean))].join('–')
const Row = ({ r, wiki }: { r: Rec; wiki: Wiki }) => (
  <li className={`fw-row fw-k-${r.kind}`}><Go to={recordHref(r)}><span className="fw-row-title">{r.name}</span><span className="fw-row-kicker">{kicker(r, wiki)}</span></Go></li>
)

function Section({ id, title, more, children }: { id: string; title: string; more?: { to: string; label: string }; children: ReactNode }) {
  return (
    <section className="fw-section" aria-labelledby={id}>
      <div className="fw-section-head"><h2 id={id}>{title}</h2>{more ? <Go to={more.to} className="fw-more">{more.label} →</Go> : null}</div>
      {children}
    </section>
  )
}

const Photo = ({ r, className }: { r: Rec; className?: string }) => r.photo ? (
  <figure className={className ?? 'fw-photo'}>
    <img src={r.photo} alt={`${r.name}${r.kind === 'chapter' ? '' : ''}`} loading="lazy" decoding="async" />
    {r.photoCredit ? <figcaption>Photo: {creditText(r.photoCredit)}</figcaption> : null}
  </figure>
) : null
function creditText(credit: string): ReactNode {
  const m = credit.match(/^(.*?)(https?:\/\/\S+)\s*$/)
  return m ? <>{(m[1] ?? '').replace(/[:,]\s*$/, '')} (<a href={m[2]}>source</a>)</> : credit
}

// ——— Home ———

export function Home({ wiki }: { wiki: Wiki }) {
  const pele = wiki.pele
  const brazil = wiki.get('brazil'), santos = wiki.get('santos'), cosmos = wiki.get('cosmos')
  const wins = wiki.of('honour').filter(h => h.category === 'world cup').length
  const worldCups = wiki.of('tournament').filter(t => /world cup/i.test(t.name))
  const stats = [
    wins ? { n: String(wins), label: 'World Cups won', note: 'the only player with three' } : null,
    brazil?.goals != null ? { n: String(brazil.goals), label: 'goals for Brazil', note: brazil.apps ? `in ${brazil.apps} matches` : '' } : null,
    santos?.goals != null ? { n: Number(santos.goals).toLocaleString('en-US'), label: 'goals for Santos', note: String(santos.years ?? '') } : null,
    cosmos?.goals != null ? { n: String(cosmos.goals), label: 'goals for the Cosmos', note: String(cosmos.years ?? '') } : null,
  ].filter(Boolean) as { n: string; label: string; note: string }[]
  const goalsQ = wiki.of('question').find(q => /how many goals/i.test(q.name))
  return (
    <>
      <header className="fw-hero">
        <div className="fw-hero-copy">
          <p className="fw-kicker">The wiki · 1940–2022</p>
          <h1 className="fw-hero-name">Pelé</h1>
          <p className="fw-hero-full">{String(pele?.fullName ?? 'Edson Arantes do Nascimento')} · <span lang="pt">O Rei</span></p>
          {pele?.headline ? <p className="fw-hero-lede">{pele.headline}</p> : null}
          <p className="fw-hero-cta"><Go to={pele ? recordHref(pele) : `${BASE}/people/pele`} className="fw-button">Read his life</Go> <Go to={kindHref('chapter')} className="fw-button fw-button-quiet">The story in chapters</Go></p>
        </div>
        {pele?.photo ? <Photo r={pele} className="fw-hero-photo" /> : <div className="fw-hero-ten" aria-hidden="true">10</div>}
      </header>
      {stats.length ? (
        <dl className="fw-stats">
          {stats.map(s => <div key={s.label}><dt>{s.label}</dt><dd><span className="fw-stat-n">{s.n}</span>{s.note ? <span className="fw-stat-note">{s.note}</span> : null}</dd></div>)}
        </dl>
      ) : null}
      {goalsQ ? <p className="fw-disputed fw-note"><span className="fw-yellow" aria-hidden="true" /><strong>How many goals did he score?</strong> {firstSentences(String(goalsQ.answer), 2)} <Go to={recordHref(goalsQ)}>The full answer</Go></p> : null}

      <Section id="story" title="His life, in chapters" more={{ to: kindHref('chapter'), label: 'Every chapter' }}>
        <ol className="fw-story">
          {wiki.of('chapter').map((c, i) => (
            <li key={c.id}><Go to={recordHref(c)}><span className="fw-story-n">{i + 1}</span><span className="fw-story-years">{years(c)}</span><span className="fw-story-name">{c.name}</span>{c.headline ? <span className="fw-story-text">{c.headline}</span> : null}</Go></li>
          ))}
        </ol>
      </Section>

      <Section id="world-cups" title="Four World Cups" more={{ to: kindHref('tournament'), label: 'Every tournament' }}>
        <div className="fw-cups">
          {worldCups.map(t => (
            <Go key={t.id} to={recordHref(t)} className={`fw-cup${t.result === 'champions' ? ' fw-cup-won' : ''}`}>
              <span className="fw-cup-year">{String(t.year)}</span>
              <span className="fw-cup-host">{wiki.out(t.id, 'hostedIn').map(p => p.name).join(', ')}</span>
              <span className="fw-cup-result">{t.result === 'champions' ? '★ Champions' : sayField('tournament', 'result', t.result)}</span>
              <span className="fw-cup-goals">{t.peleGoals != null ? `${t.peleGoals} ${t.peleGoals === 1 ? 'goal' : 'goals'}` : ''}{t.peleApps != null ? ` in ${t.peleApps} ${t.peleApps === 1 ? 'match' : 'matches'}` : ''}</span>
            </Go>
          ))}
        </div>
      </Section>

      <Section id="matches" title="Matches that mattered" more={{ to: kindHref('match'), label: 'Every match' }}>
        <div className="fw-grid">{wiki.of('match').filter(m => /final/i.test(String(m.stage)) || Number(m.peleGoals) >= 2).slice(0, 6).map(m => <Card key={m.id} r={m} wiki={wiki} />)}</div>
      </Section>

      <Section id="goals" title="The goals, and the ones that got away" more={{ to: kindHref('goal'), label: 'Every goal' }}>
        <div className="fw-grid">{wiki.of('goal').map(g => <Card key={g.id} r={g} wiki={wiki} />)}</div>
      </Section>

      <Section id="honours" title="The trophy cabinet" more={{ to: kindHref('honour'), label: 'Every honour' }}>
        <Cabinet honours={wiki.of('honour')} shelves={['world cup', 'individual award']} limit={6} />
      </Section>

      <Section id="people" title="The people around him" more={{ to: kindHref('person'), label: 'Everyone' }}>
        <ul className="fw-rows fw-rows-wide fw-rows-3">{wiki.of('person').filter(p => p.id !== 'pele').slice(0, 15).map(p => <Row key={p.id} r={p} wiki={wiki} />)}</ul>
      </Section>

      <Section id="teams" title="His teams" more={{ to: kindHref('club'), label: 'Every team' }}>
        <div className="fw-pennants">{wiki.of('club').filter(c => c.years).sort((a, b) => String(a.years).localeCompare(String(b.years))).map(c => <Card key={c.id} r={c} wiki={wiki} big />)}</div>
      </Section>

      <Section id="faq" title="Questions people ask" more={{ to: kindHref('question'), label: 'Every question' }}>
        <div className="fw-faq">{wiki.of('question').slice(0, 8).map(q => <Answer key={q.id} q={q} />)}</div>
      </Section>

      <Section id="on-screen" title="On screen and in print" more={{ to: kindHref('work'), label: 'Every film and book' }}>
        <ul className="fw-rows fw-rows-wide">{wiki.of('work').map(w => <Row key={w.id} r={w} wiki={wiki} />)}</ul>
      </Section>
    </>
  )
}
const firstSentences = (s: string, n: number) => (s.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [s]).slice(0, n).join('').trim()
function Answer({ q, level = 3 }: { q: Rec; level?: 2 | 3 }) {
  const H = level === 2 ? 'h2' : 'h3'
  return <div className="fw-qa"><H><Go to={recordHref(q)}>{q.name}</Go></H><p>{firstSentences(String(q.answer ?? ''), 2)}</p></div>
}

// ——— Lists ———

const SHELVES: [string, string][] = [['world cup', 'World Cups'], ['club trophy', 'Club trophies'], ['individual award', 'Individual awards'], ['recognition', 'Recognition']]
function Cabinet({ honours, shelves, limit }: { honours: readonly Rec[]; shelves?: string[]; limit?: number }) {
  return (
    <>
      {SHELVES.filter(([cat]) => !shelves || shelves.includes(cat)).map(([cat, title]) => {
        const shelf = honours.filter(h => h.category === cat).slice(0, limit)
        return shelf.length ? (
          <section key={cat} className={`fw-shelf fw-shelf-${cat.replace(/\s+/g, '-')}`} aria-label={title}>
            <h2>{title}</h2>
            <ul className="fw-plaques">{shelf.map(h => (
              <li key={h.id} className="fw-plaque"><Go to={recordHref(h)}><span className="fw-plaque-year">{String(h.year ?? '')}</span><span><span className="fw-plaque-name">{h.name.replace(/,\s*\d{4}$/, '')}</span>{h.awardedBy ? <span className="fw-plaque-by">{String(h.awardedBy)}</span> : null}</span></Go></li>
            ))}</ul>
          </section>
        ) : null
      })}
    </>
  )
}

export function KindList({ wiki, kind }: { wiki: Wiki; kind: Kind }) {
  const records = wiki.of(kind)
  return (
    <>
      <nav className="fw-crumbs" aria-label="You are here"><ol><li><Go to={`${BASE}/`}>Pelé</Go></li><li aria-current="page">{Plural(kind)}</li></ol></nav>
      <header className="fw-head"><p className="fw-kicker">{records.length} {records.length === 1 ? KINDS[kind].noun : KINDS[kind].plural}</p><h1>{NAV_WORDS[kind] && kind !== 'question' ? `${NAV_WORDS[kind]}: ${Plural(kind)}` : Plural(kind)}</h1><p className="fw-lede">{KINDS[kind].description}</p></header>
      {kind === 'honour'
        ? <Cabinet honours={records} />
        : kind === 'question'
        ? <div className="fw-faq">{records.map(q => <Answer key={q.id} q={q} level={2} />)}</div>
        : kind === 'chapter' || kind === 'tournament' || kind === 'match' || kind === 'goal'
          ? <div className="fw-grid">{records.map(r => <Card key={r.id} r={r} wiki={wiki} />)}</div>
          : <ul className="fw-rows fw-rows-wide">{records.map(r => <Row key={r.id} r={r} wiki={wiki} />)}</ul>}
      <p className="fw-under"><a href={`${sceneHref()}`}>See every {KINDS[kind].noun} in the scene</a> · <a href={`${BASE}/map`}>How the kinds connect</a></p>
    </>
  )
}

// ——— Record ———

export function RecordPage({ wiki, id }: { wiki: Wiki; id: string }) {
  const r = wiki.get(id)
  if (!r) return <header className="fw-head"><h1>Not in the wiki</h1><p className="fw-lede">Nothing here is called “{id}”. <Go to={`${BASE}/`}>Back to Pelé</Go>.</p></header>
  const facts = INFOBOX[r.kind].map(f => [labelOf(r.kind, f), sayField(r.kind, f, r[f])] as const).filter(([, v]) => v)
  const links = wiki.links(id).filter(g => !(r.kind === 'tournament' && g.edge === 'partOf' && !g.out) && !(g.edge === 'about' && !g.out))
  const matches = r.kind === 'tournament' ? wiki.in(id, 'partOf') : []
  const chapters = r.kind === 'chapter' ? wiki.of('chapter') : []
  const at = chapters.findIndex(c => c.id === id)
  const prev = chapters[at - 1], next = chapters[at + 1]
  const questions = wiki.in(id, 'about')
  return (
    <>
      <nav className="fw-crumbs" aria-label="You are here"><ol><li><Go to={`${BASE}/`}>Pelé</Go></li><li><Go to={kindHref(r.kind)}>{Plural(r.kind)}</Go></li><li aria-current="page">{r.name}</li></ol></nav>
      <article className={`fw-record fw-k-${r.kind}`}>
        <header className="fw-head">
          <p className="fw-kicker">{noun(r.kind)}{kicker(r, wiki) && r.kind !== 'person' ? ` · ${kicker(r, wiki)}` : ''}</p>
          <h1>{r.name}</h1>
          {r.kind === 'question' ? null : r.headline ? <p className="fw-lede">{r.headline}</p> : null}
        </header>
        <div className="fw-record-body">
          <div className="fw-record-main">
            {r.kind === 'question' ? <Md text={String(r.answer ?? '')} className="fw-prose fw-answer" /> : null}
            {r.story ? <Md text={r.story} /> : null}
            {matches.length ? (
              <section className="fw-path" aria-labelledby="path-title">
                <h2 id="path-title">His matches in it</h2>
                <ol>{matches.map(m => <li key={m.id}><Go to={recordHref(m)}><span className="fw-path-stage">{String(m.stage ?? '')}</span><span className="fw-path-name">{m.name}</span><span className="fw-path-date">{sayDate(m.date)}{m.peleGoals ? ` · ${'⚽'.repeat(Math.min(Number(m.peleGoals), 6))}` : ''}</span></Go></li>)}</ol>
              </section>
            ) : null}
            {links.map(g => (
              <section key={`${g.out}-${g.edge}`} className="fw-links" aria-label={cap(g.words)}>
                <h2>{cap(g.words)}</h2>
                {byKind(g.records).length > 1
                  ? byKind(g.records).map(([k, rs]) => <div key={k} className="fw-links-kind"><h3>{rs.length === 1 ? noun(k) : Plural(k)}</h3><ul className={`fw-rows${rs.length > 6 ? ' fw-rows-cols' : ''}`}>{rs.map(x => <Row key={x.id} r={x} wiki={wiki} />)}</ul></div>)
                  : <ul className={`fw-rows${g.records.length > 6 ? ' fw-rows-cols' : ''}`}>{g.records.map(x => <Row key={x.id} r={x} wiki={wiki} />)}</ul>}
              </section>
            ))}
            {questions.length ? (
              <section className="fw-links" aria-labelledby="qs"><h2 id="qs">Questions this answers</h2><div className="fw-faq">{questions.map(q => <Answer key={q.id} q={q} />)}</div></section>
            ) : null}
            {at >= 0 ? (
              <nav className="fw-chapters" aria-label="Chapters">
                {prev ? <Go to={recordHref(prev)}><span>← Chapter {at}</span>{prev.name}</Go> : <span />}
                {next ? <Go to={recordHref(next)}><span>Chapter {at + 2} →</span>{next.name}</Go> : <span />}
              </nav>
            ) : null}
          </div>
          <aside className={`fw-infobox${r.photo ? ' fw-sticker' : ''}`} aria-label={`${noun(r.kind)} facts`}>
            {r.photo ? <div className="fw-sticker-pic"><Photo r={r} /><p className="fw-sticker-name" aria-hidden="true">{r.name}</p></div> : <p className="fw-infobox-head" aria-hidden="true">{noun(r.kind)}</p>}
            {facts.length ? <dl>{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl> : null}
            {r.source ? <p className="fw-source">Source: <a href={r.source}>{host(r.source)}</a></p> : null}
            <p className="fw-scene-link"><a href={sceneHref(r.id)}>See it in the scene</a></p>
          </aside>
        </div>
      </article>
    </>
  )
}
const byKind = (rs: readonly Rec[]) => [...rs.reduce((m, r) => m.set(r.kind, [...(m.get(r.kind) ?? []), r]), new Map<Kind, Rec[]>())]
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export { ORDER }
