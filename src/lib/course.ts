// The course outline. A lesson is "available" once an MDX file with the same id
// exists in src/content/lessons; until then it shows on the map as coming soon.

import type { IconName } from './icons';

export interface LessonMeta {
  id: string;
  title: string;
  blurb: string;
}

export interface Unit {
  id: number;
  title: string;
  tagline: string;
  /** A chart colour token, e.g. var(--chart-1). */
  color: string;
  icon: IconName;
  lessons: LessonMeta[];
}

export const units: Unit[] = [
  {
    id: 1,
    title: 'Foundations',
    tagline: 'What an operating system is, where it came from, and how it is put together.',
    color: 'var(--chart-4)',
    icon: 'stack',
    lessons: [
      { id: 'overview-and-complexity', title: 'System Complexity', blurb: 'Why big systems are hard, and the tools we use to tame them.' },
      { id: 'history', title: 'History of Operating Systems', blurb: 'From batch monitors to time sharing, UNIX and beyond.' },
      { id: 'hardware', title: 'Hardware Review', blurb: 'Interrupts, the storage hierarchy, caching and protection.' },
      { id: 'system-structures', title: 'System Structures', blurb: 'System calls, kernels, layers, microkernels and virtual machines.' },
    ],
  },
  {
    id: 2,
    title: 'Processes',
    tagline: 'Running many things at once without them tripping over each other.',
    color: 'var(--chart-5)',
    icon: 'cpu',
    lessons: [
      { id: 'processes-and-ipc', title: 'Processes and IPC', blurb: 'The process abstraction, context switches and message passing.' },
      { id: 'threads', title: 'Threads', blurb: 'Threading models, thread pools, concurrency versus parallelism.' },
      { id: 'cpu-scheduling', title: 'CPU Scheduling', blurb: 'FCFS, SJF, round robin, priorities and multilevel queues.' },
      { id: 'synchronization', title: 'Synchronization', blurb: 'Race conditions, critical sections, semaphores and monitors.' },
      { id: 'deadlocks', title: 'Deadlocks', blurb: 'Prevention, avoidance with the Banker’s algorithm, detection.' },
    ],
  },
  {
    id: 3,
    title: 'Networking',
    tagline: 'How machines talk: links, routes and reliable transport.',
    color: 'var(--chart-2)',
    icon: 'network',
    lessons: [
      { id: 'networking-intro-datalink', title: 'Networks and the Data Link Layer', blurb: 'Layering, framing, sliding windows and medium access.' },
      { id: 'network-layer', title: 'The Network Layer', blurb: 'Routing algorithms, congestion and quality of service.' },
      { id: 'transport-layer', title: 'The Transport Layer', blurb: 'Connections, the three-way handshake and congestion control.' },
    ],
  },
  {
    id: 4,
    title: 'Memory',
    tagline: 'Giving every process the illusion of its own private memory.',
    color: 'var(--chart-1)',
    icon: 'grid',
    lessons: [
      { id: 'memory-management', title: 'Memory Management', blurb: 'Address binding, allocation, fragmentation, paging and segmentation.' },
      { id: 'virtual-memory', title: 'Virtual Memory', blurb: 'Demand paging, page replacement, working sets and thrashing.' },
    ],
  },
  {
    id: 5,
    title: 'Storage and Distributed Systems',
    tagline: 'From one spinning disk to thousands of commodity machines.',
    color: 'var(--chart-3)',
    icon: 'database',
    lessons: [
      { id: 'storage-and-raid', title: 'Secondary Storage and RAID', blurb: 'Disk scheduling and redundant arrays.' },
      { id: 'file-systems', title: 'File Systems', blurb: 'Files, directories, allocation methods and free space.' },
      { id: 'hdfs', title: 'Hadoop Distributed File System', blurb: 'NameNodes, DataNodes, replication and failure handling.' },
      { id: 'mapreduce', title: 'MapReduce', blurb: 'Processing huge datasets with map, shuffle and reduce.' },
      { id: 'cloud-and-distributed', title: 'Cloud and Distributed Computing', blurb: 'Clusters, grids, clouds and their service models.' },
      { id: 'virtual-machines', title: 'Virtual Machines', blurb: 'Hypervisors, trap-and-emulate and paravirtualization.' },
    ],
  },
];

export const allLessons = units.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));

export function findLesson(id: string) {
  return allLessons.find((l) => l.id === id);
}
