// Demos that need only a few diagram types use pele/core: flowchart is registered up front, the rest load
// on demand. (Gallery, docs-page and safety import the full 'pele' entry.)
import { register } from 'pele/core'
import flowchart from 'pele/diagrams/flowchart'

register(flowchart)

type Extra = 'sequence' | 'state' | 'pie'
const loaders: Record<Extra, () => Promise<{ default: Parameters<typeof register>[0] }>> = {
  sequence: () => import('pele/diagrams/sequence'),
  state: () => import('pele/diagrams/state'),
  pie: () => import('pele/diagrams/pie'),
}
const loaded = new Map<Extra, Promise<void>>()
const ready = new Set<Extra>()

/** Loads and registers extra diagram types (once each). */
export function ensure(...types: Extra[]): Promise<void> {
  return Promise.all(types.map(t => {
    let p = loaded.get(t)
    if (!p) { p = loaders[t]().then(m => { register(m.default); ready.add(t) }); loaded.set(t, p) }
    return p
  })).then(() => undefined)
}
/** The extra type a diagram needs, if any, from its first keyword. */
export function needs(text: string): Extra | null {
  const m = /^\s*(?:%%[^\n]*\n\s*)*(sequenceDiagram|stateDiagram(?:-v2)?|pie)\b/.exec(text)
  if (!m) return null
  return m[1] === 'sequenceDiagram' ? 'sequence' : m[1] === 'pie' ? 'pie' : 'state'
}
export const isLoaded = (t: Extra) => ready.has(t)

export { render, mount, supports, PeleError } from 'pele/core'
export type { Mounted } from 'pele/core'
