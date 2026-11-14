<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { RACE_STEPS, raceOutcomes, raceStart, raceStep, type RaceState } from '../../lib/sim/sync';

  const START = 5;
  const tally = raceOutcomes(START);
  const totalWays = Object.values(tally).reduce((a, b) => a + b, 0);

  let s = $state<RaceState>(raceStart(START));
  let history = $state<('P' | 'C')[]>([]);

  const finished = $derived(s.p === 3 && s.c === 3);
  function step(who: 'P' | 'C') {
    s = raceStep(s, who);
    history = [...history, who];
  }
  function play(order: ('P' | 'C')[]) {
    reset();
    for (const who of order) step(who);
  }
  function reset() {
    s = raceStart(START);
    history = [];
  }
  const LINE = 'flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-xs';
</script>

<VizCard kind="Simulator" title="counter++ and counter-- at the same time">
  <p class="text-sm">The shared variable <span class="font-mono">counter</span> is {START}. The producer executes <span class="font-mono">counter++</span> and the consumer executes <span class="font-mono">counter--</span>. Each is three machine instructions. Choose the order in which they run.</p>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    {#each [['P', 'Producer: counter++', s.p, s.reg1, 'register1'], ['C', 'Consumer: counter--', s.c, s.reg2, 'register2']] as [who, title, done, reg, regName]}
      <div class="rounded-md border p-2.5">
        <p class="mb-2 text-sm font-medium">{title}</p>
        {#each RACE_STEPS[who as 'P' | 'C'] as line, i}
          <p class="{LINE} {i < (done as number) ? 'text-muted-foreground line-through' : i === done ? 'bg-primary/10 font-medium' : ''}">{line}</p>
        {/each}
        <div class="mt-2 flex items-center justify-between gap-2">
          <span class="font-mono text-xs">{regName} = {reg ?? '—'}</span>
          <Button variant="primary" size="sm" class="h-7 px-2.5 text-xs" disabled={(done as number) >= 3} onclick={() => step(who as 'P' | 'C')}>Run next instruction</Button>
        </div>
      </div>
    {/each}
  </div>

  <p class="mt-4 text-sm" role="status">
    counter = <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium">{s.counter}</span>
    {#if finished}
      {#if s.counter === START}
        <span class="border-success bg-success/10 ml-1 rounded-sm border px-1.5 py-0.5 font-medium">correct</span> One increment and one decrement should leave it at {START}, and this order did.
      {:else}
        <span class="border-error bg-error/10 ml-1 rounded-sm border px-1.5 py-0.5 font-medium">wrong</span> It should be {START}. One process read
        the old value before the other had stored its result, so one update was lost.
      {/if}
    {:else}
      <span class="text-muted-foreground">Order so far: {history.length ? history.join(' ') : 'nothing run yet'}</span>
    {/if}
  </p>

  <div class="mt-3 flex flex-wrap gap-2">
    <Button variant="outline" size="sm" onclick={() => play(['P', 'P', 'C', 'C', 'P', 'C'])}>Play the classic bad order</Button>
    <Button variant="outline" size="sm" onclick={() => play(['P', 'P', 'P', 'C', 'C', 'C'])}>Play one after the other</Button>
    <Button variant="ghost" size="sm" disabled={history.length === 0} onclick={reset}>Reset</Button>
  </div>

  <div class="mt-4 border-t pt-4">
    <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">All {totalWays} possible orders of the six instructions</p>
    <div class="flex h-7 overflow-hidden rounded-md font-mono text-xs font-medium text-white" role="img" aria-label={Object.entries(tally).map(([v, n]) => `${n} orders end with counter ${v}`).join(', ')}>
      {#each Object.entries(tally) as [value, n]}
        <div class="grid place-items-center {Number(value) === START ? 'bg-chart-3' : 'bg-chart-5'}" style:flex-grow={n}>{n} → {value}</div>
      {/each}
    </div>
    <p class="text-muted-foreground mt-2 text-sm">Only {tally[START]} of the {totalWays} interleavings give the right answer: the two in which one process finishes all three instructions before the other starts.</p>
  </div>
</VizCard>
