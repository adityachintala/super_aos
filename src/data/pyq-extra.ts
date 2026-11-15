// More past-paper questions, typed out from question papers and grouped by lesson.
// They join the question bank (see src/lib/bank.ts), so they appear on the past-paper page
// and in unit tests and mock exams. Model answers are written for this site; where a paper
// came with its own answer key, the model answer follows it.

import type { Question } from '../lib/questions';

const P = (...paragraphs: string[]) => paragraphs.map((p, i) => `<p${i ? ' class="mt-2"' : ''}>${p}</p>`).join('');
const UL = (...items: string[]) => `<ul class="mt-1 list-disc space-y-1 pl-5">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const PRE = (code: string) => `<pre class="bg-background mt-2 overflow-x-auto rounded-md border p-2 text-xs">${code}</pre>`;

const written = (id: string, source: string, marks: number, prompt: string, points: string[], modelAnswer: string): Question => ({
  id: `pq-${id}`,
  type: 'written',
  pastPaper: true,
  source,
  marks,
  prompt,
  points,
  modelAnswer,
});
const tf = (id: string, source: string, prompt: string, answer: boolean, explanation: string): Question => ({
  id: `pq-${id}`,
  type: 'tf',
  pastPaper: true,
  source,
  prompt: `True or false: ${prompt}`,
  answer,
  explanation,
});

const Q1 = 'Quiz 1';
const MID = 'Mid-sem 2025';
const Q2 = 'Quiz 2, 2025';
const END = 'End-sem 2025';
const END22 = 'End-sem 2022';
const END21 = 'End-sem 2021';
const OSNQ2 = 'Quiz 2 (earlier year)';

export const extraPastQuestions: Record<string, Question[]> = {
  'overview-and-complexity': [
    written(
      'oc-robust',
      END,
      5,
      'Explain how the notions of "modularity", "abstraction" and the "robustness principle" help in developing modern computer systems. What will happen if you do not follow them?',
      [
        'Modularity: divide the system into interacting modules that can be designed, understood and debugged separately; debugging effort falls from about N² to N²/K; a module can be replaced or improved on its own',
        'Abstraction: each module is used only through its external specification (interface), with no knowledge of its insides; this limits the propagation of effects',
        'Robustness principle: be tolerant of inputs and strict on outputs, so small errors are absorbed and do not spread from module to module',
        'Without modularity: one huge program that nobody can understand, with debugging and change growing as the square of its size',
        'Without abstraction or robustness: a change or fault in one place forces changes or failures elsewhere (propagation of effects), so the system becomes fragile and cannot evolve',
      ],
      P(
        '<b>Modularity</b> is divide and conquer: the system is designed as a collection of interacting <b>modules</b>, each of which can be thought about in isolation. If debugging a program of N statements costs about N², splitting it into K modules costs K × (N/K)² = N²/K. Modules also allow <b>incremental improvement</b>: an inferior module can be replaced.',
        '<b>Abstraction</b> is the ability of a module to treat every other module purely on the basis of its <b>external specification</b>, without knowing what goes on inside. It is what makes modularity work: a bug leads you to one module, and there is little <b>propagation of effects</b>.',
        'The <b>robustness principle</b> says: <b>be tolerant of inputs and strict on outputs</b>. A module that accepts slightly out-of-range inputs but keeps its own outputs well within specification stops small errors from accumulating as they pass through the system.',
        '<b>If they are not followed:</b> the system is one tangled mass. Every part may depend on every other (n(n − 1)/2 possible interconnections), so nobody can understand it, a change in one place breaks others, and a small fault spreads until the system fails. Such a system cannot be debugged, extended or kept alive as requirements change.',
      ),
    ),
  ],

  history: [
    written(
      'hi-timesharing',
      Q1,
      2,
      'What is the objective of "time-sharing"? Why can the same objective not be realised through multiprogramming?',
      [
        'Objective of time sharing: interactive computing, that is a short, predictable response time for every user',
        'In multiprogramming the CPU is released only when the running job does I/O; a job may compute for a long time first, so others wait for an unpredictable duration',
        'In time sharing a timer interrupts the CPU after a fixed time slice, so every job gets the CPU regularly',
      ],
      P(
        'The objective of time sharing is <b>interactive computing</b>: each user gets a quick response while the program is running.',
        'It cannot be achieved by multiprogramming alone, because in multiprogramming the scheduler takes the CPU away <b>only when the running job performs I/O</b>. A job may take a long time to reach its next I/O, so the other jobs wait for an <b>unpredictable</b> time. In time sharing the CPU is <b>interrupted after a fixed time period</b>, so every job gets a turn within a bounded time.',
      ),
    ),
    written(
      'hi-total-time',
      `${MID} / ${END22}`,
      5,
      'A multiprogrammed system has a load of N processes with individual total execution times t<sub>1</sub>, t<sub>2</sub>, …, t<sub>N</sub>. (a) How could the total time be as small as max(t<sub>1</sub>, …, t<sub>N</sub>)? (b) What would cause the total time T to exceed t<sub>1</sub> + t<sub>2</sub> + … + t<sub>N</sub>?',
      [
        '(a) Each execution time includes both CPU bursts and I/O waits; in a multiprogrammed system the CPU is given to another process whenever the running one blocks for I/O',
        '(a) If the processes are I/O-bound and their CPU bursts fit into each other’s I/O waits, they overlap completely, so all finish by the time the longest one does',
        '(b) Overheads that no single process would pay alone: context switching between processes, and the scheduler’s own work',
        '(b) Contention: processes wait for each other for the same I/O device, for locks, and for memory; with too little memory there is paging or swapping, and in the extreme thrashing',
      ],
      P(
        '<b>(a) As small as the maximum.</b> The time t<sub>i</sub> of a process is made of CPU bursts <b>and</b> I/O waits. In a multiprogrammed system the CPU is handed to another process whenever the running one blocks for I/O. If the processes are mostly I/O-bound, and each one’s CPU bursts fit into the others’ I/O waits, their executions <b>overlap</b>: while the longest process P<sub>t</sub> runs it blocks many times, and during those times the other processes can run to completion. Everything is then finished when the longest process finishes.',
        '<b>(b) More than the sum.</b> Running together adds costs that no process pays when run alone:' +
          UL(
            '<b>context-switch overhead</b> each time the CPU moves between processes, plus the scheduler’s own time;',
            '<b>contention for devices</b>: processes queue for the same disk or printer, so I/O waits lengthen;',
            '<b>contention for memory</b>: the processes do not all fit, so there is swapping and paging, and in the worst case <b>thrashing</b>;',
            '<b>waiting for locks</b> or other shared resources, and possibly deadlock.',
          ),
      ),
    ),
    written(
      'hi-transitions',
      `${END} / ${END22}`,
      5,
      'Developments in operating systems have generally been evolutionary. For each transition, describe the primary motivation: (a) single-user dedicated systems to multiprogramming; (b) fixed-partition multiprogramming with absolute translation and loading to fixed partitions with relocatable translation and loading; (c) fixed-partition to variable-partition multiprogramming; (d) contiguous to non-contiguous storage allocation; (e) single-user systems with manual job-to-job transition to single-stream batch processing.',
      [
        '(a) The CPU sat idle whenever the single job waited for I/O; keeping several jobs in memory lets the CPU always have one to run, raising utilisation',
        '(b) With absolute loading a program is tied to one partition (the programmer must know its start address) and waits even if another partition is free; relocatable code can be loaded into any free partition',
        '(c) Fixed partitions waste memory (internal fragmentation) and limit program size; variable partitions give each job exactly what it needs',
        '(d) Contiguous allocation is inflexible: external fragmentation, compaction, and a program or file cannot grow; non-contiguous allocation (paging) uses any free frame',
        '(e) Job set-up and change-over time wasted an expensive machine; a monitor sequences jobs automatically',
      ],
      P(
        '<b>(a) Single user to multiprogramming.</b> A single job cannot keep the CPU busy: while it waits for slow I/O, the expensive CPU is idle. With several jobs in memory the CPU switches to another job, so <b>CPU utilisation</b> rises.',
        '<b>(b) Absolute to relocatable loading.</b> With absolute translation the programmer had to know the starting address, and the program could run in only that partition, waiting even when other partitions were free. Relocatable code can be <b>loaded into any free partition</b>, and suspended and resumed elsewhere. It makes the programmer’s job easier and the use of memory better.',
        '<b>(c) Fixed to variable partitions.</b> Fixed partitions distribute memory poorly: a small job wastes most of a big partition, a big job may not fit any, and the programmer must know the partition size. Variable partitions give each job <b>exactly the memory it needs</b>.',
        '<b>(d) Contiguous to non-contiguous allocation.</b> Contiguous allocation is inflexible: holes form (<b>external fragmentation</b>), compaction is expensive, and a program or file <b>cannot grow</b>. Non-contiguous schemes such as paging can use any free block.',
        '<b>(e) Manual transition to batch.</b> Job change-over time was significant and machines were very expensive. A <b>monitor</b> (batch operating system) reads jobs one after another and passes control automatically, removing the idle time between jobs.',
      ),
    ),
  ],

  hardware: [
    written(
      'hw-modebit',
      Q1,
      2,
      'In earlier operating systems there was no mode bit. How has the mode bit enhanced protection in modern operating systems?',
      [
        'Sensitive operations (setting the timer, I/O, changing memory-management registers) must be performed only by the operating system',
        'Without a mode bit there was no efficient way to stop a user program executing them',
        'The mode bit divides instructions into privileged and non-privileged; privileged ones run only in kernel mode, and an attempt in user mode traps to the OS',
      ],
      P(
        'Sensitive tasks, such as setting the timer or performing I/O, should be carried out <b>only by the operating system</b>. Without a mode bit there was no efficient way to restrict a user program from doing them, so one faulty program could damage the whole system.',
        'The <b>mode bit</b> lets the hardware tell whether it is running the operating system (kernel mode) or a user program (user mode). Instructions are classified as <b>privileged</b> or non-privileged, and privileged ones are executed only in kernel mode; attempted in user mode, they <b>trap</b> to the operating system. This gave the operating system control over all sensitive operations and made it much simpler to build.',
      ),
    ),
    written(
      'hw-dma',
      Q1,
      2,
      'Explain the advantage of DMA data transfer over interrupt-initiated data transfer.',
      [
        'With interrupt-initiated transfer the CPU is interrupted for every byte (or word) moved between the device and memory',
        'With DMA the controller moves a whole block directly between its buffer and main memory, without the CPU, and raises one interrupt per block',
        'So large transfers are faster and the CPU is free for other work',
      ],
      P(
        'With interrupt-initiated transfer, moving a large amount of data from a disk to main memory interrupts the CPU <b>for every byte</b>. With <b>DMA</b> the device controller transfers a <b>whole block</b> directly to main memory without CPU intervention and raises <b>one interrupt per block</b>. The transfer is faster and the CPU is left free to run programs.',
      ),
    ),
    written(
      'hw-priority-interrupt',
      MID,
      3,
      'Do you believe that whenever a higher-priority interrupt occurs, the computer switches execution to the interrupt routine? What is the corresponding hardware mechanism?',
      [
        'Not immediately: the CPU checks for interrupts only after the current instruction has finished executing',
        'And only if interrupts are enabled: the interrupt enable/disable bit in the PSW (or an interrupt mask) may hold the interrupt pending, for example while another interrupt’s state is being saved',
        'Mechanism: the device raises the interrupt request line; a priority scheme lets a higher-priority interrupt preempt a lower-priority handler; the hardware saves the PC and PSW and jumps through the interrupt vector to the service routine',
      ],
      P(
        '<b>Not always, and never instantly.</b> The CPU senses the <b>interrupt request line</b> only <b>after it finishes executing the current instruction</b>, so the switch waits for the instruction boundary. It also happens only if interrupts are <b>enabled</b>: the interrupt enable/disable bit in the PSW (or a mask) can keep an interrupt pending, for instance during the few instructions in which the state of another interrupt is being saved.',
        '<b>Mechanism.</b> Interrupts are given <b>priority levels</b>. A request of higher priority than the one being serviced is allowed to preempt the running handler; requests of equal or lower priority are masked and wait. When an interrupt is accepted, the hardware saves the <b>PC and PSW</b> (on a stack), disables or masks further interrupts, switches to kernel mode and loads the PC from the <b>interrupt vector</b>, which holds the address of the service routine.',
      ),
    ),
    written(
      'hw-probe',
      Q1,
      2,
      'In the paper "My recollections of operating system design", what are the problems with probe instructions? How did interrupts solve the problem, and what new problems did they introduce?',
      [
        'Probe instructions (polling): processor time is wasted; probing often slows down the computation, probing rarely increases the reaction time',
        'Interrupts: dedicated hardware watches the outside world while the computer calculates at full speed, and interrupts the processor when a completion signal arrives',
        'New problems: interrupts arrive at unpredictable moments, creating synchronisation and consistency problems (unreproducible errors)',
      ],
      P(
        '<b>Problem with probe instructions.</b> The program had to keep asking each device whether it had finished. Executing a probe takes time: probing the peripheral with <b>high frequency slows down the computation</b>, while probing with <b>low frequency increases the reaction time</b>. Either way, processor time is wasted.',
        '<b>How interrupts solved it.</b> While the computer calculates at full speed, a piece of dedicated hardware monitors the outside world for completion signals. When one arrives, for example a data transfer has finished, the device <b>interrupts</b> the processor. No time is spent on polling.',
        '<b>New problems.</b> Because the timing of interrupts is <b>unpredictable</b>, the same program can behave differently on each run. This raised <b>synchronisation and consistency</b> problems, which later led to semaphores and the careful structuring of operating systems.',
      ),
    ),
  ],

  'system-structures': [
    tf(
      'ss-microport',
      END22,
      'it is easier to port a microkernel operating system from one hardware to another than a non-microkernel operating system.',
      true,
      '<b>True.</b> A microkernel contains only the essential features (minimal process and memory management, and interprocess communication), so the hardware-dependent code is small. Everything else runs as user-level services that need little or no change.',
    ),
    written(
      'ss-multikernel',
      MID,
      2,
      'Regarding the development of the Multikernel operating system, explain the following motivation: "Messages cost less than shared memory."',
      [
        'With shared memory, cores that update the same data keep moving its cache lines between them through the cache-coherence protocol; the cost grows with the number of cores, and each core stalls while it waits',
        'With message passing each core keeps its own copy and updates are sent as messages; the cost per update is roughly constant and the sender does not have to stall, so beyond a few cores messages are cheaper',
      ],
      P(
        'The usual argument is the opposite: shared memory is fast and messages are slow. On a <b>multicore</b> machine it stops being true. When several cores update the <b>same shared data</b>, the cache lines holding it must be moved from core to core by the <b>cache-coherence protocol</b>. Every update is a set of cache misses, each core <b>stalls</b> while waiting, and the cost <b>grows with the number of cores</b> contending.',
        'If instead each core keeps its <b>own replica</b> of the state and the cores exchange <b>messages</b>, an update costs about the same however many cores there are, and the sender can carry on with other work while the message is delivered. The Multikernel authors measured that beyond a small number of cores, <b>message passing was cheaper than sharing</b>, and built the whole operating system as a distributed system of cores that share nothing.',
      ),
    ),
    written(
      'ss-corey',
      MID,
      5,
      'The Corey multicore operating system is guided by the following observation: "Applications should control sharing of operating system data structures." Justify the observation.',
      [
        'On multicore machines, kernel data structures shared and modified by several cores become a bottleneck: lock contention and cache-coherence misses grow with the number of cores',
        'Much of this sharing is unnecessary: the application often does not need it, but the OS interface forces it (for example, POSIX makes a file descriptor visible to every thread)',
        'Only the application knows which data really needs to be shared, so it is the right entity to decide',
        'Implication 1: by default the OS arranges each data structure so that only one core needs to use it',
        'Implication 2: interfaces let the application ask for sharing where it helps; Corey provides address ranges, kernel cores and shares; sharing costs are paid only when the application has decided it is worth it',
      ],
      P(
        '<b>The problem.</b> On a multicore machine, application performance can be limited by the operating system when its services use <b>data structures shared and modified by many cores</b>. Each update needs a lock and moves cache lines between cores, so cores spend their time contending. Performance can even <b>fall as cores are added</b>.',
        '<b>The sharing is often unnecessary.</b> Existing interfaces force it whether or not the application needs it. Under POSIX, a new file descriptor must be visible to all of a process’s threads even if only one thread uses it, so every thread contends for the same descriptor table.',
        '<b>Who should decide.</b> The operating system does not know whether a resource needs to be shared. The <b>application</b> (in the broad sense: whichever entity has the information) does. Hence the principle.',
        '<b>Two implications.</b> First, the operating system should arrange each data structure so that <b>by default only one core uses it</b>. Second, its interfaces should let callers <b>control how data is shared between cores</b>. Corey offers three abstractions for this: <b>address ranges</b> (which parts of the address space are private to a core and which are shared), <b>kernel cores</b> (a core dedicated to a kernel function and its data) and <b>shares</b> (which object identifiers are visible to other cores). The system then pays sharing costs only where the application designer has decided they are worth it.',
      ),
    ),
  ],

  'processes-and-ipc': [
    written(
      'pr-queues',
      Q1,
      2,
      'Explain the terms "waiting queue" and "ready queue" in an operating system. When does a process enter and leave a waiting queue?',
      [
        'Ready queue: processes in main memory that are ready to run and are waiting only for the CPU',
        'Waiting queue: processes waiting for some event (such as completion of I/O); they cannot run even if the CPU is free',
        'Enters when it requests I/O or must wait for an event; leaves when the event occurs, moving to the ready queue',
      ],
      P(
        '<b>Ready queue:</b> the list of processes that are ready to run and need only the CPU.',
        '<b>Waiting queue</b> (device queue): the list of processes waiting for some event to happen. They cannot be executed even if the CPU is available.',
        'A process <b>enters</b> a waiting queue when, during its execution, it issues an I/O request or must wait for some other event. It <b>leaves</b> when the event it is waiting for occurs (the I/O completes): it then moves from waiting to the <b>ready queue</b>.',
      ),
    ),
    written(
      'pr-medium-term',
      `${END} / ${MID}`,
      5,
      'Justify the requirement for a medium-term scheduler by explaining the issues that arise if you do not employ one.',
      [
        'The long-term scheduler chooses a mix of I/O-bound and CPU-bound processes, but the mix changes while processes run, and memory may become over-committed',
        'If all processes in memory are I/O-bound, the ready queue is empty and the CPU is idle; if all are CPU-bound, the device queues are empty and devices are idle: the system is unbalanced',
        'The medium-term scheduler swaps a process out of memory to disk, reducing the degree of multiprogramming, and later swaps it back in to continue where it left off',
        'It improves the process mix and frees memory when memory is short',
        'Without it: poor CPU or device utilisation, memory over-commitment and thrashing, with no way to correct the long-term scheduler’s choices',
      ],
      P(
        'A good system needs a <b>mix</b> of I/O-bound and CPU-bound processes in memory. If all the processes are I/O-bound, the ready queue is almost always empty and the <b>CPU is idle</b>. If all are CPU-bound, the I/O queues are empty, the <b>devices go unused</b> and the system is unbalanced. The long-term scheduler picks the mix when jobs are admitted, but the behaviour of processes changes, and on a time-sharing system there may be no long-term scheduler at all.',
        'The <b>medium-term scheduler</b> corrects this with <b>swapping</b>: it removes a process from main memory to disk, and at some later time brings it back so that it continues where it left off. It can forcibly remove a CPU-bound process and bring in an I/O-bound one, or the reverse, to <b>improve the process mix</b>, and it <b>reduces the degree of multiprogramming</b> when memory is over-committed.',
        '<b>Without it:</b> a bad mix cannot be repaired, so either the CPU or the devices are under-used; and when the processes in memory need more memory than exists, nothing can be removed to relieve the pressure, so the system pages heavily or <b>thrashes</b>.',
      ),
    ),
  ],

  threads: [
    written(
      'th-multiproc',
      Q1,
      2,
      'Explain how the multithreading framework can exploit the power of multiprocessor architectures, compared with the process framework.',
      [
        'A traditional (single-threaded) process has one stream of execution, so it can run on only one CPU however many are available',
        'A multithreaded process has several streams of execution; each thread can run in parallel on a different processor',
      ],
      P(
        'The process framework means a process with a <b>single thread</b>. It has one stream of execution, so it can use only <b>one CPU</b>, no matter how many are available.',
        'A <b>multithreaded</b> process has several streams of execution. Each thread may run <b>in parallel on a different processor</b>, so the same program makes use of a multiprocessor machine.',
      ),
    ),
    written(
      'th-realtime-lwp',
      MID,
      5,
      'Assume an operating system maps user-level threads to the kernel using the many-to-many model, where the mapping is done through LWPs (lightweight processes). The system also allows developers to create real-time threads. Is it necessary to bind a real-time thread to an LWP? What will happen if you do not? Explain.',
      [
        'Yes, it is necessary',
        'Timing is crucial for a real-time thread: it must start running very soon after it becomes runnable',
        'An unbound thread must first wait for the thread library to attach it to a free LWP before the kernel can even schedule it; if all LWPs are in use, the wait is unbounded',
        'So even at the highest priority, an unbound real-time thread may miss its deadline',
        'Binding gives the thread its own LWP (and so its own kernel thread): the moment it becomes runnable, the kernel can schedule it with minimal delay',
      ],
      P(
        '<b>Yes.</b> Timing is crucial to real-time applications. In the many-to-many model a user thread can run only while it is attached to an <b>LWP</b>, which is what the kernel actually schedules.',
        '<b>If the thread is not bound</b>, then when it becomes runnable it may first have to <b>wait for an LWP to be attached to it</b>. If all the LWPs are busy running other user threads, it waits until the thread library frees one. Consider a real-time thread that is running, blocks, and then becomes eligible again: without a bound LWP it waits for an unpredictable time before it can even be considered by the kernel scheduler. However high its priority, it may <b>miss its deadline</b>.',
        '<b>If the thread is bound</b>, the LWP is always there for it. As soon as the thread is runnable, the kernel can schedule that LWP, so the delay is minimal. Binding makes the mapping one-to-one for this thread, which is what real-time behaviour requires.',
      ),
    ),
    tf(
      'th-pool-mpl',
      END,
      'the notion of "thread pools" is employed to control the MPL (the degree of multiprogramming).',
      true,
      '<b>True.</b> A thread pool has a fixed number of threads. Requests beyond that number wait in a queue instead of each creating a new thread, so the pool puts a <b>bound on the number of threads that exist concurrently</b>. That limits the load on the CPU and memory, which is exactly controlling the multiprogramming level.',
    ),
  ],

  'cpu-scheduling': [
    written(
      'cs-nonpreemptive',
      MID,
      3,
      'Some simple operating systems use non-preemptive scheduling. Give an example of a problem that can occur when the operating system uses non-preemptive scheduling.',
      [
        'Once a process has the CPU it keeps it until it terminates or blocks; the OS cannot take it away',
        'Example: a process with a very long CPU burst, or stuck in an infinite loop, monopolises the CPU and every other process waits (the convoy effect; the system appears to hang)',
        'So response time for interactive users is poor and real-time deadlines cannot be guaranteed',
      ],
      P(
        'With non-preemptive scheduling, a process that gets the CPU <b>keeps it until it terminates or blocks</b>. The operating system cannot take it back.',
        '<b>Example.</b> A CPU-bound process with a very long burst, or one stuck in an <b>infinite loop</b>, monopolises the CPU. All other processes, including short interactive ones, wait behind it: the <b>convoy effect</b>. To the user the whole system appears frozen (as happened on early versions of Windows and Mac OS when one application misbehaved). Interactive response is poor and no real-time guarantee is possible.',
      ),
    ),
    written(
      'cs-progressive-rr',
      MID,
      5,
      'A system receives both batch jobs and interactive jobs. Normally, round robin makes the users of interactive jobs happy. Consider a variation called progressive round robin: each process has its own time quantum, which starts at 50 ms and increases by 50 ms each time the process goes through the round-robin queue. Give the advantages and disadvantages of this variant over ordinary round robin for the users of batch jobs and of interactive jobs.',
      [
        'Ordinary round robin treats all jobs alike; interactive jobs whose bursts are shorter than the quantum get good response; a process is guaranteed the CPU within quantum × (number of processes − 1)',
        'Ordinary round robin is hard on batch jobs: a long job is cut into many small slices with many context switches',
        'Progressive: a long (batch) job’s quantum keeps growing, so it gets longer runs with fewer context switches and finishes sooner: fairer to batch jobs',
        'Progressive: as quanta grow the scheme behaves more and more like FIFO; interactive jobs must wait behind long quanta, so their response time gets worse and less predictable',
        'One batch job with a very long burst can make everyone wait: the convoy effect, which cannot happen in ordinary round robin',
      ],
      P(
        '<b>Ordinary round robin.</b> Whatever the burst time, every job gets the same quantum. Interactive processes, whose bursts are shorter than the quantum, are served with <b>good response time</b>, and a process is guaranteed the CPU after at most quantum × (number of processes − 1). In effect the interactive jobs are favoured. Batch jobs suffer: they are chopped into many slices, pay for many context switches, and are delayed further as more interactive jobs arrive.',
        '<b>Progressive round robin.</b>' +
          UL(
            '<b>Batch users gain.</b> Each time round, a long job’s quantum grows (50, 100, 150 ms …), so it runs for longer stretches with <b>fewer context switches</b> and completes sooner. Batch jobs are treated more fairly than in ordinary round robin.',
            '<b>Interactive users lose.</b> A new or interactive job still starts with 50 ms, which is enough for a short burst. But it must now wait while batch jobs use their long quanta, so its <b>response time is longer and less predictable</b>.',
            '<b>Convoy effect.</b> As the quanta grow, the scheme behaves more and more like <b>FIFO</b>. One batch job with a very long burst can hold everyone up. That cannot happen in ordinary round robin.',
          ),
      ),
    ),
    written(
      'cs-misclassify',
      `${END22} / ${END21}`,
      5,
      'The kernel of a multiprogramming system classifies a program as CPU-bound or I/O-bound and assigns an appropriate priority to it. What would be the consequence of a wrong classification of programs for throughput and response times?',
      [
        'Normally I/O-bound programs get the higher priority: they use the CPU briefly and go back to their devices, so both CPU and devices stay busy',
        'With correct classification: good response time for I/O-bound (interactive) programs and good throughput overall',
        'If CPU-bound programs are wrongly treated as I/O-bound they get high priority and hold the CPU for long bursts',
        'The real I/O-bound programs wait in the ready queue: I/O devices fall idle, and their response times become long; with a continuous stream of CPU-bound work they may starve',
        'Overall throughput falls (fewer short jobs complete, devices under-used), although the misclassified CPU-bound programs themselves finish sooner',
      ],
      P(
        '<b>Normal case.</b> The system gives <b>higher priority to I/O-bound programs</b>. They need only a short CPU burst before going back to their devices, so serving them first keeps both the CPU and the devices busy. I/O-bound programs get good response times, and good throughput is still achieved for CPU-bound programs.',
        '<b>Wrong classification.</b> Suppose CPU-bound programs are taken to be I/O-bound and the reverse. The system then gives high priority to <b>CPU-bound</b> programs, each of which keeps the CPU for a long burst. The ready queue fills with I/O-bound programs waiting for a few milliseconds of CPU.' +
          UL(
            '<b>Response time:</b> the I/O-bound (interactive) users wait a long time. With a continuous stream of CPU-bound processes they may <b>starve</b>.',
            '<b>Device utilisation:</b> the devices fall idle, because the programs that would use them cannot get the CPU.',
            '<b>Throughput:</b> the throughput of I/O-bound programs decreases; that of the CPU-bound programs increases, but the system as a whole completes less work.',
          ),
      ),
    ),
    tf(
      'cs-io-priority',
      `${END} / ${END22}`,
      'compared with a CPU-bound process, the operating system gives higher priority to an I/O-bound process.',
      true,
      '<b>True.</b> An I/O-bound process needs only a short CPU burst before it starts its next I/O. Giving it priority gets the device working again quickly, which improves both CPU and I/O utilisation, and gives interactive users a good response time.',
    ),
    tf(
      'cs-affinity-balance',
      `${END} / ${END22}`,
      'the notion of "load balancing" counteracts the notion of "processor affinity".',
      true,
      '<b>True.</b> <b>Processor affinity</b> keeps a process on the processor it last ran on, because that processor’s cache still holds its data. <b>Load balancing</b> moves processes from a heavily loaded processor to a lightly loaded one. Every such migration throws away the benefit of affinity, so the two aims pull in opposite directions.',
    ),
  ],

  synchronization: [
    written(
      'sy-busy-waiting',
      Q2,
      2,
      'Explain the issue of "busy waiting". What are the implications?',
      [
        'Busy waiting: a process that cannot enter its critical section loops continuously, testing the lock, instead of giving up the CPU',
        'Implication: CPU cycles are wasted that another process could have used productively; on a single processor the lock holder cannot even run to release the lock while the waiter spins',
        'It is acceptable only when the wait is short on a multiprocessor (spinlock: no context switch); otherwise the process should block and be woken up',
      ],
      P(
        '<b>Busy waiting</b> means that while one process is in its critical section, any other process that tries to enter <b>loops continuously</b> in the entry code, repeatedly testing the lock.',
        '<b>Implications.</b> It <b>wastes CPU cycles</b> that some other process could use productively. On a single-processor system it is worse: while the waiter spins, the lock holder is not running and cannot release the lock. The remedy is to <b>block</b> the waiting process in a queue and wake it later (a semaphore with a waiting queue). Busy waiting is worthwhile only as a <b>spinlock</b> on a multiprocessor when the lock is held for a time shorter than two context switches.',
      ),
    ),
    written(
      'sy-adaptive-mutex',
      Q2,
      2,
      'For synchronisation, Solaris provides (i) the adaptive mutex and (ii) the semaphore. Explain the difference.',
      [
        'Adaptive mutex: protects short critical sections; it starts as a spinlock, and if the thread holding the lock is not currently running on a CPU the waiter sleeps instead of spinning',
        'Semaphore: the waiting thread always blocks (sleeps in a queue) until signalled; used for longer sections, and a counting semaphore can also manage several instances of a resource',
      ],
      P(
        'An <b>adaptive mutex</b> protects access to data in <b>short</b> code segments. It <b>adapts</b>: on a multiprocessor it starts as a spinlock. If the lock is held by a thread that is <b>currently running on another CPU</b>, the waiter spins, because the lock will probably be released soon. If the holder is <b>not running</b>, the waiter <b>sleeps</b> until the lock is released.',
        'A <b>semaphore</b> never spins: a thread that cannot proceed is <b>blocked</b> in the semaphore’s queue and woken by a signal. It suits <b>longer</b> sections of code (where spinning would waste the CPU), and, being a counter, it can also control a resource with several instances.',
      ),
    ),
    written(
      'sy-turnstile',
      Q2,
      2,
      'For synchronisation, Solaris provides the concept of turnstiles. What is the purpose of turnstiles?',
      [
        'A turnstile is a queue structure containing the threads blocked on a lock; it orders the threads waiting to acquire an adaptive mutex or a reader-writer lock',
        'Each kernel thread has its own turnstile (not each lock), which is more efficient since a thread can block on only one lock at a time; turnstiles are organised by priority inheritance to prevent priority inversion',
      ],
      P(
        'A <b>turnstile</b> is a <b>queue structure containing the threads blocked on a lock</b>. Solaris uses turnstiles to <b>order the list of threads waiting</b> to acquire either an adaptive mutex or a reader-writer lock.',
        'Since a thread can be blocked on only one object at a time, Solaris gives each <b>kernel thread</b> its own turnstile instead of one per lock, which is more efficient. Turnstiles are organised according to a <b>priority-inheritance protocol</b>: if a lower-priority thread holds a lock that a higher-priority thread is waiting for, it temporarily inherits the higher priority. This prevents <b>priority inversion</b>.',
      ),
    ),
    tf(
      'sy-wait-vs-cwait',
      END,
      'there is no difference between "wait" in a semaphore and "wait" (conditional wait) in a monitor.',
      false,
      '<b>False.</b> A semaphore <b>wait</b> decrements the value and blocks the caller <b>only if</b> the value is not positive; a later signal is remembered in the value. A monitor <b>x.wait()</b> <b>always</b> suspends the caller (and releases the monitor) until another process invokes x.signal(); and x.signal() has <b>no effect</b> if no process is waiting. Corrected: the two differ, because a semaphore keeps state and a condition variable does not.',
    ),
    tf(
      'sy-monitor-busy',
      `${END} / ${END22}`,
      'with monitors, it is possible to reduce busy waiting compared with semaphores.',
      false,
      '<b>False.</b> Monitors do not change how waiting is implemented. They make it <b>easier to write correct programs</b> for critical-section problems, because mutual exclusion is provided automatically. The same kind of busy waiting, if any, exists in both constructs: a monitor is itself implemented with semaphores or locks. Corrected: monitors reduce programming errors, not busy waiting.',
    ),
    written(
      'sy-progress',
      END,
      3,
      'What is the implication if a solution to the critical-section problem does not satisfy the "progress" condition?',
      [
        'Progress: if no process is in its critical section and some wish to enter, only processes not in their remainder sections take part in the decision, and the decision cannot be postponed indefinitely',
        'Without it, a process can be kept out although the critical section is free: for example strict alternation, where a process that does not want to enter blocks the other; or both processes wait for each other for ever (deadlock/livelock)',
        'So the resource sits idle while processes wait: lower utilisation and throughput, and the speed of one process is tied to the behaviour of another',
      ],
      P(
        '<b>Progress</b> requires that if no process is executing in its critical section and some processes wish to enter, then only those not in their remainder sections take part in deciding who enters next, and the decision <b>cannot be postponed indefinitely</b>.',
        '<b>If it does not hold</b>, a process may be <b>unable to enter although the critical section is free</b>. Two typical cases:' +
          UL(
            '<b>Strict alternation</b> (the "turn" algorithm): after P0 leaves, it cannot enter again until P1 has taken its turn. If P1 is busy elsewhere or has terminated, P0 waits for ever. A process that is not even competing decides who may enter.',
            '<b>Both wait for each other</b> (the "flags" algorithm): each sets its flag, sees the other’s, and waits. Nobody enters.',
          ),
        'The shared resource is idle while processes wait, so the system is slower, and in the worst case the processes are stuck permanently.',
      ),
    ),
    written(
      'sy-spin-or-sem',
      END,
      3,
      'When developing an application, how do you decide whether you should employ a "spinlock" or a "semaphore"?',
      [
        'Spinlock: the waiter busy-waits; no context switch, but it burns CPU while waiting',
        'Use a spinlock when the lock is held for a short time (less than about two context switches) and the system is a multiprocessor, so the holder can run on another CPU and release it',
        'Use a (blocking) semaphore when the lock may be held for a long time, on a single processor, or when a thread may sleep while holding it; also when counting several instances of a resource',
      ],
      P(
        'The choice depends on <b>how long the lock is held</b> and on the <b>hardware</b>.',
        UL(
          '<b>Spinlock:</b> the waiting thread loops. Nothing is spent on context switches, but the CPU is wasted while it spins. Use it when the critical section is <b>short</b>, roughly less than the time of two context switches, <b>and</b> the machine is a <b>multiprocessor</b>, so that the thread holding the lock can run on another CPU and release it quickly.',
          '<b>Semaphore</b> (blocking): the waiting thread sleeps in a queue and the CPU is given to another thread, at the price of two context switches. Use it when the lock may be <b>held for a long time</b>, when the code may <b>sleep while holding</b> it, on a <b>single processor</b> (where spinning can never help), or when a <b>count</b> of resources is needed.',
        ),
      ),
    ),
    written(
      'sy-cwait',
      `${END22} / ${END21}`,
      5,
      'Given that the monitor construct protects the critical section by allowing one process at a time, why do you require the "c.wait" and "c.signal" operations in the monitor? How are they different from the "wait" and "signal" operations of a semaphore?',
      [
        'There are two kinds of waiting: waiting for mutual exclusion (to avoid a race condition), and waiting for a condition to become true (to avoid inconsistency), such as a producer finding the buffer full or a consumer finding it empty',
        'The monitor itself takes care of mutual exclusion, so no semaphore-style wait and signal are needed for that',
        'It does not handle conditional waiting: a process inside the monitor that cannot continue must wait without blocking everyone else; c.wait suspends it and releases the monitor, c.signal resumes one waiting process',
        'Difference 1: c.wait always suspends the caller; a semaphore wait blocks only if the value is not positive',
        'Difference 2: c.signal has no effect if nobody is waiting (it is not remembered); a semaphore signal always increments the value',
      ],
      P(
        'There are <b>two kinds of waiting</b> for a shared resource. One is <b>mutual-exclusion waiting</b>, to avoid a race condition. The other is <b>conditional waiting</b>, to avoid inconsistency: a producer must wait when the buffer is full, and a consumer must wait when it is empty.',
        'The monitor construct takes care of the <b>first kind</b> by itself: only one process is active inside, so no semaphore-style wait and signal are needed for protection. It does <b>not</b> take care of the <b>second kind</b>. A producer inside the monitor that finds the buffer full cannot simply stay there, because it would keep everyone else out, including the consumer that could make space. So condition variables are provided: <b>c.wait</b> suspends the caller and lets another process into the monitor, and <b>c.signal</b> resumes one process waiting on c.',
        '<b>How they differ from semaphore operations.</b>' +
          UL(
            '<b>c.wait always blocks</b> the caller. A semaphore wait blocks only when the semaphore’s value is not positive.',
            '<b>c.signal is lost if no process is waiting</b>: the state is as though it was never executed. A semaphore signal always changes the state, by incrementing the value, so it is remembered.',
            'A condition variable holds <b>no value</b>; it is only a queue. A semaphore is a counter.',
          ),
      ),
    ),
    written(
      'sy-jurassic',
      END,
      5,
      'Jurassic Park consists of a dinosaur museum and a park for safari riding. There are m passengers and n single-passenger cars. Passengers wander around the museum for a while, then line up to take a ride in a safari car. When a car is available, it loads the one passenger it can hold and rides around the park for a random amount of time. If the n cars are all out riding passengers around, a passenger who wants to ride waits; if a car is ready to load but there are no waiting passengers, the car waits. Use semaphores to synchronise the m passenger processes and the n car processes. Is your solution deadlock-free and/or starvation-free? Discuss.',
      [
        'Semaphores initialised to 0 used as signals: carAvail (a car is ready to load), carTaken (a passenger has got in), carFilled or rideDone (the ride is over)',
        'Passenger: wander; wait(carAvail); signal(carTaken); wait(rideDone); leave',
        'Car: signal(carAvail); wait(carTaken); ride; signal(rideDone); repeat',
        'Correct waiting on both sides: a passenger blocks on carAvail when no car is free; a car blocks on carTaken when no passenger is waiting',
        'Deadlock-free: no process holds one semaphore while waiting for another in a cycle; every wait is matched by a signal from the other side',
        'Starvation: possible only if the semaphore queue is not first-in, first-out; with FIFO queues every waiting passenger eventually rides',
      ],
      P('Use three semaphores, all initialised to <b>0</b>, as signals between the two kinds of process.') +
        PRE(
          `semaphore carAvail = 0;   // a car is waiting to load
semaphore carTaken = 0;   // a passenger has boarded a car
semaphore rideDone = 0;   // a ride has finished

Passenger:                       Car:
  while (true) {                   while (true) {
    wander_in_museum();              signal(carAvail);  // ready to load
    wait(carAvail);   // queue       wait(carTaken);    // wait for a passenger
    signal(carTaken); // board       ride_around_park(); // random time
    wait(rideDone);   // riding      signal(rideDone);   // let passenger off
  }                                }`,
        ) +
        P(
          '<b>Why it works.</b> If all n cars are out, <code>carAvail</code> is 0 and a passenger who wants to ride <b>blocks</b>. If a car is ready but nobody is queueing, the car blocks on <code>carTaken</code>. Each <code>signal(carAvail)</code> lets exactly one passenger through, so a car carries one passenger.',
          '<b>Deadlock.</b> None. No process holds a resource while waiting for another: each wait is satisfied by a signal that the other side will certainly issue (a car always signals <code>carAvail</code> before waiting, and a rider always signals <code>carTaken</code> after being admitted). There is no circular wait.',
          '<b>Starvation.</b> It depends on the semaphore’s queue. If waiting passengers are woken in <b>first-in, first-out</b> order, every passenger eventually rides. If the order is arbitrary, an unlucky passenger could be overtaken for ever. (A refinement: with one shared <code>rideDone</code>, a passenger may be released by a different car’s signal; giving each car its own semaphore removes that inaccuracy.)',
        ),
    ),
  ],

  deadlocks: [
    tf(
      'dl-nopreempt-starve',
      Q2,
      'a deadlock-prevention algorithm designed by violating the no-preemption condition suffers from the starvation problem.',
      true,
      '<b>True.</b> To deny no preemption, a process that cannot get a resource has all the resources it holds taken away, and is restarted only when it can get them all back. The same process may be <b>preempted again and again</b> and never complete: that is starvation.',
    ),
    tf(
      'dl-avoid-util',
      END,
      'the deadlock-avoidance approach improves resource utilisation over a deadlock-prevention approach based on violating the no-preemption condition.',
      true,
      '<b>True.</b> Prevention by preemption takes resources away from processes and restarts them, so work is thrown away and repeated, and resources are held without useful results. Avoidance uses advance knowledge of maximum claims to grant a request whenever the resulting state is safe; nothing is rolled back, so resources are used more productively.',
    ),
    written(
      'dl-circular-starve',
      END,
      3,
      'Deadlock-prevention protocols which violate "circular wait" may suffer from the starvation problem. Yes or no? Justify.',
      [
        'The protocol imposes a total ordering on resource types; processes request resources in increasing order',
        'No resource is ever taken away from a process and no process is rolled back, so a process that holds resources keeps making progress and eventually releases them',
        'So the protocol itself does not cause starvation, unlike prevention by preemption; a process waits only as long as the holders take to finish',
        'Qualification: starvation is still possible if the allocator does not serve waiting processes fairly (not first-come, first-served), or under the variant that forces a process to release higher-numbered resources and compete for them again',
      ],
      P(
        '<b>No, not because of the protocol itself.</b> To deny circular wait, all resource types are given a total order and each process requests resources in <b>increasing order</b>. A process that cannot get a resource simply <b>waits</b>; nothing it holds is taken away and it is never rolled back. Because there can be no cycle, some process always holds everything it needs, finishes, and releases its resources, so the others move forward in turn. Compare prevention by <b>preemption</b>, where the same process may be preempted repeatedly and starve.',
        '<b>Qualification.</b> Starvation can still arise from <b>how waiting requests are served</b>. If a freed resource is not granted in first-come, first-served order, an unlucky process can be overtaken indefinitely. And in the second form of the protocol, a process that needs a lower-numbered resource must first <b>release</b> its higher-numbered ones and compete for them again, where it may keep losing. With fair (FIFO) allocation the answer is a clear no.',
      ),
    ),
    written(
      'dl-safe-2022',
      END22,
      5,
      'Assume a system with four resource types, C = &lt;6, 4, 4, 2&gt; (the total number of instances of R0, R1, R2, R3). Maximum claim: P0 (3, 2, 1, 1), P1 (1, 2, 0, 2), P2 (1, 1, 2, 0), P3 (3, 2, 1, 0), P4 (2, 1, 0, 1). Current allocation: P0 (2, 0, 1, 1), P1 (1, 1, 0, 0), P2 (1, 1, 0, 0), P3 (1, 0, 1, 0), P4 (0, 1, 0, 1). Is this a safe state? Why, or why not?',
      [
        'Allocated in total = (5, 3, 2, 2), so Available = C − allocated = (1, 1, 2, 0)',
        'Need = Max − Allocation: P0 (1, 2, 0, 0), P1 (0, 1, 0, 2), P2 (0, 0, 2, 0), P3 (2, 2, 0, 0), P4 (2, 0, 0, 0)',
        'Only P2 can go first: Need (0, 0, 2, 0) ≤ (1, 1, 2, 0); Work becomes (2, 2, 2, 0)',
        'Then P0, P3 and P4 can finish in any order (Work reaches (5, 3, 4, 2)); P1 goes last because it needs two instances of R3',
        'A safe sequence exists, for example <P2, P0, P3, P4, P1>, and Work ends at (6, 4, 4, 2) = C, so the state is safe',
      ],
      P(
        '<b>Available.</b> Total allocated = (2+1+1+1+0, 0+1+1+0+1, 1+0+0+1+0, 1+0+0+0+1) = (5, 3, 2, 2). So Available = (6, 4, 4, 2) − (5, 3, 2, 2) = <b>(1, 1, 2, 0)</b>.',
        '<b>Need = Max − Allocation.</b> P0 (1, 2, 0, 0); P1 (0, 1, 0, 2); P2 (0, 0, 2, 0); P3 (2, 2, 0, 0); P4 (2, 0, 0, 0).',
        '<b>Safety algorithm</b>, Work = (1, 1, 2, 0):' +
          UL(
            'P0 needs 2 of R1 (only 1), P1 needs 2 of R3 (none), P3 and P4 need 2 of R0 (only 1). <b>P2</b> fits: Work = (1, 1, 2, 0) + (1, 1, 0, 0) = (2, 2, 2, 0).',
            '<b>P0</b> (1, 2, 0, 0) fits: Work = (4, 2, 3, 1).',
            '<b>P3</b> (2, 2, 0, 0) fits: Work = (5, 2, 4, 1).',
            '<b>P4</b> (2, 0, 0, 0) fits: Work = (5, 3, 4, 2).',
            '<b>P1</b> (0, 1, 0, 2) fits: Work = (6, 4, 4, 2), which equals C.',
          ),
        '<b>Yes, the state is safe.</b> The sequence &lt;P2, P0, P3, P4, P1&gt; lets every process obtain its maximum claim and finish. (Other safe sequences exist, such as &lt;P2, P3, P4, P0, P1&gt;; all must start with P2 and end with P1.)',
      ),
    ),
  ],

  'networking-intro-datalink': [
    written(
      'nd-examples',
      OSNQ2,
      2,
      'Give two example applications where connection-oriented service is appropriate. Also give two examples where connectionless service is best.',
      [
        'Connection-oriented (a connection is set up, used and released; reliable, in order): file transfer, e-mail, web page download, remote login',
        'Connectionless (each message is carried separately; no setup; a late packet is useless): live video or voice call, media streaming, DNS lookup, online games',
      ],
      P(
        'A <b>connection-oriented</b> service is modelled on the telephone system: set up a connection, use it, release it. It suits applications that need everything to arrive, in order: <b>file transfer</b>, <b>e-mail</b>, opening a <b>web page</b>, remote login.',
        'A <b>connectionless</b> service is modelled on the postal system: each message is handled separately. It suits applications where speed matters more than perfect delivery, or where the exchange is one short request and reply: a <b>video or voice call</b>, <b>live streaming</b>, a DNS query.',
      ),
    ),
    written(
      'nd-aloha',
      `${END22} / ${END21}`,
      5,
      'Explain the difference between "Pure ALOHA" and "Slotted ALOHA" in terms of implementation. What is the reason for the improved performance of Slotted ALOHA over Pure ALOHA?',
      [
        'Both are multiple-access protocols: stations transmit on a shared channel; if two frames overlap, even partly, both are destroyed and are retransmitted after a random time',
        'Pure ALOHA: a station transmits whenever it has a frame; no global synchronisation',
        'Slotted ALOHA: time is divided into slots of one frame time and a station may begin transmitting only at the start of a slot, which needs a common clock',
        'Reason: in pure ALOHA a frame is vulnerable to any frame started within two frame times (partial overlaps); in slotted ALOHA frames either coincide exactly or not at all, so the vulnerable period is one frame time',
        'Result: maximum throughput doubles, from 1/(2e) ≈ 18.4% (at G = 0.5) to 1/e ≈ 36.8% (at G = 1), at the cost of a small delay waiting for the slot',
      ],
      P(
        'Both are <b>multiple-access</b> protocols in which many users send on one shared channel. If any two frames overlap, even partially, both are damaged and must be <b>retransmitted</b> after a random wait.',
        '<b>Implementation.</b> In <b>pure ALOHA</b> a station transmits <b>whenever it has data</b>; there is no synchronisation among users. In <b>slotted ALOHA</b> time is divided into discrete <b>slots</b>, each one frame long, and a station may start sending <b>only at the beginning of a slot</b>. This requires the stations to agree on slot boundaries, for example from a special station that emits a clock signal.',
        '<b>Why slotted ALOHA performs better.</b> In pure ALOHA a frame collides with any other frame that begins within one frame time before or after it starts: the <b>vulnerable period is two frame times</b>, and a partial overlap ruins both frames. In slotted ALOHA frames either collide completely or not at all, so the <b>vulnerable period is halved</b> to one frame time. Throughput is S = G·e<sup>−2G</sup> for pure ALOHA, with a maximum of <b>1/(2e) ≈ 18.4%</b>, and S = G·e<sup>−G</sup> for slotted ALOHA, with a maximum of <b>1/e ≈ 36.8%</b>: double, at the small cost of waiting for the next slot.',
      ),
    ),
    written(
      'nd-design-issues',
      Q2,
      2,
      'List the issues in designing the data link layer. Briefly explain one protocol and discuss how these issues are addressed.',
      [
        'Issues: providing a service to the network layer; framing; error control (damaged, lost and duplicate frames); flow control (a fast sender must not swamp a slow receiver)',
        'One protocol, for example Go-Back-N (or stop-and-wait): frames carry a checksum and a sequence number; the receiver acknowledges correct frames; the sender retransmits on timeout; the window limits unacknowledged frames',
      ],
      P(
        '<b>Design issues.</b> (1) Providing a well-defined <b>service interface</b> to the network layer. (2) <b>Framing</b>: breaking the bit stream into frames. (3) <b>Error control</b>: dealing with damaged, lost and duplicated frames. (4) <b>Flow control</b>: keeping a fast sender from overwhelming a slow receiver.',
        '<b>One protocol: Go-Back-N sliding window.</b> Data is sent in <b>frames</b> marked by flags (with bit stuffing) and protected by a <b>checksum</b>, so the receiver can detect damage. Each frame carries a <b>sequence number</b>; the receiver sends <b>acknowledgements</b>, and the sender keeps a <b>timer</b> and retransmits from the lost frame onwards, so nothing is lost or duplicated. The sender may have at most a <b>window</b> of unacknowledged frames outstanding, which is the flow control.',
      ),
    ),
    written(
      'nd-p-persistent',
      Q2,
      2,
      'Discuss the p-persistent CSMA protocol. How does it improve performance over the 1-persistent CSMA protocol?',
      [
        'p-persistent CSMA applies to slotted channels: a ready station senses the channel; if idle it transmits with probability p, and with probability 1 − p defers to the next slot, repeating; if busy it waits for the next slot',
        '1-persistent: every station waiting for a busy channel transmits (with probability 1) the moment it becomes idle, so two or more waiting stations always collide',
        'With p < 1 the waiting stations are spread over several slots, so collisions are fewer and throughput at high load is higher (at the cost of some delay)',
      ],
      P(
        '<b>p-persistent CSMA</b> applies to slotted channels. When a station is ready to send, it senses the channel. If the channel is <b>idle</b>, it transmits with probability <b>p</b>; with probability 1 − p it <b>defers to the next slot</b>. If that slot is also idle, it again transmits with probability p or defers, and so on until the frame is sent or another station begins (which it treats as a collision: wait a random time). If the channel is busy, it waits until the next slot.',
        '<b>Improvement.</b> In <b>1-persistent</b> CSMA a station transmits with probability 1 as soon as the channel becomes idle. If two stations become ready during someone else’s transmission, both start the instant it ends and <b>collide for certain</b>. With p less than 1 they are unlikely to choose the same slot, so there are <b>fewer collisions</b> and the throughput at high load is higher. The smaller p is, the better the throughput, at the price of longer delay.',
      ),
    ),
    tf(
      'nd-fourier',
      END22,
      'the Fourier theorem helps to improve the efficiency of the channel or link.',
      true,
      '<b>True.</b> A channel has limited bandwidth. Fourier analysis shows that a signal is a sum of frequency components (harmonics), and tells us how many of the major components must get through for the signal to be received successfully. Only those need be transmitted, so bandwidth is conserved and more signals can be carried in the given frequency range.',
    ),
  ],

  'network-layer': [
    tf(
      'nl-hierarchical',
      `${END22} / ${OSNQ2}`,
      'hierarchical routing results in shorter paths than flat routing.',
      false,
      '<b>False.</b> In hierarchical routing the routers are divided into regions. A router knows the detail of its own region, but for other regions it keeps only one entry, pointing at a representative router. The routing tables are much smaller, but a packet for another region is sent via that representative even when a more direct route exists. Corrected: hierarchical routing may result in <b>longer</b> paths than flat routing; that is the price paid for smaller tables.',
    ),
    tf(
      'nl-leaky-token',
      END22,
      'the "leaky bucket algorithm" performs better than the "token bucket algorithm".',
      false,
      '<b>False.</b> A leaky bucket produces output at a <b>constant</b> rate however bursty the input, so a burst is delayed or dropped. A token bucket lets an idle host save up tokens and then send a <b>burst</b>, up to the bucket size, so its output varies with the number of tokens. Corrected: the token bucket adapts better to changes in the traffic burst.',
    ),
    written(
      'nl-link-state',
      Q2,
      2,
      'Briefly explain the link state routing algorithm.',
      [
        'Each router: discovers its neighbours and learns their addresses; measures the cost (delay) to each; builds a link-state packet with what it has learnt',
        'It floods the packet to all other routers (with sequence numbers and age), so every router knows the whole topology, and then runs Dijkstra’s shortest-path algorithm',
      ],
      P(
        'Each router does five things: (1) <b>discovers its neighbours</b> and learns their network addresses (HELLO packets); (2) <b>measures the cost</b> to each neighbour; (3) <b>builds a link-state packet</b> containing its identity, a sequence number, an age, and the list of neighbours with costs; (4) <b>floods</b> this packet to all other routers; (5) once it has a packet from every router, it knows the complete topology and computes the shortest path to every destination with <b>Dijkstra’s algorithm</b>.',
        'Because every router works from the same complete map, it converges quickly and does not suffer from the count-to-infinity problem of distance vector routing.',
      ),
    ),
    written(
      'nl-ecn',
      OSNQ2,
      2,
      'Briefly discuss the protocol for handling congestion with Explicit Congestion Notification (ECN).',
      [
        'A router that is experiencing congestion does not send a separate packet: it marks (sets a bit in the header of) the packets it forwards',
        'The receiver sees the mark and tells the sender in its next reply (acknowledgement); the sender then reduces its transmission rate',
      ],
      P(
        'With <b>ECN</b>, a router can <b>tag any packet it forwards</b>, by setting a bit in the packet’s header, to signal that it is experiencing congestion. When the network delivers the packet, the <b>receiver notes the mark</b> and informs the sender when it sends its next reply (the acknowledgement). The sender then <b>throttles its transmission</b>. No extra packets are generated at the congested router, and nothing has to be dropped to send the signal.',
      ),
    ),
  ],

  'transport-layer': [
    written(
      'tl-establish-release',
      END,
      5,
      'In the TCP protocol, explain the issues with connection establishment and connection release. Briefly explain the solutions.',
      [
        'Establishment issue: the network can lose, delay and duplicate packets; a delayed duplicate of an old connection request could open a connection (and repeat a transaction) that nobody asked for',
        'Solution part 1: bound packet lifetime, and choose initial sequence numbers (from a clock) so that a sequence number is not reused within the maximum segment lifetime (forbidden region)',
        'Solution part 2: three-way handshake: SYN(seq = x); SYN + ACK(seq = y, ack = x + 1); ACK(ack = y + 1); each side must confirm the other’s fresh sequence number, so an old duplicate is rejected',
        'Release issue: asymmetric (abrupt) release can lose data; symmetric release meets the two-army problem: neither side can be sure its final message arrived, so no protocol can guarantee agreement',
        'Solution: each direction is closed separately with FIN and ACK, and timers are used: if the acknowledgement of a FIN does not arrive, the sender times out and releases anyway',
      ],
      P(
        '<b>Connection establishment: the issue.</b> The network can lose, store and <b>duplicate</b> packets. A packet may take a long route, the sender times out and sends again, and both the old and the new copy arrive. A <b>delayed duplicate</b> of an old connection request, arriving after that connection has closed, could open a new connection and repeat an old transaction.',
        '<b>Solution.</b> First, limit how long a packet can live, and pick <b>initial sequence numbers</b> (from a clock) so that a number is never reused while old segments with it may still exist (keeping out of the "forbidden region"). Second, the <b>three-way handshake</b>: host 1 sends SYN(seq = x); host 2 replies SYN + ACK(seq = y, ack = x + 1); host 1 replies ACK(ack = y + 1). Each side proposes a <b>fresh</b> sequence number and the other must acknowledge it. If an old duplicate SYN turns up, host 2’s reply reaches host 1, which knows it made no such request and rejects it.',
        '<b>Connection release: the issue.</b> <b>Asymmetric</b> release (one side just hangs up) can <b>lose data</b> still in transit. In <b>symmetric</b> release each side wants to be sure the other is ready, but that is the <b>two-army problem</b>: the last message can always be lost, so no protocol can make both sides certain.',
        '<b>Solution.</b> TCP releases each direction independently: a side with no more data sends <b>FIN</b>, which is acknowledged; the other side does the same when it is finished. <b>Timers</b> break the uncertainty: if the reply to a FIN does not arrive within a set time, the sender releases the connection anyway, and the other side will eventually time out too.',
      ),
    ),
  ],

  'memory-management': [
    written(
      'mm-44bit',
      END,
      5,
      'A computer system has a 44-bit virtual address, a page size of 64K and 4 bytes per page-table entry. (i) How many pages are there in the virtual address space? (ii) Suppose we use two-level paging and arrange for every page table to fit into a single page frame. How will the bits of the address be divided up? (iii) A 4 GB program is in memory together with all its necessary page tables (two-level paging). How many frames of memory does the program use, including its page tables? (Frame size = page size.)',
      [
        '(i) Page size 64K = 2^16, so the offset is 16 bits and the page number is 44 − 16 = 28 bits: 2^28 pages',
        '(ii) One page-table page holds 2^16 / 4 = 2^14 entries, so each level is indexed by 14 bits',
        '(ii) Address = 14 bits (outer page table) | 14 bits (inner page table) | 16 bits (offset)',
        '(iii) Program pages: 4 GB / 64K = 2^32 / 2^16 = 2^16 = 65,536 frames',
        '(iii) Each inner table maps 2^14 pages, so 2^16 / 2^14 = 4 inner tables, plus 1 outer table: 65,536 + 4 + 1 = 65,541 frames',
      ],
      P(
        '<b>(i)</b> The page size is 64K = 2<sup>16</sup> bytes, so the offset takes 16 bits. That leaves 44 − 16 = 28 bits of page number: <b>2<sup>28</sup> pages</b> (about 268 million).',
        '<b>(ii)</b> A page table that fits in one frame holds 2<sup>16</sup> / 4 = <b>2<sup>14</sup> entries</b>, so it is indexed by 14 bits. The 28-bit page number splits evenly: <b>14 bits</b> for the outer page table, <b>14 bits</b> for the inner page table, and <b>16 bits</b> of offset.',
        '<b>(iii)</b> The program occupies 2<sup>32</sup> / 2<sup>16</sup> = 2<sup>16</sup> = <b>65,536</b> pages. One inner page table maps 2<sup>14</sup> pages, so 2<sup>16</sup> / 2<sup>14</sup> = <b>4</b> inner tables are needed, and there is <b>1</b> outer table. Total: 65,536 + 4 + 1 = <b>65,541 frames</b>.',
      ),
    ),
  ],

  'virtual-memory': [
    {
      id: 'pq-vm-avg-access',
      type: 'numeric',
      pastPaper: true,
      source: `${END} / ${END22}`,
      prompt:
        'A computer has a cache, main memory, and a disk used for virtual memory. If a referenced word is in the cache, 20 ns are required to access it. If it is in main memory but not in the cache, 60 ns are needed to load it into the cache, and then the reference is started again. If the word is not in main memory, 12 ms are required to fetch it from the disk, followed by 60 ns to copy it to the cache, and then the reference is started again. The cache hit ratio is 0.9 and the main-memory hit ratio is 0.6. What is the average time required to access a referenced word? Answer in milliseconds, to one decimal place.',
      answer: 4.8,
      tolerance: 0.05,
      unit: 'ms',
      hint: 'First find the average time when the word is in main memory (cache hit or cache miss). Then combine that with the disk case.',
      explanation:
        'This follows the answer key of the paper. <b>Step 1</b>, the word is in main memory: 0.9 × 20 ns + 0.1 × (60 + 20) ns = 18 + 8 = <b>26 ns</b>. <b>Step 2</b>, bring in the disk: 0.6 × 26 ns + 0.4 × (12 ms + 60 ns + 20 ns) = 15.6 ns + 4,800,032 ns ≈ 4,800,048 ns ≈ <b>4.8 ms</b>. The disk dominates completely: four references in ten cost 12 ms each. (If you read the 0.6 as applying only to the 10% of references that miss the cache, you get 0.9 × 20 + 0.06 × 80 + 0.04 × 12,000,080 ≈ 0.48 ms. State your assumption in an exam.)',
    },
    written(
      'vm-software-support',
      END22,
      5,
      'In addition to hardware support such as a page table and secondary memory, what kind of software support is needed to implement demand paging? Explain clearly.',
      [
        'The crucial requirement is the ability to restart any instruction after a page fault, as if the fault had not happened',
        'Simple case: for ADD A, B, C a fault while storing C means the instruction is restarted: fetched, decoded, operands fetched and added again',
        'Difficulty 1: an instruction that modifies several locations, such as a block move (IBM MVC, up to 256 bytes) whose source and destination overlap; after a partial move it cannot simply be redone',
        'Solutions: microcode touches both ends of both blocks first so any fault happens before anything is changed; or temporary registers hold the overwritten values and they are written back on a fault',
        'Difficulty 2: special addressing modes such as auto-increment and auto-decrement, MOV (R2)+, −(R3): the registers have already changed; a status register records which register changed and by how much so the OS can undo it',
      ],
      P(
        'Besides the page table and the backing store, the system must be able to <b>restart any instruction after a page fault</b>, with the process in exactly the state it was in, apart from the page now being present.',
        '<b>(i) The ordinary case.</b> Take ADD A, B, C: fetch and decode the instruction, fetch A, fetch B, add, store the sum in C. If the fault occurs when storing C, the operating system brings the page in and the <b>instruction is restarted</b>: fetched again, decoded again, the operands fetched and added again. A little work is repeated, but only when a fault occurs.',
        '<b>(ii) Instructions that modify several locations.</b> The IBM 360/370 MVC (move character) instruction moves up to 256 bytes. If the source and destination <b>overlap</b> and a fault occurs part-way, the source has already been altered, so the instruction cannot simply be redone. Two solutions: the <b>microcode accesses both ends of both blocks</b> before moving anything, so any fault happens while nothing has been modified; or <b>temporary registers</b> hold the values of overwritten locations, and on a fault the old values are written back, restoring memory to its state before the instruction started.',
        '<b>(iii) Special addressing modes.</b> With <b>auto-increment</b> and <b>auto-decrement</b>, a register is used as a pointer and changed as a side effect, as in MOV (R2)+, −(R3). If the fault occurs while storing through R3, R2 and R3 have already been changed. A <b>status register</b> records the register number and the amount modified, so the operating system can <b>undo</b> the effects of the partially executed instruction before restarting it.',
      ),
    ),
    tf(
      'vm-global-local',
      `${END} / ${END22}`,
      'a global frame-allocation algorithm gives better throughput than a local frame-allocation algorithm.',
      true,
      '<b>True.</b> With global replacement a process can take a frame that another process is not using well, so frames flow to where they are needed and the allocation adapts to each process’s locality. With local replacement a process is confined to its own frames even if others have frames lying idle. Global replacement generally gives greater throughput and is the more common method, although a process can no longer control its own page-fault rate.',
    ),
    written(
      'vm-enhanced-clock',
      END,
      5,
      'A small computer has 8 page frames, each containing a page. The frames contain virtual pages A, C, G, H, B, L, N and F, in that order. Their load times were 18, 23, 5, 7, 32, 19, 3 and 8. Their reference bits are 1, 0, 1, 1, 0, 1, 1 and 0, and their modified bits are 1, 1, 1, 0, 0, 0, 1 and 1, respectively. What is the order in which the enhanced second-chance algorithm considers the pages, and which one is selected?',
      [
        'The algorithm scans the pages in circular (FIFO) order, oldest first, by load time: N (3), G (5), H (7), F (8), A (18), L (19), C (23), B (32)',
        'Each page is in a class (reference bit, modified bit): (0, 0) is the best victim, then (0, 1), (1, 0), (1, 1)',
        'Classes: N (1, 1), G (1, 1), H (1, 0), F (0, 1), A (1, 1), L (1, 0), C (0, 1), B (0, 0)',
        'The first pass looks for class (0, 0): N, G, H, F, A, L and C are passed over; B is (0, 0)',
        'B is selected: it has been neither used recently nor modified, so it can be replaced without writing it to disk',
      ],
      P(
        'The enhanced second-chance (clock) algorithm treats the frames as a circular queue in <b>FIFO order</b> and uses the pair <b>(reference bit, modified bit)</b>:' +
          UL(
            '(0, 0) neither recently used nor modified: the best page to replace;',
            '(0, 1) not recently used but modified: must be written out first;',
            '(1, 0) recently used but clean: probably used again soon;',
            '(1, 1) recently used and modified: the worst choice.',
          ),
        '<b>Order considered</b> (oldest load time first): <b>N</b> (3), <b>G</b> (5), <b>H</b> (7), <b>F</b> (8), <b>A</b> (18), <b>L</b> (19), <b>C</b> (23), <b>B</b> (32).',
        '<b>Classes:</b> N (1, 1); G (1, 1); H (1, 0); F (0, 1); A (1, 1); L (1, 0); C (0, 1); B (0, 0).',
        'The first scan looks for a page of class (0, 0). N, G, H, F, A, L and C are examined and skipped. <b>B is (0, 0), so B is selected.</b> Although B is the most recently loaded page, it has not been referenced in the current period and is clean, so replacing it needs no disk write. (Had there been no (0, 0) page, a second scan would look for (0, 1), clearing reference bits as it went; F would then be chosen.)',
      ),
    ),
  ],

  'storage-and-raid': [
    written(
      'sr-raid4',
      END,
      5,
      'Explain the concept of "RAID level 4". What is the issue with RAID level 4? How does RAID level 5 overcome the issue?',
      [
        'RAID 4: block-interleaved parity; data is striped block by block across N data disks and one dedicated disk holds the parity block of each stripe',
        'Any single disk failure is survived: the missing block is the exclusive-OR of the corresponding blocks on the other disks; a read of one block uses only one disk, so several reads proceed in parallel',
        'Issue: every write must also update the parity block (read old data, read old parity, write new data, write new parity), and all parity blocks are on one disk, so the parity disk is a bottleneck: small writes cannot proceed in parallel',
        'RAID 5: block-interleaved distributed parity; the parity blocks are spread over all the disks, a different disk for each stripe',
        'So writes to different stripes use different parity disks and can go on in parallel; the overhead is still one disk’s worth, and the parity disk also no longer wears out first',
      ],
      P(
        '<b>RAID level 4</b> is <b>block-interleaved parity</b>. Data is striped at the level of blocks across N data disks, and a <b>separate parity disk</b> holds, for each stripe, the exclusive-OR of the corresponding data blocks. If any one disk fails, each lost block is rebuilt by XOR-ing the corresponding blocks of the surviving disks. Protection costs only one extra disk. A read of a block touches just one disk, so <b>several reads can proceed in parallel</b>, and large transfers are fast.',
        '<b>The issue.</b> A write of a single block needs four disk accesses: read the old data block, read the old parity block, write the new data, write the new parity (the read-modify-write cycle). And <b>every write, to whichever data disk, must update the one parity disk</b>. That disk becomes a <b>bottleneck</b>: independent small writes cannot be done in parallel.',
        '<b>RAID level 5</b> is <b>block-interleaved distributed parity</b>. It spreads data and parity among all N + 1 disks: for each stripe a different disk holds the parity (for example, the parity of stripe n is on disk n mod 5, and the other four disks hold its data). Writes to different stripes now usually involve <b>different parity disks</b>, so they can go on in parallel. The space overhead and the protection are the same as RAID 4, without the single overworked disk.',
      ),
    ),
  ],

  'file-systems': [
    tf(
      'fs-read-writes',
      `${END} / ${OSNQ2}`,
      'reading a file leads to the writing of disk blocks.',
      true,
      '<b>True.</b> Each file has an inode holding its metadata, including the <b>time the file was last accessed</b>. Whenever the file is read, that field must be updated, so the block holding the inode is written back to disk. A read therefore also causes a disk write.',
    ),
    tf(
      'fs-session-easy',
      END22,
      'from the system side, it is easy to provide the session-semantics feature as compared with the UNIX-semantics feature.',
      false,
      '<b>False</b>, according to the answer key of the paper. Session semantics means that each process that opens a file works on its own image, and changes become visible to others only after the file is closed. Providing it requires the system to <b>maintain several images of a file</b> and to implement the protocol by which later sessions see them in a consistent manner. Corrected: from the system side, session semantics is difficult to provide.',
    ),
    written(
      'fs-access-matrix',
      `${END22} / ${END21}`,
      5,
      'Consider three sets of users: professor, TA and student. There is a folder "marks" which only the professor can write into, and which students and TAs can only read. There is another folder, "course material", which can be written to by the professor and TAs, and which students can only read. Using an access control matrix, determine a security policy for these criteria.',
      [
        'Domains (rows): Professor, TA, Student; objects (columns): the marks folder and the course-material folder; rights: read, write',
        'Professor: read and write on both folders',
        'TA: read on marks; read and write on course material',
        'Student: read on marks; read on course material',
        'Policy: on each request the OS looks up the entry for (user’s domain, object); the access is allowed only if the requested operation is listed, otherwise a protection violation occurs and the request is denied',
      ],
      P('Use an <b>access control matrix</b>. The <b>domains</b> (rows) are Professor, TA and Student. The <b>objects</b> (columns) are the two folders. The <b>operations</b> are read and write.') +
        '<table class="mt-2 w-full text-left text-sm"><tr><th>Domain</th><th>marks</th><th>course material</th></tr><tr><td>Professor</td><td>read, write</td><td>read, write</td></tr><tr><td>TA</td><td>read</td><td>read, write</td></tr><tr><td>Student</td><td>read</td><td>read</td></tr></table>' +
        P(
          '<b>Security policy.</b> Every user belongs to one domain. When a user requests access to a folder, the operating system checks the entry for that domain and that object. If the requested operation is listed there, the access is <b>allowed</b>. Otherwise a <b>protection violation</b> occurs and the request is denied. Entry (i, j) is the complete set of operations a process in domain i may perform on object j; anything not listed is forbidden.',
        ),
    ),
    written(
      'fs-threats',
      END22,
      3,
      'Discuss the following program threats: trap door, virus and denial of service.',
      [
        'Trap door: a secret entry point built into a program (or compiler) that gives someone access while bypassing the normal security checks',
        'Virus: a fragment of malicious code embedded in a legitimate program; it replicates itself, spreads to other programs and computers, and runs without the user’s knowledge',
        'Denial of service: not aimed at stealing information; the attacker overloads a server (for example with a flood of bogus requests) so that legitimate users cannot be served',
      ],
      P(
        'A <b>trap door</b> is a <b>secret entry point</b> left in a program by its designer, giving someone access to the system without the usual security measures, for example a hard-wired user name and password. A clever trap door could even be included in a compiler.',
        'A <b>virus</b> is malicious code <b>embedded in a legitimate program</b>, designed to alter the way a computer behaves. Viruses typically <b>self-replicate</b>, spread to other programs and other computers, and execute without the user’s knowledge.',
        'A <b>denial-of-service</b> attack does not try to gain information. The attacker <b>overloads a server</b> by sending a large number of bogus requests that take up its resources, so the service is disrupted for <b>legitimate users</b>.',
      ),
    ),
  ],

  hdfs: [
    written(
      'hd-detect-failure',
      OSNQ2,
      2,
      'Explain how HDFS detects the failure of a node.',
      [
        'During normal operation each DataNode sends heartbeats to the NameNode (every three seconds by default) to confirm that it is alive and its replicas are available',
        'If the NameNode receives no heartbeat from a DataNode for about ten minutes, it considers the node out of service and its replicas unavailable, and schedules the creation of new replicas on other DataNodes',
      ],
      P(
        'During normal operation, each DataNode sends <b>heartbeats</b> to the NameNode to confirm that it is operating and that the block replicas it hosts are available. The default interval is <b>three seconds</b>.',
        'If the NameNode does not receive a heartbeat from a DataNode for <b>ten minutes</b>, it considers that DataNode to be <b>out of service</b> and the replicas it hosted to be unavailable. It then <b>schedules the creation of new replicas</b> of those blocks on other DataNodes.',
      ),
    ),
    written(
      'hd-reliability',
      OSNQ2,
      2,
      'Explain the terms reliability and availability. Discuss how HDFS improves both.',
      [
        'Reliability: the probability that a system performs its function without failure over a period (how often it fails; data is not lost). Availability: the fraction of time the system is up and usable, MTBF / (MTBF + MTTR)',
        'HDFS: each block is replicated (three copies by default) on different DataNodes and racks; heartbeats and block reports detect failures and trigger automatic re-replication; checksums detect corrupt replicas; so data survives failures (reliability) and stays readable while they are repaired (availability)',
      ],
      P(
        '<b>Reliability</b> is the probability that a system performs its required function <b>without failure</b> over a given period. It is about how often failures happen (measured by MTBF) and, for storage, about not losing data. <b>Availability</b> is the <b>fraction of time</b> the system is operational and ready for use: MTBF / (MTBF + MTTR).',
        '<b>How HDFS improves both.</b>' +
          UL(
            '<b>Replication:</b> every block is stored on several DataNodes (three by default). If a node or disk fails, the data is still there (reliability) and can still be read from another replica at once (availability).',
            '<b>Rack-aware placement:</b> replicas are put on more than one rack, so even the loss of a whole rack loses no block.',
            '<b>Heartbeats and block reports:</b> the NameNode detects a dead DataNode and automatically <b>re-replicates</b> its blocks, restoring the replication factor without an operator.',
            '<b>Checksums:</b> a corrupt replica is detected on reading and a good copy is fetched from another node.',
            '<b>Protecting the NameNode:</b> its image and journal are kept in several places, with a checkpoint or backup (standby) node, so the namespace is not lost and recovery is quick.',
          ),
      ),
    ),
    written(
      'hd-checkpoint-backup',
      END,
      3,
      'In HDFS, explain the concept of the checkpoint node and the backup node.',
      [
        'Background: the NameNode keeps the namespace in memory, with a persistent image (checkpoint) and a journal (log of changes) on disk; a long journal makes restart slow and risks loss',
        'CheckpointNode: periodically downloads the current checkpoint and journal from the NameNode, merges them into a new checkpoint and an empty journal, and returns the new checkpoint; this truncates the journal and protects the metadata',
        'BackupNode: besides creating checkpoints, it receives the journal as a live stream from the NameNode and keeps its own up-to-date in-memory image of the namespace; it is a read-only NameNode that can create checkpoints without downloading anything (it has no block locations)',
      ],
      P(
        '<b>Background.</b> The NameNode holds the namespace in RAM. On disk it keeps the <b>image</b> (a checkpoint of the namespace) and the <b>journal</b>, a write-ahead log of every change since. On restart it loads the checkpoint and replays the journal. If the journal grows very long, restart is slow and there is more to lose.',
        'A <b>CheckpointNode</b> (usually on a different host) periodically <b>combines the existing checkpoint and journal</b> to create a new checkpoint and an empty journal. It downloads the two files from the NameNode, merges them locally and returns the new checkpoint. This protects the file-system metadata and lets the NameNode <b>truncate the journal</b>.',
        'A <b>BackupNode</b> can also create periodic checkpoints, but in addition it <b>maintains an in-memory, up-to-date image of the namespace</b> that is always synchronised with the NameNode. It accepts the <b>journal stream</b> of transactions from the active NameNode, saves them in its own storage and applies them to its own image. Because it already has the current namespace, it makes checkpoints without downloading anything. It can be viewed as a <b>read-only NameNode</b>: it has all the metadata except block locations.',
      ),
    ),
  ],

  mapreduce: [
    written(
      'mr-stragglers',
      END,
      3,
      '"One of the common causes that lengthens the total time taken for a MapReduce operation is a straggler: a machine that takes an unusually long time to complete one of the last few map or reduce tasks in the computation." Explain how MapReduce handles the issue of stragglers.',
      [
        'Stragglers arise for many reasons: a bad disk with correctable errors, other jobs competing for the machine, a misconfiguration such as disabled processor caches',
        'When a MapReduce operation is close to completion, the master schedules backup executions of the remaining in-progress tasks on other machines',
        'A task is marked complete when either the primary or the backup execution finishes; the mechanism costs only a few percent more resources and greatly reduces completion time',
      ],
      P(
        'A straggler may be caused by a bad disk that keeps correcting errors, by other work scheduled on the same machine, or by a configuration fault. The task is not failing, only very slow, so re-execution on failure does not help.',
        'The remedy is <b>backup tasks</b>. When a MapReduce operation is <b>close to completion</b>, the master schedules <b>backup executions of the remaining in-progress tasks</b> on other workers. A task is marked as <b>completed whenever either the primary or the backup execution completes</b>; the other is discarded.',
        'The mechanism is tuned so that it typically increases the resources used by <b>no more than a few percent</b>, and it significantly reduces the time to complete large operations. (In the paper, a sort took 44 percent longer with backup tasks disabled.) It is safe because map and reduce functions are deterministic and task output is committed atomically.',
      ),
    ),
  ],

  'virtual-machines': [
    written(
      'vm-xen-rings',
      `${MID} / ${Q1}`,
      3,
      'Normally an operating system has two privilege levels: user mode and system mode. A virtual-machine system like Xen uses more privilege levels (the x86 has four). Discuss the reasons, and give one or two example operations at each level.',
      [
        'Two modes protect an OS from its user programs; with virtualisation two layers of protection are needed: the guest OS from its own applications, and the hypervisor from all the guest operating systems',
        'Xen uses the x86 rings: Xen (the hypervisor) in ring 0, the most privileged; guest operating systems in ring 1; guest applications in ring 3',
        'Ring 0 examples: updating real page tables and CPU control registers, handling hardware interrupts, scheduling domains (guests reach these by hypercall)',
        'Ring 1 examples: the guest kernel’s own work, such as handling its applications’ system calls, scheduling its processes, managing its virtual memory (validated by Xen); ring 3: ordinary application instructions and system calls to the guest',
      ],
      P(
        '<b>Why more than two.</b> Two modes exist to protect the operating system from misuse by user programs. In a virtual-machine system there are <b>two layers to protect</b>. The <b>guest operating system</b> must be protected from its own applications. And the <b>hypervisor</b> must be protected from every guest operating system and its applications, because a guest is, in effect, just an application of the hypervisor.',
        '<b>How Xen uses the x86 rings.</b> The x86 provides four privilege levels, rings 0 to 3. Ordinary operating systems use only ring 0 (kernel) and ring 3 (applications). Xen runs the <b>hypervisor in ring 0</b>, moves each <b>guest operating system down to ring 1</b>, and leaves <b>applications in ring 3</b>.' +
          UL(
            '<b>Ring 0 (Xen):</b> the truly privileged operations: installing page tables and loading control registers, handling hardware interrupts, scheduling the virtual CPUs of the domains. A guest asks for these with a <b>hypercall</b>.',
            '<b>Ring 1 (guest OS):</b> everything a kernel does that does not need real privilege: servicing its applications’ system calls, scheduling its own processes, managing its file system and its (Xen-validated) page tables.',
            '<b>Ring 3 (guest applications):</b> ordinary computation, and system calls to the guest kernel.',
          ),
        'Since ring 1 code cannot execute privileged instructions directly, the guest cannot interfere with Xen or with other guests, while the guest kernel remains protected from its applications.',
      ),
    ),
    written(
      'vm-operations',
      END,
      5,
      'Briefly explain the following operations of the virtual-machine approach: (i) multiplexing, (ii) suspension, (iii) provision and (iv) live migration. On a cloud platform, discuss how these operations significantly enhance the utilisation of server resources.',
      [
        'Multiplexing: several virtual machines run on one physical machine, sharing its hardware under the VMM',
        'Suspension: a running VM is stopped and its whole state saved to stable storage, releasing its CPU and memory',
        'Provision (resume): a suspended or stored VM image is started, or restarted, on any suitable physical machine',
        'Live migration: a running VM is moved from one physical machine to another without interrupting its service',
        'Utilisation: lightly used servers are consolidated onto fewer machines (multiplexing); idle VMs are suspended and capacity is provisioned on demand; migration balances load and empties machines so they can be switched off or maintained',
      ],
      P(
        '<b>(i) Multiplexing.</b> Several virtual machines are run on <b>one physical machine</b>; the virtual-machine monitor shares the hardware among them.',
        '<b>(ii) Suspension.</b> A virtual machine is <b>suspended</b>: stopped, with its complete state (memory, registers, device state) saved to stable storage. It then uses no CPU or memory.',
        '<b>(iii) Provision.</b> A suspended virtual machine, or a stored image, is <b>resumed or provisioned on a new hardware platform</b>: any machine with free capacity.',
        '<b>(iv) Live migration.</b> A <b>running</b> virtual machine is moved from one physical host to another while it keeps serving its users, with only a very short pause.',
        '<b>Effect on a cloud platform.</b> A server dedicated to one application is idle most of the time. With <b>multiplexing</b>, many lightly loaded servers are <b>consolidated</b> onto a few physical machines that run busy. <b>Suspension</b> frees the resources of virtual machines that are not needed, and <b>provision</b> brings capacity up within minutes when demand rises, so hardware need not be reserved for the peak. <b>Live migration</b> lets the provider <b>balance load</b>, relieve an overloaded host, and pack virtual machines together so that emptied hosts can be switched off or maintained. Together they turn a data centre into one flexible pool, raising utilisation and cutting hardware, power and management costs.',
      ),
    ),
  ],
};
