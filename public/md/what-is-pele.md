# What is Pele?

> Pele is an MIT-licensed Mermaid renderer by kepano for Obsidian: Mermaid syntax in, themeable SVG out, synchronous, zero dependencies, about 230 kB gzip.

Source: https://pele.wiki/pages/what-is-pele.html

**Pele is a JavaScript library that turns Mermaid diagram text into SVG.** It was written by kepano (Steph Ango) to make diagrams in Obsidian fast and on-theme, and it is open source under the MIT license at [github.com/obsidianmd/pele](https://github.com/obsidianmd/pele). Official docs live at [pele.run](https://pele.run).

## The short version

| | Pele | Mermaid.js |
| --- | --- | --- |
| Input | Mermaid syntax (targets 12.1.0) | Mermaid syntax |
| Bundle, gzip | about 230 kB | about 1.6 MB |
| Render time | 0.05–0.3 ms | 6–82 ms |
| Direct dependencies | 0 | 23 |
| Small screens | adapts the layout | scales the diagram |
| Theming | CSS variables | theme configuration |

Figures are from [pele.run](https://pele.run); this site's demos measure them live in your browser.

## What it is not

Pele is not a new diagram language and not a drawing tool. It reads Mermaid's syntax, so existing diagrams and the Mermaid that AI models already write keep working. Its layout and visual style are its own, so a diagram will look different from Mermaid.js's version.
