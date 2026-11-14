<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { predictBursts } from '../../lib/sim/sched';

  const ACTUAL = [6, 4, 6, 4, 13, 13, 13, 12, 5, 5, 6];
  const INITIAL = 10;
  let pct = $state(50);

  const alpha = $derived(pct / 100);
  const guess = $derived(predictBursts(ACTUAL, alpha, INITIAL));
  const error = $derived(ACTUAL.reduce((a, t, i) => a + Math.abs(t - guess[i]), 0) / ACTUAL.length);

  const W = 600;
  const H = 180;
  const x = (i: number) => 34 + (i / ACTUAL.length) * (W - 46);
  const y = (v: number) => H - 24 - (v / 14) * (H - 36);
  const path = (vals: number[]) => vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
</script>

<VizCard kind="Simulator" title="Guessing the length of the next CPU burst">
  <div class="max-w-sm">
    <SliderField label="α, the weight given to the most recent burst" bind:value={pct} min={0} max={100} step={5} suffix="%" />
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="mt-3 w-full" role="img" aria-label={`Actual bursts ${ACTUAL.join(', ')} against predictions ${guess.map((g) => g.toFixed(1)).join(', ')}`}>
    {#each [0, 4, 8, 12] as v}
      <line x1={x(0)} y1={y(v)} x2={x(ACTUAL.length)} y2={y(v)} stroke="var(--border)" stroke-dasharray="2 4" />
      <text x="28" y={y(v) + 4} fill="var(--muted-foreground)" font-size="11" text-anchor="end">{v}</text>
    {/each}
    <path d={path(guess)} fill="none" stroke="var(--primary)" stroke-width="2.5" />
    <path d={path(ACTUAL)} fill="none" stroke="var(--foreground)" stroke-width="1.5" stroke-dasharray="5 4" />
    {#each ACTUAL as v, i}<circle cx={x(i)} cy={y(v)} r="4" fill="var(--foreground)" />{/each}
    {#each guess as v, i}<circle cx={x(i)} cy={y(v)} r="3.5" fill="var(--primary)" stroke="var(--card)" stroke-width="1.5" />{/each}
    <text x={W - 10} y={H - 6} fill="var(--muted-foreground)" font-size="11" text-anchor="end">successive CPU bursts →</text>
  </svg>
  <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-foreground size-2 rounded-full"></span>actual burst t</span>
    <span class="flex items-center gap-1.5"><span class="bg-primary h-0.5 w-4"></span>prediction τ</span>
  </div>

  <div class="mt-3 overflow-x-auto">
    <table class="w-full text-center font-mono text-xs" aria-label="Actual bursts and predictions">
      <tbody>
        <tr><th class="text-muted-foreground pr-2 text-left font-sans font-medium">actual</th>{#each ACTUAL as v}<td class="px-1">{v}</td>{/each}<td class="text-muted-foreground px-1">?</td></tr>
        <tr><th class="text-muted-foreground pr-2 text-left font-sans font-medium">guess</th>{#each guess as v}<td class="px-1 font-medium">{Number.isInteger(v) ? v : v.toFixed(1)}</td>{/each}</tr>
      </tbody>
    </table>
  </div>

  <p class="mt-3 text-sm" role="status">
    τ<sub>n+1</sub> = {alpha.toFixed(2)} × t<sub>n</sub> + {(1 - alpha).toFixed(2)} × τ<sub>n</sub>. Average error over these bursts:
    <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium">{error.toFixed(2)}</span>.
    {#if pct === 0}With α = 0 recent history has no effect: the guess never moves from its initial value of {INITIAL}.
    {:else if pct === 100}With α = 1 only the most recent burst counts: the guess is always the previous burst.
    {:else}Each older burst counts for less than the one after it, by a factor of {(1 - alpha).toFixed(2)}.{/if}
  </p>
</VizCard>
