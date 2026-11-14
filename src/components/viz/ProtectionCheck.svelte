<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { legalAddress } from '../../lib/sim/foundations';

  let base = $state(300040);
  let limit = $state(120900);
  let address = $state(350000);

  const TOP = 1024000;
  const ok = $derived(legalAddress(address, base, limit));
  const pct = (x: number) => `${(x / TOP) * 100}%`;
  const fmt = (x: number) => x.toLocaleString('en-US');
</script>

<VizCard kind="Try it" title="Base and limit registers">
  <div class="grid gap-5 sm:grid-cols-3">
    <SliderField label="Base register" bind:value={base} min={0} max={900000} step={20} />
    <SliderField label="Limit register" bind:value={limit} min={1000} max={400000} step={100} />
    <SliderField label="Address the program uses" bind:value={address} min={0} max={TOP - 1} step={1000} />
  </div>

  <div class="mt-5" role="img" aria-label={`Memory from 0 to ${TOP}. The program may use addresses ${base} to ${base + limit - 1}. It is using ${address}, which is ${ok ? 'legal' : 'illegal'}.`}>
    <div class="bg-muted relative h-10 rounded-sm">
      <div class="bg-chart-3/40 border-chart-3 absolute inset-y-0 border-x-2" style:left={pct(base)} style:width={pct(Math.min(limit, TOP - base))}></div>
      <div class="absolute -inset-y-1 w-0.5 {ok ? 'bg-foreground' : 'bg-error'}" style:left={pct(address)}></div>
    </div>
    <div class="text-muted-foreground mt-1 flex justify-between font-mono text-xs"><span>0</span><span>{fmt(TOP)}</span></div>
  </div>

  <div class="mt-3 grid gap-2 font-mono text-sm sm:grid-cols-2">
    <p class="rounded-md border px-3 py-2">address ≥ base? &nbsp; {fmt(address)} ≥ {fmt(base)} → <span class="font-medium">{address >= base ? 'yes' : 'no'}</span></p>
    <p class="rounded-md border px-3 py-2">address &lt; base + limit? &nbsp; {fmt(address)} &lt; {fmt(base + limit)} → <span class="font-medium">{address < base + limit ? 'yes' : 'no'}</span></p>
  </div>

  <p class="mt-3 rounded-md border px-3 py-2 text-sm {ok ? 'border-success bg-success/10' : 'border-error bg-error/10'}" role="status">
    {#if ok}
      <span class="font-medium">Legal.</span> The access goes through to memory. The check is made by hardware on every single reference, so it costs the program nothing in instructions.
    {:else}
      <span class="font-medium">Trap to the operating system: addressing error.</span> The hardware refuses the access, switches to monitor mode and gives control to the operating system, which normally terminates the program.
    {/if}
  </p>
  <p class="text-muted-foreground mt-2 text-sm">
    The program may use addresses {fmt(base)} to {fmt(base + limit - 1)}. Only the operating system can change the two registers, because the
    instructions that load them are privileged.
  </p>
</VizCard>
