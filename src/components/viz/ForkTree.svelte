<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { countNodes, forkTree, type ForkNode } from '../../lib/sim/process';

  let n = $state(3);
  const tree = $derived(forkTree(n));
  const total = $derived(countNodes(tree));

  interface Placed {
    node: ForkNode;
    x: number;
    y: number;
    parent: { x: number; y: number } | null;
  }
  const W = 600;
  const LEVEL = 56;
  // Lay the tree out by giving each leaf an equal slice of the width.
  const placed = $derived.by(() => {
    const out: Placed[] = [];
    let leaf = 0;
    const leaves = (t: ForkNode): number => (t.children.length ? t.children.reduce((a, c) => a + leaves(c), 0) : 1);
    const totalLeaves = leaves(tree);
    const walk = (t: ForkNode, depth: number, parent: { x: number; y: number } | null): number => {
      const y = 28 + depth * LEVEL;
      let x: number;
      const me: Placed = { node: t, x: 0, y, parent };
      out.push(me);
      if (t.children.length === 0) {
        x = ((leaf + 0.5) / totalLeaves) * W;
        leaf += 1;
      } else {
        const xs = t.children.map((c) => walk(c, depth + 1, me));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      me.x = x;
      return x;
    };
    walk(tree, 0, null);
    return out;
  });
  const depth = $derived(Math.max(...placed.map((p) => p.y)));
  const COLOR = ['var(--foreground)', 'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];
</script>

<VizCard kind="Try it" title="How many processes does this program create?">
  <div class="grid gap-5 md:grid-cols-[14rem_1fr]">
    <div>
      <SliderField label="Number of fork() calls" bind:value={n} min={1} max={4} />
      <pre class="bg-muted mt-4 overflow-x-auto rounded-md p-3 font-mono text-xs leading-relaxed">int main() {'{'}
{#each Array(n) as _, i}  <span style:color={COLOR[i + 1]} class="font-semibold">fork();</span>   /* call {i + 1} */
{/each}  printf("hello\n");
{'}'}</pre>
    </div>
    <div>
      <svg viewBox={`0 0 ${W} ${depth + 30}`} class="w-full" role="img" aria-label={`Process tree with ${total} processes after ${n} fork calls`}>
        {#each placed as p}
          {#if p.parent}<line x1={p.parent.x} y1={p.parent.y} x2={p.x} y2={p.y} stroke={COLOR[p.node.bornAt]} stroke-width="2" />{/if}
        {/each}
        {#each placed as p}
          <circle cx={p.x} cy={p.y} r="13" fill={COLOR[p.node.bornAt]} stroke="var(--card)" stroke-width="2" />
          <text x={p.x} y={p.y + 4} fill={p.node.bornAt === 0 ? 'var(--background)' : '#fff'} font-size="11" font-weight="600" text-anchor="middle">P{p.node.id}</text>
        {/each}
      </svg>
      <p class="text-sm" role="status">
        After {n} call{n === 1 ? '' : 's'} there are 2<sup>{n}</sup> = <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium">{total}</span> processes,
        so "hello" is printed {total} times. {total - 1} of them are new.
      </p>
    </div>
  </div>
  <p class="text-muted-foreground mt-3 text-sm">
    The colour of a line shows which call created that child. Every process that exists when a fork() is reached executes it, so each call doubles
    the count. A child starts at the instruction after the fork() that created it, which is why P1 (born at call 1) goes on to execute calls 2 and 3.
  </p>
</VizCard>
