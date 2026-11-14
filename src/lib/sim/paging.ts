// Pure logic behind the virtual-memory visualizations.

export type Algorithm = 'fifo' | 'lru' | 'opt' | 'clock';

export interface Step {
  ref: number;
  /** Frame contents after this reference (null = empty frame). */
  frames: (number | null)[];
  fault: boolean;
  /** Index of the frame that was written on a fault. */
  loadedInto: number | null;
  /** Page that was evicted, if any. */
  victim: number | null;
  /** Clock only: reference bits and hand position after this reference. */
  bits?: number[];
  hand?: number;
}

export function parseRefs(text: string): number[] {
  return text
    .split(/[\s,]+/)
    .filter((t) => t !== '')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0);
}

/** Runs a page-replacement algorithm over a reference string. */
export function simulate(refs: number[], frameCount: number, algo: Algorithm): { steps: Step[]; faults: number } {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const loadedAt: number[] = Array(frameCount).fill(-1);
  const usedAt: number[] = Array(frameCount).fill(-1);
  const bits: number[] = Array(frameCount).fill(0);
  let hand = 0;
  let faults = 0;
  const steps: Step[] = [];

  refs.forEach((ref, t) => {
    const at = frames.indexOf(ref);
    let loadedInto: number | null = null;
    let victim: number | null = null;

    if (at !== -1) {
      usedAt[at] = t;
      bits[at] = 1;
    } else {
      faults += 1;
      let target = frames.indexOf(null);
      if (algo === 'clock') {
        // The hand sweeps even over free frames so that it stays in clock order.
        if (target === -1) {
          while (bits[hand] === 1) {
            bits[hand] = 0;
            hand = (hand + 1) % frameCount;
          }
          target = hand;
        }
        hand = (target + 1) % frameCount;
      } else if (target === -1) {
        if (algo === 'fifo') target = loadedAt.indexOf(Math.min(...loadedAt));
        else if (algo === 'lru') target = usedAt.indexOf(Math.min(...usedAt));
        else {
          // OPT: evict the page whose next use is farthest away (or never).
          let best = -1;
          frames.forEach((p, i) => {
            const next = refs.indexOf(p as number, t + 1);
            const dist = next === -1 ? Infinity : next;
            if (dist > best) {
              best = dist;
              target = i;
            }
          });
        }
      }
      victim = frames[target];
      frames[target] = ref;
      loadedAt[target] = t;
      usedAt[target] = t;
      bits[target] = 1;
      loadedInto = target;
    }

    steps.push({
      ref,
      frames: frames.slice(),
      fault: at === -1,
      loadedInto,
      victim,
      ...(algo === 'clock' ? { bits: bits.slice(), hand } : {}),
    });
  });

  return { steps, faults };
}

/** The working set at each time t: distinct pages among the last `delta` references. */
export function workingSets(refs: number[], delta: number): number[][] {
  return refs.map((_, t) => [...new Set(refs.slice(Math.max(0, t - delta + 1), t + 1))].sort((a, b) => a - b));
}

/** Effective access time under demand paging. All times in the same unit. */
export function demandPagingEAT(p: number, memoryTime: number, faultTime: number): number {
  return (1 - p) * memoryTime + p * faultTime;
}

/** Proportional frame allocation: each process gets frames in proportion to its size. */
export function proportionalAllocation(sizes: number[], frames: number): number[] {
  const total = sizes.reduce((a, b) => a + b, 0);
  return sizes.map((s) => (s / total) * frames);
}
