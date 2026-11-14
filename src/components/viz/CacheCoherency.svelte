<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';

  // Integer A lives on disk. To use it, it is copied up the hierarchy, level by level.
  const NAMES = ['Magnetic disk', 'Main memory', 'Cache', 'Hardware register'];
  let copies = $state<(number | null)[]>([5, null, null, null]);
  let other = $state<number | null>(null); // a second CPU's cached copy
  let log = $state('A = 5 is stored in a file on disk. A program wants to increment it.');

  const top = $derived(copies.findLastIndex((c) => c !== null));
  const latest = $derived(copies[top] as number);
  const stale = (i: number) => copies[i] !== null && copies[i] !== latest;
  const consistent = $derived(copies.every((c) => c === null || c === latest) && (other === null || other === latest));

  function up() {
    if (top >= 3) return;
    const t = top; // read before the assignment below changes it
    const next = [...copies];
    next[t + 1] = copies[t];
    copies = next;
    log = `A is copied from ${NAMES[t].toLowerCase()} to ${NAMES[t + 1].toLowerCase()}. The same value now exists in ${t + 2} places.`;
  }
  function increment() {
    if (top < 3) return;
    const next = [...copies];
    next[3] = (next[3] as number) + 1;
    copies = next;
    log = `The increment happens in the register: A is now ${next[3]} there. Every other copy still holds the old value.`;
  }
  function down() {
    const from = copies.findIndex((c, i) => i > 0 && c === latest && copies[i - 1] !== latest);
    if (from < 1) return;
    const next = [...copies];
    next[from - 1] = latest;
    copies = next;
    log = from === 1 ? `The new value is written back to disk. Only now is the change permanent.` : `The new value is written back from ${NAMES[from].toLowerCase()} to ${NAMES[from - 1].toLowerCase()}.`;
  }
  function secondCpu() {
    other = copies[1] ?? copies[0];
    log = `A second CPU loads A into its own cache and gets ${other}. ${other === latest ? 'For the moment the copies agree.' : 'That is a stale value: the newest one is still on its way down from the first CPU.'}`;
  }
  function coherent() {
    other = latest;
    log = `Cache coherency: the hardware propagates the update, so the second CPU's cache now also holds ${latest}.`;
  }
  function reset() {
    copies = [5, null, null, null];
    other = null;
    log = 'A = 5 is stored in a file on disk. A program wants to increment it.';
  }
  const canDown = $derived(copies.some((c, i) => i > 0 && c === latest && copies[i - 1] !== latest));
</script>

<VizCard kind="Simulator" title="Migration of integer A from disk to register">
  <div class="grid gap-2 sm:grid-cols-4" role="img" aria-label={`Copies of A: ${NAMES.map((n, i) => `${n} ${copies[i] ?? 'none'}`).join(', ')}${other !== null ? `, second CPU cache ${other}` : ''}`}>
    {#each NAMES as name, i}
      <div class="rounded-md border px-3 py-3 text-center {copies[i] === null ? 'border-dashed opacity-60' : stale(i) ? 'border-error bg-error/10' : 'border-success bg-success/10'}">
        <p class="text-muted-foreground text-xs">{name}</p>
        <p class="mt-1 font-mono text-2xl tabular-nums">{copies[i] === null ? '—' : `A = ${copies[i]}`}</p>
        <p class="mt-1 h-4 text-xs">{copies[i] === null ? 'no copy' : stale(i) ? 'stale' : 'current'}</p>
      </div>
    {/each}
  </div>

  {#if other !== null}
    <div class="mt-2 rounded-md border px-3 py-2 text-center text-sm {other === latest ? 'border-success bg-success/10' : 'border-error bg-error/10'}">
      Second CPU's cache: <span class="font-mono font-medium">A = {other}</span> ({other === latest ? 'current' : 'stale'})
    </div>
  {/if}

  <p class="mt-3 min-h-10 text-sm" role="status">{log}</p>

  <div class="mt-2 flex flex-wrap gap-2">
    <Button variant="primary" size="sm" disabled={top >= 3} onclick={up}>Copy A up one level</Button>
    <Button variant="primary" size="sm" disabled={top < 3} onclick={increment}>Increment A in the register</Button>
    <Button variant="outline" size="sm" disabled={!canDown} onclick={down}>Write back one level</Button>
    <Button variant="outline" size="sm" onclick={secondCpu}>A second CPU reads A</Button>
    <Button variant="outline" size="sm" disabled={other === null || other === latest} onclick={coherent}>Make the caches coherent</Button>
    <Button variant="ghost" size="sm" onclick={reset}>Reset</Button>
  </div>

  <p class="mt-3 rounded-md border px-3 py-2 text-sm {consistent ? 'border-success bg-success/10' : 'border-warning bg-warning/10'}">
    {consistent ? 'All existing copies of A agree.' : 'The copies of A disagree. Anything that reads a stale copy now gets the wrong answer.'}
  </p>
</VizCard>
