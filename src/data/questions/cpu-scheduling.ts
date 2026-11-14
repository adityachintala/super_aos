import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  preemptive: {
    id: 'cs-check-preemptive',
    type: 'mcq',
    prompt: 'A scheduling decision is made when a process switches from the running state to the ready state because of a timer interrupt. What does that tell you about the scheduler?',
    options: ['It is non-preemptive', 'It is preemptive', 'It is a long-term scheduler', 'Nothing: all schedulers do this'],
    answer: 1,
    explanation:
      'Under <b>non-preemptive</b> scheduling a process keeps the CPU until it releases it, by terminating or by switching to the waiting state. Taking the CPU away from a running process that could have continued (running → ready on an interrupt, or waiting → ready when an I/O completes) is <b>preemptive</b> scheduling.',
  },
  fcfs: {
    id: 'cs-check-fcfs',
    type: 'numeric',
    prompt: 'Three processes arrive at time 0 in the order P1, P2, P3 with CPU bursts of 24, 3 and 3 ms. Under FCFS, what is the average waiting time?',
    answer: 17,
    unit: 'ms',
    explanation: 'P1 waits 0, P2 waits 24, P3 waits 27. Average = (0 + 24 + 27) ÷ 3 = <b>17 ms</b>. Had they arrived in the order P2, P3, P1 the average would be (0 + 3 + 6) ÷ 3 = 3 ms.',
  },
  sjf: {
    id: 'cs-check-sjf',
    type: 'numeric',
    prompt: 'Four processes arrive at time 0 with CPU bursts of 6, 8, 7 and 3 ms. Under SJF, what is the average waiting time?',
    answer: 7,
    unit: 'ms',
    hint: 'Run them shortest first: 3, 6, 7, 8.',
    explanation: 'The order is P4 (3), P1 (6), P3 (7), P2 (8). Waiting times are 0, 3, 9 and 16, so the average is 28 ÷ 4 = <b>7 ms</b>. FCFS in the given order would give 10.25 ms.',
  },
  exp: {
    id: 'cs-check-exp',
    type: 'numeric',
    prompt: 'A scheduler predicts CPU bursts by exponential averaging with α = 0.5. Its current prediction is 10 ms and the burst that actually follows lasts 6 ms. What is the next prediction?',
    answer: 8,
    unit: 'ms',
    explanation: 'τ<sub>n+1</sub> = α t<sub>n</sub> + (1 − α) τ<sub>n</sub> = 0.5 × 6 + 0.5 × 10 = <b>8 ms</b>.',
  },
  rr: {
    id: 'cs-check-rr',
    type: 'numeric',
    prompt: 'Five processes are in the ready queue under round-robin scheduling with a time quantum of 20 ms. What is the longest any process waits before it next gets the CPU?',
    answer: 80,
    unit: 'ms',
    hint: 'No process waits more than (n − 1) × q.',
    explanation: 'With n processes and quantum q, each gets 1/n of the CPU in chunks of at most q, and none waits more than (n − 1) × q = 4 × 20 = <b>80 ms</b>.',
  },
  aging: {
    id: 'cs-check-aging',
    type: 'mcq',
    prompt: 'On a heavily loaded system, a steady stream of high-priority processes keeps a low-priority process from ever getting the CPU. What is the standard remedy?',
    options: ['Increase the time quantum', 'Aging: gradually increase the priority of processes that wait a long time', 'Switch to non-preemptive priority scheduling', 'Suspend the low-priority process'],
    answer: 1,
    explanation:
      'The problem is <b>indefinite blocking</b>, or <b>starvation</b>. The solution is <b>aging</b>: as time progresses, the priority of a waiting process is increased, so that eventually even a process that started with the lowest priority has the highest and gets to run.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  favour: {
    id: 'cs-practice-favour',
    type: 'written',
    pastPaper: true,
    marks: 4,
    prompt: 'Suppose a CPU scheduling algorithm favours those programs that have used little processor time in the recent past. Explain why this algorithm favours I/O-bound processes and yet does not permanently deny processor time to CPU-bound processes.',
    points: [
      'An I/O-bound process has short CPU bursts: it uses the CPU briefly and then waits for I/O, so it has used little processor time in the recent past',
      'It therefore keeps a high priority and is selected whenever it becomes ready: the algorithm favours it',
      'A CPU-bound process uses a lot of CPU when it runs, so its recent usage is high and its priority drops',
      'But it is not starved: I/O-bound processes relinquish the CPU often to do their I/O, leaving the CPU free; and while the CPU-bound process waits, its recent usage decays, so its priority rises again until it is selected',
    ],
    modelAnswer:
      '<p>An <b>I/O-bound process</b> spends most of its time waiting for I/O and has <b>short CPU bursts</b>. Each time it becomes ready it has, by definition, used <b>little processor time in the recent past</b>, so the algorithm gives it priority. It runs briefly and blocks again for its next I/O. The algorithm therefore <b>favours I/O-bound programs</b>, which is desirable: they get good response time and keep the I/O devices busy.</p><p class="mt-2">A <b>CPU-bound process</b>, once given the processor, uses it for a long time, so its recent usage is high and it is not favoured. It is nevertheless <b>not permanently denied</b> the processor, for two reasons. First, the I/O-bound programs <b>relinquish the CPU relatively often</b> to do their I/O, and whenever they are all waiting, the CPU is free for the CPU-bound process. Second, the measure is of <i>recent</i> usage: while the CPU-bound process sits in the ready queue it uses no processor time, so its recent usage <b>decays</b> and it eventually counts as a program that has used little processor time, at which point it is selected. In effect the algorithm has built-in <b>aging</b>. (A multilevel feedback queue, and exponential averaging of burst lengths, behave in exactly this way.)</p>',
  },
  multimedia: {
    id: 'cs-practice-multimedia',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Define the term "quality of service". Discuss what techniques could be used to meet quality-of-service requirements for multimedia applications in the following components of a system: (a) the process scheduler, (b) the disk scheduler, (c) the memory manager.',
    points: [
      'Quality of service: guarantees about timing and rate that continuous-media (multimedia) data must be delivered with - throughput, delay, jitter and reliability - rather than best effort',
      'Admission control underlies all three: a request is accepted only if the resources to meet its QoS can be reserved; otherwise it is rejected',
      '(a) Process scheduler: real-time scheduling. Give real-time processes high, static priorities that are not aged down; use preemption with short dispatch latency; use deadline-based algorithms such as rate-monotonic or earliest-deadline-first',
      '(b) Disk scheduler: schedule requests by deadline (EDF), usually combined with seek optimisation as in SCAN-EDF, so that rate and timing requirements are met',
      '(c) Memory manager: avoid page faults for the media process, by not paging out (locking/pinning) its pages and reserving enough frames and buffer space',
      'In each case resources are reserved in advance by a resource manager rather than allocated on demand',
    ],
    modelAnswer:
      '<p><b>Quality of service (QoS)</b> is the set of requirements that an application places on the system for the delivery of its data, and the guarantees the system gives in return. Continuous media such as audio and video must be delivered at a specific <b>rate</b> and with specific <b>timing</b>: the relevant parameters are throughput, delay, jitter and reliability. A best-effort system makes no such promises; a system with QoS must be able to guarantee them, which it does by <b>admission control</b>: a request arrives with its QoS requirement, each resource manager checks whether it can reserve what is needed, and the request is accepted only if it can.</p><p class="mt-2"><b>(a) Process scheduler.</b> Use <b>real-time CPU scheduling</b>. Real-time processes are given the <b>highest priorities, and those priorities are static</b>: they do not degrade over time as they do for ordinary time-shared processes. The kernel must be <b>preemptive</b> with small interrupt and dispatch latency, so that a media process runs as soon as it becomes ready. Critical tasks can be scheduled by deadline, with <b>rate-monotonic</b> or <b>earliest-deadline-first</b> scheduling.</p><p class="mt-2"><b>(b) Disk scheduler.</b> Ordinary disk scheduling optimises seek time and ignores timing. For multimedia, requests carry deadlines and the scheduler must meet them: <b>earliest-deadline-first</b> ordering of requests, in practice combined with seek optimisation (<b>SCAN-EDF</b>: serve in deadline order, and batch requests with the same or close deadlines in SCAN order).</p><p class="mt-2"><b>(c) Memory manager.</b> A page fault in the middle of playback would make the process miss its deadlines. The memory manager should therefore <b>reserve sufficient frames</b> for the application and <b>keep its pages in memory</b> (lock or pin them so that they are not selected for replacement), and reserve buffer space for the media stream.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'cs-cp-criteria',
    type: 'mcq',
    prompt: 'Which scheduling criterion matters most to the user of an interactive system?',
    options: ['Throughput', 'CPU utilisation', 'Response time', 'Turnaround time'],
    answer: 2,
    explanation:
      '<b>Response time</b>: the time from the submission of a request until the first response is produced, not the time to output the whole response. In an interactive system it is more important to minimise the variance in response time than the average. Turnaround time suits batch work; utilisation and throughput are the system’s concerns.',
  },
  {
    id: 'cs-cp-sjf-arrivals',
    type: 'numeric',
    prompt: 'Processes P1 to P4 arrive at times 0, 2, 4 and 5 with bursts of 7, 4, 1 and 4 ms. Under <b>non-preemptive</b> SJF, what is the average waiting time?',
    answer: 4,
    unit: 'ms',
    hint: 'At time 0 only P1 has arrived, so it runs to completion at 7. Who is waiting then?',
    explanation: 'P1 runs 0–7. At 7 all have arrived: P3 (1) runs 7–8, P2 (4) runs 8–12, P4 (4) runs 12–16. Waiting times: P1 0, P2 6, P3 3, P4 7. Average = 16 ÷ 4 = <b>4 ms</b>.',
  },
  {
    id: 'cs-cp-srtf',
    type: 'numeric',
    prompt: 'For the same processes (arrivals 0, 2, 4, 5; bursts 7, 4, 1, 4), what is the average waiting time under <b>preemptive</b> SJF (shortest remaining time first)?',
    answer: 3,
    unit: 'ms',
    explanation: 'Gantt chart: P1 0–2, P2 2–4, P3 4–5, P2 5–7, P4 7–11, P1 11–16. Waiting times: P1 9, P2 1, P3 0, P4 2. Average = 12 ÷ 4 = <b>3 ms</b>. Preemption lets short jobs that arrive later jump ahead.',
  },
  {
    id: 'cs-cp-rr',
    type: 'numeric',
    prompt: 'Four processes arrive at time 0 with bursts of 53, 17, 68 and 24 ms. Under round robin with a quantum of 20 ms, at what time does P1 complete?',
    answer: 134,
    unit: 'ms',
    hint: 'Draw the Gantt chart: P1, P2, P3, P4, P1, P3, P4, P1, P3, P3.',
    explanation: 'P1 0–20, P2 20–37, P3 37–57, P4 57–77, P1 77–97, P3 97–117, P4 117–121, P1 121–134, then P3 to 162. P1 finishes at <b>134</b>. RR typically has higher average turnaround than SJF but better response.',
  },
  {
    id: 'cs-cp-quantum',
    type: 'mcq',
    prompt: 'What happens to round-robin scheduling if the time quantum is made extremely large?',
    options: [
      'It becomes the same as SJF',
      'It becomes the same as FCFS',
      'Context-switch overhead dominates',
      'Every process starves',
    ],
    answer: 1,
    explanation:
      'If the quantum is larger than every CPU burst, no process is ever preempted, so processes simply run in arrival order: <b>FCFS</b>. If the quantum is extremely small there are very many context switches and the overhead becomes too high. A rule of thumb is that 80% of CPU bursts should be shorter than the quantum.',
  },
  {
    id: 'cs-cp-mlfq',
    type: 'mcq',
    prompt: 'In a multilevel feedback queue with queues Q0 (quantum 8), Q1 (quantum 16) and Q2 (FCFS), what happens to a process that does not finish within its 8 ms in Q0?',
    options: [
      'It goes to the back of Q0',
      'It is moved to Q1',
      'It is moved straight to Q2',
      'It is terminated',
    ],
    answer: 1,
    explanation:
      'A process that uses its whole quantum is assumed to be CPU-bound and is <b>demoted</b> to the next queue, <b>Q1</b>, where it gets 16 more milliseconds when Q0 is empty. If it still has not finished it is moved to Q2. Short, interactive and I/O-bound processes finish (or block) in the top queue and so get priority.',
  },
  {
    id: 'cs-cp-affinity',
    type: 'mcq',
    prompt: 'Why do multiprocessor schedulers try to keep a process running on the same processor (processor affinity)?',
    options: [
      'Processes are licensed per processor',
      'The contents of that processor’s cache are populated with the process’s recent data; migrating means invalidating and refilling caches',
      'A process cannot be moved once it has started',
      'It evens out the load between processors',
    ],
    answer: 1,
    explanation:
      'The data most recently accessed by a process populates the <b>cache</b> of the processor it ran on. If the process migrates, that cache content must be invalidated and the new processor’s cache repopulated, which is costly. So schedulers try to avoid migration (<b>soft affinity</b>) or allow a process to forbid it (<b>hard affinity</b>). Load balancing pulls the other way.',
  },
  {
    id: 'cs-cp-rm',
    type: 'multi',
    prompt: 'Two periodic real-time tasks have periods 50 and 80 and CPU bursts 25 and 35. Which statements are correct?',
    options: [
      'Total CPU utilisation is about 94%',
      'Rate-monotonic scheduling is guaranteed to meet all deadlines',
      'Rate-monotonic scheduling gives the task with period 50 the higher priority',
      'Earliest-deadline-first scheduling can meet all deadlines',
    ],
    answers: [0, 2, 3],
    explanation:
      'Utilisation is 25/50 + 35/80 = 0.94. Rate monotonic assigns priority by the inverse of the period, so the period-50 task is higher; but its guarantee holds only up to 2(2<sup>1/2</sup> − 1) ≈ 83%, and here the second task misses its deadline at time 80. <b>EDF</b> is optimal: it can schedule any task set whose utilisation is at most 100%.',
  },
  {
    id: 'cs-cp-compare',
    type: 'written',
    marks: 6,
    prompt: 'Compare the FCFS, SJF, priority and round-robin scheduling algorithms. For each, state how it selects the next process and give one advantage and one disadvantage.',
    points: [
      'FCFS: the process that requests the CPU first is allocated it first (a FIFO queue); simple and fair in arrival order',
      'FCFS disadvantage: average waiting time is often long and depends on arrival order - the convoy effect, where short processes wait behind a long one; non-preemptive, so unsuitable for time sharing',
      'SJF: selects the process with the shortest next CPU burst; provably gives the minimum average waiting time; disadvantage: the length of the next burst is not known and must be predicted, and long processes may starve',
      'Priority: selects the process with the highest priority (SJF is a special case); lets important work go first; disadvantage: starvation of low-priority processes, cured by aging',
      'Round robin: FCFS with preemption - each process gets a time quantum and then goes to the tail of the ready queue; gives good response time and no starvation',
      'Round robin disadvantage: higher average turnaround than SJF and overhead from context switches; performance depends heavily on the size of the quantum',
    ],
    modelAnswer:
      '<p><b>First-come, first-served (FCFS).</b> The process that requests the CPU first is allocated the CPU first; the ready queue is a FIFO queue. <i>Advantage:</i> very simple to write and understand. <i>Disadvantage:</i> the average waiting time is often long and varies greatly with arrival order. With bursts 24, 3, 3 the average wait is 17 ms in one order and 3 ms in another. Short processes stuck behind a long one form a <b>convoy</b>, lowering CPU and device utilisation. It is non-preemptive, so troublesome for time-sharing systems.</p><p class="mt-2"><b>Shortest-job-first (SJF).</b> Associates with each process the length of its next CPU burst and assigns the CPU to the process with the smallest. It may be non-preemptive, or preemptive (shortest-remaining-time-first). <i>Advantage:</i> it is <b>provably optimal</b>: it gives the minimum average waiting time for a given set of processes. <i>Disadvantage:</i> there is <b>no way to know the length of the next CPU burst</b>; it can only be predicted, for example by exponential averaging of previous bursts. Long processes may starve.</p><p class="mt-2"><b>Priority scheduling.</b> A priority is associated with each process and the CPU is allocated to the process with the highest priority; SJF is the special case where priority is the inverse of the predicted burst. <i>Advantage:</i> important or urgent work is served first. <i>Disadvantage:</i> <b>starvation</b>: low-priority processes may never execute. The solution is <b>aging</b>, gradually increasing the priority of processes that wait a long time.</p><p class="mt-2"><b>Round robin (RR).</b> Designed for time sharing: FCFS with preemption. Each process gets a small unit of CPU time, a <b>time quantum</b>; when it expires the process is preempted and added to the tail of the ready queue. <i>Advantage:</i> good <b>response time</b> and no starvation: with n processes and quantum q, none waits more than (n − 1)q. <i>Disadvantage:</i> average turnaround is typically higher than SJF, and performance depends on the quantum: too large and RR degenerates to FCFS, too small and context-switch overhead is too high.</p>',
  },
  {
    id: 'cs-cp-mlfq-written',
    type: 'written',
    marks: 5,
    prompt: 'What is a multilevel feedback queue scheduler? What parameters define one, and what problem of the plain multilevel queue does it solve?',
    points: [
      'A multilevel queue partitions the ready queue into several separate queues (for example foreground and background), each with its own scheduling algorithm, with scheduling between the queues (fixed priority or time slices)',
      'In a plain multilevel queue a process is permanently assigned to one queue, which is inflexible and can starve the lower queues',
      'A multilevel feedback queue allows a process to move between queues: a process that uses too much CPU time is moved to a lower-priority queue, and one that waits too long in a lower queue may be moved up (aging)',
      'This separates processes by their CPU-burst behaviour, leaving I/O-bound and interactive processes in the higher-priority queues, and prevents starvation',
      'Parameters: the number of queues; the scheduling algorithm for each queue; the method used to decide when to upgrade a process, when to demote it, and which queue a process enters when it needs service',
    ],
    modelAnswer:
      '<p>A <b>multilevel queue</b> scheduler partitions the ready queue into several separate queues, for example <i>foreground</i> (interactive) and <i>background</i> (batch). Each queue has its own scheduling algorithm (say RR for foreground and FCFS for background), and there must also be scheduling among the queues: fixed-priority preemptive scheduling, or a time slice for each queue (80% to foreground, 20% to background). In the plain scheme processes are <b>permanently assigned</b> to a queue when they enter the system. That has low overhead but is <b>inflexible</b>, and with fixed priorities the lower queues may <b>starve</b>.</p><p class="mt-2">A <b>multilevel feedback queue</b> scheduler <b>allows a process to move between queues</b>. The idea is to separate processes according to the characteristics of their CPU bursts. If a process <b>uses too much CPU time, it is moved to a lower-priority queue</b>; this leaves I/O-bound and interactive processes in the higher-priority queues. A process that <b>waits too long in a lower-priority queue may be moved to a higher-priority queue</b>; this form of <b>aging</b> prevents starvation.</p><p class="mt-2">Example: three queues, Q0 with quantum 8 ms, Q1 with quantum 16 ms, Q2 FCFS. A new job enters Q0. If it does not finish in 8 ms it is moved to Q1, where it receives 16 more; if it still does not complete it is preempted and moved to Q2. Processes in Q1 run only when Q0 is empty.</p><p class="mt-2">A multilevel feedback queue scheduler is defined by: the <b>number of queues</b>; the <b>scheduling algorithm for each queue</b>; the method used to determine <b>when to upgrade</b> a process; the method used to determine <b>when to demote</b> a process; and the method used to determine <b>which queue a process will enter</b> when it needs service. It is the most general CPU-scheduling algorithm, and also the most complex to configure.</p>',
  },
];
