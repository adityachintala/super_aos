<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';

  type Model = 'onprem' | 'iaas' | 'paas' | 'saas';
  const LAYERS = ['Applications', 'Data', 'Runtime', 'Middleware', 'Operating system', 'Virtualization', 'Servers', 'Storage', 'Networking'];
  // How many layers, counted from the top, the customer still manages.
  const MODELS: { id: Model; label: string; yours: number; what: string; examples: string }[] = [
    {
      id: 'onprem',
      label: 'On-premises',
      yours: 9,
      what: 'You own and run everything, from the building’s network up to the application. Full control, with constant maintenance, poor utilisation and upgrade costs.',
      examples: 'A company’s own server room',
    },
    {
      id: 'iaas',
      label: 'IaaS',
      yours: 5,
      what: 'The provider supplies servers, storage, networks and the data-centre fabric as virtual machines. You deploy and run guest operating systems and applications, and choose when to request and release resources, but do not manage the underlying infrastructure.',
      examples: 'Amazon EC2, Google Compute Engine, Azure Virtual Machines',
    },
    {
      id: 'paas',
      label: 'PaaS',
      yours: 2,
      what: 'The provider supplies a virtualised platform: hardware plus middleware, databases, development tools and runtime support behind a programming interface. You deploy applications you built yourself and are freed from managing the infrastructure.',
      examples: 'Google App Engine, Heroku, Azure App Service',
    },
    {
      id: 'saas',
      label: 'SaaS',
      yours: 0,
      what: 'The provider runs complete application software, used through a browser by thousands of paying customers. The customer has no upfront investment in servers or software licences.',
      examples: 'Gmail, Salesforce CRM, Microsoft 365',
    },
  ];

  const FULL: Record<Model, string> = {
    onprem: 'Traditional on-premises computing',
    iaas: 'IaaS: Infrastructure as a Service',
    paas: 'PaaS: Platform as a Service',
    saas: 'SaaS: Software as a Service',
  };

  let model = $state<Model>('iaas');
  const m = $derived(MODELS.find((x) => x.id === model)!);
</script>

<VizCard kind="Try it" title="Who manages what?">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Service model">
    {#each MODELS as x}
      <Button variant={x.id === model ? 'primary' : 'outline'} size="sm" aria-pressed={x.id === model} onclick={() => (model = x.id)}>{x.label}</Button>
    {/each}
  </div>

  <div class="mt-4 grid gap-5 md:grid-cols-[14rem_1fr]">
    <ol class="grid gap-1" aria-label="Layers of the stack, top to bottom">
      {#each LAYERS as layer, i}
        {@const yours = i < m.yours}
        <li class="flex items-center justify-between rounded-sm px-2.5 py-1.5 text-sm transition-colors {yours ? 'bg-chart-1 text-white' : 'bg-muted text-muted-foreground'}">
          <span class="font-medium">{layer}</span>
          <span class="text-xs">{yours ? 'you' : 'provider'}</span>
        </li>
      {/each}
    </ol>
    <div class="text-sm" role="status">
      <p class="font-medium">
        {FULL[model]}
      </p>
      <p class="mt-2">{m.what}</p>
      <p class="text-muted-foreground mt-3">You manage <span class="text-foreground font-medium">{m.yours}</span> of the {LAYERS.length} layers.</p>
      <p class="text-muted-foreground mt-1">Examples: {m.examples}.</p>
    </div>
  </div>
</VizCard>
