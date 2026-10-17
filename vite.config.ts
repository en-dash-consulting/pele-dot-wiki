import { resolve } from 'path'
import { readdirSync, existsSync } from 'fs'
import { defineConfig } from 'vite'

const dir = resolve(__dirname, 'pages')
const pages = existsSync(dir)
  ? Object.fromEntries(readdirSync(dir).filter(f => f.endsWith('.html')).map(f => [f.replace(/\.html$/, ''), resolve(dir, f)]))
  : {}

export default defineConfig({
  base: '/',
  build: { rollupOptions: { input: { main: resolve(__dirname, 'index.html'), ...pages } } },
})
