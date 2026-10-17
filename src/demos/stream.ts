import { render } from '../lib/pele-lite'
import { loadMermaid, mermaidSvg } from '../lib/mermaid'
import { $ } from '../lib/dom'

// A scripted assistant reply: prose, a mermaid block, more prose. Streamed in small chunks like a real model.
const BEFORE = 'Sure. A shopper goes from cart to payment, signs in if needed, and we only ship what is in stock:\n'
const DIAGRAM = `flowchart TD
  Cart[Cart] --> Signed{Signed in?}
  Signed -- yes --> Pay[Payment]
  Signed -- no --> Login[Log in or guest]
  Login --> Pay
  Pay --> Fraud{Fraud check}
  Fraud -- pass --> Stock{In stock?}
  Fraud -- flag --> Review[Manual review]
  Stock -- yes --> Ship([Ship it])
  Stock -- no --> Back[Back-order + email]`
const AFTER = '\nManual review usually clears within an hour. Want me to add refunds?'
const FULL = `${BEFORE}\`\`\`mermaid\n${DIAGRAM}\n\`\`\`${AFTER}`

function chunks(text: string): string[] {
  const out: string[] = []
  let i = 0, n = 0
  while (i < text.length) { const len = 2 + ((n++ * 7) % 4); out.push(text.slice(i, i + len)); i += len }
  return out
}

export function mountStream(root: HTMLElement) {
  const ask = $<HTMLButtonElement>(root, '#st-ask')
  const speed = $<HTMLSelectElement>(root, '#st-speed')
  const verdict = $<HTMLElement>(root, '#st-verdict')
  const side = (k: string) => ({ text: $<HTMLElement>(root, `#st-${k}-text`), dia: $<HTMLElement>(root, `#st-${k}-dia`), after: $<HTMLElement>(root, `#st-${k}-after`), count: $<HTMLOutputElement>(root, `#st-${k}-count`) })
  const P = side('pele'), M = side('mm')
  let timer = 0, running = false
  let pDraws = 0, mDraws = 0, mBusy = false, mPending = false, mFirst = -1, pFirst = -1, tick = 0

  function split(sofar: string) {
    const open = sofar.indexOf('```mermaid\n')
    if (open < 0) return { before: sofar, code: null as string | null, after: '' }
    const start = open + 11
    const close = sofar.indexOf('\n```', start)
    return { before: sofar.slice(0, open), code: close < 0 ? sofar.slice(start) : sofar.slice(start, close), after: close < 0 ? '' : sofar.slice(close + 4) }
  }
  const lines = (code: string) => code.split('\n').filter(l => l.trim()).length

  async function drawM(code: string) {
    if (mBusy) { mPending = true; return }
    mBusy = true
    const svg = await mermaidSvg(code)
    if (svg) { M.dia.classList.remove('waiting'); M.dia.innerHTML = svg; mDraws++; if (mFirst < 0) mFirst = tick }
    mBusy = false
    if (mPending && running) { mPending = false; void drawM(split(sofar).code ?? '') }
    else mPending = false
    M.count.textContent = `Redrawn ${mDraws} time${mDraws === 1 ? '' : 's'} during the answer`
  }

  let sofar = ''
  function step(parts: string[], i: number, delay: number) {
    sofar += parts[i]; tick = i
    const s = split(sofar)
    for (const side of [P, M]) { side.text.textContent = s.before; side.after.textContent = s.after }
    if (s.code !== null && s.code.trim()) {
      try {
        const { svg } = render(s.code, { maxWidth: P.dia.clientWidth || P.text.clientWidth || 400 })
        P.dia.innerHTML = svg; P.dia.classList.remove('stale'); pDraws++; if (pFirst < 0) pFirst = i
      } catch { P.dia.classList.add('stale') }
      P.count.textContent = `Redrawn ${pDraws} times as the answer streamed · ${lines(s.code)} of ${lines(DIAGRAM)} lines so far`
      if (!M.dia.innerHTML) { M.dia.classList.add('waiting'); M.dia.textContent = 'Mermaid.js is drawing…' }
      void drawM(s.code)
    }
    if (i + 1 < parts.length) timer = window.setTimeout(() => step(parts, i + 1, delay), delay)
    else finish(parts.length)
  }
  function finish(total: number) {
    running = false
    ask.innerHTML = '<span aria-hidden="true">↻</span> Ask again'; ask.setAttribute('aria-pressed', 'false')
    const early = pFirst >= 0 && mFirst >= 0 ? Math.round(((mFirst - pFirst) / total) * 100) : 0
    verdict.textContent = mFirst < 0
      ? 'Pele drew the diagram line by line while the answer streamed. Mermaid.js had not drawn anything by the time the answer finished.'
      : `Pele drew the diagram line by line as it arrived. Mermaid.js caught up in jumps${early > 3 ? ` and started about ${early}% of the answer later` : ''}.`
  }

  ask.addEventListener('click', async () => {
    if (running) { window.clearTimeout(timer); running = false; ask.innerHTML = '<span aria-hidden="true">▶</span> Ask the assistant'; return }
    running = true; sofar = ''; pDraws = 0; mDraws = 0; mFirst = -1; pFirst = -1
    for (const side of [P, M]) { side.text.textContent = ''; side.after.textContent = ''; side.dia.innerHTML = ''; side.dia.classList.remove('waiting', 'stale') }
    P.count.textContent = 'Streaming…'; M.count.textContent = 'Streaming…'; verdict.textContent = ''
    ask.innerHTML = '<span aria-hidden="true">■</span> Stop'; ask.setAttribute('aria-pressed', 'true')
    await loadMermaid() // fair start: Mermaid.js is already downloaded before the answer begins
    const parts = chunks(FULL)
    step(parts, 0, Math.round(1000 / Number(speed.value)))
  })
  void loadMermaid()
}
