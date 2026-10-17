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
 * screen until then, so first paint never waits for demo code. Clicks, key presses and edits made while
 * the code is still loading are replayed once it is ready, and `el` gets a `data-live` attribute.
 */
export function whenNeeded(el: HTMLElement, fn: () => Promise<unknown> | void, margin = '0px') {
  let started = false
  const triggers = ['pointerdown', 'keydown', 'focusin'] as const
  const buffered = ['click', 'keydown', 'input', 'change'] as const
  const queue: Event[] = []
  const hold = (e: Event) => { if (e.isTrusted && queue.length < 20) queue.push(e) }
  for (const t of buffered) el.addEventListener(t, hold, true)
  const go = () => {
    if (started) return
    started = true; io.disconnect()
    for (const t of triggers) el.removeEventListener(t, go, true)
    void Promise.resolve(fn()).then(() => {
      for (const t of buffered) el.removeEventListener(t, hold, true)
      el.dataset.live = ''
      for (const e of queue) {
        const target = e.target as HTMLElement | null
        if (!target?.isConnected) continue
        if (e.type === 'click') target.click()
        else if (e instanceof KeyboardEvent) target.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, code: e.code, shiftKey: e.shiftKey, bubbles: true, cancelable: true }))
        else target.dispatchEvent(new Event(e.type, { bubbles: true }))
      }
    })
  }
  for (const t of triggers) el.addEventListener(t, go, { capture: true, passive: true })
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) afterLoad(go) }, { rootMargin: margin })
  io.observe(el)
}

/** Runs fn once, when the browser is idle after `el` comes within `margin` of the screen. */
export function visible(el: Element, fn: () => void, margin = '200px 0px') {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); idle(fn, 1500) } }, { rootMargin: margin })
  io.observe(el)
}
