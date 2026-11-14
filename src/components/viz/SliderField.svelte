<script lang="ts">
  import { Slider } from '../starwind-svelte/slider';

  let {
    label,
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    suffix = '',
    onchange,
  }: { label: string; value?: number; min?: number; max?: number; step?: number; suffix?: string; onchange?: () => void } = $props();
</script>

<div class="grid gap-2.5">
  <div class="flex items-baseline justify-between gap-2 text-sm">
    <span class="font-medium">{label}</span>
    <span class="font-mono tabular-nums">{value}{suffix}</span>
  </div>
  <Slider
    variant="primary"
    aria-label={label}
    {min}
    {max}
    {step}
    value={value}
    onValueChange={(next: number | number[]) => {
      value = Array.isArray(next) ? next[0] : next;
      onchange?.();
    }}
  />
</div>
