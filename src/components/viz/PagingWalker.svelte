<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Alert, AlertDescription } from '../starwind-svelte/alert';
  import { Button } from '../starwind-svelte/button';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { translate } from '../../lib/sim/memory';

  const ADDR_BITS = 8; // 256-byte logical address space
  const PHYS_BITS = 9; // 512 bytes of physical memory
  const TLB_SIZE = 4;

  let offsetBitsText = $state('5');
  let addr = $state(77);
  let tlb = $state<{ page: number; frame: number }[]>([]);
  let hits = $state(0);
  let misses = $state(0);
  let last = $state<'hit' | 'miss' | 'fault' | null>(null);

  const offsetBits = $derived(Number(offsetBitsText));
  const pageSize = $derived(2 ** offsetBits);
  const pages = $derived(2 ** (ADDR_BITS - offsetBits));
  const frames = $derived(2 ** (PHYS_BITS - offsetBits));
  // A fixed, scattered mapping; a few pages are left invalid on purpose.
  const pageTable = $derived(Array.from({ length: pages }, (_, p) => (p % 7 === 6 ? null : (p * 5 + 3) % frames)));
  const t = $derived(translate(addr, pageSize, pageTable));

  const bits = (v: number, n: number) => v.toString(2).padStart(n, '0').split('');
  const logicalBits = $derived(bits(addr, ADDR_BITS));
  const physicalBits = $derived(t.physical === null ? [] : bits(t.physical, PHYS_BITS));
  const pageBits = $derived(ADDR_BITS - offsetBits);
  const frameBits = $derived(PHYS_BITS - offsetBits);
  const ratio = $derived(hits + misses ? Math.round((hits / (hits + misses)) * 100) : null);

  function resetTlb() {
    tlb = [];
    hits = 0;
    misses = 0;
    last = null;
  }

  function access(a: number) {
    addr = Math.max(0, Math.min(2 ** ADDR_BITS - 1, a));
    const r = translate(addr, pageSize, pageTable);
    if (r.fault) {
      last = 'fault';
      return;
    }
    if (tlb.some((e) => e.page === r.page)) {
      hits += 1;
      last = 'hit';
    } else {
      misses += 1;
      last = 'miss';
      tlb = [...tlb, { page: r.page, frame: r.frame! }].slice(-TLB_SIZE);
    }
  }

  // Page number, offset and frame keep the same three colours everywhere in this widget.
  const BIT = 'grid h-8 w-6.5 place-items-center rounded-sm font-mono text-sm font-medium text-white';
  const TAG = 'rounded-sm px-1.5 py-0.5 font-mono text-xs text-white';
  const CAP = 'text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase';
</script>

<VizCard kind="Simulator" title="Translating a logical address with paging">
  <div class="grid items-end gap-5 sm:grid-cols-2">
    <SliderField label="Logical address" bind:value={addr} min={0} max={2 ** ADDR_BITS - 1} onchange={() => (last = null)} />
    <label class="grid gap-1.5 text-sm font-medium">
      Page size
      <NativeSelect size="sm" class="w-full" bind:value={offsetBitsText} onchange={resetTlb}>
        <NativeSelectOption value="4">16 bytes (4 offset bits)</NativeSelectOption>
        <NativeSelectOption value="5">32 bytes (5 offset bits)</NativeSelectOption>
        <NativeSelectOption value="6">64 bytes (6 offset bits)</NativeSelectOption>
      </NativeSelect>
    </label>
  </div>

  <div class="mt-6 grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-start">
    <div>
      <p class={CAP}>1 · Split the logical address</p>
      <div class="flex gap-0.5">
        {#each logicalBits as b, i}
          <span class="{BIT} {i < pageBits ? 'bg-chart-1' : 'bg-chart-4'}">{b}</span>
        {/each}
      </div>
      <p class="mt-2 flex flex-wrap gap-1">
        <span class="{TAG} bg-chart-1">page p = {t.page}</span>
        <span class="{TAG} bg-chart-4">offset d = {t.offset}</span>
      </p>
      <p class="text-muted-foreground mt-1.5 text-sm">{addr} ÷ {pageSize} = {t.page} remainder {t.offset}</p>
    </div>

    <div>
      <p class={CAP}>2 · Look up the page table</p>
      <div class="max-h-54 min-w-36 overflow-y-auto rounded-md border font-mono text-xs">
        <div class="bg-muted sticky top-0 grid grid-cols-2 px-2.5 py-1 font-medium"><span>page</span><span>frame</span></div>
        {#each pageTable as f, p}
          <div class="grid grid-cols-2 border-t px-2.5 py-0.5 {p === t.page ? (f === null ? 'bg-error/15 font-medium' : 'bg-primary/15 font-medium') : ''}">
            <span>{p}</span><span>{f === null ? 'invalid' : f}</span>
          </div>
        {/each}
      </div>
    </div>

    <div>
      <p class={CAP}>3 · Build the physical address</p>
      {#if t.fault}
        <Alert variant="error" class="px-3 py-2 text-sm">
          <AlertDescription>Page {t.page} is marked invalid, so the hardware traps to the operating system.</AlertDescription>
        </Alert>
      {:else}
        <div class="flex gap-0.5">
          {#each physicalBits as b, i}
            <span class="{BIT} {i < frameBits ? 'bg-chart-3' : 'bg-chart-4'}">{b}</span>
          {/each}
        </div>
        <p class="mt-2 flex flex-wrap gap-1">
          <span class="{TAG} bg-chart-3">frame f = {t.frame}</span>
          <span class="{TAG} bg-chart-4">offset d = {t.offset}</span>
        </p>
        <p class="text-muted-foreground mt-1.5 text-sm">{t.frame} × {pageSize} + {t.offset} = <span class="text-foreground font-medium">{t.physical}</span></p>
      {/if}
    </div>
  </div>

  <div class="mt-6 border-t pt-5">
    <p class={CAP}>Add a TLB ({TLB_SIZE} entries)</p>
    <div class="flex flex-wrap items-center gap-2">
      <Button variant="primary" size="sm" onclick={() => access(addr)}>Access address {addr}</Button>
      <Button variant="outline" size="sm" onclick={() => access(addr + 1 + Math.floor(Math.random() * 6))}>Access a nearby address</Button>
      <Button variant="outline" size="sm" onclick={() => access(Math.floor(Math.random() * 2 ** ADDR_BITS))}>Access a random address</Button>
      <Button variant="ghost" size="sm" onclick={resetTlb}>Flush TLB</Button>
    </div>
    <div class="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
      {#each Array(TLB_SIZE) as _, i}
        {@const e = tlb[i]}
        <span class="rounded-md border px-2 py-1 {e && e.page === t.page && last === 'hit' ? 'border-success bg-success/10' : e ? '' : 'text-muted-foreground'}">
          {e ? `p${e.page} → f${e.frame}` : 'empty'}
        </span>
      {/each}
    </div>
    <p class="mt-3 text-sm" role="status">
      {#if last === 'hit'}
        <span class="font-medium">TLB hit.</span> The frame number came straight from the TLB: one memory access.
      {:else if last === 'miss'}
        <span class="font-medium">TLB miss.</span> The page table in memory had to be read first: two memory accesses. The entry is now cached.
      {:else if last === 'fault'}
        <span class="font-medium">Invalid page.</span> Nothing is cached; the OS takes over.
      {:else}
        Press an access button to send this address through the TLB.
      {/if}
      {#if ratio !== null}<span class="text-muted-foreground"> Hit ratio so far: <span class="text-foreground font-medium">{ratio}%</span> ({hits} of {hits + misses}).</span>{/if}
    </p>
    <p class="text-muted-foreground mt-1 text-sm">
      Compare many nearby accesses with many random ones. Real programs behave like the first kind, which is why a tiny TLB works so well.
    </p>
  </div>
</VizCard>
