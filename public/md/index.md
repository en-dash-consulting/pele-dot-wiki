# Pele draws Mermaid diagrams as fast as you can type

> Pele by kepano renders Mermaid diagrams to themeable SVG: zero dependencies, about 6× smaller and up to 500× faster than Mermaid.js. Live demos, guides and FAQ.

Source: https://pele.wiki/

<p class="lede"><strong>Pele</strong> is an open-source library by <a href="https://github.com/kepano">kepano</a> (Steph Ango, CEO of Obsidian) that renders <a href="https://mermaid.js.org">Mermaid</a> diagram text to SVG. pele.wiki is an independent, hands-on guide: every demo runs the real Pele package next to Mermaid.js, so you can see when the difference matters.</p>

## What is Pele?

Pele is a drop-in renderer for Mermaid syntax. You hand it the same text you would give Mermaid.js and it hands back an SVG string, synchronously:

```js
import { render } from 'pele'

const { svg } = render(`flowchart LR
  A[Mermaid text] --> B[SVG]`)
document.querySelector('#diagram').innerHTML = svg
```

It supports every diagram type built into Mermaid 12.1.0, draws them with its own layout and style, and takes its colours and fonts from CSS variables. See [What is Pele?](/pages/what-is-pele.html) for the details, or [Getting started](/pages/getting-started.html) to add it to an app.

## When does it matter?

When diagrams are drawn **often**, **live** or **at scale**: a preview that redraws on every keystroke, a chat app streaming a diagram from an AI model, a docs page with dozens of diagrams, or an app that must match a user's theme. If you need Mermaid.js's exact look or its click callbacks, stay with Mermaid.js.
