export function renderPanel(node) {
  const panel = document.getElementById('panel');
  panel.innerHTML = '';

  const crumbs = ancestorsOf(node)
    .map((a) => `<a href="#" data-id="${a.data.id}">${escapeHtml(a.data.name)}</a>`)
    .join(' › ');
  panel.insertAdjacentHTML('beforeend', `<nav class="crumbs">${crumbs}</nav>`);
  panel.insertAdjacentHTML('beforeend', `<h1 class="name">${escapeHtml(node.data.name)}</h1>`);

  if (node.data.description) {
    panel.insertAdjacentHTML('beforeend', `<p class="desc">${escapeHtml(node.data.description)}</p>`);
  }

  if (node.data.links?.length) {
    const items = node.data.links
      .map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`)
      .join('');
    panel.insertAdjacentHTML('beforeend', `<section><h2>Links</h2><ul>${items}</ul></section>`);
  }
}

function ancestorsOf(node) {
  const a = [];
  let cur = node;
  while (cur) { a.unshift(cur); cur = cur.parent; }
  return a;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
