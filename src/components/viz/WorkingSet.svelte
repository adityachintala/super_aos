<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { workingSets } from '../../lib/sim/paging';

  // Two clear localities: pages {1,2,5,6,7} first, then {3,4}.
  const refs = [2, 6, 1, 5, 7, 7, 7, 7, 5, 1, 6, 2, 3, 4, 1, 2, 3, 4, 4, 4, 3, 4, 3, 4, 4, 4, 1, 3, 2, 3, 4, 4, 4, 3, 4, 4];

  let delta = $state(10);
  let t = $state(9);

  const sets = $derived(workingSets(refs, delta));
  const ws = $derived(sets[t]);
  const start = $derived(Math.max(0, t - delta + 1));
  const peak = $derived(Math.max(...sets.map((s) => s.length)));
</script>

<VizCard kind="Try it" title="The working-set window">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Window size Δ (references)" bind:value={delta} min={1} max={20} />
    <SliderField label="Current time t" bind:value={t} min={0} max={refs.length - 1} />
  </div>

  <div class="mt-5 flex flex-wrap gap-1 font-mono text-sm" role="img" aria-label={`Reference string with the last ${delta} references up to time ${t} highlighted`}>
    {#each refs as r, i}
      <span
        class="grid size-7 place-items-center rounded-sm border {i === t
          ? 'border-primary bg-primary text-primary-foreground font-medium'
          : i >= start && i < t
            ? 'border-primary bg-primary/15'
            : i > t
              ? 'text-muted-foreground border-dashed'
              : ''}">{r}</span
      >
    {/each}
  </div>

  <p class="mt-4 text-sm" role="status">
    Working set at t = {t}: <span class="font-mono font-medium">{'{'}{ws.join(', ')}{'}'}</span>, so
    <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium">WSS = {ws.length}</span> frames are needed right
    now.
  </p>

  <div class="mt-4 flex h-16 items-end gap-0.5" role="img" aria-label="Working-set size at each point in time">
    {#each sets as s, i}
      <span class="flex-1 rounded-t-xs {i === t ? 'bg-primary' : 'bg-foreground/30'}" style:height={`${(s.length / peak) * 100}%`}></span>
    {/each}
  </div>
  <p class="text-muted-foreground mt-2 text-sm">
    The bars show the working-set size over time. With a sensible Δ it drops once the program settles into its second locality (pages 3 and 4).
    Make Δ very small and it misses pages the program still needs; make it very large and it keeps pages from a locality the program has left.
  </p>
</VizCard>
