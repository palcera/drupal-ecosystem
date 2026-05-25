// Boot
const DATA_URL = '../data/graph.json';

async function main() {
  const data = await fetch(DATA_URL).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} loading ${DATA_URL}`);
    return r.json();
  });

  // Give every leaf weight=1 for this task so pack() has something to sum.
  const root = d3.hierarchy(data).sum((d) => (d.children?.length ? 0 : (d.weight || 1)));
  const layout = d3.pack().size([800, 800]).padding(6);
  layout(root);

  const svg = d3
    .select('#viz')
    .append('svg')
    .attr('viewBox', '0 0 800 800')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg
    .selectAll('circle')
    .data(root.descendants())
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.r)
    .attr('fill', (d) => groupColor(d.data.group, d.depth))
    .attr('stroke', '#fff');

  svg
    .selectAll('text')
    .data(root.descendants().filter((d) => d.depth > 0))
    .join('text')
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', (d) => Math.max(10, d.r / 6))
    .attr('fill', '#fff')
    .text((d) => d.data.name);

  console.log(`rendered ${root.descendants().length} nodes`);
}

function groupColor(group, depth) {
  const base = {
    root: '#222',
    code: '#1f77b4',
    community: '#2ca02c',
    private: '#d62728',
    bluefly: '#9467bd',
  }[group] || '#888';
  // Lighten slightly with depth (placeholder until §5 polish task).
  return base;
}

main().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<p style="color:#b00;padding:1rem">Could not load the diagram data: ${err.message}</p>`,
  );
});
