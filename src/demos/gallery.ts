import { render } from 'pele'
import { mermaidSvg } from '../lib/mermaid'
import { $, esc, fmt } from '../lib/dom'
import { GALLERY } from './gallery-data'

export function mountGallery(root: HTMLElement) {
  const grid = $<HTMLElement>(root, '#gl-grid')
  const total = $<HTMLElement>(root, '#gl-total')
  const filter = $<HTMLInputElement>(root, '#gl-filter')
  let ms = 0

  for (const g of GALLERY) {
    const card = document.createElement('figure')
    card.className = 'gl-card'; card.id = `type-${g.type}`; card.dataset.search = `${g.name} ${g.key} ${g.type}`.toLowerCase()
    card.innerHTML = `<figcaption><h3>${esc(g.name)}</h3><code class="gl-key">${esc(g.key)}</code></figcaption>
      <div class="gl-canvas" role="img" aria-label="${esc(g.name)} diagram drawn by Pele"></div>
      <div class="gl-actions"><button type="button" class="button secondary" data-act="edit" aria-expanded="false">Edit the text</button><button type="button" class="button secondary" data-act="mm" aria-expanded="false">Compare with Mermaid.js</button></div>
      <div class="gl-edit" hidden><label class="visually-hidden" for="src-${g.type}">${esc(g.name)} source</label><textarea id="src-${g.type}" wrap="off" spellcheck="false">${esc(g.src)}</textarea></div>
      <div class="gl-mm" hidden><p class="gl-mm-label">Mermaid.js 12.1.0</p><div class="gl-mm-out" role="img" aria-label="${esc(g.name)} diagram drawn by Mermaid.js"></div></div>`
    grid.append(card)
    const canvas = $<HTMLElement>(card, '.gl-canvas')
    const draw = (text: string) => {
      const t0 = performance.now()
      try { canvas.innerHTML = render(text, { maxWidth: canvas.clientWidth || 320 }).svg; canvas.classList.remove('stale') } catch { canvas.classList.add('stale') }
      return performance.now() - t0
    }
    ms += draw(g.src)
    const ta = $<HTMLTextAreaElement>(card, 'textarea')
    ta.addEventListener('input', () => draw(ta.value))
    card.addEventListener('click', async e => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-act]')
      if (!btn) return
      const open = btn.getAttribute('aria-expanded') !== 'true'
      btn.setAttribute('aria-expanded', String(open))
      const panel = $<HTMLElement>(card, btn.dataset.act === 'edit' ? '.gl-edit' : '.gl-mm')
      panel.hidden = !open
      if (btn.dataset.act === 'edit' && open) ta.focus()
      if (btn.dataset.act === 'mm' && open) {
        const out = $<HTMLElement>(card, '.gl-mm-out')
        out.textContent = 'Downloading and drawing with Mermaid.js…'
        const svg = await mermaidSvg(ta.value)
        if (svg) out.innerHTML = svg
        else out.textContent = 'Mermaid.js could not draw this one.'
      }
    })
  }
  total.textContent = `All ${GALLERY.length} diagram types below were drawn by Pele in ${fmt(ms)}, in your browser, as this page loaded.`
  filter.addEventListener('input', () => {
    const q = filter.value.trim().toLowerCase()
    let shown = 0
    for (const c of grid.querySelectorAll<HTMLElement>('.gl-card')) { const hit = !q || (c.dataset.search ?? '').includes(q); c.hidden = !hit; if (hit) shown++ }
    total.textContent = q ? `${shown} of ${GALLERY.length} types match “${filter.value.trim()}”.` : `All ${GALLERY.length} diagram types, drawn by Pele.`
  })
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
}
