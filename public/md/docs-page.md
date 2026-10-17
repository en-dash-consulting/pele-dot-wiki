# A page with 200 diagrams

> Live demo: render 200 Mermaid diagrams on one docs page. See how long Pele and Mermaid.js each take to reach the last one, in your browser.

Source: https://pele.wiki/pages/docs-page.html · Last updated 2026-10-17

Pele draws a page full of diagrams almost at once. Press the button and both libraries draw the same 200, like a long docs page or a big Obsidian note.

*(Interactive demo: open https://pele.wiki/pages/docs-page.html)*

## What you just saw

The 200 diagrams are a realistic mix: flowcharts, sequence, class, state and ER diagrams, pies, Gantt charts, git graphs, mindmaps and user journeys. Pele draws them one after another, synchronously, and is done in a fraction of a second. Mermaid.js draws them one at a time too, each taking tens of milliseconds, so the page fills in over many seconds.

<div class="takeaway"><p>With Pele, a page full of diagrams is ready about as soon as its text is.</p></div>

## Even smaller pages

A docs site that only uses a few diagram types can register just those and leave the rest out of its bundle:

```js
import { register, render } from 'pele/core'
import flowchart from 'pele/diagrams/flowchart'
import sequence from 'pele/diagrams/sequence'

register(flowchart, sequence)
```

Or load each type the first time a page needs it with `renderAsync` from `pele/lazy`. See the [API cheatsheet](/pages/api.html).
