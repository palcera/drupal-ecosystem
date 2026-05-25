# Drupal Ecosystem Graph

## Role
This project builds a publishable interactive diagram explaining the Drupal ecosystem to newcomers — answering "what is Drupal beyond the code?" by visualizing how **Code**, **Community**, **Private Organizations**, and **Bluefly** connect. Inspiration: D3 zoomable circle packing (https://observablehq.com/@d3/zoomable-circle-packing). The deliverable is a standalone static site (HTML + JS + D3) that connects data organized by groups.

Bluefly appears as one of the four top-level groups in the diagram (a platform sustaining independent developers and small companies who build across the ecosystem), not as the project's owner or subject.

Claude's job here: help design the data model, author/curate the dataset, prototype D3 visualizations, and prepare the site for static hosting.

## Project Decisions (current)
- **Data source:** Mix — start with hand-authored JSON/CSV in `data/`, extend with scraping/automation later.
- **Publishing target:** Standalone static site (D3 + HTML), deployable to GitHub Pages / Netlify / similar.
- **Reference sites:** https://drupal.org/ (primary subject), https://bluefly.io/ (one of the four groups) — inspect via claude-in-chrome MCP when extracting entities.

## File Locations
- `data/` — hand-authored graph data (JSON/CSV: nodes, links, groups)
- `src/` — static site source (index.html, JS, CSS, D3 code)
- `docs/technical/` — data model, visualization decisions, deployment notes
- `docs/technical/decisions/` — ADRs (architecture decision records)
- `docs/plans/` — design doc and implementation plan
- `docs/research/` — drupal.org and bluefly.io content analysis, entity discovery
- `../reference-docs/drupal-ecosystem/` — stable inputs (brand, source material, specs)

## Knowledge Documents — When to Load
| When | Load This Document |
|------|-------------------|
| Designing the data model | Read `docs/plans/2026-05-25-drupal-ecosystem-graph-design.md` §3 |
| Reviewing the implementation plan | Read `docs/plans/2026-05-25-drupal-ecosystem-graph-implementation.md` |
| Working on visualization layout | Read the design doc §5 (Rendering) and §6 (Interaction) |
| Deciding what to crawl from drupal.org / bluefly.io | Read `docs/research/site-entities.md` (create on first use) |

## Working Style
- Prototype-first: start with a minimal D3 example wired to a tiny hand-authored dataset, then grow.
- Keep data, view, and interaction concerns separated (no logic embedded in HTML).
- Use claude-in-chrome MCP to inspect drupal.org (and supplementary sources like bluefly.io) when extracting entity ideas — don't guess content.
- D3 v7+. Vanilla JS by default; introduce a bundler only if the project genuinely needs it.

## Quick Reference
- D3 zoomable circle packing demo: https://observablehq.com/@d3/zoomable-circle-packing
- Drupal: https://drupal.org/
- Bluefly: https://bluefly.io/
- Publishing target: static site (no backend)
