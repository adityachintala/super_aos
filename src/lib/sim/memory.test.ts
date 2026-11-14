import { describe, expect, test } from 'bun:test';
import { compact, effectiveAccessTime, freeStats, memoryFromHoles, pageTableLayout, place, release, runQueue, translate } from './memory';

// Classic exercise: holes of 100K, 500K, 200K, 300K, 600K; requests 212K, 417K, 112K, 426K.
const holes = [100, 500, 200, 300, 600];
const queue = [
  { name: 'P1', size: 212 },
  { name: 'P2', size: 417 },
  { name: 'P3', size: 112 },
  { name: 'P4', size: 426 },
];
const holeSizes = (segs: ReturnType<typeof memoryFromHoles>) => segs.filter((s) => s.owner === null).map((s) => s.size);

describe('placement strategies', () => {
  test('first fit leaves 426K waiting', () => {
    const r = runQueue(memoryFromHoles(holes), queue, 'first');
    expect(r.waiting).toEqual(['P4']);
    expect(holeSizes(r.segs)).toEqual([100, 176, 200, 300, 183]);
  });
  test('best fit places everything', () => {
    const r = runQueue(memoryFromHoles(holes), queue, 'best');
    expect(r.waiting).toEqual([]);
    expect(holeSizes(r.segs)).toEqual([100, 83, 88, 88, 174]);
  });
  test('worst fit leaves 426K waiting', () => {
    const r = runQueue(memoryFromHoles(holes), queue, 'worst');
    expect(r.waiting).toEqual(['P4']);
    expect(holeSizes(r.segs)).toEqual([100, 83, 200, 300, 276]);
  });
  test('best fit is not always best', () => {
    const q = [180, 120, 100, 100].map((size, i) => ({ name: `P${i + 1}`, size }));
    expect(runQueue(memoryFromHoles([300, 200]), q, 'first').waiting).toEqual([]);
    expect(runQueue(memoryFromHoles([300, 200]), q, 'best').waiting).toEqual(['P4']);
    expect(runQueue(memoryFromHoles([300, 200]), q, 'worst').waiting).toEqual(['P4']);
  });
  test('place returns null when nothing fits', () => {
    expect(place(memoryFromHoles([50, 60]), 'X', 100, 'first')).toBeNull();
  });
});

describe('release and compaction', () => {
  test('release merges neighbouring holes', () => {
    const segs = [
      { size: 10, owner: null },
      { size: 20, owner: 'A' },
      { size: 30, owner: null },
    ];
    expect(release(segs, 'A')).toEqual([{ size: 60, owner: null }]);
  });
  test('compaction makes one hole of all free space', () => {
    const r = runQueue(memoryFromHoles(holes), queue, 'first');
    const before = freeStats(r.segs);
    const after = freeStats(compact(r.segs));
    expect(before.largestHole).toBe(300);
    expect(after.holeCount).toBe(1);
    expect(after.largestHole).toBe(before.totalFree);
    expect(place(compact(r.segs), 'P4', 426, 'first')).not.toBeNull();
  });
});

describe('paging', () => {
  test('translate splits page and offset', () => {
    // page size 4, page table from the standard 32-byte example: page 0->5, 1->6, 2->1, 3->2
    const pt = [5, 6, 1, 2];
    expect(translate(0, 4, pt).physical).toBe(20);
    expect(translate(3, 4, pt).physical).toBe(23);
    expect(translate(4, 4, pt).physical).toBe(24);
    expect(translate(13, 4, pt).physical).toBe(9);
  });
  test('unmapped page faults', () => {
    expect(translate(9, 4, [1, null, null]).fault).toBe(true);
  });
  test('64-bit space, 4K pages, 4-byte entries needs 6 levels', () => {
    const l = pageTableLayout(64, 4096, 4);
    expect(l.offsetBits).toBe(12);
    expect(l.bitsPerLevel).toBe(10);
    expect(l.levels).toBe(6);
    expect(l.fields).toEqual([2, 10, 10, 10, 10, 10]);
  });
  test('32-bit space, 4K pages, 4-byte entries needs 2 levels', () => {
    expect(pageTableLayout(32, 4096, 4).fields).toEqual([10, 10]);
  });
  test('effective access time', () => {
    expect(effectiveAccessTime(0.8, 20, 100)).toBeCloseTo(140);
    expect(effectiveAccessTime(0.98, 20, 100)).toBeCloseTo(122);
  });
});
