<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { onWorkerFailure, type Task } from '../../lib/sim/mapreduce';

  const START: Task[] = [
    { id: 'map 1', kind: 'map', state: 'completed', worker: 'A' },
    { id: 'map 2', kind: 'map', state: 'completed', worker: 'B' },
    { id: 'map 3', kind: 'map', state: 'in-progress', worker: 'A' },
    { id: 'map 4', kind: 'map', state: 'completed', worker: 'C' },
    { id: 'reduce 1', kind: 'reduce', state: 'completed', worker: 'A' },
    { id: 'reduce 2', kind: 'reduce', state: 'in-progress', worker: 'B' },
    { id: 'reduce 3', kind: 'reduce', state: 'in-progress', worker: 'A' },
  ];
  const WORKERS = ['A', 'B', 'C'];

  let tasks = $state<Task[]>(START);
  let failed = $state<string | null>(null);

  const before = $derived(failed ? START : tasks);
  function kill(w: string) {
    failed = w;
    tasks = onWorkerFailure(START, w);
  }
  function reset() {
    failed = null;
    tasks = START;
  }
  function reason(t: Task, i: number): string {
    const was = START[i];
    if (was.worker !== failed) return 'Not on the failed worker: unaffected.';
    if (t.state === was.state) return 'Kept. Reduce output is already in the global file system, so nothing is lost.';
    if (was.kind === 'map' && was.state === 'completed') return 'Redone, although it had finished: its output was on the failed machine’s local disk and can no longer be read.';
    return 'Was running on the failed worker, so it is rescheduled.';
  }
</script>

<VizCard kind="Try it" title="A worker dies: which tasks run again?">
  <div class="flex flex-wrap items-center gap-2">
    <span class="text-sm font-medium">The master stops hearing from worker</span>
    {#each WORKERS as w}
      <Button variant={failed === w ? 'primary' : 'outline'} size="sm" aria-pressed={failed === w} onclick={() => kill(w)}>{w}</Button>
    {/each}
    <Button variant="ghost" size="sm" disabled={!failed} onclick={reset}>Reset</Button>
  </div>

  <div class="mt-4 overflow-hidden rounded-md border text-sm">
    <div class="bg-muted grid grid-cols-[5.5rem_4rem_7rem_1fr] gap-2 px-3 py-1.5 text-xs font-medium">
      <span>Task</span><span>Worker</span><span>State</span><span>{failed ? 'What the master does' : 'Before any failure'}</span>
    </div>
    {#each tasks as t, i}
      {@const changed = failed && t.state !== before[i].state}
      <div class="grid grid-cols-[5.5rem_4rem_7rem_1fr] items-center gap-2 border-t px-3 py-1.5 {changed ? 'bg-warning/10' : ''}">
        <span class="font-mono">{t.id}</span>
        <span class="font-mono">{t.worker ?? '—'}</span>
        <span>
          <span
            class="rounded-full px-2 py-0.5 text-xs {t.state === 'completed'
              ? 'bg-success text-success-foreground'
              : t.state === 'in-progress'
                ? 'bg-info text-info-foreground'
                : 'bg-warning text-warning-foreground'}">{t.state === 'idle' ? 'idle: reschedule' : t.state}</span
          >
        </span>
        <span class="text-muted-foreground text-xs">{failed ? reason(t, i) : `${START[i].kind} task`}</span>
      </div>
    {/each}
  </div>

  <p class="mt-3 text-sm" role="status">
    {#if failed}
      Worker {failed} failed. {tasks.filter((t, i) => t.state !== START[i].state).length} task(s) were reset to idle and will be given to other workers.
      Reduce workers that had not yet read the lost map output are told to read it from the new location.
    {:else}
      Pick a worker to fail. Before you do, predict which of its tasks must be executed again.
    {/if}
  </p>
</VizCard>
