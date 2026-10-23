---
id: "ce51e592-c4ae-467c-8200-75bb74977e13"
level: "task"
title: "Move the renderer site under /diagrams/ and add the 'Which Pelé?' front door"
status: "pending"
priority: "high"
source: "ndx-capture"
acceptanceCriteria:
  - "Every former renderer page is served under /diagrams/ with its content, demos and build-time drawings intact"
  - "Every old URL (/ home content and /pages/*.html) has a stub with rel=canonical to its new /diagrams/ URL, a meta refresh and a visible link"
  - "/ is a two-door 'Which Pelé?' page linking to /footballer/ and /diagrams/, light and dark, accessible at phone width"
  - "Internal links, nav, breadcrumbs, sitemap.xml, llms.txt, llms-full.txt and /md copies use the new URLs"
  - "npm run build and npm test (Playwright + axe) pass; tests cover the redirect stubs and the front door"
description: "Gather every Pele-the-renderer page into one section at /diagrams/ (old home at /diagrams/, /pages/<slug>.html at /diagrams/<slug>.html). GitHub Pages cannot redirect, so each old URL keeps a stub with rel=canonical to the new URL, meta refresh and a plain link. / becomes a striking two-door front page: Pelé the footballer (→ /footballer/) and Pele the Mermaid renderer (→ /diagrams/), with disambiguation copy that serves both audiences and search engines."
lastModified: "2026-10-23T02:03:37.436Z"
lastModifiedBy: "Nick Daniel <nick@endash.us>"
---
