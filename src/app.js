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
    .attr('stroke', '#fff')
    .attr('pointer-events', (d) => (!d.children ? 'none' : null))
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (d) => d.data.name)
    .on('click', (event, d) => {
      if (focus !== d) {
        zoom(event, d);
        renderPanel(d, allNodes, navigateById);
        event.stopPropagation();
      }
    })
    .on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (focus !== d) {
          zoom(event, d);
          renderPanel(d, allNodes, navigateById);
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        zoom(event, root);
        renderPanel(root, allNodes, navigateById);
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
    .attr('font-size', (d) => Math.max(10, d.r / 6))
    .attr('fill', '#fff')
    .attr('pointer-events', 'none')
    .text((d) => d.data.name);

  const allNodes = root.descendants();
  function navigateById(id) {
    const target = allNodes.find((n) => n.data.id === id);
    if (target) {
      zoom(null, target);
      renderPanel(target, allNodes, navigateById);
    }
  }

  svg.on('click', (event) => { zoom(event, root); renderPanel(root, allNodes, navigateById); });
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

main().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<p style="color:#b00;padding:1rem">Could not load the diagram data: ${err.message}</p>`,
  );
});
