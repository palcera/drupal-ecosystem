import { validate } from './validate.js';

const DATA_URL = '../data/graph.json';
const VIEW = 800;
const RADIUS = 160;
// Diamond slots: top, right, bottom, left (clockwise).
const SLOTS = [
  { x: VIEW / 2, y: VIEW / 2 - 200 },
  { x: VIEW / 2 + 200, y: VIEW / 2 },
  { x: VIEW / 2, y: VIEW / 2 + 200 },
  { x: VIEW / 2 - 200, y: VIEW / 2 },
];

const DEFAULT_TOP = 'community';

async function main() {
  const data = await fetch(DATA_URL).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} loading ${DATA_URL}`);
    return r.json();
  });

  const errors = validate(data);
  if (errors.length) {
    throw new Error('graph.json failed validation:\n  - ' + errors.join('\n  - '));
  }

  const groups = data.children; // 4 top-level
  renderPicker(groups, DEFAULT_TOP, (topId) => render(groups, topId));
  render(groups, DEFAULT_TOP);
}

function render(groups, topId) {
  const ordered = rotateToTop(groups, topId);

  const viz = d3.select('#viz');
  viz.selectAll('svg').remove();

  const svg = viz
    .append('svg')
    .attr('viewBox', `0 0 ${VIEW} ${VIEW}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const nodes = ordered.map((d, i) => ({ data: d, ...SLOTS[i] }));

  svg
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', RADIUS)
    .attr('fill', (d) => groupColor(d.data.group))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  svg
    .selectAll('text')
    .data(nodes)
    .join('text')
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', 22)
    .attr('font-weight', 600)
    .attr('fill', '#fff')
    .text((d) => d.data.name);

  console.log(`rendered ${nodes.length} nodes; top=${topId}`);
}

function renderPicker(groups, currentTop, onChange) {
  let bar = document.getElementById('picker');
  if (!bar) {
    bar = document.createElement('nav');
    bar.id = 'picker';
    document.querySelector('#viz').before(bar);
  }
  bar.innerHTML = '<span class="picker-label">Top:</span>' +
    groups
      .map(
        (g) =>
          `<button type="button" data-id="${g.id}" class="picker-btn${g.id === currentTop ? ' is-active' : ''}">${escapeHtml(g.name)}</button>`,
      )
      .join('');

  bar.querySelectorAll('.picker-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      bar.querySelectorAll('.picker-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      onChange(id);
    });
  });
}

function rotateToTop(groups, topId) {
  const idx = groups.findIndex((g) => g.id === topId);
  if (idx < 0) return groups;
  return [...groups.slice(idx), ...groups.slice(0, idx)];
}

function groupColor(group) {
  return {
    root: '#222',
    code: '#1f77b4',
    community: '#2ca02c',
    private: '#d62728',
    bluefly: '#9467bd',
  }[group] || '#888';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

main().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<p style="color:#b00;padding:1rem">Could not load the diagram data: ${err.message}</p>`,
  );
});
