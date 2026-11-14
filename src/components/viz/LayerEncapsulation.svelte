<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';

  interface Layer {
    name: string;
    unit: string;
    header: string | null;
    job: string;
    examples: string;
    osi: string;
  }
  // Top of the stack first.
  const LAYERS: Layer[] = [
    { name: 'Application', unit: 'message', header: null, job: 'The protocols that users’ programs speak: fetching web pages, sending mail, looking up names.', examples: 'HTTP, SMTP, DNS, RTP', osi: 'OSI splits this into Application, Presentation and Session' },
    { name: 'Transport', unit: 'segment', header: 'TH', job: 'End-to-end delivery between processes on two hosts, adding reliability, ordering and flow control where wanted.', examples: 'TCP, UDP', osi: 'OSI layer 4' },
    { name: 'Network', unit: 'packet', header: 'NH', job: 'Gets packets from source to destination across many intermediate routers: addressing and routing.', examples: 'IP, ICMP', osi: 'OSI layer 3' },
    { name: 'Link', unit: 'frame', header: 'LH', job: 'Moves frames across one single link, detecting errors and deciding who may use a shared medium.', examples: 'Ethernet, 802.11 (WiFi)', osi: 'OSI layer 2 (Data link)' },
    { name: 'Physical', unit: 'bits', header: null, job: 'Sends raw bits as signals over a wire, fibre or radio channel.', examples: 'Copper, fibre, wireless', osi: 'OSI layer 1' },
  ];
  const COLORS = ['bg-chart-4', 'bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-muted'];

  let at = $state(0);
  const layer = $derived(LAYERS[at]);
  // Headers present at this layer, outermost first.
  const headers = $derived(
    LAYERS.slice(1, at + 1)
      .map((l, i) => ({ label: l.header, cls: COLORS[i + 1] }))
      .filter((h) => h.label)
      .reverse(),
  );
</script>

<VizCard kind="Try it" title="Follow a message down the protocol stack">
  <div class="grid gap-5 md:grid-cols-[12rem_1fr]">
    <ol class="grid content-start gap-1" aria-label="Layers, top to bottom">
      {#each LAYERS as l, i}
        <li>
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-outline/50 {i === at
              ? 'bg-primary text-primary-foreground font-medium'
              : 'bg-muted hover:bg-accent'}"
            aria-pressed={i === at}
            onclick={() => (at = i)}
          >
            <span>{l.name}</span><span class="text-xs opacity-80">{l.unit}</span>
          </button>
        </li>
      {/each}
    </ol>

    <div>
      <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">What is being sent at this layer</p>
      <div class="flex h-10 overflow-hidden rounded-md font-mono text-xs font-medium" role="img" aria-label={`A ${layer.unit}: ${headers.map((h) => h.label).join(', ')} then the data${at >= 3 ? ', then a trailer' : ''}`}>
        {#each headers as h}
          <span class="{h.cls} grid w-11 shrink-0 place-items-center text-white">{h.label}</span>
        {/each}
        <span class="{COLORS[0]} grid flex-1 place-items-center text-white">{at === 4 ? '0 1 1 0 1 0 0 1 …' : 'data'}</span>
        {#if at >= 3}<span class="{COLORS[3]} grid w-11 shrink-0 place-items-center text-white">LT</span>{/if}
      </div>
      <p class="mt-3 text-sm" role="status">
        <span class="font-medium">{layer.name} layer.</span> {layer.job}
      </p>
      <p class="text-muted-foreground mt-2 text-sm">
        {#if layer.header}
          It wraps what it was handed in its own header{at === 3 ? ' and trailer' : ''} ({layer.header}{at === 3 ? ' and LT' : ''}), carrying control information for
          its peer on the other side. The receiver's {layer.name.toLowerCase()} layer strips it off again.
        {:else if at === 0}
          The application hands its message to the layer below, and believes it is talking directly to its peer.
        {:else}
          The whole frame, headers and all, goes out as a stream of bits.
        {/if}
      </p>
      <p class="text-muted-foreground mt-2 text-sm">Examples: {layer.examples}. {layer.osi}.</p>
    </div>
  </div>

  <div class="mt-4 flex flex-wrap gap-2">
    <Button variant="primary" size="sm" disabled={at >= LAYERS.length - 1} onclick={() => (at += 1)}>Pass down a layer</Button>
    <Button variant="outline" size="sm" disabled={at === 0} onclick={() => (at -= 1)}>Back up</Button>
  </div>
</VizCard>
