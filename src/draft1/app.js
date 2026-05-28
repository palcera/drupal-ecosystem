// Draft 1: Community-centric circle packing.
// Reuses the main render() unchanged; only the input tree is reshaped so
// the Community node becomes the root and absorbs Framework, Partners and
// Services, and Bluefly as additional children.
import { bootView } from '../boot.js';
import { render } from '../app.js';

bootView({
  dataUrl: '../../data/graph.json',
  transform: reparent,
  render: (data) =>
    render(data, {
      drawRoot: true,
      rootStroke: '#5EB8E8',
      rootStrokeWidth: 2,
      rootDash: '6 4',
    }),
});

// Lift the Community subtree to be the root; demote Framework, Partners and
// Services, and Bluefly into Community's children. IDs and inner structure
// preserved so cross-links via related_ids still resolve.
function reparent(data) {
  const community = data.children.find((c) => c.id === 'community');
  if (!community) throw new Error('reparent: community node not found');
  const others = data.children.filter((c) => c.id !== 'community');

  return {
    id: 'drupal',
    name: 'The Drupal Community',
    group: 'community',
    weight: 0,
    description:
      'Everything in Drupal grows from its community: the people, events, and initiatives produced the code, the partners and services around it, and platforms like Bluefly that sustain independent contributors.',
    links: community.links || [],
    related_ids: [],
    children: [...(community.children || []), ...others],
  };
}
