<script lang="ts">
  import { icons, type IconName } from '../lib/icons';

  let { name, class: className = 'size-4' }: { name: IconName; class?: string } = $props();
</script>

<span class="inline-flex shrink-0 [&>svg]:size-full {className}" aria-hidden="true">{@html icons[name]}</span>
