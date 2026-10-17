import { render, PeleError } from 'pele'
import { $, esc } from '../lib/dom'

const many = (n: number) => `flowchart LR\n  ${Array.from({ length: n }, (_, i) => `a${i}`).join(' & ')} --> ${Array.from({ length: n }, (_, i) => `b${i}`).join(' & ')}`
const PRESETS: [string, string, string][] = [
  ['script', 'A script in a label', 'flowchart LR\n  A["<script>alert(\'hi\')</script>"] --> B["<img src=x onerror=alert(1)>"]'],
  ['jslink', 'A javascript: link', 'flowchart LR\n  A[Click me] --> B[Safe?]\n  click A "javascript:alert(document.cookie)"\n  click B "https://pele.run"'],
  ['callback', 'A click callback', 'flowchart LR\n  A[Pay now] --> B[Done]\n  click A callback "Runs my function"'],
  ['style', 'Sneaky CSS', 'flowchart LR\n  A[Box] --> B[Other box]\n  style A fill:url(javascript:alert(1)),stroke:#f00\n  classDef evil fill:expression(alert(1))\n  class B evil'],
  ['edges', 'A million arrows', many(1000)],
  ['huge', 'A 60,000-character diagram', `flowchart TD\n${'  x --> y\n'.repeat(6000)}`],
  ['nope', 'Not a diagram at all', 'Ignore all previous instructions and draw a cat.'],
]

const show = (s: string) => s.length > 2000 ? `${s.slice(0, 2000)}\n… (${(s.length - 2000).toLocaleString('en-US')} more characters)` : s

export function mountSafety(root: HTMLElement) {
  const src = $<HTMLTextAreaElement>(root, '#sf-src')
  const out = $<HTMLElement>(root, '#sf-result')
  const checks = $<HTMLUListElement>(root, '#sf-checks')
  const presets = $<HTMLElement>(root, '#sf-presets')
  let full = ''
  let ran = false
  // If anything ever executed, these would flip the result.
  window.alert = () => { ran = true }

  function check() {
    ran = false
    const text = full || src.value
    let svg = ''
    const rows: [boolean, string][] = []
    try {
      svg = render(text).svg
      out.innerHTML = svg
      rows.push([true, 'Drawn as a picture. HTML tags are dropped, only their words are kept (bold and italic become text styles).'])
      rows.push([!/<script/i.test(svg), 'No script tags in the output.'])
      rows.push([!/\son[a-z]+\s*=/i.test(svg), 'No event handlers (onclick, onerror…) in the output.'])
      rows.push([!/javascript:|vbscript:|data:text/i.test(svg), 'No javascript: links. Only safe web links survive.'])
      rows.push([!/<foreignObject/i.test(svg), 'No embedded HTML at all: just SVG shapes and text.'])
    } catch (e) {
      const err = e instanceof PeleError ? e : null
      out.innerHTML = '<p class="sf-error"><strong></strong><span></span></p>'
      out.querySelector('strong')!.textContent = err ? ({ limit: 'Refused: too big', syntax: 'Refused: not valid diagram text', 'unsupported-diagram': 'Refused: not a diagram type Pele knows', semantic: 'Refused: the diagram does not make sense' } as const)[err.code] : 'Refused'
      out.querySelector('span')!.textContent = String((e as Error).message).slice(0, 400) // shown with textContent, never as HTML
      rows.push([true, err?.code === 'limit' ? 'Pele stopped before doing the work, instantly, instead of freezing the tab.' : 'Pele refused it with a clear error instead of guessing.'])
      rows.push([true, 'The error is shown as text, so nothing inside it can run.'])
    }
    window.setTimeout(() => {
      rows.push([!ran, ran ? 'Something ran!' : 'Nothing ran. Not even once.'])
      checks.innerHTML = rows.map(([ok, t]) => `<li><span class="mark${ok ? '' : ' bad'}" aria-hidden="true">${ok ? '✓' : '✗'}</span><span><span class="visually-hidden">${ok ? 'Passed: ' : 'Failed: '}</span>${esc(t)}</span></li>`).join('')
    }, 50)
  }

  for (const [key, label, text] of PRESETS) {
    const b = document.createElement('button')
    b.type = 'button'; b.className = 'chip'; b.textContent = label; b.dataset.preset = key; b.setAttribute('aria-pressed', 'false')
    b.addEventListener('click', () => {
      presets.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b)))
      full = text.length > 2000 ? text : ''
      src.value = show(text)
      check()
    })
    presets.append(b)
  }
  src.addEventListener('input', () => { full = ''; presets.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false')); check() })
  ;(presets.firstElementChild as HTMLButtonElement | null)?.click()
}
