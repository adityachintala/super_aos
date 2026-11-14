<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { spool, type Segment } from '../../lib/sim/foundations';

  let read = $state(4);
  let compute = $state(2);
  let print = $state(4);
  let count = $state(3);
  let spooling = $state(false);

  const jobs = $derived(Array.from({ length: count }, () => ({ read, compute, print })));
  const off = $derived(spool(jobs, false));
  const on = $derived(spool(jobs, true));
  const r = $derived(spooling ? on : off);
  const span = $derived(off.total);
  const COLORS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];
  const rows = $derived<[string, Segment[]][]>([
    ['Card reader', r.reader],
    ['CPU', r.cpu],
    ['Line printer', r.printer],
  ]);
  const pct = (x: number) => `${(x / span) * 100}%`;
</script>

<VizCard kind="Simulator" title="Spooling: the disk as a buffer">
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <SliderField label="Jobs" bind:value={count} min={1} max={5} />
    <SliderField label="Reading cards" bind:value={read} min={1} max={8} suffix=" s" />
    <SliderField label="Computing" bind:value={compute} min={1} max={8} suffix=" s" />
    <SliderField label="Printing" bind:value={print} min={1} max={8} suffix=" s" />
  </div>

  <div class="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Mode">
    <Button variant={!spooling ? 'primary' : 'outline'} size="sm" aria-pressed={!spooling} onclick={() => (spooling = false)}>Without spooling</Button>
    <Button variant={spooling ? 'primary' : 'outline'} size="sm" aria-pressed={spooling} onclick={() => (spooling = true)}>With spooling</Button>
  </div>

  <div class="mt-4 grid gap-2" role="img" aria-label={`Timeline of the card reader, CPU and printer ${spooling ? 'with' : 'without'} spooling. Total time ${r.total} seconds, CPU utilisation ${(r.utilisation * 100).toFixed(0)} percent.`}>
    {#each rows as [name, segs]}
      <div class="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-xs">
        <span class="font-medium">{name}</span>
        <div class="bg-muted relative h-7 rounded-sm">
          {#each segs as s}
            <div class="absolute inset-y-0 grid place-items-center overflow-hidden rounded-sm text-white {COLORS[s.job % COLORS.length]}" style:left={pct(s.start)} style:width={pct(s.end - s.start)}>J{s.job + 1}</div>
          {/each}
        </div>
      </div>
    {/each}
    <div class="grid grid-cols-[5.5rem_1fr] gap-2 text-xs">
      <span></span>
      <div class="text-muted-foreground flex justify-between font-mono"><span>0</span><span>{span} s</span></div>
    </div>
  </div>

  <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-4" role="status">
    <div><dt class="text-muted-foreground">Total time</dt><dd class="font-mono text-lg tabular-nums">{r.total} s</dd></div>
    <div><dt class="text-muted-foreground">CPU busy</dt><dd class="font-mono text-lg tabular-nums">{r.cpuBusy} s</dd></div>
    <div><dt class="text-muted-foreground">CPU utilisation</dt><dd class="font-mono text-lg tabular-nums">{(r.utilisation * 100).toFixed(0)}%</dd></div>
    <div><dt class="text-muted-foreground">Without / with</dt><dd class="font-mono text-lg tabular-nums">{(off.utilisation * 100).toFixed(0)}% / {(on.utilisation * 100).toFixed(0)}%</dd></div>
  </dl>
  <p class="text-muted-foreground mt-2 text-sm">
    {#if spooling}
      The reader copies cards to disk ahead of time and the printer drains output from disk afterwards, so the reading of one job, the
      computing of another and the printing of a third all overlap.
    {:else}
      The CPU deals with each device directly. While cards are read or lines are printed, the CPU can do nothing but wait for the slow
      mechanical device.
    {/if}
  </p>
</VizCard>
