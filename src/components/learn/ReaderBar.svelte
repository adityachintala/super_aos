<script lang="ts">
  // The study bar above a lesson: where you are, how you want to read, and a focus timer.
  import { onDestroy, onMount } from 'svelte';
  import Icon from '../Icon.svelte';
  import Doodle from '../Doodle.svelte';
  import { clock } from '../../lib/exam';
  import { loadProgress, progress } from '../../lib/progress';
  import { go, initReader, reader, setMode, setSize } from '../../lib/reader';

  let { lessonId }: { lessonId: string } = $props();

  onMount(() => {
    loadProgress();
    initReader(lessonId);
  });

  const read = $derived($progress.sections[lessonId] ?? []);
  const here = $derived($reader.bites[$reader.current]);
  const left = $derived($reader.bites.slice($reader.current).reduce((a, b) => a + b.minutes, 0));

  // ----- focus timer -----
  const LENGTHS = [10, 15, 25];
  let choosing = $state(false);
  let seconds = $state(0);
  let running = $state(false);
  let breakTime = $state(false);
  let ticker: ReturnType<typeof setInterval> | undefined;

  function stop() {
    if (ticker) clearInterval(ticker);
    ticker = undefined;
    running = false;
  }
  function start(minutes: number) {
    stop();
    choosing = false;
    breakTime = false;
    const end = Date.now() + minutes * 60_000;
    seconds = minutes * 60;
    running = true;
    ticker = setInterval(() => {
      seconds = Math.round((end - Date.now()) / 1000);
      if (seconds <= 0) {
        stop();
        breakTime = true;
      }
    }, 1000);
  }
  onDestroy(stop);

  const PILL = 'rounded-full border px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-outline/50';
  const on = 'border-primary bg-primary text-primary-foreground';
  const off = 'bg-card hover:bg-muted';
</script>

{#if $reader.ready}
  <div class="bg-card z-30 mt-6 rounded-3xl border px-3 py-2.5 shadow-sm backdrop-blur sm:sticky sm:top-16 sm:px-4">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div class="flex flex-wrap gap-1" role="group" aria-label="How to read this lesson">
        <button type="button" class="{PILL} {$reader.mode === 'steps' ? on : off}" aria-pressed={$reader.mode === 'steps'} onclick={() => setMode('steps')}>One bite at a time</button>
        <button type="button" class="{PILL} {$reader.mode === 'all' ? on : off}" aria-pressed={$reader.mode === 'all'} onclick={() => setMode('all')}>Whole page</button>
      </div>

      <div class="ml-auto flex flex-wrap items-center gap-1">
        <button
          type="button"
          class="{PILL} {$reader.size === 'large' ? on : off}"
          aria-pressed={$reader.size === 'large'}
          title="Bigger text"
          onclick={() => setSize($reader.size === 'large' ? 'normal' : 'large')}
        >
          <span class="text-xs">A</span><span class="text-base leading-none">A</span><span class="sr-only"> Bigger text</span>
        </button>

        {#if running}
          <button type="button" class="{PILL} {on} flex items-center gap-1.5 font-mono tabular-nums" title="Stop the focus timer" onclick={stop}>
            <Icon name="clock" class="size-4" /><span role="timer" aria-label="Focus time remaining">{clock(seconds)}</span><span class="sr-only"> Stop</span>
          </button>
        {:else}
          <button type="button" class="{PILL} {choosing ? on : off} flex items-center gap-1.5" aria-expanded={choosing} onclick={() => (choosing = !choosing)}>
            <Icon name="clock" class="size-4" />Focus timer
          </button>
        {/if}
      </div>
    </div>

    {#if choosing}
      <div class="mt-2 flex flex-wrap items-center gap-1.5 border-t pt-2 text-sm">
        <span class="text-muted-foreground">Study for</span>
        {#each LENGTHS as m}
          <button type="button" class="{PILL} {off}" onclick={() => start(m)}>{m} min</button>
        {/each}
        <span class="text-muted-foreground">then take a short break. Short sprints beat long slogs.</span>
      </div>
    {/if}

    <div class="mt-2 flex items-center gap-3 border-t pt-2">
      <ol class="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto py-0.5" aria-label="Sections of this lesson">
        {#each $reader.bites as b, i}
          {@const done = read.includes(i)}
          {@const now = i === $reader.current}
          <li class="shrink-0">
            <button
              type="button"
              class="grid size-7 place-items-center rounded-full border text-xs font-semibold tabular-nums outline-none transition-colors focus-visible:ring-3 focus-visible:ring-outline/50
                {now ? 'border-primary bg-primary text-primary-foreground' : done ? 'border-success bg-success text-success-foreground' : b.optional ? 'bg-card hover:bg-muted border-dashed' : 'bg-card hover:bg-muted'}"
              aria-current={now ? 'step' : undefined}
              aria-label={`Section ${i + 1}: ${b.title}${done ? ' (read)' : ''}${b.optional ? ' (optional)' : ''}`}
              title={b.title}
              onclick={() => go(i)}
            >
              {#if done && !now}<Icon name="check" class="size-3.5" />{:else}{i + 1}{/if}
            </button>
          </li>
        {/each}
      </ol>
      <p class="text-muted-foreground hidden shrink-0 text-sm sm:block" role="status">
        <span class="text-foreground font-medium">{read.length}</span> of {$reader.bites.length} read · about {left} min left
      </p>
    </div>
    <p class="mt-1 truncate text-sm sm:hidden"><span class="text-muted-foreground">{$reader.current + 1} of {$reader.bites.length}:</span> {here?.title}</p>
  </div>
{/if}

{#if breakTime}
  <div class="stickynote fixed! right-4 bottom-4 z-50 w-72 max-w-[calc(100vw-2rem)] px-5 pt-6 pb-4" style="--note: var(--note-orange); --tilt: 1.5deg" role="alert">
    <p class="flex items-center gap-2"><Doodle name="coffee" class="size-10 shrink-0" /><span class="hand text-3xl">Break time!</span></p>
    <p class="mt-1">Stand up, stretch, drink some water. Two minutes away from the screen, then come back.</p>
    <div class="mt-3 flex flex-wrap gap-1.5">
      {#each LENGTHS as m}
        <button type="button" class="rounded-full border border-current px-3 py-1 text-sm font-medium" onclick={() => start(m)}>{m} more min</button>
      {/each}
      <button type="button" class="rounded-full px-3 py-1 text-sm font-medium underline" onclick={() => (breakTime = false)}>Close</button>
    </div>
  </div>
{/if}
