<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';

  const table = [
    { name: 'main program', base: 1400, limit: 1000 },
    { name: 'sqrt function', base: 6300, limit: 400 },
    { name: 'symbol table', base: 4300, limit: 400 },
    { name: 'subroutine', base: 3200, limit: 1100 },
    { name: 'stack', base: 4700, limit: 1000 },
  ];
  const MEMORY = 7000;
  const color = (i: number) => `var(--chart-${i + 1})`;

  let s = $state(2);
  let d = $state(53);

  const seg = $derived(table[s]);
  const legal = $derived(d < seg.limit);
  const pct = (v: number) => `${(v / MEMORY) * 100}%`;
</script>

<VizCard kind="Try it" title="Translating a ⟨segment, offset⟩ address">
  <div class="grid gap-6 md:grid-cols-2">
    <div>
      <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">Segment table · pick a row</p>
      <div class="overflow-hidden rounded-md border text-sm">
        <div class="bg-muted grid grid-cols-[2.5rem_1fr_3.5rem_3.5rem] gap-2 px-2.5 py-1.5 text-xs font-medium">
          <span>s</span><span>segment</span><span>base</span><span>limit</span>
        </div>
        {#each table as row, i}
          <button
            type="button"
            class="hover:bg-muted grid w-full grid-cols-[2.5rem_1fr_3.5rem_3.5rem] items-center gap-2 border-t px-2.5 py-1.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {i ===
            s
              ? 'bg-primary/10 font-medium'
              : ''}"
            aria-pressed={i === s}
            onclick={() => (s = i)}
          >
            <span class="flex items-center gap-1.5 font-mono"><span class="size-2.5 rounded-xs" style:background={color(i)}></span>{i}</span>
            <span>{row.name}</span>
            <span class="font-mono">{row.base}</span>
            <span class="font-mono">{row.limit}</span>
          </button>
        {/each}
      </div>
    </div>
    <div class="grid content-start gap-5">
      <SliderField label="Offset d" bind:value={d} min={0} max={1300} />
      <p class="font-mono text-sm" role="status">
        ⟨{s}, {d}⟩ →
        {#if legal}
          {d} &lt; {seg.limit}, legal → {seg.base} + {d} = <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-medium">{seg.base + d}</span>
        {:else}
          <span class="border-error bg-error/10 rounded-sm border px-1.5 py-0.5">{d} ≥ {seg.limit}: trap, offset beyond end of segment</span>
        {/if}
      </p>
    </div>
  </div>

  <div class="bg-background dark:bg-input/30 relative mt-5 h-10 overflow-hidden rounded-md border" role="img" aria-label="Physical memory showing where each segment is placed">
    {#each table as row, i}
      <div
        class="absolute inset-y-0 grid place-items-center font-mono text-xs font-medium text-white transition-opacity"
        style:left={pct(row.base)}
        style:width={pct(row.limit)}
        style:background={color(i)}
        style:opacity={i === s ? 1 : 0.35}
      >
        {i}
      </div>
    {/each}
    {#if legal}<div class="bg-foreground absolute inset-y-0 -ml-px w-0.5" style:left={pct(seg.base + d)}></div>{/if}
  </div>
  <div class="text-muted-foreground mt-1 flex justify-between font-mono text-xs"><span>0</span><span>{MEMORY}</span></div>
  <p class="text-muted-foreground mt-3 text-sm">
    Segments have different lengths and sit wherever a big enough hole was found, so the gaps between them are external fragmentation.
  </p>
</VizCard>
