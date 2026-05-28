// Shared page boot: fetch the canonical dataset, validate it, optionally
// reshape it for a given view, then hand it to the view's render function.
// Surfaces load/validation errors via an in-page banner with a retry button.
import { validate } from './validate.js';

export async function bootView({ dataUrl, transform = (d) => d, render }) {
  try {
    const r = await fetch(dataUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status} loading ${dataUrl}`);
    const data = await r.json();
    const errors = validate(data);
    if (errors.length) {
      throw new Error('graph.json failed validation:\n  - ' + errors.join('\n  - '));
    }
    render(transform(data));
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
}

export function showError(message) {
  const el = document.createElement('div');
  el.className = 'load-error';
  el.innerHTML = `
    <strong>Could not load the diagram data.</strong>
    <p></p>
    <button type="button">Retry</button>
  `;
  el.querySelector('p').textContent = message;
  el.querySelector('button').addEventListener('click', () => location.reload());
  document.body.prepend(el);
}
