---
slug: faq
order: 50
title: "FAQ | pele.wiki"
nav: FAQ
h1: "FAQ"
intro: "Short answers about Pele. Each links to the page with the detail."
description: "Answers about Pele: what it is, who made it, Mermaid compatibility, speed, size, theming, phones, safety, Node, licence, and when to keep Mermaid.js."
type: faq
---
## What is Pele?

Pele is an open-source JavaScript library that draws Mermaid diagram text as SVG. It is synchronous, has no dependencies, takes its colours from CSS variables and changes layout to fit small screens. It was built for Obsidian and is MIT licensed.

## Who made Pele?

Pele was made by kepano (Steph Ango), the CEO of Obsidian. Its source is at github.com/obsidianmd/pele and its official docs are at pele.run. It was announced on 17 October 2026.

## Is Pele a replacement for Mermaid.js?

Mostly. It reads the same Mermaid text and supports every diagram type built into Mermaid 12.1.0. Diagrams look different because Pele uses its own layout, and it doesn't support JavaScript click callbacks or plugins such as ZenUML.

## How much faster than Mermaid.js is Pele?

The official site reports 0.05–0.3 ms per diagram for Pele against 6–82 ms for Mermaid.js, roughly 100 to 500 times faster. The typing demo on the home page measures both in your own browser.

## How big is Pele?

About 230 kB gzipped with every diagram type, against about 1.6 MB for Mermaid.js. Using pele/core and registering only the types you need makes it smaller.

## How do I change Pele's colours?

Set CSS variables such as --pele-bg, --pele-fg, --pele-line and --pele-accent on the diagram or a parent element. Colours change without a redraw, so dark mode is just a media query.

## Does Pele work on phones?

Yes. Given the available width, Pele changes the layout instead of shrinking it: below 640 pixels a left-to-right flowchart can run top to bottom, so the text stays readable. mount() does this automatically.

## Is Pele safe for diagrams written by users or AI?

It is designed for that. Its SVG has no scripts, event handlers or HTML labels, javascript: and data: links are blocked, and oversized diagrams are refused. Show its error messages with textContent and keep render options under your control.

## Can I use Pele in Node or at build time?

Yes. render() is plain synchronous JavaScript and works in Node, so you can turn Mermaid into SVG at build time and ship static images.

## Can I stream diagrams from an AI model with Pele?

Yes. Redraw on every chunk and keep the last good drawing when a half-written line doesn't parse yet. Each redraw takes well under a millisecond.

## What licence is Pele under?

MIT. The test specs and grammar files that come from Mermaid are also MIT licensed.

## When should I keep using Mermaid.js?

When you need Mermaid's exact look, JavaScript click callbacks, plugins such as ZenUML, or a feature Pele does not support yet. supports() tells you per diagram.

## Who makes pele.wiki?

pele.wiki is an independent learning site by En Dash Consulting. It is not affiliated with or endorsed by Obsidian or kepano.
