---
slug: getting-started
order: 32
section: guide
title: "Getting Started With Pele: Install and Render | pele.wiki"
nav: Getting started
h1: "Getting started with Pele"
intro: "Install Pele from npm, pass Mermaid text to <code>render()</code>, and put the SVG on the page. That's the whole thing; the rest of this page is the useful extras."
description: "Install Pele from npm, render Mermaid text to SVG with render(), mount a responsive diagram with mount(), and style it with CSS variables. Five minutes."
type: howto
steps:
  - "Install: run npm install pele (or pnpm add pele, yarn add pele, bun add pele)."
  - "Render: import render from 'pele', pass it Mermaid text, and insert the returned svg string into the page."
  - "Mount: in a browser, call mount(element, text) to draw into an element that redraws itself when its width changes."
  - "Theme: set --pele-* CSS variables on .pele or any parent element to match your site."
  - "Handle errors: catch PeleError and show its message with textContent."
---
## 1. Install

```sh
npm install pele
```

No npm? Pele also ships a plain script build, `pele/global`, that adds a `pele` global.

## 2. Render

```js
import { render } from 'pele'

const { svg } = render(`flowchart TD
  A[Mermaid text] --> B{Flowchart?}
  B -- Yes --> C[Pele]`)
document.querySelector('#diagram').innerHTML = svg
```

`render()` is synchronous. It also works in Node, so you can draw diagrams at build time and ship plain SVG.

## 3. Mount, for live pages

```js
import { mount } from 'pele'

const diagram = mount(document.querySelector('#diagram'), text)
diagram.update(newText) // redraw in place
diagram.destroy()       // stop watching the element
```

`mount()` reads your fonts from CSS, redraws when the element's width changes (see the [phone demo](/pages/phone.html)), and adds zoom buttons to diagrams that had to be shrunk.

## 4. Theme

```css
.pele {
  --pele-bg: #ffffff;
  --pele-fg: #111111;
  --pele-accent: #d52b1e;
  --pele-font: system-ui, sans-serif;
}
```

Colour changes apply without a redraw. Try it in the [theme lab](/pages/theme-lab.html); every variable is in the [theming guide](/pages/theming.html).

## 5. Handle errors

```js
import { render, supports, PeleError } from 'pele'

if (!supports(text)) showFallback()
try { el.innerHTML = render(text).svg }
catch (e) { if (e instanceof PeleError) el.textContent = e.message; else throw e }
```

Always show the message as text: it can quote the diagram. More in the [security guide](/pages/security.html).
