<script lang="ts">
  import { onMount } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import { Button } from '../starwind-svelte/button';
  import { Card, CardContent } from '../starwind-svelte/card';
  import { Progress } from '../starwind-svelte/progress';
  import Icon from '../Icon.svelte';
  import MasteryBadge from './MasteryBadge.svelte';
  import { progress, loadProgress } from '../../lib/progress';
  import { units, allLessons, findLesson } from '../../lib/course';

  let { available }: { available: string[] } = $props();
  onMount(loadProgress);

  const levelOf = (id: string) => $progress.lessons[id]?.level ?? 0;
  const points = $derived(allLessons.reduce((a, l) => a + levelOf(l.id), 0));
  const maxPoints = allLessons.length * 4;
  const resume = $derived($progress.lastLesson && available.includes($progress.lastLesson) ? findLesson($progress.lastLesson) : null);
  const firstAvailable = $derived(allLessons.find((l) => available.includes(l.id)));
</script>

<Card>
  <CardContent class="flex flex-col gap-4 sm:flex-row sm:items-center">
    <div class="flex-1">
      <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Course mastery</p>
      <Progress variant="primary" value={points} max={maxPoints} label="Course mastery" class="mt-2" />
      <p class="text-muted-foreground mt-2 text-sm">
        <span class="text-foreground font-medium">{points}</span> of {maxPoints} mastery points · {available.length} of {allLessons.length} lessons published
      </p>
    </div>
    {#if resume}
      <Button variant="primary" href={`/learn/${resume.id}`}>Continue: {resume.title}<Icon name="arrowRight" /></Button>
    {:else if firstAvailable}
      <Button variant="primary" href={`/learn/${firstAvailable.id}`}>Start learning<Icon name="arrowRight" /></Button>
    {/if}
  </CardContent>
</Card>

<nav class="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Practice">
  {#each [
    { href: '/review', icon: 'bolt', title: 'Review', text: 'Flashcards, and the questions you have not yet got right.' },
    { href: '/pyq', icon: 'history', title: 'Past quiz questions', text: 'What has been asked before, with model answers.' },
    { href: '/exam', icon: 'pencil', title: 'Mock exam', text: 'A timed 40-mark written paper across every unit.' },
  ] as const as p}
    <a href={p.href} class="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-outline/50">
      <Card size="sm" class="group-hover:ring-primary h-full transition-shadow group-hover:shadow-md">
        <CardContent class="flex gap-3">
          <span class="bg-primary/10 text-primary-accent grid size-8 shrink-0 place-items-center rounded-md"><Icon name={p.icon} class="size-4.5" /></span>
          <span class="grid gap-0.5">
            <span class="text-base leading-snug font-medium">{p.title}</span>
            <span class="text-muted-foreground">{p.text}</span>
          </span>
        </CardContent>
      </Card>
    </a>
  {/each}
</nav>

{#each units as unit}
  <section class="mt-12">
    <div class="flex items-center gap-3">
      <span class="grid size-10 place-items-center rounded-lg text-white" style:background={unit.color}><Icon name={unit.icon} class="size-5" /></span>
      <div>
        <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Unit {unit.id}</p>
        <h2 class="text-xl font-semibold tracking-tight">{unit.title}</h2>
      </div>
    </div>
    <div class="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p class="text-muted-foreground">{unit.tagline}</p>
      {#if unit.lessons.every((l) => available.includes(l.id))}
        {@const t = $progress.tests[`unit-${unit.id}`]}
        <Button variant="outline" size="sm" href={`/unit/${unit.id}`}>
          <Icon name="target" />Unit test{#if t}<span class="text-muted-foreground tabular-nums">· best {Math.round(t.best * 100)}%</span>{/if}
        </Button>
      {/if}
    </div>

    <ol class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each unit.lessons as lesson, i}
        {@const open = available.includes(lesson.id)}
        <li>
          <svelte:element
            this={open ? 'a' : 'div'}
            href={open ? `/learn/${lesson.id}` : undefined}
            class="group block h-full rounded-xl outline-none {open ? 'focus-visible:ring-outline/50 focus-visible:ring-3' : ''}"
          >
            <Card size="sm" class="h-full transition-shadow {open ? 'group-hover:ring-primary group-hover:shadow-md' : 'bg-transparent opacity-60'}">
              <CardContent class="flex gap-3">
                <span class="bg-muted grid size-7 shrink-0 place-items-center rounded-full text-xs font-medium tabular-nums">{i + 1}</span>
                <span class="grid gap-1">
                  <span class="text-base leading-snug font-medium">{lesson.title}</span>
                  <span class="text-muted-foreground">{lesson.blurb}</span>
                  <span class="mt-2">
                    {#if open}
                      <MasteryBadge level={levelOf(lesson.id)} />
                    {:else}
                      <Badge variant="outline" size="sm">Coming soon</Badge>
                    {/if}
                  </span>
                </span>
              </CardContent>
            </Card>
          </svelte:element>
        </li>
      {/each}
    </ol>
  </section>
{/each}
