# The Pele line: six live demos

> Six playable Pele demos: live typing, streaming AI answers, CSS theming, phone layouts, a 200-diagram page and hostile input, each next to Mermaid.js.

Source: https://pele.wiki/pages/demos.html · Last updated 2026-10-17

Each stop is one idea you can play with in under a minute. They all run the real pele package in your browser, and most race it against the real Mermaid.js so you can judge for yourself.



## How the comparisons are kept fair

Both libraries are fully downloaded before any race starts, both render the same Mermaid text, and times are measured with `performance.now()` in your own browser. Pele's numbers are the median of recent renders, after a few warm-up renders, which is what an editor sees once you've been typing for a second. Mermaid.js uses its default settings with `securityLevel: 'strict'`.
