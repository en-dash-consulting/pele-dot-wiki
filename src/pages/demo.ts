import '../lib/site'

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
if (el) {
  const load = loaders[el.dataset.demo ?? '']
  if (load) load().then(mountFn => {
    (window as unknown as { demo: unknown }).demo = mountFn(el)
    if (status) { status.textContent = '✓ Live: running pele 1.6.0 in your browser'; status.classList.add('ok') }
  }).catch(err => { if (status) status.textContent = `This demo could not start: ${String(err)}`; throw err })
}
