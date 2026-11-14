<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { amdahl, amdahlLimit, efficiency, gustafson } from '../../lib/sim/scaling';

  let percent = $state(25); // sequential fraction, in percent
  let logN = $state(4); // n = 2^logN

  const alpha = $derived(percent / 100);
  const n = $derived(2 ** logN);
  const sA = $derived(amdahl(alpha, n));
  const sG = $derived(gustafson(alpha, n));

  const MAX_LOG = 10;
  const W = 600;
  const H = 200;
  const x = (lg: number) => 34 + (lg / MAX_LOG) * (W - 50);
  // Speedup axis is logarithmic too, from 1 to 1024.
  const y = (s: number) => H - 26 - (Math.log2(Math.max(1, s)) / MAX_LOG) * (H - 44);
  const points = Array.from({ length: MAX_LOG * 4 + 1 }, (_, i) => i / 4);
  const line = (f: (a: number, n: number) => number) => points.map((lg, i) => `${i === 0 ? 'M' : 'L'}${x(lg).toFixed(1)},${y(f(alpha, 2 ** lg)).toFixed(1)}`).join(' ');
  const fmt = (v: number) => (v >= 100 ? Math.round(v).toLocaleString('en-US') : v.toFixed(2));
</script>

<VizCard kind="Calculator" title="Amdahl against Gustafson">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Sequential fraction α" bind:value={percent} min={0} max={50} suffix="%" />
    <SliderField label="Processors n = 2 to the power" bind:value={logN} min={0} max={MAX_LOG} />
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="mt-4 w-full" role="img" aria-label={`Speedup against number of processors. With ${n} processors, Amdahl gives ${fmt(sA)} and Gustafson gives ${fmt(sG)}.`}>
    {#each [0, 2, 4, 6, 8, 10] as lg}
      <line x1={x(lg)} y1={y(1)} x2={x(lg)} y2={y(1024)} stroke="var(--border)" stroke-dasharray="2 4" />
      <text x={x(lg)} y={H - 8} fill="var(--muted-foreground)" font-size="11" text-anchor="middle">{2 ** lg}</text>
      <text x="28" y={y(2 ** lg) + 4} fill="var(--muted-foreground)" font-size="11" text-anchor="end">{2 ** lg}</text>
    {/each}
    <line x1={x(0)} y1={y(1)} x2={x(MAX_LOG)} y2={y(1024)} stroke="var(--muted-foreground)" stroke-dasharray="5 4" />
    {#if alpha > 0}
      <line x1={x(0)} y1={y(amdahlLimit(alpha))} x2={x(MAX_LOG)} y2={y(amdahlLimit(alpha))} stroke="var(--chart-5)" stroke-dasharray="3 3" />
    {/if}
    <path d={line(gustafson)} fill="none" stroke="var(--chart-3)" stroke-width="2.5" />
    <path d={line(amdahl)} fill="none" stroke="var(--chart-1)" stroke-width="2.5" />
    <circle cx={x(logN)} cy={y(sG)} r="5.5" fill="var(--chart-3)" stroke="var(--card)" stroke-width="2" />
    <circle cx={x(logN)} cy={y(sA)} r="5.5" fill="var(--chart-1)" stroke="var(--card)" stroke-width="2" />
  </svg>
  <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-chart-1 h-0.5 w-4"></span>Amdahl (fixed workload)</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-3 h-0.5 w-4"></span>Gustafson (scaled workload)</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-5 h-0.5 w-4"></span>Amdahl's ceiling 1/α</span>
    <span class="text-muted-foreground">Dashed diagonal: ideal linear speedup. Both axes are logarithmic.</span>
  </div>

  <dl class="mt-4 grid gap-x-6 gap-y-3 border-t pt-4 text-sm sm:grid-cols-2">
    <div>
      <dt class="text-muted-foreground">Amdahl: 1 ÷ (α + (1 − α) ÷ n)</dt>
      <dd class="font-mono">
        1 ÷ ({alpha.toFixed(2)} + {(1 - alpha).toFixed(2)} ÷ {n}) = <span class="bg-chart-1 rounded-sm px-1.5 py-0.5 font-medium text-white">{fmt(sA)}</span>
        <span class="text-muted-foreground"> · efficiency {(efficiency(sA, n) * 100).toFixed(1)}%</span>
      </dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Gustafson: α + (1 − α) × n</dt>
      <dd class="font-mono">
        {alpha.toFixed(2)} + {(1 - alpha).toFixed(2)} × {n} = <span class="bg-chart-3 rounded-sm px-1.5 py-0.5 font-medium text-white">{fmt(sG)}</span>
        <span class="text-muted-foreground"> · efficiency {(efficiency(sG, n) * 100).toFixed(1)}%</span>
      </dd>
    </div>
  </dl>
  <p class="text-muted-foreground mt-3 text-sm">
    {#if alpha === 0}
      With no sequential part, both laws give perfect linear speedup.
    {:else}
      However many processors you add, Amdahl's speedup never passes 1 ÷ {alpha.toFixed(2)} = {fmt(amdahlLimit(alpha))}. Gustafson escapes the
      ceiling by assuming that a bigger machine is given a proportionally bigger problem.
    {/if}
  </p>
</VizCard>
