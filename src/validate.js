export function validate(root) {
  const errors = [];
  const ids = new Set();

  walk(root, (node, depth) => {
    if (!node.id) errors.push(`Node at depth ${depth} missing 'id'`);
    else if (ids.has(node.id)) errors.push(`Duplicate id: ${node.id}`);
    else ids.add(node.id);

    if (!node.name) errors.push(`Node '${node.id}' missing 'name'`);
    if (!node.group) errors.push(`Node '${node.id}' missing 'group'`);

    const isLeaf = !node.children || node.children.length === 0;
    if (isLeaf && node.id !== 'drupal') {
      if (typeof node.weight !== 'number' || node.weight < 1 || node.weight > 5) {
        errors.push(`Leaf '${node.id}' weight must be 1..5 (got ${node.weight})`);
      }
    }
  });

  // Second pass: related_ids resolution
  walk(root, (node) => {
    (node.related_ids || []).forEach((rid) => {
      if (!ids.has(rid)) errors.push(`Node '${node.id}' references unknown id '${rid}'`);
    });
  });

  return errors;
}

function walk(node, fn, depth = 0) {
  fn(node, depth);
  (node.children || []).forEach((c) => walk(c, fn, depth + 1));
}
