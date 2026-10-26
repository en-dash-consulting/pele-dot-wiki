# What is Pele?

> Pele is an MIT-licensed Mermaid renderer by kepano for Obsidian: Mermaid text in, themeable SVG out, synchronous, zero dependencies, about 230 kB gzip.

Source: https://pele.wiki/pages/what-is-pele.html · Last updated 2026-10-26

Pele is an open-source JavaScript library that draws Mermaid diagrams as SVG. kepano (Steph Ango, CEO of Obsidian) wrote it for Obsidian, so that diagrams draw instantly and match the user's theme. Mermaid text in, SVG out, synchronously, with no dependencies.

## The short version

| Question | Pele | Mermaid.js |
| --- | --- | --- |
| Reads | Mermaid text (targets 12.1.0) | Mermaid text |
| Download size (gzip) | about 230 kB | about 1.6 MB |
| Time to draw a diagram | 0.05–0.3 ms | 6–82 ms |
| Direct dependencies | 0 | 23 |
| On a narrow screen | changes the layout | shrinks the drawing |
| Colours | CSS variables | theme settings, then redraw |
| Works without a browser | yes, in Node | needs a browser or a headless one |

Figures are from the official site, [pele.run](https://pele.run). The [demos on this site](/pages/demos.html) measure them live in your own browser.

## Who made it

[kepano](https://github.com/kepano). The source is at [obsidianmd/pele](https://github.com/obsidianmd/pele), and it was announced on 17 October 2026 as part of work on making Obsidian faster. It is named after Pele, the Hawaiian goddess of volcanoes and fire.

## What it is not

- **Not a new diagram language.** It reads Mermaid, so your existing diagrams, and the Mermaid that AI models already write, keep working.
- **Not a drawing tool.** There is no canvas to drag boxes around.
- **Not a pixel-perfect Mermaid clone.** It lays diagrams out its own way, so they look different. See [migrating from Mermaid.js](/pages/migrating.html).

## How it works

Pele has its own parser for each diagram type, tested against Mermaid's own parser tests and fuzzed against Mermaid's parser. It measures label text, lays the diagram out, and writes an SVG string whose colours point at CSS variables. Because each step is plain synchronous JavaScript, a diagram is ready by the time `render()` returns.

## Is it ready to use?

It is young: version 1.0.1 shipped on 6 October 2026 and new versions arrive every few days. Pin an exact version in production and read the [changelog on GitHub](https://github.com/obsidianmd/pele) before upgrading. This site uses pele 1.6.0.
