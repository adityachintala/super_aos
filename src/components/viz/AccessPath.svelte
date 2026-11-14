<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { accessPath, type Operation, type Structure } from '../../lib/sim/fs';

  const OPS: { id: Operation; label: string; call: string }[] = [
    { id: 'open', label: 'Open', call: 'open("/foo/bar", O_RDONLY)' },
    { id: 'read', label: 'Read a block', call: 'read(fd, buffer, 4096)' },
    { id: 'create', label: 'Create', call: 'open("/foo/bar", O_CREAT)' },
    { id: 'write', label: 'Write a new block', call: 'write(fd, buffer, 4096)' },
  ];
  const COLS: { id: Structure; top: string; bottom: string }[] = [
    { id: 'dbitmap', top: 'data', bottom: 'bitmap' },
    { id: 'ibitmap', top: 'inode', bottom: 'bitmap' },
    { id: 'rootInode', top: 'root', bottom: 'inode' },
    { id: 'fooInode', top: 'foo', bottom: 'inode' },
    { id: 'barInode', top: 'bar', bottom: 'inode' },
    { id: 'rootData', top: 'root', bottom: 'data' },
    { id: 'fooData', top: 'foo', bottom: 'data' },
    { id: 'barData', top: 'bar', bottom: 'data' },
  ];

  let op = $state<Operation>('open');
  let shown = $state(0);

  const path = $derived(accessPath(op));
  const call = $derived(OPS.find((o) => o.id === op)!.call);
  const reads = $derived(path.slice(0, shown).filter((i) => i.action === 'read').length);
  const writes = $derived(path.slice(0, shown).filter((i) => i.action === 'write').length);

  function pick(o: Operation) {
    op = o;
    shown = 0;
  }
</script>

<VizCard kind="Simulator" title="Count the disk I/Os behind one system call">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Operation">
    {#each OPS as o}
      <Button variant={o.id === op ? 'primary' : 'outline'} size="sm" aria-pressed={o.id === op} onclick={() => pick(o.id)}>{o.label}</Button>
    {/each}
  </div>
  <p class="mt-3 font-mono text-sm">{call}</p>

  <div class="mt-4 overflow-x-auto">
    <table class="w-full min-w-136 border-separate border-spacing-1 text-center text-xs" aria-label="Which on-disk structure each I/O touches, in time order">
      <thead>
        <tr>
          <th class="w-8"></th>
          {#each COLS as c}
            <th class="text-muted-foreground font-medium">{c.top}<br />{c.bottom}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each path as io, i}
          <tr class={i < shown ? '' : 'opacity-25'}>
            <th class="text-muted-foreground font-mono font-normal">{i + 1}</th>
            {#each COLS as c}
              <td class="h-7 rounded-sm {c.id === io.on && i < shown ? (io.action === 'read' ? 'bg-chart-2 font-medium text-white' : 'bg-chart-4 font-medium text-white') : 'border border-dashed'} {i === shown - 1 && c.id === io.on ? 'ring-foreground ring-2' : ''}">
                {c.id === io.on && i < shown ? io.action : ''}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="mt-3 min-h-10 text-sm" role="status">
    {#if shown === 0}
      Nothing is cached. Step through to see each I/O in order; time runs downwards.
    {:else}
      <span class="font-medium">{shown}. {path[shown - 1].action === 'read' ? 'Read' : 'Write'}.</span> {path[shown - 1].why}
    {/if}
  </p>

  <div class="mt-3 flex flex-wrap items-center gap-2">
    <Button variant="primary" size="sm" disabled={shown >= path.length} onclick={() => (shown += 1)}>{shown >= path.length ? 'Done' : 'Next I/O'}</Button>
    <Button variant="outline" size="sm" disabled={shown >= path.length} onclick={() => (shown = path.length)}>Show all</Button>
    <Button variant="ghost" size="sm" disabled={shown === 0} onclick={() => (shown = 0)}>Reset</Button>
    <span class="ml-auto text-sm">
      <span class="font-mono font-medium tabular-nums">{reads}</span> reads + <span class="font-mono font-medium tabular-nums">{writes}</span> writes =
      <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-mono font-medium tabular-nums">{reads + writes}</span> I/Os
    </span>
  </div>
</VizCard>
