---
slug: phone
order: 14
section: demo
demo: phone
title: "Pele on Phones: Diagrams That Re-flow, Not Shrink | pele.wiki"
nav: Phone in your pocket
h1: "Phone in your pocket"
intro: "Pele turns a wide flowchart to run top to bottom on narrow screens instead of shrinking it. Drag the yellow handle and watch the “smallest text” size above each phone."
description: "Live demo: drag a phone frame narrower. Pele re-flows a wide flowchart top-to-bottom to keep text readable; Mermaid.js scales it down to tiny text."
type: demo
---
<!-- demo -->

## What you just saw

The flowchart runs left to right, which is great on a laptop and terrible on a phone. Mermaid.js keeps the same drawing and scales it down to fit, so the text shrinks with it. Pele gets the width of the screen and, when the flowchart doesn't fit a narrow screen, turns the flow to run top to bottom instead, so the text stays at full size and you scroll down, the way you read a phone.

<div class="takeaway"><p>On a narrow screen, Pele turns a sideways flowchart into a top-to-bottom one so its text stays full size.</p></div>

## How to get this in your app

`mount()` does it for you: it watches the element's width and redraws when it changes. With `render()`, pass the width yourself:

```js
render(text, { maxWidth: el.clientWidth })       // turn below 640 px (the default)
render(text, { maxWidth: el.clientWidth, directionBreakpoint: 360 }) // turn only below 360 px
render(text, { autoDirection: false })           // never turn
```

By default Pele turns the flow below 640 pixels. This demo sets `directionBreakpoint: 360` so you can see both layouts with two phones side by side. Details in the [responsive layouts guide](/pages/responsive.html).
