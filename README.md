# pele.wiki

Independent learning site and live demo gallery for [Pele](https://pele.run), kepano's fast Mermaid renderer ([github.com/obsidianmd/pele](https://github.com/obsidianmd/pele)). Made by [En Dash Consulting](https://endash.us). Not affiliated with Obsidian or kepano.

- Stack: Vite multi-page app, strict TypeScript, `content/*.md` → `scripts/build-pages.mjs` (pages, `/md` copies, `llms.txt`, `llms-full.txt`, sitemap).
- Pinned: `pele@1.6.0`, `mermaid@12.1.0` (comparison only, lazy-loaded).
- Analytics: set `gaId` in `site.config.json`; empty means no tag.
- `npm run build`, `npm test` (Playwright + axe), `npm run shots` (review screenshots), `npm run preview` (port 4174).
- Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`; custom domain in `public/CNAME`.
- Planning lives in n-dx (`.ndx/`); `ndx status` / `ndx next`.
