---
slug: docs-page
order: 15
section: demo
demo: docs-page
title: "200 diagrams on one page | pele.wiki"
nav: 200 diagrams on one page
h1: "200 diagrams on one page"
intro: "Press the button and both libraries draw the same 200 diagrams, as on a long documentation page or a large note."
description: "Demo: 200 Mermaid diagrams on one page. How long Pele and Mermaid.js each take to draw the last one, in your browser."
type: demo
---
<!-- demo -->

## What happens

The 200 diagrams are a realistic mix: flowcharts, sequence, class, state and ER diagrams, pies, Gantt charts, git graphs, mindmaps and user journeys. Pele draws them one after another, synchronously, and is done in a fraction of a second. Mermaid.js draws them one at a time too, each taking tens of milliseconds, so the page fills in over many seconds.

## Smaller bundles

A docs site that only uses a few diagram types can register just those and leave the rest out of its bundle:

```js
import { register, render } from 'pele/core'
import flowchart from 'pele/diagrams/flowchart'
import sequence from 'pele/diagrams/sequence'

register(flowchart, sequence)
```

Or load each type the first time a page needs it with `renderAsync` from `pele/lazy`. Both are in the [official API docs](https://pele.run/api).
