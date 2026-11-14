// Pure logic behind the memory-management visualizations.

export type Strategy = 'first' | 'best' | 'worst';

export interface Segment {
  size: number;
  /** null = free hole; otherwise the name of the owner. */
  owner: string | null;
  /** Fixed segments (e.g. the OS) are never moved by compaction. */
  fixed?: boolean;
}

/** Builds a memory image where the given holes are separated by small occupied blocks. */
export function memoryFromHoles(holes: number[], spacer = 40): Segment[] {
  const segs: Segment[] = [];
  holes.forEach((h, i) => {
    segs.push({ size: spacer, owner: `used${i + 1}`, fixed: false });
    segs.push({ size: h, owner: null });
  });
  return segs;
}

/** Index of the hole the strategy would choose, or -1 if no hole is big enough. */
export function chooseHole(segs: Segment[], size: number, strategy: Strategy): number {
  let pick = -1;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (s.owner !== null || s.size < size) continue;
    if (strategy === 'first') return i;
    if (pick === -1) pick = i;
    else if (strategy === 'best' && s.size < segs[pick].size) pick = i;
    else if (strategy === 'worst' && s.size > segs[pick].size) pick = i;
  }
  return pick;
}

/** Places a process, splitting the chosen hole. Returns null if it does not fit anywhere. */
export function place(segs: Segment[], owner: string, size: number, strategy: Strategy): Segment[] | null {
  const i = chooseHole(segs, size, strategy);
  if (i === -1) return null;
  const out = segs.slice();
  const rest = segs[i].size - size;
  const repl: Segment[] = [{ size, owner }];
  if (rest > 0) repl.push({ size: rest, owner: null });
  out.splice(i, 1, ...repl);
  return out;
}

/** Frees a process and merges adjacent holes. */
export function release(segs: Segment[], owner: string): Segment[] {
  const out: Segment[] = [];
  for (const s of segs) {
    const seg = s.owner === owner ? { size: s.size, owner: null } : s;
    const last = out[out.length - 1];
    if (seg.owner === null && last && last.owner === null) out[out.length - 1] = { size: last.size + seg.size, owner: null };
    else out.push(seg);
  }
  return out;
}

/** Slides every occupied segment to the low end, leaving one hole at the top. */
export function compact(segs: Segment[]): Segment[] {
  const used = segs.filter((s) => s.owner !== null);
  const free = segs.filter((s) => s.owner === null).reduce((a, s) => a + s.size, 0);
  return free > 0 ? [...used, { size: free, owner: null }] : used;
}

export function freeStats(segs: Segment[]) {
  const holes = segs.filter((s) => s.owner === null).map((s) => s.size);
  return {
    totalFree: holes.reduce((a, b) => a + b, 0),
    largestHole: holes.length ? Math.max(...holes) : 0,
    holeCount: holes.length,
  };
}

/** Runs a whole request queue. Requests that do not fit are skipped and reported as waiting. */
export function runQueue(segs: Segment[], queue: { name: string; size: number }[], strategy: Strategy) {
  let cur = segs;
  const waiting: string[] = [];
  for (const r of queue) {
    const next = place(cur, r.name, r.size, strategy);
    if (next) cur = next;
    else waiting.push(r.name);
  }
  return { segs: cur, waiting };
}

// ---------- Paging ----------

export interface Translation {
  page: number;
  offset: number;
  frame: number | null;
  physical: number | null;
  fault: boolean;
}

/** Splits a logical address and maps it through a single-level page table. */
export function translate(addr: number, pageSize: number, pageTable: (number | null)[]): Translation {
  const page = Math.floor(addr / pageSize);
  const offset = addr % pageSize;
  const frame = pageTable[page] ?? null;
  return { page, offset, frame, physical: frame === null ? null : frame * pageSize + offset, fault: frame === null };
}

/** Bit layout of a multi-level page table where every table fits in exactly one page. */
export function pageTableLayout(addressBits: number, pageSize: number, pteSize: number) {
  const offsetBits = Math.log2(pageSize);
  const bitsPerLevel = Math.log2(pageSize / pteSize);
  const pageBits = Math.max(0, addressBits - offsetBits);
  const levels = Math.ceil(pageBits / bitsPerLevel);
  // The outermost level takes whatever bits are left over.
  const fields: number[] = [];
  let left = pageBits;
  for (let i = 0; i < levels; i++) {
    const b = Math.min(bitsPerLevel, left);
    fields.unshift(b);
    left -= b;
  }
  return { offsetBits, bitsPerLevel, pageBits, levels, fields };
}

/** Effective access time with a TLB (times in the same unit, hit ratio in 0..1). */
export function effectiveAccessTime(hitRatio: number, tlbTime: number, memTime: number, levels = 1): number {
  return hitRatio * (tlbTime + memTime) + (1 - hitRatio) * (tlbTime + (levels + 1) * memTime);
}
