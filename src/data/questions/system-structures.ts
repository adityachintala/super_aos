import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  services: {
    id: 'ss-check-services',
    type: 'multi',
    prompt: 'Operating-system services fall into two groups. Which of these exist for the efficient operation of the system itself, and not directly to help the user?',
    options: ['Resource allocation', 'Accounting', 'Protection and security', 'Program execution', 'File-system manipulation'],
    answers: [0, 1, 2],
    explanation:
      '<b>Resource allocation, accounting, and protection and security</b> ensure efficient operation through resource sharing. The services helpful to the user are the user interface, program execution, I/O operations, file-system manipulation, communications and error detection.',
  },
  api: {
    id: 'ss-check-api',
    type: 'mcq',
    prompt: 'Why do programmers normally use an API such as POSIX and not invoke system calls directly?',
    options: [
      'APIs are faster than system calls',
      'Portability and ease of use: a program written to the API runs on any system supporting it, and the API hides the detail of the actual system calls',
      'System calls cannot be invoked from C',
      'APIs do not need the kernel',
    ],
    answer: 1,
    explanation:
      'An <b>API</b> specifies a set of functions available to the programmer. The run-time support library turns each call into the right system call. The caller needs to know nothing about how the system call is implemented: it just obeys the API and understands what the operating system will do as a result.',
  },
  params: {
    id: 'ss-check-params',
    type: 'mcq',
    prompt: 'A system call needs more parameters than there are registers. What do Linux and Solaris do?',
    options: [
      'Refuse the call',
      'Store the parameters in a block or table in memory and pass the address of the block in a register',
      'Split it into several system calls',
      'Pass the parameters through a file',
    ],
    answer: 1,
    explanation:
      'There are three general methods: pass the parameters in <b>registers</b> (simplest); store them in a <b>block or table</b> in memory and pass its address in a register; or <b>push them onto the stack</b>, to be popped by the operating system. The block and stack methods do not limit the number or length of parameters.',
  },
  fork: {
    id: 'ss-check-fork',
    type: 'mcq',
    prompt: 'In a UNIX-like system, which two system calls does the shell use to run a command as a new process?',
    options: ['open() and read()', 'fork() to create a process, then exec() to load the program into it', 'load() and execute()', 'create() and run()'],
    answer: 1,
    explanation:
      'The shell executes <b>fork()</b> to create a new process and the child executes <b>exec()</b> to load the program. The shell then either waits for the process to terminate or continues with other commands. The process exits with code 0 for no error, or a positive error code. MS-DOS, being single-tasking, creates no process: it loads the program over most of its own memory.',
  },
  layered: {
    id: 'ss-check-layered',
    type: 'mcq',
    prompt: 'What is the main difficulty in designing a layered operating system?',
    options: [
      'Layers cannot be debugged separately',
      'Defining the layers appropriately, since a layer may use only lower layers, and some functions naturally depend on each other',
      'Layers require a microkernel',
      'There can be at most seven layers',
    ],
    answer: 1,
    explanation:
      'Careful planning is needed. For example, the driver for the backing store must be below the memory-management routines, because memory management uses the backing store; yet the backing-store driver may need to wait, which involves the CPU scheduler, which may itself need memory. The second problem is <b>efficiency</b>: each layer adds overhead to a system call.',
  },
  micro: {
    id: 'ss-check-micro',
    type: 'mcq',
    prompt: 'What is the main drawback of the microkernel approach?',
    options: [
      'It is less secure than a monolithic kernel',
      'It cannot be ported to new hardware',
      'Performance overhead: services communicate by message passing through the kernel, with extra copying and mode switches',
      'It cannot be extended',
    ],
    answer: 2,
    explanation:
      'A request that would be one procedure call inside a monolithic kernel becomes several messages between user-level servers. Its benefits are that it is <b>easier to extend</b>, <b>easier to port</b>, <b>more reliable</b> and <b>more secure</b>, because less code runs in kernel mode.',
  },
  vm: {
    id: 'ss-check-vm',
    type: 'mcq',
    prompt: 'What interface does a virtual machine present to the software running in it?',
    options: [
      'A system-call interface richer than the host’s',
      'An interface identical to the underlying bare hardware',
      'A file-system interface',
      'A command-line interface',
    ],
    answer: 1,
    explanation:
      'The virtual-machine approach takes layering to its logical conclusion: it treats the hardware and the kernel as though they were all hardware and provides an interface <b>identical to the bare hardware</b>. Each guest is given a (virtual) copy of the underlying computer, so it can run its own operating system.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice, shown before the checkpoint. */
export const practice = {
  policy: {
    id: 'ss-practice-policy',
    type: 'written',
    pastPaper: true,
    marks: 4,
    prompt: 'What will happen if you design an operating system based on policy decisions, that is, without separating policy from mechanism?',
    points: [
      'Mechanisms determine how to do something; policies determine what will be done (for example the timer is a mechanism for CPU protection; how long the timer is set for a user is a policy)',
      'Policies are likely to change across places or over time; mechanisms do not change often',
      'If policy is built into the mechanism, every change of policy requires a change to the underlying mechanism (rewriting and re-testing parts of the kernel), so the system is rigid and hard to adapt to new hardware, workloads or users',
      'With separation, a general mechanism insensitive to policy needs only a change of parameters; this flexibility is the basis of microkernels, which implement only mechanisms and leave policies to user level',
    ],
    modelAnswer:
      '<p>One important principle of operating-system design is the <b>separation of policy from mechanism</b>. <b>Mechanisms</b> determine <i>how</i> to do something; <b>policies</b> determine <i>what</i> will be done. For CPU protection, the timer construct is a mechanism; deciding how long the timer is to be set for a particular user is a policy decision. Whether I/O-intensive programs should have priority over CPU-intensive ones is a policy; the priority queue that makes either choice possible is a mechanism.</p><p class="mt-2">The two differ in how often they change: <b>policies are likely to change</b> from place to place and over time, whereas <b>mechanisms do not change often</b>.</p><p class="mt-2"><b>If the system is designed around particular policy decisions</b>, with the policies hard-wired into the mechanisms, then:</p><ul class="mt-1 list-disc space-y-1 pl-5"><li>in the worst case <b>every change in policy requires a change in the underlying mechanism</b>, meaning kernel code must be rewritten, re-tested and redistributed;</li><li>the system is <b>rigid</b>: it suits the workload and hardware its designers imagined, and adapts poorly to different users, larger machines or new kinds of application;</li><li>decisions that should be made by an administrator or an application are fixed by the vendor.</li></ul><p class="mt-2">If instead the system provides a <b>general mechanism that is insensitive to changes in policy</b>, a change of policy requires only the <b>redefinition of certain parameters</b>. The policy can be an input: for example, a scheduler that takes its priorities from a table. <b>Microkernel</b> operating systems take this to its extreme by implementing only a basic set of primitive mechanisms in the kernel and providing policies at user level.</p>',
  },
  layered: {
    id: 'ss-practice-layered',
    type: 'written',
    pastPaper: true,
    marks: 4,
    prompt: 'What are the advantages of the layered approach to operating-system design? What are its difficulties?',
    points: [
      'The OS is divided into layers, each built on lower layers (layer 0 hardware, layer N user interface); each layer uses the functions and services of only lower-level layers',
      'Modularity: well-defined interfaces between layers; each layer hides its data structures, operations and hardware from higher layers, so a layer can be changed without affecting others',
      'Simplicity of construction and debugging: the first layer is debugged without concern for the rest, then each layer is debugged assuming those below are correct; an error found is in the layer being debugged; this simplifies system verification',
      'Difficulties: appropriately defining the layers (a layer can use only lower layers, requiring careful planning), and reduced efficiency, since a request passes through several layers, each adding overhead',
    ],
    modelAnswer:
      '<p>In the <b>layered approach</b> the operating system is divided into a number of layers (levels), each built on top of lower layers. The bottom layer (layer 0) is the hardware; the highest (layer N) is the user interface. The layers are selected so that <b>each uses the functions and services of only lower-level layers</b>.</p><p class="mt-2"><b>Advantages.</b></p><ul class="mt-1 list-disc space-y-1 pl-5"><li><b>Modularity.</b> There are well-defined interfaces between layers. A layer does not need to know how the operations of the layer below are implemented, only what they do. Each layer <b>hides</b> its data structures, operations and hardware from the layers above, so its implementation can be changed without affecting the rest.</li><li><b>Simplicity of construction and debugging.</b> The first layer can be debugged without any concern for the rest of the system, because it uses only the basic hardware. Once it is debugged, its correct functioning can be assumed while the second layer is debugged, and so on. <b>If an error is found during the debugging of a particular layer, the error must be on that layer.</b></li><li><b>Easier verification and development.</b> The association between a function and a layer eases the overall design, and the system can be developed and verified layer by layer. Dijkstra’s THE system was built and proved correct this way.</li></ul><p class="mt-2"><b>Difficulties.</b></p><ul class="mt-1 list-disc space-y-1 pl-5"><li><b>Defining the layers.</b> Because a layer can use only lower-level layers, careful planning is necessary, and some functions do not order naturally: for example the backing-store driver must be below memory management, but may itself need the CPU scheduler, which may need memory.</li><li><b>Efficiency.</b> A system call may have to pass through several layers, each of which adds overhead, for instance by modifying and passing on parameters. The result can be slower than a non-layered system.</li></ul>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'ss-cp-syscall',
    type: 'mcq',
    prompt: 'What is a system call?',
    options: [
      'A call from the kernel to a user program',
      'The programming interface to the services provided by the operating system',
      'Any function in the C library',
      'A hardware interrupt from a device',
    ],
    answer: 1,
    explanation:
      'System calls are the <b>programming interface to the services of the operating system</b>, typically written in C or C++. They can be thought of as the <b>instruction set of the operating system’s virtual processor</b>: what the hardware’s instructions are to the bare machine, system calls are to the machine the operating system provides.',
  },
  {
    id: 'ss-cp-table',
    type: 'mcq',
    prompt: 'How does the system-call interface find the kernel code for a particular system call?',
    options: [
      'By searching the kernel for the function name',
      'A number is associated with each system call, and the interface maintains a table indexed by these numbers',
      'By asking the user',
      'By reading the program’s source code',
    ],
    answer: 1,
    explanation: 'Each system call has a <b>number</b>. The system-call interface keeps a <b>table indexed by those numbers</b>, invokes the intended system call in the kernel, and returns its status and any return values.',
  },
  {
    id: 'ss-cp-printf',
    type: 'mcq',
    prompt: 'A C program calls printf(). Which statement is correct?',
    options: [
      'printf() is itself a system call',
      'printf() is a library function; the C library intercepts it and invokes the write() system call',
      'printf() writes directly to the display hardware',
      'printf() runs in kernel mode throughout',
    ],
    answer: 1,
    explanation: 'The standard C library provides part of the system-call interface. It takes the call to <b>printf()</b>, formats the output, and invokes the necessary system call, <b>write()</b>. The library then takes the value returned by write() and passes it back to the program.',
  },
  {
    id: 'ss-cp-types',
    type: 'mcq',
    prompt: 'To which category of system call do "create process", "wait for time" and "allocate and free memory" belong?',
    options: ['File management', 'Process control', 'Information maintenance', 'Communications'],
    answer: 1,
    explanation:
      '<b>Process control</b>: end, abort, load, execute, create and terminate process, get and set process attributes, wait for time, wait event, signal event, allocate and free memory. The other categories are file management, device management, information maintenance and communications.',
  },
  {
    id: 'ss-cp-policy',
    type: 'mcq',
    prompt: 'Which of these is a policy and not a mechanism?',
    options: [
      'A timer that can interrupt the CPU',
      'The decision that the timer is set to 50 ms for each user',
      'A priority queue of ready processes',
      'A mode bit in the PSW',
    ],
    answer: 1,
    explanation: '<b>Mechanisms determine how to do something; policies determine what will be done.</b> The timer is a mechanism for CPU protection. How long it is set for a particular user is a policy decision, and can be changed without touching the mechanism.',
  },
  {
    id: 'ss-cp-unix',
    type: 'mcq',
    prompt: 'In the traditional UNIX structure, what does the kernel consist of?',
    options: [
      'Only the device drivers',
      'Everything below the system-call interface and above the physical hardware',
      'The shell and the compilers',
      'Only the CPU scheduler',
    ],
    answer: 1,
    explanation:
      'UNIX consists of two separable parts: the <b>system programs</b> and the <b>kernel</b>. The kernel provides the file system, CPU scheduling, memory management and other operating-system functions: a large number of functions for one level. That is why it is called <b>monolithic</b>.',
  },
  {
    id: 'ss-cp-the',
    type: 'mcq',
    prompt: 'In Dijkstra’s THE operating system, which layer sits directly above the hardware?',
    options: ['The memory manager', 'The CPU scheduler', 'I/O buffering', 'User programs'],
    answer: 1,
    explanation:
      'THE had six layers: 0 hardware, <b>1 CPU scheduling</b>, 2 memory management, 3 the operator-console device driver, 4 I/O buffering, 5 user programs. Because CPU scheduling is at the bottom, every layer above it can be written as a set of sequential processes without worrying about the processor being shared.',
  },
  {
    id: 'ss-cp-modules',
    type: 'tf',
    prompt: 'True or false: loadable kernel modules communicate with each other by message passing, exactly as the services of a microkernel do.',
    answer: false,
    explanation:
      '<b>False.</b> A loadable module is linked into the kernel and runs in kernel mode, so modules call each other directly over known interfaces. Corrected: the modular approach resembles a microkernel in having a small core, but is more efficient because <b>modules do not need to invoke message passing</b> in order to communicate. It is like layering, but more flexible, since any module can call any other.',
  },
  {
    id: 'ss-cp-trap',
    type: 'mcq',
    prompt: 'A guest operating system running in a virtual machine executes a privileged instruction. What happens?',
    options: [
      'It executes directly on the hardware in kernel mode',
      'Because the guest really runs in physical user mode, the instruction traps to the virtual-machine software, which simulates its effect',
      'The guest crashes',
      'The instruction is ignored',
    ],
    answer: 1,
    explanation:
      'The virtual-machine software itself runs in physical monitor mode; each virtual machine runs in physical user mode but has a <b>virtual user mode</b> and a <b>virtual monitor mode</b>. User-level code executes as is. Supervisor code executes at user level, and its <b>privileged instructions are simulated</b> after they trap.',
  },
  {
    id: 'ss-cp-mux',
    type: 'mcq',
    prompt: 'A virtual computer gives each process a virtual processor, virtual memory and virtual disk. How is the physical disk shared to provide files?',
    options: [
      'Time multiplexing only',
      'Space multiplexing: each file occupies its own part of the disk, with the storage transformed into the file abstraction',
      'It is not shared',
      'By giving each process the whole disk in turn',
    ],
    answer: 1,
    explanation:
      'The <b>processor</b> is virtualised into processes mainly by <b>time multiplexing</b>. <b>Memory</b> is virtualised into address spaces by both space and time multiplexing. <b>Disks</b> are virtualised into files by <b>space multiplexing</b> and transforming: blocks become named, variable-length files.',
  },
  {
    id: 'ss-cp-boot',
    type: 'mcq',
    prompt: 'What is the job of the bootstrap loader?',
    options: [
      'To configure the kernel for a new machine',
      'To locate the kernel, load it into memory and start its execution',
      'To schedule the first process',
      'To generate crash dumps',
    ],
    answer: 1,
    explanation:
      'When power is applied, execution starts at a fixed memory location, where <b>firmware</b> holds the initial boot code. This small piece of code, the bootstrap loader, locates the kernel, loads it and starts it. Sometimes it is a two-step process in which a <b>boot block</b> at a fixed location on disk loads the full bootstrap loader. Configuring the system for a specific machine is <b>system generation (SYSGEN)</b>.',
  },
  {
    id: 'ss-cp-written-structures',
    type: 'written',
    marks: 6,
    prompt: 'Compare the monolithic, layered and microkernel approaches to structuring an operating system.',
    points: [
      'Monolithic (traditional UNIX): the kernel is everything between the system-call interface and the hardware, a large number of functions in one level and one address space',
      'Monolithic: efficient (little overhead in system calls or communication within the kernel) but difficult to implement, maintain and extend; a fault anywhere can crash the system',
      'Layered: OS divided into layers, each using only the services of lower layers; hides implementation; easy to construct, debug and verify layer by layer',
      'Layered: hard to define the layers appropriately, and less efficient because a call passes through several layers',
      'Microkernel: as much as possible moved out of the kernel into user space; the kernel keeps minimal process and memory management and interprocess communication; user-level services communicate by message passing',
      'Microkernel: easier to extend and to port, more reliable and more secure (less code in kernel mode); drawback is the performance overhead of user-space to kernel-space communication',
    ],
    modelAnswer:
      '<p><b>Monolithic.</b> The original UNIX had limited structuring. It consists of the system programs and the <b>kernel</b>, which is everything below the system-call interface and above the physical hardware: file system, CPU scheduling, memory management and device drivers, all in one level, in a single address space. <i>Advantage:</i> very little overhead, since a system call is a trap followed by ordinary procedure calls, and communication within the kernel is fast. <i>Disadvantages:</i> an enormous amount of functionality in one level is <b>difficult to implement and maintain</b>, and an error in any part can bring down the whole system.</p><p class="mt-2"><b>Layered.</b> The operating system is broken into layers, each built on top of lower layers, from the hardware (layer 0) to the user interface (layer N). Each layer uses the functions and services of <b>only lower-level layers</b> and hides its own data structures and operations. <i>Advantages:</i> modularity, and <b>simplicity of construction and debugging</b>: each layer is debugged assuming the ones below are correct, so an error is located in the layer under test. <i>Disadvantages:</i> the layers are <b>hard to define</b> appropriately, and the system is <b>less efficient</b>, because a call may pass through every layer.</p><p class="mt-2"><b>Microkernel.</b> As much as possible is <b>moved out of the kernel into user space</b>. The kernel provides only minimal process management, memory management and a communication facility. The file system, device drivers and other services run as user-level processes, and clients and services communicate by <b>message passing</b> through the microkernel. <i>Advantages:</i> <b>easier to extend</b> (new services need no kernel change), <b>easier to port</b>, <b>more reliable</b> and <b>more secure</b>, since less code runs in kernel mode and a failed service leaves the rest intact. <i>Disadvantage:</i> the <b>performance overhead</b> of user-space to kernel-space communication.</p><table class="mt-2 w-full text-left text-xs"><tr><th></th><th>Monolithic</th><th>Layered</th><th>Microkernel</th></tr><tr><td>Code in kernel mode</td><td>All of it</td><td>All of it</td><td>A minimal core</td></tr><tr><td>Communication</td><td>Procedure calls</td><td>Calls to the layer below</td><td>Message passing</td></tr><tr><td>Performance</td><td>Best</td><td>Lower</td><td>Lowest</td></tr><tr><td>Ease of change</td><td>Poor</td><td>Good within a layer</td><td>Best</td></tr></table><p class="mt-2">Most modern systems are <b>hybrids</b> built around <b>loadable kernel modules</b>, which keep the efficiency of direct calls while allowing parts to be added and replaced.</p>',
  },
  {
    id: 'ss-cp-written-syscall',
    type: 'written',
    marks: 5,
    prompt: 'Explain how a system call is made and serviced, from a call to an API function in a user program to the return of the result. Include how parameters are passed.',
    points: [
      'The program calls an API function (for example read() in the POSIX API, or printf() in the C library); the run-time support library provides the system-call interface',
      'The library places the system-call number and the parameters where the kernel expects them: in registers, in a block or table whose address is passed in a register, or pushed on the stack',
      'It executes a trap (software interrupt) instruction; the hardware switches to kernel mode and transfers control through the interrupt vector to the system-call handler',
      'The system-call interface uses the number to index a table and invokes the intended system-call routine in the kernel, which checks the parameters and performs the service',
      'The status and any return values are passed back, the mode is switched to user mode, and execution resumes at the instruction after the call; the caller needs to know nothing about the implementation',
    ],
    modelAnswer:
      '<ol class="list-decimal space-y-1 pl-5"><li><b>The program calls an API function.</b> Programs mostly reach system calls through a high-level <b>application program interface</b>, such as the POSIX API, the Windows API or the Java API, and not directly. A call to <code>printf()</code>, for example, is handled by the standard C library, which will issue the <code>write()</code> system call.</li><li><b>The run-time support library sets up the call.</b> It puts the <b>number</b> identifying the system call, and its <b>parameters</b>, where the kernel expects them. Three general methods are used: pass the parameters in <b>registers</b>; store them in a <b>block or table</b> in memory and pass the address of the block in a register (the approach of Linux and Solaris); or <b>push them onto the stack</b>, to be popped off by the operating system. The last two do not limit the number or length of the parameters.</li><li><b>Trap.</b> The library executes a trap instruction. The hardware treats it as a software interrupt: it saves the state, sets the mode bit to <b>kernel mode</b> and transfers control through the interrupt vector to the operating system.</li><li><b>Dispatch.</b> The <b>system-call interface</b> maintains a <b>table indexed by system-call number</b>. It looks up the number and invokes the intended routine in the kernel, which verifies that the parameters are correct and legal and carries out the request.</li><li><b>Return.</b> The status of the call and any return values are passed back, the mode bit is set to <b>user mode</b>, and control returns to the instruction following the system call. The library hands the result to the program.</li></ol><p class="mt-2">The caller needs to know nothing about how the system call is implemented or what it does during execution. It only needs to obey the API and understand what the operating system will do as a result. Most of the details of the operating-system interface are hidden from the programmer by the API.</p>',
  },
];
