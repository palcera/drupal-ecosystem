// Page entry: boot the canonical dataset into the circle-packing view.
import { bootView } from './boot.js';
import { render } from './app.js';

bootView({ dataUrl: '../data/graph.json', render });
