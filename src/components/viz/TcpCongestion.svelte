<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { cwndTrace, type LossKind, type Variant } from '../../lib/sim/transport';

  const ROUNDS = 40;
  let variant = $state<Variant>('reno');
  let losses = $state<Record<number, LossKind>>({ 13: 'dupack', 26: 'timeout' });
  let hover = $state<number | null>(null);

  const trace = $derived(cwndTrace(variant, ROUNDS, losses, 32));
  const peak = $derived(Math.max(44, ...trace.map((p) => p.cwnd)));
  const focus = $derived(hover === null ? null : trace[hover]);

  const W = 600;
  const H = 220;
  const x = (r: number) => 34 + (r / (ROUNDS - 1)) * (W - 46);
  const y = (c: number) => H - 26 - (c / peak) * (H - 40);
  const line = $derived(trace.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.rtt).toFixed(1)},${y(p.cwnd).toFixed(1)}`).join(' '));
  const thresh = $derived(trace.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.rtt).toFixed(1)},${y(p.ssthresh).toFixed(1)}`).join(' '));

  /** Click cycles a round through: no loss → three duplicate ACKs → timeout → no loss. */
  function cycle(r: number) {
    const next = { ...losses };
    if (!next[r]) next[r] = 'dupack';
    else if (next[r] === 'dupack') next[r] = 'timeout';
    else delete next[r];
    losses = next;
  }
</script>

<VizCard kind="Simulator" title="The TCP congestion window, round by round">
  <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="TCP variant">
    <Button variant={variant === 'tahoe' ? 'primary' : 'outline'} size="sm" aria-pressed={variant === 'tahoe'} onclick={() => (variant = 'tahoe')}>TCP Tahoe</Button>
    <Button variant={variant === 'reno' ? 'primary' : 'outline'} size="sm" aria-pressed={variant === 'reno'} onclick={() => (variant = 'reno')}>TCP Reno</Button>
    <Button variant="ghost" size="sm" onclick={() => (losses = {})}>Clear losses</Button>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="mt-3 w-full" role="img" aria-label={`Congestion window over ${ROUNDS} round trips: ${trace.map((p) => p.cwnd).join(', ')}`}>
    {#each [0, 10, 20, 30, 40] as c}
      <line x1={x(0)} y1={y(c)} x2={x(ROUNDS - 1)} y2={y(c)} stroke="var(--border)" stroke-dasharray="2 4" />
      <text x="28" y={y(c) + 4} fill="var(--muted-foreground)" font-size="11" text-anchor="end">{c}</text>
    {/each}
    <path d={thresh} fill="none" stroke="var(--chart-4)" stroke-width="1.5" stroke-dasharray="5 4" />
    <path d={line} fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round" />
    {#each trace as p}
      {#if p.loss}
        <line x1={x(p.rtt)} y1={y(0)} x2={x(p.rtt)} y2={y(p.cwnd)} stroke={p.loss === 'timeout' ? 'var(--chart-5)' : 'var(--chart-2)'} stroke-width="1.5" />
        <circle cx={x(p.rtt)} cy={y(p.cwnd)} r="5" fill={p.loss === 'timeout' ? 'var(--chart-5)' : 'var(--chart-2)'} stroke="var(--card)" stroke-width="1.5" />
      {/if}
    {/each}
    <text x={W - 10} y={H - 6} fill="var(--muted-foreground)" font-size="11" text-anchor="end">round-trip times →</text>
    <text x="36" y="12" fill="var(--muted-foreground)" font-size="11">cwnd (segments)</text>
  </svg>

  <p class="text-muted-foreground mt-2 text-xs font-medium tracking-wider uppercase">Click a round to inject a loss (click again to change its kind)</p>
  <div class="mt-1.5 flex gap-0.5">
    {#each trace as p}
      <button
        type="button"
        class="h-6 min-w-0 flex-1 rounded-xs text-[0.6rem] outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {p.loss === 'timeout'
          ? 'bg-chart-5 text-white'
          : p.loss === 'dupack'
            ? 'bg-chart-2 text-white'
            : 'bg-muted hover:bg-accent'}"
        aria-label={`Round ${p.rtt}: window ${p.cwnd}${p.loss ? `, loss detected by ${p.loss === 'timeout' ? 'timeout' : 'duplicate ACKs'}` : ''}`}
        onclick={() => cycle(p.rtt)}
        onmouseenter={() => (hover = p.rtt)}
        onfocus={() => (hover = p.rtt)}
        onmouseleave={() => (hover = null)}
        onblur={() => (hover = null)}>{p.loss === 'timeout' ? 'T' : p.loss === 'dupack' ? 'D' : ''}</button
      >
    {/each}
  </div>

  <p class="mt-3 min-h-10 text-sm" role="status">
    {#if focus}
      Round {focus.rtt}: cwnd = <span class="font-mono font-medium">{focus.cwnd}</span>, threshold = <span class="font-mono font-medium">{focus.ssthresh}</span>, in
      <span class="font-medium">{focus.phase}</span>.
      {#if focus.loss}
        A loss is detected by {focus.loss === 'timeout' ? 'a timeout' : 'three duplicate ACKs'}: the threshold becomes {Math.max(2, Math.floor(focus.cwnd / 2))} and
        the window {variant === 'reno' && focus.loss === 'dupack' ? 'drops to the new threshold (fast recovery)' : 'restarts from 1 (slow start)'}.
      {/if}
    {:else}
      Point at a round for details. The window doubles each round in slow start until it reaches the threshold, then grows by one segment per round.
    {/if}
  </p>

  <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-primary h-0.5 w-4"></span>congestion window</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-4 h-0.5 w-4"></span>slow-start threshold</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-2 size-2.5 rounded-xs"></span>D: three duplicate ACKs</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-5 size-2.5 rounded-xs"></span>T: timeout</span>
  </div>
</VizCard>
