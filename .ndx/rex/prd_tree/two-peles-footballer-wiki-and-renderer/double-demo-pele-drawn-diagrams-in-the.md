---
id: "80ae47c6-4f58-4a1a-813f-6ac1791607b4"
level: "task"
title: "Double demo: Pele-drawn diagrams in the wiki and an 'Under the hood' view"
status: "deferred"
priority: "high"
blockedBy:
  - "dff4820c-f896-43d5-a370-ca7727bd708d"
source: "ndx-capture"
acceptanceCriteria:
  - "At least three wiki pages render Mermaid diagrams with pele, generated from the seed data rather than hand-copied"
  - "Each diagram has a view-source toggle showing its Mermaid text and a link into /diagrams/"
  - "/footballer/scene opens the Graview scene over the same data; record pages link to their place in the scene"
  - "An 'Under the hood' page shows the document and every kind's raw records, and explains how the site is built"
  - "Tests cover a pele-drawn diagram, the scene route and the under-the-hood page"
description: "Deferred past the first release (2026-10-23): the wiki shipped without it. Make the footballer wiki show off both tools. Wiki pages carry Mermaid diagrams drawn by the pele package (career timeline, each World Cup path as a flowchart, club moves), each with a 'view source' toggle and a link to the renderer section. An 'Under the hood' layer exposes the Graview scene, the graview-document and the raw records, with cross-links to the renderer site and graview.dev. The scene itself, its 'See it in the scene' links and the footer's Graview/n-dx credit already shipped with the wiki."
lastModified: "2026-10-23T03:42:29.671Z"
lastModifiedBy: "Nick Daniel <nick@endash.us>"
---
