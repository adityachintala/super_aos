<script lang="ts">
  import VizCard from './VizCard.svelte';
  import SliderField from './SliderField.svelte';
  import { availability, downtimeHoursPerYear } from '../../lib/sim/scaling';

  let mttf = $state(1000);
  let mttr = $state(10);

  const a = $derived(availability(mttf, mttr));
  const down = $derived(downtimeHoursPerYear(a));
  const nines = $derived(Math.floor(-Math.log10(1 - a) + 1e-9));
  const downText = $derived(down >= 48 ? `${(down / 24).toFixed(1)} days` : down >= 1 ? `${down.toFixed(1)} hours` : `${(down * 60).toFixed(0)} minutes`);
</script>

<VizCard kind="Calculator" title="Availability from MTTF and MTTR">
  <div class="grid gap-5 sm:grid-cols-2">
    <SliderField label="Mean time to failure (MTTF)" bind:value={mttf} min={100} max={10000} step={100} suffix=" h" />
    <SliderField label="Mean time to repair (MTTR)" bind:value={mttr} min={1} max={100} suffix=" h" />
  </div>

  <div class="mt-5 flex h-8 overflow-hidden rounded-md" role="img" aria-label={`Up ${(a * 100).toFixed(2)} percent of the time`}>
    <div class="bg-chart-3 grid place-items-center text-xs font-medium text-white" style:flex-grow={mttf}>up</div>
    <div class="bg-chart-5 min-w-1" style:flex-grow={mttr}></div>
  </div>

  <dl class="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
    <div>
      <dt class="text-muted-foreground">Availability</dt>
      <dd class="font-mono">
        {mttf} ÷ ({mttf} + {mttr}) = <span class="bg-primary text-primary-foreground rounded-sm px-1.5 py-0.5 font-medium">{(a * 100).toFixed(3)}%</span>
      </dd>
    </div>
    <div>
      <dt class="text-muted-foreground">Expected downtime per year</dt>
      <dd class="font-mono">{downText}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">"Nines"</dt>
      <dd class="font-mono">{nines} nine{nines === 1 ? '' : 's'}</dd>
    </div>
  </dl>
  <p class="text-muted-foreground mt-3 text-sm">
    Try halving the repair time, then try doubling the time to failure. Both move availability by about the same amount, and fast repair is
    usually far cheaper than more reliable hardware.
  </p>
</VizCard>
