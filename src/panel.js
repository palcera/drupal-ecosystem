import { escapeHtml } from './html.js';

export function renderPanel(node, allNodes, onNavigate) {
  const panel = document.getElementById('panel');
  panel.innerHTML = '';

  const crumbs = ancestorsOf(node)
    .map((a, i) => {
      const label = i === 0 ? 'Home' : a.data.name;
      return `<a href="#" data-id="${a.data.id}">${escapeHtml(label)}</a>`;
    })
    .join(' › ');
  panel.insertAdjacentHTML('beforeend', `<nav class="crumbs">${crumbs}</nav>`);
  const headingTag = node.parent ? 'h2' : 'h1';
  panel.insertAdjacentHTML('beforeend', `<${headingTag} class="name">${escapeHtml(node.data.name)}</${headingTag}>`);

  if (node.data.description) {
    panel.insertAdjacentHTML('beforeend', `<p class="desc">${escapeHtml(node.data.description)}</p>`);
  }

  if (!node.parent) {
    panel.insertAdjacentHTML(
      'beforeend',
      `<section class="legend">
        <p>Click any circle to explore the four parts of the Drupal ecosystem:</p>
        <ul>
          <li>Framework</li>
          <li>Community</li>
          <li>Partners and Services</li>
          <li>Bluefly</li>
        </ul>
      </section>`,
    );
  }

  if (node.data.links?.length) {
    const items = node.data.links
      .map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`)
      .join('');
    panel.insertAdjacentHTML('beforeend', `<section><h3>Reference links</h3><ul>${items}</ul></section>`);
  }

  if (node.data.related_ids?.length && allNodes) {
    const chips = node.data.related_ids
      .map((rid) => allNodes.find((n) => n.data.id === rid))
      .filter(Boolean)
      .map((n) => `<button class="chip" data-id="${n.data.id}">${escapeHtml(n.data.name)}</button>`)
      .join('');
    if (chips) {
      panel.insertAdjacentHTML('beforeend', `<section><h3>Connected to</h3><div class="chips">${chips}</div></section>`);
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

