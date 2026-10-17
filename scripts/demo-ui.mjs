// Static markup for demos and the per-theme hero art. Behaviour lives in src/demos/*.ts.

// Topographic contours (direction A): deterministic rings around two vents.
function topo() {
  const rings = []
  const ring = (cx, cy, r, k, seed) => {
    const pts = []
    for (let i = 0; i <= 72; i++) {
      const t = (i / 72) * Math.PI * 2
      const wob = 1 + 0.09 * Math.sin(3 * t + seed) + 0.05 * Math.sin(5 * t + seed * 2) + 0.03 * Math.sin(9 * t + k)
      pts.push([cx + Math.cos(t) * r * wob * 1.35, cy + Math.sin(t) * r * wob])
    }
    return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z'
  }
  for (let k = 1; k <= 14; k++) rings.push(`<path class="${k === 3 ? 'contour lava' : k % 5 === 0 ? 'contour index' : 'contour'}" d="${ring(860, 210, k * 34, k, 1.3)}"/>`)
  for (let k = 1; k <= 7; k++) rings.push(`<path class="contour" d="${ring(300, 470, k * 30, k, 4.1)}"/>`)
  return `<svg class="hero-art art-a" data-art="a" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${rings.join('')}<g class="survey"><circle cx="860" cy="210" r="5"/><text x="874" y="204">VENT 0.05 ms</text><circle cx="300" cy="470" r="4"/></g></svg>`
}

// Transit map (direction B): a diagram's life as metro lines.
function transit() {
  return `<svg class="hero-art art-b" data-art="b" viewBox="0 0 1200 600" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
  <path class="line l1" d="M560 120 H820 L900 200 V420 L980 500 H1180"/>
  <path class="line l2" d="M560 300 H760 L900 300 H1180"/>
  <path class="line l3" d="M700 560 V420 L780 340 H1040 L1120 260 V60"/>
  ${[[560, 120], [820, 120], [900, 300], [1180, 500], [560, 300], [780, 340], [1040, 340], [1120, 60], [700, 560], [1180, 300]].map(([x, y]) => `<circle class="stop" cx="${x}" cy="${y}" r="11"/>`).join('')}
  <circle class="stop interchange" cx="900" cy="300" r="19"/>
  <text x="560" y="96">text</text><text x="820" y="96">parse</text><text x="922" y="276">layout</text><text x="1048" y="372">theme</text><text x="1120" y="40" text-anchor="middle">svg</text><text x="1060" y="530">phone</text>
</svg>`
}

// Risograph overprint (direction C): a flowchart printed in two misregistered inks.
function riso() {
  const shapes = `<rect x="40" y="60" width="210" height="96" rx="6"/><path d="M380 30 L470 108 L380 186 L290 108 Z"/><rect x="520" y="60" width="210" height="96" rx="48"/><path d="M250 108 H290 M470 108 H520" stroke-width="10"/><path d="M380 186 V300" stroke-width="10"/><rect x="275" y="300" width="210" height="96" rx="6"/>`
  return `<svg class="hero-art art-c" data-art="c" viewBox="0 0 780 420" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
  <defs><pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="2.4" class="dot"/></pattern></defs>
  <g class="ink ink-blue" transform="translate(10 10)">${shapes}</g>
  <g class="ink ink-pink">${shapes}</g>
  <circle cx="660" cy="330" r="80" fill="url(#dots)"/>
</svg>`
}

export const HERO_ART = `<div class="hero-art-wrap">${topo()}${transit()}${riso()}</div>`

export const TYPE_RACE = (home = false) => `<section class="demo type-race" aria-labelledby="tr-title" data-type-race>
  <div class="tr-head">
    <h2 id="tr-title">${home ? 'Type a diagram. Watch who keeps up.' : 'Live typing: Pele vs Mermaid.js'}</h2>
    <p class="tr-lede">Both renderers redraw on every keystroke. Pele is synchronous, so it finishes before your next key. Mermaid.js works asynchronously and falls behind.</p>
  </div>
  <div class="tr-bar">
    <button id="tr-auto" type="button" class="button">▶ Auto-type a diagram</button>
    <label for="tr-example" class="visually-hidden">Example diagram</label>
    <select id="tr-example"><option value="flow">Flowchart: checkout</option><option value="seq">Sequence: login</option><option value="state">State: a traffic light</option></select>
    <button id="tr-reset" type="button" class="button secondary">Clear</button>
  </div>
  <div class="tr-grid">
    <div class="tr-editor">
      <label for="tr-src" class="tr-label">Mermaid source <span class="hint">(edit me)</span></label>
      <textarea id="tr-src" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" rows="12"></textarea>
    </div>
    <figure class="tr-pane tr-pele" aria-labelledby="tr-pele-cap">
      <figcaption id="tr-pele-cap"><span class="tr-name">Pele</span> <span class="tr-ver">1.6.0</span><output id="tr-pele-ms" class="tr-ms" aria-live="off">–</output></figcaption>
      <div id="tr-pele" class="tr-canvas" role="img" aria-label="Diagram drawn by Pele"></div>
    </figure>
    <figure class="tr-pane tr-mermaid" aria-labelledby="tr-mm-cap">
      <figcaption id="tr-mm-cap"><span class="tr-name">Mermaid.js</span> <span class="tr-ver">12.1.0</span><output id="tr-mm-ms" class="tr-ms" aria-live="off">loading…</output></figcaption>
      <div id="tr-mm" class="tr-canvas" role="img" aria-label="Diagram drawn by Mermaid.js"></div>
      <p id="tr-mm-lag" class="tr-lag" hidden></p>
    </figure>
  </div>
  <p id="tr-verdict" class="tr-verdict" role="status" aria-live="polite">Start typing, or press Auto-type.</p>
</section>`
