<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { realTime, rmBound, utilization, type RtPolicy } from '../../lib/sim/sched';

  const HORIZON = 200;
  let policy = $state<RtPolicy>('rm');
  let p1 = $state(50);
  let t1 = $state(25);
  let p2 = $state(80);
  let t2 = $state(35);

  const tasks = $derived([
    { name: 'P1', period: p1, burst: Math.min(t1, p1) },
    { name: 'P2', period: p2, burst: Math.min(t2, p2) },
  ]);
  const r = $derived(realTime(tasks, policy, HORIZON));
  const u = $derived(utilization(tasks));
  const bound = rmBound(2);
  const CLS = ['bg-chart-1', 'bg-chart-2'];

  /** Collapse the per-unit timeline into runs, for drawing. */
  const runs = $derived.by(() => {
    const out: { task: number | null; start: number; end: number }[] = [];
    r.timeline.forEach((task, t) => {
      const last = out[out.length - 1];
      if (last && last.task === task) last.end = t + 1;
      else out.push({ task, start: t, end: t + 1 });
    });
    return out;
  });
  const releases = (period: number) => Array.from({ length: Math.floor(HORIZON / period) + 1 }, (_, k) => k * period).filter((t) => t <= HORIZON);
</script>

<VizCard kind="Simulator" title="Two periodic tasks: will every deadline be met?">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Scheduling policy">
    <Button variant={policy === 'rm' ? 'primary' : 'outline'} size="sm" aria-pressed={policy === 'rm'} onclick={() => (policy = 'rm')}>Rate monotonic</Button>
    <Button variant={policy === 'edf' ? 'primary' : 'outline'} size="sm" aria-pressed={policy === 'edf'} onclick={() => (policy = 'edf')}>Earliest deadline first</Button>
  </div>

  <div class="mt-4 grid gap-5 sm:grid-cols-2">
    <SliderField label="P1 period (and deadline)" bind:value={p1} min={20} max={100} step={5} />
    <SliderField label="P1 CPU burst each period" bind:value={t1} min={5} max={60} step={5} />
    <SliderField label="P2 period (and deadline)" bind:value={p2} min={20} max={100} step={5} />
    <SliderField label="P2 CPU burst each period" bind:value={t2} min={5} max={60} step={5} />
  </div>

  <div class="mt-5 grid gap-1" role="img" aria-label={`Timeline over ${HORIZON} time units with ${r.misses.length} missed deadlines`}>
    {#each tasks as task, i}
      <div class="flex items-center gap-2">
        <span class="w-8 shrink-0 font-mono text-xs font-medium">{task.name}</span>
        <div class="relative h-8 flex-1 rounded-sm border">
          {#each runs.filter((x) => x.task === i) as run}
            <span class="{CLS[i]} absolute inset-y-0" style:left={`${(run.start / HORIZON) * 100}%`} style:width={`${((run.end - run.start) / HORIZON) * 100}%`}></span>
          {/each}
          {#each releases(task.period) as t}
            <span class="bg-foreground absolute inset-y-0 w-px" style:left={`${(t / HORIZON) * 100}%`}></span>
          {/each}
          {#each r.misses.filter((m) => m.task === i) as m}
            <span class="bg-error text-error-foreground absolute -top-1 grid size-4 -translate-x-1/2 place-items-center rounded-full text-[0.6rem] font-bold" style:left={`${(m.at / HORIZON) * 100}%`}>!</span>
          {/each}
        </div>
      </div>
    {/each}
    <div class="flex items-center gap-2">
      <span class="w-8 shrink-0"></span>
      <div class="text-muted-foreground flex flex-1 justify-between font-mono text-xs"><span>0</span><span>50</span><span>100</span><span>150</span><span>{HORIZON}</span></div>
    </div>
  </div>
  <p class="text-muted-foreground mt-1 text-xs">Thin vertical lines mark the start of each period, which is also the deadline of the previous one. A red mark is a missed deadline.</p>

  <dl class="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
    <div>
      <dt class="text-muted-foreground">CPU utilisation</dt>
      <dd class="font-mono">{tasks[0].burst}/{p1} + {tasks[1].burst}/{p2} = <span class="font-medium">{(u * 100).toFixed(0)}%</span></dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Guaranteed limit</dt>
      <dd class="font-mono">{policy === 'rm' ? `2(2^½ − 1) = ${(bound * 100).toFixed(0)}%` : '100%'}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Missed deadlines</dt>
      <dd><span class="rounded-sm border px-1.5 py-0.5 font-mono font-medium {r.misses.length ? 'border-error bg-error/10' : 'border-success bg-success/10'}">{r.misses.length}</span></dd>
    </div>
  </dl>
  <p class="mt-3 text-sm" role="status">
    {#if policy === 'rm'}
      Rate monotonic gives the task with the shorter period ({p1 <= p2 ? 'P1' : 'P2'}) a fixed higher priority.
      {#if u <= bound}Utilisation is within the bound, so every deadline is guaranteed to be met.
      {:else if r.misses.length === 0}Utilisation is above the bound, so there is no guarantee, but this particular task set happens to fit.
      {:else}Utilisation is above the bound and a deadline is missed. Switch to earliest deadline first with the same tasks.{/if}
    {:else}
      Earliest deadline first re-evaluates priorities whenever a task becomes runnable.
      {u <= 1 ? 'It can use the CPU right up to 100%, so every deadline is met.' : 'The tasks need more than 100% of the CPU, which no algorithm can provide.'}
    {/if}
  </p>
</VizCard>
