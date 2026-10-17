// Mermaid.js is about 1.6 MB, so it is only fetched when a comparison needs it.
type MermaidApi = typeof import('mermaid')['default']
let loading: Promise<MermaidApi> | null = null
let seq = 0
const v = (name: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

function init(m: MermaidApi) {
  m.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: {
    fontFamily: v('--font-body', 'sans-serif'), primaryColor: v('--surface', '#f2f2f2'), primaryTextColor: v('--ink', '#111'),
    primaryBorderColor: v('--ink', '#111'), lineColor: v('--ink', '#111'), textColor: v('--ink', '#111'),
    background: v('--paper', '#fff'), mainBkg: v('--surface', '#f2f2f2'), secondaryColor: v('--surface-2', '#e4e4e4'), tertiaryColor: v('--paper', '#fff') } })
}

export function loadMermaid(): Promise<MermaidApi> {
  if (!loading) loading = import('mermaid').then(mod => {
    const m = mod.default
    init(m)
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => init(m))
    return m
  })
  return loading
}

/** Renders with Mermaid.js; resolves to the SVG string, or null if the text does not parse (yet). */
export async function mermaidSvg(text: string): Promise<string | null> {
  const m = await loadMermaid()
  if (!(await m.parse(text, { suppressErrors: true }))) return null
  const id = `mmd-${++seq}`
  try { return (await m.render(id, text)).svg } catch { document.getElementById(`d${id}`)?.remove(); return null }
}
