<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { findCycle, RAG_EXAMPLES, reduceRag } from '../../lib/sim/deadlock';

  let which = $state('no-cycle');
  let shown = $state(0); // how many processes of the reduction order have been removed

  const ex = $derived(RAG_EXAMPLES.find((e) => e.id === which)!);
  const g = $derived(ex.graph);
  const cycle = $derived(findCycle(g));
  const red = $derived(reduceRag(g));
  const gone = $derived(new Set(red.order.slice(0, shown)));
  const finished = $derived(shown >= red.order.length);

  const W = 600;
  const names = $derived(Object.keys(g.resources));
  const rx = (r: string) => ((names.indexOf(r) + 0.5) / names.length) * W;
  const px = (p: string) => ((g.processes.indexOf(p) + 0.5) / g.processes.length) * W;
  const RY = 50;
  const PY = 190;
  const inCycle = (a: string, b: string) => !!cycle && cycle.some((n, i) => n === a && cycle[(i + 1) % cycle.length] === b);

  function pick(id: string) {
    which = id;
    shown = 0;
  }
</script>

<VizCard kind="Simulator" title="Read a resource-allocation graph">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Example graph">
    {#each RAG_EXAMPLES as e}
      <Button variant={e.id === which ? 'primary' : 'outline'} size="sm" aria-pressed={e.id === which} onclick={() => pick(e.id)}>{e.name}</Button>
    {/each}
  </div>

  <svg viewBox={`0 0 ${W} 240`} class="mt-3 w-full" role="img" aria-label={`Resource-allocation graph. Requests: ${g.requests.map(([p, r]) => `${p} wants ${r}`).join(', ')}. Assignments: ${g.assignments.map(([r, p]) => `${r} held by ${p}`).join(', ')}.`}>
    <defs>
      <marker id="rag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke" /></marker>
    </defs>
    {#each g.assignments as [r, p]}
      {#if !gone.has(p)}
        <line x1={rx(r)} y1={RY + 24} x2={px(p)} y2={PY - 22} stroke={inCycle(r, p) ? 'var(--chart-5)' : 'var(--foreground)'} stroke-width={inCycle(r, p) ? 2.5 : 1.5} marker-end="url(#rag-arrow)" />
      {/if}
    {/each}
    {#each g.requests as [p, r]}
      {#if !gone.has(p)}
        <line x1={px(p) + 8} y1={PY - 22} x2={rx(r) + 8} y2={RY + 26} stroke={inCycle(p, r) ? 'var(--chart-5)' : 'var(--muted-foreground)'} stroke-width={inCycle(p, r) ? 2.5 : 1.5} stroke-dasharray="5 4" marker-end="url(#rag-arrow)" />
      {/if}
    {/each}
    {#each names as r}
      <rect x={rx(r) - 30} y={RY - 24} width="60" height="48" rx="6" fill="var(--card)" stroke="var(--foreground)" stroke-width="1.5" />
      {#each Array(g.resources[r]) as _, k}
        <circle cx={rx(r) - (g.resources[r] - 1) * 7 + k * 14} cy={RY + 8} r="4.5" fill="var(--foreground)" />
      {/each}
      <text x={rx(r)} y={RY - 8} fill="var(--foreground)" font-size="12" font-weight="600" text-anchor="middle">{r}</text>
    {/each}
    {#each g.processes as p}
      <circle cx={px(p)} cy={PY} r="22" fill={gone.has(p) ? 'var(--muted)' : 'var(--primary)'} opacity={gone.has(p) ? 0.6 : 1} />
      <text x={px(p)} y={PY + 5} fill={gone.has(p) ? 'var(--muted-foreground)' : '#fff'} font-size="13" font-weight="600" text-anchor="middle">{p}</text>
      {#if gone.has(p)}<text x={px(p)} y={PY + 40} fill="var(--muted-foreground)" font-size="11" text-anchor="middle">finished</text>{/if}
    {/each}
  </svg>
  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-foreground h-0.5 w-4"></span>assignment: resource held by process</span>
    <span class="flex items-center gap-1.5"><span class="border-muted-foreground w-4 border-t border-dashed"></span>request: process waiting for resource</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-5 h-0.5 w-4"></span>part of a cycle</span>
  </div>

  <p class="mt-3 text-sm">{ex.note}</p>

  <dl class="mt-3 grid gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-2">
    <div>
      <dt class="text-muted-foreground">Is there a cycle?</dt>
      <dd class="font-mono">{cycle ? `yes: ${[...cycle, cycle[0]].join(' → ')}` : 'no'}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Is there a deadlock?</dt>
      <dd>
        <span class="rounded-sm border px-1.5 py-0.5 font-medium {red.deadlocked.length ? 'border-error bg-error/10' : 'border-success bg-success/10'}">
          {red.deadlocked.length ? `yes: ${red.deadlocked.join(', ')}` : 'no'}
        </span>
      </dd>
    </div>
  </dl>

  <div class="mt-3 flex flex-wrap items-center gap-2">
    <Button variant="outline" size="sm" disabled={finished} onclick={() => (shown += 1)}>
      {finished ? (red.deadlocked.length ? 'No process can finish' : 'Everyone has finished') : `Let ${red.order[shown]} finish and release its resources`}
    </Button>
    <Button variant="ghost" size="sm" disabled={shown === 0} onclick={() => (shown = 0)}>Reset</Button>
  </div>
  <p class="text-muted-foreground mt-2 text-sm">
    The test for deadlock is to keep removing any process whose requests can all be met right now. If every process can be removed, there is no
    deadlock. Whatever is left is deadlocked.
  </p>
</VizCard>
