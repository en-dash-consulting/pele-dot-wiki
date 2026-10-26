import { render, ensure, needs, isLoaded } from '../lib/pele-lite'
import { loadMermaid, mermaidSvg } from '../lib/mermaid'
import examples from './examples.json'

const EXAMPLES: Record<string, string> = examples
import { $, fmt, Median } from '../lib/dom'
import { idle as whenIdle } from '../lib/when'

export function mountTypeRace(root: HTMLElement) {
  const src = $<HTMLTextAreaElement>(root, '#tr-src')
  const peleOut = $<HTMLDivElement>(root, '#tr-pele')
  const mmOut = $<HTMLDivElement>(root, '#tr-mm')
  const peleMs = $<HTMLOutputElement>(root, '#tr-pele-ms')
  const mmMs = $<HTMLOutputElement>(root, '#tr-mm-ms')
  const lag = $<HTMLParagraphElement>(root, '#tr-mm-lag')
  const verdict = $<HTMLParagraphElement>(root, '#tr-verdict')
  const auto = $<HTMLButtonElement>(root, '#tr-auto')
  const example = $<HTMLSelectElement>(root, '#tr-example')
  const scale = $<HTMLDivElement>(root, '#tr-scale')
  const scalePele = $<HTMLSpanElement>(root, '#tr-scale-pele'), scaleMm = $<HTMLSpanElement>(root, '#tr-scale-mm')
  const scalePeleMs = $<HTMLOutputElement>(root, '#tr-scale-pele-ms'), scaleMmMs = $<HTMLOutputElement>(root, '#tr-scale-mm-ms')

  const stats = { edits: 0, pele: 0, mermaid: 0 }
  const pm = new Median(), mm = new Median()
  let ready = false, busy = false, behind = 0, timer = 0, idle = 0
  let peleMed = 0, mmMed = 0
  const FRAME = 1000 / 60

  // Both bars on one scale, with the frame mark fixed: the reader sees the gap instead of comparing two numbers.
  function showScale() {
    if (!peleMed || !mmMed) return
    const full = Math.max(mmMed, peleMed, FRAME) * 1.08
    scale.style.setProperty('--frame', `${(FRAME / full) * 100}%`)
    scalePele.style.width = `${Math.max(0.4, (peleMed / full) * 100)}%`
    scaleMm.style.width = `${(mmMed / full) * 100}%`
    scalePeleMs.textContent = fmt(peleMed); scaleMmMs.textContent = fmt(mmMed)
    scale.hidden = false
  }
  const ratio = () => peleMed && mmMed ? Math.round(mmMed / peleMed) : 0

  function drawPele(text: string) {
    const t0 = performance.now()
    try {
      const { svg } = render(text, { maxWidth: peleOut.clientWidth || 600 })
      const ms = performance.now() - t0
      peleOut.innerHTML = svg
      peleOut.classList.remove('stale')
      stats.pele++
      peleMed = pm.add(ms); peleMs.textContent = fmt(peleMed); showScale()
    } catch { peleOut.classList.add('stale') } // a half-typed line: keep the last good drawing
  }

  async function drawMermaid() {
    if (!ready || busy) return
    busy = true; behind = 0
    const t0 = performance.now()
    const svg = await mermaidSvg(src.value)
    if (svg) { mmOut.innerHTML = svg; mmOut.classList.remove('stale'); stats.mermaid++; mmMed = mm.add(performance.now() - t0); mmMs.textContent = fmt(mmMed); showScale() }
    else mmOut.classList.add('stale')
    busy = false
    if (behind > 0) void drawMermaid()
    else { lag.hidden = true; root.classList.remove('lagging') }
  }

  function onEdit() {
    stats.edits++
    const extra = needs(src.value)
    if (extra && !isLoaded(extra)) void ensure(extra).then(() => drawPele(src.value)) // first sequence/state diagram: fetch that type once
    else drawPele(src.value)
    behind++
    if (busy) { lag.hidden = false; root.classList.add('lagging'); lag.textContent = `Mermaid.js is ${behind} keystroke${behind === 1 ? '' : 's'} behind` }
    void drawMermaid()
  }

  function summary() {
    if (stats.edits < 2) return
    const r = ratio()
    verdict.textContent = ready
      ? `${stats.edits} edits. Pele drew every one. Mermaid.js drew ${stats.mermaid} and skipped the rest while it was busy${r > 1 ? `: on this diagram each of its redraws takes about ${r}× as long` : ''}.`
      : `${stats.edits} edits, and Pele drew every one. Mermaid.js is still downloading.`
  }
  function stop() {
    window.clearTimeout(timer); timer = 0
    auto.innerHTML = '<span aria-hidden="true">▶</span> Auto-type'; auto.setAttribute('aria-pressed', 'false')
    summary()
  }
  function autoType() {
    if (timer) return stop()
    void start()
    const target = EXAMPLES[example.value] ?? ''
    // Start from most of the diagram, so the redraws cost what they cost on a real one, and type the rest.
    const from = target.length > 400 ? target.lastIndexOf('\n', Math.floor(target.length * 0.6)) + 1 : 0
    src.value = target.slice(0, from); Object.assign(stats, { edits: 0, pele: 0, mermaid: 0 })
    if (from) onEdit()
    auto.innerHTML = '<span aria-hidden="true">■</span> Stop'; auto.setAttribute('aria-pressed', 'true')
    verdict.textContent = 'Typing at about 35 characters a second…'
    let i = from
    const tick = () => {
      src.value = target.slice(0, ++i); onEdit()
      if (i < target.length) timer = window.setTimeout(tick, target[i - 1] === '\n' ? 80 : 28)
      else { timer = 0; window.setTimeout(stop, 500) }
    }
    tick()
  }

  src.addEventListener('input', () => { onEdit(); window.clearTimeout(idle); idle = window.setTimeout(summary, 900) })
  auto.addEventListener('click', autoType)
  example.addEventListener('change', () => { stop(); src.value = EXAMPLES[example.value] ?? ''; Object.assign(stats, { edits: 0, pele: 0, mermaid: 0 }); onEdit() })

  if (!src.value.trim()) src.value = EXAMPLES.big ?? ''
  drawPele(src.value) // replaces the build-time drawing with a live one
  // Warm up while idle, as any editor would be after a few keystrokes, so the timings aren't a cold start.
  whenIdle(() => { for (let i = 0; i < 6; i++) { try { render(src.value, { maxWidth: peleOut.clientWidth || 600 }) } catch { /* ignore */ } } pm.reset() })

  let started = false
  async function start() {
    if (started) return
    started = true
    const t0 = performance.now()
    await loadMermaid()
    mmMs.textContent = `downloaded in ${fmt(performance.now() - t0)}`
    ready = true; behind = 1
    await drawMermaid()
  }
  // Fetch Mermaid.js (the big download) only once its pane is close to the screen, and after the page has
  // painted, so it never competes with the first view. Focusing the editor also starts it.
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); whenIdle(() => void start(), 1200) } }, { rootMargin: '200px 0px' })
  io.observe(mmOut)
  src.addEventListener('focus', () => void start(), { once: true })

  return { stats, setText(text: string) { src.value = text; onEdit() } }
}
