<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Input } from '../starwind-svelte/input';
  import { prefixInfo, validIp } from '../../lib/sim/routing';

  let ip = $state('128.208.2.151');
  let length = $state(22);

  const ok = $derived(validIp(ip.trim()));
  const info = $derived(ok ? prefixInfo(ip.trim(), length) : null);
</script>

<VizCard kind="Calculator" title="Network part and host part of an IPv4 address">
  <div class="grid items-end gap-5 sm:grid-cols-2">
    <label class="grid gap-1.5 text-sm font-medium">
      IP address
      <Input size="sm" class="font-mono" bind:value={ip} aria-invalid={!ok} />
    </label>
    <SliderField label="Prefix length" bind:value={length} min={8} max={30} suffix=" bits" />
  </div>

  {#if info}
    <div class="mt-5 flex flex-wrap gap-y-1" role="img" aria-label={`The first ${length} bits are the network part and the last ${32 - length} bits are the host part`}>
      {#each info.bits.split('') as b, i}
        <span class="grid h-7 w-4 place-items-center font-mono text-xs {i < length ? 'bg-chart-1 text-white' : 'bg-chart-4 text-white'} {i % 8 === 0 && i > 0 ? 'ml-1.5' : ''} {i === 0 || i % 8 === 0 ? 'rounded-l-xs' : ''} {i % 8 === 7 ? 'rounded-r-xs' : ''}">{b}</span>
      {/each}
    </div>
    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
      <span class="flex items-center gap-1.5"><span class="bg-chart-1 size-2.5 rounded-xs"></span>network: {length} bits</span>
      <span class="flex items-center gap-1.5"><span class="bg-chart-4 size-2.5 rounded-xs"></span>host: {32 - length} bits</span>
    </div>

    <dl class="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-muted-foreground">Prefix (network address)</dt>
        <dd class="font-mono"><span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-medium">{info.network}/{length}</span></dd>
      </div>
      <div>
        <dt class="text-muted-foreground">Subnet mask</dt>
        <dd class="font-mono">{info.mask}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">Addresses in the block</dt>
        <dd class="font-mono">2^{32 - length} = {info.addresses.toLocaleString('en-US')} ({info.hosts.toLocaleString('en-US')} usable by hosts)</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">Range</dt>
        <dd class="font-mono">{info.network} to {info.broadcast}</dd>
      </div>
    </dl>
    <p class="text-muted-foreground mt-3 text-sm">
      A router does not store this address. It stores the prefix, and decides where to send a packet by ANDing the destination with the mask and
      comparing the result with the prefix. Shorten the prefix to see blocks merge into a bigger one (aggregation); lengthen it to split a block
      into subnets.
    </p>
  {:else}
    <p class="mt-4 text-sm" role="status">Enter an address as four numbers from 0 to 255 separated by dots.</p>
  {/if}
</VizCard>
