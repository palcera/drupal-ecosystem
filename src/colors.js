// Single source of truth for SVG fills. Mirrors src/tokens.css --node-1..--node-5
// (see docs/research/brand-cues.md). Hardcoded here because SVG fills can't read
// CSS custom properties reliably across browsers.

// Brand shades, darkest → lightest. Used by depth-indexed views.
export const SHADES = ['#1A3672', '#006AA9', '#009CDE', '#5EB8E8', '#CCEDF9'];

// Root background blends with --bg so the root circle disappears into the page.
export const ROOT_BG = '#0A1A3A';

// Per top-level pillar color. Used by the force-directed view.
export const PILLAR_COLOR = {
  root: ROOT_BG,
  code: '#006AA9',      // Framework
  community: '#009CDE',
  private: '#5EB8E8',   // Partners and Services
  bluefly: '#1A3672',
};

// Depth-indexed shade for circle packing.
export function groupColor(group, depth) {
  if (group === 'root') return ROOT_BG;
  return SHADES[Math.min(depth - 1, SHADES.length - 1)];
}
