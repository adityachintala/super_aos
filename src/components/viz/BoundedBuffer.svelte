<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { consume, count, emptyRing, isEmpty, isFull, produce, type Ring } from '../../lib/sim/process';

  const SIZE = 6;
  let ring = $state<Ring>(emptyRing(SIZE));
  let nextItem = $state(1);
  let log = $state('The buffer is empty: in and out point at the same slot.');

  function doProduce() {
    const r = produce(ring, nextItem);
    if (!r) {
      log = `Buffer full: (in + 1) % ${SIZE} == out. The producer must wait, even though one slot looks free.`;
      return;
    }
    log = `Produced item ${nextItem} into slot ${ring.in}; in advances to ${r.in}.`;
    ring = r;
    nextItem += 1;
  }
  function doConsume() {
    const c = consume(ring);
    if (!c) {
      log = 'Buffer empty: in == out. The consumer must wait.';
      return;
    }
    log = `Consumed item ${c.item} from slot ${ring.out}; out advances to ${c.ring.out}.`;
    ring = c.ring;
  }
</script>

<VizCard kind="Simulator" title="A circular buffer shared by a producer and a consumer">
  <div class="flex flex-wrap gap-2">
    <Button variant="primary" size="sm" onclick={doProduce}>Produce an item</Button>
    <Button variant="outline" size="sm" onclick={doConsume}>Consume an item</Button>
    <Button variant="ghost" size="sm" onclick={() => ((ring = emptyRing(SIZE)), (nextItem = 1), (log = 'Reset. The buffer is empty.'))}>Reset</Button>
  </div>

  <div class="mt-5 grid grid-cols-6 gap-1.5" role="img" aria-label={`Buffer slots: ${ring.slots.map((s, i) => `slot ${i} ${s === null ? 'empty' : `holds ${s}`}`).join(', ')}. in is ${ring.in}, out is ${ring.out}.`}>
    {#each ring.slots as s, i}
      <div class="grid gap-1 text-center">
        <span class="text-xs font-medium {i === ring.in ? '' : 'invisible'}">in ↓</span>
        <span class="grid h-12 place-items-center rounded-md border font-mono {s === null ? 'text-muted-foreground border-dashed' : 'bg-chart-1 border-transparent font-medium text-white'}">{s ?? ''}</span>
        <span class="text-muted-foreground font-mono text-xs">{i}</span>
        <span class="text-xs font-medium {i === ring.out ? '' : 'invisible'}">↑ out</span>
      </div>
    {/each}
  </div>

  <p class="mt-3 min-h-10 text-sm" role="status">{log}</p>

  <dl class="mt-2 grid gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-3">
    <div><dt class="text-muted-foreground">Items in buffer</dt><dd class="font-mono">{count(ring)} of at most {SIZE - 1}</dd></div>
    <div><dt class="text-muted-foreground">Empty? (in == out)</dt><dd class="font-mono">{ring.in} == {ring.out} → {isEmpty(ring) ? 'yes' : 'no'}</dd></div>
    <div><dt class="text-muted-foreground">Full? ((in + 1) % {SIZE} == out)</dt><dd class="font-mono">{(ring.in + 1) % SIZE} == {ring.out} → {isFull(ring) ? 'yes' : 'no'}</dd></div>
  </dl>
  <p class="text-muted-foreground mt-3 text-sm">
    With only two pointers, "in == out" has to mean empty, so the buffer can never be allowed to fill completely: a {SIZE}-slot buffer holds at most
    {SIZE - 1} items. Fill it and see.
  </p>
</VizCard>
