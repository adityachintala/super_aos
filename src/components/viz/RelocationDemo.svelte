<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import Icon from '../Icon.svelte';

  const MEMORY = 1024; // K
  let base = $state(300);
  let limit = $state(240);
  let logical = $state(100);

  const legal = $derived(logical < limit);
  const physical = $derived(base + logical);
  const pct = (v: number) => `${(v / MEMORY) * 100}%`;

  $effect(() => {
    if (base + limit > MEMORY) base = MEMORY - limit;
  });

  const CHIP = 'rounded-md border px-2.5 py-1';
</script>

<VizCard kind="Try it" title="The MMU with a relocation and a limit register">
  <div class="grid gap-5 sm:grid-cols-3">
    <SliderField label="Relocation (base) register" bind:value={base} min={0} max={MEMORY - limit} step={10} suffix="K" />
    <SliderField label="Limit register" bind:value={limit} min={40} max={500} step={10} suffix="K" />
    <SliderField label="Logical address from CPU" bind:value={logical} min={0} max={500} step={5} suffix="K" />
  </div>

  <div class="mt-5 flex flex-wrap items-center gap-2 font-mono text-sm" role="status">
    <span class={CHIP}>logical {logical}</span>
    <Icon name="arrowRight" class="text-muted-foreground size-4" />
    <span class="{CHIP} {legal ? 'border-success bg-success/10' : 'border-error bg-error/10'}">{logical} &lt; {limit} ? {legal ? 'yes' : 'no'}</span>
    <Icon name="arrowRight" class="text-muted-foreground size-4" />
    {#if legal}
      <span class={CHIP}>{base} + {logical}</span>
      <Icon name="arrowRight" class="text-muted-foreground size-4" />
      <span class="{CHIP} border-primary bg-primary/7 font-medium">physical {physical}</span>
    {:else}
      <span class="{CHIP} border-error bg-error/10 font-medium">trap to the OS: addressing error</span>
    {/if}
  </div>

  <div class="hatch relative mt-4 h-11 overflow-hidden rounded-md border" role="img" aria-label={`Physical memory of ${MEMORY}K. The process occupies ${base}K to ${base + limit}K.`}>
    <div class="bg-chart-1 absolute inset-y-0 grid place-items-center overflow-hidden text-xs font-medium whitespace-nowrap text-white" style:left={pct(base)} style:width={pct(limit)}>
      this process
    </div>
    {#if legal}
      <div class="bg-foreground absolute inset-y-0 -ml-px w-0.5" style:left={pct(physical)}></div>
    {/if}
  </div>
  <div class="text-muted-foreground mt-1 flex justify-between font-mono text-xs"><span>0</span><span>{MEMORY}K</span></div>

  <p class="text-muted-foreground mt-3 text-sm">
    The process only ever sees addresses 0 to {limit - 1}K. Slide the base register: the process moves in physical memory, yet its logical addresses
    do not change. That is why compaction and swapping need execution-time binding.
  </p>
</VizCard>
