import { resolve } from 'path'
import { readdirSync, existsSync } from 'fs'
import { defineConfig, type Plugin } from 'vite'

const dir = resolve(__dirname, 'pages')
const pages = existsSync(dir)
  ? Object.fromEntries(readdirSync(dir).filter(f => f.endsWith('.html')).map(f => [f.replace(/\.html$/, ''), resolve(dir, f)]))
  : {}

// The whole stylesheet is about 7 KB gzipped, so it ships inside each page: no render-blocking request.
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        return html.replace(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/g, (tag, file: string) => {
          const asset = ctx.bundle?.[file]
          if (!asset || asset.type !== 'asset') return tag
          const css = String(asset.source).replace(/\/\*# sourceMappingURL=[^*]*\*\/\s*$/, '')
          return `<style>${css}</style>`
        })
      },
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [inlineCss()],
  build: {
    sourcemap: true, // public source maps: readable stack traces, and Lighthouse's best-practices check
    chunkSizeWarningLimit: 1600, // Mermaid.js (comparison only, lazy-loaded) is big on purpose
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), notfound: resolve(__dirname, '404.html'), footballer: resolve(__dirname, 'footballer/index.html'), ...pages } },
  },
})
