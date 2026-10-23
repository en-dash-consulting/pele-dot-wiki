// The wiki's one model of the graph: every page, the build-time render and the scene's links read it.
// It is made from a store snapshot, so the browser and the build draw the same words from the same data.
import doc from './data/app.json'

export const BASE = '/footballer'
export const SITE = 'https://pele.wiki'

export type Kind = keyof typeof doc.kinds
type FieldDecl = { type: string; label?: string; options?: string[]; format?: string; description?: string }
type EdgeDecl = { to: string[]; cardinality?: string; description?: string; inverse?: string }
type KindDecl = { noun: string; plural: string; description: string; fields: Record<string, FieldDecl>; edges?: Record<string, EdgeDecl> }
export const KINDS = doc.kinds as unknown as Record<Kind, KindDecl>
export const ORDER = doc.pages.order as Kind[]

export interface Rec {
  readonly id: string
  readonly kind: Kind
  readonly name: string
  readonly headline?: string
  readonly story?: string
  readonly source?: string
  readonly photo?: string
  readonly photoCredit?: string
  readonly [field: string]: unknown
}
export interface Edge { readonly id?: string; readonly kind: string; readonly from: string; readonly to: string }
export interface Snapshot { readonly nodes: readonly Record<string, unknown>[]; readonly edges: readonly Edge[] }

/** A record's links, grouped by relation and said in the declaration's own words. */
export interface LinkGroup { readonly edge: string; readonly words: string; readonly out: boolean; readonly records: readonly Rec[] }

// The routed face's slugs (`pluralSlug` in @graview/pages): the plural, lowercased, spaces as hyphens.
export const slugOf = (kind: Kind) => KINDS[kind].plural.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const kindHref = (kind: Kind) => `${BASE}/${slugOf(kind)}`
export const recordHref = (r: Pick<Rec, 'kind' | 'id'>) => `${kindHref(r.kind)}/${encodeURIComponent(r.id)}`
export const sceneHref = (id?: string) => `${BASE}/places/overview${id ? `#focus=${encodeURIComponent(id)}` : ''}`

export interface Wiki {
  readonly all: readonly Rec[]
  get(id: string): Rec | undefined
  of(kind: Kind): readonly Rec[]
  links(id: string): readonly LinkGroup[]
  out(id: string, edge: string): readonly Rec[]
  in(id: string, edge: string): readonly Rec[]
  readonly pele: Rec | undefined
}

const byDate = (a: Rec, b: Rec) => String(a.date ?? a.began ?? a.year ?? '').localeCompare(String(b.date ?? b.began ?? b.year ?? ''))
const SORT: Partial<Record<Kind, (a: Rec, b: Rec) => number>> = {
  chapter: (a, b) => Number(a.order ?? 99) - Number(b.order ?? 99),
  question: (a, b) => Number(a.order ?? 99) - Number(b.order ?? 99),
  tournament: (a, b) => Number(a.year) - Number(b.year) || a.name.localeCompare(b.name),
  match: byDate, goal: byDate, work: byDate,
  honour: (a, b) => Number(a.year ?? 0) - Number(b.year ?? 0) || a.name.localeCompare(b.name),
}

export function readWiki(snap: Snapshot): Wiki {
  const all = snap.nodes.map(n => n as unknown as Rec).filter(n => n.kind in KINDS)
  const byId = new Map(all.map(n => [n.id, n]))
  const byKind = new Map<Kind, Rec[]>()
  for (const k of ORDER) byKind.set(k, all.filter(n => n.kind === k).sort(SORT[k] ?? ((a, b) => a.name.localeCompare(b.name))))
  const outs = new Map<string, Edge[]>(), ins = new Map<string, Edge[]>()
  for (const e of snap.edges) {
    if (!byId.has(e.from) || !byId.has(e.to)) continue
    outs.set(e.from, [...(outs.get(e.from) ?? []), e]); ins.set(e.to, [...(ins.get(e.to) ?? []), e])
  }
  const sortRecs = (rs: Rec[]) => rs.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (SORT[a.kind] ?? (() => 0))(a, b))
  const wiki: Wiki = {
    all,
    get: id => byId.get(id),
    of: kind => byKind.get(kind) ?? [],
    out: (id, edge) => sortRecs((outs.get(id) ?? []).filter(e => e.kind === edge).map(e => byId.get(e.to)!)),
    in: (id, edge) => sortRecs((ins.get(id) ?? []).filter(e => e.kind === edge).map(e => byId.get(e.from)!)),
    links(id) {
      const me = byId.get(id)
      if (!me) return []
      const groups: LinkGroup[] = []
      for (const [edge, decl] of Object.entries(KINDS[me.kind].edges ?? {})) {
        const records = wiki.out(id, edge)
        if (records.length) groups.push({ edge, words: decl.description ?? edge, out: true, records })
      }
      const incoming = new Map<string, Rec[]>()
      for (const e of ins.get(id) ?? []) {
        const from = byId.get(e.from)!
        const key = `${from.kind}.${e.kind}`
        incoming.set(key, [...(incoming.get(key) ?? []), from])
      }
      for (const [key, records] of incoming) {
        const [kind, edge] = key.split('.') as [Kind, string]
        groups.push({ edge, words: KINDS[kind].edges?.[edge]?.inverse ?? edge, out: false, records: sortRecs(records) })
      }
      return groups
    },
    get pele() { return byId.get('pele') },
  }
  return wiki
}

// What a record says about itself in a sentence, for meta descriptions and answer engines.
export function summaryOf(r: Rec): string {
  const s = r.headline ?? (typeof r.answer === 'string' ? r.answer : '') ?? ''
  const text = s || plain(r.story ?? '').slice(0, 200)
  return text.length > 158 ? text.slice(0, 155).replace(/\s+\S*$/, '') + '…' : text
}
export const plain = (md: string) => md.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim()

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export function sayDate(iso: unknown): string {
  const m = typeof iso === 'string' ? iso.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : String(iso ?? '')
}
export const yearOf = (iso: unknown) => typeof iso === 'string' ? iso.slice(0, 4) : ''

/** A field's value as a reader reads it. */
export function sayField(kind: Kind, field: string, v: unknown): string {
  const f = KINDS[kind].fields[field]
  if (v == null || v === '') return ''
  if (f?.type === 'date') return sayDate(v)
  if (f?.type === 'integer' && field !== 'year' && typeof v === 'number') return v.toLocaleString('en-US')
  if (f?.type === 'boolean') return v ? 'Yes' : 'No'
  if (f?.type === 'enum') return String(v).charAt(0).toUpperCase() + String(v).slice(1)
  return String(v)
}
export const labelOf = (kind: Kind, field: string) => KINDS[kind].fields[field]?.label ?? field.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())

// The facts a record's infobox lists, per kind, in the order a reader wants them.
export const INFOBOX: Record<Kind, string[]> = {
  chapter: ['began', 'ended'],
  tournament: ['year', 'result', 'peleApps', 'peleGoals'],
  match: ['date', 'stage', 'result', 'peleGoals', 'attendance'],
  goal: ['date', 'minute', 'how', 'scored'],
  club: ['type', 'country', 'nickname', 'years', 'apps', 'goals'],
  person: ['fullName', 'role', 'born', 'died', 'nationality'],
  honour: ['year', 'category', 'awardedBy'],
  work: ['type', 'year', 'role'],
  place: ['type', 'country'],
  question: [],
}
