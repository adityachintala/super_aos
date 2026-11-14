import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  serial: {
    id: 'hi-check-serial',
    type: 'multi',
    prompt: 'Which were the two main problems of the earliest (serial processing) systems?',
    options: [
      'Scheduling: users booked the machine with a sign-up sheet, wasting time when a slot was too long or too short',
      'Setup time: loading the compiler, mounting tapes, loading the object program, and starting again after any error',
      'Too many users logged in at once',
      'The operating system used too much memory',
    ],
    answers: [0, 1],
    explanation:
      'There was no operating system at all. The two problems were <b>scheduling</b> (a paper sign-up sheet) and <b>job setup time</b>. While tapes were being mounted or the programmer was at the console, a machine costing millions sat idle.',
  },
  monitor: {
    id: 'hi-check-monitor',
    type: 'mcq',
    prompt: 'What did the resident monitor contribute?',
    options: [
      'It let several users interact with the computer at once',
      'Automatic job sequencing: it read jobs one at a time from the input device and passed control from job to job without an operator stepping in',
      'It kept several jobs in memory and switched the CPU among them',
      'It replaced card readers with disks',
    ],
    answer: 1,
    explanation:
      'The <b>resident monitor</b>, a small program that always resided in memory, was the first rudimentary operating system. It removed the idle time between jobs by <b>automatic job sequencing</b>, directed by control cards written in a job control language. Only one job was in memory at a time.',
  },
  hardware: {
    id: 'hi-check-hardware',
    type: 'mcq',
    prompt: 'A batch monitor needs a timer among its hardware features. Why?',
    options: [
      'To measure how long each job took, for billing only',
      'To prevent a single job from monopolising the system: when the timer expires, control returns to the monitor',
      'To synchronise the card reader with the printer',
      'To make the CPU run faster',
    ],
    answer: 1,
    explanation:
      'A user program stuck in a loop would otherwise never give control back. The <b>timer</b> interrupts after a set period so the monitor regains control. The other features are <b>memory protection</b> (the job must not alter the monitor), <b>privileged instructions</b> (such as I/O, executable only by the monitor) and <b>interrupts</b>.',
  },
  spooling: {
    id: 'hi-check-spooling',
    type: 'mcq',
    prompt: 'What makes spooling possible, where tape-based off-line processing could not do the same?',
    options: [
      'A disk is a random-access device, so the reader can be writing one job’s input while the CPU reads another job’s input and the printer takes a third job’s output',
      'A disk is faster than the CPU',
      'A disk never fails',
      'A disk needs no device driver',
    ],
    answer: 0,
    explanation:
      'A tape is sequential: it cannot be written at one end while being read at the other. A <b>disk is a random-access device</b>, so the system can keep many jobs’ input and output on it and move between them. That lets the I/O of one job overlap the computation of other jobs.',
  },
  util: {
    id: 'hi-check-util',
    type: 'numeric',
    prompt: 'A job alternately computes for 2 ms and waits 6 ms for I/O. It is the only job in memory. What is the CPU utilisation, in percent?',
    answer: 25,
    unit: '%',
    explanation: 'In every 8 ms cycle the CPU is busy for 2 ms: 2 / (2 + 6) = <b>25%</b>. The other 75% of the time the CPU waits. Multiprogramming exists to fill that time with another job’s computing.',
  },
  timesharing: {
    id: 'hi-check-timesharing',
    type: 'mcq',
    prompt: 'Multiprogramming already gave good CPU utilisation. What problem did time sharing solve?',
    options: [
      'Low throughput',
      'Response time: users could not interact with a job while it ran',
      'Memory was too small',
      'The CPU was idle',
    ],
    answer: 1,
    explanation:
      'A multiprogrammed batch system optimises <b>utilisation</b>; a time-sharing system optimises <b>response time</b>. By switching the CPU among jobs so frequently that each user can interact with a program while it runs, it gives every user the impression of having their own computer.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice, shown before the checkpoint. */
export const practice = {
  spooling: {
    id: 'hi-practice-spooling',
    type: 'written',
    pastPaper: true,
    marks: 4,
    prompt: 'How did spooling improve CPU utilisation?',
    points: [
      'Before spooling the CPU read directly from the card reader and wrote directly to the printer; these mechanical devices are far slower than the CPU, so the CPU was idle most of the time waiting for them',
      'Spooling (simultaneous peripheral operations on-line) uses the disk as a huge buffer: cards are read onto the disk in advance, and output is written to the disk and printed later',
      'The CPU then takes its input from, and sends its output to, the fast disk instead of the slow devices',
      'Because the disk is random access, the I/O of one job overlaps the computation of other jobs (reading job 3, computing job 2, printing job 1), keeping both the CPU and the I/O devices working at higher rates',
    ],
    modelAnswer:
      '<p><b>The problem.</b> In an early batch system the CPU took each job’s input directly from the card reader and sent its output directly to the line printer. The CPU works in the microsecond range, executing thousands or millions of instructions per second, while a card reader manages about 1200 cards per minute (20 per second). So for nearly all of the time the CPU sat <b>idle, waiting for a mechanical device</b>.</p><p class="mt-2"><b>Spooling</b> stands for <b>simultaneous peripheral operations on-line</b>. It uses the <b>disk as a huge buffer</b>:</p><ul class="mt-1 list-disc space-y-1 pl-5"><li>cards are read from the card reader <b>onto the disk in advance</b>, before the job runs;</li><li>when the job runs, the CPU takes its input from the <b>disk</b> and writes its output to the <b>disk</b>, both far faster than the devices;</li><li>the output is copied from the disk to the printer <b>later</b>.</li></ul><p class="mt-2"><b>Why utilisation rises.</b> A disk is a <b>random-access</b> device, so the system can be reading the cards of one job, computing a second job and printing the output of a third all at the same time. Spooling <b>overlaps the I/O of one job with the computation of other jobs</b>. The CPU no longer waits for the reader or the printer, and the devices are not held up by the CPU, so <b>both the CPU and the I/O devices are kept working at much higher rates</b>.</p><p class="mt-2">Spooling also created a pool of jobs on disk, ready to run. Choosing which to run next is <b>job scheduling</b>, and it led directly to multiprogramming.</p>',
  },
  compare: {
    id: 'hi-practice-compare',
    type: 'written',
    marks: 5,
    prompt: 'Distinguish between a multiprogrammed batch system and a time-sharing system. What operating-system features does each require?',
    points: [
      'Multiprogramming: several jobs are kept in memory at once and the CPU is multiplexed among them; when the running job has to wait (for I/O) the CPU switches to another job, so the CPU always has one to execute',
      'Objective of multiprogramming: maximise CPU utilisation; no interaction between the user and a running job',
      'Time sharing (multitasking): a logical extension in which the CPU switches among jobs so frequently that users can interact with each program while it runs; objective is short response time',
      'Features for multiprogramming: job scheduling, memory management (allocating memory to several jobs), CPU scheduling (choosing among ready jobs), device allocation, I/O routines supplied by the system',
      'Additional features for time sharing: time slicing by a timer, swapping and virtual memory, an on-line file system, protection, process synchronisation and communication',
    ],
    modelAnswer:
      '<p><b>Multiprogrammed batch system.</b> A single job cannot keep either the CPU or the I/O devices busy all the time. The operating system therefore keeps <b>several jobs in memory at once</b> and <b>multiplexes the CPU</b> among them. When the running job must wait, for a tape to be mounted or an I/O operation to complete, the CPU is switched to another job instead of sitting idle. The goal is <b>high CPU utilisation</b>. The user submits a job and collects the output; there is no interaction while it runs.</p><p class="mt-2"><b>Time-sharing system.</b> A logical extension of multiprogramming. The CPU is switched among jobs <b>so frequently</b>, each process running for only a short time, that every user can <b>interact with a program while it is running</b>. The goal is <b>short response time</b> (ideally under a second), giving each user the impression of having their own computer, at reasonable cost.</p><table class="mt-2 w-full text-left text-xs"><tr><th></th><th>Multiprogrammed batch</th><th>Time sharing</th></tr><tr><td>Objective</td><td>Maximise processor utilisation</td><td>Minimise response time</td></tr><tr><td>Source of directives</td><td>Job control language supplied with the job</td><td>Commands entered at a terminal</td></tr><tr><td>CPU switches when</td><td>The running job waits for I/O</td><td>The job waits, or its time slice expires</td></tr></table><p class="mt-2"><b>Features needed for multiprogramming:</b> I/O routines supplied by the system; <b>job scheduling</b>; <b>memory management</b>, to allocate memory to several jobs; <b>CPU scheduling</b>, to choose among the jobs ready to run; and <b>allocation of devices</b>.</p><p class="mt-2"><b>Additional features for time sharing:</b> a <b>timer</b> for time slicing; <b>swapping and virtual memory</b>, since the jobs of many users do not fit in memory; an <b>on-line file system</b> and disk management; <b>protection</b> between users; and mechanisms for <b>synchronisation, communication and deadlock handling</b> among concurrent processes.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'hi-cp-stored',
    type: 'mcq',
    prompt: 'What is the stored-program concept?',
    options: [
      'Programs are stored on punched cards',
      'The machine holds both the program and the data in its memory, and the program tells it what to do with the data, so one machine can perform any task',
      'Every program is stored permanently in ROM',
      'The operating system is stored on disk',
    ],
    answer: 1,
    explanation:
      'Before it, a computer was built or rewired for one specific task. Proposed by Turing and von Neumann in the 1940s, the stored-program concept puts instructions in memory alongside data, so changing the task means loading a different program. It is the idea behind the <b>general-purpose computer</b>.',
  },
  {
    id: 'hi-cp-order',
    type: 'mcq',
    prompt: 'Which is the correct historical order?',
    options: [
      'Batch → serial processing → time sharing → multiprogramming',
      'Serial processing → simple batch → multiprogrammed batch → time sharing',
      'Time sharing → multiprogramming → batch → serial processing',
      'Serial processing → time sharing → batch → multiprogramming',
    ],
    answer: 1,
    explanation:
      '<b>Serial processing</b> (no operating system), then <b>simple batch</b> with a resident monitor, then <b>multiprogrammed batch</b> (helped by disks and spooling), then <b>time sharing</b>. Each step attacked the largest waste left by the one before.',
  },
  {
    id: 'hi-cp-driver',
    type: 'mcq',
    prompt: 'What is a device driver?',
    options: [
      'The operator who mounts tapes',
      'A special subroutine written for a particular I/O device, which knows how its buffers, flags, registers, control bits and status bits should be used',
      'The cable connecting a device to the computer',
      'A program that schedules jobs',
    ],
    answer: 1,
    explanation: 'Device drivers appeared early: written once for each device and kept in a library, they were among the first examples of <b>software reuse</b>, and they are still the lowest layer of every operating system.',
  },
  {
    id: 'hi-cp-batch',
    type: 'mcq',
    prompt: 'Why were jobs with similar needs batched together?',
    options: [
      'To make them run in parallel',
      'To reduce setup time: for example, two FORTRAN jobs run back to back need the FORTRAN compiler tape loaded only once',
      'To use less memory',
      'So that users could interact with them',
    ],
    answer: 1,
    explanation: 'Setup was the big cost. Hiring a professional <b>operator</b> and <b>batching</b> similar jobs both reduced it. The remaining idle time, during the transition from one job to the next, was removed by automatic job sequencing.',
  },
  {
    id: 'hi-cp-overhead',
    type: 'tf',
    prompt: 'True or false: a batch operating system has no cost, since the monitor only runs between jobs.',
    answer: false,
    explanation:
      '<b>False.</b> There are two overheads: some <b>machine time</b> is consumed by the monitor, and some <b>main memory</b> is occupied by it. Corrected: a batch monitor uses processor time and memory, but it still improves utilisation over serial processing because it removes far more idle time than it adds.',
  },
  {
    id: 'hi-cp-cards',
    type: 'numeric',
    prompt: 'A card reader reads 1200 cards per minute. How many cards is that per second?',
    answer: 20,
    unit: 'cards/s',
    explanation: '1200 / 60 = <b>20 cards per second</b>. A CPU of the time executed thousands of instructions in the same second, so a CPU that waited for the reader was idle almost all the time.',
  },
  {
    id: 'hi-cp-util3',
    type: 'numeric',
    prompt: 'Three identical jobs each compute 2 ms, wait 6 ms for I/O, then compute 2 ms. Run one after another, they take 30 ms in total. What is the CPU utilisation, in percent?',
    answer: 40,
    unit: '%',
    hint: 'How many milliseconds of computing are there altogether?',
    explanation: 'Each job computes for 4 ms, so 12 ms of computing in 30 ms: <b>40%</b>. Multiprogrammed, the same three jobs finish in 14 ms and utilisation rises to 12/14, about 86%.',
  },
  {
    id: 'hi-cp-decisions',
    type: 'mcq',
    prompt: 'Why is multiprogramming described as the first time the operating system had to take decisions?',
    options: [
      'Because it had to decide when to print',
      'Because with several jobs on disk and in memory, it must choose which jobs to bring into memory and which ready job gets the CPU next',
      'Because it had to choose a programming language',
      'Because it could refuse to run programs',
    ],
    answer: 1,
    explanation: 'A monitor simply ran the next job in the deck. With a pool of jobs, the system needs <b>job scheduling</b> (which to load), <b>CPU scheduling</b> (which to run), <b>memory management</b> and <b>device allocation</b>.',
  },
  {
    id: 'hi-cp-process',
    type: 'mcq',
    prompt: 'In a time-sharing system, a program that is loaded into memory and executing is called…',
    options: ['A job step', 'A process', 'A monitor', 'A spool'],
    answer: 1,
    explanation: 'A <b>process</b>. In a time-sharing system a process typically executes for only a short time before it finishes or needs to perform I/O; since interactive I/O runs at "people speeds", the operating system rapidly switches the CPU to another process meanwhile.',
  },
  {
    id: 'hi-cp-modern',
    type: 'multi',
    prompt: 'Which requirements of modern computing are met by replication?',
    options: ['Reliability', 'Availability', 'Huge processing', 'Big files'],
    answers: [0, 1],
    explanation:
      'Keeping several copies of data on different machines gives <b>reliability</b> (data survives a failure) and <b>availability</b> (the service keeps running). Huge processing is met by parallel and distributed processing, and big files by distributed file systems. Replication in turn creates the <b>consistency</b> problem, solved by distributed synchronisation.',
  },
  {
    id: 'hi-cp-written-evolution',
    type: 'written',
    marks: 6,
    prompt: 'Trace the evolution of operating systems from serial processing to time sharing. For each stage state the problem it solved and the problem that remained.',
    points: [
      'Serial processing (1940s to 1950s): no OS; programmer operates the machine from the console; problems are scheduling by sign-up sheet and long job setup time, so the expensive CPU is idle',
      'Simple batch: an operator and batching of similar jobs, then a resident monitor giving automatic job sequencing with control cards (job control language); removes idle time between jobs',
      'Remaining problem with batch: the CPU is idle during slow I/O (card reader, printer); turnaround time is long',
      'Spooling: the disk as a buffer overlaps the I/O of one job with the computation of others',
      'Multiprogrammed batch: several jobs in memory, CPU switched to another job when one waits for I/O; high CPU utilisation; needs job and CPU scheduling, memory management, device allocation; remaining problem is no interaction and poor response time',
      'Time sharing: CPU switched so frequently that users interact with running programs; short response time; needs time slicing, swapping and virtual memory, file system, protection',
    ],
    modelAnswer:
      '<p><b>1. Serial processing.</b> The programmer interacted directly with the hardware through switches, lights, a card reader and a printer. There was <b>no operating system</b>. <i>Problems:</i> <b>scheduling</b>, done with a sign-up sheet, and <b>setup time</b>: loading the compiler tape, running it, unloading it, loading the object program, and starting again from the beginning after any error. The CPU, which cost millions, was idle most of the time.</p><p class="mt-2"><b>2. Simple batch systems.</b> A professional <b>operator</b> ran the jobs, and jobs with similar needs were <b>batched</b>. Then the <b>resident monitor</b>, a small program always in memory, performed <b>automatic job sequencing</b> under the direction of control cards written in a job control language. <i>Solved:</i> idle time between jobs. <i>Remained:</i> the CPU was still idle whenever the job did I/O, because mechanical devices are thousands of times slower than the CPU, and turnaround time could be days.</p><p class="mt-2"><b>3. Spooling.</b> With disks, input was read onto the disk in advance and output written to the disk and printed later. The I/O of one job now overlapped the computation of others.</p><p class="mt-2"><b>4. Multiprogrammed batch systems.</b> Several jobs are kept <b>in memory at once</b> and the CPU is multiplexed among them: when one must wait for I/O, the CPU takes up another. <i>Solved:</i> CPU utilisation. It required the operating system to take decisions for the first time: <b>job scheduling, CPU scheduling, memory management and device allocation</b>. <i>Remained:</i> the user could not interact with a running job, and response time was poor.</p><p class="mt-2"><b>5. Time-sharing systems.</b> A logical extension of multiprogramming in which the CPU is switched among jobs <b>so frequently</b> that many users can each interact with their program while it runs. <i>Solved:</i> response time, at reasonable cost. It required time slicing by a timer, <b>swapping and virtual memory</b>, an on-line file system and protection, and it introduced the notion of the <b>process</b>.</p>',
  },
  {
    id: 'hi-cp-written-batch',
    type: 'written',
    marks: 4,
    prompt: 'What hardware features does a batch operating system (resident monitor) require, and why?',
    points: [
      'Memory protection: a user program must not alter the memory area containing the monitor; the hardware detects an attempt and transfers control to the monitor',
      'Timer: prevents a single job from monopolising the system; when it expires, control returns to the monitor',
      'Privileged instructions: certain instructions, such as I/O instructions, can be executed only by the monitor; if a user program attempts one, control passes to the monitor',
      'Interrupts: give the OS more flexibility in relinquishing control to, and regaining control from, user programs',
    ],
    modelAnswer:
      '<p>A batch operating system is simply a program. It relies on the ability of the processor to fetch instructions from different portions of main memory, so that control alternately passes to the user program and returns to the monitor. For the monitor to stay in control it needs four hardware features.</p><ul class="mt-2 list-disc space-y-1 pl-5"><li><b>Memory protection.</b> While the user program is running it must not alter the memory area containing the monitor. If it tries, the processor hardware detects the error and transfers control to the monitor.</li><li><b>Timer.</b> A timer prevents a single job from monopolising the system. It is set at the start of each job; if it expires, the user program is stopped and control returns to the monitor.</li><li><b>Privileged instructions.</b> Some machine instructions can be executed only by the monitor, in particular the <b>I/O instructions</b>. If a user program encounters one, an error occurs and control passes to the monitor, so the monitor keeps control of all the devices.</li><li><b>Interrupts.</b> They give the operating system more flexibility in relinquishing control to, and regaining control from, user programs.</li></ul><p class="mt-2">These same four features, in more developed form, are what every modern operating system rests on.</p>',
  },
];
