import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  latency: {
    id: 'st-check-latency',
    type: 'numeric',
    prompt: 'A disk spins at 7,200 RPM. What is its average rotational latency, in milliseconds? (Give two decimal places.)',
    answer: 4.17,
    tolerance: 0.02,
    unit: 'ms',
    hint: 'One revolution takes 60 ÷ RPM seconds. On average the sector you want is half a revolution away.',
    explanation: 'One revolution takes 60 ÷ 7200 s = 8.33 ms. The average wait is half of that: <b>4.17 ms</b>.',
  },
  ssd: {
    id: 'st-check-ssd',
    type: 'tf',
    prompt: 'True or false: on a NAND flash SSD, a page that already holds data can simply be overwritten with new data, just like a sector on a hard disk.',
    answer: false,
    explanation:
      'False. Flash is read and written in pages, but a page <b>cannot be overwritten in place</b>. It must first be erased, and erasing happens only in much larger blocks. So the controller writes the new data to a free page, marks the old one invalid, and tracks the change in its flash translation layer.',
  },
  sstf: {
    id: 'st-check-sstf',
    type: 'mcq',
    prompt: 'The head is at cylinder 53 and the queue holds requests for cylinders 98, 183, 37, 122, 14, 124, 65 and 67. Which request does SSTF serve first?',
    options: ['98', '37', '65', '67'],
    answer: 2,
    explanation: 'SSTF picks the request with the shortest seek from the current position. From 53 the distances are 12 to cylinder 65, 14 to 67, 16 to 37 and 45 to 98, so <b>65</b> goes first.',
  },
  starve: {
    id: 'st-check-starve',
    type: 'mcq',
    prompt: 'A steady stream of requests keeps arriving for cylinders near the head. Under which algorithm could a request for a far-away cylinder wait forever?',
    options: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN'],
    answer: 1,
    explanation:
      '<b>SSTF</b> is essentially shortest-job-first for the disk, and like SJF it can starve requests: as long as closer requests keep arriving, the distant one is never the nearest. SCAN and C-SCAN sweep the whole disk, so every request is reached within a bounded time.',
  },
  parity: {
    id: 'st-check-parity',
    type: 'mcq',
    prompt: 'Three data disks hold the 4-bit blocks 1011, 0110 and 1100. What is stored on the parity disk?',
    options: ['0001', '1110', '1111', '0101'],
    answer: 0,
    hint: 'Work one column at a time: the parity bit is 1 if the column contains an odd number of 1s.',
    explanation: '1011 XOR 0110 = 1101, and 1101 XOR 1100 = <b>0001</b>. Column by column: two 1s, two 1s, two 1s, one 1.',
  },
  nested: {
    id: 'st-check-nested',
    type: 'mcq',
    prompt: 'Four disks are arranged as RAID 1+0. One disk has already failed. How many of the three remaining disks could fail next without losing data?',
    options: ['None of them', 'One specific disk only', 'Two of the three', 'Any of the three'],
    answer: 2,
    explanation:
      'In 1+0 the disks form two mirrored pairs. Data is lost only when <i>both</i> disks of a pair are gone, so the only fatal second failure is the partner of the disk already lost. The other <b>two</b> are safe. In 0+1 the answer would be only one, which is why 1+0 has better fault tolerance.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  why: {
    id: 'st-practice-why',
    type: 'written',
    marks: 5,
    prompt: 'What two problems of a single large disk does RAID address, and what technique does it use for each?',
    points: [
      'Reliability: with many disks the chance that some disk fails is much higher, and a failure means data loss',
      'It is solved by redundancy: storing extra information (a mirror copy or parity) from which lost data can be rebuilt',
      'Performance: the transfer rate of one disk is limited',
      'It is solved by parallelism through data striping across disks (bit-level or block-level)',
      'Striping increases the throughput of many small accesses and reduces the response time of large accesses',
    ],
    modelAnswer:
      '<p>RAID (redundant array of independent disks) addresses <b>reliability</b> and <b>performance</b>.</p><p class="mt-2"><b>Reliability through redundancy.</b> The chance that <i>some</i> disk out of N fails is much higher than for one disk: if one disk has a mean time to failure of 100,000 hours, an array of 100 has one of only 1,000 hours, about 41 days. Since each failure would lose data, RAID stores extra information that is not normally needed but can rebuild what was lost. The simplest form is <b>mirroring</b> (write to two disks, read from either); cheaper forms use <b>parity</b>.</p><p class="mt-2"><b>Performance through parallelism.</b> With several disks, data can be <b>striped</b> across them, at the level of bits or, more usually, blocks. Several small requests can be served at the same time by different disks, which raises throughput, and a large request is split across the disks and transferred in parallel, which lowers its response time.</p>',
  },
  attach: {
    id: 'st-practice-attach',
    type: 'written',
    marks: 4,
    prompt: 'Distinguish between network-attached storage (NAS) and a storage-area network (SAN).',
    points: [
      'NAS makes storage available over the ordinary data network at the level of files (a remote file system)',
      'NAS uses protocols such as NFS and CIFS, implemented with remote procedure calls over TCP or UDP on an IP network',
      'A SAN is a separate private network connecting hosts to storage arrays, using storage protocols (Fibre Channel, InfiniBand, or iSCSI) and working at the level of blocks',
      'A SAN is flexible (storage is allocated to hosts dynamically, for example by LUN masking) and avoids consuming bandwidth on the communication network',
    ],
    modelAnswer:
      '<p><b>Network-attached storage</b> is storage reached over a normal network rather than a local bus. Clients attach to a remote <b>file system</b> using protocols such as NFS or CIFS, which are implemented as remote procedure calls carried over TCP or UDP on an IP network. It is convenient for sharing, but storage I/O consumes bandwidth on the data network and is slower than local storage.</p><p class="mt-2">A <b>storage-area network</b> is a private network dedicated to storage, connecting multiple hosts to multiple storage arrays through Fibre Channel switches or InfiniBand (or over IP using iSCSI). It uses storage protocols rather than networking protocols and presents <b>blocks</b> (virtual disks, LUNs) rather than files. Its strength is flexibility: storage can be allocated to and moved between hosts easily, with LUN masking controlling which host sees which virtual disk.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'st-cp-sstf',
    type: 'numeric',
    prompt: 'A disk has cylinders 0 to 199. The head is at cylinder 53 and the queue is 98, 183, 37, 122, 14, 124, 65, 67. What is the total head movement under SSTF?',
    answer: 236,
    unit: 'cylinders',
    hint: 'The service order is 65, 67, 37, 14, 98, 122, 124, 183.',
    explanation: '53 → 65 → 67 → 37 → 14 → 98 → 122 → 124 → 183: 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = <b>236</b>. FCFS on the same queue moves 640.',
  },
  {
    id: 'st-cp-clook',
    type: 'numeric',
    prompt: 'Same disk and queue (head at 53; requests 98, 183, 37, 122, 14, 124, 65, 67). The head is moving towards higher cylinders. What is the total head movement under C-LOOK, counting the return jump?',
    answer: 322,
    unit: 'cylinders',
    hint: 'Sweep up to the highest request, jump to the lowest request, then sweep up again.',
    explanation: 'Up from 53 to 183 is 130. Jump from 183 down to 14 is 169. Then up from 14 to 37 is 23. Total <b>322</b>. C-SCAN would go all the way to 199 and back to 0, for 382.',
  },
  {
    id: 'st-cp-scan-uniform',
    type: 'mcq',
    prompt: 'Why does C-SCAN give a more uniform wait time than SCAN?',
    options: [
      'It moves the head a shorter total distance',
      'It serves requests in one direction only, so after reaching the end it returns to the start, where the longest-waiting requests are',
      'It always serves the nearest request first',
      'It keeps separate queues for reads and writes',
    ],
    answer: 1,
    explanation:
      'When SCAN reverses at one end, the cylinders it has just passed have few pending requests, while the heaviest backlog of waiting requests is at the far end. C-SCAN treats the cylinders as a circular list: it jumps straight back to the beginning and sweeps in the same direction again, so no region waits much longer than another.',
  },
  {
    id: 'st-cp-latency',
    type: 'numeric',
    prompt: 'A disk rotates at 15,000 RPM and has an average seek time of 3 ms. What is its average access time (seek plus rotational latency), in milliseconds?',
    answer: 5,
    tolerance: 0.01,
    unit: 'ms',
    explanation: 'One revolution takes 60 ÷ 15,000 s = 4 ms, so the average rotational latency is 2 ms. Average access time = 3 + 2 = <b>5 ms</b>.',
  },
  {
    id: 'st-cp-nvm',
    type: 'mcq',
    prompt: 'Why is a simple FCFS policy usually good enough for scheduling I/O on an SSD?',
    options: [
      'SSDs can only process one request per second',
      'SSDs have no moving head, so there is no seek time or rotational latency for reordering to save',
      'SSDs cannot queue requests',
      'SSDs store all data in one block',
    ],
    answer: 1,
    explanation:
      'Disk-scheduling algorithms exist to reduce head movement. A nonvolatile-memory device has <b>no moving parts</b>, so the cost of a request does not depend on where the previous one was, and FCFS (with some merging of adjacent requests) does well.',
  },
  {
    id: 'st-cp-raid5-capacity',
    type: 'numeric',
    prompt: 'Six 4 TB disks are configured as RAID 5. How much usable capacity does the array provide, in TB?',
    answer: 20,
    unit: 'TB',
    explanation: 'RAID 5 uses the equivalent of one disk for parity, spread across all of them. Usable capacity = (6 − 1) × 4 = <b>20 TB</b>. RAID 6 would give 16 TB and RAID 1+0 would give 12 TB.',
  },
  {
    id: 'st-cp-raid-facts',
    type: 'multi',
    prompt: 'Which statements about RAID are correct?',
    options: [
      'RAID 0 provides no redundancy',
      'A four-disk RAID 1+0 array survives the failure of any two disks',
      'RAID 6 survives the failure of any two disks',
      'In RAID 4, every write must update the same parity disk',
    ],
    answers: [0, 2, 3],
    explanation:
      'RAID 0 is striping only. RAID 6 keeps two check blocks per stripe, so any two failures are covered. RAID 4 has one dedicated parity disk, involved in every write. RAID 1+0 survives two failures only if they are in <i>different</i> mirrored pairs; losing both disks of one pair loses data.',
  },
  {
    id: 'st-cp-small-write',
    type: 'numeric',
    prompt: 'In RAID 4 or RAID 5, how many disk accesses (reads plus writes) does it take to overwrite a single data block using the read-modify-write method?',
    answer: 4,
    unit: 'accesses',
    hint: 'The new parity depends on the old data, the old parity and the new data.',
    explanation:
      '<b>Four</b>: read the old data block, read the old parity block, write the new data block, write the new parity block. New parity = old parity XOR old data XOR new data.',
  },
  {
    id: 'st-cp-raid345',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'How is RAID 4 better than RAID 3? Also compare RAID 4 and RAID 5.',
    points: [
      'RAID 3 uses bit-interleaved (bit or byte level) striping with one parity disk, so every disk takes part in every I/O and only one request can be served at a time',
      'RAID 4 uses block-level striping with a dedicated parity disk, so a block read touches only one disk',
      'Hence in RAID 4 multiple read requests proceed in parallel, giving a higher I/O rate for small requests, while large reads still enjoy a high transfer rate',
      'In RAID 4 every write must update the single parity disk (a small write costs four accesses), so the parity disk is a bottleneck',
      'RAID 5 distributes parity blocks across all N + 1 disks instead of one disk',
      'So RAID 5 removes the parity bottleneck and writes to different stripes can proceed in parallel; it is the usual choice for large volumes of data',
    ],
    modelAnswer:
      '<p><b>RAID 3 and RAID 4.</b> RAID 3 is bit-interleaved parity: data is striped at the bit (or byte) level over the data disks with one parity disk. Because every byte is spread over all disks, <i>every</i> disk participates in every read or write, so the array can serve only <b>one request at a time</b>. RAID 4 is block-interleaved parity: it stripes whole <b>blocks</b> and keeps the parity blocks on a separate disk. A block read needs only <b>one disk</b>, so several read requests can be carried out in <b>parallel</b>, giving a much higher I/O rate for small, independent requests. Large reads still use all the disks and get a high transfer rate, and the storage overhead is the same single disk.</p><p class="mt-2"><b>RAID 4 and RAID 5.</b> In RAID 4 every write must also update the parity disk: a small write needs four accesses (read old data and old parity, write new data and new parity). Since all writes go through the one parity disk, it becomes a <b>bottleneck</b> and is used more heavily than the others. RAID 5 keeps the same block striping and the same one-disk overhead but <b>distributes the parity</b> across all N + 1 disks: for each stripe one disk holds parity and the rest hold data. Writes to different stripes then involve different parity disks and can run in parallel, and the load is spread evenly. RAID 5 therefore generally outperforms RAID 4 and is the common choice for storing large volumes of data.</p>',
  },
  {
    id: 'st-cp-nested',
    type: 'written',
    marks: 4,
    prompt: 'Explain the difference between RAID 0+1 and RAID 1+0. Which has better fault tolerance, and why?',
    points: [
      'RAID 0+1: disks are striped first, and the whole stripe set is then mirrored to a second stripe set',
      'RAID 1+0: disks are mirrored in pairs first, and data is then striped across the mirrored pairs',
      'In 0+1, a single disk failure makes its entire stripe set unavailable, so any further failure in the other set loses data',
      'In 1+0, a single failure affects only its pair; data is lost only if the partner of the failed disk also fails, so 1+0 tolerates more failure combinations',
    ],
    modelAnswer:
      '<p>Both combine the performance of striping (RAID 0) with the reliability of mirroring (RAID 1), and both use half the raw capacity. They differ in the order.</p><p class="mt-2">In <b>RAID 0+1</b> a set of disks is striped, and that stripe is mirrored to another, equivalent stripe. In <b>RAID 1+0</b> disks are mirrored in pairs, and the resulting mirrored pairs are striped.</p><p class="mt-2"><b>RAID 1+0 has better fault tolerance.</b> In 0+1, if one disk fails, its <i>whole stripe</i> becomes inaccessible, leaving a single unprotected stripe: any failure there loses data. In 1+0, a failed disk is unavailable but its mirror, and every other disk, keeps working; data is lost only if the second failure happens to be the partner of the first. With four disks, 1+0 survives four of the six possible two-disk failures, 0+1 only two. Rebuilding is also cheaper in 1+0, since only one disk needs to be copied.</p>',
  },
];
