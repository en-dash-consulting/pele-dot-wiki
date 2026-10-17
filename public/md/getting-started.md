# Getting started with Pele

> Install Pele from npm, render Mermaid text to SVG with render(), mount a responsive diagram with mount(), and style it with CSS variables. Five minutes.

Source: https://pele.wiki/pages/getting-started.html · Last updated 2026-10-17

Install Pele from npm, pass Mermaid text to render(), and put the SVG on the page. That's the whole thing; the rest of this page is the useful extras.

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
