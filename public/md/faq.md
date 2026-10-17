# Pele FAQ

> Answers about Pele, kepano's Mermaid renderer: what it is, Mermaid compatibility, speed, bundle size, theming, security, licence and when to use Mermaid.js instead.

Source: https://pele.wiki/pages/faq.html

## What is Pele?

Pele is an open-source JavaScript library by kepano (Steph Ango) that renders Mermaid diagram syntax to themeable SVG, synchronously and with zero dependencies. It was built for Obsidian and is MIT licensed.

## Is Pele compatible with Mermaid?

Pele reads Mermaid syntax and supports every diagram type built into Mermaid 12.1.0. Its parsers run Mermaid's own parser specs and are fuzzed against Mermaid's parser. Layout and visual style are Pele's own, so diagrams look different from Mermaid.js.

## How much faster is Pele than Mermaid.js?

The official site reports 0.05–0.3 ms per render for Pele versus 6–82 ms for Mermaid.js, and about 230 kB gzip versus 1.6 MB. The live typing demo on the pele.wiki home page measures both in your own browser.

## How do I theme Pele diagrams?

Set CSS variables such as --pele-bg, --pele-fg, --pele-accent and --pele-font on the .pele element or a parent. Colour changes apply without re-rendering the diagram.

## Is it safe to render diagrams from users?

Pele's SVG output contains no scripts, event handlers or HTML, Pele never runs code from a diagram, links and images are limited to web addresses by default, and source and output sizes are limited.

## When should I keep using Mermaid.js?

Keep Mermaid.js if you need its exact visual output, its click callbacks and interactivity, or plugins built on it.

## Who makes pele.wiki?

pele.wiki is an independent learning site by En Dash Consulting. It is not affiliated with Obsidian or kepano. Pele itself is at pele.run and github.com/obsidianmd/pele.
