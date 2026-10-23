// The footballer wiki in the browser: Graview's routed face over the seed, with the wiki's own shell, home,
// lists and records registered over the derived pages, and the scene one switch away.
import './footballer.css'
import { useMemo, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mount } from '@graview/embed'
import { compileDocument } from '@graview/core/check'
import { createPageRegistry, useStoreTick, type PageComponent, type PageContext } from '@graview/pages'
import type { AnySchema } from '@graview/core'
import doc from './data/app.json'
import seed from './data/seed.json'
import { BASE, ORDER, readWiki, type Kind, type Snapshot } from './model'
import { Home, KindList, Navigate, RecordPage, Shell } from './ui'

const compiled = compileDocument(doc as never)
if (!compiled.ok) throw new Error('The footballer wiki document does not compile')
const app = compiled.app
type S = AnySchema
type Ctx = { context: PageContext<S> }

function useWiki(context: PageContext<S>) {
  const tick = useStoreTick(context.store)
  return useMemo(() => readWiki(context.store.graph.snapshot() as unknown as Snapshot), [context.store, tick])
}
function Steer({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  return <Navigate.Provider value={navigate}>{children}</Navigate.Provider>
}
const WikiShell = ({ children }: { context: PageContext<S>; children: ReactNode }) => <Steer><Shell live>{children}</Shell></Steer>
const HomePage = ({ context }: Ctx) => <Home wiki={useWiki(context)} />
const listOf = (kind: Kind) => ({ context }: Ctx) => <KindList wiki={useWiki(context)} kind={kind} />
const Record = ({ context }: Ctx) => <RecordPage wiki={useWiki(context)} id={decodeURIComponent(useParams()['id'] ?? '')} />

let registry = createPageRegistry<S, PageComponent<S>>(app.schema).surface('shell', WikiShell).surface('home', HomePage)
for (const kind of ORDER) registry = registry.register(kind, 'list', listOf(kind)).register(kind, 'record', Record)

// The pages grow with their content; the scene and the lenses fill the window.
const root = document.getElementById('app')!
const fill = () => root.classList.toggle('fw-fill', location.pathname.startsWith(`${BASE}/places/`))
fill()
root.replaceChildren()
mount(root, {
  app, seed: seed as never, face: 'pages', routing: 'address', basePath: `${BASE}/`,
  pages: registry, fonts: false, height: 'auto',
})
for (const verb of ['pushState', 'replaceState'] as const) {
  const original = history[verb].bind(history)
  history[verb] = (...args: Parameters<History['pushState']>) => { original(...args); fill() }
}
addEventListener('popstate', fill)
