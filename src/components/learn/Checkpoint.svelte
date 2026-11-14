<script lang="ts">
  import { onMount } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import { Button } from '../starwind-svelte/button';
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../starwind-svelte/card';
  import { Progress } from '../starwind-svelte/progress';
  import Icon from '../Icon.svelte';
  import Question from './Question.svelte';
  import MasteryBadge from './MasteryBadge.svelte';
  import type { Question as Q } from '../../lib/questions';
  import { completeCheckpoint, loadProgress, progress } from '../../lib/progress';
  import type { Level } from '../../lib/mastery';

  let { lessonId, questions }: { lessonId: string; questions: Q[] } = $props();

  onMount(loadProgress);

  let stage = $state<'intro' | 'run' | 'done'>('intro');
  let index = $state(0);
  let results = $state<number[]>([]);
  let outcome = $state<{ before: Level; after: Level } | null>(null);
  let run = $state(0); // bumps on retry so questions remount fresh

  const current = $derived($progress.lessons[lessonId]);
  const answered = $derived(results[index] !== undefined);
  const score = $derived(results.length ? results.reduce((a, b) => a + b, 0) / questions.length : 0);
  const leveledUp = $derived(!!outcome && outcome.after > outcome.before);

  function start() {
    results = [];
    index = 0;
    outcome = null;
    run += 1;
    stage = 'run';
  }

  function next() {
    if (index < questions.length - 1) index += 1;
    else {
      outcome = completeCheckpoint(lessonId, score);
      stage = 'done';
    }
  }
</script>

<Card id="checkpoint" class="not-sw-prose ring-primary relative my-10 overflow-hidden ring-2">
  {#if stage === 'intro'}
    <CardHeader>
      <Badge tone="primary" appearance="soft" size="sm" eyebrow class="w-fit"><Icon name="flag" class="size-3" />Checkpoint</Badge>
      <CardTitle class="text-2xl">Ready to prove it?</CardTitle>
      <CardDescription>
        {questions.length} questions on this lesson. Score 60% to become Familiar and 85% to become Proficient. Written questions are graded by you
        against a marking scheme, so be honest with yourself.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap items-center gap-4">
      <Button variant="primary" onclick={start}>{current ? 'Retake checkpoint' : 'Start checkpoint'}</Button>
      {#if current}
        <span class="text-muted-foreground flex items-center gap-2 text-sm">
          <MasteryBadge level={current.level} /> · best {Math.round(current.best * 100)}%
        </span>
      {/if}
    </CardContent>
  {:else if stage === 'run'}
    <CardHeader>
      <div class="flex items-center justify-between gap-3">
        <Badge tone="primary" appearance="soft" size="sm" eyebrow>Question {index + 1} of {questions.length}</Badge>
        <span class="text-muted-foreground text-sm">{results.filter((r) => r !== undefined).length} answered</span>
      </div>
      <Progress variant="primary" value={index + (answered ? 1 : 0)} max={questions.length} label="Checkpoint progress" class="mt-2" />
    </CardHeader>
    <CardContent>
      {#key `${run}-${index}`}
        <Question q={questions[index]} label="Checkpoint" bare onresult={(f) => (results[index] = f)} />
      {/key}
    </CardContent>
    <CardFooter>
      <Button variant="primary" size="sm" disabled={!answered} onclick={next}>
        {index < questions.length - 1 ? 'Next question' : 'See my result'}
        <Icon name="arrowRight" />
      </Button>
    </CardFooter>
  {:else if outcome}
    {#if leveledUp}
      <div class="confetti" aria-hidden="true">
        {#each Array(24) as _, i}
          <i style:left={`${(i * 37) % 100}%`} style:animation-delay={`${(i % 8) * 0.08}s`} style:background={`var(--chart-${(i % 6) + 1})`}></i>
        {/each}
      </div>
    {/if}
    <CardHeader>
      <Badge tone="primary" appearance="soft" size="sm" eyebrow class="w-fit">Checkpoint complete</Badge>
      <CardTitle class="text-4xl font-semibold tabular-nums">{Math.round(score * 100)}%</CardTitle>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        {#if leveledUp}
          <span class="font-medium">Level up</span>
          <MasteryBadge level={outcome.before} />
          <Icon name="arrowRight" class="text-muted-foreground size-3.5" />
        {/if}
        <MasteryBadge level={outcome.after} />
      </div>
      <CardDescription>
        {#if score >= 0.85}
          Excellent. The unit test is the way to reach Mastered.
        {:else if score >= 0.6}
          Solid. Revisit the questions you dropped marks on, then retake to reach Proficient.
        {:else}
          A good first pass. Re-read the sections behind the questions you missed and try again; only your best level counts.
        {/if}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ol class="grid gap-2 text-sm">
        {#each questions as q, i}
          {@const r = results[i]}
          <li class="flex items-start gap-2">
            <span
              class="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full {r === 1
                ? 'bg-success text-success-foreground'
                : r > 0
                  ? 'bg-warning text-warning-foreground'
                  : 'bg-error text-error-foreground'}"
            >
              <Icon name={r === 1 ? 'check' : r > 0 ? 'minus' : 'x'} class="size-3" />
            </span>
            <span class="sr-only">{r === 1 ? 'Correct' : r > 0 ? 'Partly correct' : 'Incorrect'}:</span>
            <span class="line-clamp-2">{@html q.prompt}</span>
          </li>
        {/each}
      </ol>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" onclick={start}>Retake checkpoint</Button>
    </CardFooter>
  {/if}
</Card>

<style>
  .confetti {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .confetti i {
    position: absolute;
    top: -12px;
    width: 8px;
    height: 14px;
    border-radius: 2px;
    animation: fall 1.8s ease-in forwards;
  }
  @keyframes fall {
    to {
      transform: translateY(520px) rotate(540deg);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .confetti {
      display: none;
    }
  }
</style>
