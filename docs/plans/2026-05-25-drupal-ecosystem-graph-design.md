# Design — Drupal Ecosystem Graph (v1)

**Date:** 2026-05-25
**Status:** Approved (walked through section-by-section, 2026-05-25)
**Related:** `project_state.md`, `docs/technical/decisions/0001-visualization-library.md`

---

## 1. Goal and audience

A static, publishable web page that helps newcomers understand Drupal is more than a CMS — it is **Code + Community + Private Organizations**, plus **Bluefly** as a platform sustaining the independent developers and small companies who build across all three.

**Audience:** people new to Drupal who land on drupal.org (or hear about Drupal from a friend, conference, or job ad) and cannot easily see the ecosystem behind the framework.

**Success criteria for v1:**
- A reader can open the page and within ~60 seconds understand the four top-level groups and how Drupal is more than code.
- A reader can click any circle to zoom in and see the members / organizations / items contained inside that group as nested circles.
- The diagram nests as deep as the data warrants — no hard cap. Labels and zoom behavior keep deep branches readable.
- A reader can click a circle and, when one is available, read a 1–2 sentence explanation and follow external links to learn more. Nodes without description or links still render and zoom; the panel simply shows the name.
- A reader can navigate from a node to a related node (cross-group) via the side panel.
- The page is one HTML file plus assets, deployable to a static host.

**Non-goals for v1:** live data from drupal.org, user submissions, search/filter UI, visible cross-group arcs on the diagram, analytics, translations.

---

## 2. Architecture

A single static page. No backend, no build step.

```
src/
├── index.html         # Page shell, viz container, side panel container
├── styles.css         # All styling (typography, colors, panel, responsive)
└── app.js             # Boot, fetch data, render, wire interactions
data/
└── graph.json         # The dataset (hand-curated)
```

`index.html` loads D3 v7 from a CDN, then `app.js`, then fetches `data/graph.json`. Everything else happens client-side. The page degrades to a static list of group names if JS is disabled (see Accessibility).

```
┌──────────────────────────────────────────────┐
│  index.html                                  │
│  ┌────────────────────────────┐  ┌────────┐ │
│  │   <svg id="viz">           │  │ panel  │ │
│  │   D3 circle pack renders   │  │ ───    │ │
│  │   here. Click → zoom +     │  │ name   │ │
│  │   notify panel.            │  │ desc   │ │
│  │                            │  │ links  │ │
│  │                            │  │ rel.   │ │
│  └────────────────────────────┘  └────────┘ │
└──────────────────────────────────────────────┘
```

---

## 3. Data model

One JSON file. Hierarchy expressed via `children`. Every node — group, category, leaf — carries the same shape.

```jsonc
{
  "id": "drupal",
  "name": "Drupal Ecosystem",
  "group": "root",
  "weight": 0,
  "description": "...",
  "links": [],
  "related_ids": [],
  "children": [
    {
      "id": "code",
      "name": "Code",
      "group": "code",
      "weight": 5,
      "description": "...",
      "links": [{"label": "drupal.org", "url": "https://drupal.org"}],
      "related_ids": [],
      "children": [ /* Core, Contrib, Tools ... */ ]
    },
    /* community, private, bluefly */
  ]
}
```

**Field reference:**

| Field | Type | Required? | Purpose |
|---|---|---|---|
| `id` | string (kebab-case) | yes | Stable identifier for cross-references; never displayed |
| `name` | string | yes | Display label on the circle and in the panel header |
| `group` | enum: `root` \| `code` \| `community` \| `private` \| `bluefly` | yes | Drives color; matches the top-level ancestor |
| `weight` | integer 1–5 (0 for root) | yes for leaves | Editorial size; sums up the tree for parents via `d3.hierarchy().sum()` |
| `description` | string, 1–2 sentences | optional | Side-panel body copy. If absent, the panel shows just the name. Real prose preferred; no placeholders like "TBD" |
| `links` | array of `{label, url}` | optional | External references shown in the panel. May be empty / absent |
| `related_ids` | array of node `id`s | optional | Cross-group ties; render as "Connected to:" in the panel; clicking navigates |
| `children` | array of nodes | optional | Child nodes; absence means leaf |

**Validation rules (enforced in `app.js` on load, fail loudly):**
- Every `id` is unique across the tree.
- Every `related_ids` entry resolves to a real `id`.
- `weight` falls in 1–5 for leaves; computed (not authored) for non-leaves.

Depth is unconstrained — the diagram nests as deep as the data goes. `description` and `links` are optional; missing values render as a name-only panel.

---

## 4. Top-level structure (v1 inventory shape)

```
Drupal Ecosystem (root)
├── Code
│   ├── Core
│   ├── Contributed modules
│   └── Tools (DDEV, Drush, …)
├── Community
│   ├── Initiatives  (Composer in Core, Drupal AI, IXP, CWG, …)
│   └── Organizations
│       ├── United States
│       │   ├── US Drupal Association → DrupalCon
│       │   ├── Florida Drupal Community → Florida DrupalCamp
│       │   └── Texas Drupal Community → Texas DrupalCamp
│       ├── Europe
│       │   └── European Drupal Association → DrupalCon Europe
│       └── Latin America
│           └── (regional camps and communities — TBD)
├── Private Organizations
│   ├── United States
│   │   ├── Acquia
│   │   ├── Pantheon
│   │   ├── Palantir
│   │   ├── Four Kitchens
│   │   ├── Tag1
│   │   └── Kanopi
│   └── Latin America
│       ├── Seed (Colombia)
│       └── ParallelDev (Costa Rica)
└── Bluefly
    ├── Independent Developers
    └── Small Companies
```

Target: ~40–60 nodes total. Exact contents land in the dataset authoring phase; this shape is the contract.

---

## 5. Rendering

**Layout.** D3's `d3.pack()` on a `d3.hierarchy()` summed by `weight`. Padding ~3px between siblings. The root is rendered as the page background (the four top-level circles sit inside it). Viewport is square-ish on desktop; full width on mobile.

**Color.** One hue per top-level `group` (Code, Community, Private, Bluefly). Children inherit the group hue at progressively lighter shades by depth. Palette TBD with branding (see Open questions). Strong WCAG AA contrast for text-on-circle.

**Labels.** Each circle shows its name. Font size scales with circle radius; labels under a threshold are hidden until zoomed (matches the Observable demo).

**Zoom.** Click a circle → animate the view so that circle becomes the new "focus" (centered, sized to viewport). Click outside any circle → zoom out to the parent. Transition ~750ms, eased. Implementation follows the standard zoom-to-focal-circle pattern from the D3 demo.

---

## 6. Interaction — the side panel

The side panel is the *explainer*. The circle viz is the index.

**Open behavior:** clicking any circle opens (or updates) the side panel with that node's content. The zoom animation and the panel update run in parallel.

**Panel contents (in order):**
1. Breadcrumb of ancestors — `Drupal › Community › Organizations` — each segment is clickable (jumps to that ancestor).
2. **Name** (large).
3. **Description** (the 1–2 sentence prose).
4. **Links** — external references, opening in a new tab with `rel="noopener noreferrer"`.
5. **Connected to** — a list of `related_ids` rendered as clickable chips. Clicking a chip zooms to that node and updates the panel.
6. Close button (mobile) or "back to overview" link.

**Empty / root state:** if no circle is focused, the panel shows the project's elevator pitch and a one-line legend of the four groups.

**Name-only nodes:** if a node has no `description` and no `links`, the panel still opens — showing the breadcrumb, name, and any `related_ids`. Sections with no content (Description, Links) are simply omitted, not shown as empty headings.

**Keyboard:** `Esc` closes the panel and zooms out. `Tab` moves focus through visible circles in DOM order. `Enter`/`Space` activates a focused circle.

---

## 7. Cross-group navigation

`related_ids` is the connective tissue. Examples of what it captures in v1:
- A Private Organization sponsors a Community event → sponsor node lists the event in `related_ids`, and vice versa.
- A Bluefly Small Company maintains a Contributed module → company lists the module in `related_ids`.
- An Initiative is supported by Private Organizations → initiative lists the sponsors.

Editorial guideline for v1: keep `related_ids` to ≤5 entries per node, choosing the most newcomer-relevant ones. More relationships exist in the real world; the diagram is not the database.

---

## 8. Accessibility

- **Semantics:** the SVG has `role="img"` and an `<title>`/`<desc>` describing the diagram. The side panel is the *primary* interaction surface for screen readers.
- **No-JS fallback:** `index.html` includes a `<noscript>` block listing the four top-level groups with one-line descriptions and a link to a static fallback page (a flat HTML rendering of `graph.json`). Newcomers without JS still get the explainer in text form.
- **Keyboard:** every clickable circle is focusable (`tabindex="0"`); Enter/Space activates it. Focus ring is visible against any background.
- **Color independence:** group is communicated by color *and* by the breadcrumb path in the panel — color is never the only signal.
- **Motion:** respect `prefers-reduced-motion`; if set, replace the zoom animation with an instant cut.
- **Touch:** circles are easy to hit on mobile (min 44px tap target enforced — fall back to a list view on very small viewports if the smallest circles drop below that).

---

## 9. Responsive behavior

- **Desktop (≥1024px):** viz on the left (~⅔ width), panel docked on the right (~⅓).
- **Tablet (640–1023px):** viz on top, panel below; panel is a normal-flow section.
- **Mobile (<640px):** viz full-width; tapping a circle opens the panel as a bottom sheet overlaying the viz. The bottom sheet has a drag handle and a close button.

If sub-44px tap targets persist on a given viewport, the bottom sheet exposes a "Browse as list" link that opens a flat scrollable listing of the tree.

---

## 10. Performance

Single page, ~270 KB of D3 (CDN, cached), one JSON file (~20–40 KB for ~60 nodes), ~10 KB CSS, ~5–8 KB app JS. Total cold-load well under 350 KB. No images required for v1 (group icons deferred).

Render path: parse JSON → build hierarchy → run `pack()` → mount SVG once → use `g` transforms for zoom (no re-layout on click). Should be 60fps on any laptop and any phone from the last 5 years.

---

## 11. Error handling

The viz is a static read-only client. Failure modes:

| Failure | Behavior |
|---|---|
| `graph.json` 404 / network failure | Show an inline error in the page body: "Could not load the diagram data." with a retry link. No JS exceptions surface to the console without a friendly message. |
| `graph.json` parse error | Same error message; the underlying `SyntaxError` logs to console for the maintainer. |
| Validation rule violated (duplicate id, broken `related_ids`, missing required field) | Error banner naming the offending node id(s) so the dataset author can fix the JSON. Page does not render the broken viz. |
| Click on a node whose `related_ids` entry has been deleted | Silently skip the missing reference; validation should have caught this at load. |

There is no user input to validate beyond the dataset itself. All errors are dataset-author errors, and the messages target that audience.

---

## 12. Testing strategy

This is a small static site, so the testing surface is small. v1 testing:

- **Dataset validation** runs at page load (the validation rules in §3). This is the primary defense.
- **Manual visual smoke test** across Chrome, Firefox, Safari, and one mobile browser before each publish.
- **Manual accessibility pass:** keyboard-only walkthrough, screen-reader read of the side panel on macOS VoiceOver, `prefers-reduced-motion` simulation.
- **No automated test suite for v1.** Adding Jest/Vitest + a test runner contradicts the no-build-step decision. If the project grows (multi-page, framework adoption), introduce tests then.

---

## 13. Deployment

- **v1 host:** GitHub Pages (simplest, free, version-controlled). Final URL TBD (see Open questions).
- **Process:** push to `main` → GitHub Action publishes `src/` and `data/` as the site root (or use Pages' direct branch-folder setting).
- **Rollback:** revert the commit. No data migrations, no DB.
- **Updates:** dataset changes are a JSON edit + commit. No deploy required beyond the next push.
- **No-JS fallback page (§8):** a small Node script (`scripts/build-fallback.mjs`) reads `data/graph.json` and emits `src/fallback.html` as a flat indented list. Runs in the GitHub Action before publish. This is the one bit of "build" in an otherwise build-less project; it does not touch the main viz code.

---

## 14. Future / v2 considerations (not in v1)

- Visible cross-group arcs/ribbons on the diagram itself.
- Live data ingestion from drupal.org (modules, contributors, camps calendar).
- Search and filter (e.g., "show me everything tagged 'sponsor'").
- Translations — Spanish first, given Bluefly's reach.
- Icons per group; per-node thumbnails.
- Embed mode (iframe) so other Drupal community sites can include the diagram.
- Analytics (privacy-respecting; e.g., Plausible).
- Deeper-than-current research per group, with 5th-level (or further) substructure added once each group has been studied in depth.

---

## 15. Open questions

1. **Hosting URL.** GitHub Pages under a `bluefly.io` subdomain? Under drupal.org somewhere (unlikely for v1)? A standalone `drupal-ecosystem.org`-style domain? Picks affect the deploy step.
2. **Branding.** Bluefly visual identity, neutral Drupal-ish, or a custom palette designed to read as ecosystem-wide? Affects §5 (Color) and CSS.
3. **Authoritative source for descriptions.** Are we writing them, or asking each org/initiative to provide their own one-liner? Affects the dataset authoring phase.
4. **Bluefly leaf examples.** Which independent developers and small companies are named in v1? Needs explicit consent and editorial criteria.

---

## Approval

Walked through section-by-section on 2026-05-25. All 15 sections approved, with these revisions captured during review:
- §1 success criteria refined (zoom-to-see-members; depth via per-group research deferred to v2; name-only nodes allowed).
- §3 data model: `description` and `links` made optional; depth cap removed.
- §4 top-level structure: Private Organizations reorganized by region (US, Latin America) with real examples; Community Organizations reorganized by region (US, Europe, Latin America).
- §13 deployment: added `scripts/build-fallback.mjs` for the no-JS fallback page.
- §14: added "deeper-than-current research per group" as a v2 item.

Next: invoke `superpowers:writing-plans` to produce the implementation plan.
