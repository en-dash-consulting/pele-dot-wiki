# Demos

> Six Pele demos: typing, streaming, CSS theming, narrow screens, a 200-diagram page and untrusted input, each next to Mermaid.js.

Source: https://pele.wiki/pages/demos.html · Last updated 2026-10-26

Six demos, one idea each. All run the real pele package in your browser; most run Mermaid.js beside it on the same text.



## How the timings are taken

Both libraries are fully downloaded before a timing starts, both render the same Mermaid text, and times are measured with `performance.now()` in your own browser. Pele's numbers are the median of recent renders, after a few warm-up renders, which is what an editor sees once you've been typing for a second. Mermaid.js uses its default settings with `securityLevel: 'strict'`.
