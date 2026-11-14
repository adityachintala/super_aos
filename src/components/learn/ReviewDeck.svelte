<script lang="ts">
  import { BASE } from '../../lib/base';
  import { onMount } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import { Button } from '../starwind-svelte/button';
  import { Card, CardContent } from '../starwind-svelte/card';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { Progress } from '../starwind-svelte/progress';
  import Icon from '../Icon.svelte';
  import Question from './Question.svelte';
  import { rng, shuffle, weakSpots, type BankItem } from '../../lib/exam';
  import { loadProgress, progress, rateCard } from '../../lib/progress';
  import type { Flashcard } from '../../data/flashcards';

  interface UnitInfo {
    id: number;
    title: string;
    lessons: { id: string; title: string }[];
  }
  let { units, cards, pool }: { units: UnitInfo[]; cards: Flashcard[]; pool: BankItem[] } = $props();

  onMount(loadProgress);

  let tab = $state<'cards' | 'weak'>('cards');
  let unit = $state('all');
  let queue = $state<Flashcard[]>([]);
  let at = $state(0);
  let flipped = $state(false);
  let seen = $state(0);
  let knew = $state(0);

  const lessonTitle = (id: string) => units.flatMap((u) => u.lessons).find((l) => l.id === id)?.title ?? id;
  const inUnit = (lessonId: string) => unit === 'all' || units.find((u) => String(u.id) === unit)!.lessons.some((l) => l.id === lessonId);
  const scope = $derived(cards.filter((c) => inUnit(c.lessonId)));
  const box = (id: string) => $progress.cards[id] ?? 0;
  const known = $derived(scope.filter((c) => box(c.id) >= 2).length);
  const card = $derived(queue[at]);

  // Cards you know least come first; within a box the order is shuffled.
  function deal() {
    const rand = rng(Date.now() % 2147483647);
    queue = shuffle(scope, rand).sort((a, b) => box(a.id) - box(b.id)).slice(0, 15);
    at = 0;
    flipped = false;
    seen = 0;
    knew = 0;
  }
  function rate(ok: boolean) {
    rateCard(card.id, ok);
    seen += 1;
    if (ok) knew += 1;
    at += 1;
    flipped = false;
  }

  const weak = $derived(weakSpots(pool, $progress.answers).filter((x) => inUnit(x.lessonId)));
  let shownWeak = $state<BankItem[]>([]);
  // Freeze the list while working through it, so answering a question does not make it vanish mid-read.
  function loadWeak() {
    shownWeak = weak.slice(0, 10);
  }
  $effect(() => {
    if (tab === 'weak' && shownWeak.length === 0 && weak.length > 0) loadWeak();
  });

  function resetLists() {
    queue = [];
    shownWeak = [];
  }
</script>

<div class="flex flex-wrap items-end gap-3">
  <div class="flex gap-1.5" role="group" aria-label="Review mode">
    <Button variant={tab === 'cards' ? 'primary' : 'outline'} size="sm" aria-pressed={tab === 'cards'} onclick={() => (tab = 'cards')}>Flashcards</Button>
    <Button variant={tab === 'weak' ? 'primary' : 'outline'} size="sm" aria-pressed={tab === 'weak'} onclick={() => (tab = 'weak')}>
      Weak spots{#if weak.length}<Badge size="sm" variant="outline" class="ml-1">{weak.length}</Badge>{/if}
    </Button>
  </div>
  <label class="ml-auto grid gap-1 text-sm font-medium">
    Show
    <NativeSelect size="sm" bind:value={unit} onchange={resetLists}>
      <NativeSelectOption value="all">All units</NativeSelectOption>
      {#each units as u}<NativeSelectOption value={String(u.id)}>Unit {u.id}: {u.title}</NativeSelectOption>{/each}
    </NativeSelect>
  </label>
</div>

{#if tab === 'cards'}
  <Card class="mt-5">
    <CardContent>
      <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span class="text-muted-foreground"><span class="text-foreground font-medium">{known}</span> of {scope.length} cards known</span>
        {#if queue.length && card}<span class="text-muted-foreground tabular-nums">Card {at + 1} of {queue.length}</span>{/if}
      </div>
      <Progress variant="primary" value={known} max={scope.length} label="Cards known" class="mt-2" />

      {#if queue.length === 0}
        <p class="mt-5">
          {scope.length} cards on definitions, comparisons and formulas. Each session deals 15, starting with the ones you know least. Say the
          answer to yourself before you turn the card over.
        </p>
        <Button variant="primary" class="mt-4" onclick={deal}>Start a session</Button>
      {:else if card}
        <button
          type="button"
          class="bg-muted/40 hover:bg-muted mt-5 grid min-h-56 w-full place-items-center rounded-lg border p-6 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-outline/50"
          aria-label={flipped ? 'Answer. Activate to see the question again.' : 'Question. Activate to see the answer.'}
          onclick={() => (flipped = !flipped)}
        >
          <span class="grid gap-3">
            <span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">{lessonTitle(card.lessonId)} · {flipped ? 'answer' : 'question'}</span>
            <span class={flipped ? 'text-base leading-relaxed' : 'text-xl font-medium text-balance'} aria-live="polite">{flipped ? card.back : card.front}</span>
            {#if !flipped}<span class="text-muted-foreground flex items-center justify-center gap-1.5 text-sm"><Icon name="handClick" class="size-4" />Turn over</span>{/if}
          </span>
        </button>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          {#if flipped}
            <Button variant="primary" size="sm" onclick={() => rate(true)}><Icon name="check" />I knew it</Button>
            <Button variant="outline" size="sm" onclick={() => rate(false)}>Not yet</Button>
          {:else}
            <Button variant="primary" size="sm" onclick={() => (flipped = true)}>Show the answer</Button>
          {/if}
          <a class="text-muted-foreground ml-auto text-sm underline underline-offset-2" href={`${BASE}/learn/${card.lessonId}`}>Open the lesson</a>
        </div>
      {:else}
        <p class="mt-5 text-lg font-medium" role="status">Session done: you knew {knew} of {seen}.</p>
        <p class="text-muted-foreground mt-1 text-sm">Cards you did not know will come up first next time.</p>
        <Button variant="primary" class="mt-4" onclick={deal}>Another session</Button>
      {/if}
    </CardContent>
  </Card>
{:else}
  <div class="mt-5">
    {#if shownWeak.length === 0}
      <Card>
        <CardContent>
          <p class="font-medium">Nothing to review here yet.</p>
          <p class="text-muted-foreground mt-1 text-sm">
            Questions you answer wrongly, or only partly, in lessons, checkpoints and tests are collected here so you can try them again.
          </p>
        </CardContent>
      </Card>
    {:else}
      <p class="text-muted-foreground text-sm">
        Questions you have attempted without full marks, weakest first. Answer one correctly and it leaves the list.
      </p>
      {#each shownWeak as item (item.q.id)}
        <Question q={item.q} label={lessonTitle(item.lessonId)} />
      {/each}
      <Button variant="outline" size="sm" onclick={loadWeak}>Refresh the list</Button>
    {/if}
  </div>
{/if}
