<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';

  const PARTS = ['Components', 'Interrelationships', 'Boundary', 'Purpose', 'Environment', 'Interfaces', 'Input', 'Output', 'Constraints'] as const;
  type Part = (typeof PARTS)[number];

  const MEANING: Record<Part, string> = {
    Components: 'The parts, or subsystems, that make up the system.',
    Interrelationships: 'The dependence of one subsystem on one or more others.',
    Boundary: 'The limit that contains all the components and separates the system from other systems.',
    Purpose: 'The overall goal or function of the system: its reason for existing.',
    Environment: 'Everything external to the system that interacts with it.',
    Interfaces: 'The points of contact where the system meets its environment, or where subsystems meet each other.',
    Input: 'Whatever the system takes from its environment in order to fulfil its purpose.',
    Output: 'Whatever the system returns to its environment in order to fulfil its purpose.',
    Constraints: 'Limits on what the system can accomplish: capacity, speed or capabilities.',
  };

  const SYSTEMS: { id: string; name: string; parts: Record<Part, string> }[] = [
    {
      id: 'restaurant',
      name: 'A fast-food restaurant',
      parts: {
        Components: 'Kitchen, counter, dining room, storage, office.',
        Interrelationships: 'The counter depends on the kitchen for prepared food; the kitchen depends on storage for ingredients; the office depends on the counter for the takings.',
        Boundary: 'The walls of the restaurant, and the line between its staff and everyone else.',
        Purpose: 'To serve food to customers quickly, at a profit.',
        Environment: 'Customers, food distributors, banks, the health department.',
        Interfaces: 'The counter and the drive-through window (to customers); the loading dock (to distributors).',
        Input: 'Food, labour, cash.',
        Output: 'Prepared food, bank deposits, trash.',
        Constraints: 'Which foods are popular, health-department regulations, limited storage space.',
      },
    },
    {
      id: 'os',
      name: 'A computer operating system',
      parts: {
        Components: 'Process manager, memory manager, file system, I/O subsystem and device drivers, protection system.',
        Interrelationships: 'The file system depends on the I/O subsystem to reach the disk; virtual memory depends on both the memory manager and the disk; everything depends on process management to be scheduled.',
        Boundary: 'The kernel: the code that runs in kernel mode. Below it is hardware, above it are user programs.',
        Purpose: 'To make the computer convenient to use, and to use its hardware efficiently.',
        Environment: 'Users and their application programs above; the hardware (CPU, memory, devices) below; other computers on the network.',
        Interfaces: 'The system-call interface and the command interpreter or GUI (upwards); device drivers and the interrupt mechanism (downwards).',
        Input: 'Requests for service: commands from users, system calls from programs, and interrupts from hardware devices. Also the programs and data to be run.',
        Output: 'Services and their results: programs loaded and run, data read and written, resources allocated, error reports, and control signals to devices.',
        Constraints: 'The speed of the CPU, the amount of memory, the number and speed of the devices, and the requirement to stay protected and fair.',
      },
    },
  ];

  let sys = $state('restaurant');
  let part = $state<Part>('Input');
  const s = $derived(SYSTEMS.find((x) => x.id === sys)!);
</script>

<VizCard kind="Try it" title="The nine characteristics of a system">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Which system">
    {#each SYSTEMS as x}
      <Button variant={x.id === sys ? 'primary' : 'outline'} size="sm" aria-pressed={x.id === sys} onclick={() => (sys = x.id)}>{x.name}</Button>
    {/each}
  </div>

  <div class="mt-4 grid gap-4 md:grid-cols-[13rem_1fr]">
    <div class="grid content-start gap-1" role="group" aria-label="Characteristic">
      {#each PARTS as p, i}
        <button
          type="button"
          class="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-outline/50 {p === part ? 'border-primary bg-primary/7 font-medium' : 'hover:bg-muted'}"
          aria-pressed={p === part}
          onclick={() => (part = p)}
        >
          <span class="text-muted-foreground w-4 text-xs tabular-nums">{i + 1}</span>{p}
        </button>
      {/each}
    </div>
    <div class="rounded-md border p-4" role="status">
      <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">{part}</p>
      <p class="mt-1 text-sm">{MEANING[part]}</p>
      <p class="text-muted-foreground mt-4 text-xs font-medium tracking-wider uppercase">In {s.name.toLowerCase()}</p>
      <p class="mt-1">{s.parts[part]}</p>
    </div>
  </div>
</VizCard>
