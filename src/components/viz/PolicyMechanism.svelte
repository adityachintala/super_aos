<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';

  type Kind = 'mechanism' | 'policy';
  const ITEMS: { text: string; kind: Kind; why: string }[] = [
    { text: 'A timer that interrupts the CPU after a set interval', kind: 'mechanism', why: 'It is the means of regaining control. It says nothing about how long the interval should be.' },
    { text: 'The timer is set to 10 ms for interactive processes', kind: 'policy', why: 'How long is a decision. It can change without touching the timer mechanism.' },
    { text: 'A priority queue from which the dispatcher takes the next process', kind: 'mechanism', why: 'It can serve any ordering. Which processes get high priority is decided elsewhere.' },
    { text: 'I/O-bound processes get higher priority than CPU-bound ones', kind: 'policy', why: 'This is a choice about what will be done, and a different system might choose the opposite.' },
    { text: 'Base and limit registers checked on every memory reference', kind: 'mechanism', why: 'The hardware check is how protection is enforced.' },
    { text: 'Each user may use at most 2 GB of memory', kind: 'policy', why: 'A limit chosen by an administrator. The same mechanism would enforce any other number.' },
    { text: 'Evict the page that has not been used for the longest time', kind: 'policy', why: 'Which page to evict is the decision. The mechanism is the code that writes a page out and updates the page table.' },
    { text: 'Access-control bits stored with every file', kind: 'mechanism', why: 'The bits make protection possible. Who is given which rights is policy.' },
  ];

  let answers = $state<(Kind | null)[]>(ITEMS.map(() => null));
  const done = $derived(answers.filter((a) => a !== null).length);
  const right = $derived(answers.filter((a, i) => a === ITEMS[i].kind).length);
</script>

<VizCard kind="Try it" title="Mechanism or policy?">
  <p class="text-muted-foreground text-sm">A mechanism determines <span class="text-foreground font-medium">how</span> to do something. A policy determines <span class="text-foreground font-medium">what</span> will be done. Sort each statement.</p>
  <ul class="mt-3 grid gap-2">
    {#each ITEMS as item, i}
      {@const a = answers[i]}
      <li class="rounded-md border px-3 py-2.5 {a === null ? '' : a === item.kind ? 'border-success bg-success/10' : 'border-error bg-error/10'}">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-sm">{item.text}</span>
          <span class="flex gap-1.5">
            <Button variant={a === 'mechanism' ? 'primary' : 'outline'} size="sm" disabled={a !== null} aria-pressed={a === 'mechanism'} onclick={() => (answers[i] = 'mechanism')}>Mechanism</Button>
            <Button variant={a === 'policy' ? 'primary' : 'outline'} size="sm" disabled={a !== null} aria-pressed={a === 'policy'} onclick={() => (answers[i] = 'policy')}>Policy</Button>
          </span>
        </div>
        {#if a !== null}
          <p class="mt-1.5 text-sm"><span class="font-medium">{a === item.kind ? 'Correct' : `Not quite: it is a ${item.kind}`}.</span> {item.why}</p>
        {/if}
      </li>
    {/each}
  </ul>
  <div class="mt-3 flex flex-wrap items-center gap-3">
    <span class="text-sm tabular-nums" role="status">{right} of {done} correct{done === ITEMS.length ? '. Notice that every policy here could be changed without rewriting its mechanism.' : ''}</span>
    <Button variant="ghost" size="sm" class="ml-auto" disabled={done === 0} onclick={() => (answers = ITEMS.map(() => null))}>Reset</Button>
  </div>
</VizCard>
