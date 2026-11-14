<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { health, liveReplicas, nodeName, placeBlock, rackOf, rawStorageMB, reReplicate, rng, splitFile, type BlockState } from '../../lib/sim/hdfs';

  const T = { racks: 3, nodesPerRack: 3 };
  const NODES = Array.from({ length: T.racks * T.nodesPerRack }, (_, i) => i);
  const REPLICATION = 3;
  const WRITER = 0; // the client runs on the first DataNode

  let fileMB = $state(400);
  let blockText = $state('128');
  let blocks = $state<BlockState[]>([]);
  let dead = $state<number[]>([]);
  let seed = $state(11);
  let log = $state('Choose a file size and write it. The client runs on DataNode R1-N1.');

  const alive = $derived(NODES.filter((n) => !dead.includes(n)));
  const states = $derived(blocks.map((b) => ({ ...b, live: liveReplicas(b, alive), h: health(b, alive, REPLICATION) })));
  const under = $derived(states.filter((b) => b.h === 'under').length);
  const lost = $derived(states.filter((b) => b.h === 'lost').length);
  const color = (id: number) => `var(--chart-${(id % 6) + 1})`;

  function write() {
    const rand = rng(seed);
    seed += 1;
    dead = [];
    blocks = splitFile(fileMB, Number(blockText)).map((sizeMB, id) => ({ id, sizeMB, replicas: placeBlock(WRITER, NODES, T, REPLICATION, rand) }));
    log = `The NameNode split the file into ${blocks.length} block${blocks.length === 1 ? '' : 's'} and chose ${REPLICATION} DataNodes for each. Now click a DataNode to make it fail.`;
  }

  function toggle(node: number) {
    if (blocks.length === 0) return;
    if (dead.includes(node)) {
      dead = dead.filter((n) => n !== node);
      log = `${nodeName(node, T)} is back and registers with the NameNode. Its block report restores those replicas; any block now over-replicated will have a copy removed.`;
    } else {
      dead = [...dead, node];
      log = `${nodeName(node, T)} has stopped sending heartbeats. The NameNode does not act yet: it waits ten minutes before declaring the node dead.`;
    }
  }

  function heal() {
    const before = under;
    blocks = reReplicate(blocks, alive, T, REPLICATION, rng(seed));
    seed += 1;
    log =
      before === 0
        ? 'Nothing to do: every block has its three replicas.'
        : `Heartbeat timeout reached. The NameNode asked surviving DataNodes to copy ${before} under-replicated block${before === 1 ? '' : 's'} to new nodes, keeping replicas on at least two racks.`;
  }
</script>

<VizCard kind="Simulator" title="Write a file, then break the cluster">
  <div class="grid items-end gap-5 sm:grid-cols-[1fr_10rem_auto]">
    <SliderField label="File size" bind:value={fileMB} min={50} max={900} step={50} suffix=" MB" />
    <label class="grid gap-1.5 text-sm font-medium">
      Block size
      <NativeSelect size="sm" class="w-full" bind:value={blockText}>
        <NativeSelectOption value="64">64 MB</NativeSelectOption>
        <NativeSelectOption value="128">128 MB</NativeSelectOption>
        <NativeSelectOption value="256">256 MB</NativeSelectOption>
      </NativeSelect>
    </label>
    <Button variant="primary" size="sm" onclick={write}>Write file to HDFS</Button>
  </div>

  <div class="mt-5 grid gap-3 md:grid-cols-3">
    {#each Array(T.racks) as _, rack}
      <div class="rounded-lg border border-dashed p-2">
        <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">Rack {rack + 1}</p>
        <div class="grid gap-2">
          {#each NODES.filter((n) => rackOf(n, T) === rack) as node}
            {@const down = dead.includes(node)}
            <button
              type="button"
              class="min-h-14 rounded-md border px-2 py-1.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {down ? 'border-error bg-error/10' : 'bg-card hover:bg-muted'}"
              aria-pressed={down}
              aria-label={`DataNode ${nodeName(node, T)}${down ? ', failed. Press to bring it back' : '. Press to fail it'}`}
              onclick={() => toggle(node)}
            >
              <span class="flex items-center justify-between text-xs">
                <span class="font-medium">{nodeName(node, T)}{node === WRITER ? ' · client' : ''}</span>
                <span class="text-muted-foreground">{down ? 'failed' : 'alive'}</span>
              </span>
              <span class="mt-1 flex min-h-5 flex-wrap gap-1">
                {#each blocks.filter((b) => b.replicas.includes(node)) as b}
                  <span class="rounded-xs px-1.5 font-mono text-xs text-white {down ? 'opacity-30' : ''}" style:background={color(b.id)}>B{b.id}</span>
                {/each}
              </span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-4 flex flex-wrap items-center gap-2">
    <Button variant="outline" size="sm" disabled={blocks.length === 0 || dead.length === 0} onclick={heal}>Let ten minutes pass (re-replicate)</Button>
    <span class="ml-auto text-sm">
      {#if blocks.length}
        Raw storage used: <span class="font-mono font-medium">{rawStorageMB(blocks).toLocaleString('en-US')} MB</span> for a {fileMB} MB file
      {/if}
    </span>
  </div>

  <p class="mt-3 min-h-10 text-sm" role="status">
    {#if lost > 0}<span class="border-error bg-error/10 mr-1 rounded-sm border px-1.5 py-0.5 font-medium">{lost} block{lost === 1 ? '' : 's'} lost</span>{/if}
    {#if under > 0}<span class="border-warning bg-warning/10 mr-1 rounded-sm border px-1.5 py-0.5 font-medium">{under} under-replicated</span>{/if}
    {log}
  </p>

  {#if blocks.length}
    <div class="mt-3 border-t pt-4">
      <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">What the NameNode holds in memory: block → DataNodes</p>
      <div class="grid gap-1 font-mono text-xs sm:grid-cols-2">
        {#each states as b}
          <div class="flex items-center gap-2">
            <span class="rounded-xs px-1.5 text-white" style:background={color(b.id)}>B{b.id}</span>
            <span class="text-muted-foreground">{b.sizeMB} MB</span>
            <span class={b.h === 'lost' ? 'line-through' : ''}>{b.live.map((n) => nodeName(n, T)).join(', ') || 'no live replica'}</span>
            {#if b.h !== 'ok'}<span class="font-sans font-medium">({b.h === 'lost' ? 'lost' : `${b.live.length} of ${REPLICATION}`})</span>{/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</VizCard>
