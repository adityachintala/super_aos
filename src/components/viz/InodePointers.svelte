<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { locateBlock, maxFileBytes, reachable } from '../../lib/sim/fs';

  const NAMES = ['Direct pointers', 'Single indirect', 'Double indirect', 'Triple indirect'];
  const UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  let levels = $state(2);
  let blockSizeText = $state('4096');
  let logBlock = $state(1); // slider on a log scale so that all levels are reachable

  const cfg = $derived({ direct: 12, levels, blockSize: Number(blockSizeText), pointerSize: 4 });
  const reach = $derived(reachable(cfg));
  const totalBlocks = $derived(reach.reduce((a, b) => a + b, 0));
  const maxExp = $derived(Math.log10(totalBlocks));
  const blockNo = $derived(Math.min(totalBlocks - 1, Math.floor(10 ** Math.min(logBlock, maxExp)) - 1));
  const where = $derived(locateBlock(blockNo, cfg)!);

  function size(bytes: number) {
    let u = 0;
    let v = bytes;
    while (v >= 1024 && u < UNITS.length - 1) {
      v /= 1024;
      u += 1;
    }
    return `${v >= 100 || Number.isInteger(v) ? Math.round(v).toLocaleString('en-US') : v.toFixed(2)} ${UNITS[u]}`;
  }
</script>

<VizCard kind="Calculator" title="How big a file can one inode describe?">
  <div class="grid items-end gap-5 sm:grid-cols-2">
    <SliderField label="Levels of indirection in the inode" bind:value={levels} min={0} max={3} />
    <label class="grid gap-1.5 text-sm font-medium">
      Block size
      <NativeSelect size="sm" class="w-full" bind:value={blockSizeText}>
        {#each [1024, 2048, 4096, 8192] as b}<NativeSelectOption value={String(b)}>{b / 1024} KB</NativeSelectOption>{/each}
      </NativeSelect>
    </label>
  </div>

  <div class="mt-5 overflow-hidden rounded-md border text-sm">
    <div class="bg-muted grid grid-cols-[1fr_1fr_1fr] gap-2 px-3 py-1.5 text-xs font-medium"><span>Pointer</span><span>Data blocks it reaches</span><span>Bytes</span></div>
    {#each reach as r, i}
      <div class="grid grid-cols-[1fr_1fr_1fr] gap-2 border-t px-3 py-1.5 {where.level === i ? 'bg-primary/10 font-medium' : ''}">
        <span>{i === 0 ? '12 direct pointers' : NAMES[i]}</span>
        <span class="font-mono">{i === 0 ? '12' : `${cfg.blockSize / 4}${i > 1 ? `^${i}` : ''} = ${r.toLocaleString('en-US')}`}</span>
        <span class="font-mono">{size(r * cfg.blockSize)}</span>
      </div>
    {/each}
    <div class="grid grid-cols-[1fr_1fr_1fr] gap-2 border-t px-3 py-1.5 font-medium">
      <span>Maximum file size</span>
      <span class="font-mono">{totalBlocks.toLocaleString('en-US')}</span>
      <span class="font-mono"><span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5">{size(maxFileBytes(cfg))}</span></span>
    </div>
  </div>
  <p class="text-muted-foreground mt-2 text-sm">Each pointer is 4 bytes, so one {cfg.blockSize / 1024} KB block of pointers holds {cfg.blockSize / 4} of them.</p>

  <div class="mt-4 border-t pt-5">
    <div class="max-w-md">
      <SliderField label="Pick a block of the file (slide right for bigger offsets)" bind:value={logBlock} min={0} max={Math.ceil(maxExp * 10) / 10} step={0.1} />
    </div>
    <p class="mt-4 text-sm" role="status">
      File block <span class="font-mono font-medium">{blockNo.toLocaleString('en-US')}</span> (byte offset {size(blockNo * cfg.blockSize)}) is reached through
      <span class="font-medium">{where.level === 0 ? `direct pointer ${where.indices[0]}` : `the ${NAMES[where.level].toLowerCase()} pointer`}</span>.
    </p>
    <div class="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
      <span class="rounded-md border px-2 py-1">inode</span>
      {#if where.level > 0}
        {#each where.indices as idx, i}
          <span class="text-muted-foreground">→</span>
          <span class="bg-chart-2 rounded-md px-2 py-1 text-white">pointer block {i + 1} [slot {idx}]</span>
        {/each}
      {/if}
      <span class="text-muted-foreground">→</span>
      <span class="bg-chart-1 rounded-md px-2 py-1 text-white">data block</span>
    </div>
    <p class="text-muted-foreground mt-3 text-sm">
      Disk reads needed, once the inode is in memory: <span class="text-foreground font-mono font-medium">{where.reads}</span>
      ({where.level === 0 ? 'just the data block' : `${where.level} pointer block${where.level === 1 ? '' : 's'}, then the data block`}). The first 12
      blocks of every file are always one read away.
    </p>
  </div>
</VizCard>
