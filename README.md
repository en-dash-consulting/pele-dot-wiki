# pele.wiki

Independent learning site and live demo gallery for [Pele](https://pele.run), kepano's fast Mermaid renderer ([github.com/obsidianmd/pele](https://github.com/obsidianmd/pele)). Made by [En Dash Consulting](https://endash.us). Not affiliated with Obsidian or kepano.

- Stack: Vite multi-page app, strict TypeScript, `content/*.md` → `scripts/build-pages.mjs` (pages, `/md` copies, `llms.txt`, `llms-full.txt`, sitemap).
- Pinned: `pele@1.6.0`, `mermaid@12.1.0` (comparison only, lazy-loaded).
- Design: transit-map style, light and dark via `prefers-color-scheme`. Colour tokens in `src/styles/theme.css`, the one spacing scale (`--s-1` … `--s-9`) in `src/styles/base.css`.
- Demos: `src/demos/*`, markup in `scripts/demo-ui.mjs`. Home, stream, theme lab and phone use `pele/core` with four diagram types (`src/lib/pele-lite.ts`, ~75 kB gzip); gallery, docs page and safety load full `pele` (~238 kB gzip).
- `npm run og` regenerates `public/og-image.png`.
- Analytics: GA4 `G-F3D7B604E2`, set once in `site.config.json` (empty means no tag). Tests stub Google requests so they never send hits.
- `npm run build`, `npm test` (Playwright + axe), `npm run shots` (review screenshots), `npm run preview` (port 4174).
- Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`; custom domain in `public/CNAME`.
- Planning lives in n-dx (`.ndx/`); `ndx status` / `ndx next`.
