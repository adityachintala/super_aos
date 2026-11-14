<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { pageTableLayout } from '../../lib/sim/memory';

  let addressBits = $state(32);
  let pageShiftText = $state('12');
  let pteSizeText = $state('4');

  const pageShift = $derived(Number(pageShiftText));
  const pteSize = $derived(Number(pteSizeText));
  const layout = $derived(pageTableLayout(addressBits, 2 ** pageShift, pteSize));

  const UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  /** Formats 2^exp bytes. */
  function pow2Bytes(exp: number) {
    const u = Math.min(UNITS.length - 1, Math.floor(exp / 10));
    return `${(2 ** (exp - u * 10)).toLocaleString('en-US')} ${UNITS[u]}`;
  }
  const flatExp = $derived(layout.pageBits + Math.log2(pteSize));
  const pageLabel = (shift: number) => (shift >= 10 ? `${2 ** (shift - 10)}K` : `${2 ** shift}`);
</script>

<VizCard kind="Calculator" title="How many levels of page table?">
  <div class="grid items-end gap-5 sm:grid-cols-3">
    <SliderField label="Logical address" bind:value={addressBits} min={16} max={64} suffix=" bits" />
    <label class="grid gap-1.5 text-sm font-medium">
      Page size
      <NativeSelect size="sm" class="w-full" bind:value={pageShiftText}>
        {#each [10, 11, 12, 13, 14, 16] as s}
          <NativeSelectOption value={String(s)}>{pageLabel(s)} bytes (2^{s})</NativeSelectOption>
        {/each}
      </NativeSelect>
    </label>
    <label class="grid gap-1.5 text-sm font-medium">
      Page-table entry size
      <NativeSelect size="sm" class="w-full" bind:value={pteSizeText}>
        <NativeSelectOption value="4">4 bytes</NativeSelectOption>
        <NativeSelectOption value="8">8 bytes</NativeSelectOption>
      </NativeSelect>
    </label>
  </div>

  <div
    class="mt-5 flex gap-0.5 overflow-hidden rounded-md"
    role="img"
    aria-label={`Address split into ${layout.fields.map((b, i) => `level ${i + 1}: ${b} bits`).join(', ')}, offset: ${layout.offsetBits} bits`}
  >
    {#each layout.fields as b, i}
      <div class="fld bg-chart-1" style:flex-grow={Math.max(b, 4)}>
        <span class="text-[0.7rem] opacity-85">p{i + 1}</span>
        <span>{b}</span>
      </div>
    {/each}
    <div class="fld bg-chart-4" style:flex-grow={Math.max(layout.offsetBits, 4)}>
      <span class="text-[0.7rem] opacity-85">offset</span>
      <span>{layout.offsetBits}</span>
    </div>
  </div>

  <dl class="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
    <div>
      <dt class="text-muted-foreground">Offset bits</dt>
      <dd class="font-mono">log₂({pageLabel(pageShift)}) = {layout.offsetBits}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Entries that fit in one page</dt>
      <dd class="font-mono">{pageLabel(pageShift)} ÷ {pteSize} = 2^{layout.bitsPerLevel} → {layout.bitsPerLevel} bits per level</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Bits left for page numbers</dt>
      <dd class="font-mono">{addressBits} − {layout.offsetBits} = {layout.pageBits}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Levels needed</dt>
      <dd class="font-mono">⌈{layout.pageBits} ÷ {layout.bitsPerLevel}⌉ = <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-medium">{layout.levels}</span></dd>
    </div>
    <div>
      <dt class="text-muted-foreground">A single flat page table would take</dt>
      <dd class="font-mono">2^{layout.pageBits} × {pteSize} = {pow2Bytes(flatExp)} per process</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Memory accesses per reference on a TLB miss</dt>
      <dd class="font-mono">{layout.levels} table lookups + 1 = {layout.levels + 1}</dd>
    </div>
  </dl>
</VizCard>

<style>
  .fld {
    flex-basis: 0;
    min-width: 2.4rem;
    display: grid;
    justify-items: center;
    padding: 0.35rem 0;
    color: #fff;
    font-family: var(--font-mono);
    font-weight: 500;
    transition: flex-grow 0.3s ease;
  }
</style>
