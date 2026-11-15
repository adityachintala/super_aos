<script lang="ts">
  import { onMount } from 'svelte';
  import { Alert, AlertDescription, AlertTitle } from '../starwind-svelte/alert';
  import { Badge } from '../starwind-svelte/badge';
  import { Button } from '../starwind-svelte/button';
  import { Card, CardContent } from '../starwind-svelte/card';
  import { Checkbox } from '../starwind-svelte/checkbox';
  import { Input } from '../starwind-svelte/input';
  import { Textarea } from '../starwind-svelte/textarea';
  import Icon from '../Icon.svelte';
  import { grade, type Question } from '../../lib/questions';
  import { loadProgress, recordAnswer, spendHint } from '../../lib/progress';
  import { HINT_COST, XP_PER_QUESTION } from '../../lib/mastery';

  let {
    q,
    onresult,
    label = 'Check your understanding',
    bare = false,
  }: { q: Question; onresult?: (fraction: number) => void; label?: string; bare?: boolean } = $props();

  onMount(loadProgress);

  let choice = $state<number | null>(null);
  let picked = $state<number[]>([]);
  let tf = $state<boolean | null>(null);
  let text = $state('');
  let ticked = $state<boolean[]>([]);
  let revealed = $state(false); // written: model answer shown
  let done = $state(false);
  let fraction = $state(0);
  let gained = $state(0);
  let hintShown = $state(false);

  const worth = $derived(q.type === 'written' ? q.marks * 5 : XP_PER_QUESTION);
  const ready = $derived(
    q.type === 'mcq' ? choice !== null : q.type === 'multi' ? picked.length > 0 : q.type === 'tf' ? tf !== null : text.trim() !== '',
  );

  function finish(f: number) {
    fraction = f;
    done = true;
    gained = recordAnswer(q.id, f, worth);
    onresult?.(f);
  }

  function check() {
    if (q.type === 'written') return;
    const response = q.type === 'mcq' ? choice : q.type === 'multi' ? picked : q.type === 'tf' ? tf : text;
    finish(grade(q, response));
  }

  function reveal() {
    if (q.type !== 'written') return;
    ticked = q.points.map(() => false);
    revealed = true;
  }

  function selfGrade() {
    if (q.type !== 'written') return;
    finish(ticked.filter(Boolean).length / q.points.length);
  }

  function toggle(i: number) {
    picked = picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i];
  }

  function showHint() {
    hintShown = true;
    spendHint();
  }

  function retry() {
    choice = null;
    picked = [];
    tf = null;
    text = '';
    revealed = false;
    done = false;
  }

  type OptState = 'right' | 'wrong' | 'missed' | 'idle';
  function optionState(i: number): OptState {
    if (!done) return 'idle';
    if (q.type === 'mcq') return i === q.answer ? 'right' : i === choice ? 'wrong' : 'idle';
    if (q.type === 'multi') {
      const want = q.answers.includes(i);
      const got = picked.includes(i);
      return want && got ? 'right' : want ? 'missed' : got ? 'wrong' : 'idle';
    }
    return 'idle';
  }

  const OPT =
    'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-base transition-colors outline-none focus-visible:ring-3 focus-visible:ring-outline/50 disabled:cursor-default';
  function optClass(on: boolean, st: OptState) {
    if (st === 'right') return `${OPT} border-success bg-success/10`;
    if (st === 'wrong') return `${OPT} border-error bg-error/10`;
    if (st === 'missed') return `${OPT} border-warning border-dashed`;
    if (on) return `${OPT} border-primary bg-primary/7`;
    return `${OPT} border-input bg-background dark:bg-input/30 ${done ? '' : 'hover:bg-muted'}`;
  }
  function markClass(on: boolean, st: OptState, square: boolean) {
    const tone =
      st === 'right'
        ? 'border-success bg-success text-success-foreground'
        : st === 'wrong'
          ? 'border-error bg-error text-error-foreground'
          : st === 'missed'
            ? 'border-warning bg-warning text-warning-foreground'
            : on
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input';
    return `grid size-5 shrink-0 place-items-center border ${square ? 'rounded-sm' : 'rounded-full'} ${tone}`;
  }
</script>

{#snippet body()}
  <div class="flex flex-wrap items-center gap-2">
    <Badge tone="primary" appearance="soft" size="sm" eyebrow>{label}</Badge>
    {#if q.pastPaper}<Badge variant="outline" size="sm">{q.source ?? 'From a past quiz'}</Badge>{/if}
    {#if q.type === 'written'}<Badge variant="outline" size="sm">Written · {q.marks} marks</Badge>{/if}
  </div>

  <p class="mt-3 text-base leading-relaxed font-medium">{@html q.prompt}</p>

  {#if q.type === 'mcq' || q.type === 'multi'}
    {#if q.type === 'multi'}<p class="text-muted-foreground mt-1 text-sm">Select all that apply.</p>{/if}
    <div class="mt-3 grid gap-2">
      {#each q.options as opt, i}
        {@const st = optionState(i)}
        {@const on = q.type === 'mcq' ? choice === i : picked.includes(i)}
        <button type="button" class={optClass(on, st)} disabled={done} aria-pressed={on} onclick={() => (q.type === 'mcq' ? (choice = i) : toggle(i))}>
          <span class={markClass(on, st, q.type === 'multi')}>
            {#if st === 'right'}<Icon name="check" class="size-3.5" />
            {:else if st === 'wrong'}<Icon name="x" class="size-3.5" />
            {:else if st === 'missed'}<Icon name="minus" class="size-3.5" />
            {:else if on}<span class="bg-primary-foreground size-1.5 rounded-full"></span>{/if}
          </span>
          <span>{@html opt}</span>
          {#if st === 'missed'}<span class="text-muted-foreground ml-auto text-xs">should be selected</span>{/if}
        </button>
      {/each}
    </div>
  {:else if q.type === 'tf'}
    <div class="mt-3 grid grid-cols-2 gap-2">
      {#each [true, false] as v}
        {@const st = !done ? 'idle' : q.answer === v ? 'right' : tf === v ? 'wrong' : 'idle'}
        <button type="button" class="{optClass(tf === v, st)} justify-center font-medium" disabled={done} aria-pressed={tf === v} onclick={() => (tf = v)}>
          {v ? 'True' : 'False'}
        </button>
      {/each}
    </div>
  {:else if q.type === 'numeric'}
    <div class="mt-3 flex items-center gap-2">
      <Input
        class="w-44 font-mono"
        size="sm"
        inputmode="decimal"
        placeholder="Your answer"
        aria-label="Your answer"
        bind:value={text}
        disabled={done}
        onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && ready && !done && check()}
      />
      {#if q.unit}<span class="text-muted-foreground text-sm">{q.unit}</span>{/if}
    </div>
  {:else}
    <Textarea
      class="mt-3 min-h-28"
      placeholder="Write your answer as you would in an exam, then compare with the model answer."
      aria-label="Your written answer"
      bind:value={text}
      disabled={revealed}
    />
  {/if}

  {#if hintShown && q.hint}
    <Alert class="mt-3 py-3 text-sm"><AlertDescription><span class="font-medium">Hint:</span> {@html q.hint}</AlertDescription></Alert>
  {/if}

  {#if q.type === 'written' && revealed}
    <div class="bg-muted/50 mt-4 rounded-lg border p-4">
      <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Model answer</p>
      <div class="mt-1 text-sm leading-relaxed [&_b]:font-semibold">{@html q.modelAnswer}</div>
      <p class="text-muted-foreground mt-4 text-xs font-medium tracking-wider uppercase">Tick each point your answer made</p>
      <div class="mt-2 grid gap-2">
        {#each q.points as pt, i}
          <Checkbox id={`${q.id}-pt-${i}`} size="sm" variant="primary" label={pt} bind:checked={ticked[i]} disabled={done} />
        {/each}
      </div>
    </div>
  {/if}

  {#if done}
    <Alert variant={fraction === 1 ? 'success' : fraction > 0 ? 'warning' : 'error'} role="status" class="mt-4 py-3">
      <AlertTitle class="mb-1 text-base">
        <Icon name={fraction === 1 ? 'check' : fraction > 0 ? 'minus' : 'x'} class="size-4.5" />
        {#if q.type === 'written'}
          You covered {ticked.filter(Boolean).length} of {q.points.length} marking points
        {:else if fraction === 1}
          Correct
        {:else}
          Not quite{#if q.type === 'numeric'}: the answer is {q.answer}{q.unit ? ` ${q.unit}` : ''}{/if}
        {/if}
        {#if gained > 0}<Badge tone="primary" appearance="soft" size="sm">+{gained} XP</Badge>{/if}
      </AlertTitle>
      {#if q.explanation}<AlertDescription class="text-sm [&_b]:font-semibold">{@html q.explanation}</AlertDescription>{/if}
    </Alert>
  {/if}

  <div class="mt-4 flex flex-wrap items-center gap-2 empty:hidden">
    {#if !done}
      {#if q.type === 'written'}
        {#if !revealed}
          <Button variant="primary" size="sm" onclick={reveal}>Show model answer</Button>
        {:else}
          <Button variant="primary" size="sm" onclick={selfGrade}>Save my self-grade</Button>
        {/if}
      {:else}
        <Button variant="primary" size="sm" disabled={!ready} onclick={check}>Check</Button>
      {/if}
      {#if q.hint && !hintShown && !revealed}
        <Button variant="ghost" size="sm" onclick={showHint}>Hint <span class="text-muted-foreground">(−{HINT_COST} XP)</span></Button>
      {/if}
    {:else if !onresult && fraction < 1}
      <Button variant="outline" size="sm" onclick={retry}>Try again</Button>
    {/if}
  </div>
{/snippet}

{#if bare}
  <div class="q">{@render body()}</div>
{:else}
  <Card size="sm" class="q not-sw-prose my-6 text-base">
    <CardContent>{@render body()}</CardContent>
  </Card>
{/if}
