<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Alert, AlertDescription } from '../starwind-svelte/alert';
  import { Button } from '../starwind-svelte/button';
  import { Input } from '../starwind-svelte/input';
  import { compact, freeStats, memoryFromHoles, place, type Segment, type Strategy } from '../../lib/sim/memory';

  const STRATEGIES: { id: Strategy; name: string; rule: string }[] = [
    { id: 'first', name: 'First fit', rule: 'take the first hole that is big enough' },
    { id: 'best', name: 'Best fit', rule: 'take the smallest hole that is big enough' },
    { id: 'worst', name: 'Worst fit', rule: 'take the largest hole' },
  ];

  let holesText = $state('100, 500, 200, 300, 600');
  let queueText = $state('212, 417, 112, 426');
  let step = $state(0);
  let compacted = $state(false);

  const parse = (t: string) =>
    t
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 8);

  const holes = $derived(parse(holesText));
  const queue = $derived(parse(queueText).map((size, i) => ({ name: `P${i + 1}`, size })));
  const total = $derived(memoryFromHoles(holes).reduce((a, s) => a + s.size, 0));

  function simulate(strategy: Strategy) {
    let segs: Segment[] = memoryFromHoles(holes);
    let waiting: typeof queue = [];
    for (const r of queue.slice(0, step)) {
      const next = place(segs, r.name, r.size, strategy);
      if (next) segs = next;
      else waiting.push(r);
    }
    if (compacted) {
      segs = compact(segs);
      const still: typeof queue = [];
      for (const r of waiting) {
        const next = place(segs, r.name, r.size, strategy);
        if (next) segs = next;
        else still.push(r);
      }
      waiting = still;
    }
    return { segs, waiting, stats: freeStats(segs) };
  }

  const rows = $derived(STRATEGIES.map((s) => ({ ...s, ...simulate(s.id) })));
  const nextUp = $derived(queue[step]);

  function reset() {
    step = 0;
    compacted = false;
  }
  const colorOf = (owner: string) => `var(--chart-${((Number(owner.slice(1)) - 1) % 6) + 1})`;
</script>

<VizCard kind="Simulator" title="Placing processes into holes">
  <div class="grid gap-4 sm:grid-cols-2">
    <label class="grid gap-1.5 text-sm font-medium">
      Free holes, in memory order (K)
      <Input size="sm" class="font-mono" bind:value={holesText} oninput={reset} />
    </label>
    <label class="grid gap-1.5 text-sm font-medium">
      Requests, in arrival order (K)
      <Input size="sm" class="font-mono" bind:value={queueText} oninput={reset} />
    </label>
  </div>

  <div class="mt-4 flex flex-wrap items-center gap-2">
    <Button variant="primary" size="sm" disabled={!nextUp || compacted} onclick={() => (step += 1)}>
      {nextUp ? `Place ${nextUp.name} (${nextUp.size}K)` : 'All requests handled'}
    </Button>
    <Button variant="outline" size="sm" disabled={!nextUp || compacted} onclick={() => (step = queue.length)}>Run all</Button>
    <Button variant="outline" size="sm" disabled={compacted || step === 0} onclick={() => (compacted = true)}>Compact memory</Button>
    <Button variant="ghost" size="sm" disabled={step === 0} onclick={reset}>Reset</Button>
  </div>

  <div class="mt-5 grid gap-5">
    {#each rows as row}
      <div>
        <p class="text-sm"><span class="font-medium">{row.name}</span> <span class="text-muted-foreground">· {row.rule}</span></p>
        <div
          class="bg-background dark:bg-input/30 mt-1.5 flex h-11 gap-px overflow-hidden rounded-md border"
          role="img"
          aria-label={`${row.name} memory map: ${row.segs.map((s) => `${s.owner === null ? 'hole' : s.owner.startsWith('used') ? 'in use' : s.owner} ${s.size}K`).join(', ')}`}
        >
          {#each row.segs as seg}
            {#if seg.owner === null}
              <div class="seg text-muted-foreground" style:flex-grow={seg.size} title={`Free hole: ${seg.size}K`}>{seg.size}</div>
            {:else if seg.owner.startsWith('used')}
              <div class="seg hatch" style:flex-grow={seg.size} title="Already in use by other processes"></div>
            {:else}
              <div class="seg font-medium text-white" style:flex-grow={seg.size} style:background={colorOf(seg.owner)} title={`${seg.owner}: ${seg.size}K`}>
                {seg.owner}
              </div>
            {/if}
          {/each}
        </div>
        <p class="text-muted-foreground mt-1.5 text-sm">
          Free <span class="text-foreground font-medium tabular-nums">{row.stats.totalFree}K</span> in {row.stats.holeCount} hole{row.stats.holeCount === 1
            ? ''
            : 's'} · largest hole
          <span class="text-foreground font-medium tabular-nums">{row.stats.largestHole}K</span>
        </p>
        {#each row.waiting as w}
          <Alert variant="error" class="mt-2 px-3 py-2 text-sm">
            <AlertDescription>
              <span class="font-medium">{w.name} ({w.size}K) must wait.</span>
              {#if row.stats.totalFree >= w.size}
                {row.stats.totalFree}K is free in total, but no single hole is big enough: that is external fragmentation.
              {:else}
                There is simply not enough free memory.
              {/if}
            </AlertDescription>
          </Alert>
        {/each}
      </div>
    {/each}
  </div>

  <p class="text-muted-foreground mt-4 text-sm">
    Hatched blocks are memory already in use ({total}K in total). Plain numbers are free hole sizes in K. No strategy always wins: try holes
    <span class="font-mono">300, 200</span> with requests <span class="font-mono">180, 120, 100, 100</span> to see best fit lose to first fit.
  </p>
</VizCard>

<style>
  .seg {
    flex-basis: 0;
    min-width: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    font-size: 0.75rem;
    font-family: var(--font-mono);
    transition: flex-grow 0.35s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    .seg {
      transition: none;
    }
  }
</style>
