<script lang="ts">
  // A generic "walk through it" widget: a numbered list of steps revealed one at a time.
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import Icon from '../Icon.svelte';

  interface StepItem {
    title: string;
    detail: string;
    /** Who is acting in this step, shown as a small tag (for example "Hardware" or "OS"). */
    actor?: string;
  }
  let { title, steps }: { title: string; steps: StepItem[] } = $props();

  let at = $state(0);
</script>

<VizCard kind="Try it" {title}>
  <ol class="grid gap-2">
    {#each steps as s, i}
      <li
        class="flex gap-3 rounded-md border px-3 py-2.5 transition-colors {i === at ? 'border-primary bg-primary/7' : i < at ? '' : 'border-dashed opacity-50'}"
        aria-current={i === at ? 'step' : undefined}
      >
        <span
          class="grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium tabular-nums {i < at
            ? 'bg-success text-success-foreground'
            : i === at
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'}"
        >
          {#if i < at}<Icon name="check" class="size-3.5" />{:else}{i + 1}{/if}
        </span>
        <span class="grid gap-0.5">
          <span class="flex flex-wrap items-center gap-2 font-medium">
            {s.title}
            {#if s.actor}<span class="text-muted-foreground rounded-full border px-2 text-xs font-normal">{s.actor}</span>{/if}
          </span>
          {#if i <= at}<span class="text-muted-foreground text-sm">{s.detail}</span>{/if}
        </span>
      </li>
    {/each}
  </ol>
  <div class="mt-4 flex flex-wrap items-center gap-2">
    <Button variant="primary" size="sm" disabled={at >= steps.length - 1} onclick={() => (at += 1)}>Next step<Icon name="arrowRight" /></Button>
    <Button variant="outline" size="sm" disabled={at === 0} onclick={() => (at -= 1)}><Icon name="arrowLeft" />Back</Button>
    <Button variant="ghost" size="sm" disabled={at === 0} onclick={() => (at = 0)}>Restart</Button>
    <span class="text-muted-foreground ml-auto text-sm tabular-nums">Step {at + 1} of {steps.length}</span>
  </div>
</VizCard>
