---
slug: getting-started
title: "Getting Started with Pele: Install and Render a Mermaid Diagram | pele.wiki"
nav: Getting started
h1: "Getting started with Pele"
description: "Install Pele from npm, render a Mermaid diagram to SVG with render(), mount a responsive diagram with mount(), and theme it with CSS variables."
type: howto
steps:
  - "Install the package: npm install pele"
  - "Import render from 'pele' and pass it Mermaid text; insert the returned svg string into the page."
  - "In a browser, use mount(element, text) instead to read fonts from CSS and adapt the layout to the element's width."
  - "Set --pele-* CSS variables on .pele or a parent element to match your theme."
---
## 1. Install

```sh
npm install pele
```

## 2. Render

```js
import { render } from 'pele'

const { svg } = render(`flowchart TD
  A[Mermaid text] --> B{Flowchart?}
  B -- Yes --> C[Pele]`)
document.querySelector('#diagram').innerHTML = svg
```

`render()` is synchronous and throws a `PeleError` for unsupported types and syntax errors. `supports(text)` tells you in advance whether a diagram type is available.

## 3. Mount (responsive)

```js
import { mount } from 'pele'

const diagram = mount(document.querySelector('#diagram'), text)
diagram.update(newText) // redraw in place
```

## 4. Theme

```css
.pele {
  --pele-bg: #ffffff;
  --pele-fg: #1a1a1a;
  --pele-accent: #e2401c;
  --pele-font: system-ui, sans-serif;
}
```

Colour changes apply without re-rendering. The full list is in the [official theming docs](https://pele.run/theming).
