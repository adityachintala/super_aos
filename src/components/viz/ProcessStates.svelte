<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { applyEvent, legalEvents, TRANSITIONS, type PEvent, type Proc, type PState } from '../../lib/sim/process';

  const START: Proc[] = [
    { id: 'P1', state: 'running' },
    { id: 'P2', state: 'ready' },
    { id: 'P3', state: 'waiting' },
    { id: 'P4', state: 'new' },
  ];
  const POS: Record<PState, [number, number]> = { new: [60, 50], ready: [200, 130], running: [400, 130], waiting: [300, 230], terminated: [540, 50] };
  const ARROWS: { e: PEvent; path: string; lx: number; ly: number }[] = [
    { e: 'admit', path: 'M92,68 L168,112', lx: 150, ly: 80 },
    { e: 'dispatch', path: 'M236,146 Q300,176 364,146', lx: 300, ly: 180 },
    { e: 'interrupt', path: 'M364,114 Q300,84 236,114', lx: 300, ly: 84 },
    { e: 'io-wait', path: 'M392,166 L332,212', lx: 404, ly: 202 },
    { e: 'io-done', path: 'M268,212 L208,166', lx: 196, ly: 202 },
    { e: 'exit', path: 'M432,112 L508,68', lx: 446, ly: 80 },
  ];
  const COLOR = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

  let procs = $state<Proc[]>(START);
  let lastEvent = $state<{ id: string; e: PEvent } | null>(null);

  function fire(id: string, e: PEvent) {
    procs = applyEvent(procs, id, e);
    lastEvent = { id, e };
  }
  const inState = (s: PState) => procs.filter((p) => p.state === s);
</script>

<VizCard kind="Simulator" title="Four processes, one CPU">
  <svg viewBox="0 0 600 270" class="w-full" role="img" aria-label={`Process state diagram. ${procs.map((p) => `${p.id} is ${p.state}`).join(', ')}.`}>
    <defs>
      <marker id="ps-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke" /></marker>
    </defs>
    {#each ARROWS as a}
      {@const hot = lastEvent?.e === a.e}
      <path d={a.path} fill="none" stroke={hot ? 'var(--primary)' : 'var(--border)'} stroke-width={hot ? 3 : 1.5} marker-end="url(#ps-arrow)" />
      <text x={a.lx} y={a.ly} fill={hot ? 'var(--foreground)' : 'var(--muted-foreground)'} font-size="11" text-anchor="middle" font-weight={hot ? 600 : 400}>{TRANSITIONS[a.e].label.toLowerCase()}</text>
    {/each}
    {#each Object.entries(POS) as [s, [cx, cy]]}
      <ellipse {cx} {cy} rx="40" ry="22" fill="var(--card)" stroke="var(--foreground)" stroke-width="1.5" />
      <text x={cx} y={cy + 4} fill="var(--foreground)" font-size="12" font-weight="600" text-anchor="middle">{s}</text>
      {#each inState(s as PState) as p, i}
        <circle cx={cx - 22 + i * 15 + (4 - inState(s as PState).length) * 7} cy={cy + (cy > 200 ? -32 : 34)} r="6.5" fill={COLOR[Number(p.id[1]) - 1]} />
      {/each}
    {/each}
  </svg>

  <div class="mt-2 grid gap-2 sm:grid-cols-2">
    {#each procs as p, i}
      {@const events = legalEvents(p, procs)}
      <div class="flex flex-wrap items-center gap-2 rounded-md border px-2.5 py-2">
        <span class="size-3 rounded-full" style:background={COLOR[i]}></span>
        <span class="font-mono text-sm font-medium">{p.id}</span>
        <span class="text-muted-foreground text-sm">{p.state}</span>
        <span class="ml-auto flex flex-wrap gap-1">
          {#each events as e}
            <Button variant="outline" size="sm" class="h-7 px-2 text-xs" onclick={() => fire(p.id, e)}>{TRANSITIONS[e].label}</Button>
          {:else}
            <span class="text-muted-foreground text-xs">{p.state === 'terminated' ? 'finished' : p.state === 'ready' ? 'CPU is busy' : ''}</span>
          {/each}
        </span>
      </div>
    {/each}
  </div>

  <p class="mt-3 min-h-10 text-sm" role="status">
    {#if lastEvent}
      <span class="font-medium">{lastEvent.id}: {TRANSITIONS[lastEvent.e].label.toLowerCase()}.</span> {TRANSITIONS[lastEvent.e].why}
    {:else}
      Only one process can be running at a time; many may be ready or waiting. Try to give P2 the CPU. What has to happen first?
    {/if}
  </p>
  <Button variant="ghost" size="sm" class="mt-1" onclick={() => ((procs = START), (lastEvent = null))}>Reset</Button>
</VizCard>
