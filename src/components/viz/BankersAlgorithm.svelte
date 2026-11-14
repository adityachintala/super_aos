<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';
  import { Input } from '../starwind-svelte/input';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { BANK_EXAMPLE, need, request, safety, type BankState } from '../../lib/sim/deadlock';

  const TYPES = ['A', 'B', 'C'];

  let state = $state<BankState>(BANK_EXAMPLE);
  let shown = $state(0);
  let proc = $state('1');
  let req = $state(['1', '0', '2']);
  let message = $state<{ ok: boolean; text: string } | null>(null);

  const needs = $derived(need(state));
  const result = $derived(safety(state));
  const steps = $derived(result.steps.slice(0, shown));
  const done = $derived(new Set(steps.map((s) => s.process)));
  const work = $derived(steps.length ? steps[steps.length - 1].workAfter : state.available);
  const current = $derived(steps[steps.length - 1]);
  const v = (x: number[]) => x.join(' ');

  function submit() {
    const p = Number(proc);
    const r = req.map((x) => Math.max(0, Math.round(Number(x)) || 0));
    const out = request(state, p, r);
    if (out.granted) {
      state = out.state;
      shown = 0;
      message = { ok: true, text: `Granted. Pretending to allocate (${v(r)}) to P${p} leaves a safe state, with safe sequence ${out.sequence.map((i) => `P${i}`).join(', ')}. The tables above now show the new state.` };
    } else if (out.reason === 'exceeds-need') {
      message = { ok: false, text: `Error: the request (${v(r)}) exceeds P${p}'s remaining need (${v(needs[p])}). The process has asked for more than its declared maximum.` };
    } else if (out.reason === 'not-available') {
      message = { ok: false, text: `P${p} must wait: the request (${v(r)}) is more than what is available (${v(state.available)}).` };
    } else {
      message = { ok: false, text: `Refused, although the resources are available. Granting (${v(r)}) to P${p} would leave an unsafe state in which no process could be sure of finishing, so P${p} must wait.` };
    }
  }
  function reset() {
    state = BANK_EXAMPLE;
    shown = 0;
    message = null;
  }
</script>

<VizCard kind="Simulator" title="The Banker's algorithm">
  <div class="overflow-x-auto">
    <table class="w-full text-center font-mono text-sm" aria-label="Allocation, Max and Need for each process">
      <thead>
        <tr class="text-muted-foreground font-sans text-xs">
          <th class="text-left font-medium">Process</th><th class="font-medium">Allocation<br />{TYPES.join(' ')}</th><th class="font-medium">Max<br />{TYPES.join(' ')}</th><th class="font-medium">Need<br />{TYPES.join(' ')}</th><th class="font-medium">Finish</th>
        </tr>
      </thead>
      <tbody>
        {#each state.max as m, i}
          <tr class="border-t {current?.process === i ? 'bg-primary/10 font-medium' : ''}">
            <th class="py-1 text-left font-medium">P{i}</th>
            <td>{v(state.allocation[i])}</td>
            <td>{v(m)}</td>
            <td>{v(needs[i])}</td>
            <td><span class="rounded-full px-2 py-0.5 font-sans text-xs {done.has(i) ? 'bg-success text-success-foreground' : 'bg-muted'}">{done.has(i) ? 'true' : 'false'}</span></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="mt-3 flex flex-wrap items-center gap-2 font-mono text-sm">
    <span class="rounded-md border px-2.5 py-1">Available = {v(state.available)}</span>
    <span class="border-primary bg-primary/7 rounded-md border px-2.5 py-1 font-medium">Work = {v(work)}</span>
  </div>

  <p class="mt-3 min-h-12 text-sm" role="status">
    {#if !current}
      <span class="font-medium">Safety algorithm.</span> Work starts as a copy of Available. Find a process that has not finished and whose Need
      fits within Work.
    {:else}
      <span class="font-medium">Step {shown}.</span> P{current.process} needs ({v(needs[current.process])}), which fits within Work ({v(current.workBefore)}). It
      runs to completion and returns its allocation ({v(state.allocation[current.process])}): Work becomes ({v(current.workAfter)}).
      {#if shown >= result.steps.length}
        <span class="font-medium">{result.safe ? `Every process can finish. Safe sequence: ${result.sequence.map((i) => `P${i}`).join(', ')}.` : `Stuck: ${result.stuck.map((i) => `P${i}`).join(', ')} cannot finish. The state is unsafe.`}</span>
      {/if}
    {/if}
  </p>

  <div class="mt-2 flex flex-wrap gap-2">
    <Button variant="primary" size="sm" disabled={shown >= result.steps.length} onclick={() => (shown += 1)}>{shown >= result.steps.length ? 'Check complete' : 'Find the next process'}</Button>
    <Button variant="outline" size="sm" disabled={shown >= result.steps.length} onclick={() => (shown = result.steps.length)}>Run the whole check</Button>
    <Button variant="ghost" size="sm" disabled={shown === 0} onclick={() => (shown = 0)}>Restart the check</Button>
  </div>

  <div class="mt-5 border-t pt-5">
    <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">Now a process asks for more</p>
    <div class="flex flex-wrap items-end gap-2">
      <label class="grid gap-1.5 text-sm font-medium">
        Process
        <NativeSelect size="sm" bind:value={proc}>
          {#each state.max as _, i}<NativeSelectOption value={String(i)}>P{i}</NativeSelectOption>{/each}
        </NativeSelect>
      </label>
      {#each TYPES as t, k}
        <label class="grid gap-1.5 text-sm font-medium">
          {t}
          <Input size="sm" class="w-14 px-2 text-center font-mono" inputmode="numeric" bind:value={req[k]} />
        </label>
      {/each}
      <Button variant="primary" size="sm" onclick={submit}>Request</Button>
      <Button variant="ghost" size="sm" onclick={reset}>Back to the original state</Button>
    </div>
    <div class="mt-2 flex flex-wrap gap-1.5">
      <span class="text-muted-foreground text-xs">Try, in order:</span>
      {#each [['1', ['1', '0', '2']], ['4', ['3', '3', '0']], ['0', ['0', '2', '0']]] as [p, r]}
        <button type="button" class="text-primary-accent rounded-sm font-mono text-xs underline underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-outline/50" onclick={() => ((proc = p as string), (req = [...(r as string[])]))}>P{p} ({(r as string[]).join(', ')})</button>
      {/each}
    </div>
    {#if message}
      <p class="mt-3 rounded-md border px-3 py-2 text-sm {message.ok ? 'border-success bg-success/10' : 'border-error bg-error/10'}" role="status">{message.text}</p>
    {/if}
  </div>
</VizCard>
