import '../lib/site'
import { mountTypeRace } from '../demos/type-race'

const el = document.querySelector<HTMLElement>('[data-type-race]')
if (el) (window as unknown as { typeRace: unknown }).typeRace = mountTypeRace(el)
