# pele.wiki

Independent learning site and live demo gallery for [Pele](https://pele.run), kepano's fast Mermaid renderer ([github.com/obsidianmd/pele](https://github.com/obsidianmd/pele)). Made by [En Dash Consulting](https://endash.us). Not affiliated with Obsidian or kepano.

- Two Pelés, kept apart: every URL at `/` and `/pages/*.html` is about the renderer and says nothing about the footballer above the footer. Pelé the footballer has his own wiki at `/footballer/`, reached from one footer line, the About page and the JSON-LD.
- Footballer wiki (`/footballer/`): a Graview app. The declaration is `src/footballer/data/app.json` (a `graview-document`), the data `src/footballer/data/seed.json` (every record sourced; `npm run check:footballer` checks both). `src/footballer/ui.tsx` draws the wiki's own pages over Graview's routed face (`main.tsx`, `@graview/embed` with address routing; the scene is at `/footballer/places/overview`). `scripts/build-footballer.mjs` runs after `vite build`: it renders every route from the same components (`ssr.tsx`) into a real HTML file with its own JSON-LD, writes `sitemap-footballer.xml`, `/footballer/llms.txt`, `llms-full.txt` and `/md/footballer/**`. Graview and React load only on `/footballer/`. Photos in `public/footballer/img/` are public domain or CC, credited on the record.
- The dock (`scripts/dock.mjs`, `src/styles/dock.css`) sits at the foot of the footballer wiki only: built with Graview, and the way back to the renderer.
- Stack: Vite multi-page app, strict TypeScript, `content/*.md` → `scripts/build-pages.mjs` (pages, `/md` copies, `llms.txt`, `llms-full.txt`, sitemap).
- Pinned: `pele@1.6.0`, `mermaid@12.1.0` (comparison only, lazy-loaded).
- Design: transit-map style, light and dark via `prefers-color-scheme`. Colour tokens in `src/styles/theme.css`, the one spacing scale (`--s-1` … `--s-9`) in `src/styles/base.css`.
- Demos: `src/demos/*`, markup in `scripts/demo-ui.mjs`. Home, stream, theme lab and phone use `pele/core` with the flowchart registered (`src/lib/pele-lite.ts`, ~31 kB gzip); sequence, state and pie load on demand. Gallery, docs page and safety load full `pele` (~238 kB gzip).
- Performance: each demo's code loads when the reader reaches or touches it (`src/lib/when.ts`; taps made meanwhile are replayed). Mermaid.js loads only when its pane is near the screen. The CSS is inlined into every page, and source maps are published.
- Build-time drawings: the first Pele diagram on home, theme lab and phone ships in the HTML (`src/prerender.json`). After changing a demo, its styles, the examples or the pele version, run `npm run prerender` (it draws them in Chromium with the real fonts, then rebuilds). A stale snapshot is skipped with a warning, and a test fails.
- `npm run og` regenerates `public/og-image.png`.
- Analytics: GA4 `G-F3D7B604E2`, set once in `site.config.json` (empty means no tag). gtag.js loads on the first interaction or once the page is idle; the page view is queued at once. Tests stub Google requests so they never send hits.
- `npm run build`, `npm test` (Playwright + axe), `npm run shots` (review screenshots), `npm run preview` (port 4174).
- Every pull request runs `.github/workflows/ci.yml`: build, `npm run check:footballer`, and the Playwright + axe suite (it also crawls every URL in `sitemap-footballer.xml` for status, canonical, title, description, one h1 and JSON-LD).
- Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`; custom domain in `public/CNAME`. Both workflows check out full history: page dates come from git.
- Planning lives in n-dx (`.ndx/`); `ndx status` / `ndx next`.
