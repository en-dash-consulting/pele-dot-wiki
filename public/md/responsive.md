# Diagrams that fit phones

> How Pele fits Mermaid diagrams to small screens: maxWidth, autoDirection and directionBreakpoint, mount() resizing, zoom, and when a diagram still needs room.

Source: https://pele.wiki/pages/responsive.html · Last updated 2026-10-26

Pele changes a diagram's layout to fit the space instead of shrinking it. Give it the available width and, below 640 pixels, a left-to-right flowchart turns to run top to bottom, so its text stays readable.

## The problem

A wide flowchart drawn for a laptop is about 1,000 pixels across. On a 375-pixel phone, a renderer that scales the picture to fit shrinks the text to around a third of its size. That's what Mermaid.js does by default.

## What Pele does instead

```js
render(text, { maxWidth: container.clientWidth })
```

With `maxWidth`, Pele may wrap labels, tighten spacing, or turn the diagram to run downward. You can tune or switch off the turning:

| Option | Default | What it does |
| --- | --- | --- |
| `maxWidth` | none | The width you have, in pixels |
| `autoDirection` | `true` | Let left-to-right layouts run top-to-bottom when narrow |
| `directionBreakpoint` | `640` | The width below which that happens |
| `responsive` | `true` | Set `false` for a fixed pixel size |

Some layouts still need more room than they get; those are scaled down as a last resort, and `mount()` then adds zoom buttons so readers can look closer.

## Let mount() handle it

```js
import { mount } from 'pele'
mount(el, text) // watches el's width and redraws when it changes
```

See it in the [phone demo](/pages/phone.html): drag the phone narrower and watch the flowchart turn.
