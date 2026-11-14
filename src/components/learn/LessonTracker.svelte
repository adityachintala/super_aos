<script lang="ts">
  import { onMount } from 'svelte';
  import MasteryBadge from './MasteryBadge.svelte';
  import { loadProgress, progress, visitLesson } from '../../lib/progress';

  let { lessonId }: { lessonId: string } = $props();
  onMount(() => {
    loadProgress();
    visitLesson(lessonId);
  });
</script>

<MasteryBadge level={$progress.lessons[lessonId]?.level ?? 0} />
