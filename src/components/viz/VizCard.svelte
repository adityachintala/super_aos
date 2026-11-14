<script lang="ts">
  // The shared frame for every interactive piece in a lesson, so they all look alike.
  import type { Snippet } from 'svelte';
  import { Badge } from '../starwind-svelte/badge';
  import { Card, CardContent, CardHeader, CardTitle } from '../starwind-svelte/card';
  import Icon from '../Icon.svelte';
  import type { IconName } from '../../lib/icons';

  type Kind = 'Simulator' | 'Try it' | 'Calculator';
  let { kind = 'Simulator', title, children }: { kind?: Kind; title: string; children: Snippet } = $props();
  const icon: Record<Kind, IconName> = { Simulator: 'gamepad', 'Try it': 'handClick', Calculator: 'calculator' };
</script>

<Card size="sm" class="viz not-sw-prose my-8 text-base">
  <CardHeader>
    <Badge tone="primary" appearance="soft" size="sm" eyebrow class="w-fit"><Icon name={icon[kind]} class="size-3" />{kind}</Badge>
    <CardTitle class="text-lg">{title}</CardTitle>
  </CardHeader>
  <CardContent>
    {@render children()}
  </CardContent>
</Card>
