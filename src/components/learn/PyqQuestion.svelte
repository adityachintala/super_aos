<script lang="ts">
  // A past-quiz question for quick revision: no answer box, the answer stays hidden
  // until "Show answer", and a button tracks incomplete / completed / revisit.
  import { onMount } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import { Button } from '../starwind-svelte/button';
  import { Card, CardContent } from '../starwind-svelte/card';
  import Icon from '../Icon.svelte';
  import type { Question } from '../../lib/questions';
  import type { PyqItem } from '../../lib/pyq';
  import { answerCommand, cycleStatus, isFilteredOut, loadPyqStatus, loadPyqView, pyqStatus, pyqView, type PyqStatus } from '../../lib/pyq-status';

  let { item, label = 'Past quiz' }: { item: Pick<PyqItem, 'q' | 'sources' | 'times' | 'variants' | 'number'>; label?: string } = $props();
  const q = $derived(item.q);

  // Render the default state until mounted so hydration matches the server HTML.
  let mounted = $state(false);
  onMount(() => {
    loadPyqStatus();
    loadPyqView();
    mounted = true;
  });

  let shown = $state(false);
  $effect(() => {
    const c = $answerCommand;
    if (c.n > 0) shown = c.open;
  });

  const status = $derived<PyqStatus>((mounted && $pyqStatus[q.id]) || 'incomplete');
  const hidden = $derived(mounted && isFilteredOut($pyqView, status));
  const done = $derived(status === 'completed');

  const letter = (i: number) => String.fromCharCode(65 + i);
  const isRight = (i: number) => (q.type === 'mcq' ? q.answer === i : q.type === 'multi' ? q.answers.includes(i) : false);

  const STATUS = {
    incomplete: { text: 'Mark as completed', icon: 'circleDashed', cls: 'border-input text-muted-foreground hover:bg-muted', title: 'Not done yet. Click to mark as completed.' },
    completed: { text: 'Completed', icon: 'circleCheck', cls: 'border-success bg-success text-success-foreground hover:bg-success/90', title: 'Completed. Click to mark for revisiting.' },
    revisit: { text: 'Revisit', icon: 'refresh', cls: 'border-warning bg-warning text-warning-foreground hover:bg-warning/90', title: 'Marked to revisit. Click to reset to incomplete.' },
  } as const;
  const st = $derived(STATUS[status]);
</script>

{#snippet answer(a: Question)}
  {#if a.type === 'tf'}
    <p class="mt-1 text-base font-semibold">{a.answer ? 'True' : 'False'}</p>
  {:else if a.type === 'numeric'}
    <p class="mt-1 font-mono text-base font-semibold">{a.answer}{a.unit ? ` ${a.unit}` : ''}</p>
  {:else if a.type === 'mcq'}
    <p class="mt-1 text-base font-semibold">{letter(a.answer)}. {@html a.options[a.answer]}</p>
  {:else if a.type === 'multi'}
    <p class="mt-1 text-base font-semibold">{a.answers.map(letter).join(', ')}</p>
  {:else}
    <div class="mt-1 text-sm leading-relaxed [&_b]:font-semibold">{@html a.modelAnswer}</div>
    {#if a.points.length}
      <p class="text-muted-foreground mt-4 text-xs font-medium tracking-wider uppercase">Marking points</p>
      <ul class="mt-2 grid list-disc gap-1 pl-5 text-sm">
        {#each a.points as pt}<li>{@html pt}</li>{/each}
      </ul>
    {/if}
  {/if}
  {#if a.explanation}<div class="text-muted-foreground mt-3 text-sm leading-relaxed [&_b]:font-semibold">{@html a.explanation}</div>{/if}
{/snippet}

<div id="q-{q.id}" class="pyq-card scroll-mt-44 sm:scroll-mt-32" data-qid={q.id} data-status={status} {hidden}>
  <Card size="sm" class="q not-sw-prose my-6 text-base transition-colors {done ? 'border-success/60' : status === 'revisit' ? 'border-warning' : ''}">
    <CardContent>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-muted-foreground font-mono text-xs tabular-nums">Q{item.number}</span>
        <Badge tone="primary" appearance="soft" size="sm" eyebrow>{label}</Badge>
        {#if item.times > 1}
          <span class="bg-warning text-warning-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" title="Asked {item.times} times across past papers">
            <Icon name="flame" class="size-3.5" />High-yield ×{item.times}
          </span>
        {/if}
        {#each item.sources as s}<Badge variant="outline" size="sm">{s}</Badge>{/each}
        {#if q.type === 'written'}<Badge variant="outline" size="sm">Written · {q.marks} marks</Badge>{/if}
        {#if q.type === 'tf'}<Badge variant="outline" size="sm">True or false</Badge>{/if}
        {#if q.type === 'numeric'}<Badge variant="outline" size="sm">Numerical</Badge>{/if}
        {#if q.type === 'multi'}<Badge variant="outline" size="sm">Select all that apply</Badge>{/if}
      </div>

      <div class="mt-3 text-base leading-relaxed font-medium {done ? 'text-muted-foreground line-through decoration-1' : ''}">{@html q.prompt}</div>

      {#if q.type === 'mcq' || q.type === 'multi'}
        <ol class="mt-3 grid gap-2">
          {#each q.options as opt, i}
            {@const right = shown && isRight(i)}
            <li class="flex items-center gap-3 rounded-md border px-3 py-2 {right ? 'border-success bg-success/10' : 'border-input'}">
              <span class="grid size-5 shrink-0 place-items-center rounded-full border text-xs {right ? 'border-success bg-success text-success-foreground' : 'border-input text-muted-foreground'}">
                {#if right}<Icon name="check" class="size-3.5" />{:else}{letter(i)}{/if}
              </span>
              <span>{@html opt}</span>
            </li>
          {/each}
        </ol>
      {/if}

      {#each item.variants as v}
        <div class="bg-note-lilac/50 dark:bg-accent mt-3 rounded-lg border border-dashed p-3 text-sm">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Also asked as</span>
            {#each v.sources as s}<Badge variant="outline" size="sm">{s}</Badge>{/each}
          </div>
          <div class="mt-1 leading-relaxed {done ? 'text-muted-foreground line-through decoration-1' : ''}">{@html v.q.prompt}</div>
        </div>
      {/each}

      {#if shown}
        <div class="bg-muted/50 mt-4 rounded-lg border p-4">
          <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Answer</p>
          {@render answer(q)}
          {#each item.variants as v}
            <p class="text-muted-foreground mt-5 border-t pt-4 text-xs font-medium tracking-wider uppercase">Answer to the reworded version</p>
            {@render answer(v.q)}
          {/each}
        </div>
      {/if}

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <Button variant={shown ? 'outline' : 'primary'} size="sm" aria-expanded={shown} data-act="toggle" onclick={() => (shown = !shown)}>
          <Icon name={shown ? 'eyeOff' : 'eye'} class="size-4" />
          {shown ? 'Hide answer' : 'Show answer'}
        </Button>
        <button
          type="button"
          data-act="status"
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
</div>
