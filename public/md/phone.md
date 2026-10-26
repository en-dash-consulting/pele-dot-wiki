# Narrow screens

> Demo: narrow the viewport. Pele changes a wide flowchart to top-to-bottom so the text stays readable; Mermaid.js scales the drawing down.

Source: https://pele.wiki/pages/phone.html · Last updated 2026-10-17

On a narrow screen Pele turns a left-to-right flowchart to run top to bottom instead of shrinking it. Drag the handle and watch the “smallest text” size above each frame.

*(Interactive demo: open https://pele.wiki/pages/phone.html)*

## What happens

The flowchart runs left to right, which suits a laptop and not a phone. Mermaid.js keeps the same drawing and scales it down to fit, so the text shrinks with it. Pele gets the width of the screen and, when the flowchart doesn't fit a narrow screen, turns the flow to run top to bottom instead, so the text stays at full size and you scroll down, the way you read a phone.

## How to get this in your app

`mount()` does it for you: it watches the element's width and redraws when it changes. With `render()`, pass the width yourself:

```js
render(text, { maxWidth: el.clientWidth })       // turn below 640 px (the default)
render(text, { maxWidth: el.clientWidth, directionBreakpoint: 360 }) // turn only below 360 px
render(text, { autoDirection: false })           // never turn
```

By default Pele turns the flow below 640 pixels. This demo sets `directionBreakpoint: 360` so you can see both layouts with two phones side by side. Details in the [responsive layouts guide](/pages/responsive.html).
