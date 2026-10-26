---
slug: index
order: 0
title: "pele.wiki: live demos of Pele, the Mermaid renderer"
nav: Home
h1: "Live demos of Pele"
sub: "Pele is kepano's open-source library that renders Mermaid diagrams to SVG, themed with CSS variables. The official docs at <a href=\"https://pele.run\">pele.run</a> are excellent and the place to start: a playground, the full API, every diagram type, and the thinking behind it. This independent site is a companion to them. It runs the real package in your browser next to Mermaid.js, so you can see the difference for yourself."
description: "Live demos of Pele, kepano's Mermaid renderer, running next to Mermaid.js in your browser: typing, streaming, theming, narrow screens, 200 diagrams, untrusted input."
type: home
---
## Six demos

Each runs pele 1.6.0 in your browser. Most run Mermaid.js 12.1.0 beside it, with the same text, and time both.

<!-- line -->

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
