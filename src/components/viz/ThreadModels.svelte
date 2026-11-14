<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { threadOutcome, type Model } from '../../lib/sim/threads';

  const MODELS: { id: Model; name: string; text: string }[] = [
    { id: 'm1', name: 'Many-to-one', text: 'Many user-level threads are mapped to a single kernel thread. Thread management is done in user space, so it is fast, but only one thread can reach the kernel at a time.' },
    { id: '11', name: 'One-to-one', text: 'Each user-level thread maps to its own kernel thread. More concurrency, and a blocked thread does not stop the others, but creating a user thread means creating a kernel thread.' },
    { id: 'mn', name: 'Many-to-many', text: 'Many user-level threads are multiplexed onto a smaller or equal number of kernel threads. The number of kernel threads can be tuned to the application and the machine.' },
  ];

  let model = $state<Model>('mn');
  let user = $state(6);
  let kernel = $state(2);
  let cores = $state(4);
  let blocked = $state(0);

  const o = $derived(threadOutcome(model, { user, kernel, cores, blocked }));
  const info = $derived(MODELS.find((m) => m.id === model)!);
  const b = $derived(Math.min(blocked, user));

  // Which user threads are blocked / running, and which kernel thread carries each running one.
  const W = 600;
  const xs = (n: number, i: number) => ((i + 0.5) / n) * W;
  const kState = (i: number) => (i < Math.min(b, o.kernelThreads) ? 'blocked' : i - Math.min(b, o.kernelThreads) < o.parallel ? 'running' : 'idle');
  const uState = (i: number) => (i < b ? 'blocked' : i - b < o.parallel ? 'running' : 'ready');
  const fill = (s: string) => (s === 'running' ? 'var(--chart-3)' : s === 'blocked' ? 'var(--chart-5)' : 'var(--muted)');
  const ink = (s: string) => (s === 'running' || s === 'blocked' ? '#fff' : 'var(--foreground)');
  /** The kernel thread underneath user thread i. */
  const kOf = (i: number) => (model === '11' ? i : model === 'm1' ? 0 : i < b ? Math.min(i, o.kernelThreads - 1) : Math.min(Math.min(b, o.kernelThreads) + (i - b), o.kernelThreads - 1));
</script>

<VizCard kind="Simulator" title="User threads, kernel threads and processors">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Threading model">
    {#each MODELS as m}
      <Button variant={m.id === model ? 'primary' : 'outline'} size="sm" aria-pressed={m.id === model} onclick={() => (model = m.id)}>{m.name}</Button>
    {/each}
  </div>
  <p class="text-muted-foreground mt-3 text-sm">{info.text}</p>

  <div class="mt-4 grid gap-5 sm:grid-cols-2">
    <SliderField label="User-level threads" bind:value={user} min={1} max={8} />
    <SliderField label="Processors (cores)" bind:value={cores} min={1} max={6} />
    {#if model === 'mn'}<SliderField label="Kernel threads given to the process" bind:value={kernel} min={1} max={8} />{/if}
    <SliderField label="Threads in a blocking system call" bind:value={blocked} min={0} max={user} />
  </div>

  <svg viewBox={`0 0 ${W} 210`} class="mt-4 w-full" role="img" aria-label={`${user} user threads on ${o.kernelThreads} kernel threads and ${cores} processors. ${o.parallel} running in parallel.`}>
    <text x="4" y="14" fill="var(--muted-foreground)" font-size="11">user threads</text>
    <text x="4" y="94" fill="var(--muted-foreground)" font-size="11">kernel threads</text>
    <text x="4" y="174" fill="var(--muted-foreground)" font-size="11">processors</text>
    {#each Array(user) as _, i}
      {@const s = uState(i)}
      <line x1={xs(user, i)} y1="52" x2={xs(o.kernelThreads, kOf(i))} y2="104" stroke={s === 'ready' ? 'var(--border)' : fill(s)} stroke-width={s === 'ready' ? 1 : 2} />
    {/each}
    {#each Array(o.kernelThreads) as _, i}
      {#if kState(i) === 'running'}
        <line x1={xs(o.kernelThreads, i)} y1="132" x2={xs(cores, i - Math.min(b, o.kernelThreads))} y2="184" stroke="var(--chart-3)" stroke-width="2" />
      {/if}
    {/each}
    {#each Array(user) as _, i}
      {@const s = uState(i)}
      <circle cx={xs(user, i)} cy="38" r="14" fill={fill(s)} stroke="var(--border)" />
      <text x={xs(user, i)} y="42" fill={ink(s)} font-size="11" font-weight="600" text-anchor="middle">U{i + 1}</text>
    {/each}
    {#each Array(o.kernelThreads) as _, i}
      {@const s = kState(i)}
      <rect x={xs(o.kernelThreads, i) - 15} y="104" width="30" height="28" rx="5" fill={fill(s)} stroke="var(--border)" />
      <text x={xs(o.kernelThreads, i)} y="122" fill={ink(s)} font-size="11" font-weight="600" text-anchor="middle">K{i + 1}</text>
    {/each}
    {#each Array(cores) as _, i}
      {@const busy = i < o.parallel}
      <rect x={xs(cores, i) - 22} y="184" width="44" height="22" rx="3" fill={busy ? 'var(--chart-3)' : 'var(--card)'} stroke="var(--foreground)" stroke-dasharray={busy ? undefined : '4 3'} />
      <text x={xs(cores, i)} y="199" fill={busy ? '#fff' : 'var(--muted-foreground)'} font-size="11" text-anchor="middle">{busy ? 'busy' : 'idle'}</text>
    {/each}
  </svg>

  <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-chart-3 size-2.5 rounded-xs"></span>running</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-5 size-2.5 rounded-xs"></span>blocked in a system call</span>
    <span class="flex items-center gap-1.5"><span class="bg-muted size-2.5 rounded-xs border"></span>ready or idle</span>
  </div>

  <p class="mt-3 text-sm" role="status">
    <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium">{o.parallel}</span>
    thread{o.parallel === 1 ? '' : 's'} of this process {o.parallel === 1 ? 'is' : 'are'} executing at this instant; {o.idleCores} processor{o.idleCores === 1 ? ' is' : 's are'} idle.
    {#if o.processBlocked}
      <span class="font-medium">The whole process is blocked</span>{model === 'm1' ? ': its only kernel thread is stuck in a system call, although other user threads are ready to run.' : '.'}
    {:else if o.runnable > o.usableKernel && o.usableKernel < cores}
      {o.runnable - o.usableKernel} runnable user thread{o.runnable - o.usableKernel === 1 ? ' has' : 's have'} no kernel thread to run on, so the idle processors cannot be used.
    {:else if o.runnable > cores}
      There are more runnable threads than processors, so the rest take turns.
    {/if}
  </p>
</VizCard>
