# QA Log

## v1 manual pass — 2026-05-25

Run via Playwright (Chromium) against `http://localhost:8765/src/`.

| Check | Status | Notes |
|---|---|---|
| Chromium desktop — viz renders, zoom works, panel populates, no console errors | ✓ | Verified — clicked Tools sub-group, zoom + breadcrumb update + Drush/DDEV visible |
| Firefox desktop | — | Not run; needs Firefox install |
| Safari desktop | — | Not run; macOS only |
| Mobile (390×844, iPhone 14 size) — bottom sheet, no-overflow | ✓ | Closed = full viz; `.open` shows panel with handle, rounded corners, shadow |
| Tablet (900×1200) — stacked layout (60vh viz / 40vh panel) | ✓ | Verified |
| Keyboard a11y — circles expose as buttons with aria-label | ✓ | Accessibility tree shows `button` role for every circle with correct label |
| `prefers-reduced-motion` — zoom and sheet transitions disabled | ✓ | CSS + JS both honor the media query |
| VoiceOver / screen-reader announcement | — | Not automatable; SVG has `role="img"` + `<title>` + `<desc>`; each circle has `role="button"` + `aria-label` |
| No-JS fallback | ✓ | `fallback.html` renders the full inventory as structured headings + paragraphs |
| `<noscript>` pointer present in `index.html` | ✓ | Verified |
| Friendly error UI on load failure | ✓ | Verified by temporarily breaking `DATA_URL`; banner + Retry rendered |
| `data/graph.json` validation | ✓ | Happy path clean; duplicate-id and missing-name failure paths verified earlier |

### Follow-ups / known gaps

- Top-level group click-zoom: with the current dataset, top groups have children, so this now works fully — previous note about pointer-events on leaves no longer applies.
- Need a real human pass on Firefox + Safari and a real VoiceOver/NVDA listen.
- Bluefly leaves are placeholders (`Examples (TBD)`); needs real names with consent.
- Latin America community leaf is a placeholder; needs real camps named.
- DrupalCamp regional events (Florida, Texas) could use better link URLs once confirmed.
