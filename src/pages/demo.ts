import '../lib/site'
import { whenNeeded } from '../lib/when'

const el = document.querySelector<HTMLElement>('[data-demo]')
const status = document.getElementById('demo-status')
const loaders: Record<string, () => Promise<(root: HTMLElement) => unknown>> = {
  stream: () => import('../demos/stream').then(m => m.mountStream),
  'theme-lab': () => import('../demos/theme-lab').then(m => m.mountThemeLab),
  phone: () => import('../demos/phone').then(m => m.mountPhone),
  'docs-page': () => import('../demos/docs-page').then(m => m.mountDocsPage),
  gallery: () => import('../demos/gallery').then(m => m.mountGallery),
  safety: () => import('../demos/safety').then(m => m.mountSafety),
}
// Each demo is drawn at build time where possible; its code loads when the reader reaches or touches it.
const load = el ? loaders[el.dataset.demo ?? ''] : undefined
if (el && load) whenNeeded(el, () => {
  return load().then(async mountFn => {
    (window as unknown as { demo: unknown }).demo = await mountFn(el)
    if (status) { status.textContent = '✓ Live: running pele 1.6.0 in your browser'; status.classList.add('ok') }
  }).catch((err: unknown) => { if (status) status.textContent = `This demo could not start: ${String(err)}`; throw err })
}, '100px 0px')
