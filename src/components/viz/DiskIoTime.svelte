<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { ioTime } from '../../lib/sim/disk';

  let rpmText = $state('7200');
  let seekMs = $state(5);
  let sizeKB = $state(4);

  const t = $derived(ioTime({ seekMs, rpm: Number(rpmText), sizeKB, rateGbps: 1, overheadMs: 0.1 }));
  const parts = $derived([
    { name: 'Seek', ms: t.seekMs, cls: 'bg-chart-1' },
    { name: 'Rotational latency', ms: t.latencyMs, cls: 'bg-chart-2' },
    { name: 'Transfer', ms: t.transferMs, cls: 'bg-chart-3' },
    { name: 'Controller overhead', ms: t.overheadMs, cls: 'bg-chart-4' },
  ]);
  const fmt = (ms: number) => (ms < 0.1 ? ms.toFixed(3) : ms.toFixed(2));
</script>

<VizCard kind="Calculator" title="Where the time goes in one disk I/O">
  <div class="grid items-end gap-5 sm:grid-cols-3">
    <label class="grid gap-1.5 text-sm font-medium">
      Spindle speed
      <NativeSelect size="sm" class="w-full" bind:value={rpmText}>
        {#each [5400, 7200, 10000, 15000] as r}<NativeSelectOption value={String(r)}>{r.toLocaleString('en-US')} RPM</NativeSelectOption>{/each}
      </NativeSelect>
    </label>
    <SliderField label="Average seek time" bind:value={seekMs} min={3} max={12} suffix=" ms" />
    <SliderField label="Amount to transfer" bind:value={sizeKB} min={4} max={1024} step={4} suffix=" KB" />
  </div>

  <div class="mt-5 flex h-9 gap-px overflow-hidden rounded-md" role="img" aria-label={parts.map((p) => `${p.name} ${fmt(p.ms)} milliseconds`).join(', ')}>
    {#each parts as p}
      <div class="{p.cls} min-w-0.5 transition-[flex-grow] duration-300" style:flex-grow={p.ms} title={`${p.name}: ${fmt(p.ms)} ms`}></div>
    {/each}
  </div>

  <dl class="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
    {#each parts as p}
      <div class="flex items-center justify-between gap-3">
        <dt class="flex items-center gap-2"><span class="{p.cls} size-2.5 rounded-xs"></span>{p.name}</dt>
        <dd class="font-mono tabular-nums">{fmt(p.ms)} ms</dd>
      </div>
    {/each}
  </dl>
  <p class="mt-3 text-sm">
    Average I/O time: <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium">{t.totalMs.toFixed(2)} ms</span>
    <span class="text-muted-foreground">(half a revolution at {Number(rpmText).toLocaleString('en-US')} RPM is {t.latencyMs.toFixed(2)} ms; transfer rate 1 Gb/s)</span>
  </p>
  <p class="text-muted-foreground mt-2 text-sm">
    For a small block almost all the time is spent positioning the head, not moving data. That is why the order in which requests are served
    matters so much on a hard disk.
  </p>
</VizCard>
