// Prepares a lesson for bite-sized reading.
//
// 1. Wraps each top-level "## heading" and everything up to the next one in
//    <section class="bite">, so a lesson can be read one bite at a time.
//    Anything before the first heading (MDX imports) is left where it is.
// 2. Numbers each heading (data-n), because CSS counters skip hidden sections.
// 3. Marks long runs of bold text (class "long"), so only short key terms get the
//    highlighter-pen look and whole bold sentences stay calm.

const LONG = 42; // characters

const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''));

function markLongStrong(node) {
  for (const child of node.children ?? []) {
    if (child.type === 'element' && child.tagName === 'strong' && textOf(child).length > LONG) {
      child.properties = { ...child.properties, className: ['long'] };
    }
    markLongStrong(child);
  }
}

export default function rehypeBites() {
  return (tree) => {
    markLongStrong(tree);

    const out = [];
    let section = null;
    let index = 0;
    for (const node of tree.children) {
      const isH2 = node.type === 'element' && node.tagName === 'h2';
      if (isH2) {
        node.properties = { ...node.properties, dataN: String(index + 1) };
        section = {
          type: 'element',
          tagName: 'section',
          properties: { className: ['bite'], dataBite: String(index++) },
          children: [],
        };
        out.push(section);
      }
      // Keep MDX import/export statements at the top level.
      if (section && node.type !== 'mdxjsEsm') section.children.push(node);
      else out.push(node);
    }
    if (index > 0) tree.children = out;
  };
}
