<script lang="ts">
  import VizCard from './VizCard.svelte';

  interface Level {
    name: string;
    size: string;
    /** Typical access time in nanoseconds. */
    ns: number;
    access: string;
    volatile: boolean;
    managed: string;
    backed: string;
    note: string;
  }
  const LEVELS: Level[] = [
    { name: 'Registers', size: 'under 1 KB', ns: 0.3, access: '0.25 to 0.5 ns', volatile: true, managed: 'Compiler', backed: 'Cache', note: 'Inside the CPU itself. The compiler decides which values live here.' },
    { name: 'Cache', size: 'under 16 MB', ns: 5, access: '0.5 to 25 ns', volatile: true, managed: 'Hardware', backed: 'Main memory', note: 'Holds copies of recently used memory. Managed entirely by hardware, invisible to the operating system.' },
    { name: 'Main memory', size: 'under 64 GB', ns: 150, access: '80 to 250 ns', volatile: true, managed: 'Operating system', backed: 'Disk', note: 'The only large storage the CPU can access directly. Can be viewed as a cache for secondary storage.' },
    { name: 'Solid-state disk', size: 'under 1 TB', ns: 35_000, access: '25,000 to 50,000 ns', volatile: false, managed: 'Operating system', backed: 'Disk', note: 'Non-volatile and with no moving parts, so far faster than a magnetic disk.' },
    { name: 'Magnetic disk', size: 'under 10 TB', ns: 5_000_000, access: 'about 5,000,000 ns', volatile: false, managed: 'Operating system', backed: 'Disk or tape', note: 'Secondary storage: large, cheap and non-volatile, but mechanical. The arm must move and the platter must turn.' },
    { name: 'Optical disk and magnetic tape', size: 'very large', ns: 5_000_000_000, access: 'seconds', volatile: false, managed: 'Operating system or applications', backed: '', note: 'Tertiary storage, for backup and archives. Slow, sequential in the case of tape, and very cheap per byte.' },
  ];

  let at = $state(2);
  const l = $derived(LEVELS[at]);

  // If a register access took one second, how long would this level take?
  function human(ns: number) {
    const s = ns / LEVELS[0].ns;
    if (s < 90) return `${s.toFixed(0)} second${s.toFixed(0) === '1' ? '' : 's'}`;
    if (s < 5400) return `${(s / 60).toFixed(0)} minutes`;
    if (s < 172800) return `${(s / 3600).toFixed(0)} hours`;
    if (s < 86400 * 365 * 2) return `${(s / 86400).toFixed(0)} days`;
    return `${(s / (86400 * 365)).toFixed(0)} years`;
  }
</script>

<VizCard kind="Try it" title="The storage hierarchy">
  <div class="grid gap-5 md:grid-cols-[1fr_1fr]">
    <div>
      <div class="grid justify-items-center gap-1" role="group" aria-label="Storage level">
        {#each LEVELS as lv, i}
          <button
            type="button"
            class="rounded-sm px-2 py-2 text-center text-xs font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-outline/50 {i === at ? 'bg-primary text-primary-foreground' : lv.volatile ? 'bg-chart-2/20 hover:bg-chart-2/35' : 'bg-chart-4/20 hover:bg-chart-4/35'}"
            style:width={`${40 + i * 12}%`}
            aria-pressed={i === at}
            onclick={() => (at = i)}
          >
            {lv.name}
          </button>
        {/each}
      </div>
      <div class="text-muted-foreground mt-3 flex justify-between text-xs">
        <span>↑ faster, costlier per byte, smaller</span>
        <span>↓ slower, cheaper, larger</span>
      </div>
      <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span class="flex items-center gap-1.5"><span class="bg-chart-2/30 size-2.5 rounded-xs border"></span>volatile: contents lost at power-off</span>
        <span class="flex items-center gap-1.5"><span class="bg-chart-4/30 size-2.5 rounded-xs border"></span>non-volatile</span>
      </div>
    </div>

    <div class="rounded-md border p-4" role="status">
      <p class="font-medium">{l.name}</p>
      <p class="text-muted-foreground mt-1 text-sm">{l.note}</p>
      <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div><dt class="text-muted-foreground">Typical size</dt><dd class="font-mono">{l.size}</dd></div>
        <div><dt class="text-muted-foreground">Access time</dt><dd class="font-mono">{l.access}</dd></div>
        <div><dt class="text-muted-foreground">Managed by</dt><dd>{l.managed}</dd></div>
        <div><dt class="text-muted-foreground">Backed by</dt><dd>{l.backed || 'nothing below'}</dd></div>
      </dl>
      <p class="mt-3 border-t pt-3 text-sm">
        If reading a register took <span class="font-medium">1 second</span>, reading from this level would take about
        <span class="font-mono font-medium">{human(l.ns)}</span>.
      </p>
    </div>
  </div>
</VizCard>
