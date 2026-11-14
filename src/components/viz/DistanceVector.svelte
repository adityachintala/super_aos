<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { dvUpdate } from '../../lib/sim/routing';

  interface Example {
    label: string;
    self: string;
    dests: string[];
    links: Record<string, number>;
    vectors: Record<string, number[]>;
  }
  const EXAMPLES: Example[] = [
    {
      label: 'Router C, six nodes',
      self: 'C',
      dests: 'ABCDEF'.split(''),
      links: { B: 6, D: 3, E: 5 },
      vectors: { B: [5, 0, 8, 12, 6, 2], D: [16, 12, 6, 0, 9, 10], E: [7, 6, 3, 9, 0, 4] },
    },
    {
      label: 'Router J, twelve nodes',
      self: 'J',
      dests: 'ABCDEFGHIJKL'.split(''),
      links: { A: 8, I: 10, H: 12, K: 6 },
      vectors: {
        A: [0, 12, 25, 40, 14, 23, 18, 17, 21, 9, 24, 29],
        I: [24, 36, 18, 27, 7, 20, 31, 20, 0, 11, 22, 33],
        H: [20, 31, 19, 8, 30, 19, 6, 0, 14, 7, 22, 9],
        K: [21, 28, 36, 24, 22, 40, 31, 19, 22, 10, 0, 9],
      },
    },
  ];

  let which = $state(0);
  let shown = $state(0);
  const ex = $derived(EXAMPLES[which]);
  const rows = $derived(dvUpdate(ex.self, ex.dests, ex.links, ex.vectors));
  const neighbours = $derived(Object.keys(ex.links));
  const current = $derived(shown > 0 ? rows[shown - 1] : null);

  function pick(i: number) {
    which = i;
    shown = 0;
  }
</script>

<VizCard kind="Simulator" title="A router rebuilds its table from its neighbours' vectors">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Example">
    {#each EXAMPLES as e, i}
      <Button variant={i === which ? 'primary' : 'outline'} size="sm" aria-pressed={i === which} onclick={() => pick(i)}>{e.label}</Button>
    {/each}
  </div>
  <p class="text-muted-foreground mt-3 text-sm">
    Router <span class="text-foreground font-mono font-medium">{ex.self}</span> has measured the delay to each neighbour:
    {#each neighbours as n, i}<span class="text-foreground font-mono">{i > 0 ? ', ' : ''}{ex.self}{n} = {ex.links[n]}</span>{/each}. Each neighbour
    has just sent its vector of delays to every destination.
  </p>

  <div class="mt-4 overflow-x-auto">
    <table class="w-full border-separate border-spacing-1 text-center font-mono text-sm" aria-label="Vectors received and the new routing table">
      <thead>
        <tr class="font-sans text-xs">
          <th class="text-muted-foreground font-medium">to</th>
          {#each neighbours as n}<th class="text-muted-foreground font-medium">from {n}<br /><span class="font-normal">+{ex.links[n]}</span></th>{/each}
          <th class="font-medium">new delay</th>
          <th class="font-medium">line</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as r, i}
          {@const done = i < shown}
          <tr class={i === shown - 1 ? 'font-medium' : ''}>
            <th class="bg-muted rounded-sm px-2 font-medium">{r.dest}</th>
            {#each neighbours as n, k}
              {@const c = r.candidates[k]}
              <td class="rounded-sm border px-2 py-0.5 {done && c && c.via === r.via ? 'border-success bg-success/15' : ''}">
                {#if !c}–{:else if done}{c.advertised}<span class="text-muted-foreground"> → {c.total}</span>{:else}{c.advertised}{/if}
              </td>
            {/each}
            <td class="rounded-sm px-2 py-0.5 {done ? 'bg-primary text-primary-foreground' : 'border border-dashed'}">{done ? r.best : ''}</td>
            <td class="rounded-sm px-2 py-0.5 {done ? 'bg-muted' : 'border border-dashed'}">{done ? (r.via ?? '–') : ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="mt-3 min-h-10 text-sm" role="status">
    {#if !current}
      Work out the first row yourself, then step through. For each destination: add the delay to a neighbour to what that neighbour claims, and take
      the smallest total.
    {:else if current.via === null}
      Destination {current.dest} is this router itself: delay 0, no outgoing line.
    {:else}
      To reach <span class="font-mono font-medium">{current.dest}</span>:
      {#each current.candidates as c, i}<span class="font-mono">{i > 0 ? ', ' : ''}via {c.via} = {c.linkCost} + {c.advertised} = {c.total}</span>{/each}.
      The best is <span class="font-mono font-medium">{current.best}</span>, so packets for {current.dest} go out on the line to {current.via}.
    {/if}
  </p>

  <div class="mt-3 flex flex-wrap gap-2">
    <Button variant="primary" size="sm" disabled={shown >= rows.length} onclick={() => (shown += 1)}>{shown >= rows.length ? 'Table complete' : `Compute row ${ex.dests[shown]}`}</Button>
    <Button variant="outline" size="sm" disabled={shown >= rows.length} onclick={() => (shown = rows.length)}>Fill in all</Button>
    <Button variant="ghost" size="sm" disabled={shown === 0} onclick={() => (shown = 0)}>Reset</Button>
  </div>
</VizCard>
