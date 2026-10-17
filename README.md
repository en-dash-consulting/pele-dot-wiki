# pele.wiki

Independent learning site and live demo gallery for [Pele](https://pele.run), kepano's fast Mermaid renderer ([github.com/obsidianmd/pele](https://github.com/obsidianmd/pele)). Made by [En Dash Consulting](https://endash.us). Not affiliated with Obsidian or kepano.

- Stack: Vite multi-page app, strict TypeScript, `content/*.md` → `scripts/build-pages.mjs` (pages, `/md` copies, `llms.txt`, `llms-full.txt`, sitemap).
- Pinned: `pele@1.6.0`, `mermaid@12.1.0` (comparison only, lazy-loaded).
- Design: transit-map style, light and dark via `prefers-color-scheme`. Colour tokens in `src/styles/theme.css`, the one spacing scale (`--s-1` … `--s-9`) in `src/styles/base.css`.
- Demos: `src/demos/*`, markup in `scripts/demo-ui.mjs`. Home, stream, theme lab and phone use `pele/core` with the flowchart registered (`src/lib/pele-lite.ts`, ~31 kB gzip); sequence, state and pie load on demand. Gallery, docs page and safety load full `pele` (~238 kB gzip).
- Performance: each demo's code loads when the reader reaches or touches it (`src/lib/when.ts`; taps made meanwhile are replayed). Mermaid.js loads only when its pane is near the screen. The CSS is inlined into every page, and source maps are published.
- Build-time drawings: the first Pele diagram on home, theme lab and phone ships in the HTML (`src/prerender.json`). After changing a demo, its styles, the examples or the pele version, run `npm run prerender` (it draws them in Chromium with the real fonts, then rebuilds). A stale snapshot is skipped with a warning, and a test fails.
- `npm run og` regenerates `public/og-image.png`.
- Analytics: GA4 `G-F3D7B604E2`, set once in `site.config.json` (empty means no tag). gtag.js loads on the first interaction or once the page is idle; the page view is queued at once. Tests stub Google requests so they never send hits.
- `npm run build`, `npm test` (Playwright + axe), `npm run shots` (review screenshots), `npm run preview` (port 4174).
- Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`; custom domain in `public/CNAME`.
- Planning lives in n-dx (`.ndx/`); `ndx status` / `ndx next`.
