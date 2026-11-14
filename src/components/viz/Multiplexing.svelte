<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';

  let mode = $state<'time' | 'space'>('time');
  let users = $state(3);

  const COLORS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];
  const SLICES = 15;
  const slices = $derived(Array.from({ length: SLICES }, (_, i) => i % users));
</script>

<VizCard kind="Try it" title="Two ways to share one resource">
  <div class="grid gap-5 sm:grid-cols-[1fr_14rem] sm:items-end">
    <div class="flex flex-wrap gap-1.5" role="group" aria-label="Kind of multiplexing">
      <Button variant={mode === 'time' ? 'primary' : 'outline'} size="sm" aria-pressed={mode === 'time'} onclick={() => (mode = 'time')}>Time multiplexing</Button>
      <Button variant={mode === 'space' ? 'primary' : 'outline'} size="sm" aria-pressed={mode === 'space'} onclick={() => (mode = 'space')}>Space multiplexing</Button>
    </div>
    <SliderField label="Virtual computers" bind:value={users} min={1} max={5} />
  </div>

  <div class="mt-5" role="img" aria-label={mode === 'time' ? `One processor, given to each of ${users} processes in turn` : `One memory, divided into ${users} regions held at the same time`}>
    {#if mode === 'time'}
      <p class="mb-1 text-xs font-medium">The processor, over time →</p>
      <div class="flex h-10 gap-0.5">
        {#each slices as u}<div class="grid flex-1 place-items-center rounded-xs text-xs text-white {COLORS[u]}">P{u + 1}</div>{/each}
      </div>
    {:else}
      <p class="mb-1 text-xs font-medium">Main memory, at one instant</p>
      <div class="flex h-10 gap-0.5">
        <div class="bg-muted grid w-[16%] place-items-center rounded-xs text-xs">OS</div>
        {#each Array(users) as _, u}<div class="grid flex-1 place-items-center rounded-xs text-xs text-white {COLORS[u]}">P{u + 1}</div>{/each}
      </div>
    {/if}
  </div>

  <p class="mt-4 text-sm" role="status">
    {#if mode === 'time'}
      <span class="font-medium">Time sharing.</span> A serially reusable resource is scheduled among several users: each has the <em>whole</em> resource, but only for a
      while. Each of the {users} process{users === 1 ? '' : 'es'} gets the processor for about {(100 / users).toFixed(0)}% of the time. Used for the processor and for I/O
      devices such as a printer.
    {:else}
      <span class="font-medium">Space sharing.</span> A resource that can be divided is split up among several users: each has <em>part</em> of the resource, all of the
      time. Used for main memory and for the disk, where each file occupies its own blocks.
    {/if}
  </p>
</VizCard>
