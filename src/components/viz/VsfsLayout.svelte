<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { VSFS, inodesPerBlock, locateInode, regionOf, totalInodes, type Region } from '../../lib/sim/fs';

  const INFO: Record<Region, { name: string; short: string; cls: string; text: string }> = {
    super: {
      name: 'Superblock',
      short: 'S',
      cls: 'bg-chart-5',
      text: 'Describes this particular file system: how many inodes and data blocks it has (80 and 56 here), where the inode table begins (block 3), and a magic number identifying the file-system type. It is read first when the file system is mounted.',
    },
    ibitmap: {
      name: 'Inode bitmap',
      short: 'i',
      cls: 'bg-chart-4',
      text: 'One bit per inode: 0 means free, 1 means in use. A single 4 KB block has 32,768 bits, far more than the 80 inodes need.',
    },
    dbitmap: {
      name: 'Data bitmap',
      short: 'd',
      cls: 'bg-chart-3',
      text: 'One bit per data block: 0 means free, 1 means in use. Consulted whenever a file needs a new block.',
    },
    inodes: {
      name: 'Inode table',
      short: 'I',
      cls: 'bg-chart-2',
      text: 'An array of on-disk inodes. With 256-byte inodes, each 4 KB block holds 16, so five blocks hold 80 inodes: the maximum number of files this file system can have.',
    },
    data: {
      name: 'Data region',
      short: 'D',
      cls: 'bg-chart-1',
      text: 'The blocks that hold user data: file contents and directory contents. 56 of the 64 blocks.',
    },
  };

  let selected = $state<Region>('inodes');
  let inumber = $state(32);

  const loc = $derived(locateInode(inumber));
  const kb = (bytes: number) => `${bytes / 1024} KB`;
</script>

<VizCard kind="Try it" title="A 64-block disk, and where inode n lives">
  <div class="grid grid-cols-8 gap-1 sm:grid-cols-16" role="group" aria-label="The 64 blocks of the disk">
    {#each Array(VSFS.blocks) as _, b}
      {@const r = regionOf(b)}
      <button
        type="button"
        class="{INFO[r].cls} relative grid aspect-square place-items-center rounded-sm font-mono text-xs text-white outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {r ===
        selected
          ? ''
          : 'opacity-45'} {b === loc.diskBlock ? 'ring-foreground ring-2' : ''}"
        aria-label={`Block ${b}: ${INFO[r].name}`}
        aria-pressed={r === selected}
        onclick={() => (selected = r)}
      >
        {INFO[r].short}
        <span class="absolute right-0.5 bottom-0 text-[0.55rem] opacity-80">{b}</span>
      </button>
    {/each}
  </div>

  <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
    {#each Object.entries(INFO) as [id, i]}
      <button type="button" class="flex items-center gap-1.5 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {id === selected ? 'font-medium' : 'text-muted-foreground'}" onclick={() => (selected = id as Region)}>
        <span class="{i.cls} size-2.5 rounded-xs"></span>{i.name}
      </button>
    {/each}
  </div>

  <p class="mt-3 min-h-16 text-sm" role="status"><span class="font-medium">{INFO[selected].name}.</span> {INFO[selected].text}</p>

  <div class="mt-3 border-t pt-5">
    <p class="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">Find an inode from its number</p>
    <div class="max-w-sm">
      <SliderField label="Inode number (inumber)" bind:value={inumber} min={0} max={totalInodes() - 1} />
    </div>
    <dl class="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-muted-foreground">Offset into the inode table</dt>
        <dd class="font-mono">{inumber} × {VSFS.inodeSize} = {loc.offset} bytes</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">Byte address on disk</dt>
        <dd class="font-mono">{kb(VSFS.inodeStart * VSFS.blockSize)} + {loc.offset} = {loc.byteAddr}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">Block of the inode table</dt>
        <dd class="font-mono">⌊{loc.offset} ÷ {VSFS.blockSize}⌋ = {loc.blk} → disk block {loc.diskBlock}, slot {loc.slot} of {inodesPerBlock()}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">Sector to read (512-byte sectors)</dt>
        <dd class="font-mono">
          ({loc.blk} × {VSFS.blockSize} + {VSFS.inodeStart * VSFS.blockSize}) ÷ 512 =
          <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-medium">{loc.sector}</span>
        </dd>
      </div>
    </dl>
    <p class="text-muted-foreground mt-3 text-sm">The outlined block in the grid is the one that holds this inode. No search is needed: the location is pure arithmetic.</p>
  </div>
</VizCard>
