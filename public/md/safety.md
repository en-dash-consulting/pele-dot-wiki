# Paste anything

> Live demo: feed Pele hostile Mermaid text: script tags, javascript: links, huge inputs. See that the SVG has no scripts and nothing ever runs.

Source: https://pele.wiki/pages/safety.html · Last updated 2026-10-17

Pele's output is plain SVG with no scripts, so pasted diagram text can't run code. Tap a nasty example or paste your own; the checklist shows what reached the page.

*(Interactive demo: open https://pele.wiki/pages/safety.html)*

## What you just saw

Pele never turns diagram text into HTML. Labels become SVG text: HTML tags such as `<script>` are dropped and only the words between them are kept, so nothing can run. JavaScript click callbacks are ignored, `javascript:`, `data:` and `vbscript:` links are always removed, and styles are filtered. Diagrams that are too big (over 50,000 characters, or more than 5,000 arrows in a flowchart) are refused before any work starts, so a one-line diagram can't freeze the tab.

To be fair to Mermaid.js: in its default `strict` mode it also cleans its output and has its own size and edge limits. The difference is that Pele's output contains no HTML in the first place, so there is less to clean.

<div class="takeaway"><p>You can show diagrams written by anyone, as long as you show Pele's error messages as text.</p></div>

## Your part

```js
import { PeleError, render } from 'pele'

try {
  el.innerHTML = render(source).svg
} catch (error) {
  if (!(error instanceof PeleError)) throw error
  el.textContent = error.message // never innerHTML: it can quote the diagram
}
```

Also: only supply icons from a set you trust, treat internal links as note names, and don't let diagram authors set render options. The [security guide](/pages/security.html) covers each.
