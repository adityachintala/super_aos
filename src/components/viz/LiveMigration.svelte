<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { preCopy } from '../../lib/sim/scaling';

  const PAGE_KB = 4;
  let memoryGB = $state(4);
  let sendMB = $state(100); // network: MB per second
  let dirtyMB = $state(40); // guest dirties this many MB of pages per second

  const pages = $derived((memoryGB * 1024 * 1024) / PAGE_KB);
  const perMB = 1024 / PAGE_KB;
  const m = $derived(preCopy(pages, sendMB * perMB, dirtyMB * perMB, 50 * perMB, 12));
  const mb = (p: number) => (p * PAGE_KB) / 1024;
  const fmtMB = (v: number) => (v >= 1024 ? `${(v / 1024).toFixed(2)} GB` : `${v.toFixed(0)} MB`);
  const fmtS = (s: number) => (s >= 1 ? `${s.toFixed(1)} s` : `${(s * 1000).toFixed(0)} ms`);
</script>

<VizCard kind="Simulator" title="Live migration by repeated copying">
  <div class="grid gap-5 sm:grid-cols-3">
    <SliderField label="Guest memory" bind:value={memoryGB} min={1} max={16} suffix=" GB" />
    <SliderField label="Network transfer rate" bind:value={sendMB} min={20} max={400} step={10} suffix=" MB/s" />
    <SliderField label="Guest dirties memory at" bind:value={dirtyMB} min={0} max={200} step={5} suffix=" MB/s" />
  </div>

  <div class="mt-5 grid gap-1.5" role="img" aria-label={`Pages sent in each round: ${m.rounds.map((r) => fmtMB(mb(r.sent))).join(', ')}`}>
    {#each m.rounds as r, i}
      <div class="grid grid-cols-[4.5rem_1fr_9rem] items-center gap-2 text-sm">
        <span class="text-muted-foreground">Round {i + 1}</span>
        <span class="bg-muted h-3 overflow-hidden rounded-full"><span class="bg-chart-1 block h-full rounded-full" style:width={`${Math.max(0.6, (r.sent / pages) * 100)}%`}></span></span>
        <span class="text-right font-mono text-xs tabular-nums">{fmtMB(mb(r.sent))} in {fmtS(r.seconds)}</span>
      </div>
    {/each}
    <div class="grid grid-cols-[4.5rem_1fr_9rem] items-center gap-2 text-sm">
      <span class="font-medium">Freeze</span>
      <span class="bg-muted h-3 overflow-hidden rounded-full"><span class="bg-chart-5 block h-full rounded-full" style:width={`${Math.max(0.6, (m.finalPages / pages) * 100)}%`}></span></span>
      <span class="text-right font-mono text-xs tabular-nums">{fmtMB(mb(m.finalPages))} in {fmtS(m.downtimeSeconds)}</span>
    </div>
  </div>

  <p class="mt-4 text-sm" role="status">
    {#if m.converged}
      <span class="border-success bg-success/10 rounded-sm border px-1.5 py-0.5 font-medium">Converged in {m.rounds.length} round{m.rounds.length === 1 ? '' : 's'}</span>
      The guest keeps running for {fmtS(m.totalSeconds - m.downtimeSeconds)} while memory is copied, and is frozen for only
      <span class="font-mono font-medium">{fmtS(m.downtimeSeconds)}</span>. Users do not notice.
    {:else}
      <span class="border-error bg-error/10 rounded-sm border px-1.5 py-0.5 font-medium">Not converging</span>
      The guest dirties memory nearly as fast as the network can carry it, so every round is about as big as the last. Giving up after
      {m.rounds.length} rounds means freezing the guest for <span class="font-mono font-medium">{fmtS(m.downtimeSeconds)}</span>.
    {/if}
  </p>
  <p class="text-muted-foreground mt-2 text-sm">
    Each round resends only the pages dirtied during the round before, so rounds shrink by the ratio of dirty rate to transfer rate ({dirtyMB} ÷ {sendMB}
    = {(dirtyMB / sendMB).toFixed(2)}). The guest is frozen once less than 50 MB remains.
  </p>
</VizCard>
