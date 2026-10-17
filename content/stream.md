---
slug: stream
order: 12
section: demo
demo: stream
title: "Stream a Mermaid Diagram From an AI Answer | pele.wiki"
nav: Stream an AI answer
h1: "Stream an AI answer"
intro: "Pele can redraw a diagram on every chunk of a streaming AI answer. Press <strong>Ask</strong> and watch both chat apps receive the same answer at the same speed."
description: "Live demo: an AI answer streams a Mermaid diagram. Pele draws it line by line as it arrives; Mermaid.js catches up in jumps. Same text, same speed."
type: demo
---
<!-- demo -->

## What you just saw

Both chat apps try to redraw the diagram every time a new chunk of the answer arrives. Pele finishes each redraw in a fraction of a millisecond, so the diagram grows in step with the text. Mermaid.js takes tens of milliseconds per redraw and works asynchronously, so by the time it finishes one, several chunks have already arrived; it skips ahead and the diagram appears in jumps.

Half-written lines are normal while streaming. Pele throws a quick error on text it can't parse yet, and the demo simply keeps the last good drawing until the next chunk arrives.

<div class="takeaway"><p>If your app shows diagrams from an AI model, Pele lets the diagram appear while the answer is still arriving, instead of after.</p></div>

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
