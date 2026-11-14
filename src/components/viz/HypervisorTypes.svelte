<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';

  type Kind = 'none' | 't0' | 't1' | 't2' | 'para' | 'container' | 'jvm';
  type Tone = 'hw' | 'vmm' | 'os' | 'guest' | 'app';
  interface Layer {
    /** One or more boxes side by side, drawn from the top of the stack downwards. */
    boxes: { label: string; tone: Tone }[];
  }
  const TONE: Record<Tone, string> = {
    hw: 'bg-muted text-foreground',
    vmm: 'bg-chart-1 text-white',
    os: 'bg-chart-2 text-white',
    guest: 'bg-chart-3 text-white',
    app: 'bg-chart-4 text-white',
  };
  const apps = (n: number): Layer => ({ boxes: Array.from({ length: n }, () => ({ label: 'apps', tone: 'app' })) });
  const guests = (names: string[]): Layer => ({ boxes: names.map((label) => ({ label, tone: 'guest' })) });
  const hw: Layer = { boxes: [{ label: 'Hardware (CPU, memory, I/O devices)', tone: 'hw' }] };

  const KINDS: { id: Kind; label: string; stack: Layer[]; text: string; examples: string }[] = [
    {
      id: 'none',
      label: 'No virtualization',
      stack: [apps(3), { boxes: [{ label: 'Operating system kernel', tone: 'os' }] }, hw],
      text: 'One kernel has the hardware to itself and runs in kernel mode. Applications are tied to this operating system on this machine.',
      examples: 'An ordinary laptop',
    },
    {
      id: 't0',
      label: 'Type 0',
      stack: [apps(3), guests(['guest OS', 'guest OS', 'guest OS']), { boxes: [{ label: 'VMM in firmware (partitions, domains)', tone: 'vmm' }] }, hw],
      text: 'A hardware feature implemented in firmware. Each guest gets dedicated hardware, so the guest OS needs to do nothing special. The feature set is smaller than other types, and I/O is a challenge because there are rarely enough devices to dedicate one to each guest.',
      examples: 'IBM LPARs, Oracle LDOMs',
    },
    {
      id: 't1',
      label: 'Type 1',
      stack: [apps(3), guests(['Windows', 'Linux', 'Linux']), { boxes: [{ label: 'Hypervisor: runs natively, in kernel mode', tone: 'vmm' }] }, hw],
      text: 'Operating-system-like software built to provide virtualization. It runs directly on the hardware, has its own device drivers, and instead of a system-call interface it creates, runs and manages guest operating systems. The "data-centre operating system". A variant is a general-purpose OS that also provides VMM functions.',
      examples: 'VMware ESX, Citrix XenServer; Linux with KVM, Windows Server with Hyper-V',
    },
    {
      id: 't2',
      label: 'Type 2',
      stack: [
        { boxes: [{ label: 'apps', tone: 'app' }, { label: 'apps', tone: 'app' }, { label: 'host apps', tone: 'app' }] },
        { boxes: [{ label: 'guest OS', tone: 'guest' }, { label: 'guest OS', tone: 'guest' }, { label: '', tone: 'app' }] },
        { boxes: [{ label: 'VMM (an ordinary process)', tone: 'vmm' }, { label: '', tone: 'app' }] },
        { boxes: [{ label: 'Host operating system', tone: 'os' }] },
        hw,
      ],
      text: 'An application that runs on a standard operating system and provides VMM features to guests. The host does not even know it is running a VMM. It needs no changes to the host OS, but performance is poorer because it cannot use some hardware features directly.',
      examples: 'VMware Workstation and Fusion, Parallels Desktop, Oracle VirtualBox',
    },
    {
      id: 'para',
      label: 'Paravirtualization',
      stack: [apps(3), guests(['modified guest', 'modified guest', 'modified guest']), { boxes: [{ label: 'VMM offering hypercalls', tone: 'vmm' }] }, hw],
      text: 'The VMM does not present an exact copy of the hardware. Instead the guest OS is modified to cooperate with it, calling the hypervisor directly (a hypercall) for things such as page-table updates and using simple shared-memory device interfaces. Faster, but the guest must be changed.',
      examples: 'Xen (before hardware support made modification unnecessary)',
    },
    {
      id: 'container',
      label: 'Containers',
      stack: [apps(3), { boxes: [{ label: 'zone', tone: 'guest' }, { label: 'zone', tone: 'guest' }, { label: 'zone', tone: 'guest' }] }, { boxes: [{ label: 'One host kernel, shared by every zone', tone: 'os' }] }, hw],
      text: 'Application containment is not virtualization at all. Only one kernel runs. A virtual layer between the OS and the applications gives each zone its own applications, network stack, addresses, ports and user accounts, with CPU and memory divided between zones. Light and fast, but every container must use the host’s kernel.',
      examples: 'Oracle Solaris Zones, BSD Jails, IBM AIX WPARs, Linux containers',
    },
    {
      id: 'jvm',
      label: 'Language VM',
      stack: [
        { boxes: [{ label: 'Java program (bytecode)', tone: 'app' }] },
        { boxes: [{ label: 'Java virtual machine: class loader, interpreter, JIT, garbage collector', tone: 'vmm' }] },
        { boxes: [{ label: 'Host operating system', tone: 'os' }] },
        hw,
      ],
      text: 'Programming-environment virtualization does not virtualize real hardware. It defines an optimised virtual system through an API, and programs written in the language run inside it. The JVM is compiled for each architecture, so the same bytecode runs anywhere.',
      examples: 'Oracle Java (JVM), Microsoft .NET',
    },
  ];

  let kind = $state<Kind>('t1');
  const k = $derived(KINDS.find((x) => x.id === kind)!);
</script>

<VizCard kind="Try it" title="Where does the virtualization layer sit?">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Kind of virtualization">
    {#each KINDS as x}
      <Button variant={x.id === kind ? 'primary' : 'outline'} size="sm" aria-pressed={x.id === kind} onclick={() => (kind = x.id)}>{x.label}</Button>
    {/each}
  </div>

  <div class="mt-4 grid gap-5 md:grid-cols-[1fr_1fr]">
    <div class="grid content-end gap-1" role="img" aria-label={`Software stack, top to bottom: ${k.stack.map((l) => l.boxes.map((b) => b.label).filter(Boolean).join(' and ')).join('; ')}`}>
      {#each k.stack as layer}
        <div class="flex gap-1">
          {#each layer.boxes as box}
            <div class="grid min-h-9 flex-1 place-items-center rounded-sm px-2 py-1.5 text-center text-xs font-medium {box.label ? TONE[box.tone] : 'invisible'}">{box.label}</div>
          {/each}
        </div>
      {/each}
    </div>
    <div class="text-sm" role="status">
      <p>{k.text}</p>
      <p class="text-muted-foreground mt-3">Examples: {k.examples}.</p>
    </div>
  </div>

  <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs">
    <span class="flex items-center gap-1.5"><span class="bg-chart-1 size-2.5 rounded-xs"></span>virtualization layer</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-2 size-2.5 rounded-xs"></span>host kernel</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-3 size-2.5 rounded-xs"></span>guest</span>
    <span class="flex items-center gap-1.5"><span class="bg-chart-4 size-2.5 rounded-xs"></span>applications</span>
  </div>
</VizCard>
