# Brand Cues — Drupal Ecosystem Graph

**Captured:** 2026-05-25
**Sources:**
- Drupal Brand Portal — https://drupal.widencollective.com/portals/gfvztttq/BrandPortal
- Reference site (dark theme + logo treatment) — https://grasmash.github.io/drupalorgredux/
- D3 zoomable circle packing — https://observablehq.com/@d3/zoomable-circle-packing (interaction model only)

---

## Color palette (official, from Drupal Brand Portal)

### Primary
| Token | Hex | Use |
|---|---|---|
| Drupal Navy | `#12285F` | Background, deep nodes, body text on light bg |
| Drupal Blue | `#006AA9` | Primary accent, mid-depth nodes |
| Drupal Sky  | `#009CDE` | Interactive accent, shallow nodes |

### Secondary
| Token | Hex |
|---|---|
| Light Blue tint | `#CCEDF9` |
| Black | `#000000` |
| White | `#FFFFFF` |

### Tertiary (accent — use sparingly)
| Token | Hex |
|---|---|
| Lavender | `#CCBAF4` |
| Gold     | `#FFC423` |
| Coral    | `#F46351` |
| Green    | `#397618` |

### Derived dark-theme background (from reference site)
- Hero/page background: `#0A1A3A` — a deeper navy than the official Drupal Navy. Used by the dark hero on grasmash.github.io/drupalorgredux. Sits one step darker than `#12285F` to make Navy itself usable as the next layer.

---

## Typography

| Role | Family | Source |
|---|---|---|
| All UI text | `Noto Sans` (weights 400, 500, 700) | Drupal secondary font, free via Google Fonts. Drupal wordmark itself is ZT Gatha but we don't need to retype it — we use the official SVG. |
| System fallback stack | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | Matches reference site's fallback chain |

The brand portal explicitly designates Noto Sans for body, H2, eyebrows, and most UI copy. ZT Gatha is logo-only.

---

## Logo treatment

- **Mark:** Official Drupal Drop + wordmark, inline SVG, white fill on dark bg.
- **Approx size in header:** 185×67 (intrinsic) — render at ~120px wide on this site to leave breathing room.
- **Position:** top-left, with generous left padding (~24px) and ~20px above.
- **Source for embedded SVG:** copied directly from the rendered drupal.org/grasmash header — the path data is the official mark. Stored at `src/assets/drupal-logo.svg`.
- **Licensing note:** the Drupal Brand Portal allows community/educational use of the Drop with proper representation; this project explains the Drupal ecosystem, which qualifies.

### Header divider ("underline")

- 1px horizontal line, `rgba(255, 255, 255, 0.15)`, runs the full width of the header strip immediately below the logo + nav area. Matches the reference site treatment exactly.

---

## Voice & tone (carry-over from project brief)

Anchor message: *"Come for the code, stay for the community."* Welcoming, factual, ecosystem-first — never sales-y. Newcomers should leave with a mental map, not a pitch.

---

## Derived palette — circle ramp for dark theme

Applied the color-theory rules from `brand-content-design:brand-palette` (monochromatic blue family + brand-anchor rule that keeps Drupal Blue + Sky in the ramp).

**Constraint:** background is `#0A1A3A`. Official Drupal Navy `#12285F` is too close to the background — it would visually disappear, so depth 1 uses a brightened navy.

| Depth | Token | Hex | Source |
|---|---|---|---|
| Background | `--bg` | `#0A1A3A` | Reference site (deeper than brand Navy by design) |
| L1 (top groups) | `--node-1` | `#1A3672` | Brand-anchor: Drupal Navy lifted ~10% in lightness for separation from bg |
| L2 | `--node-2` | `#006AA9` | Drupal Blue (primary) |
| L3 | `--node-3` | `#009CDE` | Drupal Sky (primary) |
| L4 | `--node-4` | `#5EB8E8` | Sky tint (Sky + 30% white) |
| L5 (deepest leaves) | `--node-5` | `#CCEDF9` | Brand Light Blue tint |
| Focus / hover highlight | `--accent` | `#FFC423` | Brand Gold (tertiary) — only color in the brand that reliably pops against both deep navy AND the blue ramp |
| Text on dark | `--fg` | `#FFFFFF` | Brand White |
| Muted text on dark | `--fg-muted` | `rgba(255,255,255,0.7)` | — |
| Faint divider on dark | `--divider` | `rgba(255,255,255,0.15)` | Matches reference header treatment |

Contrast spot-checks (WCAG):
- `--fg #FFFFFF` on `--bg #0A1A3A` → ratio ~15.6 ✓ AAA
- `--fg-muted` on `--bg` → ratio ~10.9 ✓ AAA
- `--accent #FFC423` on `--bg` → ratio ~10.0 ✓ AAA — safe as a focus ring color
- `--node-1 #1A3672` on `--bg` → fill-only (no text on it); separation is visual via stroke

## What we are NOT pulling from Drupal brand

- **GUI Block** decorations (computer-window frames). Documented in the brand guide as a visual motif but not relevant here — we have circles.
- **Gradients.** Reserved by the brand for hero-style usage; our viz works better with flat fills.
- **Photography & illustration style.** No imagery in v1.
