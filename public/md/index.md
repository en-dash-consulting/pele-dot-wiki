# Live demos of Pele

> Live demos of Pele, kepano's Mermaid renderer, running next to Mermaid.js in your browser: typing, streaming, theming, narrow screens, 200 diagrams, untrusted input.

Source: https://pele.wiki/ · Last updated 2026-10-17

## Six demos

Each runs pele 1.6.0 in your browser. Most run Mermaid.js 12.1.0 beside it, with the same text, and time both.

1. [Typing](https://pele.wiki/): Both libraries redraw on every keystroke. Compare the times.
2. [Streaming](https://pele.wiki/pages/stream.html): A diagram redrawn on each chunk of an AI answer.
3. [Theming](https://pele.wiki/pages/theme-lab.html): Change CSS variables. Pele recolours without a redraw.
4. [Narrow screens](https://pele.wiki/pages/phone.html): Resize the viewport. Pele changes the layout; Mermaid.js scales the drawing.
5. [200 diagrams on one page](https://pele.wiki/pages/docs-page.html): How long each library takes to draw a long documentation page.
6. [Untrusted input](https://pele.wiki/pages/safety.html): Scripts, bad links and oversized diagrams, and what reaches the page.

## What is Pele?

<p class="lede">Pele is a JavaScript library that turns Mermaid diagram text into SVG. <a href="https://github.com/kepano">kepano</a> wrote it for Obsidian, so that diagrams draw instantly and match the user's theme. MIT licensed.</p>

It takes the same text you would give Mermaid.js and returns an SVG string, synchronously:

```js
import { render } from 'pele'

const { svg } = render(`flowchart LR
  A[Mermaid text] --> B[SVG]`)
document.querySelector('#diagram').innerHTML = svg
```

It supports every diagram type built into Mermaid 12.1.0, uses its own layout, and takes colours and fonts from CSS variables. More in [What is Pele?](/pages/what-is-pele.html) and [Getting started](/pages/getting-started.html).

## Where it helps

Pele's speed matters when diagrams are drawn often, live, or in bulk:

- an editor preview that redraws on every keystroke;
- a chat app [streaming a diagram](/pages/stream.html) from a model;
- an app whose diagrams must [follow the user's theme](/pages/theme-lab.html);
- diagrams read [on phones](/pages/phone.html);
- documentation with [hundreds of diagrams](/pages/docs-page.html) on a page;
- diagrams [written by people you don't trust](/pages/safety.html).

Keep Mermaid.js if you need its exact look, JavaScript click callbacks, or plugins such as ZenUML. See [Pele vs Mermaid.js](/pages/pele-vs-mermaid.html).
