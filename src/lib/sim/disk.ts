// Pure logic behind the storage visualizations: HDD scheduling, I/O timing and RAID.

export type DiskAlgo = 'fcfs' | 'sstf' | 'scan' | 'cscan' | 'look' | 'clook';
export type Direction = 'up' | 'down';

export interface Schedule {
  /** Every cylinder the head visits, starting with its initial position. */
  path: number[];
  /** Total head movement in cylinders, including any return trip. */
  total: number;
}

/**
 * Orders a queue of cylinder requests. `max` is the highest cylinder number.
 * SCAN and C-SCAN travel to the edge of the disk; LOOK and C-LOOK turn at the last request.
 */
export function schedule(queue: number[], head: number, algo: DiskAlgo, dir: Direction = 'up', max = 199): Schedule {
  const path = [head];
  const asc = [...queue].sort((a, b) => a - b);
  const above = asc.filter((c) => c >= head);
  const below = asc.filter((c) => c < head).reverse(); // nearest first when moving down

  if (algo === 'fcfs') path.push(...queue);
  else if (algo === 'sstf') {
    const left = [...queue];
    let pos = head;
    while (left.length) {
      let best = 0;
      left.forEach((c, i) => {
        if (Math.abs(c - pos) < Math.abs(left[best] - pos)) best = i;
      });
      pos = left.splice(best, 1)[0];
      path.push(pos);
    }
  } else {
    const first = dir === 'up' ? above : below;
    const second = dir === 'up' ? below : above;
    const edge = dir === 'up' ? max : 0;
    const farEdge = dir === 'up' ? 0 : max;
    path.push(...first);
    if (second.length) {
      if (algo === 'scan') {
        if (path[path.length - 1] !== edge) path.push(edge);
        path.push(...second);
      } else if (algo === 'look') path.push(...second);
      else {
        // Circular variants: jump back and keep sweeping in the same direction.
        if (algo === 'cscan') {
          if (path[path.length - 1] !== edge) path.push(edge);
          path.push(farEdge);
        }
        path.push(...[...second].reverse());
      }
    }
  }

  let total = 0;
  for (let i = 1; i < path.length; i++) total += Math.abs(path[i] - path[i - 1]);
  return { path, total };
}

// ---------- Timing ----------

/** Time for one full revolution, in milliseconds. */
export const revolutionMs = (rpm: number) => 60_000 / rpm;

export interface IoTimeInput {
  seekMs: number;
  rpm: number;
  sizeKB: number;
  /** Transfer rate in gigabits per second. */
  rateGbps: number;
  overheadMs: number;
}

/** Average I/O time = seek + half a revolution + transfer + controller overhead. */
export function ioTime(i: IoTimeInput) {
  const latencyMs = revolutionMs(i.rpm) / 2;
  // sizeKB kilobytes = sizeKB * 8 kilobits; rate in kilobits per ms = rateGbps * 1024^2 / 1000.
  const transferMs = (i.sizeKB * 8) / ((i.rateGbps * 1024 * 1024) / 1000);
  return { seekMs: i.seekMs, latencyMs, transferMs, overheadMs: i.overheadMs, totalMs: i.seekMs + latencyMs + transferMs + i.overheadMs };
}

// ---------- RAID ----------

export type RaidLevel = '0' | '1' | '4' | '5' | '6' | '10' | '01';

export interface RaidCell {
  label: string;
  kind: 'data' | 'parity' | 'mirror';
}

export interface RaidInfo {
  name: string;
  disks: number;
  /** Fraction of raw capacity that holds user data. */
  usable: number;
  /** Disk failures it is guaranteed to survive. */
  tolerates: number;
  /** rows[stripe][disk] */
  rows: RaidCell[][];
  /** Groups of disks drawn together (mirror pairs or stripe sets). */
  groups?: number[][];
}

const STRIPES = 4;
const d = (n: number): RaidCell => ({ label: `D${n}`, kind: 'data' });
const m = (n: number): RaidCell => ({ label: `D${n}`, kind: 'mirror' });

export function raidInfo(level: RaidLevel): RaidInfo {
  const rows: RaidCell[][] = [];
  switch (level) {
    case '0':
      for (let s = 0; s < STRIPES; s++) rows.push([0, 1, 2, 3].map((i) => d(s * 4 + i)));
      return { name: 'RAID 0 · striping, no redundancy', disks: 4, usable: 1, tolerates: 0, rows };
    case '1':
      for (let s = 0; s < STRIPES; s++) rows.push([d(s), m(s)]);
      return { name: 'RAID 1 · mirroring', disks: 2, usable: 0.5, tolerates: 1, rows, groups: [[0, 1]] };
    case '4':
      for (let s = 0; s < STRIPES; s++) rows.push([...[0, 1, 2, 3].map((i) => d(s * 4 + i)), { label: `P${s}`, kind: 'parity' }]);
      return { name: 'RAID 4 · block striping, dedicated parity disk', disks: 5, usable: 4 / 5, tolerates: 1, rows };
    case '5':
      for (let s = 0; s < STRIPES; s++) {
        const row: RaidCell[] = [];
        const parityAt = 4 - (s % 5);
        let n = s * 4;
        for (let i = 0; i < 5; i++) row.push(i === parityAt ? { label: `P${s}`, kind: 'parity' } : d(n++));
        rows.push(row);
      }
      return { name: 'RAID 5 · block striping, distributed parity', disks: 5, usable: 4 / 5, tolerates: 1, rows };
    case '6':
      for (let s = 0; s < STRIPES; s++) {
        const row: RaidCell[] = [];
        const p = (5 - s + 6) % 6;
        const q = (p + 5) % 6;
        let n = s * 4;
        for (let i = 0; i < 6; i++) row.push(i === p ? { label: `P${s}`, kind: 'parity' } : i === q ? { label: `Q${s}`, kind: 'parity' } : d(n++));
        rows.push(row);
      }
      return { name: 'RAID 6 · block striping, two parity blocks per stripe', disks: 6, usable: 4 / 6, tolerates: 2, rows };
    case '10':
      for (let s = 0; s < STRIPES; s++) rows.push([d(s * 2), m(s * 2), d(s * 2 + 1), m(s * 2 + 1)]);
      return { name: 'RAID 1+0 · mirrored pairs, then striped', disks: 4, usable: 0.5, tolerates: 1, rows, groups: [[0, 1], [2, 3]] };
    case '01':
      for (let s = 0; s < STRIPES; s++) rows.push([d(s * 2), d(s * 2 + 1), m(s * 2), m(s * 2 + 1)]);
      return { name: 'RAID 0+1 · two stripe sets, then mirrored', disks: 4, usable: 0.5, tolerates: 1, rows, groups: [[0, 1], [2, 3]] };
  }
}

/** Does the array still hold all its data after the given disks have failed? */
export function raidSurvives(level: RaidLevel, failed: number[]): boolean {
  const f = new Set(failed);
  switch (level) {
    case '0':
      return f.size === 0;
    case '1':
      return f.size < 2;
    case '4':
    case '5':
      return f.size <= 1;
    case '6':
      return f.size <= 2;
    case '10':
      // Dead only if both halves of some mirrored pair are gone.
      return !(f.has(0) && f.has(1)) && !(f.has(2) && f.has(3));
    case '01':
      // Alive only if one whole stripe set is intact.
      return (!f.has(0) && !f.has(1)) || (!f.has(2) && !f.has(3));
  }
}

/** Parity of equal-width blocks is their bitwise XOR. */
export const parity = (blocks: number[]) => blocks.reduce((a, b) => a ^ b, 0);

/** Rebuilds one missing block from the survivors and the parity. */
export const rebuild = (survivors: number[], parityBlock: number) => parity([...survivors, parityBlock]);

/** Mean time to failure of an array of n independent disks, with no redundancy. */
export const arrayMttf = (diskMttfHours: number, n: number) => diskMttfHours / n;
