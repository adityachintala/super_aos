<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { demandPagingEAT } from '../../lib/sim/paging';

  const MEMORY_NS = 100;
  const FAULT_NS = 25_000_000; // 25 milliseconds

  // The slider walks through "one fault in every N references", N from 10 to 10 million.
  let exponent = $state(3);
  const every = $derived(10 ** exponent);
  const p = $derived(1 / every);
  const eat = $derived(demandPagingEAT(p, MEMORY_NS, FAULT_NS));
  const slowdown = $derived(eat / MEMORY_NS);

  function time(ns: number) {
    if (ns >= 1e6) return `${(ns / 1e6).toFixed(2)} ms`;
    if (ns >= 1e3) return `${(ns / 1e3).toFixed(2)} µs`;
    return `${ns.toFixed(1)} ns`;
  }
  // Bar on a log scale from 100 ns to 25 ms.
  const bar = $derived(((Math.log10(eat) - 2) / (Math.log10(FAULT_NS) - 2)) * 100);
</script>

<VizCard kind="Calculator" title="What a page fault costs">
  <div class="max-w-md">
    <SliderField label="One page fault in every … references: 10 to the power" bind:value={exponent} min={1} max={7} step={0.5} />
  </div>

  <dl class="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
    <div>
      <dt class="text-muted-foreground">Fault probability p</dt>
      <dd class="font-mono">1 in {Math.round(every).toLocaleString('en-US')}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Effective access time</dt>
      <dd class="font-mono"><span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-medium">{time(eat)}</span></dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Slowdown against 100 ns</dt>
      <dd class="font-mono">{slowdown < 10 ? slowdown.toFixed(2) : Math.round(slowdown).toLocaleString('en-US')}×</dd>
    </div>
  </dl>

  <div class="bg-muted mt-4 h-3 overflow-hidden rounded-full" role="img" aria-label={`Effective access time ${time(eat)} on a scale from 100 nanoseconds to 25 milliseconds`}>
    <div class="h-full rounded-full {slowdown > 1.1 ? 'bg-error' : 'bg-success'}" style:width={`${Math.max(1.5, bar)}%`}></div>
  </div>
  <div class="text-muted-foreground mt-1 flex justify-between font-mono text-xs"><span>100 ns (no faults)</span><span>25 ms (every access faults)</span></div>

  <p class="text-muted-foreground mt-3 text-sm">
    Memory access is 100 ns and servicing a fault takes 25 ms, a quarter of a million times longer. The bar uses a logarithmic scale. To stay within
    10% of full speed you need fewer than one fault in 2.5 million references.
  </p>
</VizCard>
