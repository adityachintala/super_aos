<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { inCritical, SEM_PRESETS, semDeadlocked, semStep, semSystem, type Op, type SemSystem } from '../../lib/sim/sync';

  let { start = 'mutex' }: { start?: string } = $props();

  let presetId = $state(start);
  const preset = $derived(SEM_PRESETS.find((p) => p.id === presetId)!);
  let sys = $state<SemSystem>(semSystem(SEM_PRESETS.find((p) => p.id === start)!.sems, SEM_PRESETS.find((p) => p.id === start)!.programs));

  const dead = $derived(semDeadlocked(sys));
  const critical = $derived(inCritical(sys));

  function load() {
    sys = semSystem(preset.sems, preset.programs);
  }
  const step = (name: string) => (sys = semStep(sys, name));
  /** Run one operation of every runnable process, in order: the quickest way into trouble. */
  function round() {
    for (const p of sys.procs) sys = semStep(sys, p.name);
  }
  const text = (op: Op) => (op.kind === 'do' ? op.text : `${op.kind}(${op.sem})`);
</script>

<VizCard kind="Simulator" title="A semaphore playground">
  <div class="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto]">
    <label class="grid gap-1.5 text-sm font-medium">
      Scenario
      <NativeSelect size="sm" class="w-full" bind:value={presetId} onchange={load}>
        {#each SEM_PRESETS as p}<NativeSelectOption value={p.id}>{p.name}</NativeSelectOption>{/each}
      </NativeSelect>
    </label>
    <Button variant="outline" size="sm" disabled={dead} onclick={round}>Step every process once</Button>
    <Button variant="ghost" size="sm" onclick={load}>Reset</Button>
  </div>
  <p class="text-muted-foreground mt-3 text-sm">{preset.about}</p>

  <div class="mt-4 flex flex-wrap gap-2">
    {#each Object.entries(sys.sems) as [name, value]}
      <div class="rounded-md border px-2.5 py-1.5 text-sm">
        <span class="font-mono">{name}</span> =
        <span class="font-mono font-medium {value === 0 ? 'text-muted-foreground' : ''}">{value}</span>
        {#if sys.queues[name].length}<span class="text-muted-foreground text-xs"> · waiting: {sys.queues[name].join(', ')}</span>{/if}
      </div>
    {/each}
  </div>

  <div class="mt-3 grid gap-3 sm:grid-cols-2 {sys.procs.length > 2 ? 'lg:grid-cols-4' : ''}">
    {#each sys.procs as p}
      {@const isCritical = critical.includes(p.name)}
      <div class="rounded-md border p-2 {p.blockedOn ? 'border-error bg-error/10' : isCritical ? 'border-success bg-success/10' : ''}">
        <p class="mb-1.5 flex items-center justify-between text-sm font-medium">
          {p.name}
          <span class="text-muted-foreground text-xs font-normal">{p.blockedOn ? `blocked on ${p.blockedOn}` : `laps: ${p.laps}`}</span>
        </p>
        {#each p.ops as op, i}
          <p class="rounded-sm px-1.5 py-0.5 font-mono text-xs {i === p.pc ? (p.blockedOn ? 'bg-error text-error-foreground' : 'bg-primary text-primary-foreground font-medium') : ''}">{text(op)}</p>
        {/each}
        <Button variant="outline" size="sm" class="mt-2 h-7 w-full px-2 text-xs" disabled={!!p.blockedOn} onclick={() => step(p.name)}>Step {p.name}</Button>
      </div>
    {/each}
  </div>

  <p class="mt-3 min-h-10 text-sm" role="status">
    {#if dead}
      <span class="border-error bg-error/10 rounded-sm border px-1.5 py-0.5 font-medium">Deadlock</span> Every process is blocked, each waiting for a signal that only another blocked process could send.
    {:else if critical.length > 1}
      <span class="border-error bg-error/10 rounded-sm border px-1.5 py-0.5 font-medium">Two in the critical section</span> {critical.join(' and ')}.
    {:else}
      {sys.log || 'The highlighted line is the operation each process will execute next. You are the scheduler: pick who runs.'}
    {/if}
  </p>
</VizCard>
