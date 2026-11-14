<script lang="ts">
  import { BASE } from '../../lib/base';
  import { onMount } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import { Button } from '../starwind-svelte/button';
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../starwind-svelte/card';
  import { Progress } from '../starwind-svelte/progress';
  import Icon from '../Icon.svelte';
  import Question from './Question.svelte';
  import MasteryBadge from './MasteryBadge.svelte';
  import { buildUnitTest, overall, tally, type BankItem } from '../../lib/exam';
  import { completeTest, loadProgress, progress, type LevelChange } from '../../lib/progress';

  let {
    unitId,
    unitTitle,
    lessons,
    pool,
  }: { unitId: number; unitTitle: string; lessons: { id: string; title: string }[]; pool: BankItem[] } = $props();

  onMount(loadProgress);

  const key = `unit-${unitId}`;
  let stage = $state<'intro' | 'run' | 'done'>('intro');
  let paper = $state<BankItem[]>([]);
  let index = $state(0);
  let results = $state<(number | undefined)[]>([]);
  let changes = $state<LevelChange[]>([]);
  let run = $state(0);

  const previous = $derived($progress.tests[key]);
  const answered = $derived(results[index] !== undefined);
  const perLesson = $derived(tally(paper, results));
  const total = $derived(overall(perLesson));
  const score = $derived(total.total ? total.earned / total.total : 0);
  const titleOf = (id: string) => lessons.find((l) => l.id === id)?.title ?? id;
  const went = (c: LevelChange) => (c.after > c.before ? 'up' : c.after < c.before ? 'down' : 'same');

  function start() {
    paper = buildUnitTest(pool, lessons.map((l) => l.id), Date.now() % 2147483647);
    results = [];
    index = 0;
    changes = [];
    run += 1;
    stage = 'run';
  }

  function next() {
    if (index < paper.length - 1) index += 1;
    else {
      changes = completeTest(key, perLesson);
      stage = 'done';
    }
  }
</script>

<Card class="ring-primary relative overflow-hidden ring-2">
  {#if stage === 'intro'}
    <CardHeader>
      <Badge tone="primary" appearance="soft" size="sm" eyebrow class="w-fit"><Icon name="target" class="size-3" />Unit test</Badge>
      <CardTitle class="text-2xl">Unit {unitId}: {unitTitle}</CardTitle>
      <CardDescription>
        A fresh mix of questions every time: three from each of the {lessons.length} lessons, then two written questions. Each lesson is
        judged on its own questions. Score 80% or more on a lesson and it moves up a level, all the way to Mastered. Score under 50% and it
        drops one.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap items-center gap-4">
      <Button variant="primary" onclick={start}>{previous ? 'Take the test again' : 'Start the unit test'}</Button>
      {#if previous}
        <span class="text-muted-foreground text-sm">Best so far {Math.round(previous.best * 100)}% · {previous.attempts} attempt{previous.attempts === 1 ? '' : 's'}</span>
      {/if}
    </CardContent>
  {:else if stage === 'run'}
    <CardHeader>
      <div class="flex items-center justify-between gap-3">
        <Badge tone="primary" appearance="soft" size="sm" eyebrow>Question {index + 1} of {paper.length}</Badge>
        <span class="text-muted-foreground text-sm">{titleOf(paper[index].lessonId)}</span>
      </div>
      <Progress variant="primary" value={index + (answered ? 1 : 0)} max={paper.length} label="Unit test progress" class="mt-2" />
    </CardHeader>
    <CardContent>
      {#key `${run}-${index}`}
        <Question q={paper[index].q} label="Unit test" bare onresult={(f) => (results[index] = f)} />
      {/key}
    </CardContent>
    <CardFooter>
      <Button variant="primary" size="sm" disabled={!answered} onclick={next}>
        {index < paper.length - 1 ? 'Next question' : 'See my result'}
        <Icon name="arrowRight" />
      </Button>
    </CardFooter>
  {:else}
    <CardHeader>
      <Badge tone="primary" appearance="soft" size="sm" eyebrow class="w-fit">Unit test complete</Badge>
      <CardTitle class="text-4xl font-semibold tabular-nums">{Math.round(score * 100)}%</CardTitle>
      <CardDescription>
        {#if score >= 0.8}
          Strong work across the unit.
        {:else if score >= 0.5}
          A fair result. The lessons below with the lowest scores are where to spend your next session.
        {:else}
          This unit needs another pass. Start with the lesson that scored lowest, then come back.
        {/if}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ul class="grid gap-2">
        {#each changes as c}
          {@const t = perLesson[c.lessonId]}
          <li class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-sm">
            <a class="font-medium underline-offset-2 hover:underline" href={`${BASE}/learn/${c.lessonId}`}>{titleOf(c.lessonId)}</a>
            <span class="text-muted-foreground tabular-nums">{Math.round((t.earned / t.total) * 100)}%</span>
            <span class="ml-auto flex items-center gap-2">
              {#if went(c) !== 'same'}
                <MasteryBadge level={c.before} />
                <Icon name="arrowRight" class="text-muted-foreground size-3.5" />
              {/if}
              <MasteryBadge level={c.after} />
              <span class="sr-only">{went(c) === 'up' ? 'moved up' : went(c) === 'down' ? 'moved down' : 'unchanged'}</span>
            </span>
          </li>
        {/each}
      </ul>
    </CardContent>
    <CardFooter class="flex flex-wrap gap-2">
      <Button variant="primary" size="sm" onclick={start}>Take another test</Button>
      <Button variant="outline" size="sm" href={`${BASE}/`}>Course map</Button>
    </CardFooter>
  {/if}
</Card>
