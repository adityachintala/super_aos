<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { Input } from '../starwind-svelte/input';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { schedule, type DiskAlgo, type Direction } from '../../lib/sim/disk';

  const MAX = 199;
  const ALGOS: { id: DiskAlgo; name: string; rule: string }[] = [
    { id: 'fcfs', name: 'FCFS', rule: 'serve requests in the order they arrived' },
    { id: 'sstf', name: 'SSTF', rule: 'always serve the request closest to the head' },
    { id: 'scan', name: 'SCAN', rule: 'sweep to the end of the disk serving requests, then reverse' },
    { id: 'cscan', name: 'C-SCAN', rule: 'sweep to the end, jump back to the other end without serving, sweep again' },
    { id: 'look', name: 'LOOK', rule: 'like SCAN, but reverse at the last request instead of the edge' },
    { id: 'clook', name: 'C-LOOK', rule: 'like C-SCAN, but only travel as far as the last request each way' },
  ];

  let queueText = $state('98, 183, 37, 122, 14, 124, 65, 67');
  let head = $state(53);
  let algo = $state<DiskAlgo>('fcfs');
  let dir = $state<Direction>('up');
  let shown = $state(1);

  const queue = $derived(
    queueText
      .split(/[\s,]+/)
      .filter((t) => t !== '')
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= MAX)
      .slice(0, 14),
  );
  const run = $derived(schedule(queue, head, algo, dir, MAX));
  const directional = $derived(algo !== 'fcfs' && algo !== 'sstf');
  const rule = $derived(ALGOS.find((a) => a.id === algo)!.rule);
  const steps = $derived(run.path.length);
  const at = $derived(Math.min(shown, steps));
  const moved = $derived(run.path.slice(0, at).reduce((sum, c, i, p) => (i === 0 ? 0 : sum + Math.abs(c - p[i - 1])), 0));
  const compare = $derived(ALGOS.map((a) => ({ ...a, total: schedule(queue, head, a.id, dir, MAX).total })));
  const worst = $derived(Math.max(1, ...compare.map((c) => c.total)));

  const W = 600;
  const ROW = 22;
  const H = $derived(40 + (steps - 1) * ROW + 12);
  const x = (c: number) => 12 + (c / MAX) * (W - 24);
  const y = (i: number) => 40 + i * ROW;
  const isRequest = (c: number, i: number) => i > 0 && queue.includes(c);

  const reset = () => (shown = 1);
</script>

<VizCard kind="Simulator" title="Moving the disk head">
  <div class="grid items-end gap-4 sm:grid-cols-[1fr_9rem_9rem]">
    <label class="grid gap-1.5 text-sm font-medium">
      Request queue (cylinders 0 to {MAX})
      <Input size="sm" class="font-mono" bind:value={queueText} oninput={reset} />
    </label>
    <label class="grid gap-1.5 text-sm font-medium">
      Algorithm
      <NativeSelect size="sm" class="w-full" bind:value={algo} onchange={reset}>
        {#each ALGOS as a}<NativeSelectOption value={a.id}>{a.name}</NativeSelectOption>{/each}
      </NativeSelect>
    </label>
    <label class="grid gap-1.5 text-sm font-medium">
      First direction
      <NativeSelect size="sm" class="w-full" bind:value={dir} onchange={reset} disabled={!directional}>
        <NativeSelectOption value="up">Towards {MAX}</NativeSelectOption>
        <NativeSelectOption value="down">Towards 0</NativeSelectOption>
      </NativeSelect>
    </label>
  </div>
  <div class="mt-4 max-w-xs">
    <SliderField label="Head starts at cylinder" bind:value={head} min={0} max={MAX} onchange={reset} />
  </div>
  <p class="text-muted-foreground mt-3 text-sm"><span class="text-foreground font-medium">Rule:</span> {rule}.</p>

  <div class="mt-4 flex flex-wrap items-center gap-2">
    <Button variant="primary" size="sm" disabled={at >= steps} onclick={() => (shown = at + 1)}>
      {at >= steps ? 'All requests served' : `Move to ${run.path[at]}`}
    </Button>
    <Button variant="outline" size="sm" disabled={at >= steps} onclick={() => (shown = steps)}>Run all</Button>
    <Button variant="ghost" size="sm" disabled={at <= 1} onclick={reset}>Reset</Button>
    <span class="ml-auto text-sm">Head movement so far: <span class="font-mono font-medium tabular-nums">{moved}</span> cylinders</span>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="mt-3 w-full" role="img" aria-label={`Head path: ${run.path.join(' to ')}. Total movement ${run.total} cylinders.`}>
    <line x1={x(0)} y1="24" x2={x(MAX)} y2="24" stroke="var(--border)" />
    {#each [0, 50, 100, 150, MAX] as tick}
      <line x1={x(tick)} y1="20" x2={x(tick)} y2="28" stroke="var(--border)" />
      <text x={x(tick)} y="12" fill="var(--muted-foreground)" font-size="11" text-anchor="middle">{tick}</text>
    {/each}
    {#each queue as c}
      <line x1={x(c)} y1="24" x2={x(c)} y2={H - 4} stroke="var(--border)" stroke-dasharray="2 4" />
    {/each}
    {#each run.path.slice(0, at) as c, i}
      {#if i > 0}
        {@const jump = (algo === 'cscan' || algo === 'clook') && (dir === 'up' ? c < run.path[i - 1] : c > run.path[i - 1])}
        <line
          x1={x(run.path[i - 1])}
          y1={y(i - 1)}
          x2={x(c)}
          y2={y(i)}
          stroke={jump ? 'var(--muted-foreground)' : 'var(--primary)'}
          stroke-width="2"
          stroke-dasharray={jump ? '5 4' : undefined}
        />
      {/if}
    {/each}
    {#each run.path.slice(0, at) as c, i}
      <circle cx={x(c)} cy={y(i)} r={isRequest(c, i) || i === 0 ? 5 : 3.5} fill={i === 0 ? 'var(--foreground)' : isRequest(c, i) ? 'var(--primary)' : 'var(--muted-foreground)'} stroke="var(--card)" stroke-width="1.5" />
      <text x={x(c) + (c > MAX - 20 ? -9 : 9)} y={y(i) + 4} fill="var(--foreground)" font-size="11" text-anchor={c > MAX - 20 ? 'end' : 'start'}>{c}</text>
    {/each}
  </svg>
  <p class="text-muted-foreground text-sm">
    Time runs downwards. The black dot is the starting position, violet dots are served requests, grey dots are trips to the edge of the disk, and
    a dashed line is a return jump that serves nothing.
  </p>

  <div class="mt-4 border-t pt-5">
    <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">Total head movement for this queue</p>
    <div class="grid gap-1.5">
      {#each compare as c}
        <div class="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 text-sm">
          <span class={c.id === algo ? 'font-medium' : 'text-muted-foreground'}>{c.name}</span>
          <span class="bg-muted h-2.5 overflow-hidden rounded-full"
            ><span class="block h-full rounded-full {c.id === algo ? 'bg-primary' : 'bg-foreground/40'}" style:width={`${(c.total / worst) * 100}%`}></span></span
          >
          <span class="text-right font-mono tabular-nums">{c.total}</span>
        </div>
      {/each}
    </div>
  </div>
</VizCard>
