import { mount } from '../lib/pele-lite'
import { mermaidSvg } from '../lib/mermaid'
import { $, reduceMotion } from '../lib/dom'

const SRC = `flowchart LR
  Order([Order placed]) --> Pay[Take payment]
  Pay --> Pick[Pick items]
  Pick --> Pack[Pack box]
  Pack --> Label[Print label]
  Label --> Ship[Hand to courier]
  Ship --> Track{Delivered?}
  Track -- yes --> Review[Ask for review]
  Track -- no --> Chase[Chase courier]`

const MIN = 220

/** Smallest on-screen text size in CSS pixels, after the SVG is scaled to fit. */
function smallestText(screen: HTMLElement): number | null {
  const svg = screen.querySelector('svg')
  if (!svg) return null
  let min = Infinity
  for (const el of svg.querySelectorAll<SVGGraphicsElement | HTMLElement>('text, foreignObject span, foreignObject div, foreignObject p')) {
    if (!el.textContent?.trim()) continue
    const r = el.getBoundingClientRect()
    if (r.height <= 0) continue
    const fs = parseFloat(getComputedStyle(el).fontSize)
    const vb = svg.viewBox.baseVal
    const scale = vb && vb.width ? svg.getBoundingClientRect().width / vb.width : 1
    min = Math.min(min, fs * scale)
  }
  return Number.isFinite(min) ? min : null
}

export function mountPhone(root: HTMLElement) {
  const phones = $<HTMLElement>(root, '#ph-phones')
  const pele = $<HTMLElement>(root, '#ph-pele')
  const mm = $<HTMLElement>(root, '#ph-mm')
  const wOut = $<HTMLOutputElement>(root, '#ph-w')
  const mode = $<HTMLElement>(root, '#ph-mode')
  const handles = [...root.querySelectorAll<HTMLElement>('[data-handle]')]
  const read = { pele: $<HTMLOutputElement>(root, '#ph-pele-px'), mm: $<HTMLOutputElement>(root, '#ph-mm-px') }
  let width = 390
  let raf = 0

  const maxW = () => Math.max(MIN, Math.min(900, (phones.querySelector('.phone-col')?.clientWidth ?? 900) - 48))
  const m = mount(pele, SRC, { zoom: false, directionBreakpoint: 360, onRender: r => { mode.textContent = r.width < r.height ? '· Pele turned the flow to run top-to-bottom' : '· Pele keeps it left-to-right'; queueRead() } })
  void m
  void mermaidSvg(SRC).then(svg => { if (svg) { mm.innerHTML = svg; queueRead() } })

  function queueRead() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      for (const k of ['pele', 'mm'] as const) {
        const px = smallestText(k === 'pele' ? pele : mm)
        read[k].textContent = px === null ? '–' : `${px.toFixed(px < 10 ? 1 : 0)} px`
        read[k].classList.toggle('bad-text', px !== null && px < 10)
      }
    })
  }
  function setWidth(w: number) {
    width = Math.round(Math.max(MIN, Math.min(maxW(), w)))
    phones.style.setProperty('--w', `${width}px`)
    wOut.textContent = `${width} px`
    for (const h of handles) { h.setAttribute('aria-valuenow', String(width)); h.setAttribute('aria-valuemax', String(maxW())); h.setAttribute('aria-valuetext', `${width} pixels wide`) }
    queueRead()
  }

  for (const h of handles) {
    let startX = 0, startW = 0
    h.addEventListener('pointerdown', e => { h.setPointerCapture(e.pointerId); startX = e.clientX; startW = width; h.classList.add('dragging'); phones.classList.remove('nudge'); e.preventDefault() })
    h.addEventListener('pointermove', e => { if (h.hasPointerCapture(e.pointerId)) setWidth(startW + (e.clientX - startX)) })
    const end = (e: PointerEvent) => { if (h.hasPointerCapture(e.pointerId)) h.releasePointerCapture(e.pointerId); h.classList.remove('dragging') }
    h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end)
    h.addEventListener('keydown', e => {
      const step = e.shiftKey ? 50 : 10
      const map: Record<string, number> = { ArrowLeft: width - step, ArrowDown: width - step, ArrowRight: width + step, ArrowUp: width + step, Home: MIN, End: maxW(), PageDown: width - 100, PageUp: width + 100 }
      const next = map[e.key]
      if (next !== undefined) { e.preventDefault(); setWidth(next) }
    })
  }
  new ResizeObserver(() => setWidth(width)).observe(phones)

  // Show, once, that the frame moves: a short squeeze when the demo first scrolls into view.
  if (!reduceMotion()) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); phones.classList.add('nudge'); window.setTimeout(() => phones.classList.remove('nudge'), 1700) } }, { threshold: .4 })
    io.observe(phones)
  }
  setWidth(390)
  return { setWidth, get width() { return width } }
}
