<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { HANDLER, newMachine, raise, show, step, type Machine } from '../../lib/sim/foundations';

  let m = $state<Machine>(newMachine());
  let serviced = $state(0);

  const hex = (n: number, w = 3) => n.toString(16).toUpperCase().padStart(w, '0');
  const PROGRAM = [0x300, 0x301, 0x302, 0x303];
  const ISR = [0x500, 0x501];
  const DATA = [0x940, 0x941, 0x942];
  // During execute, the instruction in the IR came from PC - 1.
  const active = $derived(m.halted ? -1 : m.phase === 'fetch' ? m.pc : m.phase === 'execute' ? m.pc - 1 : -1);
  const PHASES = [
    ['fetch', 'Fetch'],
    ['execute', 'Execute'],
    ['interrupt', 'Interrupt check'],
  ] as const;

  function next() {
    const before = m.saved;
    m = step(m);
    if (before && !m.saved) serviced += 1;
  }
  function reset() {
    m = newMachine();
    serviced = 0;
  }
</script>

{#snippet cell(addr: number, instr: boolean)}
  <div class="flex items-center justify-between gap-3 rounded-sm border px-2 py-1 font-mono text-xs {addr === active ? 'border-primary bg-primary/10 font-medium' : ''}">
    <span class="text-muted-foreground">{hex(addr)}</span>
    <span>{instr ? show(m.mem[addr]) : m.mem[addr]}</span>
  </div>
{/snippet}

<VizCard kind="Simulator" title="A simple computer: fetch, execute, interrupt">
  <div class="flex flex-wrap items-center gap-1.5 text-xs" aria-label="Instruction cycle">
    {#each PHASES as [id, label], i}
      {#if i > 0}<span class="text-muted-foreground">→</span>{/if}
      <span class="rounded-full border px-2.5 py-1 {!m.halted && m.phase === id ? 'border-primary bg-primary text-primary-foreground font-medium' : ''}">{label}</span>
    {/each}
    <span class="text-muted-foreground">→ back to fetch</span>
    {#if m.halted}<span class="border-error bg-error/10 rounded-full border px-2.5 py-1 font-medium">Halted</span>{/if}
  </div>

  <div class="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
    <div>
      <p class="text-muted-foreground mb-1.5 text-xs font-medium tracking-wider uppercase">Processor</p>
      <dl class="grid gap-1 font-mono text-sm">
        <div class="flex justify-between rounded-sm border px-2 py-1"><dt>PC</dt><dd>{hex(m.pc)}</dd></div>
        <div class="flex justify-between rounded-sm border px-2 py-1"><dt>IR</dt><dd>{m.ir ? `${hex(m.ir, 4)} · ${show(m.ir)}` : '—'}</dd></div>
        <div class="flex justify-between rounded-sm border px-2 py-1"><dt>AC</dt><dd>{m.ac}</dd></div>
      </dl>
      <p class="text-muted-foreground mt-3 mb-1.5 text-xs font-medium tracking-wider uppercase">Program status word</p>
      <dl class="grid gap-1 text-sm">
        <div class="flex justify-between rounded-sm border px-2 py-1"><dt>Interrupts</dt><dd class="font-medium">{m.enabled ? 'enabled' : 'disabled'}</dd></div>
        <div class="flex justify-between rounded-sm border px-2 py-1 {m.supervisor ? 'border-warning bg-warning/10' : ''}"><dt>Mode</dt><dd class="font-medium">{m.supervisor ? 'supervisor' : 'user'}</dd></div>
        <div class="flex justify-between rounded-sm border px-2 py-1 {m.pending ? 'border-chart-5 bg-chart-5/10' : ''}"><dt>Interrupt request line</dt><dd class="font-medium">{m.pending ? 'raised' : 'quiet'}</dd></div>
        <div class="flex justify-between rounded-sm border px-2 py-1"><dt>Saved PC</dt><dd class="font-mono">{m.saved ? hex(m.saved.pc) : '—'}</dd></div>
      </dl>
    </div>
    <div>
      <p class="text-muted-foreground mb-1.5 text-xs font-medium tracking-wider uppercase">Memory: user program</p>
      <div class="grid gap-1">{#each PROGRAM as a}{@render cell(a, true)}{/each}</div>
      <p class="text-muted-foreground mt-3 mb-1.5 text-xs font-medium tracking-wider uppercase">Memory: interrupt handler at {hex(HANDLER)}</p>
      <div class="grid gap-1">{#each ISR as a}{@render cell(a, true)}{/each}</div>
    </div>
    <div>
      <p class="text-muted-foreground mb-1.5 text-xs font-medium tracking-wider uppercase">Memory: data</p>
      <div class="grid gap-1">{#each DATA as a}{@render cell(a, false)}{/each}</div>
      <p class="text-muted-foreground mt-3 mb-1.5 text-xs font-medium tracking-wider uppercase">Device controller</p>
      <div class="flex items-center justify-between rounded-sm border px-2 py-1 font-mono text-xs"><span class="text-muted-foreground">local buffer</span><span>{m.device}</span></div>
      <p class="text-muted-foreground mt-2 text-xs">Interrupts serviced: <span class="font-mono">{serviced}</span></p>
    </div>
  </div>

  <p class="mt-4 min-h-16 rounded-md border px-3 py-2 text-sm" role="status">{m.note}</p>

  <div class="mt-3 flex flex-wrap gap-2">
    <Button variant="primary" size="sm" disabled={m.halted} onclick={next}>Next step</Button>
    <Button variant="outline" size="sm" disabled={m.halted || m.pending} onclick={() => (m = raise(m))}>Device raises an interrupt</Button>
    <Button variant="ghost" size="sm" onclick={reset}>Reset</Button>
  </div>
  <p class="text-muted-foreground mt-2 text-sm">
    Run it once straight through: location 941 ends up holding 3 + 2 = 5. Then reset, and raise an interrupt at any point. The handler runs
    in between two instructions, and 941 still ends up as 5.
  </p>
</VizCard>
