// Adds the "book-style" extras to the lesson files:
//   notes    - a sticky note (fun fact, memory trick or real-world sighting) at the end of a section
//   folds    - a ### subsection folded into <Deep>, so the main line of the lesson is shorter
//   optional - a whole ## section flagged as skippable on a first read
//
// Run with:  bun scripts/enrich-lessons.ts
// It is safe to run again: a lesson that already imports Note is left alone.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Kind = 'fact' | 'trick' | 'real';
interface Plan {
  /** [heading of the section that FOLLOWS the note, kind, text] */
  notes: [before: string, kind: Kind, text: string][];
  folds?: string[];
  optional?: string[];
}

const plans: Record<string, Plan> = {
  'overview-and-complexity': {
    notes: [
      ['Why systems get complicated', 'trick', 'A car is the easiest way to remember what an operating system is. **Engine** = the machine part. **Steering wheel and pedals** = the operating part. You never touch the engine, and you still get where you are going.'],
      ['Coping with complexity', 'fact', 'The Linux kernel started in 1991 as roughly **10,000 lines** of code written by one student. Today it is more than **30 million lines**, with thousands of contributors. Nobody alive has read all of it.'],
      ['Why computer systems are different', 'trick', 'The four tools, in order: **M**odularity, **A**bstraction, **L**ayering, **H**ierarchy. Try: "**M**y **A**unt **L**oves **H**oney."'],
      ['Two more techniques', 'fact', '**Brooks\'s law** (1975): adding people to a late software project makes it later. The reason is the formula you just used: n people have n(n − 1)/2 ways to talk to each other.'],
      ['What the course covers', 'fact', '"Keep it simple" is older than computing. The phrase **KISS** is credited to Kelly Johnson, an aircraft designer who wanted jets that a mechanic could fix in the field with a handful of tools.'],
    ],
    optional: ['What the course covers'],
  },
  history: {
    notes: [
      ['Early systems: serial processing', 'fact', 'The film *The Imitation Game* is about Alan Turing. The stored-program idea he and von Neumann described is the reason your phone can be a camera, a map and a game without being rewired.'],
      ['Simple batch systems', 'fact', 'The first recorded computer **bug** was a real one. In 1947, operators of the Harvard Mark II found a moth stuck in a relay, taped it into the logbook and wrote: "First actual case of bug being found."'],
      ['Spooling', 'fact', 'A punched card held **80 columns** of text. That is why terminal windows were 80 characters wide for decades, and why many style guides still ask for lines under 80 characters.'],
      ['Time-sharing systems', 'trick', 'Multiprogramming is a cook with several pots on the stove. While one pot simmers (waits for I/O), the cook chops vegetables for another. The cook is the CPU, and is never standing idle.'],
      ['Modern computers', 'fact', 'The name **UNIX** is a joke. Its authors had worked on a huge, complicated time-sharing system called **Multics**. Their small, simple replacement was first called "Unics".'],
      ['Summary', 'fact', 'The computer that guided Apollo 11 to the Moon had about **4 kilobytes** of RAM. A modern phone has around a million times more, and mostly uses it to show you videos.'],
    ],
  },
  hardware: {
    notes: [
      ['How a computer is organised', 'fact', '"Booting" is short for **bootstrapping**, from the saying "pull yourself up by your own bootstraps". A computer needs a program to load programs, so it starts with a tiny one burned into a chip.'],
      ['Interrupts', 'trick', 'Reading a book: the **PC** is your bookmark (where to read next), and the **IR** is the sentence you are reading right now. The bookmark always sits one sentence ahead.'],
      ['I/O structure', 'trick', 'An **interrupt** is a doorbell. Without one you would have to walk to the door every minute to check whether anyone is there. That walking is called **polling**, and it wastes your whole day.'],
      ['Operating-system structure', 'trick', '**DMA** is hiring movers. You tell them what to move, where from, where to and how much. Then you get on with your work, and they ring the bell **once**, when the whole job is done.'],
      ['Computer-system architecture', 'fact', 'Computing pioneer **Grace Hopper** used to hand out pieces of wire 30 cm long. That is how far light travels in **one nanosecond**. It is why fast memory has to sit physically close to the CPU.'],
    ],
    optional: ['What the operating system manages', 'Computing environments'],
  },
  'system-structures': {
    notes: [
      ['The user interface', 'trick', 'Two groups of services. For **you**: interface, running programs, I/O, files, communication, error detection. For **the system**: allocation, accounting, protection. Ask "who benefits?" and you can always sort them.'],
      ['System calls', 'fact', 'Windows, icons and the mouse were invented at **Xerox PARC** in the early 1970s. Xerox barely sold them. Apple and Microsoft saw the demo and built their businesses on the idea.'],
      ['System programs', 'real', 'On Linux, type `strace ls` in a terminal. It prints every system call the `ls` command makes: dozens of them, just to list a folder. Linux has more than 300 system calls in total.'],
      ['Operating-system structure', 'trick', '**Mechanism** is the volume knob. **Policy** is how loud you choose to play the music. One knob serves every taste, which is exactly why you build the knob and not a fixed volume.'],
      ['Virtual machines', 'fact', 'In 1992 Professor Andrew Tanenbaum posted a message titled "**LINUX is obsolete**", arguing that monolithic kernels were a thing of the past and microkernels the future. Linus Torvalds, then a student, argued back. The debate is still read today.'],
    ],
    folds: ['Why applications are operating-system specific', 'Implementation', 'A fifteen-level design hierarchy', 'Hybrid systems'],
    optional: ['Three papers worth knowing'],
  },
  'processes-and-ipc': {
    notes: [
      ['The process concept', 'real', 'Open Task Manager on Windows, Activity Monitor on a Mac, or run `ps aux` on Linux. Even with "nothing" open you will see a hundred or more processes. A web browser usually runs **each tab as its own process**, so one crashed tab does not take the others down.'],
      ['Process scheduling', 'trick', 'A **program** is a recipe in a book. A **process** is someone actually cooking it: there is a place in the recipe, ingredients on the counter and pans in use. Two people can cook the same recipe at once: one program, two processes.'],
      ['Operations on processes', 'fact', 'A context switch does **no useful work at all**. It is pure overhead, like the time you lose when you put one task down and try to remember where you were in another.'],
      ['Cooperating processes', 'fact', 'On Linux every process descends from **process number 1**, which the kernel starts at boot. A process that has finished but whose parent has not yet collected its exit status is called a **zombie**. A process whose parent died first is an **orphan**.'],
      ['Summary', 'fact', 'The pipe, written `|`, was the idea of Doug McIlroy. Ken Thompson added it to UNIX in **one night** in 1973, and by the next morning people were chaining programs together with it.'],
    ],
    folds: ['The process tree at start-up'],
  },
  threads: {
    notes: [
      ['Why use threads?', 'trick', 'A **process** is a house. **Threads** are the people living in it. They share the kitchen and the fridge (code, data, files), but each has their own to-do list and their own notebook (program counter, registers, stack).'],
      ['Where threads are implemented', 'trick', 'Amdahl\'s law in one sentence: **the part that cannot be shared sets the speed limit**. Nine people cannot dig a hole nine times faster if only one shovel exists.'],
      ['Threading issues', 'fact', 'Early Java used the many-to-one model. Its threads were called **green threads**, after the "Green Team" at Sun that created the language.'],
      ['Summary', 'real', 'A word processor is a classic multithreaded program: one thread draws the screen, one responds to your typing, and one checks spelling in the background. That is why the red underline appears a moment after you stop.'],
    ],
    folds: ['Thread-specific data', 'Scheduler activations'],
    optional: ['Threads in real systems'],
  },
  'cpu-scheduling': {
    notes: [
      ['Scheduling criteria', 'real', 'Your operating system makes scheduling decisions astonishingly often. A Linux kernel is usually built to tick between **100 and 1000 times every second**, and can reschedule at each tick.'],
      ['Shortest-job-first', 'trick', 'The **convoy effect** is being stuck behind a slow truck on a single-lane road. Everyone behind it, however fast, crawls at the truck\'s speed.'],
      ['Priority scheduling', 'trick', 'Shortest-job-first is the **express lane** at a supermarket: let the person with two items go before the person with a full trolley, and the average wait for everyone falls.'],
      ['Round robin', 'fact', 'There is a rumour that when the IBM 7094 at MIT was shut down in 1973, the operators found a low-priority job that had been submitted in **1967** and had still not been run. That is starvation.'],
      ['How real systems schedule', 'fact', 'During the Apollo 11 landing in 1969, the guidance computer was overloaded and flashed "1202" alarms. Its **priority scheduler** dropped the low-priority jobs and kept the landing jobs running. The crew landed safely.'],
    ],
    optional: ['How real systems schedule'],
  },
  synchronization: {
    notes: [
      ['The critical-section problem', 'fact', 'Race conditions can be deadly. In the 1980s the **Therac-25** radiation therapy machine gave several patients massive overdoses. One cause was a race between the operator\'s fast typing and the machine\'s set-up routine.'],
      ['Software solutions for two processes', 'trick', 'The three requirements, as a toilet on a train. **Mutual exclusion**: one person at a time. **Progress**: if it is empty and someone is waiting, they get in. **Bounded waiting**: nobody can keep pushing ahead of you for ever.'],
      ['Hardware solutions', 'fact', 'The **bakery algorithm** was published by Leslie Lamport in 1974. It is named after shops where each customer takes a numbered ticket and the lowest number is served next.'],
      ['Classical problems of synchronization', 'fact', 'Semaphores were invented by the Dutch computer scientist Edsger Dijkstra. That is why the operations were first called **P** and **V**, from Dutch words. A railway semaphore is a signal arm that tells a train whether the track ahead is free.'],
      ['Monitors', 'fact', 'In 1997 NASA\'s **Mars Pathfinder** kept resetting itself on Mars. The cause was a synchronisation bug called priority inversion, involving a mutex. Engineers found it on a copy on Earth and fixed it by sending a patch across space.'],
    ],
    folds: ['A caution about modern hardware', 'The barbershop problem', 'Implementing a monitor with semaphores'],
    optional: ['Synchronization in real systems, and beyond'],
  },
  deadlocks: {
    notes: [
      ['The system model', 'fact', 'A law said to have been passed in Kansas early in the 20th century read: "When two trains approach each other at a crossing, both shall come to a full stop and neither shall start up again until the other has gone." That is a deadlock, written into law.'],
      ['Resource-allocation graphs', 'trick', 'The four conditions: **M**utual exclusion, **H**old and wait, **N**o preemption, **C**ircular wait. Try: "**M**y **H**ungry **N**eighbour **C**ircles." Break any one and the deadlock cannot happen.'],
      ['Deadlock prevention', 'fact', 'Ignoring deadlocks has a nickname: the **ostrich algorithm**. Stick your head in the sand and pretend there is no problem. It is what most desktop operating systems really do.'],
      ['Deadlock detection', 'fact', 'The Banker\'s algorithm was devised by **Edsger Dijkstra** in 1965 for the THE operating system. The same person gave us semaphores, the dining philosophers and the shortest-path algorithm.'],
      ['Summary', 'real', 'Database servers detect deadlocks all day long. When two transactions block each other, the database picks one as the **victim**, rolls it back, and the application simply tries again. You have probably caused one without knowing.'],
    ],
  },
  'networking-intro-datalink': {
    notes: [
      ['The physical layer in brief', 'trick', 'The seven OSI layers from the bottom up, **P**hysical, **D**ata link, **N**etwork, **T**ransport, **S**ession, **P**resentation, **A**pplication: "**P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way."'],
      ['Protocols for one link', 'fact', 'Error-correcting codes exist because **Richard Hamming** got annoyed. In the late 1940s the relay computer he used at Bell Labs would detect an error over the weekend and simply stop. He decided the machine should fix the error itself.'],
      ['Sharing a channel: the MAC sublayer', 'trick', '**Go-Back-N** is a strict teacher: one mistake and you redo everything from that point. **Selective Repeat** is a kind one: redo only the question you got wrong.'],
      ['Switching in the data link layer', 'fact', '**Ethernet** is named after the "luminiferous ether", an invisible substance scientists once thought carried light. Its design borrowed from **ALOHAnet**, a radio network that linked the Hawaiian islands in 1971.'],
    ],
    folds: ['The Internet today', 'Virtual LANs'],
    optional: ['The physical layer in brief'],
  },
  'network-layer': {
    notes: [
      ['Routing algorithms', 'trick', 'A **datagram** network is the postal service: every letter carries the full address and may take a different route. A **virtual circuit** is a phone call: set up the line once, then everything follows the same path.'],
      ['Congestion control', 'fact', 'Dijkstra designed his shortest-path algorithm in 1956 in about **twenty minutes**, sitting at a café in Amsterdam, without pencil or paper. It is still inside the routers carrying this page to you.'],
      ['Quality of service', 'trick', 'Congestion is a traffic jam. Once the road is full, **adding more cars makes everyone slower**, not faster. That is why networks ask senders to slow down.'],
      ['The network layer in the Internet', 'trick', 'A **leaky bucket** is a funnel: water comes out at one steady rate however fast you pour. A **token bucket** is pocket money: save up tokens while idle, then spend them in a burst.'],
      ['Summary', 'fact', 'IPv4 has about **4.3 billion** addresses, which seemed endless in 1981. The central pool ran dry in **2011**. IPv6 has about 340 undecillion: enough for every grain of sand on Earth, many times over.'],
    ],
    folds: ['Control protocols', 'MPLS', 'IPv6'],
  },
  'transport-layer': {
    notes: [
      ['Elements of transport protocols', 'trick', 'The IP address gets a packet to the right **building** (the computer). The **port number** gets it to the right **flat** (the program). The transport layer is the person sorting the post in the lobby.'],
      ['Congestion control', 'trick', 'The three-way handshake is a phone call: "Hello, can you hear me?" "Yes. Can you hear me?" "Yes." Only then does anyone start talking.'],
      ['UDP', 'fact', 'In October 1986 the Internet suffered a **congestion collapse**. A link between two sites a few hundred metres apart slowed from 32,000 bits per second to **40**. Van Jacobson\'s fix, including slow start, is still in TCP today.'],
      ['TCP', 'real', '**UDP** is behind video calls, online games and DNS lookups. For these a late packet is worthless, so there is no point resending it. Better a tiny glitch than a frozen screen.'],
      ['Summary', 'trick', 'AIMD is how you drive in fog: **speed up gently, brake hard**. Add one each round while all is well. Halve at the first sign of trouble.'],
    ],
    folds: ['Multiplexing and crash recovery', 'Wireless issues', 'Remote procedure call', 'Real-time transport'],
    optional: ['Delay-tolerant networking'],
  },
  'memory-management': {
    notes: [
      ['Swapping', 'trick', 'A **logical address** is a flat number: "flat 12". The **base register** is the street address of the building. The hardware adds the two to find the real door. Move the building and only the base changes.'],
      ['Fragmentation', 'trick', 'Parking a car. **First fit**: take the first space big enough. **Best fit**: hunt for the tightest space that fits. **Worst fit**: take the biggest space, hoping the leftover is still useful.'],
      ['Paging', 'trick', '**External** fragmentation: plenty of free space in the car park, but in gaps too small for your car. **Internal** fragmentation: a small car alone in a bus bay. The space is taken, and mostly wasted.'],
      ['Making page tables small', 'fact', 'A TLB is tiny, often a few dozen to a few thousand entries. Yet it answers **the great majority** of lookups, because programs keep returning to the same few pages.'],
      ['Summary', 'fact', 'The famous crash message "**segmentation fault**" is a fossil. It comes from segmented memory, where touching memory outside your segment trapped to the operating system. The name survived long after paging took over.'],
    ],
    folds: ['Loading and linking only what you need', 'Overlays', 'The pending I/O problem', 'Whose entries are these?'],
  },
  'virtual-memory': {
    notes: [
      ['Demand paging', 'fact', 'Virtual memory was invented for the **Atlas** computer at the University of Manchester, running by 1962. Its designers called it the "one-level store": the program sees one big memory and never knows part of it is on a drum.'],
      ['Two bonuses: copy-on-write and memory-mapped files', 'trick', 'A page fault is reaching for a book that is not on your desk. You stop, walk to the library shelf (the disk), bring the book back, and carry on from the same sentence. Slow, but nothing is lost.'],
      ['Allocating frames', 'fact', '**Belady\'s anomaly** was reported in 1969 and shocked people: with FIFO, giving a program **more** memory can cause **more** page faults. LRU and the optimal algorithm never do this.'],
      ['Other considerations', 'trick', 'Thrashing is having ten tasks and switching between them so often that you finish none. All your time goes on remembering where you were. The cure is the same for people and computers: **do fewer things at once**.'],
    ],
    folds: ['Counting algorithms'],
    optional: ['Other considerations', 'How real systems do it'],
  },
  'storage-and-raid': {
    notes: [
      ['Nonvolatile memory devices', 'fact', 'The first hard disk drive, the IBM **RAMAC** of 1956, stored about **5 megabytes** on fifty platters each 61 cm across. It weighed around a tonne and was delivered by forklift.'],
      ['How devices are attached and addressed', 'fact', 'A disk head does not touch the platter. It floats on a cushion of air a few **nanometres** thick while the surface rushes past underneath. If it ever touches, that is a **head crash**, and the data under it is gone.'],
      ['Detecting and correcting errors', 'trick', '**SCAN** is a lift. It keeps going up, stopping at each floor someone asked for, then comes back down. It does not zigzag to whoever pressed the button most recently.'],
      ['Object storage', 'fact', 'RAID was named in a 1988 paper from Berkeley. The **I** first stood for **Inexpensive**: lots of cheap PC disks instead of one costly mainframe disk. Marketing departments later changed it to "Independent".'],
      ['Summary', 'trick', 'RAID **0** has **zero** protection. RAID **1** keeps **one** extra copy of everything. RAID **5** spreads parity so that losing **one** disk is survivable. RAID **6** survives **two**.'],
    ],
    folds: ['Volatile memory and tape', 'Scheduling NVM devices'],
    optional: ['Storage attachment', 'Object storage'],
  },
  'file-systems': {
    notes: [
      ['The overall organisation', 'fact', 'In UNIX, **everything is a file**. The keyboard, the disk, even a source of random numbers can all be opened and read with the same calls you use for a text file.'],
      ['Supporting big files', 'fact', 'Nobody is certain what the "i" in **inode** stands for. Dennis Ritchie, who helped create UNIX, said his best guess was "index", and that the name simply stuck.'],
      ['Free-space management', 'trick', 'A directory is a **phone book**: names on the left, numbers (inode numbers) on the right. The book does not contain the people. It only tells you where to find them.'],
      ['Access paths: reading and writing', 'fact', 'Deleting a file usually does **not** erase it. The file system removes the name and marks the blocks as free. The data sits there until something overwrites it, which is why "undelete" tools can work.'],
      ['Summary', 'fact', 'File timestamps in UNIX count seconds since 1 January 1970. Stored in 32 bits, that counter overflows on **19 January 2038**. It is known as the Year 2038 problem.'],
    ],
    folds: ['Extents', 'Linked approaches', 'Consistency semantics'],
  },
  hdfs: {
    notes: [
      ['The design of HDFS', 'fact', '**Hadoop** is named after a yellow toy elephant that belonged to the young son of its creator, Doug Cutting. That is why the logo is an elephant.'],
      ['DataNodes', 'fact', 'The NameNode keeps its whole map of the file system **in memory**. Each file, directory and block costs about 150 bytes, so a million one-block files need roughly 300 MB of RAM. That is why HDFS dislikes millions of tiny files.'],
      ['The HDFS client', 'trick', 'A heartbeat is a "still alive!" message. DataNodes send one every **3 seconds**. After about **ten minutes** of silence, the NameNode gives up and makes new copies of that node\'s blocks elsewhere.'],
      ['Summary', 'trick', 'Replica placement in five words: **three copies, on two racks**. One copy next to the writer, two more on different machines in another rack.'],
    ],
    folds: ['Where Hadoop came from', 'CheckpointNode and BackupNode', 'Balancer', 'Block scanner', 'Decommissioning', 'Copying between clusters'],
  },
  mapreduce: {
    notes: [
      ['The programming model', 'fact', 'The names **map** and **reduce** come from Lisp and other functional programming languages, where they are everyday tools. Google\'s insight was that they are easy to run on thousands of machines.'],
      ['How a job is executed', 'trick', 'Counting votes in an election. Each polling station counts its own ballots (**map**). The tallies are grouped by candidate (**shuffle**). Someone adds up each candidate\'s pile (**reduce**).'],
      ['Refinements', 'fact', 'In the original paper, Google\'s engineers deliberately **killed 200 of about 1,750 machines** in the middle of a job. It finished anyway, only about 5 percent slower.'],
      ['Summary', 'fact', 'MapReduce was published in 2004 by Jeffrey Dean and Sanjay Ghemawat. Within four years Google reported more than **ten thousand** different MapReduce programs running inside the company.'],
    ],
    folds: ['More things that fit the model', 'Task granularity', 'Other refinements'],
  },
  'cloud-and-distributed': {
    notes: [
      ['Enabling technologies', 'fact', 'The word **cloud** comes from engineers\' diagrams. For decades they drew a fluffy cloud to mean "the network out there, whose details we do not care about". Then the cloud became the product.'],
      ['Cloud service models', 'trick', '**Cluster**: one room, one owner. **Grid**: many owners sharing their machines. **Cloud**: somebody else\'s machines, rented by the hour.'],
      ['Software environments', 'trick', 'Pizza. **IaaS**: you rent the kitchen and cook it yourself. **PaaS**: the pizza is delivered and you lay the table. **SaaS**: you eat at the restaurant and do nothing at all.'],
      ['Availability, security and energy', 'fact', 'Amdahl\'s law is from 1967 and still stings. If just **5 percent** of a program must run serially, then even with infinite processors it can never run more than **20 times** faster.'],
      ['Summary', 'fact', '"Five nines" means 99.999 percent availability. That allows a little over **5 minutes of downtime in a whole year**. Each extra nine is ten times harder to achieve.'],
    ],
    folds: ['Utility computing, the Internet of Things', 'Dimensions of scalability', 'Network threats and data integrity', 'Energy efficiency'],
  },
  'virtual-machines': {
    notes: [
      ['What virtualization buys', 'fact', 'Virtual machines are much older than the cloud. IBM was running them on mainframes in the **1960s**, and sold them commercially from 1972, so that many users could each have what looked like a private computer.'],
      ['The building blocks', 'trick', 'A **type 1** hypervisor is the landlord: it owns the building and rents out flats. A **type 2** hypervisor is a tenant who sublets a room: it is itself a guest of the host operating system.'],
      ['Virtualization and the operating system', 'fact', 'For years the x86 processor was said to be impossible to virtualise properly, because a handful of its sensitive instructions did not trap. **VMware** got round this in the late 1990s by rewriting those instructions on the fly: binary translation.'],
      ['Two examples', 'real', 'When Amazon launched its EC2 cloud in 2006, the virtual machines ran on **Xen**, the open-source hypervisor from the University of Cambridge that introduced paravirtualisation.'],
    ],
    folds: ['A short history', 'Programming-environment virtualization', 'Emulation', 'Storage management'],
    optional: ['Two examples'],
  },
};

const dir = join(import.meta.dir, '..', 'src', 'content', 'lessons');
const IMPORTS = [
  "import Note from '../../components/learn/Note.astro';",
  "import Deep from '../../components/learn/Deep.astro';",
  "import Optional from '../../components/learn/Optional.astro';",
];

let problems = 0;
for (const [lesson, plan] of Object.entries(plans)) {
  const file = join(dir, `${lesson}.mdx`);
  const source = readFileSync(file, 'utf8');
  if (source.includes(IMPORTS[0])) {
    console.log(`${lesson}: already enriched, skipped`);
    continue;
  }
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = source.split(/\r?\n/);

  // Which lines are inside a code fence: headings there are not headings.
  const inFence: boolean[] = [];
  let fence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence.push(true);
      fence = !fence;
    } else inFence.push(fence);
  }
  const headingAt = (level: 2 | 3, title: string) => lines.findIndex((l, i) => !inFence[i] && l.trim() === `${'#'.repeat(level)} ${title}`);
  const nextHeading = (from: number) => {
    for (let i = from + 1; i < lines.length; i++) if (!inFence[i] && /^#{2,3} /.test(lines[i])) return i;
    return lines.length;
  };

  // Collect edits as "insert these lines before line i" / "replace line i", then apply bottom-up.
  const inserts = new Map<number, string[]>();
  const replace = new Map<number, string[]>();
  const add = (at: number, block: string[]) => inserts.set(at, [...(inserts.get(at) ?? []), ...block]);
  const miss = (what: string) => {
    console.error(`${lesson}: cannot find ${what}`);
    problems += 1;
  };

  for (const title of plan.folds ?? []) {
    const at = headingAt(3, title);
    if (at < 0) {
      miss(`### ${title}`);
      continue;
    }
    replace.set(at, [`<Deep title="${title.replace(/"/g, '&quot;')}">`]);
    add(nextHeading(at), ['</Deep>', '']);
  }
  for (const [before, kind, text] of plan.notes) {
    const at = headingAt(2, before);
    if (at < 0) {
      miss(`## ${before}`);
      continue;
    }
    add(at, [`<Note kind="${kind}">`, '', text, '', '</Note>', '']);
  }
  for (const title of plan.optional ?? []) {
    const at = headingAt(2, title);
    if (at < 0) {
      miss(`## ${title}`);
      continue;
    }
    // Goes right after the heading (and the blank line that follows it).
    add(at + 1, ['', '<Optional />']);
  }
  const anchor = lines.findIndex((l) => l.startsWith('import Callout from'));
  if (anchor < 0) miss('the Callout import');
  else add(anchor + 1, IMPORTS);

  const out: string[] = [];
  lines.forEach((line, i) => {
    // A fold's closing tag must come before anything else inserted at the same heading.
    const block = inserts.get(i);
    if (block) out.push(...block.filter((l) => l === '</Deep>'), ...(block.includes('</Deep>') ? [''] : []), ...block.filter((l, k) => l !== '</Deep>' && !(l === '' && block[k - 1] === '</Deep>')));
    out.push(...(replace.get(i) ?? [line]));
  });
  const tail = inserts.get(lines.length);
  if (tail) out.push(...tail);
  if (!process.argv.includes('--dry')) writeFileSync(file, out.join(eol));
  console.log(`${lesson}: ${plan.notes.length} notes, ${plan.folds?.length ?? 0} folds, ${plan.optional?.length ?? 0} optional`);
}
if (problems) {
  console.error(`${problems} problem(s)`);
  process.exit(1);
}
