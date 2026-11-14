import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  validBit: {
    id: 'vm-check-validbit',
    type: 'mcq',
    prompt: 'Under demand paging, a process references a page whose valid-invalid bit is 0. The OS checks its internal table and finds the address is a legal part of the program. What happens next?',
    options: [
      'The process is terminated for an illegal memory access',
      'The page is brought in from disk and the instruction is restarted',
      'The reference is silently ignored',
      'The whole process is swapped out and back in',
    ],
    answer: 1,
    explanation:
      'With demand paging the bit 0 means either "illegal" or "legal but not in memory". The OS tells them apart using its own table. A legal page is simply fetched: find a free frame, read the page, set the bit to valid, and <b>restart the instruction</b>. Only a genuinely illegal reference aborts the process.',
  },
  eat: {
    id: 'vm-check-eat',
    type: 'numeric',
    prompt: 'Memory access takes 100 ns and servicing a page fault takes 25 ms. If one reference in every 1,000 causes a page fault, what is the effective access time, in microseconds?',
    answer: 25.1,
    tolerance: 0.11,
    unit: 'µs',
    hint: '25 ms is 25,000,000 ns. EAT = (1 − p) × 100 + p × 25,000,000, then convert ns to µs.',
    explanation:
      'EAT = 0.999 × 100 + 0.001 × 25,000,000 = 99.9 + 25,000 = 25,099.9 ns ≈ <b>25.1 µs</b>. One fault in a thousand makes memory about 250 times slower.',
  },
  belady: {
    id: 'vm-check-belady',
    type: 'tf',
    prompt: 'True or false: with any page-replacement algorithm, giving a process more frames can never increase its number of page faults.',
    answer: false,
    explanation:
      'False. FIFO can do worse with more frames: on the string 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 it takes 9 faults with 3 frames but 10 with 4. This is <b>Belady’s anomaly</b>. LRU and OPT are stack algorithms and never show it.',
  },
  lruImpl: {
    id: 'vm-check-lruimpl',
    type: 'mcq',
    prompt: 'Why do real systems approximate LRU with reference bits instead of implementing it exactly?',
    options: [
      'Exact LRU causes more page faults than FIFO',
      'Exact LRU needs knowledge of future references',
      'Exact LRU must update a counter or stack on every memory reference, which is too slow without special hardware',
      'Exact LRU suffers from Belady’s anomaly',
    ],
    answer: 2,
    explanation:
      'A counter or a stack has to be updated on <b>every single memory reference</b>. Doing that in software through an interrupt would slow each reference by roughly a factor of ten. A reference bit, set by hardware for free, gives a good enough approximation. (Needing the future is the problem with OPT, not LRU.)',
  },
  workingSet: {
    id: 'vm-check-ws',
    type: 'numeric',
    prompt: 'A process has just made the page references 1, 2, 3, 2, 1, 4, 2. With a working-set window Δ = 5, what is its working-set size now?',
    answer: 4,
    unit: 'pages',
    hint: 'Look only at the last five references and count the distinct pages.',
    explanation: 'The last five references are 3, 2, 1, 4, 2. The distinct pages are {1, 2, 3, 4}, so WSS = <b>4</b>.',
  },
  loops: {
    id: 'vm-check-loops',
    type: 'mcq',
    prompt: 'A 1024 × 1024 integer array is stored row by row, one row per page, and the process has far fewer than 1024 frames. Which loop zeroes the array with the fewest page faults?',
    options: [
      'Outer loop over columns j, inner loop over rows i',
      'Outer loop over rows i, inner loop over columns j',
      'Both cause the same number of faults',
      'It depends only on the page-replacement algorithm',
    ],
    answer: 1,
    explanation:
      'Going row by row finishes one page before moving to the next: about <b>1024 faults</b>. Going column by column touches a different page on every assignment: about 1024 × 1024 faults. Same work, a thousand times the paging, purely because of locality.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  pageSize: {
    id: 'vm-practice-pagesize',
    type: 'written',
    marks: 4,
    prompt: 'Discuss the factors that argue for a small page size and those that argue for a large page size.',
    points: [
      'Fragmentation: small pages waste less memory (less internal fragmentation), since pages are the unit of allocation',
      'Locality: small pages match the program’s locality more precisely, so less unneeded data is brought in',
      'Page-table size: large pages mean fewer pages and therefore a smaller page table',
      'I/O overhead: seek and rotation dominate disk time, so transferring fewer, larger pages minimises I/O time; large pages also increase TLB reach',
    ],
    modelAnswer:
      '<p><b>For small pages:</b> pages are the unit of allocation, so smaller pages give less internal fragmentation and better memory utilisation. They also give better <b>resolution</b>: only the memory actually needed (the true locality) is brought in.</p><p class="mt-2"><b>For large pages:</b> the page table has one entry per page, so larger pages mean a <b>smaller page table</b>. Disk I/O time is dominated by seek and latency rather than transfer, so reading one large page is far cheaper than reading several small ones, and there are fewer page faults to service. Larger pages also increase <b>TLB reach</b> (TLB size × page size).</p><p class="mt-2">There is no single best answer, which is why systems have moved towards larger pages over time and often support multiple page sizes.</p>',
  },
  restart: {
    id: 'vm-practice-restart',
    type: 'written',
    marks: 5,
    prompt: 'Demand paging requires that an instruction can be restarted after a page fault. Explain why this is difficult for some instructions and how the difficulty is solved.',
    points: [
      'A page fault can occur at any memory reference within an instruction, and after servicing it the instruction is restarted from the beginning',
      'The difficulty is with instructions that modify several locations, such as the IBM 360/370 MVC that moves up to 256 bytes with possibly overlapping source and destination',
      'If the fault occurs after part of the move, the source has been altered and the instruction cannot simply be redone',
      'Solution 1: use microcode to access both ends of both blocks first, so any fault happens before anything is modified',
      'Solution 2: hold overwritten values in temporary registers and restore memory if a fault occurs (similarly, a status register records auto-increment/decrement changes so they can be undone)',
    ],
    modelAnswer:
      '<p>A page fault may occur at <i>any</i> memory reference: fetching the instruction, fetching an operand, or storing a result. After the OS brings the page in, the process must continue as if nothing happened, which is done by <b>restarting the instruction</b>. For "add A and B into C", a fault while storing C just means fetching and adding again.</p><p class="mt-2">The difficulty arises when one instruction <b>modifies several locations</b>. The IBM 360/370 <b>MVC</b> instruction moves up to 256 bytes, and the source and destination may overlap and straddle page boundaries. If a fault occurs part-way through, some of the source has already been overwritten, so restarting gives the wrong result. Auto-increment and auto-decrement addressing modes have the same problem with registers.</p><p class="mt-2"><b>Solutions:</b> (1) microcode first touches both ends of both blocks, so if a fault is going to happen it happens before any byte is moved; (2) temporary registers hold the old values of overwritten locations so the memory state can be restored before restarting. For addressing modes, a status register records which register changed and by how much, so the OS can undo it. All of this must be transparent to the user.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'vm-cp-fifo',
    type: 'numeric',
    prompt: 'Using FIFO replacement with 3 frames (all initially empty), how many page faults does the reference string 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 cause?',
    answer: 9,
    unit: 'faults',
    hint: 'The first three references always fault. After that, the oldest page leaves each time.',
    explanation:
      'Faults occur on 1, 2, 3, 4, 1, 2, 5 (seven so far), then 1 and 2 are hits, then 3 and 4 fault, and the final 5 is a hit: <b>9 faults</b>. You can replay this in the simulator.',
  },
  {
    id: 'vm-cp-belady',
    type: 'mcq',
    prompt: 'Which of these page-replacement algorithms can suffer from Belady’s anomaly?',
    options: ['Optimal (OPT)', 'Least recently used (LRU)', 'First-in first-out (FIFO)', 'None of them'],
    answer: 2,
    explanation:
      'FIFO. With the string above it takes 9 faults with 3 frames and 10 with 4. OPT and LRU are <b>stack algorithms</b>: the set of pages in memory with n frames is always a subset of the set with n + 1 frames, so more frames can never hurt.',
  },
  {
    id: 'vm-cp-lru',
    type: 'numeric',
    prompt: 'Using LRU replacement with 4 frames, how many page faults does the reference string 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 cause?',
    answer: 8,
    unit: 'faults',
    explanation:
      '1, 2, 3, 4 fault (4). Then 1 and 2 hit. 5 faults and replaces 3, the least recently used (5). 1 and 2 hit. 3 faults, replacing 4 (6). 4 faults, replacing 5 (7). 5 faults, replacing 1 (8). Total <b>8</b>, against 6 for OPT and 10 for FIFO.',
  },
  {
    id: 'vm-cp-opt',
    type: 'numeric',
    prompt: 'Using the optimal algorithm with 3 frames, how many page faults does the string 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1 cause?',
    answer: 9,
    unit: 'faults',
    hint: 'At each fault, evict the page whose next use lies farthest in the future.',
    explanation:
      'OPT faults on 7, 0, 1, then 2 (evict 7), 3 (evict 1), 4 (evict 0), 0 (evict 4), 1 (evict 3), 7 (evict 2): <b>9 faults</b>. On the same string LRU takes 12 and FIFO takes 15.',
  },
  {
    id: 'vm-cp-eat',
    type: 'numeric',
    prompt: 'Memory access takes 200 ns and a page fault takes 8 ms to service. What is the largest page-fault probability p (as "one fault in every N references") that keeps the effective access time at or below 220 ns? Give N.',
    answer: 400000,
    tolerance: 10,
    unit: 'references',
    hint: 'Solve 220 ≥ (1 − p) × 200 + p × 8,000,000 for p, then N = 1/p.',
    explanation:
      '220 ≥ 200 + p × (8,000,000 − 200), so p ≤ 20 ÷ 7,999,800 ≈ 2.5 × 10<sup>−6</sup>. That is one fault in about <b>400,000</b> references.',
  },
  {
    id: 'vm-cp-enhanced',
    type: 'mcq',
    prompt: 'The enhanced second-chance algorithm classifies pages by the pair (reference bit, modify bit). Which class is the best page to replace?',
    options: ['(0, 0)', '(0, 1)', '(1, 0)', '(1, 1)'],
    answer: 0,
    explanation:
      '<b>(0, 0)</b>: neither recently used nor modified, so it is unlikely to be needed soon and does not need writing to disk. (0, 1) is next but costs a write; (1, 0) and (1, 1) were used recently and will probably be used again.',
  },
  {
    id: 'vm-cp-remedies',
    type: 'multi',
    prompt: 'A system is thrashing. Which of these actions help?',
    options: [
      'Suspend one or more processes and give their frames to the others',
      'Admit more processes to raise CPU utilisation',
      'Allocate frames according to each process’s working set',
      'Give a frame to any process whose page-fault frequency exceeds an upper bound',
    ],
    answers: [0, 2, 3],
    explanation:
      'Thrashing means the active localities do not fit in memory. Reducing the degree of multiprogramming, or sizing allocations by working set or page-fault frequency, fixes that. Admitting more processes is exactly the mistake that causes thrashing in the first place.',
  },
  {
    id: 'vm-cp-cow',
    type: 'tf',
    prompt: 'True or false: with copy-on-write, a child process created by fork() gets its own private copy of every page of the parent at the moment it is created.',
    answer: false,
    explanation:
      'False. Parent and child initially <b>share</b> the same pages, marked copy-on-write. A page is copied only when one of them tries to modify it. This makes process creation much cheaper, especially when the child immediately calls exec().',
  },
  {
    id: 'vm-cp-thrashing',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'What is the cause of thrashing? How does the system detect thrashing? Once it detects thrashing, what can the system do to eliminate the problem?',
    points: [
      'Thrashing is a state of very high paging activity where processes spend more time paging than executing',
      'Cause: processes do not have enough frames for their current locality (sum of working sets exceeds available memory), typically because the degree of multiprogramming is too high',
      'It feeds itself: low CPU utilisation makes the OS admit more processes, and with global replacement faulting processes steal frames from each other',
      'Detection: compare CPU utilisation with the degree of multiprogramming (utilisation falls as it rises), or observe a high page-fault rate',
      'Elimination: reduce the degree of multiprogramming by suspending (swapping out) processes',
      'Prevention: working-set model (suspend a process when D > m) or page-fault frequency control with upper and lower bounds',
    ],
    modelAnswer:
      '<p><b>Cause.</b> Thrashing is very high paging activity: a process spends more time swapping pages in and out than executing. It happens when a process does not have as many frames as it has pages in active use, that is, when the total size of the localities exceeds available memory. The usual trigger is over-commitment: the OS sees low CPU utilisation and <i>increases</i> the degree of multiprogramming. A process entering a new phase starts faulting and, under global replacement, takes frames from others, which then fault too. Processes queue at the paging device, the ready queue empties, CPU utilisation drops further, and the OS admits still more processes.</p><p class="mt-2"><b>Detection.</b> The OS monitors CPU utilisation against the degree of multiprogramming. If utilisation falls sharply while multiprogramming increases, and the page-fault rate is high, the system is thrashing.</p><p class="mt-2"><b>Elimination.</b> Decrease the degree of multiprogramming: suspend one or more processes, swap them out, and distribute their frames. To prevent recurrence, give each process as many frames as it needs using the <b>working-set model</b> (track WSS<sub>i</sub>; if D = ΣWSS<sub>i</sub> exceeds m, suspend a process) or <b>page-fault frequency</b> control (if a process’s fault rate exceeds an upper bound give it a frame; below a lower bound take one away; if no frames are free, suspend a process).</p>',
  },
  {
    id: 'vm-cp-global-local',
    type: 'written',
    marks: 4,
    prompt: 'Compare global and local page replacement. Which generally gives better system throughput, and why?',
    points: [
      'Global: a process selects a victim from the set of all frames, so it can take a frame from another process',
      'Local: a process selects a victim only from its own allocated frames, so its number of frames does not change',
      'Local isolates a process’s paging behaviour from others, but may leave less-used frames of other processes unavailable',
      'Global generally gives better throughput because frames flow to the processes that need them, at the cost that a process cannot control its own fault rate; it is the common choice in practice',
    ],
    modelAnswer:
      '<p>With <b>global replacement</b>, a faulting process may choose a victim frame from <i>all</i> frames in the system, including those of other processes. With <b>local replacement</b>, it chooses only among its own frames, so the number of frames allocated to it stays fixed.</p><p class="mt-2">Local replacement makes a process’s performance depend only on its own paging behaviour, but it can hinder a process by denying it frames that other processes are barely using. Under global replacement, memory moves to wherever it is needed, so otherwise idle frames get used and <b>system throughput is generally better</b>; high-priority processes can also take frames from low-priority ones. The drawback is that a process cannot control its own page-fault rate, because it also depends on the behaviour of others, and it opens the door to thrashing. In practice global replacement is the more common method.</p>',
  },
];
