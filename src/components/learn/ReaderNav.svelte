<script lang="ts">
  // The footer under the current bite: mark it read and move on.
  import { Button } from '../starwind-svelte/button';
  import Icon from '../Icon.svelte';
  import Doodle from '../Doodle.svelte';
  import { progress, readSection } from '../../lib/progress';
  import { go, reader } from '../../lib/reader';

  let gained = $state(0);

  const n = $derived($reader.bites.length);
  const at = $derived($reader.current);
  const next = $derived($reader.bites[at + 1]);
  const last = $derived(at >= n - 1);
  const read = $derived(($progress.sections[$reader.lessonId] ?? []).length);

  const cheer = $derived.by(() => {
    const f = (at + 1) / n;
    if (at === 0) return 'Good start. One bite down.';
    if (f < 0.4) return 'Nice. Keep the rhythm going.';
    if (f < 0.6) return 'About halfway. You are doing well.';
    if (f < 0.85) return 'More than half done. Keep going.';
    return 'Nearly there. Last stretch.';
  });

  function onward() {
    gained = readSection($reader.lessonId, at);
    go(at + 1);
    if (gained) setTimeout(() => (gained = 0), 2500);
  }
</script>

{#if $reader.ready && $reader.mode === 'steps'}
  <nav class="mt-2 flex flex-wrap items-center gap-3" aria-label="Lesson sections">
    <Button variant="outline" disabled={at === 0} onclick={() => go(at - 1)}><Icon name="arrowLeft" />Back</Button>

    {#if !last}
      <p class="text-muted-foreground flex-1 text-center text-sm" role="status">
        {#if gained}<span class="bg-brand text-note-ink mr-1 rounded-full px-2 py-0.5 font-semibold">+{gained} XP</span>{/if}
        {at > 0 ? cheer : `${n} short sections. Take them one at a time.`}
      </p>
      <Button variant="primary" size="lg" class="max-w-full" onclick={onward}>
        <span class="truncate">Got it. Next: {next.title}</span><Icon name="arrowRight" />
      </Button>
      <p class="text-muted-foreground w-full text-right text-xs">Next bite: about {next.minutes} min{next.optional ? ' · optional' : ''}</p>
    {:else}
      <p class="flex flex-1 items-center justify-end gap-2" role="status">
        <Doodle name="star" class="size-8" />
        <span class="hand text-2xl">That is the whole lesson. {read >= n - 1 ? 'Well done!' : ''}</span>
      </p>
    {/if}
  </nav>
{/if}
