import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  type: {
    id: 'vmx-check-type',
    type: 'mcq',
    prompt: 'A student installs Oracle VirtualBox on a Windows laptop and runs Linux inside it. What kind of hypervisor is VirtualBox?',
    options: ['Type 0', 'Type 1', 'Type 2', 'It is an emulator, not a hypervisor'],
    answer: 2,
    explanation:
      '<b>Type 2.</b> VirtualBox is an application that runs on a standard host operating system and provides VMM features to guests. To Windows it is just another process. A Type 1 hypervisor would run directly on the hardware with no host OS underneath.',
  },
  mode: {
    id: 'vmx-check-mode',
    type: 'mcq',
    prompt: 'Under trap-and-emulate, in which <b>real</b> CPU mode does the kernel of a guest operating system execute?',
    options: ['Kernel mode, like any kernel', 'User mode', 'A special firmware mode', 'It alternates on every instruction'],
    answer: 1,
    explanation:
      'It is not safe to let a guest kernel run in real kernel mode, so the whole guest runs in <b>real user mode</b>. The VMM keeps track of whether the guest <i>believes</i> it is in user or kernel mode: "virtual user mode" and "virtual kernel mode". Only the VMM runs in real kernel mode.',
  },
  popf: {
    id: 'vmx-check-popf',
    type: 'mcq',
    prompt: 'Why could trap-and-emulate not be used on its own to virtualise early Intel x86 processors?',
    options: [
      'They had no kernel mode',
      'Some sensitive instructions, such as popf, behave differently in user mode but do not cause a trap',
      'They could not address enough memory',
      'They trapped on every instruction, making it too slow',
    ],
    answer: 1,
    explanation:
      'Trap-and-emulate depends on privileged operations <b>trapping</b> when attempted in user mode. On early x86, <code>popf</code> silently replaces only some of the flags in user mode and generates <b>no trap</b>, so the VMM never gets control. Binary translation was invented to get round such "special instructions".',
  },
  balloon: {
    id: 'vmx-check-balloon',
    type: 'mcq',
    prompt: 'A VMM is short of physical memory. How does a balloon driver help it reclaim memory from a guest?',
    options: [
      'It deletes the guest’s least-used files',
      'It makes the guest allocate memory inside itself, so the guest’s own OS frees pages, which the VMM can then give to others',
      'It compresses all the guest’s pages on disk',
      'It shuts the guest down until memory is available',
    ],
    answer: 1,
    explanation:
      'The balloon is a pseudo-device driver loaded into the guest. When the VMM asks it to "inflate", it <b>allocates memory in the guest</b> and pins it. The guest OS, feeling memory pressure, uses <i>its own</i> policies to choose what to free or page out. The VMM knows the ballooned pages are unused and reallocates them. The guest decides what to give up, which it does far better than the VMM could.',
  },
  migration: {
    id: 'vmx-check-migration',
    type: 'numeric',
    prompt: 'A guest with 8,000 pages of memory is being live-migrated. Pages are sent at 1,000 pages per second, and the running guest dirties 500 pages per second. After the first round has sent every page, how many pages must be sent in the second round?',
    answer: 4000,
    unit: 'pages',
    hint: 'How long does the first round take, and how many pages are dirtied in that time?',
    explanation: 'Round 1 takes 8,000 ÷ 1,000 = 8 seconds. In that time the guest dirties 8 × 500 = <b>4,000</b> pages, which are now out of date on the target and must be sent again. Round 3 will send 2,000, and so on.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  memory: {
    id: 'vmx-practice-memory',
    type: 'written',
    marks: 5,
    prompt: 'Memory is usually over-committed in a virtualised system. Describe the methods a VMM such as VMware ESX uses to manage it.',
    points: [
      'Over-commitment: the total memory configured for the guests exceeds the physical memory, so the VMM must reclaim memory from guests',
      'Double paging: the VMM has its own page-replacement algorithm and moves guest pages to its backing store, although the guest believes they are in physical memory',
      'Ballooning: a pseudo-device driver in each guest allocates (pins) memory when told to by the VMM, making the guest OS free pages that the VMM can reallocate',
      'Deflating the balloon returns memory to the guest when pressure eases',
      'Deduplication: the VMM detects identical pages loaded more than once and maps the same physical page into several guests (shared copy-on-write)',
    ],
    modelAnswer:
      '<p>Each guest is configured with an amount of "physical" memory, and the total across guests usually <b>exceeds the real memory</b> of the host. The VMM must therefore work out each guest’s real memory use and reclaim memory. VMware ESX uses three methods.</p><p class="mt-2"><b>1. Double paging.</b> The VMM has its own page-replacement algorithm and pages guest memory out to its own backing store. The guest’s page table still says the page is in a physical frame. This is the last resort: the VMM knows less than the guest about which pages matter, and a page may end up being paged by both.</p><p class="mt-2"><b>2. Ballooning.</b> A <b>pseudo-device driver</b> is installed in each guest. It looks like a device driver to the guest kernel but simply adds kernel-mode code. This <b>balloon memory manager</b> communicates with the VMM. Told to inflate, it allocates memory in the guest and pins it; the guest, now under memory pressure, frees or pages out memory using its own algorithms, and the VMM reallocates the ballooned frames. Told to deflate, it releases the memory back to the guest.</p><p class="mt-2"><b>3. Deduplication.</b> The VMM determines whether the same page has been loaded more than once, for example by many guests running the same OS, and maps one physical copy into all of them, reducing the number of frames needed.</p>',
  },
  compare: {
    id: 'vmx-practice-compare',
    type: 'written',
    marks: 4,
    prompt: 'Distinguish between a Type 1 and a Type 2 hypervisor, giving an example of each.',
    points: [
      'Type 1: operating-system-like software that runs directly on the hardware, in kernel mode, with its own device drivers; it creates, runs and manages guest operating systems',
      'Type 1 examples: VMware ESX, Citrix XenServer (or a general-purpose OS with VMM functions such as Linux KVM or Hyper-V); used in data centres',
      'Type 2: an application that runs on a standard host operating system as an ordinary process and provides VMM features to guests',
      'Type 2 examples: VMware Workstation, VirtualBox, Parallels; it needs no change to the host OS but performs worse because it cannot exploit some hardware features',
    ],
    modelAnswer:
      '<p>A <b>Type 1 hypervisor</b> is operating-system-like software built to provide virtualization. It <b>runs natively on the hardware</b> in kernel mode, implements device drivers for the host hardware, and provides CPU and memory management, but instead of a system-call interface it creates, runs and manages guest operating systems. Guests generally do not know they are in a VM. Type 1 hypervisors are the "data-centre operating systems", used for consolidation, moving guests between hosts, snapshots and cloning. Examples: <b>VMware ESX, Citrix XenServer</b>; general-purpose systems with VMM functions such as <b>Linux with KVM</b> and <b>Windows Server with Hyper-V</b> are a variant.</p><p class="mt-2">A <b>Type 2 hypervisor</b> is an <b>application that runs on a standard host operating system</b>. The VMM is simply another process, run and managed by the host, which does not even know it is a VMM. It requires <b>no changes to the host OS</b>, so anyone can install one, but it tends to have <b>poorer performance</b> because it cannot take advantage of some hardware features. Examples: <b>VMware Workstation and Fusion, Parallels Desktop, Oracle VirtualBox</b>.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'vmx-cp-terms',
    type: 'mcq',
    prompt: 'In virtualization terminology, what is the "guest"?',
    options: [
      'The underlying hardware system',
      'The software that creates and runs virtual machines',
      'A process provided with a virtual copy of the host, usually an operating system',
      'A user logged in over the network',
    ],
    answer: 2,
    explanation:
      'The <b>host</b> is the underlying hardware system. The <b>virtual machine manager (VMM)</b>, or hypervisor, creates and runs virtual machines by providing an interface identical to the host. The <b>guest</b> is the process given a virtual copy of the host, which is usually an operating system.',
  },
  {
    id: 'vmx-cp-type1',
    type: 'mcq',
    prompt: 'Which of these is a Type 1 hypervisor?',
    options: ['Oracle VirtualBox', 'VMware Workstation', 'VMware ESX', 'The Java virtual machine'],
    answer: 2,
    explanation:
      '<b>VMware ESX</b> runs directly on the hardware as special-purpose, OS-like software. VirtualBox and VMware Workstation are Type 2 (applications on a host OS). The JVM is programming-environment virtualization and does not virtualise hardware at all.',
  },
  {
    id: 'vmx-cp-requirements',
    type: 'multi',
    prompt: 'Which of these are among the three formal requirements for virtualization?',
    options: [
      'The VMM provides an environment for programs that is essentially identical to the original machine',
      'Programs running in that environment show only minor decreases in performance',
      'The guest operating system must be modified to cooperate with the VMM',
      'The VMM is in complete control of system resources',
    ],
    answers: [0, 1, 3],
    explanation:
      'The classic definition has three parts: <b>fidelity</b> (an essentially identical environment), <b>performance</b> (only minor slowdowns) and <b>safety</b> (the VMM has complete control of resources). Requiring a modified guest is paravirtualization, which by this definition is not true virtualization.',
  },
  {
    id: 'vmx-cp-para',
    type: 'tf',
    prompt: 'True or false: with paravirtualization, an unmodified guest operating system can run, because the VMM presents an exact duplicate of the hardware.',
    answer: false,
    explanation:
      'False. Paravirtualization does <b>not</b> present an exact duplicate of the hardware. The VMM offers services that the <b>guest must be modified</b> to use, such as hypercalls for page-table changes and simple shared-buffer device interfaces. The reward is better performance. Corrected: "With paravirtualization the guest OS is modified to cooperate with the VMM."',
  },
  {
    id: 'vmx-cp-emulation',
    type: 'mcq',
    prompt: 'What distinguishes emulation from virtualization?',
    options: [
      'Emulation requires hardware support from the CPU',
      'Emulation allows a guest compiled for a different CPU architecture to run, by translating all its instructions',
      'Emulation is always faster',
      'Emulation shares one kernel among all guests',
    ],
    answer: 1,
    explanation:
      'Virtualization requires the underlying CPU to be the same as the one the guest was compiled for. <b>Emulation</b> lets a guest run on a <i>different</i> CPU by translating every guest instruction to native ones. The price is performance, which can be an order of magnitude slower than native code.',
  },
  {
    id: 'vmx-cp-container',
    type: 'mcq',
    prompt: 'How many operating-system kernels are running on a host that holds ten application containers (zones)?',
    options: ['One', 'Two', 'Ten', 'Eleven'],
    answer: 0,
    explanation:
      '<b>One.</b> Application containment is not virtualization: only the host kernel runs. Each zone gets its own applications, network stack, addresses, ports and user accounts, and a share of CPU and memory, giving the impression that its processes are alone on the system. Ten VMs, by contrast, would mean ten guest kernels plus the VMM.',
  },
  {
    id: 'vmx-cp-npt',
    type: 'mcq',
    prompt: 'What are nested page tables used for?',
    options: [
      'To let a guest read another guest’s memory',
      'To let the VMM keep page-table state for each guest, mapping what the guest thinks is physical memory to real physical memory',
      'To store pages that have been swapped to disk',
      'To speed up the host’s file system',
    ],
    answer: 1,
    explanation:
      'Each guest maintains page tables translating its virtual addresses to what it <i>believes</i> are physical addresses. The VMM maintains per-guest <b>nested page tables</b> representing that state and mapping it to real machine memory, much as a VCPU stores the guest’s CPU state. The cost is more TLB misses, which is why hardware support for NPTs was added.',
  },
  {
    id: 'vmx-cp-overcommit',
    type: 'mcq',
    prompt: 'A guest’s time-sharing scheduler believes it is giving each process a 100 ms time slice. On a host whose CPUs are heavily over-committed, what may actually happen?',
    options: [
      'Each slice becomes shorter than 100 ms',
      'A slice may take 100 ms, one second or longer of real time, giving poor response and wrong time-of-day clocks',
      'The guest crashes',
      'Nothing changes: the guest has dedicated CPUs',
    ],
    answer: 1,
    explanation:
      'With CPU over-commitment the VMM gives each virtual CPU only part of a real one, and may also take cycles itself. A guest cannot see this, so a 100 ms slice may take <b>much longer</b> in real time. Users of the guest see poor response times, and its time-of-day clock drifts, which is why VMMs supply tools that run in the guest to correct the clock.',
  },
  {
    id: 'vmx-cp-trap',
    type: 'written',
    marks: 6,
    prompt: 'Explain the trap-and-emulate technique. Why was it not sufficient on early x86 processors, and how does binary translation solve the problem?',
    points: [
      'The guest runs entirely in real user mode; the VMM tracks virtual user mode and virtual kernel mode in a virtual CPU (VCPU)',
      'When the guest kernel attempts a privileged instruction in user mode, the CPU traps; the VMM gains control, emulates the operation on behalf of the guest, and returns control to the guest',
      'User-mode guest code runs at native speed, but privileged code is slower because of the traps',
      'Early x86 had no clean separation of privileged and non-privileged instructions: "special" instructions such as popf behave differently in user mode but generate no trap',
      'Binary translation: when the guest VCPU is in virtual kernel mode, the VMM examines the instructions about to execute, lets ordinary ones run natively, and translates special ones into equivalent safe code',
      'Translations are cached so each piece of code is translated once, keeping the slowdown small',
    ],
    modelAnswer:
      '<p><b>Trap-and-emulate.</b> A dual-mode CPU cannot safely let a guest kernel run in kernel mode, so the entire guest runs in <b>real user mode</b>. The VMM gives each guest a <b>virtual CPU</b> recording, among other things, whether the guest thinks it is in <b>virtual user mode</b> or <b>virtual kernel mode</b>. When the guest kernel attempts a <b>privileged instruction</b>, the CPU, being in user mode, raises a <b>trap</b>. The VMM gains control, analyses the error, <b>emulates</b> the operation that the guest attempted (updating the VCPU), and returns control to the guest. Ordinary user-mode code runs at native speed; privileged code is slower because every such instruction costs a trap.</p><p class="mt-2"><b>The x86 problem.</b> Trap-and-emulate assumes every sensitive instruction traps in user mode. Early x86 CPUs have no clean separation between privileged and non-privileged instructions. For example <code>popf</code> loads the flags register from the stack: in privileged mode all flags are replaced, in user mode only some are, and <b>no trap is generated</b>. The VMM never learns that the guest tried to change the flags. Such "special instructions" made trap-and-emulate appear impossible on x86 until 1998.</p><p class="mt-2"><b>Binary translation.</b> If the guest VCPU is in user mode, the guest runs natively. If it is in virtual kernel mode, the VMM <b>examines every instruction</b> the guest is about to execute by reading ahead of the program counter. Non-special instructions run natively; <b>special instructions are translated</b> into a new set of instructions that perform the equivalent task, such as changing the flags in the VCPU. To make this fast, translations are <b>cached</b>: code is translated once and the cached version reused. Booting Windows XP needed about 950,000 translations of 3 microseconds each, roughly a 5% slowdown.</p>',
  },
  {
    id: 'vmx-cp-live',
    type: 'written',
    marks: 5,
    prompt: 'Describe the steps by which a running guest is moved from one host to another by live migration, and explain why users see no interruption.',
    points: [
      'The source VMM establishes a connection with the target VMM, and the target creates a new guest (new VCPU and so on)',
      'The source sends all read-only guest memory pages, then all read-write pages, marking them clean',
      'It repeats the read-write step, because the still-running guest has dirtied some pages meanwhile',
      'When that cycle becomes very short, the source freezes the guest and sends the VCPU’s final state, other state and the final dirty pages, and tells the target to start the guest',
      'Once the target acknowledges that the guest is running, the source terminates its copy; the guest ran throughout the copying, and the freeze is too brief to notice',
    ],
    modelAnswer:
      '<p>Live migration moves a <b>running</b> guest between systems without interrupting user access to the guest or its applications. It is useful for load balancing and for emptying a host before maintenance.</p><ol class="mt-1 list-decimal space-y-1 pl-5"><li>The source VMM <b>establishes a connection</b> with the target VMM.</li><li>The target <b>creates a new guest</b> by creating a new VCPU and so on.</li><li>The source sends all <b>read-only</b> guest memory pages to the target.</li><li>The source sends all <b>read-write</b> pages to the target, marking them as clean.</li><li>The source <b>repeats step 4</b>, because during that step some pages were probably modified by the guest and are now dirty.</li><li>When the cycle of steps 4 and 5 becomes very short, the source VMM <b>freezes the guest</b>, sends the VCPU’s final state and other state details, sends the final dirty pages, and tells the target to start running the guest.</li><li>Once the target acknowledges that the guest is running, the source <b>terminates</b> its copy.</li></ol><p class="mt-2">The guest keeps executing during all the bulk copying; it is stopped only for the last small set of dirty pages and the CPU state, typically a fraction of a second, so network connections survive and users notice nothing. Storage is normally on shared network storage, so disks need not be moved.</p>',
  },
];
