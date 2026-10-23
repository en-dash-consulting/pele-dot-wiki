import '../styles/main.css'

const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle')
const nav = document.getElementById('site-nav')
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true'
    toggle.setAttribute('aria-expanded', String(open))
    nav.classList.toggle('open', open)
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { toggle.click(); toggle.focus() }
  })
}

// "npm install pele" chip: copy on click.
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const label = b.querySelector<HTMLElement>('.copy-label')
  try { await navigator.clipboard.writeText(b.dataset.copy ?? ''); if (label) label.textContent = 'Copied' } catch { if (label) label.textContent = 'Select it' }
  window.setTimeout(() => { if (label) label.textContent = 'Copy' }, 1500)
}))
