<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { rtoTrace } from '../../lib/sim/transport';

  // A steady path, a burst of congestion, then a faster route.
  const BASE = [100, 104, 98, 101, 99, 103, 100, 97, 102, 100, 180, 240, 210, 150, 110, 100, 98, 102, 60, 62, 58, 61, 60, 59, 62, 60, 61, 59, 60, 60];

  let jitter = $state(0);
  // Deterministic "noise": alternate signs so the slider visibly roughens the samples.
  const samples = $derived(BASE.map((v, i) => Math.max(5, v + ((i * 37) % 11 - 5) * jitter)));
  const trace = $derived(rtoTrace(samples));
  const top = $derived(Math.max(...trace.map((p) => p.rto)) * 1.05);
  const late = $derived(trace.filter((p, i) => i > 0 && p.sample > trace[i - 1].rto).length);
  const lastP = $derived(trace[trace.length - 1]);

  const W = 600;
  const H = 200;
  const x = (i: number) => 38 + (i / (BASE.length - 1)) * (W - 50);
  const y = (v: number) => H - 24 - (v / top) * (H - 36);
  const pathOf = (key: 'srtt' | 'rto') => trace.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
</script>

<VizCard kind="Simulator" title="How long should TCP wait before retransmitting?">
  <div class="max-w-sm">
    <SliderField label="Extra variation in round-trip time" bind:value={jitter} min={0} max={12} />
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="mt-3 w-full" role="img" aria-label={`Measured round-trip times with the smoothed estimate and the retransmission timeout. Final timeout ${lastP.rto.toFixed(0)} milliseconds.`}>
    {#each [0, 100, 200, 300, 400, 500].filter((v) => v < top) as v}
      <line x1={x(0)} y1={y(v)} x2={x(BASE.length - 1)} y2={y(v)} stroke="var(--border)" stroke-dasharray="2 4" />
      <text x="32" y={y(v) + 4} fill="var(--muted-foreground)" font-size="11" text-anchor="end">{v}</text>
    {/each}
    <path d={pathOf('rto')} fill="none" stroke="var(--chart-5)" stroke-width="2" />
    <path d={pathOf('srtt')} fill="none" stroke="var(--primary)" stroke-width="2.5" />
    {#each trace as p, i}
      <circle cx={x(i)} cy={y(p.sample)} r="3.5" fill={i > 0 && p.sample > trace[i - 1].rto ? 'var(--chart-5)' : 'var(--foreground)'} />
    {/each}
    <text x={W - 10} y={H - 6} fill="var(--muted-foreground)" font-size="11" text-anchor="end">acknowledgements received →</text>
    <text x="40" y="12" fill="var(--muted-foreground)" font-size="11">milliseconds</text>
  </svg>

  <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-foreground size-2 rounded-full"></span>measured RTT</span>
    <span class="flex items-center gap-1.5"><span class="bg-primary h-0.5 w-4"></span>SRTT (smoothed)</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-5 h-0.5 w-4"></span>RTO = SRTT + 4 × RTTVAR</span>
  </div>

  <p class="mt-3 text-sm" role="status">
    After the last sample: SRTT = <span class="font-mono font-medium">{lastP.srtt.toFixed(0)} ms</span>, RTTVAR =
    <span class="font-mono font-medium">{lastP.rttvar.toFixed(0)} ms</span>, RTO = <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium">{lastP.rto.toFixed(0)} ms</span>.
    {late === 0 ? 'No acknowledgement arrived after its timer would have expired.' : `${late} acknowledgement${late === 1 ? '' : 's'} arrived later than the timeout in force, which would have caused a needless retransmission.`}
  </p>
  <p class="text-muted-foreground mt-2 text-sm">
    The smoothed estimate follows the samples slowly, so a single slow packet does not throw it off. The timeout sits well above it, and the gap
    widens automatically when round-trip times become erratic. Raise the variation and watch the red line pull away.
  </p>
</VizCard>
