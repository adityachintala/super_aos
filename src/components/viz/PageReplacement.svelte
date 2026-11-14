<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { Input } from '../starwind-svelte/input';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { parseRefs, simulate, type Algorithm } from '../../lib/sim/paging';

  const ALGOS: { id: Algorithm; name: string; rule: string }[] = [
    { id: 'fifo', name: 'FIFO', rule: 'evict the page that has been in memory longest' },
    { id: 'opt', name: 'Optimal', rule: 'evict the page that will not be used for the longest time' },
    { id: 'lru', name: 'LRU', rule: 'evict the page that has not been used for the longest time' },
    { id: 'clock', name: 'Second chance (clock)', rule: 'FIFO, but a page whose reference bit is 1 is skipped and its bit cleared' },
  ];

  let refsText = $state('1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5');
  let frameCount = $state(3);
  let algo = $state<Algorithm>('fifo');
  let shown = $state(0);

  const refs = $derived(parseRefs(refsText).slice(0, 24));
  const run = $derived(simulate(refs, frameCount, algo));
  const visible = $derived(run.steps.slice(0, shown));
  const faultsSoFar = $derived(visible.filter((s) => s.fault).length);
  const current = $derived(visible[visible.length - 1]);
  const rule = $derived(ALGOS.find((a) => a.id === algo)!.rule);

  const compare = $derived(ALGOS.map((a) => ({ ...a, faults: simulate(refs, frameCount, a.id).faults })));
  const byFrames = $derived([1, 2, 3, 4, 5, 6, 7].map((f) => ({ f, faults: simulate(refs, f, algo).faults })));
  const maxFaults = $derived(Math.max(1, refs.length));
  const anomaly = $derived(byFrames.some((b, i) => i > 0 && b.faults > byFrames[i - 1].faults));

  const reset = () => (shown = 0);
</script>

<VizCard kind="Simulator" title="Page replacement, one reference at a time">
  <div class="grid items-end gap-4 sm:grid-cols-[1fr_12rem]">
    <label class="grid gap-1.5 text-sm font-medium">
      Reference string (page numbers)
      <Input size="sm" class="font-mono" bind:value={refsText} oninput={reset} />
    </label>
    <label class="grid gap-1.5 text-sm font-medium">
      Algorithm
      <NativeSelect size="sm" class="w-full" bind:value={algo} onchange={reset}>
        {#each ALGOS as a}<NativeSelectOption value={a.id}>{a.name}</NativeSelectOption>{/each}
      </NativeSelect>
    </label>
  </div>
  <div class="mt-4 max-w-xs">
    <SliderField label="Frames available" bind:value={frameCount} min={1} max={7} onchange={reset} />
  </div>
  <p class="text-muted-foreground mt-3 text-sm"><span class="text-foreground font-medium">Rule:</span> {rule}.</p>

  <div class="mt-4 flex flex-wrap items-center gap-2">
    <Button variant="primary" size="sm" disabled={shown >= refs.length} onclick={() => (shown += 1)}>
      {shown >= refs.length ? 'Finished' : `Reference page ${refs[shown]}`}
    </Button>
    <Button variant="outline" size="sm" disabled={shown >= refs.length} onclick={() => (shown = refs.length)}>Run all</Button>
    <Button variant="ghost" size="sm" disabled={shown === 0} onclick={reset}>Reset</Button>
    <span class="ml-auto text-sm">Page faults so far: <span class="font-medium tabular-nums">{faultsSoFar}</span> of {shown}</span>
  </div>

  <div class="mt-4 overflow-x-auto pb-1">
    <table class="border-separate border-spacing-1 font-mono text-sm" aria-label="Frame contents after each reference">
      <thead>
        <tr>
          <th class="text-muted-foreground pr-2 text-left font-sans text-xs font-medium">reference</th>
          {#each refs as r, i}
            <th class="size-8 rounded-sm font-medium {i < shown ? '' : 'text-muted-foreground'} {i === shown - 1 ? 'bg-muted' : ''}">{r}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each Array(frameCount) as _, f}
          <tr>
            <th class="text-muted-foreground pr-2 text-left font-sans text-xs font-medium whitespace-nowrap">frame {f}</th>
            {#each refs as _r, i}
              {@const s = visible[i]}
              <td
                class="size-8 rounded-sm border text-center {s
                  ? s.loadedInto === f
                    ? 'border-error bg-error/15 font-medium'
                    : s.frames[f] === s.ref
                      ? 'border-success bg-success/15'
                      : ''
                  : 'border-dashed'}"
              >
                {s && s.frames[f] !== null ? s.frames[f] : ''}{#if s?.bits && s.frames[f] !== null}<sup class="text-muted-foreground">{s.bits[f]}</sup>{/if}
              </td>
            {/each}
          </tr>
        {/each}
        <tr>
          <th class="text-muted-foreground pr-2 text-left font-sans text-xs font-medium">fault?</th>
          {#each refs as _r, i}
            <td class="text-center font-sans text-xs">{visible[i] ? (visible[i].fault ? 'F' : '·') : ''}</td>
          {/each}
        </tr>
      </tbody>
    </table>
  </div>

  <p class="mt-2 min-h-10 text-sm" role="status">
    {#if !current}
      Predict what happens, then press the button. Red cells are pages just loaded by a fault; green cells are hits.
    {:else if !current.fault}
      Page {current.ref} is already in memory: a hit, no fault.
    {:else if current.victim === null}
      Page fault. Page {current.ref} goes into a free frame.
    {:else}
      Page fault. No free frame, so page {current.victim} is evicted and page {current.ref} takes its frame.
    {/if}
    {#if algo === 'clock' && current}<span class="text-muted-foreground"> Small numbers are reference bits; the hand now points at frame {current.hand}.</span>{/if}
  </p>

  <div class="mt-4 grid gap-6 border-t pt-5 md:grid-cols-2">
    <div>
      <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">All four algorithms, {frameCount} frame{frameCount === 1 ? '' : 's'}</p>
      <div class="grid gap-1.5">
        {#each compare as c}
          <div class="grid grid-cols-[9.5rem_1fr_1.5rem] items-center gap-2 text-sm">
            <span class={c.id === algo ? 'font-medium' : 'text-muted-foreground'}>{c.name}</span>
            <span class="bg-muted h-2.5 overflow-hidden rounded-full"
              ><span class="block h-full rounded-full {c.id === algo ? 'bg-primary' : 'bg-foreground/40'}" style:width={`${(c.faults / maxFaults) * 100}%`}></span></span
            >
            <span class="text-right font-mono tabular-nums">{c.faults}</span>
          </div>
        {/each}
      </div>
    </div>
    <div>
      <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">Faults against number of frames</p>
      <div class="flex h-24 items-end gap-1.5" role="img" aria-label={`Page faults for 1 to 7 frames: ${byFrames.map((b) => b.faults).join(', ')}`}>
        {#each byFrames as b, i}
          {@const worse = i > 0 && b.faults > byFrames[i - 1].faults}
          <div class="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span class="font-mono text-xs tabular-nums">{b.faults}</span>
            <span class="w-full rounded-t-sm {worse ? 'bg-error' : b.f === frameCount ? 'bg-primary' : 'bg-foreground/40'}" style:height={`${(b.faults / maxFaults) * 70}%`}></span>
          </div>
        {/each}
      </div>
      <div class="text-muted-foreground mt-1 flex gap-1.5 text-center font-mono text-xs">
        {#each byFrames as b}<span class="flex-1">{b.f}</span>{/each}
      </div>
      {#if anomaly}
        <p class="mt-2 text-sm"><span class="font-medium">Belady's anomaly:</span> the red bar has more faults than the bar before it, even though it has more frames.</p>
      {/if}
    </div>
  </div>
</VizCard>
