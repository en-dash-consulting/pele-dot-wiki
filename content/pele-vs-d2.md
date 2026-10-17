---
slug: pele-vs-d2
order: 42
section: compare
title: "Pele vs D2: Mermaid Text or a New Diagram Language? | pele.wiki"
nav: Pele vs D2
h1: "Pele vs D2"
intro: "<strong>D2 is a separate diagram language with strong layout control, run as a Go program or WebAssembly. Pele draws the Mermaid you already write, in plain JavaScript, in well under a millisecond.</strong> Choose D2 for big, carefully laid-out architecture diagrams; choose Pele for fast diagrams inside apps and docs."
description: "Pele vs D2 (Terrastruct): Mermaid syntax vs the D2 language, JavaScript vs Go or WebAssembly, speed, theming, and which suits apps, docs and architecture."
type: compare
---
## Side by side

| Question | Pele | D2 |
| --- | --- | --- |
| Language | Mermaid, widely known and written by AI models | D2, its own language |
| Made by | kepano / Obsidian | Terrastruct |
| Runs as | A JavaScript library | A Go command-line tool, or WebAssembly in the browser |
| Layout | Pele's own, automatic | A choice of layout engines, plus manual positions |
| Speed | Built for live redraws | Built for build-time rendering |
| Theming | CSS variables | Built-in themes, sketch mode |

## Choose D2 when

- you're drawing large architecture or infrastructure diagrams and want fine control over layout;
- you're happy to learn a new language and render at build time.

## Choose Pele when

- your text is already Mermaid, or comes from an AI model;
- diagrams are drawn in the browser, live, many times;
- they should pick up your site's CSS theme.

D2 facts are from [d2lang.com](https://d2lang.com). This page will be updated if either tool changes.
