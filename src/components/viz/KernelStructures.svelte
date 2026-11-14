<script lang="ts">
  import VizCard from './VizCard.svelte';
  import { Button } from '../starwind-svelte/button';

  type Tone = 'hw' | 'kernel' | 'user' | 'app';
  interface Box { label: string; tone: Tone }
  const TONE: Record<Tone, string> = {
    hw: 'bg-muted text-foreground',
    kernel: 'bg-chart-4 text-white',
    user: 'bg-chart-2 text-white',
    app: 'bg-chart-1 text-white',
  };
  const row = (tone: Tone, ...labels: string[]): Box[] => labels.map((label) => ({ label, tone }));
  const hw = row('hw', 'Hardware');

  const KINDS: { id: string; label: string; stack: Box[][]; text: string; good: string[]; bad: string[]; examples: string }[] = [
    {
      id: 'simple',
      label: 'Simple',
      stack: [row('app', 'Application program'), row('user', 'Resident system program'), row('kernel', 'MS-DOS device drivers'), row('kernel', 'ROM BIOS device drivers'), hw],
      text: 'Written to provide the most functionality in the least space, and not divided into modules. The interfaces and levels of functionality are not well separated: an application can call the BIOS routines directly and write straight to the display and disk drives.',
      good: ['Small and fast on very limited hardware'],
      bad: ['No protection: an errant program can crash the whole system', 'Hard to change, because everything can depend on everything'],
      examples: 'MS-DOS',
    },
    {
      id: 'monolithic',
      label: 'Monolithic',
      stack: [
        row('app', 'Users'),
        row('user', 'Shells and commands', 'Compilers and interpreters', 'System libraries'),
        row('kernel', 'System-call interface to the kernel'),
        row('kernel', 'Signals, terminal handling, character I/O', 'File system, swapping, block I/O', 'CPU scheduling, page replacement, virtual memory'),
        row('kernel', 'Kernel interface to the hardware'),
        row('hw', 'Terminal controllers', 'Device controllers', 'Memory controllers'),
      ],
      text: 'Two separable parts: the system programs and the kernel. The kernel is everything below the system-call interface and above the physical hardware. It provides the file system, CPU scheduling, memory management and other functions: an enormous amount of functionality combined into one level, running in one address space.',
      good: ['Very little overhead in the system-call interface or in communication within the kernel: everything is a procedure call'],
      bad: ['Difficult to implement, extend and maintain', 'A bug anywhere in the kernel can bring down the system'],
      examples: 'Traditional UNIX; Linux and Windows are largely monolithic',
    },
    {
      id: 'layered',
      label: 'Layered',
      stack: [row('app', 'Layer 5: user programs'), row('kernel', 'Layer 4: I/O buffering'), row('kernel', 'Layer 3: operator-console device driver'), row('kernel', 'Layer 2: memory manager'), row('kernel', 'Layer 1: CPU scheduler'), row('hw', 'Layer 0: hardware')],
      text: 'The operating system is divided into a number of layers, each built on top of lower layers. The bottom layer is the hardware and the highest is the user interface. Each layer uses the functions and services of only lower-level layers, and hides its own data structures and operations from the layers above.',
      good: ['Simple to construct and debug: layer 1 is debugged using only the hardware, then layer 2 using a correct layer 1, and so on', 'An error found while debugging a layer must be in that layer', 'Each layer can be changed without affecting the others, provided its interface is kept'],
      bad: ['Appropriately defining the layers is hard: a layer can use only lower layers, and some functions need each other', 'Less efficient: a system call may pass through every layer, each adding overhead'],
      examples: 'THE (Dijkstra), Venus (Liskov)',
    },
    {
      id: 'micro',
      label: 'Microkernel',
      stack: [row('app', 'Application program'), row('user', 'File system', 'Device drivers', 'Pager'), row('kernel', 'Microkernel: interprocess communication, basic memory management, CPU scheduling'), hw],
      text: 'Moves as much as possible out of the kernel into user space, leaving a small kernel that provides minimal process and memory management and a communication facility. The file system and device drivers run as ordinary user-level processes. Communication between them takes place by message passing through the microkernel.',
      good: ['Easier to extend: new services are added in user space with no change to the kernel', 'Easier to port to a new architecture', 'More reliable and more secure: less code runs in kernel mode, and a failed service does not take the rest down'],
      bad: ['Performance overhead of user-space to kernel-space communication: a request that was one procedure call becomes several messages and mode switches'],
      examples: 'Mach, QNX, MINIX 3; the Mach part of macOS',
    },
    {
      id: 'modules',
      label: 'Modules',
      stack: [row('app', 'Applications'), row('kernel', 'Scheduling classes', 'File systems', 'Loadable system calls'), row('kernel', 'Core kernel'), row('kernel', 'Executable formats', 'STREAMS modules', 'Device and bus drivers'), hw],
      text: 'The kernel has a set of core components and links in additional services through loadable kernel modules, either at boot time or at run time. It uses an object-oriented approach: each core component is separate, and each talks to the others over known interfaces.',
      good: ['Like layers, each part has a defined, protected interface; but more flexible, because any module can call any other', 'Like a microkernel, the core is small; but more efficient, because modules do not need message passing to communicate', 'A file system or driver can be added without rebuilding or rebooting the kernel'],
      bad: ['A loaded module runs in kernel mode, so a faulty module can still crash the system'],
      examples: 'Solaris, Linux, macOS, Windows',
    },
    {
      id: 'hybrid',
      label: 'Hybrid',
      stack: [row('app', 'Graphical user interface (Aqua)'), row('user', 'Application environments and services (Cocoa, Java, QuickTime, BSD)'), row('kernel', 'Mach: memory, RPC and IPC, scheduling', 'BSD: networking, file systems, POSIX'), row('kernel', 'I/O Kit and kernel extensions'), hw],
      text: 'In practice very few operating systems adopt a single, strictly defined structure. They combine structures to address performance, security and usability. The macOS kernel environment consists of the Mach microkernel and a BSD UNIX component in the same address space, plus an I/O kit and dynamically loadable modules called kernel extensions.',
      good: ['Takes the advantage of each approach where it matters most'],
      bad: ['Loses the purity of any one design, so the reasoning that made that design attractive no longer fully applies'],
      examples: 'macOS and iOS (Mach plus BSD); Windows; Android (Linux kernel plus libraries and a runtime)',
    },
  ];

  let kind = $state('monolithic');
  const k = $derived(KINDS.find((x) => x.id === kind)!);
</script>

<VizCard kind="Try it" title="Ways to structure an operating system">
  <div class="flex flex-wrap gap-1.5" role="group" aria-label="Structure">
    {#each KINDS as x}
      <Button variant={x.id === kind ? 'primary' : 'outline'} size="sm" aria-pressed={x.id === kind} onclick={() => (kind = x.id)}>{x.label}</Button>
    {/each}
  </div>

  <div class="mt-4 grid gap-5 md:grid-cols-[1fr_1fr]">
    <div class="grid content-start gap-1" role="img" aria-label={`Structure, top to bottom: ${k.stack.map((r) => r.map((b) => b.label).join(' and ')).join('; ')}`}>
      {#each k.stack as boxes}
        <div class="flex gap-1">
          {#each boxes as box}
            <div class="grid min-h-9 flex-1 place-items-center rounded-sm px-2 py-1.5 text-center text-xs font-medium {TONE[box.tone]}">{box.label}</div>
          {/each}
        </div>
      {/each}
      <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span class="flex items-center gap-1.5"><span class="bg-chart-1 size-2.5 rounded-xs"></span>applications</span>
        <span class="flex items-center gap-1.5"><span class="bg-chart-2 size-2.5 rounded-xs"></span>system code in user mode</span>
        <span class="flex items-center gap-1.5"><span class="bg-chart-4 size-2.5 rounded-xs"></span>kernel mode</span>
      </div>
    </div>
    <div class="text-sm" role="status">
      <p>{k.text}</p>
      <p class="mt-3 font-medium">Advantages</p>
      <ul class="text-muted-foreground mt-1 list-disc space-y-1 pl-5">{#each k.good as g}<li>{g}</li>{/each}</ul>
      <p class="mt-3 font-medium">Disadvantages</p>
      <ul class="text-muted-foreground mt-1 list-disc space-y-1 pl-5">{#each k.bad as b}<li>{b}</li>{/each}</ul>
      <p class="text-muted-foreground mt-3">Examples: {k.examples}.</p>
    </div>
  </div>
</VizCard>
