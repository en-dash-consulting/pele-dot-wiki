// Static markup for demos and the hero art. Behaviour lives in src/demos/*.ts.
import { readFileSync } from 'node:fs'

const EXAMPLES = JSON.parse(readFileSync(new URL('../src/demos/examples.json', import.meta.url), 'utf8'))
const PRESETS = JSON.parse(readFileSync(new URL('../src/demos/theme-presets.json', import.meta.url), 'utf8'))
const D = PRESETS.day
const BOARD_STYLE = [`--pele-bg: ${D.bg};`, `--pele-fg: ${D.fg};`, `--pele-line: ${D.line};`, `--pele-surface: ${D.surface};`, `--pele-surface-alt: ${D.surface};`, `--pele-border: ${D.border};`, `--pele-accent: ${D.accent};`, `--pele-muted: ${D.fg};`,
  ...D.series.map((c, i) => `--pele-series-${i + 1}: ${c};`), `--pele-font: system-ui, sans-serif;`, `--pele-radius: 4px;`].join(' ')
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const TYPE_RACE = () => `<section class="demo type-race" aria-labelledby="tr-title" data-type-race>
  <div class="tr-bar">
    <h2 id="tr-title" class="tr-title"><span class="roundel" aria-hidden="true">1</span> Type a diagram</h2>
    <div class="tr-controls">
      <button id="tr-auto" type="button" class="button" aria-pressed="false"><span aria-hidden="true">▶</span> Auto-type</button>
      <label for="tr-example" class="visually-hidden">Example diagram</label>
      <select id="tr-example"><option value="big">Order lifecycle, 36 nodes</option><option value="flow">Checkout, 8 nodes</option><option value="seq">Login sequence</option><option value="state">Traffic-light states</option></select>
    </div>
  </div>
  <div id="tr-scale" class="tr-scale" hidden>
    <p class="tr-scale-row"><span class="tr-scale-name">Pele</span><span class="tr-scale-track"><span id="tr-scale-pele" class="tr-scale-bar"></span></span><output id="tr-scale-pele-ms" class="tr-ms"></output></p>
    <p class="tr-scale-row"><span class="tr-scale-name">Mermaid.js</span><span class="tr-scale-track"><span id="tr-scale-mm" class="tr-scale-bar"></span></span><output id="tr-scale-mm-ms" class="tr-ms"></output></p>
    <p class="tr-scale-key">Time per redraw, to scale. The mark is one frame at 60 fps (16.7 ms). A redraw that takes longer than a frame is felt on every keystroke; one that takes a fraction of a frame is not.</p>
  </div>
  <p id="tr-verdict" class="tr-verdict" role="status" aria-live="polite">Press <strong>Auto-type</strong>, or type in the box. Both redraw on every keystroke.</p>
  <div class="tr-grid">
    <div class="tr-editor">
      <label for="tr-src" class="tr-label">Mermaid text <span class="hint">· edit me</span></label>
      <textarea id="tr-src" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" rows="11">${esc(EXAMPLES.big)}</textarea>
    </div>
    <figure class="tr-pane tr-pele">
      <figcaption><span class="tr-name">Pele</span><span class="tr-ms-wrap">each redraw <output id="tr-pele-ms" class="tr-ms">–</output></span></figcaption>
      <div id="tr-pele" class="tr-canvas" role="img" tabindex="0" aria-label="The diagram as drawn by Pele, updated on every keystroke"></div>
    </figure>
    <figure class="tr-pane tr-mermaid">
      <figcaption><span class="tr-name">Mermaid.js</span><span class="tr-ms-wrap">each redraw <output id="tr-mm-ms" class="tr-ms">waiting…</output></span></figcaption>
      <div id="tr-mm" class="tr-canvas" role="img" tabindex="0" aria-label="The same diagram as drawn by Mermaid.js"></div>
      <p id="tr-mm-lag" class="tr-lag" hidden></p>
    </figure>
  </div>
</section>`

export const STREAM = () => `<section class="demo stream" aria-labelledby="st-title" data-demo="stream">
  <h2 id="st-title" class="visually-hidden">Live demo: a diagram streaming in a chat answer</h2>
  <div class="demo-bar">
    <button id="st-ask" type="button" class="button"><span aria-hidden="true">▶</span> Ask</button>
    <span class="bar-field"><label for="st-speed" class="bar-label">Model speed</label>
    <select id="st-speed"><option value="90">Fast (about 90 tokens a second)</option><option value="45" selected>Typical (about 45 a second)</option><option value="15">Slow (about 15 a second)</option></select></span>
  </div>
  <div class="chat-grid">
    ${['pele', 'mm'].map(k => `<figure class="chat ${k === 'pele' ? 'chat-pele' : 'chat-mm'}">
      <figcaption><span class="tr-name">${k === 'pele' ? 'Chat app drawing with Pele' : 'Chat app drawing with Mermaid.js'}</span></figcaption>
      <div class="chat-body">
        <p class="bubble you">How does our checkout work? Draw it.</p>
        <div class="bubble bot"><p id="st-${k}-text" class="bot-text"></p><div id="st-${k}-dia" class="chat-dia" role="img" aria-label="Diagram in the answer, ${k === 'pele' ? 'drawn by Pele' : 'drawn by Mermaid.js'}"></div><p id="st-${k}-after" class="bot-text"></p></div>
      </div>
      <p class="chat-foot"><output id="st-${k}-count">Not started</output></p>
    </figure>`).join('')}
  </div>
  <p id="st-verdict" class="tr-verdict" role="status" aria-live="polite"></p>
</section>`

export const THEME_LAB = () => `<section class="demo lab" aria-labelledby="lab-title" data-demo="theme-lab">
  <h2 id="lab-title" class="visually-hidden">Live demo: restyle diagrams with CSS variables</h2>
  <div class="lab-grid">
    <div class="lab-controls">
      <fieldset class="lab-presets"><legend>Pick a look</legend><div id="lab-presets" class="chip-row">${Object.entries(PRESETS).map(([k, p]) => `<button type="button" class="chip" data-preset="${k}" aria-pressed="${k === 'day'}"><span class="dot" style="--c:${p.accent}" aria-hidden="true"></span>${p.label}</button>`).join('')}</div></fieldset>
      <fieldset><legend>Or fine-tune it</legend>
        <div class="lab-colors">
          ${[['bg', 'Background'], ['fg', 'Text'], ['line', 'Lines'], ['surface', 'Box fill'], ['border', 'Box border'], ['accent', 'Accent']].map(([k, l]) => `<label class="swatch"><input type="color" id="lab-${k}" data-var="--pele-${k}" value="${PRESETS.day[k]}" /><span>${l}</span></label>`).join('')}
        </div>
        <label class="lab-field" for="lab-font">Font</label>
        <select id="lab-font"><option value="system-ui, sans-serif">System</option><option value="'Montserrat', system-ui, sans-serif">Montserrat</option><option value="'Merriweather', Georgia, serif">Merriweather</option><option value="'Commit Mono', monospace">Commit Mono</option></select>
        <label class="lab-field" for="lab-radius">Corner radius <output id="lab-radius-out">4px</output></label>
        <input id="lab-radius" type="range" min="0" max="24" step="1" value="4" />
      </fieldset>
    </div>
    <div class="lab-stage">
      <div id="lab-board" class="lab-board" style="${BOARD_STYLE}">
        <div class="lab-dia" data-src="flow" role="img" aria-label="Flowchart drawn by Pele: idea, draft, review, ship"></div>
        <div class="lab-dia" data-src="pie" role="img" aria-label="Pie chart drawn by Pele: where the time goes"></div>
        <div class="lab-dia lab-wide" data-src="seq" role="img" aria-label="Sequence diagram drawn by Pele: changing a colour variable updates every diagram"></div>
      </div>
      <div class="lab-scores">
        <p><span class="tr-name">Pele</span> redrew <output id="lab-pele-n" class="tr-ms">0</output> times <span class="hint" id="lab-pele-note">colours only change CSS</span></p>
        <p><span class="tr-name">Mermaid.js</span> redrew <output id="lab-mm-n" class="tr-ms">0</output> times <span class="hint">its colours live inside the drawing</span></p>
      </div>
      <details class="lab-mm"><summary>Show the Mermaid.js version</summary><div id="lab-mm" class="lab-dia" role="img" aria-label="The flowchart redrawn by Mermaid.js with the same colours"></div></details>
    </div>
  </div>
  <div class="lab-css"><div class="lab-css-head"><h3 class="lab-css-title">Your CSS</h3><button id="lab-copy" type="button" class="button secondary">Copy</button></div><pre tabindex="0"><code id="lab-code"></code></pre></div>
</section>`

export const PHONE = () => `<section class="demo phone" aria-labelledby="ph-title" data-demo="phone">
  <h2 id="ph-title" class="visually-hidden">Live demo: the same diagram on a narrowing screen</h2>
  <p class="drag-hint" id="ph-hint"><span class="drag-icon" aria-hidden="true">⟷</span> Drag the yellow handle to resize both phones, or focus it and use the arrow keys.</p>
  <div class="phones" id="ph-phones" style="--w: 390px">
    ${['pele', 'mm'].map(k => `<figure class="phone-col">
      <figcaption><span class="tr-name">${k === 'pele' ? 'Pele' : 'Mermaid.js'}</span> <span class="ph-read">smallest text <output id="ph-${k}-px" class="tr-ms">–</output></span></figcaption>
      <div class="phone-frame">
        <div class="phone-screen" tabindex="0" role="region" aria-label="${k === 'pele' ? 'Pele' : 'Mermaid.js'} phone screen, scrollable"><div id="ph-${k}" role="img" aria-label="Order flowchart drawn by ${k === 'pele' ? 'Pele' : 'Mermaid.js'}: order placed, payment, pick, pack, label, courier, delivered or chase"></div></div>
        <div class="phone-handle" role="slider" tabindex="0" aria-label="Phone width" aria-valuemin="220" aria-valuemax="900" aria-valuenow="390" aria-valuetext="390 pixels wide" data-handle><span class="grip" aria-hidden="true"></span><span class="handle-label" aria-hidden="true">drag</span></div>
      </div>
    </figure>`).join('')}
  </div>
  <p class="ph-width" aria-live="polite">Screen width <output id="ph-w" class="tr-ms">390 px</output> <span class="hint" id="ph-mode"></span></p>
</section>`

export const DOCS_PAGE = () => `<section class="demo docs" aria-labelledby="dp-title" data-demo="docs-page">
  <h2 id="dp-title" class="visually-hidden">Live demo: a page with 200 diagrams</h2>
  <div class="demo-bar"><button id="dp-go" type="button" class="button"><span aria-hidden="true">▶</span> Open a page with 200 diagrams</button> <button id="dp-stop" type="button" class="button secondary" hidden>Stop</button></div>
  <div class="tracks">
    ${['pele', 'mm'].map(k => `<div class="track track-${k}"><p class="track-name"><span class="tr-name">${k === 'pele' ? 'Pele' : 'Mermaid.js'}</span> <output id="dp-${k}-msg" class="track-msg">waiting</output></p>
      <div class="track-line" aria-hidden="true"><span class="train" id="dp-${k}-train"></span></div></div>`).join('')}
  </div>
  <div class="dp-pages">
    ${['pele', 'mm'].map(k => `<div class="dp-page" tabindex="0" role="region" aria-label="${k === 'pele' ? 'Pele' : 'Mermaid.js'} docs page, scrollable"><div id="dp-${k}" class="dp-grid"></div></div>`).join('')}
  </div>
</section>`

export const GALLERY = (types = []) => `<section class="demo gallery" aria-labelledby="gl-title" data-demo="gallery">
  <h2 id="gl-title" class="visually-hidden">Every diagram type, drawn live</h2>
  <p id="gl-total" class="gl-total" role="status"></p>
  <div class="demo-bar"><label for="gl-filter" class="bar-label">Find a type</label><input id="gl-filter" type="text" placeholder="e.g. sankey" autocomplete="off" /></div>
  <nav class="gl-index" aria-label="Diagram types"><ul>${types.map(g => `<li><a href="#type-${g.type}"><code>${g.key}</code> ${g.name}</a></li>`).join('')}</ul></nav>
  <div id="gl-grid" class="gl-grid"></div>
</section>`

export const SAFETY = () => `<section class="demo safety" aria-labelledby="sf-title" data-demo="safety">
  <h2 id="sf-title" class="visually-hidden">Live demo: paste a hostile diagram</h2>
  <fieldset class="sf-presets"><legend>Examples</legend><div id="sf-presets" class="chip-row"></div></fieldset>
  <div class="sf-grid">
    <div class="tr-editor"><label for="sf-src" class="tr-label">Diagram text <span class="hint">· paste anything</span></label><textarea id="sf-src" wrap="off" spellcheck="false" rows="12"></textarea></div>
    <div class="sf-out">
      <div id="sf-result" class="sf-result" role="img" aria-label="What Pele drew"></div>
      <ul id="sf-checks" class="sf-checks" aria-live="polite"></ul>
    </div>
  </div>
</section>`
