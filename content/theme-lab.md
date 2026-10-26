---
slug: theme-lab
order: 13
section: demo
demo: theme-lab
title: "Theming | pele.wiki"
nav: Theming
h1: "Theming"
intro: "Pele diagrams take their colours from CSS variables, so a colour change needs no redraw. Pick a preset or change a colour; the counters show how often each library redrew."
description: "Demo: recolour Pele diagrams with CSS variables, with no redraw. Mermaid.js redraws for every change."
type: demo
---
<!-- demo -->

## What happens

Pele draws each diagram once. Its colours point at CSS variables such as `--pele-bg` and `--pele-accent`, so changing a colour is a style change: the browser repaints and Pele does nothing at all. That is why light and dark mode can switch without a flicker.

Mermaid.js bakes colours into the drawing through `themeVariables`, so a new colour means a new render.

Changing the **font** is the one case where Pele works again: new letters have new widths, so `mount()` measures the text and lays each diagram out once more.

The CSS under the demo is real; paste it into your stylesheet. Every variable is listed in the [theming guide](/pages/theming.html).
