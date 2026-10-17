// Scheduling helpers that keep demo code off the critical path.

/** Runs fn when the browser is idle (or after `timeout` ms at the latest). */
export function idle(fn: () => void, timeout = 1500) {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(() => fn(), { timeout })
  else setTimeout(fn, 200)
}

/** Runs fn once, after the page has loaded, when the browser is idle. */
export function afterLoad(fn: () => void, timeout = 1500) {
  if (document.readyState === 'complete') idle(fn, timeout)
  else addEventListener('load', () => idle(fn, timeout), { once: true })
}

/**
 * Runs fn once: as soon as the reader touches `el` (pointer, keyboard, focus), or once `el` is within
 * `margin` of the screen after the page has loaded and gone idle. Static, pre-rendered markup stays on
 * screen until then, so first paint never waits for demo code.
 */
export function whenNeeded(el: Element, fn: () => void, margin = '0px') {
  let done = false
  const evs = ['pointerdown', 'keydown', 'focusin'] as const
  const go = () => {
    if (done) return
    done = true; io.disconnect()
    for (const t of evs) el.removeEventListener(t, go, true)
    fn()
  }
  for (const t of evs) el.addEventListener(t, go, { capture: true, passive: true })
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) afterLoad(go) }, { rootMargin: margin })
  io.observe(el)
}

/** Runs fn once, when the browser is idle after `el` comes within `margin` of the screen. */
export function visible(el: Element, fn: () => void, margin = '200px 0px') {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); idle(fn, 1500) } }, { rootMargin: margin })
  io.observe(el)
}
