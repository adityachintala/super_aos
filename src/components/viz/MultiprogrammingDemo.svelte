<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { runJobs } from '../../lib/sim/foundations';

  let count = $state(3);
  let cpu = $state(2);
  let io = $state(6);
  let multi = $state(false);

  const jobs = $derived(Array.from({ length: count }, () => [cpu, io, cpu]));
  const one = $derived(runJobs(jobs, false));
  const many = $derived(runJobs(jobs, true));
  const r = $derived(multi ? many : one);
  const span = $derived(one.total);
  const pct = (x: number) => `${(x / span) * 100}%`;
  const STYLE = { cpu: 'bg-chart-1 text-white', io: 'bg-chart-4 text-white', ready: 'hatch border' } as const;
  const LABEL = { cpu: 'CPU', io: 'I/O', ready: '' } as const;

  // What the CPU itself is doing at each moment.
  const cpuRow = $derived(r.rows.flatMap((row) => row.filter((s) => s.kind === 'cpu')).sort((a, b) => a.start - b.start));
</script>

<VizCard kind="Simulator" title="One job at a time, or several in memory">
  <div class="grid gap-5 sm:grid-cols-3">
    <SliderField label="Jobs in memory" bind:value={count} min={1} max={5} />
    <SliderField label="Each CPU burst" bind:value={cpu} min={1} max={8} suffix=" ms" />
    <SliderField label="Each I/O wait" bind:value={io} min={1} max={12} suffix=" ms" />
  </div>
  <p class="text-muted-foreground mt-2 text-sm">Every job computes, waits for an I/O operation, then computes again.</p>

  <div class="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Mode">
    <Button variant={!multi ? 'primary' : 'outline'} size="sm" aria-pressed={!multi} onclick={() => (multi = false)}>Uniprogramming</Button>
    <Button variant={multi ? 'primary' : 'outline'} size="sm" aria-pressed={multi} onclick={() => (multi = true)}>Multiprogramming</Button>
  </div>

  <div class="mt-4 grid gap-2" role="img" aria-label={`${multi ? 'Multiprogramming' : 'Uniprogramming'} timeline for ${count} jobs. Total time ${r.total} milliseconds, CPU utilisation ${(r.utilisation * 100).toFixed(0)} percent.`}>
    {#each r.rows as row, j}
      <div class="grid grid-cols-[3.5rem_1fr] items-center gap-2 text-xs">
        <span class="font-medium">Job {j + 1}</span>
        <div class="bg-muted relative h-7 rounded-sm">
          {#each row as s}
            <div class="absolute inset-y-0 grid place-items-center overflow-hidden rounded-sm {STYLE[s.kind]}" style:left={pct(s.start)} style:width={pct(s.end - s.start)}>{LABEL[s.kind]}</div>
          {/each}
        </div>
      </div>
    {/each}
    <div class="grid grid-cols-[3.5rem_1fr] items-center gap-2 border-t pt-2 text-xs">
      <span class="font-medium">CPU</span>
      <div class="bg-muted relative h-7 rounded-sm">
        {#each cpuRow as s}
          <div class="bg-chart-1 absolute inset-y-0 grid place-items-center overflow-hidden rounded-sm text-white" style:left={pct(s.start)} style:width={pct(s.end - s.start)}>J{s.job + 1}</div>
        {/each}
      </div>
    </div>
    <div class="grid grid-cols-[3.5rem_1fr] gap-2 text-xs">
      <span></span>
      <div class="text-muted-foreground flex justify-between font-mono"><span>0</span><span>{span} ms</span></div>
    </div>
  </div>
  <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-chart-1 size-2.5 rounded-xs"></span>computing</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-4 size-2.5 rounded-xs"></span>waiting for I/O</span>
    <span class="flex items-center gap-1.5"><span class="hatch size-2.5 rounded-xs border"></span>ready, waiting for the CPU</span>
    <span class="flex items-center gap-1.5"><span class="bg-muted size-2.5 rounded-xs border"></span>not started, finished, or CPU idle</span>
  </div>

  <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-4" role="status">
    <div><dt class="text-muted-foreground">All jobs done at</dt><dd class="font-mono text-lg tabular-nums">{r.total} ms</dd></div>
    <div><dt class="text-muted-foreground">CPU idle for</dt><dd class="font-mono text-lg tabular-nums">{r.total - r.cpuBusy} ms</dd></div>
    <div><dt class="text-muted-foreground">CPU utilisation</dt><dd class="font-mono text-lg tabular-nums">{(r.utilisation * 100).toFixed(0)}%</dd></div>
    <div><dt class="text-muted-foreground">Uni / multi</dt><dd class="font-mono text-lg tabular-nums">{(one.utilisation * 100).toFixed(0)}% / {(many.utilisation * 100).toFixed(0)}%</dd></div>
  </dl>
</VizCard>
