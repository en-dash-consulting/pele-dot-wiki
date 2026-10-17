---
slug: theme-lab
order: 13
section: demo
demo: theme-lab
title: "Pele Theme Lab: Restyle Mermaid Diagrams With CSS | pele.wiki"
nav: Theme lab
h1: "Theme lab"
intro: "Pele diagrams take their colours from CSS variables, so restyling needs no redraw. Pick a look or drag the colour pickers; the counters show how often each library redrew."
description: "Live demo: recolour Pele diagrams with CSS variables and watch them change with zero redraws, while Mermaid.js has to redraw for every change."
type: demo
---
<!-- demo -->

## What you just saw

Pele draws each diagram once. Its colours point at CSS variables such as `--pele-bg` and `--pele-accent`, so changing a colour is a style change: the browser repaints and Pele does nothing at all. That is why light and dark mode can switch without a flicker.

Mermaid.js bakes colours into the drawing through `themeVariables`, so a new colour means a new render.

Changing the **font** is the one case where Pele works again: new letters have new widths, so `mount()` measures the text and lays each diagram out once more.

<div class="takeaway"><p>With Pele, diagrams follow your site's theme the way the rest of your CSS does.</p></div>

The CSS under the demo is real; paste it into your stylesheet. Every variable is listed in the [theming guide](/pages/theming.html).
