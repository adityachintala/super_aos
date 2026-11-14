// The course outline. A lesson is "available" once an MDX file with the same id
// exists in src/content/lessons; until then it shows on the map as coming soon.

import type { IconName } from './icons';
import type { DoodleName } from './doodles';

export interface LessonMeta {
  id: string;
  title: string;
  blurb: string;
  /** The illustration shown with the lesson. */
  doodle: DoodleName;
  /** The big idea, in one plain sentence. */
  hook: string;
}

export interface Unit {
  id: number;
  title: string;
  tagline: string;
  /** A chart colour token, e.g. var(--chart-1). */
  color: string;
  icon: IconName;
  /** The sticky-note colour of the unit's panel, e.g. var(--note-yellow). */
  note: string;
  lessons: LessonMeta[];
}

export const units: Unit[] = [
  {
    id: 1,
    title: 'Foundations',
    tagline: 'What an operating system is, where it came from, and how it is put together.',
    color: 'var(--chart-4)',
    note: 'var(--note-yellow)',
    icon: 'stack',
    lessons: [
      { id: 'overview-and-complexity', doodle: 'blocks', hook: 'Big systems are too much for one head. So we cut them into pieces that fit.', title: 'System Complexity', blurb: 'Why big systems are hard, and the tools we use to tame them.' },
      { id: 'history', doodle: 'punchcard', hook: 'Every OS feature was invented to stop something expensive sitting idle.', title: 'History of Operating Systems', blurb: 'From batch monitors to time sharing, UNIX and beyond.' },
      { id: 'hardware', doodle: 'chip', hook: 'An OS is just a program. A few hardware tricks keep it in charge.', title: 'Hardware Review', blurb: 'Interrupts, the storage hierarchy, caching and protection.' },
      { id: 'system-structures', doodle: 'layers', hook: 'What an OS offers, and the different ways to stack it together.', title: 'System Structures', blurb: 'System calls, kernels, layers, microkernels and virtual machines.' },
    ],
  },
  {
    id: 2,
    title: 'Processes',
    tagline: 'Running many things at once without them tripping over each other.',
    color: 'var(--chart-5)',
    note: 'var(--note-coral)',
    icon: 'cpu',
    lessons: [
      { id: 'processes-and-ipc', doodle: 'talk', hook: 'A process is a program that is actually running. Processes need ways to talk.', title: 'Processes and IPC', blurb: 'The process abstraction, context switches and message passing.' },
      { id: 'threads', doodle: 'threads', hook: 'One program, several things happening at once.', title: 'Threads', blurb: 'Threading models, thread pools, concurrency versus parallelism.' },
      { id: 'cpu-scheduling', doodle: 'stopwatch', hook: 'Many processes, one CPU. Who goes next, and for how long?', title: 'CPU Scheduling', blurb: 'FCFS, SJF, round robin, priorities and multilevel queues.' },
      { id: 'synchronization', doodle: 'lock', hook: 'Two processes touch the same data at once. How do we stop the mess?', title: 'Synchronization', blurb: 'Race conditions, critical sections, semaphores and monitors.' },
      { id: 'deadlocks', doodle: 'gridlock', hook: 'Everyone is waiting for someone else. Nobody moves. Now what?', title: 'Deadlocks', blurb: 'Prevention, avoidance with the Banker’s algorithm, detection.' },
    ],
  },
  {
    id: 3,
    title: 'Networking',
    tagline: 'How machines talk: links, routes and reliable transport.',
    color: 'var(--chart-2)',
    note: 'var(--note-teal)',
    icon: 'network',
    lessons: [
      { id: 'networking-intro-datalink', doodle: 'link', hook: 'Getting bits safely across one wire, and sharing that wire fairly.', title: 'Networks and the Data Link Layer', blurb: 'Layering, framing, sliding windows and medium access.' },
      { id: 'network-layer', doodle: 'route', hook: 'Finding a path across many networks, without causing a traffic jam.', title: 'The Network Layer', blurb: 'Routing algorithms, congestion and quality of service.' },
      { id: 'transport-layer', doodle: 'parcel', hook: 'Turning an unreliable network into a reliable conversation.', title: 'The Transport Layer', blurb: 'Connections, the three-way handshake and congestion control.' },
    ],
  },
  {
    id: 4,
    title: 'Memory',
    tagline: 'Giving every process the illusion of its own private memory.',
    color: 'var(--chart-1)',
    note: 'var(--note-lilac)',
    icon: 'grid',
    lessons: [
      { id: 'memory-management', doodle: 'memgrid', hook: 'Many programs, one memory. Who gets which piece?', title: 'Memory Management', blurb: 'Address binding, allocation, fragmentation, paging and segmentation.' },
      { id: 'virtual-memory', doodle: 'swap', hook: 'Pretend there is more memory than there really is, and get away with it.', title: 'Virtual Memory', blurb: 'Demand paging, page replacement, working sets and thrashing.' },
    ],
  },
  {
    id: 5,
    title: 'Storage and Distributed Systems',
    tagline: 'From one spinning disk to thousands of commodity machines.',
    color: 'var(--chart-3)',
    note: 'var(--note-mint)',
    icon: 'database',
    lessons: [
      { id: 'storage-and-raid', doodle: 'disk', hook: 'Disks are slow and they fail. Schedule them well and keep spare copies.', title: 'Secondary Storage and RAID', blurb: 'Disk scheduling and redundant arrays.' },
      { id: 'file-systems', doodle: 'folder', hook: 'How a pile of numbered blocks becomes files and folders.', title: 'File Systems', blurb: 'Files, directories, allocation methods and free space.' },
      { id: 'hdfs', doodle: 'racks', hook: 'One huge file system built from thousands of cheap machines that keep breaking.', title: 'Hadoop Distributed File System', blurb: 'NameNodes, DataNodes, replication and failure handling.' },
      { id: 'mapreduce', doodle: 'funnel', hook: 'Crunch enormous data by splitting the work, then gathering the answers.', title: 'MapReduce', blurb: 'Processing huge datasets with map, shuffle and reduce.' },
      { id: 'cloud-and-distributed', doodle: 'cloud', hook: 'Computing as a utility: rent what you need, when you need it.', title: 'Cloud and Distributed Computing', blurb: 'Clusters, grids, clouds and their service models.' },
      { id: 'virtual-machines', doodle: 'nested', hook: 'One real computer pretending to be many.', title: 'Virtual Machines', blurb: 'Hypervisors, trap-and-emulate and paravirtualization.' },
    ],
  },
];

export const allLessons = units.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));

export function findLesson(id: string) {
  return allLessons.find((l) => l.id === id);
}
