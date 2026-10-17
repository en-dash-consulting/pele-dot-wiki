// The build-time drawings are only valid while their inputs are unchanged. This key covers them.
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export const ROOT = new URL('..', import.meta.url).pathname
export const SNAPSHOT = join(ROOT, 'src/prerender.json')
export const TARGETS = [
  { page: 'index', path: '/', attr: 'id="tr-pele"', sel: '#tr-pele' },
  { page: 'theme-lab', path: '/pages/theme-lab.html', attr: 'data-src="flow"', sel: '#lab-board .lab-dia[data-src="flow"]' },
  { page: 'theme-lab', path: '/pages/theme-lab.html', attr: 'data-src="pie"', sel: '#lab-board .lab-dia[data-src="pie"]' },
  { page: 'theme-lab', path: '/pages/theme-lab.html', attr: 'data-src="seq"', sel: '#lab-board .lab-dia[data-src="seq"]' },
  { page: 'phone', path: '/pages/phone.html', attr: 'id="ph-pele"', sel: '#ph-pele' },
]
export function prerenderKey() {
  const files = [
    'node_modules/pele/package.json', 'src/demos/examples.json', 'src/demos/theme-presets.json', 'src/demos/type-race.ts', 'src/demos/theme-lab.ts', 'src/demos/phone.ts',
    'src/lib/pele-lite.ts', ...readdirSync(join(ROOT, 'src/styles')).sort().map(f => `src/styles/${f}`),
  ]
  const h = createHash('sha256')
  for (const f of files) h.update(f).update(readFileSync(join(ROOT, f)))
  return h.digest('hex').slice(0, 16)
}
