# Streaming

> Demo: a Mermaid diagram arrives in chunks, as from an AI model. Pele redraws on each chunk; Mermaid.js catches up in jumps.

Source: https://pele.wiki/pages/stream.html · Last updated 2026-10-17

A diagram redrawn on every chunk of a streaming answer. Press Ask: both chat windows receive the same answer at the same speed.

*(Interactive demo: open https://pele.wiki/pages/stream.html)*

## What happens

Both chat apps try to redraw the diagram every time a new chunk of the answer arrives. Pele finishes each redraw in a fraction of a millisecond, so the diagram grows in step with the text. Mermaid.js takes tens of milliseconds per redraw and works asynchronously, so by the time it finishes one, several chunks have already arrived; it skips ahead and the diagram appears in jumps.

Half-written lines are normal while streaming. Pele throws a quick error on text it can't parse yet, and the demo simply keeps the last good drawing until the next chunk arrives.

## How to build this

```js
import { render } from 'pele'

let lastGood = ''
function onChunk(mermaidSoFar) {
  try { lastGood = render(mermaidSoFar, { maxWidth: box.clientWidth }).svg } catch {}
  box.innerHTML = lastGood
}
```

More in the [streaming and AI apps guide](/pages/streaming-ai.html).
