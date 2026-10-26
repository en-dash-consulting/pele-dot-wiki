---
slug: demos
order: 10
section: demo
title: "Demos | pele.wiki"
nav: Demos
h1: "Demos"
intro: "Six demos, one idea each. All run the real pele package in your browser; most run Mermaid.js beside it on the same text."
description: "Six Pele demos: typing, streaming, CSS theming, narrow screens, a 200-diagram page and untrusted input, each next to Mermaid.js."
type: hub
---
<!-- hub -->

## How the timings are taken

Both libraries are fully downloaded before a timing starts, both render the same Mermaid text, and times are measured with `performance.now()` in your own browser. Pele's numbers are the median of recent renders, after a few warm-up renders, which is what an editor sees once you've been typing for a second. Mermaid.js uses its default settings with `securityLevel: 'strict'`.
