<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { maxMin } from '../../lib/sim/transport';

  const CAPACITY = 12;
  let d = $state([2, 3, 6, 9]);
  const alloc = $derived(maxMin(CAPACITY, d));
  const used = $derived(alloc.reduce((a, b) => a + b, 0));
  const CLS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4'];
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));
</script>

<VizCard kind="Calculator" title="Max-min fair shares of one bottleneck link">
  <div class="grid gap-4 sm:grid-cols-2">
    {#each d as _, i}
      <SliderField label={`Flow ${i + 1} would like`} bind:value={d[i]} min={0} max={12} suffix=" Mbps" />
    {/each}
  </div>

  <div class="mt-5 flex h-9 overflow-hidden rounded-md border" role="img" aria-label={`Allocation of the ${CAPACITY} megabit link: ${alloc.map((a, i) => `flow ${i + 1} gets ${fmt(a)}`).join(', ')}`}>
    {#each alloc as a, i}
      {#if a > 0}<div class="{CLS[i]} grid place-items-center overflow-hidden font-mono text-xs font-medium text-white transition-[flex-grow] duration-300" style:flex-grow={a}>{fmt(a)}</div>{/if}
    {/each}
    {#if CAPACITY - used > 0.001}<div class="text-muted-foreground grid place-items-center font-mono text-xs" style:flex-grow={CAPACITY - used}>idle</div>{/if}
  </div>

  <div class="mt-3 grid gap-1 text-sm sm:grid-cols-2">
    {#each alloc as a, i}
      <p class="flex items-center gap-2">
        <span class="{CLS[i]} size-2.5 rounded-xs"></span>
        Flow {i + 1}: wants {d[i]}, gets <span class="font-mono font-medium">{fmt(a)}</span>
        <span class="text-muted-foreground">{a + 1e-9 >= d[i] ? '(satisfied)' : '(limited)'}</span>
      </p>
    {/each}
  </div>
  <p class="text-muted-foreground mt-3 text-sm">
    The link carries {CAPACITY} Mbps. Flows that want less than an equal share are given what they ask for, and the capacity they leave is split
    equally among the others. No flow can be given more without taking from a flow that already has the same amount or less.
  </p>
</VizCard>
