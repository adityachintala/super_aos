<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { csma, type Persistence } from '../../lib/sim/net';

  const KINDS: { id: Persistence; name: string; rule: string }[] = [
    { id: '1', name: '1-persistent', rule: 'busy? keep listening and send the instant it is idle' },
    { id: 'non', name: 'Nonpersistent', rule: 'busy? go away for a random time, then listen again' },
    { id: 'p', name: 'p-persistent (p = 0.1)', rule: 'idle? send with probability p, otherwise wait a slot' },
  ];

  let tenths = $state(20); // offered load, in tenths of a frame per frame time
  let stations = $state(20);

  const load = $derived(tenths / 10);
  const rows = $derived(KINDS.map((k) => ({ ...k, ...csma(k.id, stations, load, 12000) })));
  const maxDelay = $derived(Math.max(1, ...rows.map((r) => r.meanDelay)));
</script>

<VizCard kind="Simulator" title="How patient should a station be?">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Offered load (frames per frame time)" bind:value={tenths} min={1} max={60} />
    <SliderField label="Stations sharing the channel" bind:value={stations} min={2} max={50} />
  </div>
  <p class="text-muted-foreground mt-2 text-sm">Offered load is now <span class="text-foreground font-mono font-medium">{load.toFixed(1)}</span>. Above 1.0, stations want to send more than the channel can carry.</p>

  <div class="mt-4 grid gap-4">
    {#each rows as r}
      <div>
        <p class="text-sm"><span class="font-medium">{r.name}</span> <span class="text-muted-foreground">· {r.rule}</span></p>
        <div class="mt-1.5 grid grid-cols-[6.5rem_1fr_4rem] items-center gap-2 text-sm">
          <span class="text-muted-foreground">Throughput</span>
          <span class="bg-muted h-2.5 overflow-hidden rounded-full"><span class="bg-chart-3 block h-full rounded-full" style:width={`${r.throughput * 100}%`}></span></span>
          <span class="text-right font-mono tabular-nums">{(r.throughput * 100).toFixed(0)}%</span>
          <span class="text-muted-foreground">Mean wait</span>
          <span class="bg-muted h-2.5 overflow-hidden rounded-full"><span class="bg-chart-4 block h-full rounded-full" style:width={`${(r.meanDelay / maxDelay) * 100}%`}></span></span>
          <span class="text-right font-mono tabular-nums">{r.meanDelay.toFixed(0)}</span>
        </div>
        <p class="text-muted-foreground mt-1 text-xs">{r.collisions.toLocaleString('en-US')} collisions, {r.delivered.toLocaleString('en-US')} frames delivered</p>
      </div>
    {/each}
  </div>

  <p class="text-muted-foreground mt-4 text-sm">
    Throughput is the share of time the channel carries a frame that gets through. Wait is measured in slots (a frame lasts 8). Slide the load
    from 0.2 up to 4: at light load the impatient 1-persistent station waits least, but as load rises its stations all pounce at the same moment
    and collide, and the politer protocols carry more.
  </p>
</VizCard>
