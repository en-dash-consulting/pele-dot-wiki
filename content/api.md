---
slug: api
order: 38
section: guide
title: "API cheatsheet | pele.wiki"
nav: API cheatsheet
h1: "Pele API cheatsheet"
intro: "Everything in Pele's public API on one page: what each function is for, in plain words. The <a href=\"https://pele.run/api\">official API docs</a> have every detail."
description: "One-page Pele API reference: render, mount, update, parse, supports, detectType, register, renderAsync, PeleError codes and the most useful options."
type: article
---
## Imports

| Import | Use it for |
| --- | --- |
| `pele` | Everything, every diagram type |
| `pele/core` + `pele/diagrams/<type>` | Only the types you `register()`, for a smaller bundle |
| `pele/lazy` | Load each type the first time it's needed (`renderAsync`, `mountAsync`) |
| `pele/global` | A plain `<script>` build with a `pele` global |

## Functions

| Function | What it does |
| --- | --- |
| `render(text, options?)` | Returns `{ svg, width, height, type, links }`. Synchronous. Works in Node. |
| `mount(el, text, options?)` | Draws into `el`, redraws when its width changes. Returns `{ update, refresh, destroy, zoom, result, error }`. |
| `parse(text)` | Checks and reads the text without drawing it. |
| `supports(text)` | `true` if Pele can draw this diagram type. |
| `detectType(text)` | The diagram type, such as `'flowchart'`, or `null`. |
| `register(...types)` | Adds diagram types to `pele/core`. |
| `renderAsync(text)` | From `pele/lazy`: loads the type if needed, then renders. |
| `enableZoom(el)` | Adds zoom and pan to an element holding a diagram. |

## Options you'll actually use

| Option | Default | For |
| --- | --- | --- |
| `maxWidth` | none | Fit the space ([phones](/pages/responsive.html)) |
| `autoDirection` | `true` | Let wide layouts turn downward when narrow |
| `fontFamily` | measured | The label font, when not set in CSS |
| `links`, `images` | `true` | Turn off anything that can reach the network |
| `linkSchemes` | http, https, mailto, tel | Allow e.g. `obsidian:` links |
| `limit`, `maxEdges` | 50,000 / 5,000 | Size limits ([security](/pages/security.html)) |
| `zoom` (mount) | `'auto'` | Zoom buttons for shrunk diagrams |
| `onRender`, `onError` (mount) | none | Hooks after each draw or failure |

## Errors

`render()` throws a `PeleError` with a `code`:

| Code | Means |
| --- | --- |
| `syntax` | The text doesn't parse |
| `semantic` | It parses but doesn't make sense |
| `unsupported-diagram` | Not a type Pele knows (or not registered in `pele/core`) |
| `limit` | Over a size limit |

It also has `line`, `column` and `snippet` for pointing at the problem.
