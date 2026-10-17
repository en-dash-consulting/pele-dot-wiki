# Mermaid diagrams, drawn before your next keystroke

> Pele by kepano renders Mermaid diagrams to themeable SVG with zero dependencies: about 6× smaller and up to 500× faster than Mermaid.js. Live demos and guides.

Source: https://pele.wiki/ · Last updated 2026-10-17

## Ride the Pele line

Six live demos, one idea each. Every one runs the real `pele` package in your browser, most of them next to the real Mermaid.js.

- Stop 1: [Type a diagram](https://pele.wiki/): Pele redraws on every keystroke. Mermaid.js falls behind.
- Stop 2: [Stream an AI answer](https://pele.wiki/pages/stream.html): Watch the diagram grow while the chatbot is still typing.
- Stop 3: [Theme lab](https://pele.wiki/pages/theme-lab.html): Recolour every diagram with CSS. Zero redraws.
- Stop 4: [Phone in your pocket](https://pele.wiki/pages/phone.html): Drag a phone narrower. Pele re-flows; Mermaid shrinks.
- Stop 5: [A page with 200 diagrams](https://pele.wiki/pages/docs-page.html): Race to the last diagram on a long docs page.
- Stop 6: [Paste anything](https://pele.wiki/pages/safety.html): Throw hostile diagrams at it. Nothing runs.

## What is Pele?

<p class="lede"><strong>Pele is a JavaScript library that turns Mermaid diagram text into SVG.</strong> It was written by <a href="https://github.com/kepano">kepano</a> (Steph Ango, CEO of Obsidian) so that diagrams in Obsidian draw instantly and match the user's theme. It is open source under the MIT license.</p>

You hand it the same text you would give Mermaid.js and get an SVG string back, synchronously:

```js
import { render } from 'pele'

const { svg } = render(`flowchart LR
  A[Mermaid text] --> B[SVG]`)
document.querySelector('#diagram').innerHTML = svg
```

It supports every diagram type built into Mermaid 12.1.0, uses its own layout and look, and takes colours and fonts from CSS variables. [What is Pele?](/pages/what-is-pele.html) has the details; [Getting started](/pages/getting-started.html) gets it into your app in five minutes.

## When is Pele the better choice?

When diagrams are drawn **often**, **live** or **in bulk**:

- a preview that redraws on every keystroke, like the race above;
- a chat app streaming a diagram from an AI model ([stop 2](/pages/stream.html));
- an app whose diagrams must follow the user's theme ([stop 3](/pages/theme-lab.html));
- diagrams read on phones ([stop 4](/pages/phone.html));
- docs pages with dozens or hundreds of diagrams ([stop 5](/pages/docs-page.html));
- diagrams written by people you don't trust ([stop 6](/pages/safety.html)).

Stay with Mermaid.js if you need its exact look, JavaScript click callbacks or plugins such as ZenUML. The [Pele vs Mermaid.js](/pages/pele-vs-mermaid.html) page goes through it honestly.
