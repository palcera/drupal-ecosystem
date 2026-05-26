import fs from 'node:fs/promises';

const data = JSON.parse(await fs.readFile('data/graph.json', 'utf8'));

function render(node, depth = 0) {
  const heading = depth === 0 ? 'h1' : depth === 1 ? 'h2' : 'h3';
  const desc = node.description ? `<p>${escape(node.description)}</p>` : '';
  const children = (node.children || []).map((c) => render(c, depth + 1)).join('');
  return `<section>
    <${heading}>${escape(node.name)}</${heading}>
    ${desc}
    ${children}
  </section>`;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Drupal Ecosystem (text fallback)</title>
<style>body{max-width:48em;margin:2em auto;font:16px/1.5 system-ui;padding:0 1em;color:#222}h1{color:#12285F}h2{color:#006AA9;border-bottom:1px solid #eee;padding-bottom:0.25em}h3{color:#333}section{margin-bottom:1.5em}</style>
</head>
<body>
${render(data)}
</body></html>`;

await fs.writeFile('src/fallback.html', html);
console.log('Wrote src/fallback.html');
