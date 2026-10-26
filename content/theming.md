---
slug: theming
order: 33
section: guide
title: "Theming | pele.wiki"
nav: Theming
h1: "Theming Pele diagrams"
intro: "<strong>Pele diagrams are coloured by CSS variables.</strong> Set <code>--pele-bg</code>, <code>--pele-fg</code>, <code>--pele-accent</code> and friends on the diagram or any parent, and every diagram inside follows, without being redrawn."
description: "Every Pele CSS variable for colours, fonts, corner radius and chart series, with light and dark mode examples and why colour changes need no redraw."
type: article
---
## The variables

| Variable | Default | Colours |
| --- | --- | --- |
| `--pele-bg` | `#ffffff` | Background |
| `--pele-fg` | `#1f1f1f` | Text |
| `--pele-muted` | `#6e6e6e` | Secondary text |
| `--pele-line` | `#1f1f1f` | Lines and arrowheads |
| `--pele-surface` | `#f3f3f3` | Box fill |
| `--pele-surface-alt` | `#e6e6e6` | Group (subgraph) fill |
| `--pele-border` | `#8a8a8a` | Box and group borders |
| `--pele-accent` | `#5b7bd5` | Highlights |
| `--pele-critical` | `#e45756` | Critical Gantt tasks, high-priority kanban cards |
| `--pele-error` | `#e45756` | Errors shown by `mount()` |
| `--pele-font` | measured | Label font |
| `--pele-font-mono` | measured | Monospace labels |
| `--pele-radius` | `4px` | Corner radius of rounded shapes |
| `--pele-series-1` … `-8` | a palette | Pie slices, chart series, git branches |

There are also `--pele-title-weight`, `--pele-heading-weight` and `--pele-bold-weight`. The full reference is in the [official theming docs](https://pele.run/theming).

## Light and dark mode

```css
.pele {
  --pele-bg: #ffffff; --pele-fg: #111111; --pele-line: #111111; --pele-accent: #d52b1e;
}
@media (prefers-color-scheme: dark) {
  .pele { --pele-bg: #121417; --pele-fg: #f2f2ef; --pele-line: #f2f2ef; --pele-accent: #f04a3c; }
}
```

Because the drawing only points at the variables, switching modes is instant and needs no JavaScript. This site does exactly this: switch your system to dark mode and every diagram follows.

## Fonts are the exception

Pele measures label text to lay a diagram out, so a new font means new widths. With `mount()`, call `diagram.refresh()` after changing fonts. With `render()`, pass `fontFamily` and render again.

## Coming from Mermaid themes

Mermaid's `theme` and `themeVariables` settings don't apply in Pele. Map the colours you used onto the variables above once, in CSS, and you're done. Play with it in the [theme lab](/pages/theme-lab.html).
