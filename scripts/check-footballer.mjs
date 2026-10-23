#!/usr/bin/env node
// Checks the footballer wiki's data: the Graview document compiles, the seed loads into a store,
// every record has a source, every edge joins records that exist, and ids are URL-safe slugs.
// Run: node scripts/check-footballer.mjs
import { readFileSync, existsSync } from 'node:fs'
import { compileDocument } from '@graview/core/check'
import { Store } from '@graview/core'

const doc = JSON.parse(readFileSync(new URL('../src/footballer/data/app.json', import.meta.url), 'utf8'))
const seed = JSON.parse(readFileSync(new URL('../src/footballer/data/seed.json', import.meta.url), 'utf8'))
const problems = []
const c = compileDocument(doc)
if (!c.ok) { console.error(c.findings); process.exit(1) }
const ids = new Set()
for (const n of seed.nodes) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n.id)) problems.push(`${n.id}: id must be a lowercase slug`)
  if (ids.has(n.id)) problems.push(`${n.id}: duplicate id`)
  ids.add(n.id)
  if (!doc.kinds[n.kind]) problems.push(`${n.id}: unknown kind ${n.kind}`)
  else {
    if (!n.source) problems.push(`${n.id}: no source`)
    const fields = doc.kinds[n.kind].fields
    for (const [k, v] of Object.entries(n)) {
      if (k === 'id' || k === 'kind') continue
      const f = fields[k]
      if (!f) { problems.push(`${n.id}: ${n.kind} has no field ${k}`); continue }
      const bad = f.type === 'enum' ? !f.options.includes(v)
        : f.type === 'integer' ? !Number.isInteger(v) || (f.min != null && v < f.min) || (f.max != null && v > f.max)
        : f.type === 'date' ? !/^\d{4}-\d{2}-\d{2}$/.test(v)
        : f.type === 'boolean' ? typeof v !== 'boolean'
        : f.type === 'url' ? !/^https:\/\//.test(v)
        : typeof v !== 'string'
      if (bad) problems.push(`${n.id}.${k}: ${JSON.stringify(v)} is not a valid ${f.type}${f.options ? ' (' + f.options.join(', ') + ')' : ''}`)
    }
    for (const [k, f] of Object.entries(fields)) if (f.required && n[k] == null) problems.push(`${n.id}: ${k} is required`)
    if (n.photo && !existsSync(new URL('../public' + n.photo, import.meta.url))) problems.push(`${n.id}: photo ${n.photo} is not in public/`)
    if (n.photo && !n.photoCredit) problems.push(`${n.id}: photo has no credit`)
  }
}
for (const e of seed.edges) {
  if (!ids.has(e.from) || !ids.has(e.to)) problems.push(`edge ${e.id ?? ''} ${e.kind}: ${e.from} → ${e.to} names a missing record`)
  const from = seed.nodes.find(n => n.id === e.from), decl = from && doc.kinds[from.kind]?.edges?.[e.kind]
  if (from && !decl) problems.push(`edge ${e.kind} is not declared on ${from.kind}`)
  const to = seed.nodes.find(n => n.id === e.to)
  if (decl && to && !decl.to.includes(to.kind)) problems.push(`edge ${e.kind} from ${from.kind} cannot point at a ${to.kind} (${e.to})`)
}
let store
try { store = new Store({ schema: c.app.schema, mutations: c.app.mutations ?? [], invariants: c.app.invariants ?? [], snapshot: seed }) } catch (err) { problems.push(`store refused the seed: ${err.message}`) }
const counts = {}
for (const n of seed.nodes) counts[n.kind] = (counts[n.kind] ?? 0) + 1
console.log('records:', counts, 'edges:', seed.edges.length, store ? '· store loaded' : '')
if (problems.length) { console.error(problems.join('\n')); process.exit(1) }
console.log('✓ footballer data checks clean')
