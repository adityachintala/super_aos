<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Input } from '../starwind-svelte/input';
  import { bitStuff, FLAG } from '../../lib/sim/net';

  let text = $state('011011111111111111110010');
  const data = $derived(text.replace(/[^01]/g, '').slice(0, 40));
  const result = $derived(bitStuff(data));
  const BIT = 'grid h-7 w-5 place-items-center rounded-xs font-mono text-xs';
</script>

<VizCard kind="Try it" title="Bit stuffing: keeping the flag unique">
  <label class="grid gap-1.5 text-sm font-medium">
    Data bits to send
    <Input size="sm" class="font-mono" bind:value={text} />
  </label>

  <p class="text-muted-foreground mt-4 mb-1.5 text-xs font-medium tracking-wider uppercase">Frame on the wire</p>
  <div class="flex flex-wrap gap-0.5" role="img" aria-label={`Flag, then ${result.stuffed}, then flag`}>
    {#each FLAG.split('') as b}<span class="{BIT} bg-chart-2 text-white">{b}</span>{/each}
    <span class="w-1"></span>
    {#each result.stuffed.split('') as b, i}
      <span class="{BIT} {result.inserted.includes(i) ? 'bg-chart-5 font-medium text-white' : 'bg-muted'}">{b}</span>
    {/each}
    <span class="w-1"></span>
    {#each FLAG.split('') as b}<span class="{BIT} bg-chart-2 text-white">{b}</span>{/each}
  </div>
  <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-chart-2 size-2.5 rounded-xs"></span>flag 01111110</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-5 size-2.5 rounded-xs"></span>stuffed 0</span>
  </div>

  <p class="mt-3 text-sm" role="status">
    {result.inserted.length === 0 ? 'No run of five 1s, so nothing was stuffed.' : `${result.inserted.length} bit${result.inserted.length === 1 ? ' was' : 's were'} stuffed.`}
    The frame grew from {data.length} to {result.stuffed.length} data bits. The receiver removes any 0 that follows five 1s, so the data comes back
    exactly, and six 1s in a row can only ever mean a flag.
  </p>
</VizCard>
