<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import Icon from '../Icon.svelte';
  import { CS_CODE, csCheck, csStart, csStep, type CsAlgo, type CsState } from '../../lib/sim/sync';

  const ALGOS: { id: CsAlgo; name: string; idea: string; flaw: string }[] = [
    { id: 'turn', name: 'Algorithm 1: take turns', idea: 'A shared variable turn says whose turn it is to enter.', flaw: 'Strict alternation. If P1 never wants to enter, P0 can enter once and then never again, although the critical section is free.' },
    { id: 'check-first', name: 'Flags, test then set', idea: 'Each process tests the other’s flag and then raises its own.', flaw: 'Both can pass the test before either raises its flag, and then both are inside. Step P0 once, P1 once, and continue.' },
    { id: 'flag', name: 'Algorithm 2: set then test', idea: 'Each process raises its flag first, then waits while the other’s flag is up.', flaw: 'If both raise their flags before either tests, each waits for the other for ever.' },
    { id: 'peterson', name: 'Algorithm 3: Peterson', idea: 'Flags plus turn: "I want to enter, but you go first if you want to".', flaw: '' },
  ];
  const verdicts = Object.fromEntries(ALGOS.map((a) => [a.id, csCheck(a.id)])) as Record<CsAlgo, ReturnType<typeof csCheck>>;

  let algo = $state<CsAlgo>('turn');
  let s = $state<CsState>(csStart());
  let note = $state('Step either process, one statement at a time, in any order you like.');

  const info = $derived(ALGOS.find((a) => a.id === algo)!);
  const v = $derived(verdicts[algo]);
  const both = $derived(s.pc[0] === 'cs' && s.pc[1] === 'cs');
  const stuck = $derived(csStep(algo, s, 0) === s && csStep(algo, s, 1) === s);

  function pick(a: CsAlgo) {
    algo = a;
    s = csStart();
    note = 'Step either process, one statement at a time, in any order you like.';
  }
  function step(i: 0 | 1) {
    const n = csStep(algo, s, i);
    note = n === s ? `P${i} tests its while condition and finds it still true, so it keeps waiting.` : `P${i} executed: ${CS_CODE[algo].find((l) => l.pc === s.pc[i])!.text}`;
    s = n;
  }
</script>

<VizCard kind="Simulator" title="Try to break a critical-section algorithm">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Algorithm">
    {#each ALGOS as a}
      <Button variant={a.id === algo ? 'primary' : 'outline'} size="sm" aria-pressed={a.id === algo} onclick={() => pick(a.id)}>{a.name}</Button>
    {/each}
  </div>
  <p class="text-muted-foreground mt-3 text-sm">{info.idea}</p>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    {#each [0, 1] as i}
      <div class="rounded-md border p-2.5 {s.pc[i] === 'cs' ? (both ? 'border-error bg-error/10' : 'border-success bg-success/10') : ''}">
        <p class="mb-2 text-sm font-medium">Process P{i} <span class="text-muted-foreground font-normal">(i = {i}, j = {1 - i})</span></p>
        {#each CS_CODE[algo] as line}
          <p class="rounded-sm px-2 py-1 font-mono text-xs {line.pc === s.pc[i] ? 'bg-primary text-primary-foreground font-medium' : ''}">{line.text}</p>
        {/each}
        <Button variant="outline" size="sm" class="mt-2 h-7 px-2.5 text-xs" onclick={() => step(i as 0 | 1)}>Step P{i}</Button>
      </div>
    {/each}
  </div>

  <div class="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
    {#if algo !== 'turn'}
      <span class="rounded-md border px-2 py-1">flag[0] = {s.flag[0]}</span>
      <span class="rounded-md border px-2 py-1">flag[1] = {s.flag[1]}</span>
    {/if}
    {#if algo === 'turn' || algo === 'peterson'}<span class="rounded-md border px-2 py-1">turn = {s.turn}</span>{/if}
    <Button variant="ghost" size="sm" class="ml-auto h-7 px-2.5 font-sans text-xs" onclick={() => pick(algo)}>Reset</Button>
  </div>

  <p class="mt-3 min-h-10 text-sm" role="status">
    {#if both}
      <span class="border-error bg-error/10 rounded-sm border px-1.5 py-0.5 font-medium">Mutual exclusion violated</span> Both processes are in the critical section at once.
    {:else if stuck}
      <span class="border-error bg-error/10 rounded-sm border px-1.5 py-0.5 font-medium">Stuck</span> Neither process can ever advance: each is waiting for the other.
    {:else}
      {note}
    {/if}
  </p>

  <div class="mt-3 border-t pt-4">
    <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">Verdict, from checking every possible interleaving</p>
    <div class="grid gap-1.5 text-sm sm:grid-cols-3">
      {#each [['Mutual exclusion', v.mutualExclusion], ['Progress', v.progress], ['No deadlock', v.noDeadlock]] as [name, ok]}
        <p class="flex items-center gap-2">
          <span class="grid size-5 place-items-center rounded-full {ok ? 'bg-success text-success-foreground' : 'bg-error text-error-foreground'}"><Icon name={ok ? 'check' : 'x'} class="size-3.5" /></span>
          {name}
        </p>
      {/each}
    </div>
    <p class="text-muted-foreground mt-2 text-sm">{info.flaw || 'No interleaving breaks it: at most one process is ever inside, a process is never kept out by one that is not competing, and each waits for at most one entry by the other.'}</p>
  </div>
</VizCard>
