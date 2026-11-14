<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { leakyBucket, tokenBucket } from '../../lib/sim/routing';

  // A bursty host: two bursts separated by silence.
  const ARRIVALS = [9, 9, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0];

  let rate = $state(3);
  let capacity = $state(8);

  const leaky = $derived(leakyBucket(ARRIVALS, rate, capacity));
  const token = $derived(tokenBucket(ARRIVALS, rate, capacity));
  const peak = Math.max(...ARRIVALS);
  const total = ARRIVALS.reduce((a, b) => a + b, 0);

  const rows = $derived([
    { name: 'What the host generates', data: ARRIVALS, cls: 'bg-foreground/40', note: `${total} packets in two bursts, peak ${peak} per tick` },
    {
      name: 'After a leaky bucket',
      data: leaky.map((t) => t.sent),
      cls: 'bg-chart-2',
      note: `never more than ${rate} per tick · ${leaky.reduce((a, t) => a + t.dropped, 0)} packets dropped because the bucket (queue) was full`,
    },
    {
      name: 'After a token bucket',
      data: token.map((t) => t.sent),
      cls: 'bg-chart-3',
      note: `a burst of up to ${capacity} gets through at once, then ${rate} per tick · nothing dropped, ${token[token.length - 1].waiting} still waiting`,
    },
  ]);
</script>

<VizCard kind="Simulator" title="Shaping a bursty source">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Rate (packets per tick)" bind:value={rate} min={1} max={8} />
    <SliderField label="Bucket capacity" bind:value={capacity} min={2} max={24} />
  </div>

  <div class="mt-5 grid gap-4">
    {#each rows as r}
      <div>
        <p class="text-sm font-medium">{r.name}</p>
        <div class="mt-1.5 flex h-20 items-end gap-1 border-b" role="img" aria-label={`${r.name}: ${r.data.join(', ')} packets per tick`}>
          {#each r.data as v}
            <div class="flex h-full flex-1 flex-col items-center justify-end">
              {#if v > 0}<span class="font-mono text-[0.65rem]">{v}</span>{/if}
              <span class="{r.cls} w-full rounded-t-xs" style:height={`${(v / peak) * 78}%`}></span>
            </div>
          {/each}
        </div>
        <p class="text-muted-foreground mt-1 text-xs">{r.note}</p>
      </div>
    {/each}
  </div>

  <p class="text-muted-foreground mt-4 text-sm">
    Time runs left to right. The leaky bucket is a queue drained at a constant rate: its output is perfectly smooth, but a burst larger than the
    queue is lost. The token bucket saves up permission while the host is idle, so it lets a limited burst through at full speed and never
    discards data.
  </p>
</VizCard>
