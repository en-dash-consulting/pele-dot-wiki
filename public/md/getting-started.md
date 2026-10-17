# Getting started with Pele

> Install Pele from npm, render a Mermaid diagram to SVG with render(), mount a responsive diagram with mount(), and theme it with CSS variables.

Source: https://pele.wiki/pages/getting-started.html

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
