<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { fairQueue, roundRobin, shares, type Served } from '../../lib/sim/routing';

  const BUDGET = 12000; // bytes of link capacity to share out
  let bigSize = $state(1500);
  let smallSize = $state(500);

  // Flow 0 is a bulk transfer with a deep backlog; flows 1 and 2 use small packets.
  const flows = $derived([Array(40).fill(bigSize), Array(60).fill(smallSize), Array(60).fill(smallSize)]);
  const NAMES = ['Flow 1 · big packets', 'Flow 2 · small packets', 'Flow 3 · small packets'];
  const CLS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3'];

  // FIFO with the bulk flow's packets all at the head of the queue: it hogs the link.
  const fifo = $derived<Served[]>(flows.flatMap((f, flow) => f.map((size: number) => ({ flow, size }))));
  const rows = $derived([
    { name: 'FIFO', rule: 'send in arrival order; here the bulk flow got in first', order: fifo },
    { name: 'Round robin', rule: 'one whole packet from each flow in turn', order: roundRobin(flows) },
    { name: 'Fair queueing', rule: 'order by virtual finish time, as if sending one byte from each flow in turn', order: fairQueue(flows) },
  ].map((r) => ({ ...r, got: shares(r.order, 3, BUDGET) })));
</script>

<VizCard kind="Simulator" title="Three flows, one outgoing line">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Flow 1 packet size" bind:value={bigSize} min={500} max={1500} step={100} suffix=" bytes" />
    <SliderField label="Flows 2 and 3 packet size" bind:value={smallSize} min={100} max={1500} step={100} suffix=" bytes" />
  </div>
  <p class="text-muted-foreground mt-2 text-sm">All three flows always have packets waiting. How are the first {BUDGET.toLocaleString('en-US')} bytes of the line divided?</p>

  <div class="mt-4 grid gap-4">
    {#each rows as r}
      {@const sum = r.got.reduce((a, b) => a + b, 0) || 1}
      <div>
        <p class="text-sm"><span class="font-medium">{r.name}</span> <span class="text-muted-foreground">· {r.rule}</span></p>
        <div class="mt-1.5 flex h-7 overflow-hidden rounded-md" role="img" aria-label={`${r.name}: ${r.got.map((g, i) => `flow ${i + 1} ${Math.round((g / sum) * 100)} percent`).join(', ')}`}>
          {#each r.got as g, i}
            {#if g > 0}<div class="{CLS[i]} grid place-items-center overflow-hidden font-mono text-xs text-white" style:flex-grow={g}>{Math.round((g / sum) * 100)}%</div>{/if}
          {/each}
        </div>
        <p class="text-muted-foreground mt-1 font-mono text-xs">{r.got.map((g, i) => `flow ${i + 1}: ${g.toLocaleString('en-US')} B`).join(' · ')}</p>
      </div>
    {/each}
  </div>

  <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs">
    {#each NAMES as n, i}<span class="flex items-center gap-1.5"><span class="{CLS[i]} size-2.5 rounded-xs"></span>{n}</span>{/each}
  </div>
  <p class="text-muted-foreground mt-2 text-sm">
    Round robin is fair in packets, not in bytes, so a flow that uses larger packets gets more bandwidth. Fair queueing fixes that. Set both
    sizes equal and the two give the same split.
  </p>
</VizCard>
