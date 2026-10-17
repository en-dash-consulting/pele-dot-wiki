export const $ = <T extends Element>(root: ParentNode, sel: string): T => {
  const el = root.querySelector<T>(sel)
  if (!el) throw new Error(`missing ${sel}`)
  return el
}
export const fmt = (ms: number) => (ms < 1 ? ms.toFixed(2) : ms < 10 ? ms.toFixed(1) : Math.round(ms).toLocaleString('en-US')) + ' ms'
/** Median of the last few samples, so one cold start or GC pause doesn't dominate the number shown. */
export class Median {
  private xs: number[] = []
  constructor(private size = 9) {}
  reset() { this.xs = [] }
  add(x: number) { this.xs.push(x); if (this.xs.length > this.size) this.xs.shift(); const s = [...this.xs].sort((a, b) => a - b); return s[s.length >> 1] ?? x }
}
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
