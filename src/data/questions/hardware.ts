import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  bootstrap: {
    id: 'hw-check-bootstrap',
    type: 'mcq',
    prompt: 'What does the bootstrap program do?',
    options: [
      'It schedules processes',
      'It is loaded at power-up from firmware, initialises all aspects of the system, then loads the operating-system kernel and starts it',
      'It compiles the kernel',
      'It handles interrupts while the system runs',
    ],
    answer: 1,
    explanation:
      'The <b>bootstrap program</b> is stored in ROM or EPROM, generally known as <b>firmware</b>, so that it is available when memory is otherwise empty. It initialises CPU registers, device controllers and memory, then locates the kernel, loads it into memory and starts its execution.',
  },
  cycle: {
    id: 'hw-check-cycle',
    type: 'mcq',
    prompt: 'During the fetch stage of the instruction cycle, what happens to the program counter?',
    options: [
      'It is cleared to zero',
      'It supplies the address of the instruction to fetch, and is then incremented so that it points at the next instruction',
      'It is copied into the accumulator',
      'Nothing; it changes only on a jump',
    ],
    answer: 1,
    explanation:
      'The PC always holds the address of the <b>next instruction to be fetched</b>. The instruction is brought from memory into the <b>instruction register</b>, and the PC is incremented unless the instruction itself says otherwise (a jump).',
  },
  when: {
    id: 'hw-check-when',
    type: 'mcq',
    prompt: 'When does the processor check whether an interrupt is pending?',
    options: [
      'Continuously, in the middle of any instruction',
      'After executing each instruction, before fetching the next',
      'Only when the program asks',
      'Once per second',
    ],
    answer: 1,
    explanation:
      'The <b>interrupt cycle</b> is added to the end of the instruction cycle. The CPU senses the interrupt request line <b>after executing every instruction</b>. An instruction is therefore never left half done, which is what makes it possible to resume the program afterwards as if nothing had happened.',
  },
  vector: {
    id: 'hw-check-vector',
    type: 'mcq',
    prompt: 'What is the interrupt vector?',
    options: [
      'A queue of pending interrupts',
      'A table holding the memory addresses of the service routines for the various interrupts',
      'The register that saves the program counter',
      'The wire that devices use to signal the CPU',
    ],
    answer: 1,
    explanation:
      'The <b>interrupt vector</b> contains the addresses of the specialised interrupt handlers. It is indexed by the interrupt number, so control is transferred to the right service routine quickly, without a general routine having to poll every device. (The wire is the <b>interrupt request line</b>.)',
  },
  dma: {
    id: 'hw-check-dma',
    type: 'numeric',
    prompt: 'A device transfers 4096 bytes to memory in blocks of 512 bytes using DMA. How many interrupts does the CPU receive?',
    answer: 8,
    unit: 'interrupts',
    explanation:
      'With DMA the device controller transfers a whole block directly to main memory without CPU intervention, and <b>only one interrupt is generated per block</b>: 4096 / 512 = <b>8</b>. With interrupt-driven I/O it would be one per byte: 4096.',
  },
  mode: {
    id: 'hw-check-mode',
    type: 'multi',
    prompt: 'Which of these must be privileged instructions?',
    options: ['I/O instructions', 'Loading the base and limit registers', 'Loading the timer', 'Adding two registers', 'Switching from user mode to monitor mode'],
    answers: [0, 1, 2, 4],
    explanation:
      'Anything that could let a user program escape the operating system’s control must be privileged: <b>I/O</b>, changing the <b>memory-protection registers</b>, changing the <b>timer</b>, modifying the interrupt vector, halting the machine, and <b>changing the mode</b>. Ordinary arithmetic harms nobody.',
  },
  caching: {
    id: 'hw-check-caching',
    type: 'mcq',
    prompt: 'Why must a cache have a replacement policy?',
    options: [
      'Because caches are volatile',
      'Because the cache is smaller than the storage being cached, so when it is full something must be evicted to make room',
      'Because data in a cache is always stale',
      'Because caches are slow',
    ],
    answer: 1,
    explanation:
      'A cache is faster and therefore more expensive, so it is <b>smaller than the storage it caches</b>. <b>Cache size and replacement policy</b> are the two central design decisions of cache management; a good choice can mean that the great majority of accesses are satisfied from the cache.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice, shown before the checkpoint. */
export const practice = {
  noCache: {
    id: 'hw-practice-nocache',
    type: 'written',
    pastPaper: true,
    marks: 3,
    prompt: 'What would happen if an operating system were designed without caching?',
    points: [
      'Caching copies information in use from slower to faster storage temporarily; the faster storage is checked first',
      'Without it, every access would have to go to the slower level: every memory reference to main memory instead of the CPU cache, every file or page access to the disk instead of memory',
      'The speed of the whole system would be limited by its slowest storage device, which is orders of magnitude slower (a disk access is about 5 ms against nanoseconds for memory), so the CPU would be idle most of the time and performance would collapse',
      'There would be a benefit in simplicity: only one copy of each datum, so no consistency or coherency problem and no cache-management policy; but the performance cost makes this unacceptable',
    ],
    modelAnswer:
      '<p><b>Caching</b> is the principle of copying information that is in use from slower storage to faster storage temporarily. The faster storage (the cache) is checked first: if the information is there it is used directly; if not, it is copied in and used. It is applied at many levels, in hardware, in the operating system and in software: CPU caches hold copies of main memory, and main memory itself acts as a cache for secondary storage (the buffer cache, paging).</p><p class="mt-2"><b>Without caching</b>, every access would have to go to the slower level:</p><ul class="mt-1 list-disc space-y-1 pl-5"><li>every instruction fetch and data reference would go to main memory (around 100 ns) instead of the CPU cache (around 1 ns);</li><li>every read or write of a file block would go to the disk (around 5,000,000 ns) instead of a copy held in memory, and repeated use of the same block would repeat the disk access.</li></ul><p class="mt-2">The storage hierarchy exists because no single technology is fast, large and cheap at once. Caching is what lets the system behave almost as if all its storage were as fast as the fastest level. Without it the system’s speed would be set by its <b>slowest</b> storage device: the CPU would spend nearly all its time waiting, and performance would fall by orders of magnitude.</p><p class="mt-2">The one gain would be <b>simplicity</b>. With a single copy of every datum there is no inconsistency between copies, no cache-coherency problem, and no cache size or replacement policy to design. That is not worth the cost.</p>',
  },
  coherency: {
    id: 'hw-practice-coherency',
    type: 'written',
    pastPaper: true,
    marks: 3,
    prompt: 'What is cache coherency? Why does it arise, and where is it handled?',
    points: [
      'Because of caching, the same datum may exist in several levels of the storage hierarchy at once (disk, main memory, cache, register); after an update, the copies differ until the new value is written back',
      'On a single CPU running one process at a time this is no problem, since access always goes to the copy at the highest level; in a multitasking system, every process must be given the most recent value',
      'In a multiprocessor each CPU has its own local cache, so a copy of the datum may exist in several caches simultaneously; cache coherency means an update to the value in one cache is immediately reflected in all other caches where it resides',
      'It is handled in hardware, below the operating-system level; in a distributed system with replicas on different computers the problem is harder still',
    ],
    modelAnswer:
      '<p><b>Why it arises.</b> In a hierarchical storage structure the same data may appear at several levels. Suppose integer A, stored in a file on disk, is to be incremented. A is copied from the disk into main memory, from there into the cache, and from there into a hardware register. The increment takes place in the register. At that moment <b>the value of A differs</b> between the register and the other copies; it becomes the same everywhere only after the new value is written back down to the disk.</p><p class="mt-2"><b>Single process, multitasking.</b> If only one process executes at a time this causes no difficulty, since an access to A is always made to the copy at the highest level of the hierarchy. In a <b>multitasking</b> environment, where the CPU is switched among processes, care must be taken that a process wishing to access A obtains the <b>most recently updated value</b>, wherever it is stored.</p><p class="mt-2"><b>Cache coherency.</b> In a <b>multiprocessor</b> system each CPU has, besides its registers, its own <b>local cache</b>. A copy of A may exist simultaneously in several caches. Since the CPUs execute in parallel, an update to the value of A in one cache must be <b>immediately reflected in all other caches where A resides</b>. This requirement is called cache coherency.</p><p class="mt-2"><b>Where it is handled.</b> It is usually a <b>hardware</b> issue, handled below the operating-system level. In a <b>distributed</b> environment the situation is more complex still: several copies (replicas) of the same file may be kept on different computers, and the system must ensure that an update to one replica reaches all the others.</p>',
  },
  interruptDriven: {
    id: 'hw-practice-interrupt',
    type: 'written',
    pastPaper: true,
    marks: 4,
    prompt: 'An operating system can be described as an "interrupt controller": it is interrupt driven. Explain.',
    points: [
      'If there are no processes to execute, no I/O devices to service and no users to respond to, the operating system sits idle waiting for something to happen',
      'Events are almost always signalled by an interrupt (from a hardware device) or a trap (a software-generated interrupt caused by an error or by a user request, that is a system call)',
      'For each type of interrupt, a separate segment of OS code (a service routine located through the interrupt vector) determines the action; the state of the interrupted program (PC, registers) is saved and later restored',
      'So all the work of the OS, I/O completion, system calls, errors, time slicing by the timer, is performed in response to interrupts; the structure of the OS is a collection of interrupt service routines',
    ],
    modelAnswer:
      '<p>An operating system does not run as a continuous program with a beginning and an end. If there are no processes to execute, no I/O devices to service and no users to whom to respond, it <b>sits quietly, waiting for something to happen</b>.</p><p class="mt-2">Events are almost always signalled by the occurrence of an <b>interrupt</b> or a <b>trap</b>:</p><ul class="mt-1 list-disc space-y-1 pl-5"><li>a <b>hardware interrupt</b> from a device controller, announcing that it has finished its operation, or from the <b>timer</b>;</li><li>a <b>trap</b>, a software-generated interrupt caused either by an <b>error</b> (division by zero, invalid memory access) or by a <b>user request</b> for an operating-system service (a system call).</li></ul><p class="mt-2">When an interrupt occurs, the hardware saves the address of the interrupted instruction and transfers control, generally through the <b>interrupt vector</b>, to the <b>interrupt service routine</b> for that kind of interrupt. The operating system preserves the state of the CPU by storing the registers and the program counter, the routine does its work, the state is restored, and the interrupted computation resumes.</p><p class="mt-2">Every activity of the operating system fits this pattern: starting and completing I/O, serving system calls, dealing with program errors, and regaining control from a running program when its time slice expires. For each type of interrupt a separate segment of operating-system code determines what action is taken. The operating system is in effect a set of interrupt handlers, which is why it is said to be <b>interrupt driven</b>.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'hw-cp-registers',
    type: 'mcq',
    prompt: 'Which register holds the instruction most recently fetched?',
    options: ['Program counter (PC)', 'Instruction register (IR)', 'Memory address register (MAR)', 'Program status word (PSW)'],
    answer: 1,
    explanation:
      'The <b>IR</b> holds the instruction being executed. The <b>PC</b> holds the address of the next one to fetch. The <b>MAR</b> specifies the memory address for the next read or write and the <b>MBR</b> holds the data. The <b>PSW</b> holds condition codes, the interrupt enable/disable bit and the supervisor/user mode bit.',
  },
  {
    id: 'hw-cp-trace',
    type: 'numeric',
    prompt: 'Memory location 940 holds 3 and location 941 holds 2. The program is LOAD 940; ADD 941; STORE 941. What does location 941 hold afterwards?',
    answer: 5,
    explanation: 'LOAD puts 3 in the accumulator. ADD adds the contents of 941, giving 5. STORE writes the accumulator back to 941: <b>5</b>. Each instruction takes one fetch and one execute stage.',
  },
  {
    id: 'hw-cp-trap',
    type: 'mcq',
    prompt: 'What is a trap?',
    options: [
      'An interrupt raised by a disk controller',
      'A software-generated interrupt, caused either by an error or by a user request for an operating-system service',
      'An interrupt that is ignored',
      'A hardware fault in the CPU',
    ],
    answer: 1,
    explanation: 'A <b>trap</b> (or exception) is generated by software: an error such as division by zero or an illegal memory access, or a deliberate request, the <b>system call</b>. It is handled through the same mechanism as a hardware interrupt.',
  },
  {
    id: 'hw-cp-disable',
    type: 'mcq',
    prompt: 'Why are incoming interrupts disabled while another interrupt is being processed?',
    options: [
      'To save power',
      'To prevent a lost interrupt: the saved state of the first would otherwise be overwritten',
      'Because devices cannot raise two interrupts',
      'To make the handler run in user mode',
    ],
    answer: 1,
    explanation:
      'The interrupt architecture must save the address of the interrupted instruction. If a second interrupt were accepted before the first had been dealt with, that saved state could be overwritten and the first interrupt <b>lost</b>. More elaborate architectures allow a higher-priority interrupt to interrupt a lower-priority handler.',
  },
  {
    id: 'hw-cp-sync',
    type: 'mcq',
    prompt: 'With asynchronous I/O, what happens after a program starts an I/O operation?',
    options: [
      'Control returns to the user program only when the I/O completes',
      'Control returns to the user program without waiting for the I/O to complete',
      'The CPU executes a wait loop',
      'The program is terminated',
    ],
    answer: 1,
    explanation:
      '<b>Synchronous</b>: control returns only on completion, so at most one I/O request is outstanding at a time. <b>Asynchronous</b>: control returns at once, so the CPU can do other work and several devices can be busy together. The operating system then needs a <b>device-status table</b> with an entry (type, address, state) for each device.',
  },
  {
    id: 'hw-cp-modebit',
    type: 'mcq',
    prompt: 'A user program tries to execute a privileged instruction while the mode bit says user mode. What happens?',
    options: [
      'The instruction executes normally',
      'The hardware does not execute it; it treats it as illegal and traps to the operating system',
      'The mode bit changes to monitor mode and the instruction runs',
      'The computer halts',
    ],
    answer: 1,
    explanation:
      'Privileged instructions can be executed <b>only in monitor (kernel) mode</b>. Attempted in user mode, the hardware traps to the operating system. This is what lets dual-mode operation protect the operating system from errant users, and errant users from one another.',
  },
  {
    id: 'hw-cp-baselimit',
    type: 'mcq',
    prompt: 'The base register holds 300040 and the limit register holds 120900. Which address causes a trap?',
    options: ['300040', '350000', '420939', '420940'],
    answer: 3,
    hint: 'Legal addresses run from base up to, but not including, base + limit.',
    explanation: 'A program may access addresses from 300040 up to 300040 + 120900 − 1 = 420939. Address <b>420940</b> equals base + limit, which is just outside the range, so the hardware traps to the operating system with an addressing error.',
  },
  {
    id: 'hw-cp-timer',
    type: 'tf',
    prompt: 'True or false: a user program that enters an infinite loop and never makes a system call keeps the CPU for ever, because the operating system never gets a chance to run.',
    answer: false,
    explanation:
      '<b>False.</b> Before handing control to a user program the operating system sets a <b>timer</b>. It is decremented on every clock tick, and when it reaches zero an interrupt occurs and control transfers to the operating system, which may terminate the program or give it more time. Corrected: the timer guarantees that the operating system regains control. Loading the timer is a privileged instruction.',
  },
  {
    id: 'hw-cp-hierarchy',
    type: 'mcq',
    prompt: 'Moving down the storage hierarchy from registers to magnetic tape, what happens?',
    options: [
      'Access time decreases and cost per bit increases',
      'Access time increases, cost per bit decreases, and capacity increases',
      'Everything stays the same',
      'Capacity decreases and cost per bit increases',
    ],
    answer: 1,
    explanation: 'Higher levels are <b>faster, more expensive per bit and smaller</b>; lower levels are <b>slower, cheaper and larger</b>. The levels above solid-state disk are volatile. Caching is what makes the combination behave almost as fast as the top level.',
  },
  {
    id: 'hw-cp-smp',
    type: 'mcq',
    prompt: 'In symmetric multiprocessing (SMP)…',
    options: [
      'One master processor controls the system and the others obey it',
      'Each processor performs all tasks, including operating-system functions and user processes; all processors are peers',
      'Each processor runs a different operating system',
      'Only one processor may be active at a time',
    ],
    answer: 1,
    explanation:
      'In <b>SMP</b> all processors are peers. In <b>asymmetric</b> multiprocessing each processor is assigned a specific task, with a master scheduling work for the others. The advantages of multiprocessor systems are <b>increased throughput</b>, <b>economy of scale</b> and <b>increased reliability</b> (graceful degradation or fault tolerance).',
  },
  {
    id: 'hw-cp-written-interrupt',
    type: 'written',
    marks: 5,
    prompt: 'Describe, step by step, what happens when an I/O device interrupts the CPU. Include the roles of the interrupt request line, the interrupt vector and the saved state.',
    points: [
      'The device controller finishes its operation (for a read, the data is in its local buffer) and raises the interrupt request line',
      'The CPU senses the interrupt request line after executing each instruction; if interrupts are enabled it completes the current instruction and accepts the interrupt',
      'The hardware saves the address of the interrupted instruction (PC) and the PSW, typically on a stack, disables further interrupts and switches to monitor mode',
      'Control is transferred through the interrupt vector, a table of addresses of service routines indexed by interrupt number, to the interrupt service routine for that device',
      'The handler saves any other registers it will use, services the device (for example moves data from the controller buffer to memory and updates the device-status table)',
      'The saved state is restored and a return-from-interrupt instruction reloads the PC and PSW, so the interrupted program resumes as though nothing had happened',
    ],
    modelAnswer:
      '<ol class="list-decimal space-y-1 pl-5"><li>To start the I/O, the CPU loaded the appropriate registers in the <b>device controller</b>, which examined them to see what to do. For a read, the controller transfers the data from the device into its <b>local buffer</b>. When the transfer is complete it informs the CPU by raising the <b>interrupt request line</b>.</li><li>The CPU senses the interrupt request line <b>after executing every instruction</b>. If interrupts are enabled, it finishes the current instruction and accepts the interrupt.</li><li>The hardware <b>saves the PC</b> (the address of the interrupted instruction) and the <b>PSW</b>, typically on a stack. Further interrupts are <b>disabled</b> to prevent a lost interrupt, and the mode bit is switched to <b>monitor mode</b>.</li><li>Control is transferred to the <b>interrupt service routine</b>, generally through the <b>interrupt vector</b>: a table, at a fixed location in low memory, of the addresses of the service routines, indexed by the interrupt number.</li><li>The handler saves any other registers it is going to change, determines the cause, and <b>services the device</b>: for example it moves the data from the controller’s buffer to main memory, updates the device-status table and wakes the process that was waiting.</li><li>The handler <b>restores the saved registers</b> and executes a return-from-interrupt instruction, which reloads the PC and PSW. Interrupts are enabled again, the mode returns to what it was, and the interrupted program <b>continues as though the interrupt had not occurred</b>.</li></ol>',
  },
  {
    id: 'hw-cp-written-protection',
    type: 'written',
    marks: 6,
    prompt: 'Sharing a computer among several programs requires hardware protection. Explain dual-mode operation, I/O protection, memory protection and CPU protection.',
    points: [
      'Need: with sharing, an error in one program could affect other programs or the operating system itself; the OS must ensure an incorrect program cannot cause others to execute incorrectly',
      'Dual mode: a mode bit in hardware distinguishes user mode (1) from monitor/kernel mode (0); on an interrupt, trap or fault the hardware switches to monitor mode; privileged instructions can be executed only in monitor mode',
      'I/O protection: all I/O instructions are privileged, so users must ask the OS to do I/O through a system call; a user program must never gain control in monitor mode (so instructions that modify the interrupt vector are also protected)',
      'Memory protection: a base register (smallest legal physical address) and a limit register (size of the range); the hardware compares every user-mode address with them and traps on a violation; protects at least the interrupt vector and service routines',
      'The instructions that load the base and limit registers are privileged',
      'CPU protection: a timer interrupts after a specified period (decremented every clock tick, interrupt at zero), so the OS regains control from a looping program; also used for time sharing; load-timer is privileged',
    ],
    modelAnswer:
      '<p><b>Why protection is needed.</b> In early systems the programmer had complete control of the machine. With multiprogramming, resources are shared among several programs, so an error in one program can cause problems for many others, and for the operating system itself. The operating system must ensure that an incorrect (or malicious) program cannot cause other programs to execute incorrectly.</p><p class="mt-2"><b>1. Dual-mode operation.</b> The hardware distinguishes at least two modes: <b>user mode</b>, for execution on behalf of a user, and <b>monitor mode</b> (kernel, supervisor or system mode), for execution on behalf of the operating system. A <b>mode bit</b> indicates the current mode: monitor (0) or user (1). The system starts in monitor mode; the operating system loads and starts user processes in user mode; whenever an <b>interrupt, trap or fault</b> occurs, the hardware switches to monitor mode. Certain machine instructions are designated <b>privileged</b> and can be executed only in monitor mode; an attempt in user mode traps to the operating system.</p><p class="mt-2"><b>2. I/O protection.</b> A user program could disrupt the system by issuing illegal I/O. So <b>all I/O instructions are privileged</b>, and a user must ask the operating system to perform I/O on its behalf by a <b>system call</b>. It must also be impossible for a user program to gain control in monitor mode, for example by storing a new address in the interrupt vector, so that too must be protected.</p><p class="mt-2"><b>3. Memory protection.</b> At the least the interrupt vector and the interrupt service routines must be protected, and so must each program’s memory from the others. Two registers define the range of legal addresses: the <b>base register</b> holds the smallest legal physical address, and the <b>limit register</b> holds the size of the range. The CPU hardware compares <b>every address generated in user mode</b> with them; an address outside base ≤ address &lt; base + limit causes a trap. The instructions that load these registers are <b>privileged</b>; in monitor mode the operating system has unrestricted access to all memory.</p><p class="mt-2"><b>4. CPU protection.</b> The operating system must keep control even if a user program loops for ever or never requests service. A <b>timer</b> is set to interrupt the computer after a specified period: it is decremented on every clock tick and generates an interrupt when it reaches zero, returning control to the operating system. The timer is also used to implement time sharing and to compute the current time. <b>Load-timer is a privileged instruction.</b></p>',
  },
];
