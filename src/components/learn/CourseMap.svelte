<script lang="ts">
  import { BASE } from '../../lib/base';
  import { onMount } from 'svelte';
  import { Button } from '../starwind-svelte/button';
  import { Progress } from '../starwind-svelte/progress';
  import Icon from '../Icon.svelte';
  import Doodle from '../Doodle.svelte';
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
  const started = $derived(Object.keys($progress.sections).length > 0 || points > 0);

  const PRACTICE = [
    { href: `${BASE}/review`, doodle: 'cards', note: 'var(--note-teal)', title: 'Flashcards', text: 'Two minutes of quick recall.' },
    { href: `${BASE}/pyq`, doodle: 'pencil', note: 'var(--note-rose)', title: 'Past quiz questions', text: 'What has been asked before.' },
    { href: `${BASE}/exam`, doodle: 'target', note: 'var(--note-orange)', title: 'Mock exam', text: 'A timed 40-mark paper.' },
  ] as const;
</script>

<section class="bg-card rounded-[28px] border p-6 shadow-sm sm:p-8" aria-label="Your progress">
  <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
    <div class="flex-1">
      <p class="hand text-2xl">{started ? 'Welcome back. Pick up where you left off.' : 'New here? Start with one small bite.'}</p>
      <Progress variant="primary" value={points} max={maxPoints} label="Course mastery" class="mt-3" />
      <p class="text-muted-foreground mt-2 text-sm">
        <span class="text-foreground font-medium">{points}</span> of {maxPoints} mastery points
      </p>
    </div>
    {#if resume}
      <Button variant="primary" size="lg" href={`${BASE}/learn/${resume.id}`}>Continue: {resume.title}<Icon name="arrowRight" /></Button>
    {:else if firstAvailable}
      <Button variant="primary" size="lg" href={`${BASE}/learn/${firstAvailable.id}`}>Start learning<Icon name="arrowRight" /></Button>
    {/if}
  </div>
</section>

<nav class="mt-5 grid gap-4 sm:grid-cols-3" aria-label="Practice">
  {#each PRACTICE as p, i}
    <a
      href={p.href}
      class="panel group flex items-center gap-4 px-5 py-4 outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-outline/50"
      style:--note={p.note}
    >
      <Doodle name={p.doodle} class="size-14 shrink-0 transition-transform group-hover:rotate-6" />
      <span class="grid">
        <span class="text-lg leading-snug font-semibold">{p.title}</span>
        <span class="text-sm opacity-80">{p.text}</span>
      </span>
    </a>
  {/each}
</nav>

{#each units as unit}
  <section class="panel mt-10 p-5 sm:p-8" style:--note={unit.note}>
    <div class="flex flex-wrap items-start gap-x-4 gap-y-3">
      <span class="bg-card text-foreground grid size-12 shrink-0 -rotate-6 place-items-center rounded-2xl text-xl font-bold shadow-sm">{unit.id}</span>
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">{unit.title}</h2>
        <p class="mt-1 opacity-80">{unit.tagline}</p>
      </div>
      {#if unit.lessons.every((l) => available.includes(l.id))}
        {@const t = $progress.tests[`unit-${unit.id}`]}
        <a
          href={`${BASE}/unit/${unit.id}`}
          class="bg-note-ink inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white outline-none focus-visible:ring-3 focus-visible:ring-outline/50"
        >
          <Icon name="target" class="size-4" />Unit test{#if t}<span class="tabular-nums opacity-70">· best {Math.round(t.best * 100)}%</span>{/if}
        </a>
      {/if}
    </div>

    <ol class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each unit.lessons as lesson, i}
        {@const open = available.includes(lesson.id)}
        {@const bites = ($progress.sections[lesson.id] ?? []).length}
        <li>
          <svelte:element
            this={open ? 'a' : 'div'}
            href={open ? `${BASE}/learn/${lesson.id}` : undefined}
            class="bg-card text-card-foreground group flex h-full gap-3 rounded-2xl p-4 outline-none transition-transform {open
              ? 'hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-outline/50'
              : 'opacity-60'}"
          >
            <Doodle name={lesson.doodle} class="size-12 shrink-0 transition-transform group-hover:-rotate-6" />
            <span class="grid content-start gap-1">
              <span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Lesson {i + 1}</span>
              <span class="text-base leading-snug font-semibold">{lesson.title}</span>
              <span class="text-muted-foreground text-sm">{lesson.hook}</span>
              <span class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {#if open}
                  <MasteryBadge level={levelOf(lesson.id)} />
                  {#if bites > 0}<span class="text-muted-foreground text-xs">{bites} bite{bites === 1 ? '' : 's'} read</span>{/if}
                {:else}
                  <span class="text-muted-foreground text-xs">Coming soon</span>
                {/if}
              </span>
            </span>
          </svelte:element>
        </li>
      {/each}
    </ol>
  </section>
{/each}
