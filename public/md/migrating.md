# Moving from Mermaid.js to Pele

> Switch from Mermaid.js to Pele: the code swap, moving themeVariables to CSS, what looks different, what is not supported, and a safe fallback plan.

Source: https://pele.wiki/pages/migrating.html · Last updated 2026-10-26

Your Mermaid text stays exactly the same; only the code that draws it changes. Swap mermaid.render() for Pele's render() or mount(), move your theme into CSS, and check the few features that differ.

## 1. Swap the drawing code

| Mermaid.js | Pele |
| --- | --- |
| `mermaid.initialize({ startOnLoad: true })` | Nothing to set up |
| `await mermaid.render(id, text)` | `render(text)`, synchronous |
| `mermaid.run({ nodes })` | `mount(el, el.textContent)` for each element |
| `mermaid.parse(text)` | `parse(text)` or `supports(text)` |

```js
// before
const { svg } = await mermaid.render('d1', text)
// after
import { render } from 'pele'
const { svg } = render(text)
```

## 2. Move your theme into CSS

Mermaid's `theme` and `themeVariables` don't apply. Map them to [Pele's CSS variables](https://pele.run/theming) once; dark mode then comes free with a media query.

## What looks different

Pele lays diagrams out its own way, so boxes, spacing and arrow paths will move. The [official compatibility notes](https://pele.run/compatibility) are the reference; in short:

- A subgraph keeps its own `direction` even when it links to nodes outside it.
- Labels support line breaks, bold and italic, but not arbitrary HTML.
- On narrow screens diagrams change layout instead of shrinking (see [responsive layouts](/pages/responsive.html)).

## What isn't supported

- **JavaScript click callbacks** (link clicks work).
- **ZenUML and other external Mermaid plugins.**
- **Font Awesome icons by name** unless you pass an `icons` resolver.

## A safe rollout

Use `supports(text)` to check each diagram, draw with Pele when it says yes, and keep Mermaid.js as a lazy-loaded fallback until you've checked your real diagrams in the [gallery](/pages/gallery.html) or the [official playground](https://pele.run/playground). If Pele misreads valid Mermaid 12.1.0 text, [report the difference](https://github.com/obsidianmd/pele/issues).
