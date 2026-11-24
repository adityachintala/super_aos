<script lang="ts">
  // A past-quiz question for quick revision: no answer box, the answer stays hidden
  // until "Show answer", and a button tracks incomplete / completed / revisit.
  import { onMount } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import { Button } from '../starwind-svelte/button';
  import { Card, CardContent } from '../starwind-svelte/card';
  import Icon from '../Icon.svelte';
  import type { Question } from '../../lib/questions';
  import { cycleStatus, loadPyqStatus, pyqStatus, type PyqStatus } from '../../lib/pyq-status';

  let { q, label = 'Past quiz', number }: { q: Question; label?: string; number?: number } = $props();

  onMount(loadPyqStatus);

  let shown = $state(false);
  const status = $derived<PyqStatus>($pyqStatus[q.id] ?? 'incomplete');

  const isRight = (i: number) => (q.type === 'mcq' ? q.answer === i : q.type === 'multi' ? q.answers.includes(i) : false);

  const STATUS = {
    incomplete: { text: 'Mark as completed', icon: 'circleDashed', cls: 'border-input text-muted-foreground hover:bg-muted', title: 'Not done yet. Click to mark as completed.' },
    completed: { text: 'Completed', icon: 'circleCheck', cls: 'border-success bg-success text-success-foreground hover:bg-success/90', title: 'Completed. Click to mark for revisiting.' },
    revisit: { text: 'Revisit', icon: 'refresh', cls: 'border-warning bg-warning text-warning-foreground hover:bg-warning/90', title: 'Marked to revisit. Click to reset to incomplete.' },
  } as const;
  const st = $derived(STATUS[status]);
</script>

<Card size="sm" class="q not-sw-prose my-6 text-base {status === 'completed' ? 'border-success/60' : status === 'revisit' ? 'border-warning/70' : ''}">
  <CardContent>
    <div class="flex flex-wrap items-center gap-2">
      {#if number}<span class="text-muted-foreground font-mono text-xs">Q{number}</span>{/if}
      <Badge tone="primary" appearance="soft" size="sm" eyebrow>{label}</Badge>
      {#if q.pastPaper}<Badge variant="outline" size="sm">{q.source ?? 'From a past quiz'}</Badge>{/if}
      {#if q.type === 'written'}<Badge variant="outline" size="sm">Written · {q.marks} marks</Badge>{/if}
      {#if q.type === 'tf'}<Badge variant="outline" size="sm">True or false</Badge>{/if}
      {#if q.type === 'numeric'}<Badge variant="outline" size="sm">Numerical</Badge>{/if}
      {#if q.type === 'multi'}<Badge variant="outline" size="sm">Select all that apply</Badge>{/if}
    </div>

    <p class="mt-3 text-base leading-relaxed font-medium">{@html q.prompt}</p>

    {#if q.type === 'mcq' || q.type === 'multi'}
      <ol class="mt-3 grid gap-2">
        {#each q.options as opt, i}
          {@const right = shown && isRight(i)}
          <li class="flex items-center gap-3 rounded-md border px-3 py-2 {right ? 'border-success bg-success/10' : 'border-input'}">
            <span class="grid size-5 shrink-0 place-items-center rounded-full border text-xs {right ? 'border-success bg-success text-success-foreground' : 'border-input text-muted-foreground'}">
              {#if right}<Icon name="check" class="size-3.5" />{:else}{String.fromCharCode(65 + i)}{/if}
            </span>
            <span>{@html opt}</span>
          </li>
        {/each}
      </ol>
    {/if}

    {#if shown}
      <div class="bg-muted/50 mt-4 rounded-lg border p-4">
        <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Answer</p>
        {#if q.type === 'tf'}
          <p class="mt-1 text-base font-semibold">{q.answer ? 'True' : 'False'}</p>
        {:else if q.type === 'numeric'}
          <p class="mt-1 font-mono text-base font-semibold">{q.answer}{q.unit ? ` ${q.unit}` : ''}</p>
        {:else if q.type === 'mcq'}
          <p class="mt-1 text-base font-semibold">{String.fromCharCode(65 + q.answer)}. {@html q.options[q.answer]}</p>
        {:else if q.type === 'multi'}
          <p class="mt-1 text-base font-semibold">{q.answers.map((i) => String.fromCharCode(65 + i)).join(', ')}</p>
        {:else}
          <div class="mt-1 text-sm leading-relaxed [&_b]:font-semibold">{@html q.modelAnswer}</div>
          {#if q.points.length}
            <p class="text-muted-foreground mt-4 text-xs font-medium tracking-wider uppercase">Marking points</p>
            <ul class="mt-2 grid list-disc gap-1 pl-5 text-sm">
              {#each q.points as pt}<li>{@html pt}</li>{/each}
            </ul>
          {/if}
        {/if}
        {#if q.explanation}<div class="text-muted-foreground mt-3 text-sm leading-relaxed [&_b]:font-semibold">{@html q.explanation}</div>{/if}
      </div>
    {/if}

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <Button variant={shown ? 'outline' : 'primary'} size="sm" aria-expanded={shown} onclick={() => (shown = !shown)}>
        <Icon name={shown ? 'eyeOff' : 'eye'} class="size-4" />
        {shown ? 'Hide answer' : 'Show answer'}
      </Button>
      <button
        type="button"
        class="focus-visible:ring-outline/50 ml-auto inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 {st.cls}"
        title={st.title}
        aria-label="{st.text}. {st.title}"
        onclick={() => cycleStatus(q.id)}
      >
        <Icon name={st.icon} class="size-4" />
        {st.text}
      </button>
    </div>
  </CardContent>
</Card>
