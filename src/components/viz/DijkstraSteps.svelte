<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { dijkstra, makeGraph, pathTo } from '../../lib/sim/routing';

  const EDGES: [string, string, number][] = [
    ['A', 'B', 2], ['A', 'G', 6], ['B', 'C', 7], ['B', 'E', 2], ['C', 'D', 3], ['C', 'F', 3],
    ['D', 'H', 2], ['E', 'F', 2], ['E', 'G', 1], ['F', 'H', 2], ['G', 'H', 4],
  ];
  const POS: Record<string, [number, number]> = {
    A: [40, 110], B: [170, 40], C: [430, 40], D: [560, 110], E: [240, 110], F: [370, 110], G: [170, 180], H: [430, 180],
  };
  const SOURCE = 'A';
  const TARGET = 'D';
  const steps = dijkstra(makeGraph(EDGES), SOURCE);

  let at = $state(0);
  const step = $derived(at > 0 ? steps[at - 1] : null);
  const finished = $derived(at >= steps.length);
  const route = $derived(finished ? pathTo(steps[steps.length - 1].prev, TARGET) : []);
  const onRoute = (a: string, b: string) => route.some((n, i) => (n === a && route[i + 1] === b) || (n === b && route[i + 1] === a));
  const treeEdge = (a: string, b: string) => !!step && ((step.prev[a] === b && step.permanent.includes(a)) || (step.prev[b] === a && step.permanent.includes(b)));
</script>

<VizCard kind="Simulator" title="Dijkstra's shortest path, one node at a time">
  <svg viewBox="0 0 600 220" class="w-full" role="img" aria-label={`Graph with nodes A to H. ${step ? `Permanent so far: ${step.permanent.join(', ')}.` : 'No node is permanent yet.'}`}>
    {#each EDGES as [a, b, w]}
      {@const hot = onRoute(a, b)}
      <line x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} stroke={hot ? 'var(--primary)' : treeEdge(a, b) ? 'var(--foreground)' : 'var(--border)'} stroke-width={hot ? 4 : treeEdge(a, b) ? 2.5 : 1.5} />
      <text x={(POS[a][0] + POS[b][0]) / 2} y={(POS[a][1] + POS[b][1]) / 2 - 5} fill="var(--muted-foreground)" font-size="12" text-anchor="middle">{w}</text>
    {/each}
    {#each Object.entries(POS) as [n, [cx, cy]]}
      {@const perm = step?.permanent.includes(n)}
      {@const d = step?.dist[n]}
      <circle {cx} {cy} r="17" fill={step?.picked === n ? 'var(--primary)' : perm ? 'var(--foreground)' : 'var(--card)'} stroke={perm ? 'none' : 'var(--border)'} stroke-width="1.5" />
      <text x={cx} y={cy + 5} fill={perm ? 'var(--background)' : 'var(--foreground)'} font-size="14" font-weight="600" text-anchor="middle">{n}</text>
      <text x={cx} y={cy + (cy < 100 ? -24 : 36)} fill="var(--foreground)" font-size="12" text-anchor="middle">{d === undefined || d === Infinity ? '∞' : d}</text>
    {/each}
  </svg>

  <p class="mt-2 min-h-12 text-sm" role="status">
    {#if !step}
      Every node starts with distance ∞ except the source A, which is 0. Numbers beside the nodes are the best distance found so far.
    {:else}
      <span class="font-medium">Step {at}.</span> {step.picked} has the smallest tentative distance ({step.dist[step.picked]}), so it becomes permanent.
      Its neighbours are re-examined, and any that can now be reached more cheaply through {step.picked} are relabelled.
      {#if finished}<span class="font-medium"> Shortest path A to D: {route.join(' → ')}, length {steps[steps.length - 1].dist[TARGET]}.</span>{/if}
    {/if}
  </p>

  <div class="mt-3 flex flex-wrap gap-2">
    <Button variant="primary" size="sm" disabled={finished} onclick={() => (at += 1)}>{finished ? 'All nodes permanent' : 'Make the next node permanent'}</Button>
    <Button variant="ghost" size="sm" disabled={at === 0} onclick={() => (at = 0)}>Reset</Button>
  </div>
  <p class="text-muted-foreground mt-2 text-sm">Dark nodes are permanent: their distance can never get smaller. The node just made permanent is violet.</p>
</VizCard>
