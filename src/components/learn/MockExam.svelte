<script lang="ts">
  import { BASE } from '../../lib/base';
  import { onDestroy, onMount } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import { Button } from '../starwind-svelte/button';
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../starwind-svelte/card';
  import { Checkbox } from '../starwind-svelte/checkbox';
  import { Textarea } from '../starwind-svelte/textarea';
  import Icon from '../Icon.svelte';
  import MasteryBadge from './MasteryBadge.svelte';
  import { awarded, buildMockExam, clock, marksOf, tally, type BankItem } from '../../lib/exam';
  import type { WrittenQuestion } from '../../lib/questions';
  import { completeTest, loadProgress, progress, recordAnswer, type LevelChange } from '../../lib/progress';

  interface UnitInfo {
    id: number;
    title: string;
    lessons: { id: string; title: string }[];
  }
  let { units, pool, totalMarks = 40 }: { units: UnitInfo[]; pool: BankItem[]; totalMarks?: number } = $props();

  onMount(loadProgress);

  const DURATIONS = [
    { minutes: 60, label: '60 minutes' },
    { minutes: 90, label: '90 minutes' },
    { minutes: 0, label: 'Untimed' },
  ];

  let stage = $state<'intro' | 'write' | 'mark' | 'done'>('intro');
  let minutes = $state(90);
  let paper = $state<BankItem[]>([]);
  let answers = $state<string[]>([]);
  let ticks = $state<boolean[][]>([]);
  let left = $state(0);
  let timeUp = $state(false);
  let changes = $state<LevelChange[]>([]);
  let timer: ReturnType<typeof setInterval> | undefined;

  const previous = $derived($progress.tests.mock);
  const q = (i: number) => paper[i].q as WrittenQuestion;
  const paperMarks = $derived(marksOf(paper));
  const got = $derived(paper.map((_, i) => awarded(q(i).marks, (ticks[i] ?? []).filter(Boolean).length, q(i).points.length)));
  const earned = $derived(got.reduce((a, b) => a + b, 0));
  const written = $derived(answers.filter((a) => a.trim()).length);
  const lessonTitle = (id: string) => units.flatMap((u) => u.lessons).find((l) => l.id === id)?.title ?? id;
  const unitOf = (id: string) => units.find((u) => u.lessons.some((l) => l.id === id))!;

  const byUnit = $derived(
    units
      .map((u) => {
        const idx = paper.map((x, i) => (unitOf(x.lessonId).id === u.id ? i : -1)).filter((i) => i >= 0);
        return { unit: u, earned: idx.reduce((s, i) => s + got[i], 0), total: idx.reduce((s, i) => s + q(i).marks, 0) };
      })
      .filter((x) => x.total > 0),
  );

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = undefined;
  }
  onDestroy(stopTimer);

  function start() {
    paper = buildMockExam(pool, units.map((u) => u.lessons.map((l) => l.id)), Date.now() % 2147483647, totalMarks);
    answers = paper.map(() => '');
    ticks = paper.map((x) => (x.q as WrittenQuestion).points.map(() => false));
    timeUp = false;
    changes = [];
    stopTimer();
    if (minutes > 0) {
      const end = Date.now() + minutes * 60_000;
      left = minutes * 60;
      timer = setInterval(() => {
        left = Math.round((end - Date.now()) / 1000);
        if (left <= 0) {
          left = 0;
          timeUp = true;
          stopTimer();
        }
      }, 1000);
    }
    stage = 'write';
    scrollTo({ top: 0 });
  }

  function handIn() {
    stopTimer();
    stage = 'mark';
    scrollTo({ top: 0 });
  }

  function finish() {
    const fractions = paper.map((_, i) => got[i] / q(i).marks);
    paper.forEach((x, i) => recordAnswer(x.q.id, fractions[i], q(i).marks * 5));
    changes = completeTest('mock', tally(paper, fractions, true));
    stage = 'done';
    scrollTo({ top: 0 });
  }
</script>

{#if stage === 'intro'}
  <Card class="ring-primary ring-2">
    <CardHeader>
      <Badge tone="primary" appearance="soft" size="sm" eyebrow class="w-fit"><Icon name="pencil" class="size-3" />Mock exam</Badge>
      <CardTitle class="text-2xl">A {totalMarks}-mark written paper</CardTitle>
      <CardDescription>
        Short written answers drawn from every unit, in the style of the course’s past papers: explain, justify, compare, and work a numerical
        example. A new paper is put together each time, and past-paper questions are used first.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ol class="text-muted-foreground grid list-decimal gap-1.5 pl-5 text-sm">
        <li><span class="text-foreground font-medium">Write.</span> Answer every question as you would on paper. Nothing is revealed while you write.</li>
        <li><span class="text-foreground font-medium">Mark.</span> Hand in, then mark each answer against its model answer and marking points.</li>
        <li><span class="text-foreground font-medium">Review.</span> See your marks by unit, and which lessons moved up or down.</li>
      </ol>
      <fieldset class="mt-5">
        <legend class="text-sm font-medium">Time allowed</legend>
        <div class="mt-2 flex flex-wrap gap-1.5">
          {#each DURATIONS as d}
            <Button variant={minutes === d.minutes ? 'primary' : 'outline'} size="sm" aria-pressed={minutes === d.minutes} onclick={() => (minutes = d.minutes)}>{d.label}</Button>
          {/each}
        </div>
      </fieldset>
    </CardContent>
    <CardFooter class="flex flex-wrap items-center gap-4">
      <Button variant="primary" onclick={start}>Start the exam</Button>
      {#if previous}
        <span class="text-muted-foreground text-sm">Best so far {Math.round(previous.best * 100)}% · {previous.attempts} attempt{previous.attempts === 1 ? '' : 's'}</span>
      {/if}
    </CardFooter>
  </Card>
{:else if stage === 'write'}
  <div class="bg-background/95 sticky top-14 z-30 -mx-4 flex flex-wrap items-center gap-3 border-b px-4 py-2.5 backdrop-blur">
    <span class="text-sm font-medium">{paperMarks} marks · {paper.length} questions</span>
    <span class="text-muted-foreground text-sm">{written} answered</span>
    <span class="ml-auto flex items-center gap-3">
      {#if minutes > 0}
        <span class="flex items-center gap-1.5 font-mono text-sm tabular-nums {timeUp || left < 300 ? 'text-error font-medium' : ''}" role="timer" aria-label="Time remaining">
          <Icon name="clock" class="size-4" />{clock(left)}
        </span>
      {/if}
      <Button variant="primary" size="sm" onclick={handIn}>Hand in</Button>
    </span>
  </div>

  {#if timeUp}
    <p class="border-error bg-error/10 mt-4 rounded-md border px-3 py-2 text-sm" role="alert">
      <span class="font-medium">Time is up.</span> In an exam you would stop writing now. Hand in to mark what you have.
    </p>
  {/if}

  <ol class="mt-6 grid gap-5">
    {#each paper as item, i}
      <li>
        <Card size="sm" class="text-base">
          <CardContent>
            <div class="flex flex-wrap items-center gap-2">
              <Badge tone="primary" appearance="soft" size="sm" eyebrow>Question {i + 1}</Badge>
              <Badge variant="outline" size="sm">{q(i).marks} marks</Badge>
              {#if item.q.pastPaper}<Badge variant="outline" size="sm">{item.q.source ?? 'From a past quiz'}</Badge>{/if}
              <span class="text-muted-foreground ml-auto text-xs">Unit {unitOf(item.lessonId).id}</span>
            </div>
            <p class="mt-3 leading-relaxed font-medium">{@html item.q.prompt}</p>
            <Textarea class="mt-3 min-h-32" placeholder="Your answer" aria-label={`Your answer to question ${i + 1}`} bind:value={answers[i]} />
          </CardContent>
        </Card>
      </li>
    {/each}
  </ol>
  <div class="mt-6"><Button variant="primary" onclick={handIn}>Hand in and start marking</Button></div>
{:else if stage === 'mark'}
  <div class="bg-background/95 sticky top-14 z-30 -mx-4 flex flex-wrap items-center gap-3 border-b px-4 py-2.5 backdrop-blur">
    <span class="text-sm font-medium">Marking</span>
    <span class="font-mono text-sm tabular-nums" role="status">{earned} / {paperMarks}</span>
    <Button variant="primary" size="sm" class="ml-auto" onclick={finish}>Finish marking</Button>
  </div>
  <p class="text-muted-foreground mt-4 text-sm">
    Compare each answer with the model answer and tick the marking points you actually made. Mark as an examiner would: a point counts only
    if it is on the page.
  </p>

  <ol class="mt-4 grid gap-5">
    {#each paper as item, i}
      <li>
        <Card size="sm" class="text-base">
          <CardContent>
            <div class="flex flex-wrap items-center gap-2">
              <Badge tone="primary" appearance="soft" size="sm" eyebrow>Question {i + 1}</Badge>
              <Badge variant="outline" size="sm">{got[i]} / {q(i).marks} marks</Badge>
              <a class="text-muted-foreground ml-auto text-xs underline underline-offset-2" href={`${BASE}/learn/${item.lessonId}`}>{lessonTitle(item.lessonId)}</a>
            </div>
            <p class="mt-3 leading-relaxed font-medium">{@html item.q.prompt}</p>

            <p class="text-muted-foreground mt-4 text-xs font-medium tracking-wider uppercase">Your answer</p>
            <p class="mt-1 text-sm whitespace-pre-wrap {answers[i].trim() ? '' : 'text-muted-foreground italic'}">{answers[i].trim() || 'No answer written.'}</p>

            <div class="bg-muted/50 mt-4 rounded-lg border p-4">
              <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Model answer</p>
              <div class="mt-1 text-sm leading-relaxed [&_b]:font-semibold">{@html q(i).modelAnswer}</div>
              <p class="text-muted-foreground mt-4 text-xs font-medium tracking-wider uppercase">Tick each point your answer made</p>
              <div class="mt-2 grid gap-2">
                {#each q(i).points as pt, k}
                  <Checkbox id={`mock-${i}-${k}`} size="sm" variant="primary" label={pt} bind:checked={ticks[i][k]} />
                {/each}
              </div>
            </div>
          </CardContent>
        </Card>
      </li>
    {/each}
  </ol>
  <div class="mt-6"><Button variant="primary" onclick={finish}>Finish marking</Button></div>
{:else}
  <Card class="ring-primary ring-2">
    <CardHeader>
      <Badge tone="primary" appearance="soft" size="sm" eyebrow class="w-fit">Mock exam complete</Badge>
      <CardTitle class="text-4xl font-semibold tabular-nums">{earned} / {paperMarks}</CardTitle>
      <CardDescription>
        {Math.round((earned / paperMarks) * 100)}%.
        {#if earned / paperMarks >= 0.8}
          An excellent paper.
        {:else if earned / paperMarks >= 0.5}
          A pass with room to grow. Look at where the marks were lost below.
        {:else}
          The model answers you have just read are the best revision there is. Rework the weakest unit, then sit another paper.
        {/if}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Marks by unit</p>
      <ul class="mt-2 grid gap-2">
        {#each byUnit as u}
          <li class="grid gap-1 text-sm">
            <div class="flex justify-between gap-2"><span>Unit {u.unit.id}: {u.unit.title}</span><span class="font-mono tabular-nums">{u.earned} / {u.total}</span></div>
            <div class="bg-muted h-2 overflow-hidden rounded-full"><div class="bg-primary h-full" style:width={`${(u.earned / u.total) * 100}%`}></div></div>
          </li>
        {/each}
      </ul>

      <p class="text-muted-foreground mt-6 text-xs font-medium tracking-wider uppercase">Lessons examined</p>
      <ul class="mt-2 grid gap-2">
        {#each changes as c}
          <li class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-sm">
            <a class="font-medium underline-offset-2 hover:underline" href={`${BASE}/learn/${c.lessonId}`}>{lessonTitle(c.lessonId)}</a>
            <span class="ml-auto flex items-center gap-2">
              {#if c.after !== c.before}
                <MasteryBadge level={c.before} />
                <Icon name="arrowRight" class="text-muted-foreground size-3.5" />
              {/if}
              <MasteryBadge level={c.after} />
            </span>
          </li>
        {/each}
      </ul>
    </CardContent>
    <CardFooter class="flex flex-wrap gap-2">
      <Button variant="primary" size="sm" onclick={() => (stage = 'intro')}>Sit another paper</Button>
      <Button variant="outline" size="sm" onclick={() => (stage = 'mark')}>Look at my answers again</Button>
      <Button variant="outline" size="sm" href={`${BASE}/review`}>Review weak spots</Button>
    </CardFooter>
  </Card>
{/if}
