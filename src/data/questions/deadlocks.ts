import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  conditions: {
    id: 'dl-check-conditions',
    type: 'mcq',
    prompt: 'A system guarantees that a process which is refused a resource immediately gives up everything it holds. Which of the four necessary conditions for deadlock can no longer hold?',
    options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'],
    answer: 2,
    explanation:
      'Resources are being taken back from a process before it has finished with them, so <b>no preemption</b> is denied. Because all four conditions must hold at the same time for a deadlock to arise, denying any one of them is enough.',
  },
  cycle: {
    id: 'dl-check-cycle',
    type: 'mcq',
    prompt: 'A resource-allocation graph contains a cycle. Every resource type has exactly one instance. What can you conclude?',
    options: [
      'A deadlock may or may not exist',
      'A deadlock exists, and every process on the cycle is deadlocked',
      'No deadlock exists',
      'The system is in an unsafe state but not deadlocked',
    ],
    answer: 1,
    explanation:
      'With <b>one instance per resource type</b>, a cycle is both necessary and sufficient for deadlock. With several instances per type, a cycle is necessary but <b>not sufficient</b>: a process outside the cycle may release an instance that breaks it.',
  },
  ordering: {
    id: 'dl-check-ordering',
    type: 'mcq',
    prompt: 'Resources are numbered F(tape drive) = 1, F(disk drive) = 5, F(printer) = 12, and every process must request resources in increasing order of number. A process holding the disk drive now needs the tape drive. What must it do?',
    options: [
      'Request the tape drive; the request is simply granted',
      'Release the disk drive first, then request the tape drive (and then the disk drive again)',
      'Wait until the printer is free',
      'Nothing can be done; the process must be aborted',
    ],
    answer: 1,
    explanation:
      'F(tape) = 1 is less than F(disk) = 5, so requesting it while holding the disk drive would break the ordering. Under the second form of the protocol, a process requesting R<sub>j</sub> must first have released every R<sub>i</sub> with F(R<sub>i</sub>) ≥ F(R<sub>j</sub>).',
  },
  safe: {
    id: 'dl-check-safe',
    type: 'mcq',
    prompt: 'Which statement about safe and unsafe states is correct?',
    options: [
      'An unsafe state is a deadlocked state',
      'A safe state may be deadlocked',
      'An unsafe state may lead to deadlock, but it need not: it depends on what the processes go on to request',
      'A safe state has exactly one safe sequence',
    ],
    answer: 2,
    explanation:
      'A safe state is never deadlocked. An <b>unsafe</b> state is one in which the operating system can no longer <b>guarantee</b> that deadlock will be avoided: whether it happens is in the hands of the processes. Deadlocked states are a subset of unsafe states. A safe state may have several safe sequences.',
  },
  tape: {
    id: 'dl-check-tape',
    type: 'numeric',
    prompt: 'A system has 12 tape drives. P0 (maximum need 10) holds 5, P1 (maximum 4) holds 2 and P2 (maximum 9) holds 3. How many drives are free?',
    answer: 2,
    unit: 'drives',
    explanation:
      '12 − (5 + 2 + 3) = <b>2</b>. This is the unsafe state from the example. P1 needs 2 more, so it can finish and return its drives, making 4 free. But P0 still needs 5 and P2 still needs 6: neither can be guaranteed to finish.',
  },
  request: {
    id: 'dl-check-request',
    type: 'mcq',
    prompt: 'In the Banker’s algorithm, a request passes the first two tests (it is within Need and within Available). What happens next?',
    options: [
      'The resources are allocated at once',
      'The system pretends to allocate, then runs the safety algorithm; if the new state is unsafe, the old state is restored and the process waits',
      'The process is terminated',
      'The detection algorithm is run on the current state',
    ],
    answer: 1,
    explanation:
      'Availability is not enough. The allocation is made only <b>tentatively</b>: Available and Need<sub>i</sub> go down by the request and Allocation<sub>i</sub> goes up. The <b>safety algorithm</b> then decides. Safe: the allocation stands. Unsafe: the process must wait, and the old resource-allocation state is restored.',
  },
  detect: {
    id: 'dl-check-detect',
    type: 'mcq',
    prompt: 'How does the deadlock-detection algorithm for several instances differ from the Banker’s safety algorithm?',
    options: [
      'It uses the current Request matrix in place of Need, and a process holding nothing starts with Finish = true',
      'It does not use the Allocation matrix',
      'It runs in constant time',
      'It needs each process to declare its maximum claim',
    ],
    answer: 0,
    explanation:
      'Detection asks about <b>now</b>, not about the worst possible future, so it compares the <b>current requests</b> with Work. It needs no advance information. A process with no allocation cannot be part of a deadlock, so its Finish entry is true from the start. Any process whose Finish entry is still false at the end is deadlocked.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice, shown before the checkpoint. */
export const practice = {
  compare: {
    id: 'dl-practice-compare',
    type: 'written',
    pastPaper: true,
    marks: 5,
    prompt: 'Compare the deadlock-prevention algorithm that prevents circular wait with the deadlock-avoidance algorithm.',
    points: [
      'Prevention of circular wait: a total ordering F of all resource types is imposed, and each process must request resources in increasing order of F (or release every higher-numbered resource first)',
      'This makes a circular wait structurally impossible, so one of the four necessary conditions can never hold; no run-time check of the system state is needed',
      'Avoidance (Banker’s algorithm): each process declares its maximum claim in advance; every request is granted only if the resulting state is safe, that is, a safe sequence of all processes exists',
      'Information needed: prevention needs only the ordering of resource types; avoidance needs a priori information on the maximum needs of every process',
      'Cost and utilisation: prevention restricts how requests can be made, so resources are acquired early or out of the natural order, giving low device utilisation and reduced throughput; avoidance allows more concurrency but pays for the safety algorithm (order m × n²) on each request, and may make a process wait although the resource is free',
    ],
    modelAnswer:
      '<p>Both ensure that the system <b>never enters a deadlock state</b>, but they do it in different ways.</p><p class="mt-2"><b>Prevention by denying circular wait.</b> A one-to-one function F: R → N gives every resource type a number, imposing a <b>total ordering</b>. A process may request instances of R<sub>j</sub> only if F(R<sub>j</sub>) is greater than F of every resource it already holds; otherwise it must first release those resources. A circular wait is then impossible: in a cycle P<sub>0</sub> … P<sub>n</sub>, each process would hold a resource numbered lower than the one it waits for, giving F(R<sub>0</sub>) &lt; F(R<sub>1</sub>) &lt; … &lt; F(R<sub>n</sub>) &lt; F(R<sub>0</sub>), a contradiction. Since one of the four necessary conditions can never hold, deadlock cannot occur. It is a <b>static rule</b> on how requests are made: nothing is examined at run time.</p><p class="mt-2"><b>Avoidance.</b> No condition is ruled out in advance. Instead the system requires <b>a priori information</b>: each process declares the maximum number of instances of each type it may need. On every request the system <b>dynamically examines the resource-allocation state</b> (Available, Allocation, Max) and grants the request only if the resulting state is <b>safe</b>, meaning there is some sequence in which every process can obtain its maximum need and finish (the Banker’s algorithm). Otherwise the process waits, even though the resources are free.</p><table class="mt-2 w-full text-left text-xs"><tr><th></th><th>Preventing circular wait</th><th>Avoidance</th></tr><tr><td>Idea</td><td>Make one necessary condition impossible</td><td>Never enter an unsafe state</td></tr><tr><td>Information needed</td><td>An ordering of resource types</td><td>Maximum claim of every process</td></tr><tr><td>When the work is done</td><td>None at run time; the protocol is built into the programs</td><td>Safety algorithm on every request, order m × n²</td></tr><tr><td>Effect on utilisation</td><td>Low: resources may have to be requested before they are needed, or released and re-acquired</td><td>Better: requests can come in any order, but some are delayed</td></tr></table><p class="mt-2">In short, prevention is simpler and cheaper but more restrictive; avoidance permits more concurrency at the price of advance knowledge and run-time overhead.</p>',
  },
  utilisation: {
    id: 'dl-practice-utilisation',
    type: 'written',
    pastPaper: true,
    marks: 3,
    prompt: 'True or false, with justification. If false, give the corrected statement: “Deadlock-prevention protocols increase device utilisation and system throughput.”',
    points: [
      'False',
      'Prevention works by restraining how requests can be made, so that one of the four necessary conditions cannot hold',
      'Example: a process must request all its resources before it starts, so a resource (such as a printer needed only at the end) is allocated but unused for a long time; starvation is also possible',
      'Corrected statement: deadlock-prevention protocols lead to low device utilisation and reduced system throughput',
    ],
    modelAnswer:
      '<p><b>False.</b> Deadlock prevention ensures that at least one of the four necessary conditions cannot hold, and it does so by <b>restraining how requests for resources can be made</b>. Those restrictions keep resources idle.</p><p class="mt-2">For example, to deny hold and wait a process may be required to request and be allocated all its resources before it begins execution. A process that copies data from a tape drive to a disk file and then prints the result must hold the printer for its entire execution, although it needs it only at the end. Resources are <b>allocated but unused for long periods</b>, and a process that needs several popular resources may <b>starve</b>. Ordering resources to deny circular wait has a similar effect: a resource may have to be acquired earlier than it is needed.</p><p class="mt-2"><b>Corrected statement:</b> deadlock-prevention protocols result in <b>low device utilisation and reduced system throughput</b>.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'dl-cp-four',
    type: 'multi',
    prompt: 'Which of these are among the four conditions that must hold simultaneously for a deadlock to arise?',
    options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait', 'Starvation'],
    answers: [0, 1, 2, 3],
    explanation:
      '<b>Mutual exclusion, hold and wait, no preemption and circular wait.</b> All four must hold. Starvation is a different problem: a process waits indefinitely while others make progress.',
  },
  {
    id: 'dl-cp-need',
    type: 'mcq',
    prompt: 'In the Banker’s algorithm, process P0 has Max = (7, 5, 3) and Allocation = (0, 1, 0). What is its Need?',
    options: ['(7, 6, 3)', '(7, 4, 3)', '(0, 1, 0)', '(3, 3, 2)'],
    answer: 1,
    explanation: 'Need = Max − Allocation = (7 − 0, 5 − 1, 3 − 0) = <b>(7, 4, 3)</b>.',
  },
  {
    id: 'dl-cp-first',
    type: 'mcq',
    prompt:
      'Available = (3, 3, 2). The Needs are P0 (7, 4, 3), P1 (1, 2, 2), P2 (6, 0, 0), P3 (0, 1, 1), P4 (4, 3, 1). Which processes could be chosen <b>first</b> by the safety algorithm?',
    options: ['Only P1', 'P1 or P3', 'P1, P3 or P4', 'Any of them'],
    answer: 1,
    hint: 'A process can be chosen when every component of its Need is at most the matching component of Work.',
    explanation:
      'Need must fit within Work = (3, 3, 2) in <b>every</b> component. P1 (1, 2, 2) and P3 (0, 1, 1) fit. P4 fails on A (4 &gt; 3), P2 on A (6 &gt; 3) and P0 on A, B and C. Because there is a choice, a safe state can have more than one safe sequence.',
  },
  {
    id: 'dl-cp-work',
    type: 'mcq',
    prompt: 'Continuing: Work = (3, 3, 2) and P1, whose Allocation is (2, 0, 0), is chosen. What is Work after P1 finishes?',
    options: ['(1, 3, 2)', '(2, 1, 0)', '(5, 3, 2)', '(6, 5, 4)'],
    answer: 2,
    explanation: 'A finished process returns everything it holds: Work = Work + Allocation<sub>1</sub> = (3, 3, 2) + (2, 0, 0) = <b>(5, 3, 2)</b>. Note that it is the Allocation that is added, not the Max.',
  },
  {
    id: 'dl-cp-unsafe',
    type: 'mcq',
    prompt:
      'After P1’s request (1, 0, 2) is granted, Available = (2, 3, 0). P0 then requests (0, 2, 0); P0’s Need is (7, 4, 3). What does the Banker’s algorithm decide?',
    options: [
      'Granted: the request is within Need and within Available',
      'Error: the request exceeds P0’s maximum claim',
      'P0 waits because the resources are not available',
      'P0 waits: the resources are available, but granting them would leave an unsafe state',
    ],
    answer: 3,
    hint: 'After the pretend allocation Available would be (2, 1, 0). Which Need fits within that?',
    explanation:
      '(0, 2, 0) ≤ Need and (0, 2, 0) ≤ Available, so the system pretends to allocate: Available becomes (2, 1, 0). The remaining Needs are P0 (7, 2, 3), P1 (0, 2, 0), P2 (6, 0, 0), P3 (0, 1, 1), P4 (4, 3, 1). <b>None</b> fits within (2, 1, 0), so no process can be guaranteed to finish. The state is unsafe and the request is refused.',
  },
  {
    id: 'dl-cp-min',
    type: 'numeric',
    prompt: 'Three processes share identical instances of one resource type. Each needs at most 2 instances and requests them one at a time. What is the smallest number of instances that makes deadlock impossible?',
    answer: 4,
    unit: 'instances',
    hint: 'What is the worst case in which every process holds something and still wants more?',
    explanation:
      'The worst case is every process holding one fewer than its maximum: 3 × (2 − 1) = 3 instances held, all waiting. One more instance lets some process reach its maximum, finish and release. So <b>3 + 1 = 4</b>. In general, n processes each needing at most k cannot deadlock with n(k − 1) + 1 instances.',
  },
  {
    id: 'dl-cp-tf-cycle',
    type: 'tf',
    prompt: 'True or false: if a resource-allocation graph contains a cycle, the system is deadlocked.',
    answer: false,
    explanation:
      '<b>False.</b> A cycle is necessary for deadlock, but it is sufficient only when every resource type on it has a single instance. With several instances, a process outside the cycle may release an instance and break it. Corrected: if the graph has a cycle, a deadlock <b>may</b> exist; if it has no cycle, there is no deadlock.',
  },
  {
    id: 'dl-cp-tf-unsafe',
    type: 'tf',
    prompt: 'True or false: a system in an unsafe state is deadlocked.',
    answer: false,
    explanation:
      '<b>False.</b> An unsafe state only means that the system cannot guarantee that deadlock will be avoided. If the processes happen not to ask for their full maximum, or release resources in a lucky order, no deadlock occurs. Corrected: a system in an unsafe state <b>may</b> become deadlocked; a system in a safe state cannot be deadlocked.',
  },
  {
    id: 'dl-cp-ostrich',
    type: 'mcq',
    prompt: 'How do most general-purpose operating systems, including UNIX, deal with deadlock?',
    options: [
      'They run the Banker’s algorithm on every request',
      'They ignore the problem and pretend that deadlocks never occur, leaving it to programmers and manual recovery',
      'They deny mutual exclusion for all resources',
      'They run a detection algorithm on every resource request',
    ],
    answer: 1,
    explanation:
      'Prevention and avoidance cost utilisation or run-time overhead on every request, while deadlocks are rare. Most systems therefore <b>ignore the problem</b>; when performance degrades because of a deadlock, recovery is manual (kill a process, or reboot).',
  },
  {
    id: 'dl-cp-victim',
    type: 'mcq',
    prompt: 'When recovering by resource preemption, the same process could be chosen as the victim again and again. What is the standard remedy?',
    options: [
      'Always choose the process holding the fewest resources',
      'Include the number of rollbacks in the cost factor, so a process can be picked as victim only a finite number of times',
      'Abort every deadlocked process',
      'Disable preemption',
    ],
    answer: 1,
    explanation:
      'Victim selection minimises cost, and a cheap victim stays cheap, so it may <b>starve</b>. Counting rollbacks in the cost raises the price of choosing the same process each time. The other two issues with preemption are selecting the victim and how far to roll it back.',
  },
  {
    id: 'dl-cp-written-conditions',
    type: 'written',
    marks: 6,
    prompt: 'State the four necessary conditions for deadlock. For each, explain how deadlock prevention can deny it and one drawback of doing so.',
    points: [
      'Mutual exclusion: at least one resource is non-sharable. Cannot generally be denied, because some resources (a printer) are intrinsically non-sharable',
      'Hold and wait: a process holds at least one resource while waiting for others. Deny by requesting all resources before execution begins, or by allowing requests only when the process holds none',
      'Drawback of that: low resource utilisation, and possible starvation of a process needing several popular resources',
      'No preemption: a resource is released only voluntarily. Deny by making a process that cannot get a resource release all it holds, restarting only when it can regain them all; workable only for resources whose state can be saved and restored (CPU registers, memory), not printers or tape drives',
      'Circular wait: a closed chain of processes each waiting for a resource held by the next. Deny by a total ordering of resource types with requests in increasing order',
      'Drawback of ordering: resources may have to be requested in an order other than the one in which they are needed, lowering utilisation; overall, prevention gives low device utilisation and reduced throughput',
    ],
    modelAnswer:
      '<p>A deadlock can arise only if four conditions hold <b>simultaneously</b>. Prevention ensures that at least one cannot hold.</p><p class="mt-2"><b>1. Mutual exclusion.</b> At least one resource is non-sharable: only one process at a time can use it. <i>Denial:</i> sharable resources (read-only files) never cause deadlock, but in general this condition <b>cannot be denied</b>, because some resources such as printers are intrinsically non-sharable.</p><p class="mt-2"><b>2. Hold and wait.</b> A process holding at least one resource is waiting to acquire additional resources held by other processes. <i>Denial:</i> guarantee that a process requesting a resource holds no others. Either it requests and is allocated <b>all</b> its resources before it begins execution, or it may request resources only when it has <b>none</b>, releasing everything before asking for more. <i>Drawbacks:</i> resource utilisation is low, since resources are allocated but unused for long periods, and <b>starvation</b> is possible.</p><p class="mt-2"><b>3. No preemption.</b> A resource can be released only voluntarily by the process holding it, after that process has completed its task. <i>Denial:</i> if a process holding resources requests one that cannot be allocated immediately, all the resources it holds are released (preempted) and added to the list it is waiting for; it restarts only when it can regain them all. <i>Drawback:</i> applicable only to resources whose state can be saved and restored, such as CPU registers and memory, not to printers or tape drives.</p><p class="mt-2"><b>4. Circular wait.</b> There is a set of waiting processes P<sub>0</sub>, …, P<sub>n</sub> such that P<sub>0</sub> waits for a resource held by P<sub>1</sub>, P<sub>1</sub> for one held by P<sub>2</sub>, …, and P<sub>n</sub> for one held by P<sub>0</sub>. <i>Denial:</i> impose a <b>total ordering</b> on all resource types and require each process to request resources in increasing order. <i>Drawback:</i> the order of requests is dictated by the numbering, not by the program’s needs, so resources may be held earlier than necessary.</p><p class="mt-2">In general, prevention protocols lead to <b>low device utilisation and reduced system throughput</b>.</p>',
  },
  {
    id: 'dl-cp-written-recovery',
    type: 'written',
    marks: 5,
    prompt: 'A detection algorithm has found a deadlock. Describe the two ways of recovering automatically and the issues each raises.',
    points: [
      'Process termination: abort all deadlocked processes (simple, but expensive: all their computation is lost), or abort one at a time until the cycle is eliminated (the detection algorithm must be re-run after each abort)',
      'Choosing which process to abort: minimum cost, considering priority, how long it has computed and how much longer it needs, resources used and still needed, how many processes must be terminated, interactive or batch',
      'Aborting is not easy if the process was in the middle of updating a file or printing',
      'Resource preemption: take resources from some processes and give them to others until the deadlock is broken',
      'Three issues: selecting a victim (minimise cost), rollback (return the process to some safe state and restart it from there), starvation (the same victim chosen repeatedly; include the number of rollbacks in the cost)',
    ],
    modelAnswer:
      '<p>Besides informing the operator, the system can break a deadlock automatically in two ways.</p><p class="mt-2"><b>1. Process termination.</b></p><ul class="mt-1 list-disc space-y-1 pl-5"><li><b>Abort all deadlocked processes.</b> This certainly breaks the cycle but at great expense: the results of long computations are discarded.</li><li><b>Abort one process at a time</b> until the deadlock cycle is eliminated. This has considerable overhead, since the detection algorithm must be invoked after each abort.</li></ul><p class="mt-2">Aborting is not easy: a process may be in the middle of updating a file or printing. The order of abortion should incur minimum cost, considering the priority of the process, how long it has computed and how much longer it needs, the resources it has used and still needs, how many processes will have to be terminated, and whether it is interactive or batch.</p><p class="mt-2"><b>2. Resource preemption.</b> Resources are successively preempted from some processes and given to others until the deadlock cycle is broken. Three issues must be addressed:</p><ul class="mt-1 list-disc space-y-1 pl-5"><li><b>Selecting a victim:</b> which resources and which processes, so as to minimise cost (number of resources held, time consumed so far).</li><li><b>Rollback:</b> the preempted process cannot continue normally; it must be rolled back to some safe state and restarted from there, as far back as necessary to break the deadlock (total rollback is simplest).</li><li><b>Starvation:</b> the same process may always be picked as victim. Include the number of rollbacks in the cost factor so that it is picked only a bounded number of times.</li></ul>',
  },
];
