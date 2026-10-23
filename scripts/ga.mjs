// Google Analytics, shared by every page builder.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
// Google Analytics: set "gaId" in site.config.json (e.g. "G-XXXXXXX"). Empty means no tag is emitted.
const GA_ID = (process.env.GA_ID ?? JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8')).gaId ?? '').trim()
if (GA_ID && !/^G-[A-Z0-9]+$/.test(GA_ID)) throw new Error(`site.config.json gaId looks wrong: ${GA_ID}`)
// GA: calls are queued at once (so the page view keeps its real start time), but gtag.js itself is only
// fetched on the first interaction or once the page is loaded and idle, so it never delays first paint.
export const GA = GA_ID ? `<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments)} gtag('js', new Date()); gtag('config', '${GA_ID}');
  (function(){var done=0,evs=['pointerdown','keydown','scroll','touchstart'];function go(){if(done)return;done=1;evs.forEach(function(e){removeEventListener(e,go,true)});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(s)}
  evs.forEach(function(e){addEventListener(e,go,{capture:true,passive:true})});addEventListener('load',function(){if(window.requestIdleCallback)requestIdleCallback(go,{timeout:3500});else setTimeout(go,2000)})})();</script>` : ''
