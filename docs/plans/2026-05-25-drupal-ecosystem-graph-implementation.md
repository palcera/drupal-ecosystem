# Drupal Ecosystem Graph — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static, publishable web page that visualizes the Drupal ecosystem (Code, Community, Private Organizations, Bluefly) as a zoomable D3 circle pack with an explainer side panel.

**Architecture:** Single static page — `index.html` + `styles.css` + `app.js` + `data/graph.json`. D3 v7 loaded from CDN. No bundler. Deployed to GitHub Pages. One small Node script generates a no-JS fallback HTML page from the same JSON.

**Tech Stack:** D3.js v7 (CDN), vanilla JS (ES2020+), CSS Grid + Flexbox, Node ≥18 for the fallback-page generator only, GitHub Actions for deploy.

**Reference docs:**
- Design: `docs/plans/2026-05-25-drupal-ecosystem-graph-design.md` (approved)
- Library choice: `docs/technical/decisions/0001-visualization-library.md`
- D3 reference demo: https://observablehq.com/@d3/zoomable-circle-packing

**Testing note:** the design (§12) deliberately omits an automated test suite for v1. Each task below has a **Verify** step that is either a browser check (page loads, click works, console clean) or a manual JSON assertion. Adopt automated tests in v2 if/when the project grows.

**Workflow per task:** make the change → verify in browser or terminal → commit. Keep commits small and message them with conventional prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).

**Local dev server:** at any point, serve the project with `python3 -m http.server 8000` from the project root and open `http://localhost:8000/src/`.

---

## Phase 1 — Skeleton (Tasks 1–3)

### Task 1: Initialize git and add README pointer

**Files:**
- Create: `README.md`
- Modify: none

**Step 1.** From the project root, initialize the repo if not already a repo:

```bash
cd /home/anacoto/Repos/claude_code_projects/drupal-ecosystem
git init -b main
```

**Step 2.** Create `README.md` (one paragraph + pointers — not a sales pitch):

```markdown
# Drupal Ecosystem Graph

A static, interactive D3 diagram explaining the Drupal ecosystem (Code, Community, Private Organizations, Bluefly) for newcomers.

- **Design doc:** `docs/plans/2026-05-25-drupal-ecosystem-graph-design.md`
- **Implementation plan:** `docs/plans/2026-05-25-drupal-ecosystem-graph-implementation.md`
- **Library decision (ADR):** `docs/technical/decisions/0001-visualization-library.md`
- **Status:** `project_state.md`

## Local dev

```
python3 -m http.server 8000
open http://localhost:8000/src/
```
```

**Step 3 — Verify.**

```bash
git status
# Expected: README.md untracked plus the pre-existing files
```

**Step 4 — Commit.**

```bash
git add README.md project_state.md docs/ data/ src/ .claude/ .gitignore
git commit -m "chore: bootstrap repo with project docs and scaffolding"
```

---

### Task 2: HTML shell with hardcoded "Hello, D3" circle

Goal: prove D3 loads from CDN and renders to the DOM. Pure smoke test.

**Files:**
- Create: `src/index.html`

**Step 1.** Write `src/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Drupal Ecosystem</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="layout">
    <section id="viz" aria-label="Drupal ecosystem diagram"></section>
    <aside id="panel" aria-live="polite"></aside>
  </main>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <script src="app.js" type="module"></script>
</body>
</html>
```

**Step 2.** Create `src/app.js` with a minimal D3 smoke check:

```js
const viz = d3.select('#viz');
const svg = viz.append('svg').attr('viewBox', '-100 -100 200 200');
svg.append('circle').attr('r', 80).attr('fill', '#4a90e2');
console.log('d3 version:', d3.version);
```

**Step 3.** Create `src/styles.css` (minimal):

```css
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; font: 16px/1.5 system-ui, sans-serif; }
.layout { display: grid; grid-template-columns: 2fr 1fr; height: 100vh; }
#viz { background: #fafafa; }
#viz svg { width: 100%; height: 100%; display: block; }
#panel { background: #fff; padding: 1.5rem; border-left: 1px solid #eee; overflow-y: auto; }
```

**Step 4 — Verify.** Start the dev server (`python3 -m http.server 8000`), open `http://localhost:8000/src/`, confirm:
- A blue circle is visible on the left.
- Console shows `d3 version: 7.x.x` and no errors.

**Step 5 — Commit.**

```bash
git add src/index.html src/app.js src/styles.css
git commit -m "feat(viz): scaffold HTML shell + smoke-test D3 render"
```

---

### Task 3: Seed `graph.json` with the four top-level groups only

Goal: introduce the data file with the smallest realistic dataset. No children yet.

**Files:**
- Create: `data/graph.json`

**Step 1.** Write `data/graph.json`:

```json
{
  "id": "drupal",
  "name": "Drupal Ecosystem",
  "group": "root",
  "weight": 0,
  "description": "Drupal is more than a CMS — it is a framework, a global community of initiatives and local organizations, and an ecosystem of companies that build products and services around it.",
  "links": [{"label": "drupal.org", "url": "https://drupal.org"}],
  "related_ids": [],
  "children": [
    {
      "id": "code",
      "name": "Code",
      "group": "code",
      "weight": 0,
      "description": "Drupal Core, contributed modules, and the tools developers use to build and run Drupal sites.",
      "links": [{"label": "drupal.org/project/drupal", "url": "https://drupal.org/project/drupal"}],
      "related_ids": [],
      "children": []
    },
    {
      "id": "community",
      "name": "Community",
      "group": "community",
      "weight": 0,
      "description": "The people, initiatives, and organizations behind Drupal — globally and regionally.",
      "links": [{"label": "drupal.org/community", "url": "https://drupal.org/community"}],
      "related_ids": [],
      "children": []
    },
    {
      "id": "private",
      "name": "Private Organizations",
      "group": "private",
      "weight": 0,
      "description": "Companies that build products, sell services, sponsor events, and employ Drupal contributors.",
      "links": [],
      "related_ids": [],
      "children": []
    },
    {
      "id": "bluefly",
      "name": "Bluefly",
      "group": "bluefly",
      "weight": 0,
      "description": "A platform sustaining independent developers and small companies who build community, tools, and products across the Drupal ecosystem.",
      "links": [{"label": "bluefly.io", "url": "https://bluefly.io"}],
      "related_ids": [],
      "children": []
    }
  ]
}
```

**Step 2 — Verify.**

```bash
cat data/graph.json | python3 -m json.tool > /dev/null && echo "valid JSON"
# Expected: "valid JSON"
```

**Step 3 — Commit.**

```bash
git add data/graph.json
git commit -m "feat(data): seed graph.json with the four top-level groups"
```

---

## Phase 2 — Data-driven viz (Tasks 4–6)

### Task 4: Fetch JSON and render the four top-level circles

**Files:**
- Modify: `src/app.js` (replace entire contents)

**Step 1.** Replace `src/app.js`:

```js
// Boot
const DATA_URL = '../data/graph.json';

async function main() {
  const data = await fetch(DATA_URL).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} loading ${DATA_URL}`);
    return r.json();
  });

  // Give every leaf weight=1 for this task so pack() has something to sum.
  const root = d3.hierarchy(data).sum((d) => (d.children?.length ? 0 : (d.weight || 1)));
  const layout = d3.pack().size([800, 800]).padding(6);
  layout(root);

  const svg = d3
    .select('#viz')
    .append('svg')
    .attr('viewBox', '0 0 800 800')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg
    .selectAll('circle')
    .data(root.descendants())
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.r)
    .attr('fill', (d) => groupColor(d.data.group, d.depth))
    .attr('stroke', '#fff');

  svg
    .selectAll('text')
    .data(root.descendants().filter((d) => d.depth > 0))
    .join('text')
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', (d) => Math.max(10, d.r / 6))
    .attr('fill', '#fff')
    .text((d) => d.data.name);

  console.log(`rendered ${root.descendants().length} nodes`);
}

function groupColor(group, depth) {
  const base = {
    root: '#222',
    code: '#1f77b4',
    community: '#2ca02c',
    private: '#d62728',
    bluefly: '#9467bd',
  }[group] || '#888';
  // Lighten slightly with depth (placeholder until §5 polish task).
  return base;
}

main().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<p style="color:#b00;padding:1rem">Could not load the diagram data: ${err.message}</p>`,
  );
});
```

**Step 2 — Verify.** Refresh `http://localhost:8000/src/`. Confirm:
- Four colored circles visible inside an outer dark circle.
- Each circle is labeled (Code, Community, Private Organizations, Bluefly).
- Console: `rendered 5 nodes` (root + 4 children).
- No console errors.

**Step 3 — Commit.**

```bash
git add src/app.js
git commit -m "feat(viz): render top-level groups from graph.json via d3.pack"
```

---

### Task 5: Add real weights and confirm sizing changes

Goal: circles should be visibly different sizes when we set editorial weights.

**Files:**
- Modify: `data/graph.json` (set `weight` on each top-level child)
- Modify: `src/app.js` (change the `.sum()` callback)

**Step 1.** In `data/graph.json`, set:
- `code.weight = 5`
- `community.weight = 5`
- `private.weight = 3`
- `bluefly.weight = 2`

**Step 2.** In `src/app.js`, replace the `.sum(...)` line with:

```js
const root = d3.hierarchy(data).sum((d) => (d.children?.length ? 0 : (d.weight || 1)));
```

(Same shape — confirm leaves use `weight`; parents are computed.)

**Step 3 — Verify.** Refresh. The Code and Community circles should be visibly the largest, Bluefly the smallest.

**Step 4 — Commit.**

```bash
git add data/graph.json src/app.js
git commit -m "feat(viz): drive circle sizing from editorial weight field"
```

---

### Task 6: Add load-time validation (id uniqueness, related_ids resolve, weight range)

**Files:**
- Create: `src/validate.js`
- Modify: `src/app.js` (import + call `validate()`)

**Step 1.** Create `src/validate.js`:

```js
export function validate(root) {
  const errors = [];
  const ids = new Set();

  walk(root, (node, depth) => {
    if (!node.id) errors.push(`Node at depth ${depth} missing 'id'`);
    else if (ids.has(node.id)) errors.push(`Duplicate id: ${node.id}`);
    else ids.add(node.id);

    if (!node.name) errors.push(`Node '${node.id}' missing 'name'`);
    if (!node.group) errors.push(`Node '${node.id}' missing 'group'`);

    const isLeaf = !node.children || node.children.length === 0;
    if (isLeaf && node.id !== 'drupal') {
      if (typeof node.weight !== 'number' || node.weight < 1 || node.weight > 5) {
        errors.push(`Leaf '${node.id}' weight must be 1..5 (got ${node.weight})`);
      }
    }
  });

  // Second pass: related_ids resolution
  walk(root, (node) => {
    (node.related_ids || []).forEach((rid) => {
      if (!ids.has(rid)) errors.push(`Node '${node.id}' references unknown id '${rid}'`);
    });
  });

  return errors;
}

function walk(node, fn, depth = 0) {
  fn(node, depth);
  (node.children || []).forEach((c) => walk(c, fn, depth + 1));
}
```

**Step 2.** In `src/app.js`, at the top:

```js
import { validate } from './validate.js';
```

After the `fetch(...)` call but before building the hierarchy:

```js
const errors = validate(data);
if (errors.length) {
  throw new Error('graph.json failed validation:\n  - ' + errors.join('\n  - '));
}
```

**Step 3 — Verify (happy path).** Refresh. Page still renders. No console errors.

**Step 4 — Verify (failure path).** Temporarily duplicate an `id` in `data/graph.json` (e.g., set `bluefly.id` to `"code"`), refresh, confirm an error banner shows the message. Then revert the JSON.

**Step 5 — Commit.**

```bash
git add src/validate.js src/app.js
git commit -m "feat(validate): assert id uniqueness, related_ids, and weight at load"
```

---

## Phase 3 — Interaction (Tasks 7–10)

### Task 7: Click-to-zoom (focal-circle transition)

**Files:**
- Modify: `src/app.js`

**Step 1.** Replace the rendering block with a zoom-capable version. Use D3's standard zoomable-circle-packing pattern. Key additions:

```js
// after layout(root) ...
let focus = root;
let view;

const g = svg.append('g');

const node = g
  .selectAll('circle')
  .data(root.descendants().slice(1))
  .join('circle')
  .attr('fill', (d) => groupColor(d.data.group, d.depth))
  .attr('stroke', '#fff')
  .attr('pointer-events', (d) => (!d.children ? 'none' : null))
  .on('click', (event, d) => {
    if (focus !== d) {
      zoom(event, d);
      event.stopPropagation();
    }
  });

const label = g
  .selectAll('text')
  .data(root.descendants().slice(1))
  .join('text')
  .style('fill-opacity', (d) => (d.parent === root ? 1 : 0))
  .style('display', (d) => (d.parent === root ? 'inline' : 'none'))
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')
  .attr('fill', '#fff')
  .text((d) => d.data.name);

svg.on('click', (event) => zoom(event, root));
zoomTo([root.x, root.y, root.r * 2]);

function zoomTo(v) {
  const k = 800 / v[2];
  view = v;
  label.attr('transform', (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
  node.attr('transform', (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
  node.attr('r', (d) => d.r * k);
}

function zoom(event, d) {
  focus = d;
  const transition = svg
    .transition()
    .duration(event?.altKey ? 7500 : 750)
    .tween('zoom', () => {
      const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
      return (t) => zoomTo(i(t));
    });

  label
    .filter(function (d) {
      return d.parent === focus || this.style.display === 'inline';
    })
    .transition(transition)
    .style('fill-opacity', (d) => (d.parent === focus ? 1 : 0))
    .on('start', function (d) {
      if (d.parent === focus) this.style.display = 'inline';
    })
    .on('end', function (d) {
      if (d.parent !== focus) this.style.display = 'none';
    });
}
```

Adjust the SVG viewBox if needed — `0 0 800 800` is fine.

**Step 2 — Verify.** Refresh. Click "Code" — the view animates and Code's circle fills the viewport. Click the background — zooms out. (Currently labels for children appear empty because we have no children yet; that's expected.)

**Step 3 — Commit.**

```bash
git add src/app.js
git commit -m "feat(viz): zoomable focal-circle transition on click"
```

---

### Task 8: Side panel skeleton (breadcrumb + name)

**Files:**
- Modify: `src/styles.css` (panel styles)
- Modify: `src/app.js` (call `renderPanel(node)` on click)
- Create: `src/panel.js`

**Step 1.** Create `src/panel.js`:

```js
export function renderPanel(node) {
  const panel = document.getElementById('panel');
  panel.innerHTML = '';

  const crumbs = ancestorsOf(node).map((a) => `<a href="#" data-id="${a.data.id}">${a.data.name}</a>`).join(' › ');
  panel.insertAdjacentHTML('beforeend', `<nav class="crumbs">${crumbs}</nav>`);
  panel.insertAdjacentHTML('beforeend', `<h1 class="name">${escapeHtml(node.data.name)}</h1>`);

  if (node.data.description) {
    panel.insertAdjacentHTML('beforeend', `<p class="desc">${escapeHtml(node.data.description)}</p>`);
  }

  if (node.data.links?.length) {
    const items = node.data.links
      .map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`)
      .join('');
    panel.insertAdjacentHTML('beforeend', `<section><h2>Links</h2><ul>${items}</ul></section>`);
  }
}

function ancestorsOf(node) {
  const a = [];
  let cur = node;
  while (cur) { a.unshift(cur); cur = cur.parent; }
  return a;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
```

**Step 2.** In `src/app.js`:
- Import: `import { renderPanel } from './panel.js';`
- In the `.on('click', ...)` handler, after `zoom(event, d)`, add `renderPanel(d);`
- After the initial render, call `renderPanel(root)` to show the elevator pitch.

**Step 3.** In `src/styles.css`, add:

```css
.crumbs { font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; }
.crumbs a { color: inherit; text-decoration: none; }
.crumbs a:hover { text-decoration: underline; }
.name { margin: 0 0 0.75rem; font-size: 1.5rem; }
.desc { margin: 0 0 1rem; color: #333; }
#panel h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 1rem 0 0.25rem; }
#panel ul { margin: 0; padding-left: 1.25rem; }
```

**Step 4 — Verify.** Refresh. The panel shows the root description on load. Click "Code" — panel updates with breadcrumb (`Drupal Ecosystem › Code`), name, and description.

**Step 5 — Commit.**

```bash
git add src/panel.js src/app.js src/styles.css
git commit -m "feat(panel): render breadcrumb, name, description, and links on click"
```

---

### Task 9: Side panel — "Connected to" related_ids

Goal: render cross-group chips and make them navigate.

**Files:**
- Modify: `src/panel.js`
- Modify: `src/app.js` to pass an `onNavigate(id)` callback into `renderPanel`

**Step 1.** Update `renderPanel` signature: `renderPanel(node, allNodes, onNavigate)`. Use `allNodes` to resolve `related_ids` → real nodes.

```js
export function renderPanel(node, allNodes, onNavigate) {
  // ... (existing breadcrumb / name / description / links rendering)

  if (node.data.related_ids?.length) {
    const chips = node.data.related_ids
      .map((rid) => allNodes.find((n) => n.data.id === rid))
      .filter(Boolean)
      .map((n) => `<button class="chip" data-id="${n.data.id}">${escapeHtml(n.data.name)}</button>`)
      .join('');
    panel.insertAdjacentHTML('beforeend', `<section><h2>Connected to</h2><div class="chips">${chips}</div></section>`);
  }

  // Wire navigation for chips AND breadcrumb anchors
  panel.querySelectorAll('[data-id]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate(el.dataset.id);
    });
  });
}
```

**Step 2.** In `src/app.js`, define `onNavigate`:

```js
const allNodes = root.descendants();
function navigateById(id) {
  const target = allNodes.find((n) => n.data.id === id);
  if (target) {
    zoom(null, target);
    renderPanel(target, allNodes, navigateById);
  }
}
// Update click handler and initial call:
renderPanel(root, allNodes, navigateById);
// And replace `renderPanel(d)` with `renderPanel(d, allNodes, navigateById)`
```

**Step 3.** Add chip CSS to `styles.css`:

```css
.chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.chip { font: inherit; padding: 0.25rem 0.6rem; border: 1px solid #ccc; background: #fff; border-radius: 999px; cursor: pointer; }
.chip:hover { background: #f0f0f0; }
```

**Step 4 — Verify.** Add a `related_ids` entry to one node (e.g., `code.related_ids = ["bluefly"]`) in `data/graph.json`, refresh, click Code, then click the "Bluefly" chip — view should zoom to Bluefly and panel update. Revert the test edit before committing.

**Step 5 — Commit.**

```bash
git add src/panel.js src/app.js src/styles.css
git commit -m "feat(panel): clickable Connected-to chips drive cross-group navigation"
```

---

### Task 10: Keyboard support (Tab focus, Enter/Space activate, Esc zoom out)

**Files:**
- Modify: `src/app.js`

**Step 1.** Make circles focusable and keyboard-activatable:

```js
node
  .attr('tabindex', 0)
  .attr('role', 'button')
  .attr('aria-label', (d) => d.data.name)
  .on('keydown', (event, d) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (focus !== d) { zoom(event, d); renderPanel(d, allNodes, navigateById); }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      zoom(event, root);
      renderPanel(root, allNodes, navigateById);
    }
  });
```

**Step 2.** Add a visible focus ring in `styles.css`:

```css
circle:focus { outline: 3px solid #ffbf00; outline-offset: 2px; }
```

**Step 3 — Verify.** Refresh. Tab through circles — focus ring is visible. Enter/Space activates. Esc zooms back to root.

**Step 4 — Commit.**

```bash
git add src/app.js src/styles.css
git commit -m "feat(a11y): keyboard navigation — focus, Enter/Space, Esc"
```

---

## Phase 4 — Polish (Tasks 11–14)

### Task 11: Color palette + depth-based shades

**Files:**
- Modify: `src/app.js` (replace `groupColor`)

**Step 1.** Replace `groupColor` with a proper depth-aware palette:

```js
function groupColor(group, depth) {
  const palette = {
    root: ['#222'],
    code:      ['#1f4f8a', '#3471b8', '#5290d3', '#82b0e2', '#b0cdee'],
    community: ['#1e6e2a', '#338e3f', '#52ab5e', '#82c58c', '#b0dcb6'],
    private:   ['#8c1f23', '#b53438', '#d65456', '#e58588', '#f0b0b2'],
    bluefly:   ['#5e3686', '#7a4ea8', '#9670c3', '#b699d3', '#d3bce4'],
  }[group] || ['#888'];
  return palette[Math.min(depth - 1, palette.length - 1)] || palette[0];
}
```

**Step 2 — Verify.** Refresh. Each group has a distinct hue; deeper rings appear lighter.

**Step 3 — Commit.**

```bash
git add src/app.js
git commit -m "feat(viz): depth-aware color palette per group"
```

---

### Task 12: Empty-state panel and name-only nodes

**Files:**
- Modify: `src/panel.js`

**Step 1.** In `renderPanel`, when `node === root` (or rendering the root), show an elevator-pitch block first plus a one-line legend of the four groups:

```js
if (!node.parent) {
  panel.insertAdjacentHTML(
    'beforeend',
    `<section class="legend">
      <p>Click any circle to explore. Each color represents a group:</p>
      <ul>
        <li><span class="dot dot-code"></span> Code</li>
        <li><span class="dot dot-community"></span> Community</li>
        <li><span class="dot dot-private"></span> Private Organizations</li>
        <li><span class="dot dot-bluefly"></span> Bluefly</li>
      </ul>
    </section>`
  );
}
```

**Step 2.** Confirm name-only behavior: the existing conditionals (`if (node.data.description)` and `if (node.data.links?.length)`) already omit those sections when absent. No extra code needed — manual verification only.

**Step 3.** Add `.dot` styles in `styles.css`:

```css
.legend ul { list-style: none; padding: 0; }
.legend li { display: flex; align-items: center; gap: 0.5rem; padding: 0.2rem 0; }
.dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
.dot-code { background: #3471b8; }
.dot-community { background: #338e3f; }
.dot-private { background: #b53438; }
.dot-bluefly { background: #7a4ea8; }
```

**Step 4 — Verify.** Refresh — root panel shows legend. Manually edit a node to remove its `description` and `links`, refresh, click it — panel shows just the breadcrumb + name. Revert.

**Step 5 — Commit.**

```bash
git add src/panel.js src/styles.css
git commit -m "feat(panel): elevator-pitch legend at root; clean rendering for name-only nodes"
```

---

### Task 13: `prefers-reduced-motion`

**Files:**
- Modify: `src/app.js`

**Step 1.** In the `zoom` function, replace the duration computation:

```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const transition = svg
  .transition()
  .duration(reduceMotion ? 0 : (event?.altKey ? 7500 : 750))
  // ...
```

**Step 2 — Verify.** In Chrome DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce". Refresh, click a circle — zoom should be instant, no animation.

**Step 3 — Commit.**

```bash
git add src/app.js
git commit -m "feat(a11y): respect prefers-reduced-motion"
```

---

### Task 14: SVG semantics (role, title, desc)

**Files:**
- Modify: `src/app.js` (add `<title>`/`<desc>` to the SVG)

**Step 1.** Right after `svg = ...`, add:

```js
svg.attr('role', 'img');
svg.append('title').text('Drupal Ecosystem diagram');
svg.append('desc').text('An interactive circle-packing visualization of the Drupal ecosystem: Code, Community, Private Organizations, and Bluefly.');
```

**Step 2 — Verify.** Inspect the SVG element in DevTools — confirm `role="img"` and the nested `<title>` and `<desc>`.

**Step 3 — Commit.**

```bash
git add src/app.js
git commit -m "feat(a11y): SVG role, title, and desc for screen readers"
```

---

## Phase 5 — Responsive (Tasks 15–16)

### Task 15: Tablet layout (viz on top, panel below)

**Files:**
- Modify: `src/styles.css`

**Step 1.** Wrap the existing two-column layout in a media query and add a single-column variant:

```css
@media (max-width: 1023px) {
  .layout { grid-template-columns: 1fr; grid-template-rows: 60vh 40vh; }
  #panel { border-left: none; border-top: 1px solid #eee; }
}
```

**Step 2 — Verify.** Resize the browser to ~900px wide. Confirm viz sits above panel; both scroll independently if content overflows.

**Step 3 — Commit.**

```bash
git add src/styles.css
git commit -m "feat(responsive): tablet layout — stacked viz and panel"
```

---

### Task 16: Mobile bottom-sheet panel

**Files:**
- Modify: `src/styles.css`
- Modify: `src/app.js` (open/close sheet on click)
- Modify: `src/index.html` (add a sheet-handle / close button if needed)

**Step 1.** In `styles.css`:

```css
@media (max-width: 639px) {
  .layout { grid-template-columns: 1fr; grid-template-rows: 100vh; }
  #panel {
    position: fixed; left: 0; right: 0; bottom: 0; max-height: 75vh;
    transform: translateY(100%); transition: transform 200ms ease;
    box-shadow: 0 -4px 16px rgba(0,0,0,0.15);
    border-top: none; border-radius: 16px 16px 0 0;
  }
  #panel.open { transform: translateY(0); }
  .sheet-handle { width: 40px; height: 4px; background: #ccc; border-radius: 2px; margin: 0.5rem auto 1rem; }
}
```

**Step 2.** In `index.html`, prepend to the panel:

```html
<aside id="panel" aria-live="polite">
  <div class="sheet-handle" aria-hidden="true"></div>
  <!-- content rendered by panel.js follows -->
</aside>
```

Adjust `panel.js`: when clearing innerHTML, preserve the handle (or re-add it each render).

**Step 3.** In `app.js`, on click toggle `.open`:

```js
function openSheet() { document.getElementById('panel').classList.add('open'); }
// call openSheet() after each renderPanel(...) on small viewports
```

Tap outside or press Esc → remove `.open`.

**Step 4 — Verify.** Use DevTools mobile emulation (e.g., iPhone 14). Tap a circle — bottom sheet slides up. Tap background — sheet slides down. Esc also closes.

**Step 5 — Commit.**

```bash
git add src/styles.css src/index.html src/app.js src/panel.js
git commit -m "feat(responsive): mobile bottom-sheet panel"
```

---

## Phase 6 — Fallback, dataset, deploy (Tasks 17–22)

### Task 17: No-JS `<noscript>` block + fallback generator script

**Files:**
- Modify: `src/index.html`
- Create: `scripts/build-fallback.mjs`
- Modify: `package.json` (or create a minimal one for the script)

**Step 1.** Create a minimal `package.json` (just enough to run the script — no dependencies):

```json
{
  "name": "drupal-ecosystem-graph",
  "private": true,
  "type": "module",
  "scripts": {
    "build:fallback": "node scripts/build-fallback.mjs"
  }
}
```

**Step 2.** Create `scripts/build-fallback.mjs`:

```js
import fs from 'node:fs/promises';

const data = JSON.parse(await fs.readFile('data/graph.json', 'utf8'));

function render(node, depth = 0) {
  const heading = depth === 0 ? 'h1' : depth === 1 ? 'h2' : 'h3';
  const desc = node.description ? `<p>${escape(node.description)}</p>` : '';
  const children = (node.children || []).map((c) => render(c, depth + 1)).join('');
  return `<section>
    <${heading}>${escape(node.name)}</${heading}>
    ${desc}
    ${children}
  </section>`;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Drupal Ecosystem (text fallback)</title>
<style>body{max-width:48em;margin:2em auto;font:16px/1.5 system-ui;padding:0 1em}</style>
</head>
<body>
${render(data)}
</body></html>`;

await fs.writeFile('src/fallback.html', html);
console.log('Wrote src/fallback.html');
```

**Step 3.** In `src/index.html`, inside `<body>`:

```html
<noscript>
  <p>This page uses JavaScript to render an interactive diagram. <a href="fallback.html">Browse the text version.</a></p>
</noscript>
```

**Step 4 — Verify.**

```bash
node scripts/build-fallback.mjs
# Expected: "Wrote src/fallback.html"
open http://localhost:8000/src/fallback.html  # Or your equivalent
```

Disable JS in DevTools, refresh `src/index.html`, confirm the noscript message appears and the link works.

**Step 5 — Commit.**

```bash
git add scripts/build-fallback.mjs src/index.html package.json src/fallback.html
git commit -m "feat(a11y): no-JS fallback page generator and noscript pointer"
```

---

### Task 18: Friendly error UI for load failures

**Files:**
- Modify: `src/app.js`

**Step 1.** Replace the existing `.catch(...)` with a styled inline banner instead of body-prepended text:

```js
function showError(message) {
  const el = document.createElement('div');
  el.className = 'load-error';
  el.innerHTML = `
    <strong>Could not load the diagram data.</strong>
    <p>${message}</p>
    <button onclick="location.reload()">Retry</button>
  `;
  document.body.prepend(el);
}

main().catch((err) => {
  console.error(err);
  showError(err.message);
});
```

**Step 2.** Add CSS in `styles.css`:

```css
.load-error { background: #fff3f3; border: 1px solid #f5c2c7; color: #842029; padding: 1rem; margin: 1rem; border-radius: 6px; }
.load-error button { margin-top: 0.5rem; }
```

**Step 3 — Verify.** Temporarily break the data path (`const DATA_URL = 'NOPE.json';`). Refresh — confirm the error banner shows with a Retry button. Revert.

**Step 4 — Commit.**

```bash
git add src/app.js src/styles.css
git commit -m "feat(error): friendly inline banner on data load / validation failure"
```

---

### Task 19: Author the seed dataset (full v1 tree)

**Files:**
- Modify: `data/graph.json`

**Step 1.** Expand `data/graph.json` with the full structure approved in design §4. For each leaf, write a real 1–2 sentence description and at least one link where confidently knowable; leave optional fields empty otherwise. Use kebab-case ids.

Reference inventory:
- **Code** → Core (`drupal-core`), Contributed modules (`contrib-modules`), Tools → Drush (`drush`), DDEV (`ddev`)
- **Community** → Initiatives (`composer-in-core`, `drupal-ai`, `ixp`, `cwg`), Organizations → United States (`us-drupal-association` → `drupalcon-na`, `florida-drupal-community` → `florida-drupalcamp`, `texas-drupal-community` → `texas-drupalcamp`), Europe (`european-drupal-association` → `drupalcon-europe`), Latin America (placeholder leaf or skipped if no concrete examples yet)
- **Private Organizations** → United States (`acquia`, `pantheon`, `palantir-net`, `four-kitchens`, `tag1`, `kanopi`), Latin America (`seed-co`, `paralleldev`)
- **Bluefly** → Independent Developers (TBD — leave one placeholder leaf with description "Examples to be named with consent"), Small Companies (same)

Assign editorial weights 1–5 per leaf. Add at least one `related_ids` entry to show the cross-group nav works (e.g., link `acquia` ↔ `drupalcon-na` for sponsorship).

**Step 2 — Verify.** Refresh `http://localhost:8000/src/` — entire tree should render. Click into deep branches, navigate via chips. Console should be clean (validation passes).

**Step 3 — Commit.**

```bash
git add data/graph.json
git commit -m "feat(data): author v1 dataset with full Drupal ecosystem inventory"
```

---

### Task 20: Manual QA pass

**Files:** none.

**Step 1.** Run the QA checklist:
- [ ] Chrome desktop — viz renders, click zooms, panel populates, chips navigate, no console errors
- [ ] Firefox desktop — same
- [ ] Safari desktop — same
- [ ] Mobile (DevTools emulation, iPhone 14 size) — bottom sheet opens, drag/close works, tap targets feel right
- [ ] Keyboard-only walkthrough — Tab/Enter/Space/Esc all behave as designed
- [ ] `prefers-reduced-motion` set — no animation
- [ ] VoiceOver (macOS) — root description read; circle activation announces name; panel content readable
- [ ] No-JS — fallback page link visible; fallback.html renders correctly

**Step 2.** Log any defects as follow-up tasks (new sections at the bottom of this plan).

**Step 3.** If all green, commit a QA log file:

```bash
echo "QA pass for v1 — $(date -u +%Y-%m-%dT%H:%M:%SZ) — all checks green" >> docs/project/qa-log.md
git add docs/project/qa-log.md
git commit -m "chore(qa): pass v1 manual checklist"
```

(Create `docs/project/` if it doesn't exist.)

---

### Task 21: GitHub Pages deploy via Actions

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1.** Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Build fallback page
        run: node scripts/build-fallback.mjs
      - name: Assemble site
        run: |
          mkdir -p _site
          cp -r src/* _site/
          mkdir -p _site/data
          cp data/graph.json _site/data/
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
      - uses: actions/deploy-pages@v4
```

Note: this copies `data/graph.json` into `_site/data/` so the relative fetch path `../data/graph.json` still works after deploy. Update `src/app.js`'s `DATA_URL` if you change this layout.

**Step 2.** On GitHub: create the repository, push, then enable Pages → Source: GitHub Actions.

**Step 3 — Verify.** After the workflow runs, open the published URL, confirm the viz renders. Watch for CORS or relative-path issues.

**Step 4 — Commit (and push).**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy to GitHub Pages on push to main"
git push -u origin main
```

---

### Task 22: Final pre-share polish

**Files:** various

**Step 1.** Update `project_state.md`:
- Move "Build the static site" and "Deploy" from "What's next" to "What's done."
- Set "Current phase" → "Published v1 / awaiting feedback."

**Step 2.** Add a one-line link to the live URL at the top of `README.md`.

**Step 3.** Resolve any of §15's open questions that have answers now (hosting URL especially).

**Step 4 — Commit.**

```bash
git add README.md project_state.md docs/plans/2026-05-25-drupal-ecosystem-graph-design.md
git commit -m "docs: v1 shipped — update state and links"
```

---

## Open follow-ups (not blocking v1)

- §15 open questions still unresolved go here when the project lead decides.
- Defects logged during Task 20 go here.

---

## Done criteria for v1

- [x] All design sections approved (`docs/plans/2026-05-25-drupal-ecosystem-graph-design.md`)
- [ ] All 22 tasks above committed
- [ ] Manual QA checklist green (Task 20)
- [ ] Live URL responds with the viz (Task 21)
- [ ] `project_state.md` updated to "Published v1" (Task 22)
