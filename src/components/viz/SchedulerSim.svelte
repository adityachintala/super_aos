<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { Input } from '../starwind-svelte/input';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { schedule, type Algo, type Proc } from '../../lib/sim/sched';

  const ALGOS: { id: Algo; name: string; rule: string }[] = [
    { id: 'fcfs', name: 'FCFS', rule: 'run processes in the order they arrive, each to completion' },
    { id: 'sjf', name: 'SJF (non-preemptive)', rule: 'when the CPU is free, pick the waiting process with the shortest burst' },
    { id: 'srtf', name: 'SJF (preemptive, SRTF)', rule: 'always run the process with the shortest remaining time, preempting if a shorter one arrives' },
    { id: 'prio', name: 'Priority (non-preemptive)', rule: 'when the CPU is free, pick the waiting process with the highest priority (lowest number)' },
    { id: 'prio-p', name: 'Priority (preemptive)', rule: 'always run the highest-priority process, preempting if a more urgent one arrives' },
    { id: 'rr', name: 'Round robin', rule: 'each process runs for at most one time quantum, then goes to the back of the queue' },
    { id: 'mlfq', name: 'Multilevel feedback queue', rule: 'three queues (quantum 8, quantum 16, FCFS); a process that uses its whole quantum is demoted' },
  ];
  interface Preset {
    name: string;
    rows: [number, number, number][]; // arrival, burst, priority
    algo: Algo;
    quantum?: number;
  }
  const PRESETS: Preset[] = [
    { name: 'Convoy effect', rows: [[0, 24, 1], [0, 3, 1], [0, 3, 1]], algo: 'fcfs' },
    { name: 'SJF with arrivals', rows: [[0, 7, 1], [2, 4, 1], [4, 1, 1], [5, 4, 1]], algo: 'sjf' },
    { name: 'Priorities', rows: [[0, 10, 3], [0, 1, 1], [0, 2, 4], [0, 1, 5], [0, 5, 2]], algo: 'prio' },
    { name: 'Round robin, q = 20', rows: [[0, 53, 1], [0, 17, 1], [0, 68, 1], [0, 24, 1]], algo: 'rr', quantum: 20 },
    { name: 'Feedback queues', rows: [[0, 30, 1], [4, 5, 1], [10, 3, 1], [12, 20, 1]], algo: 'mlfq' },
  ];
  const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];

  let rows = $state<{ arrival: string; burst: string; priority: string }[]>(PRESETS[1].rows.map(([a, b, p]) => ({ arrival: String(a), burst: String(b), priority: String(p) })));
  let algo = $state<Algo>('sjf');
  let quantum = $state(4);

  const num = (s: string, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number(s)) || 0));
  const procs = $derived<Proc[]>(rows.map((r, i) => ({ id: `P${i + 1}`, arrival: num(r.arrival, 0, 200), burst: num(r.burst, 1, 99), priority: num(r.priority, 0, 99) })));
  const result = $derived(schedule(procs, algo, quantum));
  const end = $derived(result.gantt.length ? result.gantt[result.gantt.length - 1].end : 1);
  const rule = $derived(ALGOS.find((a) => a.id === algo)!.rule);
  const compare = $derived(ALGOS.map((a) => ({ ...a, r: schedule(procs, a.id, quantum) })));
  const worst = $derived(Math.max(1, ...compare.map((c) => c.r.avgWaiting)));
  const usesPriority = $derived(algo === 'prio' || algo === 'prio-p');
  const colorOf = (id: string) => COLORS[(Number(id.slice(1)) - 1) % COLORS.length];

  function load(p: Preset) {
    rows = p.rows.map(([a, b, pr]) => ({ arrival: String(a), burst: String(b), priority: String(pr) }));
    algo = p.algo;
    if (p.quantum) quantum = p.quantum;
  }
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));
</script>

<VizCard kind="Simulator" title="CPU scheduling: build a workload, pick an algorithm">
  <div class="flex flex-wrap items-center gap-1.5">
    <span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Examples</span>
    {#each PRESETS as p}
      <Button variant="outline" size="sm" class="h-7 px-2.5 text-xs" onclick={() => load(p)}>{p.name}</Button>
    {/each}
  </div>

  <div class="mt-4 grid gap-5 md:grid-cols-[minmax(0,19rem)_1fr]">
    <div>
      <div class="text-muted-foreground grid grid-cols-[2.5rem_1fr_1fr_1fr_1.75rem] gap-1.5 text-xs font-medium">
        <span></span><span>Arrival</span><span>Burst</span><span class={usesPriority ? 'text-foreground' : ''}>Priority</span><span></span>
      </div>
      {#each rows as r, i}
        <div class="mt-1.5 grid grid-cols-[2.5rem_1fr_1fr_1fr_1.75rem] items-center gap-1.5">
          <span class="rounded-sm py-1 text-center font-mono text-xs font-medium text-white" style:background={COLORS[i % COLORS.length]}>P{i + 1}</span>
          <Input size="sm" class="h-8 px-2 font-mono" inputmode="numeric" aria-label={`P${i + 1} arrival time`} bind:value={r.arrival} />
          <Input size="sm" class="h-8 px-2 font-mono" inputmode="numeric" aria-label={`P${i + 1} burst time`} bind:value={r.burst} />
          <Input size="sm" class="h-8 px-2 font-mono" inputmode="numeric" aria-label={`P${i + 1} priority`} bind:value={r.priority} />
          <button type="button" class="text-muted-foreground hover:text-foreground rounded-sm text-sm outline-none focus-visible:ring-3 focus-visible:ring-outline/50 disabled:opacity-30" disabled={rows.length <= 1} aria-label={`Remove P${i + 1}`} onclick={() => (rows = rows.filter((_, k) => k !== i))}>✕</button>
        </div>
      {/each}
      <Button variant="ghost" size="sm" class="mt-2 h-7 px-2.5 text-xs" disabled={rows.length >= 6} onclick={() => (rows = [...rows, { arrival: '0', burst: '5', priority: '1' }])}>Add a process</Button>
    </div>

    <div class="grid content-start gap-4">
      <label class="grid gap-1.5 text-sm font-medium">
        Algorithm
        <NativeSelect size="sm" class="w-full" bind:value={algo}>
          {#each ALGOS as a}<NativeSelectOption value={a.id}>{a.name}</NativeSelectOption>{/each}
        </NativeSelect>
      </label>
      {#if algo === 'rr'}<SliderField label="Time quantum" bind:value={quantum} min={1} max={30} />{/if}
      <p class="text-muted-foreground text-sm"><span class="text-foreground font-medium">Rule:</span> {rule}.</p>
    </div>
  </div>

  <p class="text-muted-foreground mt-5 mb-1.5 text-xs font-medium tracking-wider uppercase">Gantt chart</p>
  <div class="flex h-11 overflow-hidden rounded-md border" role="img" aria-label={`Gantt chart: ${result.gantt.map((s) => `${s.id ?? 'idle'} from ${s.start} to ${s.end}`).join(', ')}`}>
    {#each result.gantt as s}
      <div
        class="grid min-w-0 place-items-center overflow-hidden border-r font-mono text-xs font-medium last:border-r-0 {s.id === null ? 'hatch text-muted-foreground' : 'text-white'}"
        style:flex-grow={s.end - s.start}
        style:flex-basis="0"
        style:background={s.id === null ? undefined : colorOf(s.id)}
        title={`${s.id ?? 'idle'}: ${s.start} to ${s.end}${s.level !== undefined ? ` (queue ${s.level})` : ''}`}
      >
        {s.id ?? ''}{#if s.level !== undefined && s.id}<span class="text-[0.6rem] opacity-80">Q{s.level}</span>{/if}
      </div>
    {/each}
  </div>
  <div class="relative mt-0.5 h-4 font-mono text-[0.65rem]">
    <span class="text-muted-foreground absolute left-0">0</span>
    {#each result.gantt as s}
      <span class="text-muted-foreground absolute -translate-x-1/2" style:left={`${(s.end / end) * 100}%`}>{s.end}</span>
    {/each}
  </div>

  <div class="mt-4 overflow-x-auto">
    <table class="w-full text-right font-mono text-sm" aria-label="Per-process results">
      <thead>
        <tr class="text-muted-foreground border-b font-sans text-xs">
          <th class="py-1 text-left font-medium">Process</th><th class="font-medium">Completion</th><th class="font-medium">Turnaround</th><th class="font-medium">Waiting</th><th class="font-medium">Response</th>
        </tr>
      </thead>
      <tbody>
        {#each result.stats as s}
          <tr class="border-b"><td class="py-1 text-left">{s.id}</td><td>{s.completion}</td><td>{s.turnaround}</td><td>{s.waiting}</td><td>{s.response}</td></tr>
        {/each}
        <tr class="font-medium">
          <td class="py-1 text-left font-sans">Average</td><td></td><td>{fmt(result.avgTurnaround)}</td>
          <td><span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">{fmt(result.avgWaiting)}</span></td><td>{fmt(result.avgResponse)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="text-muted-foreground mt-2 text-xs">
    Turnaround = completion − arrival. Waiting = turnaround − burst. Response = first time on the CPU − arrival. Context switches: {result.contextSwitches}.
  </p>

  <div class="mt-4 border-t pt-5">
    <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">Average waiting time, every algorithm on this workload</p>
    <div class="grid gap-1.5">
      {#each compare as c}
        <button type="button" class="grid grid-cols-[11.5rem_1fr_3rem] items-center gap-2 rounded-sm text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-outline/50" onclick={() => (algo = c.id)} aria-pressed={c.id === algo}>
          <span class={c.id === algo ? 'font-medium' : 'text-muted-foreground'}>{c.name}</span>
          <span class="bg-muted h-2.5 overflow-hidden rounded-full"><span class="block h-full rounded-full {c.id === algo ? 'bg-primary' : 'bg-foreground/40'}" style:width={`${(c.r.avgWaiting / worst) * 100}%`}></span></span>
          <span class="text-right font-mono tabular-nums">{fmt(c.r.avgWaiting)}</span>
        </button>
      {/each}
    </div>
  </div>
</VizCard>
