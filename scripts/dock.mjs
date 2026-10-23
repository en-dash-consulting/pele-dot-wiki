// The dock fixed to the foot of every page on both halves of the site: what built it, and the way to the
// other Pelé. It shrinks to the two marks; the choice is remembered, and set before paint so nothing jumps.
const GRAVIEW = '<svg class="dock-gv" viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M13 11 L3 8 L14 3 H29 L21 9"/><path d="M10 18 L3 23 L16.5 28 L29 21 L22 19"/><path d="M16.5 18.5 V23.5" stroke-linecap="round"/></g><circle cx="16.5" cy="13.5" r="2.2" fill="#00e5b9"/></svg>'
const OTHER = {
  // On the renderer's pages, the way to the footballer; on the footballer's, the way to the renderer.
  renderer: { href: '/footballer/', mark: '<span class="dock-ten" aria-hidden="true">10</span>', full: '<span class="dock-long">Looking for </span><b>Pelé the footballer</b><span class="dock-long">? The wiki</span>', label: 'Pelé the footballer: the wiki' },
  footballer: { href: '/', mark: '<img src="/brand/pele.svg" alt="" width="24" height="18" />', full: '<span class="dock-long">Looking for the diagram tool? </span><b>Pele</b><span class="dock-long">, the Mermaid renderer</span><span class="dock-short">, the diagram tool</span>', label: 'Pele, the Mermaid diagram renderer' },
}
export function dock(side) {
  const o = OTHER[side]
  return `<aside class="dock" aria-label="About this site">
    <p class="dock-full"><a href="https://graview.dev">${GRAVIEW}<span><span class="dock-long">Built with </span><b>Graview</b></span></a><span class="dock-and">and</span><a href="https://github.com/en-dash-consulting/n-dx"><b>n-dx</b></a><span class="dock-sep" aria-hidden="true"></span><a href="${o.href}">${o.mark}<span>${o.full}&nbsp;→</span></a></p>
    <p class="dock-mini"><a href="https://graview.dev" aria-label="Built with Graview">${GRAVIEW}</a><a href="${o.href}" aria-label="${o.label}">${o.mark}</a></p>
    <button type="button" class="dock-toggle" aria-expanded="true" aria-label="Shrink this bar"><span aria-hidden="true"></span></button>
  </aside>
  <script>(function(){var h=document.documentElement,b=document.querySelector('.dock-toggle');function set(min,keep){h.classList.toggle('dock-min',min);b.setAttribute('aria-expanded',String(!min));b.setAttribute('aria-label',min?'Show the full bar':'Shrink this bar');if(keep)try{localStorage.setItem('pw-dock',min?'min':'full')}catch(e){}}var m=false;try{m=localStorage.getItem('pw-dock')==='min'}catch(e){}set(m);b.addEventListener('click',function(){set(!h.classList.contains('dock-min'),true)})})();</script>`
}
