// Page entry: fetch the canonical dataset, validate, and render the
// circle-packing view. Drafts (src/draft1, src/draft2) have their own
// boot files and reuse render() from app.js with reshaped data.
import { validate } from './validate.js';
import { render, showError } from './app.js';

const DATA_URL = '../data/graph.json';

async function main() {
  const data = await fetch(DATA_URL).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} loading ${DATA_URL}`);
    return r.json();
  });

  const errors = validate(data);
  if (errors.length) {
    throw new Error('graph.json failed validation:\n  - ' + errors.join('\n  - '));
  }

  render(data);
}

main().catch((err) => {
  console.error(err);
  showError(err.message);
});
