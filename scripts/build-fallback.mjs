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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap">
<style>
  :root { --bg:#0A1A3A; --fg:#fff; --muted:rgba(255,255,255,0.72); --divider:rgba(255,255,255,0.15); --sky:#009CDE; }
  body { max-width:48em; margin:0 auto; padding:2em 1em; font:16px/1.55 "Noto Sans",sans-serif; color:var(--fg); background:var(--bg); }
  h1 { color:var(--fg); font-weight:700; font-size:2rem; }
  h2 { color:var(--sky); border-bottom:1px solid var(--divider); padding-bottom:0.25em; font-weight:700; }
  h3 { color:var(--fg); font-weight:500; }
  p { color:var(--muted); }
  section { margin-bottom:1.5em; }
  a { color:var(--sky); }
</style>
</head>
<body>
${render(data)}
</body></html>`;

await fs.writeFile('src/fallback.html', html);
console.log('Wrote src/fallback.html');
