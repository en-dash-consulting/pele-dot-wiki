# Diagrams in AI chat apps

> Render Mermaid from streaming AI answers with Pele: redraw on every chunk, keep the last good drawing, handle half-written lines, stay safe.

Source: https://pele.wiki/pages/streaming-ai.html · Last updated 2026-10-26

AI models write Mermaid fluently, a few characters at a time. Because Pele draws in well under a millisecond and synchronously, a chat app can redraw the diagram on every chunk, so it grows with the answer instead of appearing at the end.

## The pattern

```js
import { render } from 'pele'

let lastGood = ''
for await (const chunk of stream) {
  mermaid += chunk
  try { lastGood = render(mermaid, { maxWidth: box.clientWidth }).svg } catch {}
  box.innerHTML = lastGood
}
```

1. **Redraw on every chunk.** At 0.05–0.3 ms a render, there's no need to throttle.
2. **Keep the last good drawing.** Mid-stream, the last line is often half-written and won't parse; Pele throws a `PeleError` quickly and you keep showing what you had.
3. **Pass the bubble's width** so the diagram fits the chat column, including on phones.

## Why not just wait for the end?

You can, and many apps do. But a 20-line diagram can take several seconds to stream, and an empty box for that long looks broken. With Pele the reader sees the diagram build up line by line. Compare the two in the [streaming demo](/pages/stream.html).

## Model output is untrusted text

Treat it like any user input. Pele's SVG has no scripts, event handlers or HTML labels, and it blocks `javascript:` links, but show its error messages with `textContent`, keep render options under your control, and consider `links: false, images: false` if diagrams shouldn't reach the network. See the [security guide](/pages/security.html).
