<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { debugEffort } from '../../lib/sim/foundations';

  let n = $state(1000);
  let k = $state(10);

  const whole = $derived(debugEffort(n, 1));
  const split = $derived(debugEffort(n, k));
  const fmt = (x: number) => Math.round(x).toLocaleString('en-US');
  const bar = (x: number) => `${Math.max(0.6, (x / whole) * 100)}%`;
</script>

<VizCard kind="Calculator" title="Why modules make debugging cheaper">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Statements in the program (N)" bind:value={n} min={100} max={10000} step={100} />
    <SliderField label="Modules (K)" bind:value={k} min={1} max={50} />
  </div>

  <div class="mt-5 grid gap-3 text-sm">
    <div>
      <div class="flex justify-between gap-2"><span>One monolithic program: N × N</span><span class="font-mono tabular-nums">{fmt(whole)}</span></div>
      <div class="bg-muted mt-1 h-4 overflow-hidden rounded-sm"><div class="bg-chart-5 h-full" style:width="100%"></div></div>
    </div>
    <div>
      <div class="flex justify-between gap-2"><span>{k} module{k === 1 ? '' : 's'} of {fmt(n / k)} statements: K × (N/K)²</span><span class="font-mono tabular-nums">{fmt(split)}</span></div>
      <div class="bg-muted mt-1 h-4 overflow-hidden rounded-sm"><div class="bg-chart-3 h-full transition-[width]" style:width={bar(split)}></div></div>
    </div>
  </div>

  <p class="mt-4 text-sm" role="status">
    Debugging effort falls by a factor of <span class="font-mono font-medium">{(whole / split).toFixed(0)}</span>, which is exactly K.
    <span class="text-muted-foreground">The model assumes the number of bugs is proportional to the number of statements, the time to find one bug is proportional to the size of the code you must search, and a bug in one module never requires you to look inside another.</span>
  </p>
</VizCard>
