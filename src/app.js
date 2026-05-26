// Boot
import { validate } from './validate.js';
import { renderPanel } from './panel.js';

const DATA_URL = '../data/graph.json';
const VIEW = 800;

async function main() {
  const data = await fetch(DATA_URL).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} loading ${DATA_URL}`);
    return r.json();
  });

  const errors = validate(data);
  if (errors.length) {
    throw new Error('graph.json failed validation:\n  - ' + errors.join('\n  - '));
  }

  const root = d3.hierarchy(data).sum((d) => (d.children?.length ? 0 : (d.weight || 1)));
  d3.pack().size([VIEW, VIEW]).padding(6)(root);

  const svg = d3
    .select('#viz')
    .append('svg')
    .attr('viewBox', `${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('role', 'img')
    .style('cursor', 'pointer');

  svg.append('title').text('Drupal Ecosystem diagram');
  svg.append('desc').text('An interactive circle-packing visualization of the Drupal ecosystem: Code, Community, Private Organizations, and Bluefly.');

  let focus = root;
  let view;

  const g = svg.append('g');

  const node = g
    .selectAll('circle')
    .data(root.descendants().slice(1))
    .join('circle')
    .attr('fill', (d) => groupColor(d.data.group, d.depth))
    .attr('pointer-events', (d) => (!d.children ? 'none' : null))
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (d) => d.data.name)
    .on('click', (event, d) => {
      if (focus !== d) {
        zoom(event, d);
        renderPanel(d, allNodes, navigateById);
        openSheet();
        event.stopPropagation();
      }
    })
    .on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (focus !== d) {
          zoom(event, d);
          renderPanel(d, allNodes, navigateById);
          openSheet();
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        zoom(event, root);
        renderPanel(root, allNodes, navigateById);
        closeSheet();
      }
    });

  // Native browser tooltip for every circle — guarantees the name is discoverable
  // even when the rendered label is shrunk or hidden because the circle is tiny.
  node.append('title').text((d) => d.data.name);

  const label = g
    .selectAll('text')
    .data(root.descendants().slice(1))
    .join('text')
    .style('fill-opacity', (d) => (d.parent === root ? 1 : 0))
    .style('display', (d) => (d.parent === root ? 'inline' : 'none'))
    .attr('text-anchor', 'middle')
    .attr('font-weight', 700)
    .attr('fill', '#fff')
    .attr('pointer-events', 'none')
    .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.55))');

  // Fit each label to its circle: pick a font size, wrap onto multiple lines if
  // needed, hide entirely if even the shrunken+wrapped version overflows.
  label.each(function (d) {
    fitLabel(this, d.data.name, d.r * 2);
  });

  const allNodes = root.descendants();
  const panelEl = document.getElementById('panel');
  const isSmallViewport = () => window.matchMedia('(max-width: 639px)').matches;
  const openSheet = () => { if (isSmallViewport()) panelEl.classList.add('open'); };
  const closeSheet = () => panelEl.classList.remove('open');

  function navigateById(id) {
    const target = allNodes.find((n) => n.data.id === id);
    if (target) {
      zoom(null, target);
      renderPanel(target, allNodes, navigateById);
      openSheet();
    }
  }

  svg.on('click', (event) => {
    zoom(event, root);
    renderPanel(root, allNodes, navigateById);
    closeSheet();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelEl.classList.contains('open')) {
      closeSheet();
    }
  });

  zoomTo([root.x, root.y, root.r * 2]);
  renderPanel(root, allNodes, navigateById);

  function zoomTo(v) {
    const k = VIEW / v[2];
    view = v;
    label.attr('transform', (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr('transform', (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr('r', (d) => d.r * k);
  }

  function zoom(event, d) {
    focus = d;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const transition = svg
      .transition()
      .duration(reduceMotion ? 0 : (event?.altKey ? 7500 : 750))
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

  console.log(`rendered ${root.descendants().length} nodes`);
}

// Mirrors src/tokens.css --node-1 .. --node-5 (see docs/research/brand-cues.md).
// Hardcoded here because SVG fills can't read CSS custom properties in all browsers.
function groupColor(group, depth) {
  if (group === 'root') return '#0A1A3A'; // matches --bg so root blends into the page
  const shades = ['#1A3672', '#006AA9', '#009CDE', '#5EB8E8', '#CCEDF9'];
  return shades[Math.min(depth - 1, shades.length - 1)];
}

// ── Label readability ────────────────────────────────────────────────
// Fit `name` into a circle of given diameter, applying (in order):
//   1. word wrapping into <tspan> lines on whitespace boundaries
//   2. shrinking the font size until it fits
//   3. hiding the label entirely if even the smallest legible size won't fit
//      (the circle still has a <title> for native hover tooltip)
function fitLabel(textEl, name, diameter) {
  const sel = d3.select(textEl);
  sel.selectAll('tspan').remove();
  sel.text(null);

  const maxWidth = diameter * 0.82;
  const minFont = 11;
  const maxFont = Math.max(14, Math.min(28, diameter / 5));

  // Pass 1: try the whole name on one line at decreasing sizes
  for (let f = maxFont; f >= minFont; f -= 1) {
    sel.attr('font-size', f).text(name);
    if (textEl.getComputedTextLength() <= maxWidth) {
      // Single-line — center vertically via dominant-baseline
      sel.attr('dominant-baseline', 'middle');
      return;
    }
  }

  // Pass 2: try wrapping into multiple lines, again shrinking the font
  const words = name.split(/\s+/);
  if (words.length < 2) {
    // single word that won't fit — leave hidden, tooltip will cover it
    sel.text(null);
    return;
  }

  for (let f = maxFont; f >= minFont; f -= 1) {
    sel.attr('font-size', f).text(null);
    const lines = greedyWrap(textEl, words, maxWidth);
    if (!lines) continue;
    paintLines(sel, lines, f);
    return;
  }

  // Couldn't fit even at the smallest size — hide; tooltip is the fallback.
  sel.text(null);
}

function greedyWrap(textEl, words, maxWidth) {
  const sel = d3.select(textEl);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    sel.text(candidate);
    if (textEl.getComputedTextLength() > maxWidth) {
      if (!current) return null; // single word too wide
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  // Confirm every line fits at this font size (the loop above only checks growth)
  for (const line of lines) {
    sel.text(line);
    if (textEl.getComputedTextLength() > maxWidth) return null;
  }
  sel.text(null);
  return lines;
}

function paintLines(sel, lines, fontSize) {
  // Remove the dominant-baseline middle trick — we position each tspan manually
  sel.attr('dominant-baseline', 'auto');
  const lineHeight = fontSize * 1.12;
  const total = lines.length * lineHeight;
  // Place first tspan so the block is vertically centered on y=0
  const firstY = -total / 2 + lineHeight * 0.8;
  lines.forEach((line, i) => {
    sel.append('tspan')
      .attr('x', 0)
      .attr('y', firstY + lineHeight * i)
      .text(line);
  });
}

function showError(message) {
  const el = document.createElement('div');
  el.className = 'load-error';
  el.innerHTML = `
    <strong>Could not load the diagram data.</strong>
    <p></p>
    <button type="button">Retry</button>
  `;
  el.querySelector('p').textContent = message;
  el.querySelector('button').addEventListener('click', () => location.reload());
  document.body.prepend(el);
}

main().catch((err) => {
  console.error(err);
  showError(err.message);
});
