<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { schedule, type Proc } from '../../lib/sim/sched';

  const BURSTS = [6, 3, 1, 7];
  const procs: Proc[] = BURSTS.map((burst, i) => ({ id: `P${i + 1}`, arrival: 0, burst, priority: 0 }));
  const total = BURSTS.reduce((a, b) => a + b, 0);

  let quantum = $state(3);
  let tenths = $state(2); // context-switch cost, in tenths of a time unit

  const cost = $derived(tenths / 10);
  const byQ = Array.from({ length: 8 }, (_, i) => i + 1).map((q) => ({ q, r: schedule(procs, 'rr', q) }));
  const here = $derived(byQ[quantum - 1].r);
  const top = Math.max(...byQ.map((b) => b.r.avgTurnaround));
  const overhead = $derived((here.contextSwitches * cost) / (total + here.contextSwitches * cost));
</script>

<VizCard kind="Simulator" title="Choosing the time quantum">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Time quantum" bind:value={quantum} min={1} max={8} />
    <SliderField label="Cost of one context switch (tenths of a time unit)" bind:value={tenths} min={0} max={10} />
  </div>

  <p class="text-muted-foreground mt-4 mb-1.5 text-xs font-medium tracking-wider uppercase">Average turnaround time for each quantum (bursts {BURSTS.join(', ')})</p>
  <div class="flex h-28 items-end gap-1.5" role="img" aria-label={`Average turnaround time for quanta 1 to 8: ${byQ.map((b) => b.r.avgTurnaround.toFixed(2)).join(', ')}`}>
    {#each byQ as b}
      <button type="button" class="flex h-full flex-1 flex-col items-center justify-end gap-1 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-outline/50" aria-label={`Quantum ${b.q}`} aria-pressed={b.q === quantum} onclick={() => (quantum = b.q)}>
        <span class="font-mono text-xs tabular-nums">{b.r.avgTurnaround.toFixed(2)}</span>
        <span class="w-full rounded-t-sm {b.q === quantum ? 'bg-primary' : 'bg-foreground/40'}" style:height={`${(b.r.avgTurnaround / top) * 72}%`}></span>
      </button>
    {/each}
  </div>
  <div class="text-muted-foreground mt-1 flex gap-1.5 text-center font-mono text-xs">{#each byQ as b}<span class="flex-1">q={b.q}</span>{/each}</div>

  <dl class="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
    <div><dt class="text-muted-foreground">Context switches</dt><dd class="font-mono">{here.contextSwitches}</dd></div>
    <div><dt class="text-muted-foreground">Longest wait before first run</dt><dd class="font-mono">{Math.max(...here.stats.map((s) => s.response))} time units</dd></div>
    <div><dt class="text-muted-foreground">CPU time lost to switching</dt><dd class="font-mono"><span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-medium">{(overhead * 100).toFixed(1)}%</span></dd></div>
  </dl>
  <p class="text-muted-foreground mt-3 text-sm">
    A small quantum gives every process a quick first turn but spends more of the CPU on switching. A large one behaves like FCFS. Notice that
    turnaround does not fall steadily as the quantum grows: it improves when most processes can finish their burst within a single quantum.
  </p>
</VizCard>
