import { render } from 'pele'
import { loadMermaid, mermaidSvg } from '../lib/mermaid'
import { $, fmt } from '../lib/dom'
import { GALLERY } from './gallery-data'

const N = 200
// A realistic docs page mixes the common types. Each copy gets its own label so nothing is cached.
const COMMON = ['flowchart', 'sequence', 'class', 'state', 'er', 'pie', 'gantt', 'gitGraph', 'mindmap', 'journey']
const POOL = GALLERY.filter(g => COMMON.includes(g.type))
const sourceFor = (i: number) => { const g = POOL[i % POOL.length]!; return `${g.src}\n%% diagram ${i + 1}` }

export function mountDocsPage(root: HTMLElement) {
  const go = $<HTMLButtonElement>(root, '#dp-go')
  const stop = $<HTMLButtonElement>(root, '#dp-stop')
  const out = { pele: $<HTMLElement>(root, '#dp-pele'), mm: $<HTMLElement>(root, '#dp-mm') }
  const msg = { pele: $<HTMLOutputElement>(root, '#dp-pele-msg'), mm: $<HTMLOutputElement>(root, '#dp-mm-msg') }
  const track = { pele: root.querySelector<HTMLElement>('.track-pele .track-line')!, mm: root.querySelector<HTMLElement>('.track-mm .track-line')! }
  let cancelled = false

  const progress = (k: 'pele' | 'mm', n: number) => { track[k].style.setProperty('--p', `${(n / N) * 100}%`); track[k].parentElement?.querySelector<HTMLElement>('.train')?.style.setProperty('--p', `${(n / N) * 100}%`) }
  const cell = (svg: string, i: number) => { const d = document.createElement('div'); d.setAttribute('role', 'img'); d.setAttribute('aria-label', `Diagram ${i + 1}`); d.innerHTML = svg; return d }

  go.addEventListener('click', async () => {
    cancelled = false
    go.disabled = true; stop.hidden = false
    out.pele.replaceChildren(); out.mm.replaceChildren(); progress('pele', 0); progress('mm', 0)
    msg.mm.textContent = 'downloading Mermaid.js…'
    await loadMermaid() // both start from the platform with their code loaded
    msg.pele.textContent = 'departing…'; msg.mm.textContent = 'departing…'
    await new Promise(r => requestAnimationFrame(() => r(null)))

    // Pele: synchronous, one after another, then painted together.
    const t0 = performance.now()
    const frag = document.createDocumentFragment()
    for (let i = 0; i < N; i++) frag.append(cell(render(sourceFor(i), { maxWidth: 140 }).svg, i))
    const peleMs = performance.now() - t0
    out.pele.append(frag); progress('pele', N)
    msg.pele.textContent = `arrived: all ${N} diagrams in ${fmt(peleMs)}`

    // Mermaid.js: async, one at a time, as a page would.
    const t1 = performance.now()
    let done = 0
    for (let i = 0; i < N && !cancelled; i++) {
      const svg = await mermaidSvg(sourceFor(i))
      if (svg) out.mm.append(cell(svg, i))
      done = i + 1; progress('mm', done)
      msg.mm.textContent = `diagram ${done} of ${N} · ${fmt(performance.now() - t1)}`
    }
    msg.mm.textContent = cancelled ? `stopped at ${done} of ${N} after ${fmt(performance.now() - t1)}` : `arrived: all ${N} diagrams in ${fmt(performance.now() - t1)}`
    go.disabled = false; stop.hidden = true
    go.innerHTML = '<span aria-hidden="true">↻</span> Run it again'
  })
  stop.addEventListener('click', () => { cancelled = true })
}
