import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  program: {
    id: 'pr-check-program',
    type: 'mcq',
    prompt: 'Two users run the same text editor at the same time. How many programs and how many processes are involved?',
    options: ['One program, one process', 'One program, two processes', 'Two programs, one process', 'Two programs, two processes'],
    answer: 1,
    explanation:
      'A <b>program</b> is a passive entity, a file of instructions on disk. A <b>process</b> is a program in execution: an active entity with its own program counter, registers, stack and data. The editor is <b>one program</b>; each user’s running copy is a <b>separate process</b>, although the two may share the same code (text) section.',
  },
  state: {
    id: 'pr-check-state',
    type: 'mcq',
    prompt: 'A process is waiting for a disk read. The read completes. Which state does the process move to?',
    options: ['Running', 'Ready', 'New', 'Terminated'],
    answer: 1,
    explanation:
      'It moves from <b>waiting to ready</b>, not straight to running. The completion of I/O only makes the process <i>able</i> to run; it must still be selected by the short-term scheduler and dispatched before it gets the CPU.',
  },
  scheduler: {
    id: 'pr-check-scheduler',
    type: 'mcq',
    prompt: 'Which scheduler controls the degree of multiprogramming, the number of processes in memory?',
    options: ['The short-term (CPU) scheduler', 'The long-term (job) scheduler', 'The dispatcher', 'The disk scheduler'],
    answer: 1,
    explanation:
      'The <b>long-term scheduler</b> selects which processes are brought into the ready queue (into memory) from the pool on disk, so it controls the degree of multiprogramming. It runs infrequently, perhaps once every few seconds or minutes. The short-term scheduler picks among processes that are already in memory and ready.',
  },
  fork: {
    id: 'pr-check-fork',
    type: 'numeric',
    prompt: 'A program calls <code>fork()</code> three times in a row, with no conditions, and then prints "hello". How many times is "hello" printed?',
    answer: 8,
    unit: 'times',
    hint: 'Every process that exists when a fork() is reached executes it.',
    explanation: 'Each fork() doubles the number of processes: 1 → 2 → 4 → <b>8</b>. Every one of them goes on to execute the printf.',
  },
  buffer: {
    id: 'pr-check-buffer',
    type: 'numeric',
    prompt: 'A shared circular buffer has BUFFER_SIZE = 10 and uses only the pointers <code>in</code> and <code>out</code>, with "full" defined as <code>(in + 1) % BUFFER_SIZE == out</code>. How many items can it hold at once?',
    answer: 9,
    unit: 'items',
    explanation: 'Because <code>in == out</code> is taken to mean empty, the buffer must stop one short of wrapping round to that condition. It holds at most BUFFER_SIZE − 1 = <b>9</b> items.',
  },
  rendezvous: {
    id: 'pr-check-rendezvous',
    type: 'mcq',
    prompt: 'A message-passing link has zero capacity (no buffering). What must happen when a process sends?',
    options: [
      'The message is discarded if the receiver is not ready',
      'The sender blocks until the receiver receives the message',
      'The sender continues at once and the message is queued',
      'The operating system stores the message on disk',
    ],
    answer: 1,
    explanation:
      'With <b>zero capacity</b> the link cannot hold any waiting messages, so the sender must <b>block until the recipient receives the message</b>. The two processes meet in time: a <b>rendezvous</b>. With bounded capacity the sender blocks only when the queue is full, and with unbounded capacity it never blocks.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  notion: {
    id: 'pr-practice-notion',
    type: 'written',
    pastPaper: true,
    marks: 4,
    prompt: 'Explain the notion of a process. Explain the reason for the introduction of the process concept.',
    points: [
      'A process is a program in execution: an active entity, whereas a program is a passive entity (a file on disk)',
      'It comprises the program code (text), the current activity given by the program counter and registers, the stack, the data section and the heap; execution progresses sequentially',
      'Reason: with multiprogramming and time sharing, several programs are loaded in memory and executed concurrently, and the CPU switches between them',
      'This required firmer control and compartmentalisation of the various programs, giving a unit of work to which CPU time, memory, files and I/O are allocated, which the OS can schedule, protect and account for',
    ],
    modelAnswer:
      '<p>A <b>process is a program in execution</b>. A program by itself is a <b>passive</b> entity, a file containing a list of instructions stored on disk; a process is an <b>active</b> entity, with a program counter specifying the next instruction to execute and a set of associated resources. A process includes the program code (the <b>text section</b>), the current activity as represented by the <b>program counter</b> and the contents of the processor’s registers, the <b>stack</b> (function parameters, return addresses, local variables), the <b>data section</b> (global variables) and the <b>heap</b>. Its execution progresses in a <b>sequential</b> fashion. Two processes may be associated with the same program and are nevertheless two separate execution sequences.</p><p class="mt-2"><b>Why the concept was introduced.</b> Early systems allowed only one program to be executed at a time, and that program had complete control of the system. Modern systems allow <b>multiple programs to be loaded into memory and executed concurrently</b>, with the CPU switching among them so that it is never idle while there is work (multiprogramming) and users can interact with their programs (time sharing). This evolution required <b>firmer control and more compartmentalisation</b> of the various programs. The process is the resulting abstraction: the <b>unit of work</b> in a system. The operating system allocates CPU time, memory, files and I/O devices to processes, schedules them, protects them from one another, and keeps the information needed (in the process control block) to stop a process and later resume it exactly where it left off.</p>',
  },
  schedulers: {
    id: 'pr-practice-schedulers',
    type: 'written',
    pastPaper: true,
    marks: 5,
    prompt: 'What do you understand by the terms "long-term scheduler" and "short-term scheduler"? Explain the role of each.',
    points: [
      'Long-term (job) scheduler: selects which processes are brought from the job pool on disk into the ready queue in memory',
      'It is invoked infrequently (seconds or minutes) and controls the degree of multiprogramming',
      'It should select a good mix of I/O-bound and CPU-bound processes',
      'Short-term (CPU) scheduler: selects which of the ready processes in memory should be executed next and allocates the CPU to it',
      'It is invoked very frequently (at least every 100 milliseconds or so), so it must be very fast',
    ],
    modelAnswer:
      '<p>A process migrates among various scheduling queues during its lifetime, and the operating system must select processes from these queues. The selection is carried out by schedulers.</p><p class="mt-2">The <b>long-term scheduler</b>, or <b>job scheduler</b>, selects which processes should be <b>brought into the ready queue</b>: it chooses processes from the pool spooled on a mass-storage device and loads them into memory for execution. It executes <b>infrequently</b>, perhaps once every few seconds or minutes, and can therefore afford to take longer over its decision. It <b>controls the degree of multiprogramming</b>, the number of processes in memory; if that is stable, the rate of process creation must equal the rate at which processes leave. It should select a <b>good mix of I/O-bound and CPU-bound processes</b>: if all are I/O bound the ready queue will almost always be empty, and if all are CPU bound the I/O queues will be empty and devices unused.</p><p class="mt-2">The <b>short-term scheduler</b>, or <b>CPU scheduler</b>, selects from among the processes that are <b>ready to execute</b> and <b>allocates the CPU</b> to one of them. It is invoked <b>very frequently</b>, at least once every 100 milliseconds or so, since a process may run for only a few milliseconds before waiting for I/O. Because of the short time between executions, it <b>must be fast</b>: if it took 10 ms to decide to run a process for 100 ms, about 9% of the CPU would be wasted just on scheduling.</p><p class="mt-2">Some systems add a <b>medium-term scheduler</b>, which removes processes from memory (swapping) to reduce the degree of multiprogramming and brings them back later.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'pr-cp-pcb',
    type: 'multi',
    prompt: 'Which of these are stored in a process control block?',
    options: ['The process state and program counter', 'The contents of the CPU registers', 'The source code of the program', 'Memory-management and I/O status information'],
    answers: [0, 1, 3],
    explanation:
      'The PCB holds everything needed to stop a process and restart it later: process state, program counter, CPU registers, CPU-scheduling information, memory-management information, accounting information and I/O status (open files, allocated devices). The source code is not part of a running process at all.',
  },
  {
    id: 'pr-cp-transition',
    type: 'mcq',
    prompt: 'Which of these state transitions is <b>not</b> possible?',
    options: ['Running → ready', 'Waiting → running', 'Running → waiting', 'Ready → running'],
    answer: 1,
    explanation:
      'A waiting process whose event occurs goes to the <b>ready</b> state. It cannot go directly from <b>waiting to running</b>; it must be dispatched by the scheduler like any other ready process. The other three are the interrupt, the I/O request and the dispatch.',
  },
  {
    id: 'pr-cp-context',
    type: 'mcq',
    prompt: 'What is true of the time spent on a context switch?',
    options: [
      'It is useful work done on behalf of the old process',
      'It is pure overhead: the system does no useful work while switching',
      'It is charged to the new process as CPU burst time',
      'It is zero on modern hardware',
    ],
    answer: 1,
    explanation:
      'A context switch saves the state of the old process in its PCB and loads the saved state of the new one. That time is <b>pure overhead</b>, because the system does no useful work while switching. It depends on the hardware: memory speed, the number of registers to copy, and special instructions.',
  },
  {
    id: 'pr-cp-forkreturn',
    type: 'mcq',
    prompt: 'After a successful <code>fork()</code>, what value does the call return?',
    options: [
      'Zero in both parent and child',
      'Zero in the child, and the child’s process ID in the parent',
      'The child’s process ID in both',
      'Zero in the parent, and the parent’s process ID in the child',
    ],
    answer: 1,
    explanation:
      'Both processes continue at the instruction after the fork(), with one difference: the return value is <b>zero in the new (child) process</b> and the <b>(non-zero) process identifier of the child in the parent</b>. A program tests this value to make parent and child do different things.',
  },
  {
    id: 'pr-cp-forkcount',
    type: 'numeric',
    prompt: 'How many processes exist in total after a program executes <code>fork(); fork(); fork(); fork();</code> (including the original)?',
    answer: 16,
    unit: 'processes',
    explanation: 'Each fork() is executed by every process existing at that point, so the count doubles each time: 2<sup>4</sup> = <b>16</b>. Fifteen of them are new.',
  },
  {
    id: 'pr-cp-models',
    type: 'mcq',
    prompt: 'In which IPC model is the kernel involved only in setting up the communication, not in each exchange of data?',
    options: ['Message passing', 'Shared memory', 'Both', 'Neither'],
    answer: 1,
    explanation:
      'With <b>shared memory</b>, system calls are needed only to establish the shared region. After that, all accesses are ordinary memory accesses and need no help from the kernel, which is why it can be faster. <b>Message passing</b> is usually implemented with a system call for every send and receive.',
  },
  {
    id: 'pr-cp-indirect',
    type: 'mcq',
    prompt: 'With indirect communication, messages are sent to and received from what?',
    options: ['A named process', 'A mailbox (port)', 'A shared variable', 'The process control block'],
    answer: 1,
    explanation:
      'In <b>indirect communication</b>, messages are sent to and received from <b>mailboxes</b>, also called ports. Each mailbox has a unique identifier, and two processes can communicate only if they share one. In direct communication each process must explicitly name the other.',
  },
  {
    id: 'pr-cp-rpc',
    type: 'mcq',
    prompt: 'An RPC system attaches a timestamp to each message, and the server keeps a history of timestamps so that it can ignore repeats. Which delivery semantic does this implement?',
    options: ['At least once', 'At most once', 'Exactly once', 'Zero or more times'],
    answer: 1,
    explanation:
      'Discarding repeated messages ensures a request is acted on <b>at most once</b>. To get <b>exactly once</b>, the server must also acknowledge that the call was received and executed, and the client must resend periodically until it gets that acknowledgement, which removes the risk that the call is never executed.',
  },
  {
    id: 'pr-cp-ipcmodels',
    type: 'written',
    pastPaper: true,
    marks: 5,
    prompt: 'What are the strengths and weaknesses of the two models of inter-process communication?',
    points: [
      'The two models are shared memory (a region of memory is shared and processes exchange information by reading and writing it) and message passing (messages are exchanged between the cooperating processes)',
      'Shared memory strength: fast, at memory speed, since system calls are needed only to set up the region; good for large amounts of data',
      'Shared memory weakness: the processes themselves must ensure they do not write to the same location simultaneously (synchronisation and protection are the programmer’s problem), and it is hard to use across machines',
      'Message passing strength: easier to implement and use, no conflicts to avoid, useful for smaller amounts of data, and works naturally between computers in a distributed system',
      'Message passing weakness: slower, because it is typically implemented with system calls and so requires the more time-consuming intervention of the kernel for every message',
    ],
    modelAnswer:
      '<p>Cooperating processes need an inter-process communication mechanism to exchange data. There are two fundamental models.</p><p class="mt-2"><b>Shared memory.</b> A region of memory shared by the cooperating processes is established, and they exchange information by reading and writing data in it. <i>Strengths:</i> it allows <b>maximum speed and convenience</b> of communication. System calls are required only to establish the shared region; after that, all accesses are treated as routine memory accesses and need no assistance from the kernel. It suits the transfer of large amounts of data. <i>Weaknesses:</i> the form and location of the data are determined by the processes, not the operating system, and the processes are themselves <b>responsible for ensuring that they are not writing to the same location simultaneously</b>. Synchronisation and protection become the programmer’s problem, and the model does not extend easily to processes on different computers.</p><p class="mt-2"><b>Message passing.</b> Communication takes place by means of messages exchanged between the cooperating processes, using send and receive operations. <i>Strengths:</i> it is <b>useful for exchanging smaller amounts of data, because no conflicts need be avoided</b>; it is <b>easier to implement</b> in a distributed system, where the processes may be on different computers connected by a network; and the processes need not share an address space. <i>Weaknesses:</i> it is <b>slower</b>, because message-passing systems are typically implemented using system calls and thus require the more time-consuming task of <b>kernel intervention</b> for each message, with data copied between address spaces.</p>',
  },
  {
    id: 'pr-cp-sync',
    type: 'written',
    pastPaper: true,
    marks: 5,
    prompt: 'Explain the merits and demerits of synchronous and asynchronous communication.',
    points: [
      'Synchronous (blocking): a blocking send blocks the sender until the message is received; a blocking receive blocks the receiver until a message is available',
      'Merit: sender and receiver rendezvous, so the sender knows the message was received; no buffering is needed and the producer-consumer problem becomes trivial',
      'Demerit: the sender is delayed and can do no other work while waiting; concurrency is reduced and a slow or failed receiver holds the sender up',
      'Asynchronous (non-blocking): the sender sends the message and resumes operation; a non-blocking receive returns either a valid message or null',
      'Merit: the sender continues immediately, giving more concurrency and flexibility',
      'Demerit: messages must be buffered (queues can grow or overflow), the sender does not know whether or when the message arrived, and programming is more complex (acknowledgements, polling)',
    ],
    modelAnswer:
      '<p>Communication between processes takes place through calls to send() and receive() primitives, each of which may be <b>blocking (synchronous)</b> or <b>non-blocking (asynchronous)</b>.</p><p class="mt-2"><b>Synchronous communication.</b> With a <b>blocking send</b>, the sending process is blocked until the message is received by the receiving process or by the mailbox. With a <b>blocking receive</b>, the receiver blocks until a message is available. When both are blocking there is a <b>rendezvous</b> between sender and receiver.</p><ul class="mt-1 list-disc space-y-1 pl-5"><li><b>Merits:</b> the sender <b>knows the message has been delivered</b> when it continues; <b>no buffering</b> is needed in the link, which reduces overhead and the load on queues; and coordination is simple, so the producer-consumer problem becomes trivial.</li><li><b>Demerits:</b> the sender <b>cannot do anything else while it waits</b>, so concurrency and throughput are reduced; a slow or crashed receiver delays the sender indefinitely; and a rendezvous may not be needed at all when the application does not care about the moment of delivery.</li></ul><p class="mt-2"><b>Asynchronous communication.</b> With a <b>non-blocking send</b>, the sending process sends the message and <b>resumes operation</b>. With a non-blocking receive, the receiver retrieves either a valid message or a null.</p><ul class="mt-1 list-disc space-y-1 pl-5"><li><b>Merits:</b> the sender proceeds immediately, so <b>more work is done in less time</b>; sender and receiver are decoupled in time, which gives <b>flexibility</b>.</li><li><b>Demerits:</b> messages must be <b>buffered</b>, and <b>long queues can pile up</b> (or a bounded queue can fill, forcing the sender to block after all); the sender <b>does not know whether or when its message arrived</b>, so explicit acknowledgements are needed if that matters; and the programs are harder to write and reason about.</li></ul>',
  },
];
