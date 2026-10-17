import { resolve } from 'path'
import { readdirSync, existsSync } from 'fs'
import { defineConfig } from 'vite'

const dir = resolve(__dirname, 'pages')
const pages = existsSync(dir)
  ? Object.fromEntries(readdirSync(dir).filter(f => f.endsWith('.html')).map(f => [f.replace(/\.html$/, ''), resolve(dir, f)]))
  : {}

export default defineConfig({
  base: '/',
  build: {
    chunkSizeWarningLimit: 1600, // Mermaid.js (comparison only, lazy-loaded) is big on purpose
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), notfound: resolve(__dirname, '404.html'), ...pages } },
  },
})
