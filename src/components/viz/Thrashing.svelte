<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';

  const FRAMES = 64;
  const MAX_N = 16;

  let n = $state(4);
  let wss = $state(8);

  // An illustrative model, not a measurement: utilisation climbs while every working set fits,
  // then collapses once total demand D exceeds the m frames available.
  function utilisation(procs: number) {
    const demand = procs * wss;
    const base = 1 - 0.62 ** procs;
    return demand <= FRAMES ? base : base * (FRAMES / demand) ** 4;
  }

  const demand = $derived(n * wss);
  const thrashing = $derived(demand > FRAMES);
  const limit = $derived(Math.floor(FRAMES / wss));
  const util = $derived(utilisation(n));

  const W = 600;
  const H = 180;
  const x = (p: number) => 30 + ((p - 1) / (MAX_N - 1)) * (W - 45);
  const y = (u: number) => H - 25 - u * (H - 40);
  const path = $derived(
    Array.from({ length: MAX_N }, (_, i) => i + 1)
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p).toFixed(1)},${y(utilisation(p)).toFixed(1)}`)
      .join(' '),
  );
</script>

<VizCard kind="Try it" title="Push the degree of multiprogramming too far">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Processes in memory" bind:value={n} min={1} max={MAX_N} />
    <SliderField label="Working-set size of each" bind:value={wss} min={2} max={16} suffix=" frames" />
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="mt-4 w-full" role="img" aria-label={`CPU utilisation against number of processes. With ${n} processes utilisation is ${Math.round(util * 100)} percent.`}>
    <line x1="30" y1={y(0)} x2={W - 10} y2={y(0)} stroke="var(--border)" />
    <line x1="30" y1={y(0)} x2="30" y2={y(1)} stroke="var(--border)" />
    {#if limit < MAX_N}
      <line x1={x(limit + 0.5)} y1={y(0)} x2={x(limit + 0.5)} y2={y(1)} stroke="var(--error)" stroke-dasharray="4 4" />
      <text x={x(limit + 0.5) + 6} y={y(1) + 10} fill="var(--foreground)" font-size="11">D &gt; m: thrashing</text>
    {/if}
    <path d={path} fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" />
    <circle cx={x(n)} cy={y(util)} r="6" fill="var(--primary)" stroke="var(--card)" stroke-width="2" />
    <text x="34" y={y(1) + 10} fill="var(--muted-foreground)" font-size="11">CPU utilisation</text>
    <text x={W - 10} y={H - 6} fill="var(--muted-foreground)" font-size="11" text-anchor="end">degree of multiprogramming →</text>
  </svg>

  <p class="mt-2 text-sm" role="status">
    Total demand D = {n} × {wss} = <span class="font-mono font-medium">{demand}</span> frames; memory has m =
    <span class="font-mono font-medium">{FRAMES}</span>.
    {#if thrashing}
      <span class="border-error bg-error/10 rounded-sm border px-1.5 py-0.5 font-medium">D &gt; m: thrashing</span> Processes steal frames from each
      other, queue at the paging disk, and the CPU sits idle at about {Math.round(util * 100)}%.
    {:else}
      <span class="border-success bg-success/10 rounded-sm border px-1.5 py-0.5 font-medium">D ≤ m: healthy</span> Every working set fits and the CPU
      is about {Math.round(util * 100)}% busy.
    {/if}
  </p>
  <p class="text-muted-foreground mt-2 text-sm">
    The shape of the curve is an illustration, not a measurement. The trap is real: an operating system that sees low CPU utilisation and reacts
    by admitting more processes makes thrashing worse.
  </p>
</VizCard>
