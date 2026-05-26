# Drupal Ecosystem Graph — Project State

**Last updated:** 2026-05-25
**Current phase:** Published v1 / awaiting feedback
**Live URL:** https://palcera.github.io/drupal-ecosystem/src/
**Next phase:** Gather feedback, fill in TBD entries (Bluefly examples, LatAm camps), iterate

---

## What this project is

A publishable, interactive diagram that explains the Drupal ecosystem to newcomers — answering "what is Drupal beyond the code?" by visualizing how **Code**, **Community**, **Private Organizations**, and **Bluefly** connect.

Anchor message: *"Come for the code, stay for the community."*

The diagram targets people who land on drupal.org (or hear about Drupal) and cannot easily see that it is more than a CMS — it is a framework, a global community of initiatives and local organizations, and an ecosystem of private companies that build products and services around it. Bluefly's role: a platform sustaining independent developers and small companies who build community, tools, and products.

**Deliverable:** standalone static site (HTML + JS + D3), deployable to GitHub Pages / Netlify / similar.

**Reference visual:** https://observablehq.com/@d3/zoomable-circle-packing
**Reference subjects:** https://drupal.org/ (primary) and https://bluefly.io/ (one of the four groups)

---

## Decisions locked

| # | Decision | Rationale (short) |
|---|---|---|
| 1 | **Visual model:** D3 zoomable circle packing | Matches the reference demo; communicates hierarchy + magnitude; well-documented pattern |
| 2 | **Top-level groups (4):** Code, Community, Private Organizations, Bluefly | Bluefly elevated to top-level to reflect its cross-cutting role |
| 3 | **Sizing rule:** hand-assigned editorial weight (1–5 per node) | Project lead decides what newcomers should notice; no metric scraping in v1 |
| 4 | **Click behavior:** zoom into the clicked circle + open a side panel with name, description, and links | Shapes alone do not explain; an explainer needs words |
| 5 | **v1 depth:** 3 levels — top group → child category → named examples | ~40–60 nodes; richer than skeleton, shippable without infinite copywriting |
| 6 | **Data quality bar:** descriptions and links are optional per node; real prose preferred where present | Lets us ship structure even before all copy is written; name-only nodes still render and zoom (revised 2026-05-25) |
| 7 | **Library:** D3.js v7 from CDN, no build step | See `docs/technical/decisions/0001-visualization-library.md` |
| 8 | **Data source for v1:** hand-curated JSON in `data/`, scraping/automation deferred | Lets us ship structure before automating; revisit once content stabilizes |
| 9 | **Depth:** unconstrained — nests as deep as the data warrants | Circle packing handles arbitrary depth; labels/zoom keep deep branches readable (revised 2026-05-25) |
| 10 | **Events placement:** nested under their organizing body | Newcomers see who runs what; preserves the "organized by" relationship visually |
| 11 | **Bluefly internal structure:** Bluefly → (Independent Developers, Small Companies) | Foregrounds the community Bluefly enables, not Bluefly-as-vendor |
| 12 | **Cross-group relationships in v1:** side-panel hints only, no visual arcs | Side panel shows "Connected to: X, Y, Z" with click-to-navigate; preserves circle-packing clarity |

---

## Substructure sketch (not yet final)

The hierarchy below is the working draft of what v1 might contain. Names and groupings will be finalized in the design phase.

- **Code**
  - Core (Drupal Core, hosted in git)
  - Contributed modules
  - Tools (DDEV, Drush, …)
- **Community**
  - Initiatives (Composer Support in Core, Drupal AI, IXP, Community Working Group, …)
  - Organizations — organized by region
    - United States (US Drupal Association → DrupalCon; Florida Drupal Community → Florida DrupalCamp; Texas Drupal Community → Texas DrupalCamp; …)
    - Europe (European Drupal Association → DrupalCon Europe; …)
    - Latin America (regional camps and communities — TBD)
- **Private Organizations** — organized by region
  - United States (Acquia, Pantheon, Palantir, Four Kitchens, Tag1, Kanopi, …)
  - Latin America (Seed — Colombia; ParallelDev — Costa Rica; …)
  - (additional regions: Europe, Asia-Pacific, etc., to be added as we have data)
- **Bluefly**
  - Independent Developers (named examples)
  - Small Companies (named examples)

Structural decisions (resolved):
- Events nest under their organizing body (decision #10).
- Bluefly's level-2 children are *Independent Developers* and *Small Companies* (decision #11).
- Cross-group ties (sponsorship, maintenance, etc.) are shown as "Connected to:" links inside side panels, not as arcs on the diagram (decision #12).

---

## Repository layout

```
drupal-ecosystem/
├── .claude/
│   ├── CLAUDE.md                              # Project instructions for Claude
│   ├── settings.json                          # Permissions, MCP enable
│   ├── rules/                                 # (empty) path-targeted rules
│   └── hooks/                                 # (empty) lifecycle hooks
├── data/                                      # Hand-curated JSON dataset(s) — empty until design phase
├── src/                                       # Static site (index.html, JS, CSS) — empty until build phase
├── docs/
│   ├── technical/
│   │   └── decisions/
│   │       └── 0001-visualization-library.md  # ADR: why D3
│   ├── plans/                                 # (will hold the design doc + implementation plan)
│   └── research/                              # (empty) drupal.org / bluefly.io analysis
├── project_state.md                           # This file
└── .gitignore
```

Reference docs (stable inputs) live at `../reference-docs/drupal-ecosystem/`.

---

## What's done

- [x] Project scaffolding created (`.claude/`, `data/`, `src/`, `docs/`)
- [x] CLAUDE.md, settings.json, .gitignore
- [x] Requirements gathered through clarifying questions
- [x] ADR 0001 — visualization library (D3) documented with alternatives
- [x] Design doc (`docs/plans/2026-05-25-drupal-ecosystem-graph-design.md`)
- [x] Implementation plan (`docs/plans/2026-05-25-drupal-ecosystem-graph-implementation.md`)
- [x] v1 dataset authored — full Drupal ecosystem inventory in `data/graph.json` (palette aligned to Drupal brand portal)
- [x] Static site built in `src/` — D3 circle pack + zoom + side panel + cross-reference navigation + keyboard nav + reduced-motion + no-JS fallback
- [x] Manual QA checklist (`docs/project/qa-log.md`) — Chromium green; Firefox/Safari/VoiceOver pending real-human pass
- [x] Deployed to GitHub Pages: https://palcera.github.io/drupal-ecosystem/src/

## What's next

1. Gather feedback from the project lead and a few newcomers.
2. Fill in placeholder leaves (Bluefly Independent Developers / Small Companies, Latin America community camps).
3. Cross-browser pass on Firefox + Safari, screen-reader pass on VoiceOver/NVDA.
4. Decide on §15 open questions (final URL/hosting, branding stance, translations).

## Open questions (parking lot)

- What's the exact URL / hosting target? GitHub Pages under bluefly.io? A subpath?
- Branding: should the site use Bluefly's visual identity (colors, type)? Drupal's? A neutral palette so it reads as ecosystem-wide rather than Bluefly-owned?
- Accessibility: keyboard navigation through circles, screen reader narration of the hierarchy — scope for v1 or v2?
- Mobile: does the zoom interaction work well on touch? Test plan needed.
- Translations (Spanish at minimum)?

## Out of scope for v1

- Live data from drupal.org (scraping, APIs)
- Cross-group relationship arcs (e.g., sponsorship lines between Private Orgs and Community events)
- User-submitted entries
- Search / filter UI
- Analytics
