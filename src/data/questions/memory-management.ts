import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  binding: {
    id: 'mm-check-binding',
    type: 'mcq',
    prompt: 'A program is compiled into absolute code that only works if it is loaded at address 4000. If the OS wants to load it somewhere else, what must happen?',
    options: ['Nothing, the loader adjusts the addresses', 'The program must be recompiled', 'The MMU relocates it at run time', 'The program must be swapped out first'],
    answer: 1,
    explanation:
      'This is <b>compile-time binding</b>: the final addresses are baked into the code, so a different starting location means recompiling. Load-time binding would only need a reload, and execution-time binding needs neither.',
  },
  privileged: {
    id: 'mm-check-privileged',
    type: 'tf',
    prompt: 'True or false: a user program is allowed to change the base and limit registers, as long as it only makes its own region smaller.',
    answer: false,
    explanation:
      'False. Loading the base and limit registers is a <b>privileged instruction</b>, executable only in kernel (monitor) mode. If user code could load them at all, it could just as easily widen its range and read or overwrite other processes and the OS.',
  },
  fragmentation: {
    id: 'mm-check-fragmentation',
    type: 'mcq',
    prompt: 'A process asks for 18,462 bytes. The allocator hands it a whole 18,464-byte hole rather than keep track of a 2-byte leftover. The 2 wasted bytes are an example of:',
    options: ['External fragmentation', 'Internal fragmentation', 'Compaction', 'Thrashing'],
    answer: 1,
    explanation:
      'The waste is <b>inside</b> an allocated partition, so it is internal fragmentation. External fragmentation is free memory <i>between</i> partitions that is too chopped up to use.',
  },
  pageBits: {
    id: 'mm-check-pagebits',
    type: 'numeric',
    prompt: 'A system has 16-bit logical addresses and a page size of 1K (1024 bytes). How many bits of each address are the page number?',
    answer: 6,
    unit: 'bits',
    hint: 'First find how many bits the offset needs: 1024 = 2<sup>?</sup>.',
    explanation: '1024 = 2<sup>10</sup>, so the offset takes 10 bits. That leaves 16 − 10 = <b>6 bits</b> for the page number, giving 2<sup>6</sup> = 64 pages.',
  },
  eat: {
    id: 'mm-check-eat',
    type: 'numeric',
    prompt: 'A TLB lookup takes 20 ns, a memory access takes 100 ns, and the TLB hit ratio is 80%. What is the effective access time?',
    answer: 140,
    tolerance: 0.5,
    unit: 'ns',
    hint: 'A hit costs 20 + 100. A miss costs 20 + 100 (page table) + 100 (the data).',
    explanation: '0.80 × 120 + 0.20 × 220 = 96 + 44 = <b>140 ns</b>, a 40% slowdown compared with the bare 100 ns access.',
  },
  segVsPage: {
    id: 'mm-check-segvspage',
    type: 'mcq',
    prompt: 'Which scheme can still suffer from external fragmentation?',
    options: ['Pure paging', 'Pure segmentation', 'Paged segmentation as in MULTICS', 'None of them'],
    answer: 1,
    explanation:
      'Segments are variable-length, so placing them is the same dynamic storage-allocation problem as contiguous allocation, holes and all. Paging uses fixed-size frames, so any free frame fits any page; MULTICS paged its segments to get the same benefit.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  inverted: {
    id: 'mm-practice-inverted',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Discuss the positive and negative aspects of the inverted page table approach.',
    points: [
      'One entry per physical frame (not per virtual page), so the table size depends on physical memory, not on the size of the virtual address space',
      'Only one table for the whole system instead of one per process, which makes it practical for 64-bit address spaces',
      'Each entry records ⟨process id, page number⟩, and a lookup means searching for a match rather than indexing',
      'Search is slow, so a hash table is used, which adds a memory reference (the TLB hides most of this)',
      'Shared pages are hard: a frame has one entry, so it cannot easily map to several virtual addresses',
      'It has no information about pages that are not in memory, so a per-process external table is still needed for demand paging',
    ],
    modelAnswer:
      '<p>A conventional page table has one entry per <i>virtual</i> page, per process, so with large address spaces the tables become enormous. An inverted page table instead has <b>one entry per physical frame</b>, holding ⟨process id, page number⟩ of the page stored there. There is a single table for the whole system.</p><p class="mt-2"><b>Positives:</b> the memory used for page tables is small and proportional to physical memory, independent of how large or how many the virtual address spaces are. This is why it suits 64-bit architectures (used in 64-bit UltraSPARC and PowerPC).</p><p class="mt-2"><b>Negatives:</b> the table is ordered by physical address but lookups come by virtual address, so a reference requires a <b>search</b> for ⟨pid, p⟩. A hash table limits the search to one or a few entries, but adds an extra memory reference per lookup. <b>Sharing</b> is awkward because each frame has exactly one ⟨pid, page⟩ entry. And because the table only describes pages in memory, the OS still needs a separate per-process table to locate pages on disk.</p>',
  },
  loading: {
    id: 'mm-practice-loading',
    type: 'written',
    marks: 4,
    prompt: 'Distinguish between dynamic loading and dynamic linking. Which of them needs help from the operating system?',
    points: [
      'Dynamic loading: a routine is not loaded into memory until it is first called',
      'Dynamic loading saves memory for rarely used code and is implemented by the program itself, with no special OS support',
      'Dynamic linking: linking with library routines is postponed until execution time, using a stub that locates the memory-resident routine',
      'Dynamic linking needs OS support (to check and share the routine across processes) and lets libraries be shared and updated without relinking',
    ],
    modelAnswer:
      '<p><b>Dynamic loading</b> keeps routines on disk in relocatable format and loads one only when it is first called. Unused routines (for example rare error handlers) never occupy memory. It is achieved through program design and needs no special OS support.</p><p class="mt-2"><b>Dynamic linking</b> postpones <i>linking</i> to run time. The executable contains a small <b>stub</b> for each library routine; on first call the stub finds the routine in memory (loading the library if needed), replaces itself with the routine’s address and jumps to it. One copy of the library is shared by all processes and can be updated without relinking programs. Because the routine may live in memory shared between protected processes, this <b>requires OS support</b>.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'mm-cp-compaction-binding',
    type: 'mcq',
    prompt: 'Compaction moves processes around in memory while they are alive. Which address-binding scheme makes that possible?',
    options: ['Compile-time binding', 'Load-time binding', 'Execution-time binding', 'Any of the three'],
    answer: 2,
    explanation:
      'Only with <b>execution-time binding</b> are addresses translated on every reference (through a relocation register or page table), so a process can be moved by simply updating the mapping. With compile-time or load-time binding the physical addresses are fixed inside the loaded code.',
  },
  {
    id: 'mm-cp-paging-fragmentation',
    type: 'tf',
    prompt: 'True or false: paging eliminates external fragmentation but can still cause internal fragmentation.',
    answer: true,
    explanation:
      'True. Every free frame can hold any page, so no free memory is ever unusable for being the wrong size. But a process rarely fills its last page exactly, so on average about half a page per process is wasted inside the last frame.',
  },
  {
    id: 'mm-cp-translate',
    type: 'numeric',
    prompt: 'Page size is 4 bytes. The page table maps page 0 → frame 5, page 1 → frame 6, page 2 → frame 1, page 3 → frame 2. Which physical address does logical address 13 map to?',
    answer: 9,
    hint: 'Divide 13 by the page size to get the page number and the offset.',
    explanation: '13 ÷ 4 = page 3, offset 1. Page 3 is in frame 2, so the physical address is 2 × 4 + 1 = <b>9</b>.',
  },
  {
    id: 'mm-cp-eat',
    type: 'numeric',
    prompt: 'A TLB lookup takes 10 ns and a memory access takes 100 ns. With a 90% TLB hit ratio and a single-level page table, what is the effective access time?',
    answer: 120,
    tolerance: 0.5,
    unit: 'ns',
    explanation: 'Hit: 10 + 100 = 110 ns. Miss: 10 + 100 + 100 = 210 ns. EAT = 0.9 × 110 + 0.1 × 210 = 99 + 21 = <b>120 ns</b>.',
  },
  {
    id: 'mm-cp-fit',
    type: 'mcq',
    pastPaper: true,
    prompt: 'Memory has holes of 100K, 500K, 200K, 300K and 600K, in that order. Processes of 212K, 417K, 112K and 426K arrive in that order. Which placement algorithm manages to place all four?',
    options: ['First fit', 'Best fit', 'Worst fit', 'None of them'],
    answer: 1,
    hint: 'Remember that a hole is split: the leftover becomes a new, smaller hole that later requests can use.',
    explanation:
      '<b>Best fit</b>: 212 → 300, 417 → 500, 112 → 200, 426 → 600. All placed.<br><b>First fit</b>: 212 → 500 (leaves 288), 417 → 600 (leaves 183), 112 → the 288 leftover, then 426 has no hole big enough.<br><b>Worst fit</b>: 212 → 600 (leaves 388), 417 → 500, 112 → the 388 leftover, then 426 must wait.<br>Here best fit uses memory most efficiently. You can replay this in the simulator above.',
  },
  {
    id: 'mm-cp-levels',
    type: 'numeric',
    pastPaper: true,
    prompt: 'Pages are 4K bytes and a page-table entry takes 4 bytes. How many levels of page table are needed to map a 64-bit address space, if the top-level table must fit in a single page?',
    answer: 6,
    unit: 'levels',
    hint: 'How many entries fit in one page? That is how many bits one level can translate.',
    explanation:
      'Offset: 4K = 2<sup>12</sup> → 12 bits. One page holds 4096 ÷ 4 = 2<sup>10</sup> entries, so each level translates 10 bits. Page-number bits: 64 − 12 = 52. Levels: ⌈52 ÷ 10⌉ = <b>6</b> (five levels would only cover 12 + 50 = 62 bits).',
  },
  {
    id: 'mm-cp-inverted',
    type: 'multi',
    prompt: 'Which statements about an inverted page table are correct?',
    options: [
      'It has one entry for each physical frame',
      'There is one table for the whole system, not one per process',
      'It makes sharing a page between processes simpler',
      'Without hashing, a lookup has to search the table',
    ],
    answers: [0, 1, 3],
    explanation:
      'An inverted table is indexed by frame and stores ⟨process id, page number⟩, so its size follows physical memory and one table serves everyone. Lookups arrive by virtual address, so they need a search (sped up by hashing). Sharing gets <i>harder</i>, because a frame has room for only one ⟨pid, page⟩ pair.',
  },
  {
    id: 'mm-cp-segment',
    type: 'numeric',
    prompt: 'A segment table has segment 2 with base 4300 and limit 400. What physical address does the logical address ⟨2, 53⟩ refer to?',
    answer: 4353,
    explanation: 'The offset 53 is less than the limit 400, so the reference is legal, and the physical address is base + offset = 4300 + 53 = <b>4353</b>. An offset of 400 or more would trap to the OS.',
  },
  {
    id: 'mm-cp-swap-io',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Explain the problems that arise if you swap out a process with pending I/O. How can they be solved?',
    points: [
      'A process should be idle to be swapped; pending I/O means a device will still read from or write to the process’s memory',
      'If I/O goes directly into the process’s own buffers and it is swapped out, the I/O ends up using memory that now belongs to another process',
      'Solution 1: never swap a process with pending I/O (keep it latched in memory)',
      'Solution 2: do I/O only into operating-system buffers',
      'With OS buffers, data is copied between the OS buffer and the process only when the process is swapped in, which costs extra copying',
    ],
    modelAnswer:
      '<p>Swapping removes a whole process image from memory, and the freed memory is given to another process. If the swapped process had <b>pending I/O</b> that transfers data directly to or from its own address space (for example an asynchronous read into a user buffer), the device would complete the operation later and write into memory that <b>now belongs to a different process</b>, corrupting it.</p><p class="mt-2">Two solutions: (1) <b>never swap a process with pending I/O</b>, which is restrictive and hard when I/O is asynchronous; or (2) <b>perform I/O only into operating-system buffers</b>. The OS buffer always stays in memory, and the data is transferred between it and the process only when the process is swapped back in. The price is an extra copy (double buffering).</p>',
  },
  {
    id: 'mm-cp-noncontiguous',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'What motivated operating-system designers to move from contiguous storage allocation to non-contiguous storage allocation?',
    points: [
      'Contiguous allocation needs one hole large enough for the entire process',
      'External fragmentation: enough total free memory may exist but be scattered in small holes, so processes wait and memory is wasted',
      'Compaction can fix it but is expensive, needs execution-time relocation and is complicated by pending I/O',
      'Non-contiguous allocation (paging) lets a process occupy any free frames, removing external fragmentation',
      'It also enables sharing of pages and prepares the ground for virtual memory',
      'Costs: page-table space, slower translation (hence TLBs) and some internal fragmentation',
    ],
    modelAnswer:
      '<p>With contiguous allocation every process needs a <b>single hole at least as large as itself</b>. As processes come and go, free memory breaks into many small holes. This <b>external fragmentation</b> means a process may have to wait even though the total free memory is sufficient (by the 50-percent rule about a third of memory can be unusable).</p><p class="mt-2">The only cure is <b>compaction</b>, which copies large amounts of memory, is possible only with execution-time relocation, and conflicts with pending I/O. Processes also cannot easily grow.</p><p class="mt-2">Designers therefore allowed a process’s memory to be <b>non-contiguous</b>. With paging, memory is cut into fixed-size frames and a process can use whatever frames are free, so external fragmentation disappears and memory utilisation and the degree of multiprogramming improve. Pages can be shared between processes, and the scheme extends naturally to virtual memory. The price is the space for page tables, a slower address translation that needs a TLB, and a little internal fragmentation.</p>',
  },
];
