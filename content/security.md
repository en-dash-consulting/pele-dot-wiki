---
slug: security
order: 36
section: guide
title: "Untrusted diagrams | pele.wiki"
nav: Security
h1: "Rendering untrusted diagrams safely"
intro: "<strong>Yes, Pele is designed to draw diagrams written by anyone.</strong> Its SVG contains no scripts, event handlers or HTML labels, dangerous links are removed, and oversized diagrams are refused. Your app still has a few jobs, listed below."
description: "How Pele handles untrusted Mermaid: no scripts or HTML in its SVG, blocked javascript: links, size and edge limits, and the four things your app must still do."
type: article
---
## What Pele guarantees

- **No code from the diagram ever runs.** Labels are SVG text. HTML tags in a label are dropped and only their words are kept; bold and italic turn into text styles. JavaScript `click` callbacks are ignored.
- **Links are filtered.** Allowed by default: relative links and `http`, `https`, `mailto`, `tel` (and `http`, `https` for images). `javascript:`, `data:` and `vbscript:` are always blocked.
- **Styles are filtered** before they reach the SVG.
- **Size limits:**

| Limit | Default | Option |
| --- | --- | --- |
| Diagram text | 50,000 characters | `limit` |
| SVG output | 4,000,000 characters | `outputLimit` |
| Arrows in a flowchart or agent flow | 5,000 | `maxEdges` |

There's no time limit; if you need one, render in a Web Worker you can stop.

## What your app must do

1. **Show errors as text.** Use `textContent`, never `innerHTML`: error messages can quote the diagram.
2. **Only supply trusted icons.** Markup returned by your `icons` function is inserted as-is.
3. **Treat internal links as note names.** For links with `internal: true`, apply your own navigation rules.
4. **Keep the options to yourself.** Don't let diagram authors pass render options or `config`.

Want your own sanitizer too? Pass `sanitize` to `mount()`; it runs before each SVG goes in.

Try to break it in the [paste-anything demo](/pages/safety.html). Found a real problem? Report it privately through [Pele's security advisories](https://github.com/obsidianmd/pele/security/advisories/new).
