# ADR 0001 — Visualization library: D3.js

**Status:** Accepted
**Date:** 2026-05-25
**Decision owner:** Project lead

## Context

We are building a publishable interactive diagram to help newcomers understand the Drupal ecosystem (Code, Community, Private Organizations, and Bluefly). The chosen visual shape is **zoomable circle packing**, modeled after https://observablehq.com/@d3/zoomable-circle-packing. The deliverable is a standalone static site that can be hosted on GitHub Pages, Netlify, or similar — no backend, no framework lock-in if avoidable.

Required capabilities:
- Hierarchical circle-packing layout with leaf sizing driven by editorial weight
- Click a circle → smooth zoom transition to that circle becoming the new focus
- Click also opens a side panel with name, description, and external links
- Hand-curated JSON dataset (no real-time data, no charting math)
- Static deployment, ideally with no build step for v1

## Decision

**Use D3.js v7, loaded from a CDN, with no build step.**

## Alternatives considered

### D3.js (chosen)
- `d3.pack()` is the canonical circle-packing layout. The reference demo we are emulating is built on D3.
- The zoomable-circle-packing interaction is a well-documented D3 pattern (~30 lines of transition logic).
- Full control over DOM/SVG, styling, accessibility, and the side-panel integration.
- Loads as a single `<script>` tag from a CDN — no bundler, no `node_modules`.
- **Cost:** more code than a higher-level wrapper (~150–250 lines of JS for v1 vs. ~30 with a wrapper). Acceptable for the control gained.

### Nivo (`<ResponsiveCirclePacking>`)
- React component built on `d3-hierarchy`. Less code, polished defaults, good accessibility out of the box.
- **Rejected because:** requires React and a bundler (Vite/Next/CRA). That contradicts the static no-build goal, and adds toolchain we do not otherwise need. Would become attractive if React enters the project for other reasons.

### Vega-Lite
- Declarative JSON spec with a `pack` transform; compact for static views.
- **Rejected because:** the click-to-zoom drill-down interaction requires custom Vega signals that end up roughly the same volume of code as a D3 implementation, with thinner community examples for this specific pattern. We lose D3's flexibility without saving meaningful effort.

### Plotly / ECharts / amCharts
- Batteries-included chart libraries with many built-in chart types.
- **Rejected because:** none offer first-class zoomable circle packing matching the reference demo. Achieving the target visual and interaction would mean fighting the library's defaults. Plotly and ECharts target dashboards; amCharts adds licensing/attribution considerations.

### Cytoscape.js / Sigma.js / vis.js
- Purpose-built for network graphs (nodes + edges).
- **Rejected because:** wrong shape for the chosen visual model. We picked containment (circle packing), not relational edges. These libraries optimize for the opposite trade-off.

### Pure Canvas + custom layout code
- Maximum control, no library footprint.
- **Rejected because:** we would reimplement what `d3-hierarchy` already provides correctly. No upside for this project.

## Consequences

**Positive:**
- Zero toolchain to maintain in v1. Deploy is a file copy.
- Implementation patterns are well-documented; future contributors can find examples.
- If we later add cross-group relationship arcs (e.g., "company X sponsors camp Y"), D3 supports the hybrid layout without switching libraries.

**Negative / accepted trade-offs:**
- More verbose than a React-wrapper approach. Mitigated by keeping the viz code in a single, well-commented module.
- No tree-shaking (we load all of D3 from CDN). Acceptable: D3 v7 minified is ~270 KB; for a single-page explainer this is fine.

## Revisit triggers

Re-open this decision if any of the following becomes true:
- The project grows to include multiple pages or shared UI components → consider migrating to Vite + ES modules (still D3 under the hood, just bundled).
- React is adopted for another reason → consider Nivo as a wrapper.
- The visualization needs to morph beyond hierarchical containment in ways `d3-hierarchy` does not support.
