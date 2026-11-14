<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { poolSim } from '../../lib/sim/threads';

  // A web server under a spiky load.
  const ARRIVALS = [1, 2, 1, 9, 8, 1, 0, 1, 2, 7, 1, 0, 1, 0, 0, 0];
  const SERVICE = 3;
  const total = ARRIVALS.reduce((a, b) => a + b, 0);

  let size = $state(4);
  const pool = $derived(poolSim(ARRIVALS, SERVICE, size));
  const perRequest = poolSim(ARRIVALS, SERVICE, Infinity);
  const top = $derived(Math.max(perRequest.peakThreads, ...pool.ticks.map((t) => t.busy + t.queued)));
</script>

<VizCard kind="Simulator" title="A thread per request, or a pool?">
  <div class="max-w-xs">
    <SliderField label="Threads in the pool" bind:value={size} min={1} max={14} />
  </div>

  <div class="mt-5 grid gap-4">
    <div>
      <p class="text-sm font-medium">Thread pool of {size}</p>
      <div class="mt-1.5 flex h-24 items-end gap-1 border-b" role="img" aria-label={`Busy threads and queued requests per tick with a pool of ${size}`}>
        {#each pool.ticks as t}
          <div class="flex h-full flex-1 flex-col justify-end">
            <span class="bg-chart-4 w-full rounded-t-xs" style:height={`${(t.queued / top) * 100}%`}></span>
            <span class="bg-chart-1 w-full" style:height={`${(t.busy / top) * 100}%`}></span>
          </div>
        {/each}
      </div>
      <p class="text-muted-foreground mt-1 text-xs">
        Threads ever created: <span class="text-foreground font-mono font-medium">{size}</span> (once, at start-up) · most busy at once {pool.peakThreads} · average wait
        <span class="text-foreground font-mono font-medium">{pool.meanWait.toFixed(1)}</span> ticks
      </p>
    </div>
    <div>
      <p class="text-sm font-medium">A new thread for every request</p>
      <div class="mt-1.5 flex h-24 items-end gap-1 border-b" role="img" aria-label="Threads alive per tick when one is created for each request">
        {#each perRequest.ticks as t}
          <div class="flex h-full flex-1 flex-col justify-end"><span class="bg-chart-5 w-full rounded-t-xs" style:height={`${(t.busy / top) * 100}%`}></span></div>
        {/each}
      </div>
      <p class="text-muted-foreground mt-1 text-xs">
        Threads created and destroyed: <span class="text-foreground font-mono font-medium">{total}</span> · most alive at once
        <span class="text-foreground font-mono font-medium">{perRequest.peakThreads}</span> · no queueing, but nothing limits the peak
      </p>
    </div>
  </div>

  <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-chart-1 size-2.5 rounded-xs"></span>pool threads busy</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-4 size-2.5 rounded-xs"></span>requests waiting for a thread</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-5 size-2.5 rounded-xs"></span>threads alive, one per request</span>
  </div>
  <p class="text-muted-foreground mt-2 text-sm">
    {total} requests arrive in bursts, each needing a thread for {SERVICE} ticks. A small pool keeps the number of threads bounded and avoids the
    cost of creating one per request, at the price of some waiting during a burst. Find the smallest pool for which nobody waits.
  </p>
</VizCard>
