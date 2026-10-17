import { render } from 'pele'
import { EXAMPLES } from './examples'

type MermaidApi = typeof import('mermaid')['default']

const $ = <T extends HTMLElement>(root: HTMLElement, sel: string): T => {
  const el = root.querySelector<T>(sel)
  if (!el) throw new Error(`type-race: missing ${sel}`)
  return el
}
const fmt = (ms: number) => (ms < 1 ? ms.toFixed(2) : ms < 10 ? ms.toFixed(1) : Math.round(ms).toString()) + ' ms'
const cssVar = (name: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

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
  const reset = $<HTMLButtonElement>(root, '#tr-reset')

  const stats = { edits: 0, pele: 0, peleTotal: 0, mermaid: 0, mermaidTotal: 0 }
  // Show the median of recent renders so one cold start or GC pause doesn't dominate.
  const recent = { pele: [] as number[], mermaid: [] as number[] }
  const median = (xs: number[], ms: number) => { xs.push(ms); if (xs.length > 9) xs.shift(); const s = [...xs].sort((a, b) => a - b); return s[s.length >> 1] ?? ms }
  let mermaid: MermaidApi | null = null
  let busy = false
  let editsSinceMermaid = 0
  let seq = 0
  let timer = 0

  function drawPele(text: string) {
    const t0 = performance.now()
    try {
      const { svg } = render(text, { maxWidth: peleOut.clientWidth || 600 })
      const ms = performance.now() - t0
      peleOut.innerHTML = svg
      peleOut.classList.remove('stale')
      stats.pele++; stats.peleTotal += ms
      peleMs.textContent = fmt(median(recent.pele, ms))
    } catch {
      peleOut.classList.add('stale') // half-typed line: keep the last good drawing
    }
  }

  async function drawMermaid() {
    if (!mermaid || busy) return
    busy = true
    const text = src.value
    editsSinceMermaid = 0
    const t0 = performance.now()
    try {
      if (await mermaid.parse(text, { suppressErrors: true })) {
        const id = `mm-${++seq}`
        const { svg } = await mermaid.render(id, text)
        const ms = performance.now() - t0
        mmOut.innerHTML = svg
        mmOut.classList.remove('stale')
        stats.mermaid++; stats.mermaidTotal += ms
        mmMs.textContent = fmt(median(recent.mermaid, ms))
      } else mmOut.classList.add('stale')
    } catch {
      mmOut.classList.add('stale')
      document.getElementById(`dmm-${seq}`)?.remove()
    }
    busy = false
    if (editsSinceMermaid > 0) void drawMermaid()
    else lag.hidden = true
  }

  function onEdit() {
    stats.edits++
    drawPele(src.value)
    editsSinceMermaid++
    if (busy) { lag.hidden = false; lag.textContent = `${editsSinceMermaid} keystroke${editsSinceMermaid === 1 ? '' : 's'} behind` }
    void drawMermaid()
  }

  function summary() {
    if (!stats.edits) return
    const skipped = Math.max(0, stats.edits - stats.mermaid)
    verdict.textContent = `${stats.edits} edits. Pele drew ${stats.pele} of them, ${fmt(stats.peleTotal / Math.max(1, stats.pele))} each. ` +
      (mermaid ? `Mermaid.js drew ${stats.mermaid}, ${fmt(stats.mermaidTotal / Math.max(1, stats.mermaid))} each, and skipped ${skipped} while it was busy.` : 'Mermaid.js is still loading.')
  }

  function stop() {
    window.clearTimeout(timer); timer = 0
    auto.textContent = '▶ Auto-type a diagram'; auto.setAttribute('aria-pressed', 'false')
    summary()
  }
  function autoType() {
    if (timer) return stop()
    const target = EXAMPLES[example.value] ?? ''
    src.value = ''; Object.assign(stats, { edits: 0, pele: 0, peleTotal: 0, mermaid: 0, mermaidTotal: 0 })
    auto.textContent = '■ Stop'; auto.setAttribute('aria-pressed', 'true')
    verdict.textContent = 'Typing…'
    let i = 0
    const tick = () => {
      src.value = target.slice(0, ++i); onEdit()
      if (i < target.length) timer = window.setTimeout(tick, target[i - 1] === '\n' ? 90 : 28)
      else { timer = 0; window.setTimeout(stop, 400) }
    }
    tick()
  }

  let idle = 0
  src.addEventListener('input', () => { onEdit(); window.clearTimeout(idle); idle = window.setTimeout(summary, 900) })
  auto.addEventListener('click', autoType)
  example.addEventListener('change', () => { stop(); src.value = EXAMPLES[example.value] ?? ''; onEdit() })
  reset.addEventListener('click', () => { stop(); src.value = ''; peleOut.innerHTML = ''; mmOut.innerHTML = ''; verdict.textContent = 'Start typing, or press Auto-type.' })

  src.value = EXAMPLES.flow ?? ''
  // Warm up the JIT the way any real editor would be after a few keystrokes, then draw.
  for (let i = 0; i < 6; i++) { try { render(src.value, { maxWidth: peleOut.clientWidth || 600 }) } catch { /* ignore */ } }
  drawPele(src.value)

  let started = false
  const loadMermaid = async () => {
    if (started) return
    started = true
    io.disconnect()
    const t0 = performance.now()
    const mod = await import('mermaid')
    mermaid = mod.default
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: {
      fontFamily: cssVar('--font-body', 'sans-serif'), primaryColor: cssVar('--surface', '#f3f3f3'), primaryTextColor: cssVar('--ink', '#111'),
      primaryBorderColor: cssVar('--ink', '#111'), lineColor: cssVar('--ink', '#111'), background: cssVar('--paper', '#fff') } })
    mmMs.textContent = `loaded in ${fmt(performance.now() - t0)}`
    editsSinceMermaid = 1
    await drawMermaid()
  }
  // Mermaid.js is 1.6 MB: fetch it when the demo nears the screen, or once the page is idle.
  const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) void loadMermaid() }, { rootMargin: '600px 0px' })
  io.observe(root)
  window.setTimeout(() => void loadMermaid(), 2500)
  src.addEventListener('focus', () => void loadMermaid(), { once: true })
  auto.addEventListener('click', () => void loadMermaid(), { once: true })

  return { stats, setText(text: string) { src.value = text; onEdit() } }
}
