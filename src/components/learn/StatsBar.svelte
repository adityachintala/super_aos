<script lang="ts">
  import { onMount } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import Icon from '../Icon.svelte';
  import { progress, loadProgress } from '../../lib/progress';
  import { liveStreak } from '../../lib/mastery';

  onMount(loadProgress);
  const streak = $derived(liveStreak($progress.streak, new Date()));
</script>

<div class="flex items-center gap-1.5">
  <Badge variant="outline" title="Day streak: study on consecutive days to grow it">
    <Icon name="flame" class="size-3.5" />
    <span class="sr-only">Day streak</span>
    {streak}
  </Badge>
  <Badge variant="outline" title="Experience points earned from questions">
    <Icon name="bolt" class="size-3.5" />
    {$progress.xp}
    <span class="text-muted-foreground">XP</span>
  </Badge>
</div>
