<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { parity, rebuild } from '../../lib/sim/disk';

  const WIDTH = 8;
  let data = $state([0b10110100, 0b01100011, 0b11001010]);
  let lost = $state<number | null>(null);

  const p = $derived(parity(data));
  const bits = (v: number) => v.toString(2).padStart(WIDTH, '0').split('');
  const survivors = $derived(lost === null ? data : data.filter((_, i) => i !== lost));
  const recovered = $derived(lost === null ? null : rebuild(survivors, p));

  function flip(disk: number, bit: number) {
    if (lost !== null) return;
    data[disk] ^= 1 << (WIDTH - 1 - bit);
  }
  const BIT = 'grid size-7 place-items-center rounded-sm font-mono text-sm';
</script>

<VizCard kind="Try it" title="Parity is just XOR">
  <div class="grid gap-2">
    {#each data as block, d}
      <div class="flex flex-wrap items-center gap-3">
        <span class="w-16 text-sm font-medium">Disk {d}</span>
        <span class="flex gap-0.5">
          {#each bits(block) as b, i}
            <button
              type="button"
              class="{BIT} outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {lost === d ? 'text-muted-foreground border border-dashed' : 'bg-chart-1 text-white'}"
              disabled={lost !== null}
              aria-label={`Disk ${d}, bit ${i}: ${b}. Press to flip`}
              onclick={() => flip(d, i)}>{lost === d ? '?' : b}</button
            >
          {/each}
        </span>
        <Button variant={lost === d ? 'primary' : 'outline'} size="sm" class="h-7 px-2.5 text-xs" onclick={() => (lost = lost === d ? null : d)}>
          {lost === d ? 'Repair' : 'Fail this disk'}
        </Button>
      </div>
    {/each}
    <div class="flex flex-wrap items-center gap-3 border-t pt-2">
      <span class="w-16 text-sm font-medium">Parity</span>
      <span class="flex gap-0.5">
        {#each bits(p) as b}<span class="{BIT} bg-chart-4 font-medium text-white">{b}</span>{/each}
      </span>
      <span class="text-muted-foreground text-sm">XOR of the three data blocks</span>
    </div>
    {#if recovered !== null}
      <div class="flex flex-wrap items-center gap-3">
        <span class="w-16 text-sm font-medium">Rebuilt</span>
        <span class="flex gap-0.5">
          {#each bits(recovered) as b}<span class="{BIT} border-success bg-success/15 border font-medium">{b}</span>{/each}
        </span>
        <span class="text-muted-foreground text-sm">XOR of the two surviving disks and the parity</span>
      </div>
    {/if}
  </div>

  <p class="mt-4 text-sm" role="status">
    {#if lost === null}
      Click any data bit to flip it and watch the parity bit below it change. Each parity bit is 1 when its column holds an odd number of 1s.
    {:else}
      Disk {lost} is gone, yet every one of its bits can be worked out: in each column, the missing bit is whatever makes the count of 1s come out
      right. That is all a parity-based RAID does during a rebuild.
    {/if}
  </p>
</VizCard>
