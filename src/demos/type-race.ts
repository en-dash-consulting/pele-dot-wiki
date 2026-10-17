import { render } from '../lib/pele-lite'
import { loadMermaid, mermaidSvg } from '../lib/mermaid'
import { EXAMPLES } from './examples'
import { $, fmt, Median } from '../lib/dom'

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

  const stats = { edits: 0, pele: 0, mermaid: 0 }
  const pm = new Median(), mm = new Median()
  let ready = false, busy = false, behind = 0, timer = 0, idle = 0

  function drawPele(text: string) {
    const t0 = performance.now()
    try {
      const { svg } = render(text, { maxWidth: peleOut.clientWidth || 600 })
      const ms = performance.now() - t0
      peleOut.innerHTML = svg
      peleOut.classList.remove('stale')
      stats.pele++
      peleMs.textContent = fmt(pm.add(ms))
    } catch { peleOut.classList.add('stale') } // a half-typed line: keep the last good drawing
  }

  async function drawMermaid() {
    if (!ready || busy) return
    busy = true; behind = 0
    const t0 = performance.now()
    const svg = await mermaidSvg(src.value)
    if (svg) { mmOut.innerHTML = svg; mmOut.classList.remove('stale'); stats.mermaid++; mmMs.textContent = fmt(mm.add(performance.now() - t0)) }
    else mmOut.classList.add('stale')
    busy = false
    if (behind > 0) void drawMermaid()
    else { lag.hidden = true; root.classList.remove('lagging') }
  }

  function onEdit() {
    stats.edits++
    drawPele(src.value)
    behind++
    if (busy) { lag.hidden = false; root.classList.add('lagging'); lag.textContent = `Mermaid.js is ${behind} keystroke${behind === 1 ? '' : 's'} behind` }
    void drawMermaid()
  }

  function summary() {
    if (stats.edits < 2) return
    verdict.textContent = ready
      ? `You made ${stats.edits} edits. Pele drew every one. Mermaid.js drew ${stats.mermaid} and skipped the rest while it was busy.`
      : `You made ${stats.edits} edits and Pele drew every one. Mermaid.js is still downloading.`
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
    src.value = ''; Object.assign(stats, { edits: 0, pele: 0, mermaid: 0 })
    auto.innerHTML = '<span aria-hidden="true">■</span> Stop'; auto.setAttribute('aria-pressed', 'true')
    verdict.textContent = 'Typing at about 35 characters a second…'
    let i = 0
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

  src.value = EXAMPLES.flow ?? ''
  // Warm up, as any editor would be after a few keystrokes, so the first number isn't a cold start.
  for (let i = 0; i < 6; i++) { try { render(src.value, { maxWidth: peleOut.clientWidth || 600 }) } catch { /* ignore */ } }
  drawPele(src.value)

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
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); void start() } }, { rootMargin: '600px 0px' })
  io.observe(root)
  window.setTimeout(() => void start(), 2500)
  src.addEventListener('focus', () => void start(), { once: true })

  return { stats, setText(text: string) { src.value = text; onEdit() } }
}
