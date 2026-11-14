<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { fairness, rateTrajectory, type Law } from '../../lib/sim/transport';

  const CAPACITY = 40;
  const LAWS: { id: Law; name: string; text: string }[] = [
    { id: 'aimd', name: 'AIMD', text: 'Add when there is room, multiply down when congested. Each cut shrinks the gap between the flows, and the additive climb keeps it there, so the path spirals in towards the fair and efficient point.' },
    { id: 'aiad', name: 'Additive both ways', text: 'Both flows add and subtract the same amount, so the path just slides back and forth along a 45° line. The gap between them never changes.' },
    { id: 'mimd', name: 'Multiplicative both ways', text: 'Both flows scale by the same factor, so the path moves along a line through the origin. The ratio between them never changes.' },
  ];

  let law = $state<Law>('aimd');
  let startA = $state(4);
  let startB = $state(30);

  const pts = $derived(rateTrajectory(law, startA, startB, CAPACITY, 120));
  const last = $derived(pts[pts.length - 1]);
  const info = $derived(LAWS.find((l) => l.id === law)!);

  const S = 300;
  const PAD = 30;
  const MAXV = 48;
  const px = (v: number) => PAD + (v / MAXV) * (S - PAD - 8);
  const py = (v: number) => S - PAD - (v / MAXV) * (S - PAD - 8);
  const path = $derived(pts.map(([a, b], i) => `${i === 0 ? 'M' : 'L'}${px(a).toFixed(1)},${py(b).toFixed(1)}`).join(' '));
</script>

<VizCard kind="Simulator" title="Two flows hunting for a fair share">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Control law">
    {#each LAWS as l}
      <Button variant={l.id === law ? 'primary' : 'outline'} size="sm" aria-pressed={l.id === law} onclick={() => (law = l.id)}>{l.name}</Button>
    {/each}
  </div>

  <div class="mt-4 grid gap-5 md:grid-cols-[minmax(0,20rem)_1fr]">
    <svg viewBox={`0 0 ${S} ${S}`} class="w-full" role="img" aria-label={`Rates of flow A and flow B over time. They end at ${last[0].toFixed(1)} and ${last[1].toFixed(1)}.`}>
      <line x1={px(0)} y1={py(0)} x2={px(MAXV)} y2={py(0)} stroke="var(--border)" />
      <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(MAXV)} stroke="var(--border)" />
      <line x1={px(0)} y1={py(0)} x2={px(MAXV)} y2={py(MAXV)} stroke="var(--chart-3)" stroke-dasharray="5 4" />
      <line x1={px(CAPACITY)} y1={py(0)} x2={px(0)} y2={py(CAPACITY)} stroke="var(--chart-5)" stroke-dasharray="5 4" />
      <text x={px(MAXV) - 4} y={py(MAXV) + 14} fill="var(--foreground)" font-size="11" text-anchor="end">fairness line</text>
      <text x={px(CAPACITY) - 2} y={py(0) - 6} fill="var(--foreground)" font-size="11" text-anchor="end">efficiency line</text>
      <path d={path} fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linejoin="round" />
      <circle cx={px(pts[0][0])} cy={py(pts[0][1])} r="5" fill="var(--foreground)" />
      <circle cx={px(last[0])} cy={py(last[1])} r="5" fill="var(--primary)" stroke="var(--card)" stroke-width="2" />
      <circle cx={px(CAPACITY / 2)} cy={py(CAPACITY / 2)} r="4" fill="none" stroke="var(--foreground)" stroke-width="1.5" />
      <text x={S / 2} y={S - 6} fill="var(--muted-foreground)" font-size="11" text-anchor="middle">rate of flow A →</text>
      <text x="11" y={S / 2} fill="var(--muted-foreground)" font-size="11" text-anchor="middle" transform={`rotate(-90 11 ${S / 2})`}>rate of flow B →</text>
    </svg>

    <div>
      <div class="grid gap-4">
        <SliderField label="Flow A starts at" bind:value={startA} min={1} max={38} />
        <SliderField label="Flow B starts at" bind:value={startB} min={1} max={38} />
      </div>
      <p class="mt-4 text-sm" role="status">
        <span class="font-medium">{info.name}.</span> {info.text}
      </p>
      <p class="mt-3 text-sm">
        After 120 adjustments: A = <span class="font-mono font-medium">{last[0].toFixed(1)}</span>, B = <span class="font-mono font-medium">{last[1].toFixed(1)}</span>.
        Fairness <span class="rounded-sm border px-1.5 py-0.5 font-mono font-medium {fairness(last) > 0.9 ? 'border-success bg-success/10' : 'border-error bg-error/10'}">{(fairness(last) * 100).toFixed(0)}%</span>
      </p>
      <p class="text-muted-foreground mt-3 text-sm">
        The black dot is where the flows start, the open circle is the ideal: on the efficiency line (all {CAPACITY} units of capacity used) and on
        the fairness line (equal shares).
      </p>
    </div>
  </div>
</VizCard>
