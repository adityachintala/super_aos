import { describe, expect, test } from 'bun:test';
import { demandPagingEAT, parseRefs, proportionalAllocation, simulate, workingSets } from './paging';

const belady = parseRefs('1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5');
const textbook = parseRefs('7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1');

describe('page replacement', () => {
  test('FIFO shows Belady anomaly: 9 faults with 3 frames, 10 with 4', () => {
    expect(simulate(belady, 3, 'fifo').faults).toBe(9);
    expect(simulate(belady, 4, 'fifo').faults).toBe(10);
  });
  test('OPT and LRU on the 12-reference string', () => {
    expect(simulate(belady, 4, 'opt').faults).toBe(6);
    expect(simulate(belady, 3, 'opt').faults).toBe(7);
    expect(simulate(belady, 4, 'lru').faults).toBe(8);
    expect(simulate(belady, 3, 'lru').faults).toBe(10);
  });
  test('classic 20-reference string with 3 frames', () => {
    expect(simulate(textbook, 3, 'fifo').faults).toBe(15);
    expect(simulate(textbook, 3, 'opt').faults).toBe(9);
    expect(simulate(textbook, 3, 'lru').faults).toBe(12);
  });
  test('OPT is never worse than the others; LRU and OPT never get worse with more frames', () => {
    for (let f = 1; f <= 7; f++) {
      const opt = simulate(textbook, f, 'opt').faults;
      for (const a of ['fifo', 'lru', 'clock'] as const) expect(simulate(textbook, f, a).faults).toBeGreaterThanOrEqual(opt);
      if (f > 1) {
        expect(simulate(textbook, f, 'lru').faults).toBeLessThanOrEqual(simulate(textbook, f - 1, 'lru').faults);
        expect(opt).toBeLessThanOrEqual(simulate(textbook, f - 1, 'opt').faults);
      }
    }
  });
  test('clock gives a referenced page a second chance', () => {
    const r = simulate([1, 2, 3, 4, 2, 5], 3, 'clock');
    // All bits are 1 at the first eviction, so it behaves like FIFO and evicts 1.
    expect(r.steps[3].victim).toBe(1);
    // Page 2 was referenced again, so it is skipped and 3 is evicted (FIFO would evict 2).
    expect(r.steps[5].victim).toBe(3);
    expect(simulate([1, 2, 3, 4, 2, 5], 3, 'fifo').steps[5].victim).toBe(2);
  });
  test('hits do not change frames', () => {
    const r = simulate([1, 2, 1], 2, 'lru');
    expect(r.steps[2].fault).toBe(false);
    expect(r.steps[2].frames).toEqual([1, 2]);
  });
});

describe('working set and timing', () => {
  test('working set over a window', () => {
    const ws = workingSets([1, 2, 3, 2, 1, 4, 2], 5);
    expect(ws[6]).toEqual([1, 2, 3, 4]);
    expect(ws[1]).toEqual([1, 2]);
    expect(workingSets([7, 7, 7, 7], 3)[3]).toEqual([7]);
  });
  test('demand paging effective access time', () => {
    expect(demandPagingEAT(0, 100, 25_000_000)).toBe(100);
    expect(demandPagingEAT(0.001, 100, 25_000_000)).toBeCloseTo(25_099.9);
  });
  test('proportional allocation', () => {
    const [a, b] = proportionalAllocation([10, 127], 64);
    expect(Math.round(a)).toBe(5);
    expect(Math.round(b)).toBe(59);
  });
});
