import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  race: {
    id: 'sy-check-race',
    type: 'mcq',
    prompt: 'The shared variable <code>counter</code> is 5. A producer runs <code>counter++</code> and a consumer runs <code>counter--</code> concurrently, with no synchronisation. Which final values are possible?',
    options: ['Only 5', '4 or 6', '4, 5 or 6', 'Any integer'],
    answer: 2,
    explanation:
      'Each statement is three machine instructions (load, modify, store). If one process loads the old value before the other stores its result, an update is lost. Depending on the interleaving the result is <b>4, 5 or 6</b>; only 5 is correct. A situation where the outcome depends on the order of access is a <b>race condition</b>.',
  },
  requirements: {
    id: 'sy-check-requirements',
    type: 'mcq',
    prompt: 'A solution lets processes into the critical section one at a time, but a process that is ready to enter can be overtaken by others again and again, with no limit. Which requirement is violated?',
    options: ['Mutual exclusion', 'Progress', 'Bounded waiting', 'None'],
    answer: 2,
    explanation:
      '<b>Bounded waiting</b>: there must be a bound on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted. Without it a process can starve, even though mutual exclusion and progress both hold.',
  },
  strict: {
    id: 'sy-check-strict',
    type: 'mcq',
    prompt: 'Two processes use only a shared variable <code>turn</code>: each waits while <code>turn</code> is not its own number, and sets <code>turn</code> to the other’s number on leaving. What is wrong?',
    options: [
      'Both can be in the critical section together',
      'The processes are forced to alternate strictly, so one cannot enter twice in a row even if the other does not want to enter',
      'It deadlocks immediately',
      'Nothing',
    ],
    answer: 1,
    explanation:
      'Mutual exclusion holds, but <b>progress</b> does not. After P0 leaves, <code>turn</code> is 1. If P1 is busy in its remainder section and does not want to enter, P0 cannot enter again, although the critical section is free: a process that is not competing is deciding who may enter.',
  },
  tas: {
    id: 'sy-check-tas',
    type: 'mcq',
    prompt: 'What makes the TestAndSet instruction suitable for building a lock?',
    options: [
      'It is very fast',
      'It reads the old value of a word and sets the word to true as one atomic, uninterruptible operation',
      'It disables interrupts on all processors',
      'It puts the calling process to sleep',
    ],
    answer: 1,
    explanation:
      'The read and the write happen <b>atomically</b>. If two TestAndSet instructions are executed simultaneously on different CPUs they are executed sequentially in some arbitrary order, so exactly one of them sees <code>false</code> and wins the lock.',
  },
  semvalue: {
    id: 'sy-check-semvalue',
    type: 'numeric',
    prompt: 'A counting semaphore is initialised to 3. Five processes each execute <code>wait()</code> on it and none has yet executed <code>signal()</code>. How many of them are blocked?',
    answer: 2,
    unit: 'processes',
    explanation: 'The first three waits succeed, taking the value from 3 to 0. The fourth and fifth find it at 0 and <b>block</b>. (In the implementation that lets the value go negative, it would now be −2: its magnitude is the number of waiting processes.)',
  },
  order: {
    id: 'sy-check-order',
    type: 'mcq',
    prompt: 'In the semaphore solution to the bounded-buffer problem, what happens if the producer executes <code>wait(mutex)</code> <b>before</b> <code>wait(empty)</code>?',
    options: [
      'Nothing changes',
      'If the buffer is full, the producer blocks on empty while holding mutex, so the consumer can never get in to make space: deadlock',
      'Mutual exclusion is lost',
      'The consumer starves but the producer continues',
    ],
    answer: 1,
    explanation:
      'With a full buffer the producer takes <code>mutex</code> and then blocks on <code>empty</code>. The consumer, which is the only one that could signal <code>empty</code>, first needs <code>mutex</code>, which the producer is holding. Both wait for ever. The order of waits matters: <b>never block while holding the mutex</b>.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  bridge: {
    id: 'sy-practice-bridge',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'An old bridge on a busy highway is too narrow to permit two-way traffic, so one-way traffic is to be implemented on it by alternately letting cars from each direction cross. Write a solution using semaphores (or monitors) that prevents collisions and deadlock.',
    points: [
      'Shared state: the current direction of traffic on the bridge, the number of cars on the bridge, and the number waiting in each direction, protected by a mutex semaphore initialised to 1',
      'A semaphore (or condition) per direction, initialised to 0, on which cars of that direction wait when they cannot enter',
      'Entry: wait(mutex); if the bridge is in use by the opposite direction (cars on bridge > 0 and direction differs), record that the car is waiting, release mutex and block on its direction semaphore; otherwise set the direction, increment the count and release mutex',
      'Exit: wait(mutex); decrement the count; if the bridge is now empty and cars are waiting in the other direction, switch direction and signal those cars (each increments the count); signal(mutex)',
      'Collisions are prevented because cars of opposite directions are never on the bridge together (mutual exclusion on direction)',
      'Deadlock and starvation are addressed: nothing is held while blocking on the direction semaphore, and fairness requires that when cars are waiting on the other side, newly arriving cars of the current direction are made to queue (or a limit is placed on consecutive cars)',
    ],
    modelAnswer:
      '<p>The bridge is a shared resource that may be used by any number of cars travelling in the <b>same</b> direction, but never by cars travelling in opposite directions at the same time. It is a variation of the readers-writers problem with two classes of "reader".</p><pre class="bg-background mt-2 overflow-x-auto rounded-md border p-2 text-xs">semaphore mutex = 1;             // protects the shared variables\nsemaphore gate[2] = {0, 0};      // cars of each direction wait here\nint dir = 0;                     // direction now using the bridge\nint onBridge = 0;                // cars on the bridge\nint waiting[2] = {0, 0};         // cars waiting in each direction\n\nvoid enter(int d) {\n    wait(mutex);\n    if (onBridge > 0 && (dir != d || waiting[1 - d] > 0)) {\n        waiting[d]++;            // must not go: wrong direction,\n        signal(mutex);           // or the other side is queueing\n        wait(gate[d]);           // woken already counted on the bridge\n    } else {\n        dir = d;\n        onBridge++;\n        signal(mutex);\n    }\n}\n\nvoid leave(int d) {\n    wait(mutex);\n    onBridge--;\n    if (onBridge == 0 && waiting[1 - d] > 0) {\n        dir = 1 - d;             // turn the traffic round\n        while (waiting[dir] > 0) {\n            waiting[dir]--;\n            onBridge++;\n            signal(gate[dir]);\n        }\n    } else if (onBridge == 0 && waiting[d] > 0) {\n        while (waiting[d] > 0) { waiting[d]--; onBridge++; signal(gate[d]); }\n    }\n    signal(mutex);\n}</pre><p class="mt-2"><b>No collisions.</b> A car enters only if the bridge is empty or already carrying traffic in its own direction; the test and the update of <code>dir</code> and <code>onBridge</code> are done under <code>mutex</code>, so cars of opposite directions are never on the bridge together.</p><p class="mt-2"><b>No deadlock.</b> A car never blocks while holding <code>mutex</code>: it releases it before waiting on its gate. When the last car leaves, the waiting cars are released.</p><p class="mt-2"><b>No starvation.</b> A steady stream from one side could otherwise hold the bridge for ever. The test <code>waiting[1 − d] &gt; 0</code> makes a newly arriving car queue once cars are waiting on the far side, so the bridge empties and the direction alternates.</p>',
  },
  monitor: {
    id: 'sy-practice-monitor',
    type: 'written',
    marks: 5,
    prompt: 'What difficulties arise from using semaphores directly, and how do monitors address them?',
    points: [
      'Semaphores rely on every programmer using wait and signal in the correct order; errors are timing-dependent and hard to detect',
      'Examples: signal(mutex) ... wait(mutex) lets several processes into the critical section; wait(mutex) ... wait(mutex) deadlocks; omitting a wait or a signal violates mutual exclusion or deadlocks',
      'A monitor is a high-level language construct: an abstract data type that encapsulates shared data with the procedures that operate on it',
      'Only one process at a time can be active within the monitor, so mutual exclusion is enforced automatically by the compiler, not by the programmer',
      'Condition variables with wait and signal let a process wait inside the monitor for a condition; x.wait() suspends the caller and x.signal() resumes exactly one waiter (and has no effect if none is waiting, unlike a semaphore signal)',
    ],
    modelAnswer:
      '<p><b>Difficulties with semaphores.</b> Semaphores are a convenient and effective mechanism, but using them correctly depends on <b>every</b> process observing the sequence wait(mutex) … critical section … signal(mutex). Errors are easy to make, and because they show up only under particular interleavings they are <b>difficult to detect</b>:</p><ul class="mt-1 list-disc space-y-1 pl-5"><li>interchanging the operations, <code>signal(mutex) … wait(mutex)</code>, lets several processes into their critical sections at once, violating mutual exclusion;</li><li>writing <code>wait(mutex) … wait(mutex)</code> causes a deadlock;</li><li>omitting the wait, the signal or both violates mutual exclusion or causes deadlock.</li></ul><p class="mt-2"><b>Monitors.</b> A monitor is a <b>high-level synchronisation construct</b> provided by the programming language. It is an abstract data type that <b>encapsulates private data with the public procedures that operate on it</b>; the local variables of a monitor can be accessed only by its procedures. The construct ensures that <b>only one process at a time is active within the monitor</b>, so the programmer does not have to code mutual exclusion explicitly, and the errors above cannot be made.</p><p class="mt-2">For other synchronisation needs a monitor provides <b>condition variables</b>, on which only two operations can be invoked. <code>x.wait()</code> means that the process invoking it is suspended until another process invokes <code>x.signal()</code>, which resumes <b>exactly one</b> suspended process. If no process is suspended, the signal has <b>no effect</b>; this differs from the signal operation on a semaphore, which always changes the semaphore’s state.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'sy-cp-three',
    type: 'multi',
    prompt: 'Which of these are the three requirements that a solution to the critical-section problem must satisfy?',
    options: ['Mutual exclusion', 'Progress', 'Bounded waiting', 'Maximum throughput'],
    answers: [0, 1, 2],
    explanation:
      '<b>Mutual exclusion</b>: if a process is executing in its critical section, no other process can be in its own. <b>Progress</b>: if no process is in its critical section and some wish to enter, only those not in their remainder sections take part in deciding who enters next, and the decision cannot be postponed indefinitely. <b>Bounded waiting</b>: there is a limit on how many times others may enter after a process has asked.',
  },
  {
    id: 'sy-cp-peterson',
    type: 'mcq',
    prompt: 'In Peterson’s solution, process P<sub>i</sub> executes <code>flag[i] = true; turn = j;</code> and then waits while <code>flag[j] && turn == j</code>. Both processes try to enter at the same time. Who gets in?',
    options: [
      'Both',
      'Neither',
      'Exactly one: turn can hold only one value, and the process whose assignment to turn came last waits',
      'It is random and may change while they wait',
    ],
    answer: 2,
    explanation:
      'Both set their flags, and both assign to <code>turn</code>, but only one of the assignments lasts: the other is overwritten. The process that wrote <b>last</b> set <code>turn</code> to the other’s number, so it waits, and the other enters. When that one leaves and clears its flag, the waiting process enters: mutual exclusion, progress and bounded waiting all hold.',
  },
  {
    id: 'sy-cp-interrupts',
    type: 'mcq',
    prompt: 'On a uniprocessor, mutual exclusion can be obtained by disabling interrupts during the critical section. Why is this not a general solution?',
    options: [
      'It does not actually provide mutual exclusion',
      'It does not work on multiprocessors, and giving user processes the power to disable interrupts is unwise',
      'Interrupts cannot be disabled',
      'It is slower than a semaphore',
    ],
    answer: 1,
    explanation:
      'With interrupts off, the running process cannot be preempted, so on one CPU it is safe. But on a <b>multiprocessor</b> another process can be running on a different CPU, so disabling interrupts does not help (and passing the message to all processors is slow). It is also unwise to let user processes disable interrupts: one that never turns them back on brings the system to a halt.',
  },
  {
    id: 'sy-cp-spinlock',
    type: 'mcq',
    prompt: 'When is a spinlock, which busy-waits, a reasonable choice?',
    options: [
      'On a uniprocessor, for long critical sections',
      'On a multiprocessor, when the lock is expected to be held for a short time, less than two context switches',
      'Never',
      'Whenever fairness is required',
    ],
    answer: 1,
    explanation:
      'Busy waiting wastes CPU cycles that another process could use. Its advantage is that <b>no context switch</b> is needed when a process must wait for a lock. On a <b>multiprocessor</b>, one thread can spin on one processor while another performs its critical section on another, so if locks are held for short times, spinning is cheaper than blocking and being woken.',
  },
  {
    id: 'sy-cp-sem',
    type: 'numeric',
    prompt: 'A semaphore S is initialised to 2. The following operations are performed in order, by different processes: wait(S), wait(S), wait(S), signal(S), wait(S). How many processes are blocked on S at the end?',
    answer: 1,
    unit: 'process',
    hint: 'A signal wakes a waiting process if there is one; only otherwise does it raise the value.',
    explanation: 'Two waits take S from 2 to 0. The third wait blocks (one waiting). The signal wakes that process, leaving S at 0 and nobody waiting. The last wait finds 0 and blocks. So <b>one</b> process is blocked.',
  },
  {
    id: 'sy-cp-buffer',
    type: 'mcq',
    prompt: 'In the semaphore solution to the bounded-buffer problem with n slots, what are the initial values of the semaphores mutex, empty and full?',
    options: ['1, 0, n', '1, n, 0', '0, n, n', 'n, 1, 0'],
    answer: 1,
    explanation:
      '<b>mutex = 1</b> provides mutual exclusion for accesses to the buffer pool. <b>empty = n</b> counts the empty slots, all of them at the start. <b>full = 0</b> counts the full slots. The producer does wait(empty), wait(mutex), …, signal(mutex), signal(full); the consumer mirrors it with full and empty exchanged.',
  },
  {
    id: 'sy-cp-rw',
    type: 'mcq',
    prompt: 'In the first readers-writers solution (readers have priority), what is the risk?',
    options: ['Readers may starve', 'Writers may starve', 'Two writers may write together', 'A reader and a writer may be active together'],
    answer: 1,
    explanation:
      'No reader is kept waiting unless a writer has already obtained permission. If readers keep arriving while others are still reading, <code>readcount</code> never returns to zero, the <code>wrt</code> semaphore is never released, and <b>writers starve</b>. The second version gives writers priority, and then readers may starve.',
  },
  {
    id: 'sy-cp-monitor',
    type: 'tf',
    prompt: 'True or false: if a process executes <code>x.signal()</code> on a monitor condition variable when no process is waiting on x, the signal is remembered and the next process to execute <code>x.wait()</code> continues without waiting.',
    answer: false,
    explanation:
      'False. On a condition variable, a signal resumes exactly one suspended process, and if no process is suspended it has <b>no effect</b>: the state of x is as though the operation was never executed. That is the difference from a semaphore, where signal always affects the state by incrementing the value. Corrected: "…the signal has no effect, and the next process to execute x.wait() is suspended."',
  },
  {
    id: 'sy-cp-requirements',
    type: 'written',
    marks: 6,
    prompt: 'State the critical-section problem and the three requirements a solution must satisfy. Show how Peterson’s solution meets each of them.',
    points: [
      'n processes each have a segment of code, the critical section, in which they access shared data; the problem is to design a protocol (entry and exit sections) so that no two processes execute in their critical sections at the same time',
      'Mutual exclusion; progress (only processes not in their remainder sections decide who enters next, and the decision cannot be postponed indefinitely); bounded waiting (a bound on how many times others enter after a request is made)',
      'Peterson: shared int turn and boolean flag[2]; entry is flag[i] = true; turn = j; while (flag[j] && turn == j); exit is flag[i] = false',
      'Mutual exclusion: Pi enters only if flag[j] is false or turn == i. If both were inside, both flags would be true, so turn would have to be both i and j, which is impossible',
      'Progress: Pi can be stuck only in the while loop with flag[j] true and turn == j. If Pj is not interested, flag[j] is false and Pi enters; if Pj is waiting too, turn is either i or j, so one of them enters',
      'Bounded waiting: when Pj leaves it sets flag[j] false, letting Pi in; if Pj tries again it sets turn = i, so Pi enters after at most one entry by Pj',
    ],
    modelAnswer:
      '<p><b>The problem.</b> Consider n processes competing to use some shared data. Each has a segment of code, called its <b>critical section</b>, in which the shared data is accessed. The problem is to design a protocol so that when one process is executing in its critical section, no other process is allowed to execute in its critical section. Each process asks permission in an <b>entry section</b>, and follows the critical section with an <b>exit section</b>; the rest is the remainder section.</p><p class="mt-2"><b>Requirements.</b></p><ol class="mt-1 list-decimal space-y-1 pl-5"><li><b>Mutual exclusion.</b> If process P<sub>i</sub> is executing in its critical section, no other process can be executing in its critical section.</li><li><b>Progress.</b> If no process is executing in its critical section and some processes wish to enter, then only those processes that are not executing in their remainder sections can participate in deciding which will enter next, and this selection cannot be postponed indefinitely.</li><li><b>Bounded waiting.</b> There exists a bound on the number of times that other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted.</li></ol><p class="mt-2"><b>Peterson’s solution</b> for two processes shares <code>int turn</code> and <code>boolean flag[2]</code>:</p><pre class="bg-background mt-1 overflow-x-auto rounded-md border p-2 text-xs">do {\n    flag[i] = true;\n    turn = j;\n    while (flag[j] && turn == j) ;   // wait\n    /* critical section */\n    flag[i] = false;\n    /* remainder section */\n} while (true);</pre><p class="mt-2"><b>Mutual exclusion.</b> P<sub>i</sub> enters only if <code>flag[j] == false</code> or <code>turn == i</code>. If both processes were in their critical sections, then flag[0] and flag[1] would both be true, so each must have found turn equal to its own number, but turn cannot be both 0 and 1. Hence at most one is inside.</p><p class="mt-2"><b>Progress.</b> P<sub>i</sub> can be prevented from entering only if it is stuck in the while loop with <code>flag[j] == true</code> and <code>turn == j</code>. If P<sub>j</sub> is not ready to enter, flag[j] is false and P<sub>i</sub> enters. If P<sub>j</sub> has set its flag and is also in its while loop, then turn is either i or j, and whichever it names enters.</p><p class="mt-2"><b>Bounded waiting.</b> Once P<sub>j</sub> exits it sets flag[j] to false, allowing P<sub>i</sub> to enter. If P<sub>j</sub> immediately sets flag[j] to true again, it must also set turn to i. Since P<sub>i</sub> does not change turn while in its while loop, P<sub>i</sub> will enter after <b>at most one</b> entry by P<sub>j</sub>.</p>',
  },
  {
    id: 'sy-cp-dining',
    type: 'written',
    marks: 5,
    prompt: 'Describe the dining-philosophers problem, explain how the simple semaphore solution can deadlock, and give two remedies.',
    points: [
      'Five philosophers sit at a round table with five chopsticks, one between each pair; a philosopher needs both adjacent chopsticks to eat and picks them up one at a time',
      'Semaphore solution: chopstick[5] all initialised to 1; philosopher i does wait(chopstick[i]); wait(chopstick[(i+1) % 5]); eat; signal both; think',
      'No two neighbours eat at once, but if all five become hungry together and each picks up the left chopstick, every chopstick value is 0 and each waits for ever for the right one: deadlock',
      'Remedy: allow at most four philosophers to sit at the table at once',
      'Remedy: allow a philosopher to pick up chopsticks only if both are available (picking them up in a critical section, as in the monitor solution)',
      'Remedy: an asymmetric solution - odd philosophers pick up the left chopstick first and even philosophers the right; note that a deadlock-free solution does not necessarily prevent starvation',
    ],
    modelAnswer:
      '<p><b>The problem.</b> Five philosophers spend their lives thinking and eating. They share a circular table with five chairs; in the centre is a bowl of rice and the table is laid with <b>five single chopsticks</b>, one between each pair of philosophers. When a philosopher gets hungry she tries to pick up the two chopsticks closest to her. She may pick up <b>only one chopstick at a time</b> and cannot take one that is already in a neighbour’s hand. With both, she eats; then she puts both down and thinks again. It is a simple representation of the need to allocate several resources among several processes in a deadlock-free and starvation-free manner.</p><p class="mt-2"><b>Semaphore solution.</b> Represent each chopstick by a semaphore, <code>semaphore chopstick[5]</code>, all initialised to 1:</p><pre class="bg-background mt-1 overflow-x-auto rounded-md border p-2 text-xs">do {\n    wait(chopstick[i]);\n    wait(chopstick[(i + 1) % 5]);\n    /* eat */\n    signal(chopstick[i]);\n    signal(chopstick[(i + 1) % 5]);\n    /* think */\n} while (true);</pre><p class="mt-2">This guarantees that no two neighbours eat simultaneously, but it can <b>deadlock</b>. Suppose all five philosophers become hungry at the same time and each grabs her left chopstick. All the elements of chopstick are now 0. When each philosopher tries to grab her right chopstick, she is delayed for ever.</p><p class="mt-2"><b>Remedies.</b></p><ul class="mt-1 list-disc space-y-1 pl-5"><li>Allow <b>at most four</b> philosophers to be sitting at the table simultaneously.</li><li>Allow a philosopher to pick up her chopsticks <b>only if both are available</b>; to do so she must pick them up in a critical section. The monitor solution does this with a state array and one condition variable per philosopher.</li><li>Use an <b>asymmetric</b> solution: an odd-numbered philosopher picks up first her left chopstick and then her right, whereas an even-numbered one picks up her right and then her left.</li></ul><p class="mt-2">Any satisfactory solution must also guard against <b>starvation</b>: a deadlock-free solution does not necessarily eliminate the possibility that a philosopher never gets to eat.</p>',
  },
];
