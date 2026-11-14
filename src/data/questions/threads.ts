import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  shared: {
    id: 'th-check-shared',
    type: 'multi',
    prompt: 'Which of these does each thread have for itself, rather than sharing with the other threads of its process?',
    options: ['A program counter and register set', 'A stack', 'The code section', 'The open files'],
    answers: [0, 1],
    explanation:
      'Each thread has its own <b>thread ID, program counter, register set and stack</b>: the things that describe one path of execution. The <b>code section, data section, open files and other OS resources</b> belong to the process and are shared by all its threads.',
  },
  economy: {
    id: 'th-check-economy',
    type: 'mcq',
    prompt: 'Why is switching between two threads of the same process cheaper than switching between two processes?',
    options: [
      'Threads have no registers to save',
      'The address space stays the same, so there is no memory-management context to change',
      'Threads never use the kernel',
      'Threads always run on different processors',
    ],
    answer: 1,
    explanation:
      'Threads of one process <b>share the same address space</b>. A thread switch saves and restores registers, program counter and stack pointer, but the memory map (page tables, and the cached translations that go with them) does not change. A process switch has to change all of that as well.',
  },
  parallel: {
    id: 'th-check-parallel',
    type: 'mcq',
    prompt: 'On a computer with a single processing core, four threads are all making progress. What is this?',
    options: ['Parallelism but not concurrency', 'Concurrency but not parallelism', 'Both', 'Neither'],
    answer: 1,
    explanation:
      '<b>Concurrency</b> means more than one task is making progress; a single core provides it by interleaving, switching rapidly between the threads. <b>Parallelism</b> means more than one task executing at the same instant, which needs more than one core. So it is possible to have concurrency without parallelism.',
  },
  amdahl: {
    id: 'th-check-amdahl',
    type: 'numeric',
    prompt: 'An application is 75% parallel and 25% serial. According to Amdahl’s law, what speedup does moving from 1 to 2 cores give?',
    answer: 1.6,
    tolerance: 0.01,
    hint: 'speedup ≤ 1 / (S + (1 − S) / N), with S the serial fraction.',
    explanation: '1 ÷ (0.25 + 0.75 ÷ 2) = 1 ÷ 0.625 = <b>1.6</b>. With 4 cores it is 2.28, and however many cores are added it can never pass 1 ÷ 0.25 = 4.',
  },
  blocking: {
    id: 'th-check-blocking',
    type: 'mcq',
    prompt: 'A process uses the many-to-one model and has five user threads. One of them makes a blocking system call. What happens?',
    options: [
      'Only that thread waits; the other four continue',
      'The entire process blocks',
      'The kernel creates a new kernel thread for the others',
      'The thread library converts the call into a non-blocking one automatically',
    ],
    answer: 1,
    explanation:
      'All five user threads are mapped onto <b>one</b> kernel thread. When that kernel thread blocks in the system call, there is nothing left for the other user threads to run on, so <b>the entire process blocks</b>. This, and the inability to use more than one processor, are why the model has largely been abandoned.',
  },
  cancel: {
    id: 'th-check-cancel',
    type: 'mcq',
    prompt: 'A thread is cancelled while it is in the middle of updating data it shares with other threads. Which form of cancellation avoids leaving the data inconsistent?',
    options: [
      'Asynchronous cancellation, because it is immediate',
      'Deferred cancellation, because the target checks at safe points whether it should terminate',
      'Neither can avoid it',
      'Both avoid it equally',
    ],
    answer: 1,
    explanation:
      'With <b>deferred cancellation</b> the target thread periodically checks whether it should terminate, so it can stop at a point where it is safe to do so (a cancellation point), after finishing the update. <b>Asynchronous cancellation</b> terminates the target immediately, possibly mid-update and without freeing resources.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  pools: {
    id: 'th-practice-pools',
    type: 'written',
    pastPaper: true,
    marks: 4,
    prompt: 'What is the purpose of thread pools?',
    points: [
      'Context: a server that creates a new thread for each request pays the cost of creating the thread, only to discard it when the request completes',
      'Unlimited creation of threads could also exhaust system resources such as CPU time and memory',
      'A thread pool creates a number of threads at process start-up and places them in a pool where they wait for work; a request is handed to a free thread, which returns to the pool afterwards; if none is free the request waits',
      'Benefits: servicing a request with an existing thread is faster than creating one, and the pool bounds the number of threads that exist at any one time',
    ],
    modelAnswer:
      '<p>Consider a multithreaded web server that creates a separate thread whenever it receives a request. This is better than creating a process, but two problems remain. First, there is the <b>time taken to create the thread</b> before the request can be serviced, together with the fact that the thread is <b>discarded</b> as soon as it has finished its work. Second, if every concurrent request gets a new thread, there is <b>no bound on the number of threads</b> active in the system, and unlimited threads could <b>exhaust system resources</b> such as CPU time and memory.</p><p class="mt-2">A <b>thread pool</b> solves both. The idea is to <b>create a number of threads at process start-up and place them in a pool, where they sit and wait for work</b>. When the server receives a request, it awakens a thread from the pool, if one is available, and passes it the request to service. Once the thread completes its service it <b>returns to the pool</b> and awaits more work. If the pool contains no available thread, the server <b>waits until one becomes free</b>.</p><p class="mt-2"><b>Benefits:</b> (1) servicing a request with an existing thread is <b>usually faster</b> than waiting to create a thread; (2) a thread pool <b>limits the number of threads</b> that exist at any one point, which is particularly important on systems that cannot support a large number of concurrent threads. Separating the task to be performed from the mechanics of creating the thread also allows different strategies for running the task.</p>',
  },
  concurrency: {
    id: 'th-practice-concurrency',
    type: 'written',
    pastPaper: true,
    marks: 4,
    prompt: 'Do you agree that "the multithreading framework improves both concurrency and parallelism on a multicore system"? Justify your answer.',
    points: [
      'Yes, with the definitions stated: concurrency means more than one task making progress; parallelism means more than one task executing simultaneously',
      'Multithreading improves concurrency: a process is split into several threads of control, so one can proceed (or stay responsive) while another is blocked or busy, even on a single core through interleaving',
      'On a multicore system the threads can be assigned to different cores and really run at the same time, so multithreading also provides parallelism; a single-threaded process can use only one core however many exist',
      'Conditions: the threads must be kernel-visible (one-to-one or many-to-many with enough kernel threads; many-to-one gives no parallelism), and the gain is limited by the serial portion (Amdahl’s law) and by the difficulty of dividing work, balancing load and handling data dependencies',
    ],
    modelAnswer:
      '<p><b>Yes</b>, provided the terms are used carefully. <b>Concurrency</b> means that more than one task is <i>making progress</i>. <b>Parallelism</b> means that more than one task is <i>executing simultaneously</i>.</p><p class="mt-2"><b>Concurrency.</b> Multithreading divides a process into several threads of control. One thread can continue while another is blocked or performing a lengthy operation, so the program stays responsive and several activities advance together. This holds even on a single core, where the scheduler provides the illusion by interleaving the threads.</p><p class="mt-2"><b>Parallelism.</b> On a multicore system, separate threads can be assigned to separate cores and <b>execute at the same instant</b>. A single-threaded process can run on only one CPU no matter how many are available; a multithreaded one can use all of them. So on a multicore machine multithreading improves parallelism as well as concurrency.</p><p class="mt-2"><b>Qualifications.</b> The benefit depends on the threading model: with <b>many-to-one</b> user-level threads the kernel sees a single thread, so there is no parallelism, and with many-to-many there must be enough kernel threads for the processors. And the speedup is bounded by the <b>serial portion</b> of the application (Amdahl’s law) and by the programming challenges of multicore: identifying tasks, balancing the load, splitting data, managing data dependencies, and testing.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'th-cp-units',
    type: 'mcq',
    prompt: 'A process has two separable characteristics: resource ownership, and scheduling/execution. In a multithreaded system, which unit corresponds to scheduling and dispatching?',
    options: ['The process (task)', 'The thread', 'The address space', 'The program'],
    answer: 1,
    explanation:
      'The two characteristics are independent. The unit of <b>dispatching</b> is the <b>thread</b> (also called a lightweight process); the unit of <b>resource ownership</b> is the <b>process</b> or task, which owns the address space, files and I/O resources.',
  },
  {
    id: 'th-cp-benefits',
    type: 'multi',
    prompt: 'Which of these are benefits of multithreaded programming?',
    options: [
      'Responsiveness: a program can continue even if part of it is blocked',
      'Protection: each thread is isolated from the others’ memory',
      'Economy: creating and switching threads is cheaper than creating and switching processes',
      'Scalability: threads can run in parallel on different processors',
    ],
    answers: [0, 2, 3],
    explanation:
      'The four classic benefits are <b>responsiveness, resource sharing, economy and scalability</b>. Isolation is not one of them: threads <b>share</b> the address space, so one thread can corrupt another’s data. That sharing is what makes communication easy and synchronisation necessary.',
  },
  {
    id: 'th-cp-suspend',
    type: 'tf',
    prompt: 'True or false: when a process is suspended (swapped out of memory), some of its threads can keep running.',
    answer: false,
    explanation:
      'False. Suspension involves swapping the <b>address space</b> out of memory. Since all the threads of a process share that address space, <b>all of them must enter the suspended state at the same time</b>. Likewise, terminating a process terminates all its threads. Blocking is different: one thread can block without blocking the others.',
  },
  {
    id: 'th-cp-amdahl',
    type: 'numeric',
    prompt: 'An application has a serial portion of 40%. What is the maximum speedup it can achieve on any number of cores?',
    answer: 2.5,
    tolerance: 0.01,
    explanation: 'As the number of cores N approaches infinity, the speedup approaches 1 ÷ S = 1 ÷ 0.4 = <b>2.5</b>. The serial portion of an application has a disproportionate effect on the gain from adding cores.',
  },
  {
    id: 'th-cp-model',
    type: 'mcq',
    prompt: 'Which threading model lets a thread make a blocking system call without stopping the others, but requires a kernel thread to be created for every user thread?',
    options: ['Many-to-one', 'One-to-one', 'Many-to-many', 'Two-level'],
    answer: 1,
    explanation:
      '<b>One-to-one.</b> Each user-level thread maps to its own kernel thread, giving more concurrency than many-to-one and allowing true parallelism on multiprocessors. The drawback is the overhead of creating a kernel thread for each user thread, so most systems restrict the number of threads. Windows and Linux use it.',
  },
  {
    id: 'th-cp-lwp',
    type: 'numeric',
    prompt: 'An application using the many-to-many model has four lightweight processes (LWPs). Five of its threads issue blocking file reads at the same time. How many of those reads have to wait for an LWP?',
    answer: 1,
    unit: 'read',
    explanation: 'One LWP is required for each concurrent blocking system call. Five simultaneous reads need five LWPs; with only four, the <b>fifth</b> request must wait until one of the LWPs returns from the kernel.',
  },
  {
    id: 'th-cp-signal',
    type: 'mcq',
    prompt: 'A thread divides by zero, generating a synchronous signal. To which thread should the signal be delivered?',
    options: [
      'Every thread in the process',
      'The thread that caused the signal',
      'Whichever thread is running when the kernel notices',
      'A randomly chosen thread',
    ],
    answer: 1,
    explanation:
      'A <b>synchronous</b> signal (an illegal memory access, a division by zero) is generated by the running program itself and should be delivered to the <b>thread that caused it</b>, not to other threads. Some asynchronous signals, such as the one produced by control-C, should be sent to all threads.',
  },
  {
    id: 'th-cp-upcall',
    type: 'mcq',
    prompt: 'With scheduler activations, what does the kernel do when one of an application’s threads is about to block?',
    options: [
      'It blocks the whole process',
      'It makes an upcall to the thread library, which saves the blocking thread’s state and schedules another thread on a virtual processor',
      'It terminates the thread',
      'Nothing; the library has to poll',
    ],
    answer: 1,
    explanation:
      'The kernel informs the application about certain events through an <b>upcall</b>, handled by the thread library’s upcall handler. On a block, the kernel allocates a new virtual processor (LWP); the handler saves the state of the blocking thread, relinquishes the virtual processor it was on, and schedules another eligible thread. When the awaited event occurs, another upcall says the thread is eligible to run again.',
  },
  {
    id: 'th-cp-many',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Consider a multiprocessor system and a multithreaded program written using the many-to-many threading model. Let the number of user-level threads in the program be greater than the number of processors. Discuss the performance implications of these scenarios: (a) the number of kernel threads allocated to the program is less than the number of processors; (b) it is equal to the number of processors; (c) it is greater than the number of processors but less than the number of user-level threads.',
    points: [
      'The kernel schedules kernel threads onto processors, and user-level threads can only run when mapped to a kernel thread',
      '(a) Fewer kernel threads than processors: some processors remain idle, because the scheduler can map only kernel threads to processors, so the program cannot use all the available parallelism',
      '(b) Equal: all processors may be utilised simultaneously',
      'But in (b), when a kernel thread blocks inside the kernel (a page fault or a blocking system call), the corresponding processor remains idle',
      '(c) More kernel threads than processors: a blocked kernel thread can be swapped out in favour of another kernel thread that is ready to execute, so processors stay busy and utilisation of the multiprocessor increases',
      'In every case the user-level threads beyond the number of kernel threads must wait and are multiplexed by the thread library; more kernel threads also cost more kernel resources and context switching',
    ],
    modelAnswer:
      '<p>In the many-to-many model the thread library multiplexes user-level threads onto kernel threads (LWPs), and the kernel schedules the <b>kernel threads</b> onto processors. A user-level thread can run only while it holds a kernel thread.</p><p class="mt-2"><b>(a) Fewer kernel threads than processors.</b> <b>Some of the processors will remain idle</b>, since the scheduler maps only kernel threads to processors and not user-level threads. The program can have at most as many threads running at once as it has kernel threads, so it cannot exploit all the available parallelism, however many user-level threads are ready.</p><p class="mt-2"><b>(b) Kernel threads equal to processors.</b> It is possible that <b>all of the processors are utilised simultaneously</b>. However, when a kernel thread <b>blocks inside the kernel</b> (because of a page fault or while invoking a blocking system call), the <b>corresponding processor would remain idle</b>, because there is no spare kernel thread to run another ready user-level thread on it.</p><p class="mt-2"><b>(c) More kernel threads than processors, fewer than user-level threads.</b> A <b>blocked kernel thread can be swapped out in favour of another kernel thread that is ready to execute</b>, thereby <b>increasing the utilisation</b> of the multiprocessor system. The processors stay busy even while some threads wait in the kernel.</p><p class="mt-2">In all three cases the user-level threads in excess of the kernel threads must wait their turn, scheduled by the thread library, and the kernel can tell the library about blocking events through upcalls (scheduler activations). More kernel threads improve utilisation at the cost of more kernel resources and context switching.</p>',
  },
  {
    id: 'th-cp-ult-klt',
    type: 'written',
    marks: 5,
    prompt: 'Compare user-level threads and kernel-level threads.',
    points: [
      'User-level threads: thread management is done by a thread library in user space; the kernel is unaware of them and schedules the process as a unit',
      'Advantages of user-level threads: fast creation and switching (no mode switch), scheduling can be application-specific, and no OS support is needed',
      'Disadvantages of user-level threads: a blocking system call blocks the whole process, and they cannot take advantage of multiprocessing',
      'Kernel-level threads: supported and managed directly by the kernel, which schedules each thread',
      'Advantages of kernel-level threads: a blocked thread does not block the others, and threads can run in parallel on multiple processors; the kernel itself can be multithreaded',
      'Disadvantage of kernel-level threads: creating and switching threads needs a user/kernel mode switch, so they are slower and consume kernel resources',
    ],
    modelAnswer:
      '<p>Support for threads may be provided at the user level or by the kernel.</p><p class="mt-2"><b>User-level threads.</b> Thread management is done by a <b>thread library in user space</b>. The application creates and manages all its threads with the library, and the kernel, unaware of them, <b>schedules the process as a unit</b>. <i>Advantages:</i> creating, switching and scheduling are <b>fast</b>, because they happen entirely in user space with no mode switch; scheduling can be <b>application-specific</b>; and <b>no operating-system support</b> is required, so they run on any OS. <i>Disadvantages:</i> if a thread makes a <b>blocking system call, the entire process blocks</b>; and since the kernel sees only one thread of control, user-level threads <b>cannot support multiprocessing</b>. Examples: POSIX Pthreads, Mach C-threads, Solaris threads libraries.</p><p class="mt-2"><b>Kernel-level threads.</b> Threads are <b>supported and managed directly by the kernel</b>, which schedules them individually. <i>Advantages:</i> if one thread blocks, the kernel can schedule another thread of the same process; threads can run <b>in parallel on multiple processors</b>; and the kernel itself may be multithreaded. <i>Disadvantage:</i> a <b>user/kernel mode switch</b> is needed to create or change threads, so operations are slower than with user-level threads, and each thread consumes kernel resources. Examples: Windows, Solaris, Linux.</p><p class="mt-2">The multithreading models (many-to-one, one-to-one, many-to-many) describe how the two kinds are related.</p>',
  },
];
