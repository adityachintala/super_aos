<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { bridgeFrame, type BridgeStep } from '../../lib/sim/net';

  // Hosts A and B share port 1 (through a hub); C is on port 2; D and E share port 3.
  const HOSTS: Record<string, number> = { A: 0, B: 0, C: 1, D: 2, E: 2 };
  const PORTS = 3;
  const names = Object.keys(HOSTS);

  let table = $state<Record<string, number>>({});
  let src = $state('A');
  let dst = $state('D');
  let last = $state<(BridgeStep & { src: string; dst: string }) | null>(null);

  function send() {
    const step = bridgeFrame(table, src, dst, HOSTS[src], PORTS);
    table = step.table;
    last = { ...step, src, dst };
  }
  function reset() {
    table = {};
    last = null;
  }
  const lit = (port: number) => last && (last.outPorts.includes(port) || HOSTS[last.src] === port);
</script>

<VizCard kind="Simulator" title="A bridge that teaches itself">
  <div class="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto_auto]">
    <label class="grid gap-1.5 text-sm font-medium">
      Sender
      <NativeSelect size="sm" class="w-full" bind:value={src}>
        {#each names as n}<NativeSelectOption value={n}>Host {n} (port {HOSTS[n] + 1})</NativeSelectOption>{/each}
      </NativeSelect>
    </label>
    <label class="grid gap-1.5 text-sm font-medium">
      Destination
      <NativeSelect size="sm" class="w-full" bind:value={dst}>
        {#each names as n}<NativeSelectOption value={n}>Host {n}</NativeSelectOption>{/each}
      </NativeSelect>
    </label>
    <Button variant="primary" size="sm" disabled={src === dst} onclick={send}>Send a frame</Button>
    <Button variant="ghost" size="sm" onclick={reset}>Forget everything</Button>
  </div>

  <div class="mt-5 grid gap-3 sm:grid-cols-3">
    {#each Array(PORTS) as _, port}
      <div class="rounded-md border p-2 transition-colors {lit(port) ? (last && HOSTS[last.src] === port ? 'border-primary bg-primary/7' : 'border-success bg-success/10') : ''}">
        <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Port {port + 1}</p>
        <div class="mt-1.5 flex gap-1.5">
          {#each names.filter((n) => HOSTS[n] === port) as n}
            <span class="grid size-8 place-items-center rounded-full font-mono text-sm font-medium {last?.src === n ? 'bg-primary text-primary-foreground' : last?.dst === n ? 'bg-success text-success-foreground' : 'bg-muted'}">{n}</span>
          {/each}
        </div>
        <p class="text-muted-foreground mt-1.5 min-h-4 text-xs">
          {#if last && HOSTS[last.src] === port}frame arrives here{:else if last?.outPorts.includes(port)}frame sent out{/if}
        </p>
      </div>
    {/each}
  </div>

  <p class="mt-3 min-h-12 text-sm" role="status">
    {#if !last}
      The bridge starts with an empty table. Send a frame and watch what it learns and where the frame goes.
    {:else if last.action === 'flood'}
      <span class="font-medium">Flood.</span> The bridge does not know where {last.dst} is, so the frame goes out of every port except the one it came
      in on. Meanwhile it has noted that {last.src} is reachable through port {HOSTS[last.src] + 1}.
    {:else if last.action === 'forward'}
      <span class="font-medium">Forward.</span> The table says {last.dst} is on port {last.outPorts[0] + 1}, so the frame goes out of that port only.
      The other ports stay quiet.
    {:else}
      <span class="font-medium">Filter.</span> {last.dst} is on the same port the frame arrived on, so the bridge drops it: the destination has already
      heard it.
    {/if}
  </p>

  <div class="mt-2 border-t pt-4">
    <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">Bridge table (address → port)</p>
    <div class="flex flex-wrap gap-1.5 font-mono text-xs">
      {#each Object.entries(table) as [host, port]}
        <span class="rounded-md border px-2 py-1">{host} → port {port + 1}</span>
      {:else}
        <span class="text-muted-foreground">empty</span>
      {/each}
    </div>
  </div>
</VizCard>
