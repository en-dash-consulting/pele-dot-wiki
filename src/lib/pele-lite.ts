// The demos that only need a few diagram types use pele/core, which keeps the page small.
// (Gallery, docs-page and safety pages import the full 'pele' entry.)
import { register } from 'pele/core'
import flowchart from 'pele/diagrams/flowchart'
import sequence from 'pele/diagrams/sequence'
import state from 'pele/diagrams/state'
import pie from 'pele/diagrams/pie'

register(flowchart, sequence, state, pie)
export { render, mount, supports, PeleError } from 'pele/core'
export type { Mounted } from 'pele/core'
