# Pele vs Mermaid.js

> Pele and Mermaid.js side by side: syntax, render speed, bundle size, theming, narrow screens, safety, and what only Mermaid.js does.

Source: https://pele.wiki/pages/pele-vs-mermaid.html · Last updated 2026-10-17

Both read the same Mermaid text. Pele draws it faster from a smaller bundle, colours it with CSS and adapts it to narrow screens. Mermaid.js has the reference look, click callbacks and plugins.

## Side by side

| Question | Pele | Mermaid.js |
| --- | --- | --- |
| Syntax | Mermaid (12.1.0) | Mermaid |
| Diagram types | All built into Mermaid 12.1.0 | Same, plus plugins (ZenUML) |
| Download (gzip) | about 230 kB, less with `pele/core` | about 1.6 MB |
| Time to draw | 0.05–0.3 ms | 6–82 ms |
| How it runs | Synchronous, browser or Node | Asynchronous, needs a browser |
| Colours | CSS variables, no redraw | `themeVariables`, redraw |
| Phones | Changes layout | Shrinks the drawing |
| Click callbacks | Ignored (links work) | Supported |
| Look | Pele's own | The reference look |

Speed and size figures are from [pele.run](https://pele.run); you can check them in your own browser in the [typing demo](/#tr-title) and the [200-diagram page](/pages/docs-page.html).

## Choose Pele when

- diagrams redraw while someone types or while an AI answer streams in;
- a page has many diagrams, or download size matters;
- diagrams must follow your theme, including dark mode;
- people read them on phones;
- you render on a server or at build time in Node.

## Keep Mermaid.js when

- your diagrams must look exactly like Mermaid's, for example to match GitHub's rendering;
- you rely on JavaScript click callbacks or plugins;
- you need a feature Pele hasn't matched yet; check with `supports()` and the [gallery](/pages/gallery.html).

Moving over? See [migrating from Mermaid.js](/pages/migrating.html).
