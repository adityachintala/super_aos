<script lang="ts">
  // Floating progress panel for the past-quiz page: completed / total and a percentage,
  // per unit and overall. Reads the same store the question cards write to.
  import { onMount } from 'svelte';
  import Icon from '../Icon.svelte';
  import { loadPyqStatus, pyqStatus } from '../../lib/pyq-status';

  let { units }: { units: { id: number | string; title: string; ids: string[] }[] } = $props();

  const OPEN_KEY = 'super-aos-pyq-tracker-open';
  let open = $state(true);

  onMount(() => {
    loadPyqStatus();
    try {
      const saved = localStorage.getItem(OPEN_KEY);
      if (saved !== null) open = saved === '1';
      else if (window.matchMedia('(max-width: 640px)').matches) open = false;
    } catch {
      // storage blocked: keep the default
    }
  });

  function toggle() {
    open = !open;
    try {
      localStorage.setItem(OPEN_KEY, open ? '1' : '0');
    } catch {
      // ignore
    }
  }

  const pct = (done: number, total: number) => (total ? Math.round((done / total) * 100) : 0);

  const rows = $derived(
    units.map((u) => {
      let done = 0;
      let revisit = 0;
      for (const id of u.ids) {
        const s = $pyqStatus[id];
        if (s === 'completed') done++;
        else if (s === 'revisit') revisit++;
      }
      const total = u.ids.length;
      return { ...u, done, revisit, total, left: total - done, pct: pct(done, total) };
    }),
  );
  const total = $derived(rows.reduce((n, r) => n + r.total, 0));
  const done = $derived(rows.reduce((n, r) => n + r.done, 0));
  const revisit = $derived(rows.reduce((n, r) => n + r.revisit, 0));
  const overall = $derived(pct(done, total));
</script>

<div class="fixed right-4 bottom-4 z-50 w-[min(18rem,calc(100vw-2rem))] text-sm">
  <div class="bg-card/95 overflow-hidden rounded-xl border shadow-lg backdrop-blur">
    <button
      type="button"
      class="hover:bg-muted/60 flex w-full items-center gap-2 px-4 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-outline/50"
      aria-expanded={open}
      aria-controls="pyq-tracker-body"
      onclick={toggle}
    >
      <Icon name="chartPie" class="text-primary-accent size-4.5" />
      <span class="font-semibold">Progress</span>
      <span class="ml-auto font-mono tabular-nums">{done}/{total}</span>
      <span class="bg-primary/10 text-primary-accent rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums">{overall}%</span>
      <Icon name="chevronDown" class="size-4 transition-transform {open ? '' : 'rotate-180'}" />
    </button>

    {#if open}
      <div id="pyq-tracker-body" class="max-h-[60vh] overflow-y-auto border-t px-4 pt-2 pb-3">
        <ul class="grid gap-2.5">
          {#each rows as r}
            <li>
              <a class="hover:text-primary-accent flex items-baseline gap-2" href={`#unit-${r.id}`}>
                <span class="min-w-0 flex-1 truncate"><span class="text-muted-foreground">U{r.id}</span> {r.title}</span>
                <span class="font-mono text-xs tabular-nums">{r.done}/{r.total}</span>
                <span class="w-10 text-right font-mono text-xs font-semibold tabular-nums">{r.pct}%</span>
              </a>
              <div class="bg-muted mt-1 h-1.5 overflow-hidden rounded-full" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={r.pct} aria-label="Unit {r.id} progress">
                <div class="bg-success h-full rounded-full transition-[width]" style="width: {r.pct}%"></div>
              </div>
              <p class="text-muted-foreground mt-0.5 text-xs">
                {r.left} left{#if r.revisit}{' · '}{r.revisit} to revisit{/if}
              </p>
            </li>
          {/each}
        </ul>

        <div class="mt-3 border-t pt-3">
          <div class="flex items-baseline gap-2 font-semibold">
            <span class="flex-1">All units</span>
            <span class="font-mono text-xs tabular-nums">{done}/{total}</span>
            <span class="w-10 text-right font-mono text-xs tabular-nums">{overall}%</span>
          </div>
          <div class="bg-muted mt-1 h-2 overflow-hidden rounded-full" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={overall} aria-label="Overall progress">
            <div class="bg-success h-full rounded-full transition-[width]" style="width: {overall}%"></div>
          </div>
          <p class="text-muted-foreground mt-1 text-xs">
            {done} completed · {total - done} left{#if revisit}{' · '}{revisit} to revisit{/if}
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>
