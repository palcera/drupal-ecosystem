export function renderPanel(node, allNodes, onNavigate) {
  const panel = document.getElementById('panel');
  panel.innerHTML = '';

  const crumbs = ancestorsOf(node)
    .map((a) => `<a href="#" data-id="${a.data.id}">${escapeHtml(a.data.name)}</a>`)
    .join(' › ');
  panel.insertAdjacentHTML('beforeend', `<nav class="crumbs">${crumbs}</nav>`);
  panel.insertAdjacentHTML('beforeend', `<h1 class="name">${escapeHtml(node.data.name)}</h1>`);

  if (!node.parent) {
    panel.insertAdjacentHTML(
      'beforeend',
      `<section class="legend">
        <p>Click any circle to explore. Each color represents a group:</p>
        <ul>
          <li><span class="dot dot-code"></span> Code</li>
          <li><span class="dot dot-community"></span> Community</li>
          <li><span class="dot dot-private"></span> Private Organizations</li>
          <li><span class="dot dot-bluefly"></span> Bluefly</li>
        </ul>
      </section>`,
    );
  }

  if (node.data.description) {
    panel.insertAdjacentHTML('beforeend', `<p class="desc">${escapeHtml(node.data.description)}</p>`);
  }

  if (node.data.links?.length) {
    const items = node.data.links
      .map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`)
      .join('');
    panel.insertAdjacentHTML('beforeend', `<section><h2>Links</h2><ul>${items}</ul></section>`);
  }

  if (node.data.related_ids?.length && allNodes) {
    const chips = node.data.related_ids
      .map((rid) => allNodes.find((n) => n.data.id === rid))
      .filter(Boolean)
      .map((n) => `<button class="chip" data-id="${n.data.id}">${escapeHtml(n.data.name)}</button>`)
      .join('');
    if (chips) {
      panel.insertAdjacentHTML('beforeend', `<section><h2>Connected to</h2><div class="chips">${chips}</div></section>`);
    }
  }

  if (onNavigate) {
    panel.querySelectorAll('[data-id]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        onNavigate(el.dataset.id);
      });
    });
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
