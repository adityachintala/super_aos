<script lang="ts">
  import { doodles, type DoodleName } from '../lib/doodles';

  let { name, class: className = '' }: { name: DoodleName; class?: string } = $props();
</script>

<svg viewBox="0 0 100 100" class="sketch {className}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {@html doodles[name]}
</svg>
