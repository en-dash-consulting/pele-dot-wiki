import { mount, ensure, type Mounted } from '../lib/pele-lite'
import { mermaidSvg } from '../lib/mermaid'
import { visible } from '../lib/when'
import { $ } from '../lib/dom'

const SOURCES: Record<string, string> = {
  flow: `flowchart LR
  Idea([Idea]) --> Draft[Draft]
  Draft --> Review{Review}
  Review -- ok --> Ship[Ship]
  Review -- changes --> Draft`,
  pie: `pie title Where the time goes
  "Writing" : 45
  "Reviewing" : 30
  "Waiting" : 25`,
  seq: `sequenceDiagram
  participant You
  participant Docs
  You->>Docs: Change --pele-accent
  Docs-->>You: Every diagram updates, no redraw`,
}

type Theme = { bg: string; fg: string; line: string; surface: string; border: string; accent: string; series: string[] }
const PRESETS: Record<string, Theme & { label: string }> = {
  day: { label: 'Day service', bg: '#ffffff', fg: '#111111', line: '#111111', surface: '#f2f2f2', border: '#111111', accent: '#d52b1e', series: ['#d52b1e', '#00843d', '#f5a800'] },
  night: { label: 'Night service', bg: '#121417', fg: '#f2f2ef', line: '#f2f2ef', surface: '#272b31', border: '#a7acb3', accent: '#ffbd2e', series: ['#f04a3c', '#1fae5f', '#ffbd2e'] },
  vault: { label: 'Purple vault', bg: '#1e1e1e', fg: '#dcddde', line: '#a68af9', surface: '#2a2a2a', border: '#7f6df2', accent: '#7f6df2', series: ['#7f6df2', '#a68af9', '#4b3a8f'] },
  blueprint: { label: 'Blueprint', bg: '#0b3d91', fg: '#ffffff', line: '#cfe0ff', surface: '#174ea6', border: '#ffffff', accent: '#ffd400', series: ['#ffd400', '#cfe0ff', '#7fb2ff'] },
  mint: { label: 'Mint', bg: '#e9f7f0', fg: '#0d3b2a', line: '#0d3b2a', surface: '#c7ecd9', border: '#127a52', accent: '#127a52', series: ['#127a52', '#3fb37f', '#9bdcbc'] },
  contrast: { label: 'High contrast', bg: '#000000', fg: '#ffffff', line: '#ffffff', surface: '#000000', border: '#ffff00', accent: '#ffff00', series: ['#ffff00', '#00ffff', '#ff66ff'] },
}

export async function mountThemeLab(root: HTMLElement) {
  await ensure('pie', 'sequence')
  const board = $<HTMLElement>(root, '#lab-board')
  const code = $<HTMLElement>(root, '#lab-code')
  const peleN = $<HTMLOutputElement>(root, '#lab-pele-n')
  const peleNote = $<HTMLElement>(root, '#lab-pele-note')
  const mmN = $<HTMLOutputElement>(root, '#lab-mm-n')
  const mmBox = $<HTMLElement>(root, '#lab-mm')
  const font = $<HTMLSelectElement>(root, '#lab-font')
  const radius = $<HTMLInputElement>(root, '#lab-radius')
  const radiusOut = $<HTMLOutputElement>(root, '#lab-radius-out')
  const inputs = [...root.querySelectorAll<HTMLInputElement>('input[type="color"]')]
  const presetsEl = $<HTMLElement>(root, '#lab-presets')

  let theme: Theme = { ...PRESETS.day! }
  let peleRenders = 0, peleRelayouts = 0, mmRenders = 0
  const mounted: Mounted[] = []

  function cssText() {
    const lines = [
      `--pele-bg: ${theme.bg};`, `--pele-fg: ${theme.fg};`, `--pele-line: ${theme.line};`, `--pele-surface: ${theme.surface};`,
      `--pele-surface-alt: ${theme.surface};`, `--pele-border: ${theme.border};`, `--pele-accent: ${theme.accent};`, `--pele-muted: ${theme.fg};`,
      ...theme.series.map((c, i) => `--pele-series-${i + 1}: ${c};`), `--pele-font: ${font.value};`, `--pele-radius: ${radius.value}px;`]
    return lines
  }
  function apply() {
    const lines = cssText()
    board.setAttribute('style', lines.join(' '))
    code.textContent = `.pele {\n${lines.map(l => `  ${l}`).join('\n')}\n}`
    for (const i of inputs) i.value = (theme as unknown as Record<string, string>)[i.id.replace('lab-', '')] ?? '#000000'
    radiusOut.textContent = `${radius.value}px`
    queueMermaid()
  }

  let mmTimer = 0, mmBusy = false, mmSeen = false
  // Mermaid.js is about 1.6 MB: fetch it only when its panel is about to be seen.
  visible(mmBox, () => { mmSeen = true; queueMermaid() })
  function queueMermaid() {
    if (!mmSeen) return
    window.clearTimeout(mmTimer)
    mmTimer = window.setTimeout(async () => {
      if (mmBusy) return queueMermaid()
      mmBusy = true
      const init = `%%{init: {"theme": "base", "themeVariables": {"background": "${theme.bg}", "primaryColor": "${theme.surface}", "primaryTextColor": "${theme.fg}", "primaryBorderColor": "${theme.border}", "lineColor": "${theme.line}", "textColor": "${theme.fg}", "fontFamily": "${font.value.replace(/"/g, "'")}"}}}%%\n`
      const svg = await mermaidSvg(init + SOURCES.flow)
      if (svg) { mmBox.innerHTML = svg; mmBox.style.background = theme.bg; mmRenders++; mmN.textContent = String(mmRenders) }
      mmBusy = false
    }, 60)
  }

  // Draw each diagram once. After this, colour changes are pure CSS.
  for (const el of board.querySelectorAll<HTMLElement>('.lab-dia')) {
    const m = mount(el, SOURCES[el.dataset.src ?? 'flow'] ?? '', { zoom: false, onRender: () => { peleRenders++ } })
    mounted.push(m)
  }
  let baseline = mounted.length
  // Count from the first change the reader makes, so late web-font loads before that don't muddy the score.
  let touched = false
  void document.fonts.ready.then(() => requestAnimationFrame(() => { if (!touched) baseline = peleRenders; showPele() }))
  const base = () => peleRenders - baseline
  const touch = () => { if (!touched) { touched = true; baseline = peleRenders } }
  const showPele = () => { peleN.textContent = String(Math.max(0, base())); peleNote.textContent = peleRelayouts ? 'only for the font change: new letters need new measurements' : 'colours only change CSS' }

  for (const [key, p] of Object.entries(PRESETS)) {
    const b = document.createElement('button')
    b.type = 'button'; b.className = 'chip'; b.dataset.preset = key; b.setAttribute('aria-pressed', String(key === 'day'))
    b.innerHTML = `<span class="dot" style="--c:${p.accent}" aria-hidden="true"></span>${p.label}`
    b.addEventListener('click', () => {
      touch()
      theme = { ...p }
      presetsEl.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b)))
      apply(); showPele()
    })
    presetsEl.append(b)
  }
  for (const i of inputs) i.addEventListener('input', () => {
    touch();
    (theme as unknown as Record<string, string>)[i.id.replace('lab-', '')] = i.value
    presetsEl.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'))
    apply(); showPele()
  })
  radius.addEventListener('input', () => { touch(); apply(); showPele() })
  font.addEventListener('change', () => {
    touch()
    apply()
    // A new font changes text widths, so Pele re-measures and lays out again, once per diagram.
    requestAnimationFrame(() => { for (const m of mounted) m.refresh(); peleRelayouts++; showPele() })
  })
  $<HTMLButtonElement>(root, '#lab-copy').addEventListener('click', async e => {
    const btn = e.currentTarget as HTMLButtonElement
    try { await navigator.clipboard.writeText(code.textContent ?? ''); btn.textContent = 'Copied' } catch { btn.textContent = 'Select and copy' }
    window.setTimeout(() => { btn.textContent = 'Copy' }, 1500)
  })
  apply(); showPele()
  return { get peleRenders() { return base() }, get mmRenders() { return mmRenders } }
}
