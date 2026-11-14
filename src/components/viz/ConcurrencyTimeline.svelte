<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { timeline } from '../../lib/sim/threads';

  const TASKS = 4;
  const WORK = 3;
  let cores = $state(1);
  const t = $derived(timeline(TASKS, WORK, cores));
  const CLS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4'];
</script>

<VizCard kind="Try it" title="Concurrency without parallelism, and with it">
  <div class="max-w-xs">
    <SliderField label="Processing cores" bind:value={cores} min={1} max={4} />
  </div>

  <div class="mt-4 grid gap-1.5" role="img" aria-label={`Four threads on ${cores} core${cores === 1 ? '' : 's'} finish after ${t.finish} time units`}>
    {#each t.rows as row, c}
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground w-14 shrink-0 text-xs">core {c + 1}</span>
        <div class="grid flex-1 gap-0.5" style:grid-template-columns="repeat(12, minmax(0, 1fr))">
          {#each Array(12) as _, i}
            {@const task = row[i]}
            <span class="grid h-8 place-items-center rounded-xs font-mono text-xs {task === null || task === undefined ? 'border border-dashed' : `${CLS[task]} text-white`}">{task === null || task === undefined ? '' : `T${task + 1}`}</span>
          {/each}
        </div>
      </div>
    {/each}
    <div class="flex items-center gap-2">
      <span class="w-14 shrink-0"></span>
      <div class="text-muted-foreground flex flex-1 justify-between font-mono text-xs"><span>0</span><span>time →</span><span>12</span></div>
    </div>
  </div>

  <p class="mt-3 text-sm" role="status">
    Four threads, each needing {WORK} units of CPU. On {cores} core{cores === 1 ? '' : 's'} all the work is done after
    <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium">{t.finish}</span> time units.
    {#if cores === 1}
      All four make progress by taking turns: this is <span class="font-medium">concurrency</span>, but never are two running at the same instant.
    {:else}
      Up to {cores} threads run at the very same instant: this is <span class="font-medium">parallelism</span>.
    {/if}
  </p>
</VizCard>
