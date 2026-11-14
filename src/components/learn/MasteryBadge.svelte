<script lang="ts">
  import Icon from '../Icon.svelte';
  import { LEVELS, type Level } from '../../lib/mastery';

  let { level = 0, showLabel = true }: { level?: Level; showLabel?: boolean } = $props();
  const name = $derived(LEVELS[level]);
</script>

<span class="inline-flex items-center gap-1.5 text-xs font-medium" title={`Mastery: ${name}`}>
  <span class="flex gap-0.5" aria-hidden="true">
    {#each [1, 2, 3, 4] as i}
      <span class="h-1.5 w-3.5 rounded-full {i <= level ? (level === 4 ? 'bg-success' : 'bg-primary') : 'bg-muted'}"></span>
    {/each}
  </span>
  {#if showLabel}
    <span class={level === 0 ? 'text-muted-foreground' : ''}>{name}</span>
    {#if level === 4}<Icon name="crown" class="size-3.5" />{/if}
  {:else}
    <span class="sr-only">{name}</span>
  {/if}
</span>
