// Draft 2: Force-directed graph.
// Flattens the hierarchical dataset into nodes + two kinds of edges:
//   - hierarchy (parent→child)
//   - cross-reference (related_ids; rendered dashed)
// Default view shows the root + the four top-level groups + their direct
// children (depth ≤ 2). Click a node with hidden children to expand it;
// click again to collapse. Click any node to open the side panel.

import { bootView } from '../boot.js';
import { PILLAR_COLOR as GROUP_COLOR } from '../colors.js';
import { escapeHtml } from '../html.js';

const WIDTH = 900;
const HEIGHT = 700;

bootView({
  dataUrl: '../../data/graph.json',
  transform: flatten,
  render,
});

// ── Data prep ─────────────────────────────────────────────────────────
function flatten(root) {
  const nodes = [];
  const hierarchyLinks = [];
  const crossLinks = [];

  function walk(node, parent, depth, pillar) {
    const top = depth <= 1 ? node.group : pillar;
    // Shorter label for the root in the force-graph view; the canonical
    // dataset keeps the long form for the other diagrams.
    const displayName = depth === 0 ? 'Drupal Universe' : node.name;
    const n = {
      id: node.id,
      name: displayName,
      description: node.description || '',
      links: node.links || [],
      related_ids: node.related_ids || [],
      weight: node.weight || 1,
      depth,
      pillar: top,
      parentId: parent?.id || null,
      hasChildren: !!(node.children && node.children.length),
    };
    nodes.push(n);
    if (parent) {
      hierarchyLinks.push({ source: parent.id, target: node.id, type: 'hierarchy' });
    }
    (node.children || []).forEach((c) => walk(c, node, depth + 1, top));
  }
  walk(root, null, 0, 'root');

  // Cross-reference edges (deduped by sorted endpoints to avoid double-rendering
  // if both A→B and B→A are declared)
  const seen = new Set();
  nodes.forEach((n) => {
    n.related_ids.forEach((rid) => {
      const key = [n.id, rid].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      crossLinks.push({ source: n.id, target: rid, type: 'cross' });
    });
  });

  return { nodes, hierarchyLinks, crossLinks };
}

// Build the set of currently-visible node IDs given the expanded set.
// A node is visible if either it's the root, or its parent is expanded.
function computeVisible(allNodes, expanded) {
  const byId = new Map(allNodes.map((n) => [n.id, n]));
  const visible = new Set();
  const root = allNodes.find((n) => n.depth === 0);
  if (!root) return visible;
  visible.add(root.id);

  // BFS: traverse children of expanded nodes only
  const queue = [root.id];
  while (queue.length) {
    const id = queue.shift();
    if (!expanded.has(id)) continue;
    allNodes
      .filter((n) => n.parentId === id)
      .forEach((child) => {
        visible.add(child.id);
        queue.push(child.id);
      });
  }
  return visible;
}

// ── Rendering ─────────────────────────────────────────────────────────
function render({ nodes, hierarchyLinks, crossLinks }) {
  const vizEl = document.getElementById('viz');
  const svg = d3
    .select('#viz')
    .append('svg')
    .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('role', 'img');

  svg.append('title').text('Drupal Ecosystem — force-directed view');

  // Legend
  const legend = document.createElement('div');
  legend.className = 'fg-legend';
  legend.innerHTML = `
    <div><span class="swatch" style="background:${GROUP_COLOR.code}"></span>Framework</div>
    <div><span class="swatch" style="background:${GROUP_COLOR.community}"></span>Community</div>
    <div><span class="swatch" style="background:${GROUP_COLOR.private}"></span>Partners and Services</div>
    <div><span class="swatch" style="background:${GROUP_COLOR.bluefly}"></span>Bluefly</div>
    <div><span class="solid"></span>Hierarchy</div>
    <div><span class="dashed"></span>Cross-reference</div>
  `;
  vizEl.appendChild(legend);

  const g = svg.append('g');

  // Pan/zoom
  svg.call(
    d3
      .zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => g.attr('transform', event.transform)),
  );

  // Initial expansion: root + the four top-level pillars expanded (so depth 0,1,2 visible)
  const expanded = new Set();
  const root = nodes.find((n) => n.depth === 0);
  if (root) expanded.add(root.id);
  nodes.filter((n) => n.depth === 1).forEach((n) => expanded.add(n.id));

  const linkLayer = g.append('g').attr('class', 'fg-links');
  const nodeLayer = g.append('g').attr('class', 'fg-nodes');
  const labelLayer = g.append('g').attr('class', 'fg-labels');

  // Force simulation (singleton, mutated as visible set changes)
  const simulation = d3
    .forceSimulation()
    .force(
      'link',
      d3
        .forceLink()
        .id((d) => d.id)
        .distance((d) => (d.type === 'cross' ? 140 : 80))
        .strength((d) => (d.type === 'cross' ? 0.15 : 0.6)),
    )
    .force('charge', d3.forceManyBody().strength(-280))
    .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
    .force(
      'collide',
      d3.forceCollide().radius((d) => nodeRadius(d) + 4),
    );

  function nodeRadius(d) {
    if (d.depth === 0) return 28;
    if (d.depth === 1) return 22;
    if (d.hasChildren) return 14;
    return 7 + (d.weight || 1) * 1.2;
  }

  function nodeColor(d) {
    return GROUP_COLOR[d.pillar] || GROUP_COLOR.code;
  }

  function update() {
    const visible = computeVisible(nodes, expanded);
    const visibleNodes = nodes.filter((n) => visible.has(n.id));
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    const allLinks = [...hierarchyLinks, ...crossLinks];
    const visibleLinks = allLinks.filter((l) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return visibleIds.has(s) && visibleIds.has(t);
    });

    // Re-bind data, keeping object identity stable across updates (so the
    // simulation can preserve positions).
    const linkSel = linkLayer
      .selectAll('line')
      .data(visibleLinks, (d) => `${typeof d.source === 'object' ? d.source.id : d.source}|${typeof d.target === 'object' ? d.target.id : d.target}|${d.type}`)
      .join(
        (enter) => enter.append('line').attr('class', (d) => `fg-link ${d.type === 'cross' ? 'cross' : ''}`),
        (update) => update,
        (exit) => exit.remove(),
      );

    const nodeSel = nodeLayer
      .selectAll('circle')
      .data(visibleNodes, (d) => d.id)
      .join(
        (enter) => {
          const c = enter
            .append('circle')
            .attr('class', 'fg-node')
            .attr('r', (d) => nodeRadius(d))
            .attr('fill', (d) => nodeColor(d))
            .on('click', (event, d) => {
              event.stopPropagation();
              if (d.hasChildren) {
                if (expanded.has(d.id)) expanded.delete(d.id);
                else expanded.add(d.id);
                update();
              }
              renderPanel(d);
            })
            .call(drag(simulation));
          c.append('title').text((d) => d.name);
          return c;
        },
        (update) =>
          update.classed('expanded', (d) => expanded.has(d.id) && d.hasChildren),
        (exit) => exit.remove(),
      );
    nodeSel.classed('expanded', (d) => expanded.has(d.id) && d.hasChildren);

    const labelSel = labelLayer
      .selectAll('text')
      .data(visibleNodes, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append('text')
            .attr('class', (d) => `fg-label${d.depth >= 2 ? ' small' : ''}`)
            .attr('text-anchor', 'middle')
            .text((d) => d.name),
        (update) => update,
        (exit) => exit.remove(),
      );

    simulation.nodes(visibleNodes);
    simulation.force('link').links(visibleLinks);
    simulation.alpha(0.7).restart();

    simulation.on('tick', () => {
      linkSel
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      nodeSel.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      labelSel
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y + nodeRadius(d) + 12);
    });
  }

  function drag(sim) {
    return d3
      .drag()
      .on('start', (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }

  function renderPanel(node) {
    const panel = document.getElementById('panel');
    panel.innerHTML = '';
    // The page H1 already names this view; only show a panel heading once
    // the user drills into a specific node (depth > 0).
    if (node.depth > 0) {
      panel.insertAdjacentHTML(
        'beforeend',
        `<h2 class="name">${escapeHtml(node.name)}</h2>`,
      );
    }
    if (node.description) {
      panel.insertAdjacentHTML('beforeend', `<p class="desc">${escapeHtml(node.description)}</p>`);
    }
    if (node.hasChildren) {
      const isExpanded = expanded.has(node.id);
      panel.insertAdjacentHTML(
        'beforeend',
        `<p class="hint">${isExpanded ? 'Click the node again to collapse.' : 'Click the node to expand its children.'}</p>`,
      );
    }
    if (node.links?.length) {
      const items = node.links
        .map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`)
        .join('');
      panel.insertAdjacentHTML('beforeend', `<section><h3>Reference links</h3><ul>${items}</ul></section>`);
    }
    if (node.related_ids?.length) {
      const chips = node.related_ids
        .map((rid) => nodes.find((n) => n.id === rid))
        .filter(Boolean)
        .map((n) => `<button class="chip" data-id="${n.id}">${escapeHtml(n.name)}</button>`)
        .join('');
      if (chips) {
        panel.insertAdjacentHTML('beforeend', `<section><h3>Cross-references</h3><div class="chips">${chips}</div></section>`);
      }
    }
    panel.querySelectorAll('button.chip').forEach((el) => {
      el.addEventListener('click', () => {
        const target = nodes.find((n) => n.id === el.dataset.id);
        if (target) {
          // Expand all ancestors so target is visible
          let cur = target;
          while (cur && cur.parentId) {
            expanded.add(cur.parentId);
            cur = nodes.find((n) => n.id === cur.parentId);
          }
          update();
          renderPanel(target);
        }
      });
    });
  }

  svg.on('click', () => {
    renderPanel(root);
  });

  update();
  renderPanel(root);
}

