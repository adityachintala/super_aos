<script lang="ts">
  // A message-sequence chart revealed one message at a time. Scenarios are passed in as data.
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';

  interface Message {
    /** L sends to R, or R sends to L. */
    from: 'L' | 'R';
    label: string;
    note: string;
    /** 'old' draws a delayed duplicate; 'lost' draws a message that never arrives. */
    kind?: 'old' | 'lost' | 'reject';
  }
  interface Scenario {
    name: string;
    messages: Message[];
    outcome: string;
  }
  let { title, left, right, scenarios }: { title: string; left: string; right: string; scenarios: Scenario[] } = $props();

  let which = $state(0);
  let shown = $state(0);
  const sc = $derived(scenarios[which]);
  const done = $derived(shown >= sc.messages.length);

  const W = 560;
  const ROW = 46;
  const LX = 90;
  const RX = W - 90;
  const H = $derived(52 + sc.messages.length * ROW + 10);
  const y = (i: number) => 58 + i * ROW;
  const stroke = (m: Message) => (m.kind === 'old' ? 'var(--chart-4)' : m.kind === 'reject' ? 'var(--error)' : m.kind === 'lost' ? 'var(--muted-foreground)' : 'var(--primary)');

  function pick(i: number) {
    which = i;
    shown = 0;
  }
</script>

<VizCard kind="Try it" {title}>
  {#if scenarios.length > 1}
    <div class="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Scenario">
      {#each scenarios as s, i}
        <Button variant={i === which ? 'primary' : 'outline'} size="sm" aria-pressed={i === which} onclick={() => pick(i)}>{s.name}</Button>
      {/each}
    </div>
  {/if}

  <svg viewBox={`0 0 ${W} ${H}`} class="w-full" role="img" aria-label={`${left} and ${right} exchange: ${sc.messages.slice(0, shown).map((m) => m.label).join('; ') || 'nothing yet'}`}>
    <defs>
      <marker id="seq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
      </marker>
    </defs>
    {#each [[LX, left], [RX, right]] as [x, name]}
      <text {x} y="20" fill="var(--foreground)" font-size="13" font-weight="600" text-anchor="middle">{name}</text>
      <line x1={x} y1="30" x2={x} y2={H - 4} stroke="var(--border)" stroke-width="2" />
    {/each}
    <text x="14" y={H / 2} fill="var(--muted-foreground)" font-size="11" transform={`rotate(-90 14 ${H / 2})`} text-anchor="middle">time</text>
    {#each sc.messages.slice(0, shown) as m, i}
      {@const x1 = m.from === 'L' ? LX : RX}
      {@const x2full = m.from === 'L' ? RX : LX}
      {@const x2 = m.kind === 'lost' ? (x1 + x2full) / 2 : x2full}
      <line
        {x1}
        y1={y(i)}
        {x2}
        y2={y(i) + 22}
        stroke={stroke(m)}
        stroke-width={i === shown - 1 ? 3 : 2}
        stroke-dasharray={m.kind === 'old' || m.kind === 'lost' ? '6 4' : undefined}
        marker-end={m.kind === 'lost' ? undefined : 'url(#seq-arrow)'}
      />
      {#if m.kind === 'lost'}<text x={x2} y={y(i) + 28} fill="var(--foreground)" font-size="14" font-weight="700" text-anchor="middle">✕</text>{/if}
      <text x={W / 2} y={y(i) + 4} fill="var(--foreground)" font-size="12" text-anchor="middle" font-family="var(--font-mono)">{m.label}</text>
    {/each}
  </svg>

  <p class="mt-2 min-h-14 text-sm" role="status">
    {#if shown === 0}
      Time runs downwards. Step through the exchange one message at a time.
    {:else}
      <span class="font-medium">{shown}.</span> {sc.messages[shown - 1].note}
      {#if done}<span class="font-medium"> {sc.outcome}</span>{/if}
    {/if}
  </p>

  <div class="mt-2 flex flex-wrap gap-2">
    <Button variant="primary" size="sm" disabled={done} onclick={() => (shown += 1)}>{done ? 'Finished' : 'Next message'}</Button>
    <Button variant="ghost" size="sm" disabled={shown === 0} onclick={() => (shown = 0)}>Restart</Button>
  </div>
</VizCard>
