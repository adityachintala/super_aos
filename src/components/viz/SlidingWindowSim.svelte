<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { slidingWindow, type Arq, type Outcome } from '../../lib/sim/net';

  const FRAMES = 12;
  let size = $state(4);
  let lost = $state<number[]>([2]);

  const runs = $derived(
    (['gbn', 'sr'] as Arq[]).map((p) => ({ id: p, name: p === 'gbn' ? 'Go-Back-N' : 'Selective Repeat', ...slidingWindow(p, FRAMES, size, lost) })),
  );
  const toggle = (f: number) => (lost = lost.includes(f) ? lost.filter((x) => x !== f) : [...lost, f].sort((a, b) => a - b));

  const TONE: Record<Outcome, string> = {
    delivered: 'bg-chart-3 text-white',
    buffered: 'bg-chart-2 text-white',
    discarded: 'bg-muted text-muted-foreground line-through',
    lost: 'border-error bg-error/15 border',
  };
  const WORD: Record<Outcome, string> = { delivered: 'delivered in order', buffered: 'received out of order and buffered', discarded: 'received but thrown away', lost: 'lost on the way' };
</script>

<VizCard kind="Simulator" title="One lost frame, two ways to recover">
  <div class="max-w-xs">
    <SliderField label="Window size" bind:value={size} min={1} max={8} />
  </div>

  <p class="mt-4 text-sm font-medium">Click the frames that should be lost the first time they are sent</p>
  <div class="mt-2 flex flex-wrap gap-1">
    {#each Array(FRAMES) as _, f}
      <button
        type="button"
        class="grid size-8 place-items-center rounded-sm border font-mono text-sm outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {lost.includes(f)
          ? 'border-error bg-error/15 font-medium'
          : 'hover:bg-muted'}"
        aria-pressed={lost.includes(f)}
        aria-label={`Frame ${f}${lost.includes(f) ? ', will be lost' : ''}`}
        onclick={() => toggle(f)}>{f}</button
      >
    {/each}
  </div>

  <div class="mt-5 grid gap-5">
    {#each runs as r}
      <div>
        <p class="text-sm">
          <span class="font-medium">{r.name}</span>
          <span class="text-muted-foreground">
            · {r.transmissions} transmissions for {FRAMES} frames ·
            <span class="text-foreground font-medium">{r.wasted} extra</span>
          </span>
        </p>
        <div class="mt-1.5 flex flex-wrap items-center gap-1" role="img" aria-label={`${r.name}: ${r.log.map((t) => `frame ${t.frame} ${WORD[t.outcome]}`).join(', ')}`}>
          {#each r.log as t, i}
            {#if i > 0 && t.round !== r.log[i - 1].round}<span class="text-muted-foreground px-0.5 text-xs">|</span>{/if}
            <span class="grid size-7 place-items-center rounded-sm font-mono text-xs {TONE[t.outcome]} {t.retransmission ? 'ring-foreground ring-2' : ''}" title={`Frame ${t.frame}: ${WORD[t.outcome]}${t.retransmission ? ' (retransmission)' : ''}`}>{t.frame}</span>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-chart-3 size-2.5 rounded-xs"></span>delivered</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-2 size-2.5 rounded-xs"></span>buffered by receiver</span>
    <span class="flex items-center gap-1.5"><span class="bg-muted size-2.5 rounded-xs border"></span>discarded by receiver</span>
    <span class="flex items-center gap-1.5"><span class="border-error bg-error/15 size-2.5 rounded-xs border"></span>lost</span>
    <span class="flex items-center gap-1.5"><span class="ring-foreground size-2.5 rounded-xs ring-2"></span>retransmission</span>
  </div>
  <p class="text-muted-foreground mt-2 text-sm">
    Bars separate the windows sent between timeouts. Go-Back-N needs a receiver buffer of one frame; Selective Repeat needs one as large as the
    window. Widen the window and watch the gap between them grow.
  </p>
</VizCard>
