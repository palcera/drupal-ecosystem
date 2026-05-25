const viz = d3.select('#viz');
const svg = viz.append('svg').attr('viewBox', '-100 -100 200 200');
svg.append('circle').attr('r', 80).attr('fill', '#4a90e2');
console.log('d3 version:', d3.version);
