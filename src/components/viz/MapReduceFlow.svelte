<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { Button } from '../starwind-svelte/button';
  import { Checkbox } from '../starwind-svelte/checkbox';
  import { Input } from '../starwind-svelte/input';
  import { NativeSelect, NativeSelectOption } from '../starwind-svelte/native-select';
  import { Textarea } from '../starwind-svelte/textarea';
  import { JOBS, run, type JobId } from '../../lib/sim/mapreduce';

  const STAGES = ['Split', 'Map', 'Shuffle and sort', 'Reduce'];
  const HELP = [
    'The input is cut into M pieces. Each piece becomes one map task.',
    'Each map task runs the user’s map function on every record of its split and emits intermediate key/value pairs.',
    'Pairs are partitioned by hash(key) mod R, moved to the right reduce worker, and sorted so that all values for a key are together.',
    'Each reduce task calls the user’s reduce function once per key and writes one output file.',
  ];

  let text = $state('see bob throw\nsee spot run\nbob can run\nspot can see bob');
  let job = $state<JobId>('wordcount');
  let mappers = $state(2);
  let reducers = $state(2);
  let combiner = $state(false);
  let pattern = $state('bob');
  let stage = $state(0);

  const lines = $derived(
    text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l !== '')
      .slice(0, 8),
  );
  const result = $derived(run(job, lines, mappers, reducers, { combiner, arg: pattern }));
  const canCombine = $derived(!!JOBS[job].combine);
  const raw = $derived(result.mapped.reduce((a, p) => a + p.length, 0));

  const color = (i: number) => `var(--chart-${(i % 6) + 1})`;
  const PAIR = 'rounded-xs px-1.5 py-0.5 font-mono text-xs text-white';
  const COL = 'grid content-start gap-2';
  const BOX = 'rounded-md border p-2';
  const CAP = 'text-muted-foreground text-xs font-medium';
</script>

<VizCard kind="Simulator" title="Follow the data through a MapReduce job">
  <div class="grid gap-4 md:grid-cols-2">
    <label class="grid gap-1.5 text-sm font-medium">
      Input (one record per line)
      <Textarea size="sm" class="min-h-28 font-mono" bind:value={text} />
    </label>
    <div class="grid content-start gap-4">
      <label class="grid gap-1.5 text-sm font-medium">
        Job
        <NativeSelect size="sm" class="w-full" bind:value={job}>
          {#each Object.entries(JOBS) as [id, j]}<NativeSelectOption value={id}>{j.name}</NativeSelectOption>{/each}
        </NativeSelect>
      </label>
      <div class="grid grid-cols-2 gap-4">
        <SliderField label="Map tasks (M)" bind:value={mappers} min={1} max={4} />
        <SliderField label="Reduce tasks (R)" bind:value={reducers} min={1} max={3} />
      </div>
      {#if job === 'grep'}
        <label class="grid gap-1.5 text-sm font-medium">
          Pattern to search for
          <Input size="sm" class="font-mono" bind:value={pattern} />
        </label>
      {:else if canCombine}
        <Checkbox id="mr-combiner" size="sm" variant="primary" label="Use a combiner on each map worker" bind:checked={combiner} />
      {/if}
    </div>
  </div>

  <div class="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Stage of the job">
    {#each STAGES as s, i}
      <Button variant={i === stage ? 'primary' : 'outline'} size="sm" aria-pressed={i === stage} onclick={() => (stage = i)}>{i + 1}. {s}</Button>
    {/each}
  </div>
  <p class="mt-3 text-sm" role="status"><span class="font-medium">{STAGES[stage]}.</span> {HELP[stage]}</p>

  <div class="mt-4 grid gap-3" style:grid-template-columns={`repeat(${stage < 2 ? result.splits.length : reducers}, minmax(0, 1fr))`}>
    {#if stage === 0}
      {#each result.splits as split, i}
        <div class={COL}>
          <p class={CAP}>Split {i + 1} → map task {i + 1}</p>
          <div class="{BOX} font-mono text-xs" style:border-color={color(i)}>
            {#each split as line}<p class="truncate">{line}</p>{/each}
          </div>
        </div>
      {/each}
    {:else if stage === 1}
      {#each result.sent as pairs, i}
        <div class={COL}>
          <p class={CAP}>Map task {i + 1} emits{combiner && canCombine ? ' (after combiner)' : ''}</p>
          <div class="{BOX} flex flex-wrap gap-1">
            {#each pairs as [k, v]}<span class={PAIR} style:background={color(i)}>{k}{v === '' ? '' : `, ${v}`}</span>{:else}<span class="text-muted-foreground text-xs">nothing</span>{/each}
          </div>
        </div>
      {/each}
    {:else if stage === 2}
      {#each result.grouped as groups, r}
        <div class={COL}>
          <p class={CAP}>Reduce task {r + 1} receives</p>
          <div class="{BOX} grid gap-1 font-mono text-xs">
            {#each groups as g}
              <p><span class="font-medium">{g.key}</span> <span class="text-muted-foreground">→ [{g.values.join(', ')}]</span></p>
            {:else}
              <p class="text-muted-foreground">no keys hashed here</p>
            {/each}
          </div>
        </div>
      {/each}
    {:else}
      {#each result.output as pairs, r}
        <div class={COL}>
          <p class={CAP}>Output file part-{r}</p>
          <div class="{BOX} border-success grid gap-1 font-mono text-xs">
            {#each pairs as [k, v]}
              <p><span class="font-medium">{k}</span>{v === '' ? '' : `  ${v}`}</p>
            {:else}
              <p class="text-muted-foreground">empty</p>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <dl class="mt-4 grid gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-3">
    <div>
      <dt class="text-muted-foreground">Pairs emitted by map</dt>
      <dd class="font-mono">{raw}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Pairs sent across the network</dt>
      <dd class="font-mono"><span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-medium">{result.pairsShuffled}</span></dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Output files</dt>
      <dd class="font-mono">{reducers} (one per reduce task)</dd>
    </div>
  </dl>
</VizCard>
