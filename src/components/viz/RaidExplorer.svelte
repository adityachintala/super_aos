<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { raidInfo, raidSurvives, type RaidLevel } from '../../lib/sim/disk';

  const LEVELS: { id: RaidLevel; label: string }[] = [
    { id: '0', label: 'RAID 0' },
    { id: '1', label: 'RAID 1' },
    { id: '4', label: 'RAID 4' },
    { id: '5', label: 'RAID 5' },
    { id: '6', label: 'RAID 6' },
    { id: '10', label: 'RAID 1+0' },
    { id: '01', label: 'RAID 0+1' },
  ];
  const NOTES: Record<RaidLevel, string> = {
    '0': 'Blocks are spread across all disks for speed. There is no redundancy at all: lose one disk and the array is gone.',
    '1': 'Every block is written to both disks. Reads can come from either one. Half the raw capacity is usable.',
    '4': 'A read touches one data disk, so several reads run in parallel. Every write must also update the single parity disk, which becomes the bottleneck.',
    '5': 'Same idea as RAID 4, but the parity block sits on a different disk in each stripe, so writes are not all queued behind one disk.',
    '6': 'Two independent check blocks per stripe (P and Q), so any two disks can fail. Costs two disks of capacity and more work per write.',
    '10': 'Disks are mirrored in pairs, and data is striped across the pairs. A second failure is fatal only if it hits the partner of the first.',
    '01': 'Two stripe sets, each a full copy. One failed disk takes its whole stripe set offline, so a second failure in the other set is fatal.',
  };

  let level = $state<RaidLevel>('5');
  let failed = $state<number[]>([]);

  const info = $derived(raidInfo(level));
  const alive = $derived(raidSurvives(level, failed));
  const groupOf = (disk: number) => info.groups?.findIndex((g) => g.includes(disk)) ?? -1;

  function pick(l: RaidLevel) {
    level = l;
    failed = [];
  }
  function toggle(disk: number) {
    failed = failed.includes(disk) ? failed.filter((d) => d !== disk) : [...failed, disk];
  }
  /** In 0+1, one dead disk makes its whole stripe set unusable. */
  const setDown = (disk: number) => level === '01' && info.groups!.some((g) => g.includes(disk) && g.some((d) => failed.includes(d)));
</script>

<VizCard kind="Simulator" title="RAID levels: lay out the blocks, then break a disk">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="RAID level">
    {#each LEVELS as l}
      <Button variant={l.id === level ? 'primary' : 'outline'} size="sm" aria-pressed={l.id === level} onclick={() => pick(l.id)}>{l.label}</Button>
    {/each}
  </div>

  <p class="mt-4 font-medium">{info.name}</p>
  <p class="text-muted-foreground mt-1 text-sm">{NOTES[level]}</p>

  <div class="mt-4 flex flex-wrap gap-2">
    {#each Array(info.disks) as _, disk}
      {@const dead = failed.includes(disk)}
      {@const idle = !dead && setDown(disk)}
      <button
        type="button"
        class="grid w-18 gap-1 rounded-lg border p-1.5 text-center outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {dead
          ? 'border-error bg-error/10'
          : 'hover:bg-muted'} {groupOf(disk) === 1 ? 'ml-3' : ''}"
        aria-pressed={dead}
        aria-label={`Disk ${disk}${dead ? ', failed. Press to repair' : '. Press to fail it'}`}
        onclick={() => toggle(disk)}
      >
        <span class="text-xs font-medium">Disk {disk}</span>
        {#each info.rows as row}
          {@const cell = row[disk]}
          <span
            class="rounded-sm py-1 font-mono text-xs {dead
              ? 'text-muted-foreground line-through'
              : cell.kind === 'parity'
                ? 'bg-chart-4 font-medium text-white'
                : cell.kind === 'mirror'
                  ? 'bg-chart-2 text-white'
                  : 'bg-chart-1 text-white'} {idle ? 'opacity-40' : ''}">{cell.label}</span
          >
        {/each}
        <span class="text-muted-foreground text-[0.7rem]">{dead ? 'failed' : idle ? 'set offline' : 'click to fail'}</span>
      </button>
    {/each}
  </div>

  <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-chart-1 size-2.5 rounded-xs"></span>data</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-2 size-2.5 rounded-xs"></span>mirror copy</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-4 size-2.5 rounded-xs"></span>parity</span>
  </div>

  <p class="mt-4 text-sm" role="status">
    {#if failed.length === 0}
      <span class="font-medium">All disks healthy.</span> Click a disk to simulate a failure.
    {:else if alive}
      <span class="border-success bg-success/10 rounded-sm border px-1.5 py-0.5 font-medium">Data intact</span>
      {failed.length} disk{failed.length === 1 ? '' : 's'} down.
      {#if level === '1' || level === '10' || level === '01'}Reads are served from the surviving copy.{:else}Missing blocks are recomputed from the
        surviving blocks and parity on every read, so the array runs slower until the disk is rebuilt.{/if}
    {:else}
      <span class="border-error bg-error/10 rounded-sm border px-1.5 py-0.5 font-medium">Data lost</span>
      This combination of failures is more than {info.name.split(' ·')[0]} can cover.
    {/if}
  </p>

  <dl class="mt-4 grid gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-3">
    <div>
      <dt class="text-muted-foreground">Usable capacity</dt>
      <dd class="font-mono">{Math.round(info.usable * 100)}% of {info.disks} disks</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Guaranteed to survive</dt>
      <dd class="font-mono">{info.tolerates === 0 ? 'no failures' : `any ${info.tolerates} failure${info.tolerates === 1 ? '' : 's'}`}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Disks failed now</dt>
      <dd class="font-mono">{failed.length} of {info.disks}</dd>
    </div>
  </dl>
</VizCard>
