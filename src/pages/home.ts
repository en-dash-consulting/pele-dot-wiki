import '../lib/site'
import { whenNeeded } from '../lib/when'

// The race is drawn at build time; its code loads when the reader reaches or touches it.
const el = document.querySelector<HTMLElement>('[data-type-race]')
if (el) whenNeeded(el, () => {
  void import('../demos/type-race').then(m => { (window as unknown as { typeRace: unknown }).typeRace = m.mountTypeRace(el) })
})
