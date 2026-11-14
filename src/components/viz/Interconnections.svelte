<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { hierarchyLinks, meshLinks } from '../../lib/sim/foundations';

  let n = $state(16);
  let g = $state(4);
  let mode = $state<'mesh' | 'hierarchy'>('mesh');

  const mesh = $derived(meshLinks(n));
  const hier = $derived(hierarchyLinks(n, g));

  const W = 600;
  const H = 300;
  interface Pt { x: number; y: number }

  // Flat organisation: every component on a circle, every pair connected.
  const ring = $derived(Array.from({ length: n }, (_, i): Pt => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: W / 2 + Math.cos(a) * 230, y: H / 2 + Math.sin(a) * 120 };
  }));
  const meshLines = $derived.by(() => {
    const out: [Pt, Pt][] = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) out.push([ring[i], ring[j]]);
    return out;
  });

  // Hierarchy: rows of nodes; each group of g is fully connected and hangs from one parent.
  const tree = $derived.by(() => {
    const rows: Pt[][] = [];
    const lines: [Pt, Pt][] = [];
    const levels = hier.levels;
    levels.forEach((count, li) => {
      const y = H - 30 - (li * (H - 60)) / Math.max(1, levels.length - 1);
      rows.push(Array.from({ length: count }, (_, i) => ({ x: ((i + 0.5) / count) * W, y })));
    });
    for (let li = 0; li < rows.length - 1; li++) {
      const row = rows[li];
      for (let s = 0; s < row.length; s += g) {
        const grp = row.slice(s, s + g);
        for (let i = 0; i < grp.length; i++) for (let j = i + 1; j < grp.length; j++) lines.push([grp[i], grp[j]]);
        const parent = rows[li + 1][s / g];
        for (const p of grp) lines.push([p, parent]);
      }
    }
    return { rows, lines };
  });
</script>

<VizCard kind="Try it" title="Counting interconnections">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Components" bind:value={n} min={4} max={32} />
    <SliderField label="Modules per subsystem (hierarchy)" bind:value={g} min={2} max={8} />
  </div>

  <div class="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Organisation">
    <Button variant={mode === 'mesh' ? 'primary' : 'outline'} size="sm" aria-pressed={mode === 'mesh'} onclick={() => (mode = 'mesh')}>No structure</Button>
    <Button variant={mode === 'hierarchy' ? 'primary' : 'outline'} size="sm" aria-pressed={mode === 'hierarchy'} onclick={() => (mode = 'hierarchy')}>Hierarchy</Button>
  </div>

  <svg viewBox={`0 0 ${W} ${H}`} class="mt-3 w-full" role="img" aria-label={mode === 'mesh' ? `${n} components, every pair connected: ${mesh} interconnections` : `${n} components arranged in a hierarchy with ${hier.levels.length} levels: ${hier.links} interconnections inside subsystems`}>
    {#if mode === 'mesh'}
      {#each meshLines as [a, b]}<line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--chart-5)" stroke-width="0.7" opacity="0.55" />{/each}
      {#each ring as p}<circle cx={p.x} cy={p.y} r="7" fill="var(--primary)" />{/each}
    {:else}
      {#each tree.lines as [a, b]}
        {#if a.y === b.y}
          <path d={`M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${a.y + 6 + Math.abs(b.x - a.x) * 0.18} ${b.x} ${b.y}`} fill="none" stroke="var(--chart-3)" stroke-width="1" />
        {:else}
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--muted-foreground)" stroke-width="0.8" stroke-dasharray="3 3" />
        {/if}
      {/each}
      {#each tree.rows as row, li}
        {#each row as p}<circle cx={p.x} cy={p.y} r={li === 0 ? 6 : 8} fill={li === 0 ? 'var(--primary)' : 'var(--chart-2)'} />{/each}
      {/each}
    {/if}
  </svg>
  {#if mode === 'hierarchy'}
    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      <span class="flex items-center gap-1.5"><span class="bg-primary size-2.5 rounded-full"></span>module</span>
      <span class="flex items-center gap-1.5"><span class="bg-chart-2 size-2.5 rounded-full"></span>subsystem (a group seen as one component)</span>
      <span class="flex items-center gap-1.5"><span class="bg-chart-3 h-0.5 w-4"></span>interaction inside a subsystem</span>
      <span class="flex items-center gap-1.5"><span class="border-muted-foreground w-4 border-t border-dashed"></span>belongs to</span>
    </div>
  {/if}

  <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-3">
    <div><dt class="text-muted-foreground">No structure: n(n − 1)/2</dt><dd class="font-mono text-lg tabular-nums">{mesh}</dd></div>
    <div><dt class="text-muted-foreground">Hierarchy</dt><dd class="font-mono text-lg tabular-nums">{hier.links}</dd></div>
    <div><dt class="text-muted-foreground">Levels</dt><dd class="font-mono text-lg tabular-nums">{hier.levels.join(' → ')}</dd></div>
  </dl>
  <p class="text-muted-foreground mt-2 text-sm">
    Without structure, any component may interact with any other, and the possible interconnections grow with the square of the number of
    components. In a hierarchy a designer needs to understand only the interactions among the few members of one subsystem at a time.
  </p>
</VizCard>
