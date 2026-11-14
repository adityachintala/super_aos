import { describe, expect, test } from 'bun:test';
import { poolSim, threadOutcome, timeline } from './threads';
import { amdahl } from './scaling';

describe('threading models', () => {
  test('many-to-one never runs in parallel, and one blocking call blocks the whole process', () => {
    expect(threadOutcome('m1', { user: 6, kernel: 1, cores: 4, blocked: 0 }).parallel).toBe(1);
    const b = threadOutcome('m1', { user: 6, kernel: 1, cores: 4, blocked: 1 });
    expect(b.parallel).toBe(0);
    expect(b.processBlocked).toBe(true);
  });
  test('one-to-one uses every core and survives blocking calls', () => {
    expect(threadOutcome('11', { user: 6, kernel: 0, cores: 4, blocked: 0 }).parallel).toBe(4);
    expect(threadOutcome('11', { user: 6, kernel: 0, cores: 4, blocked: 3 }).parallel).toBe(3);
  });
  test('many-to-many with fewer kernel threads than processors leaves processors idle', () => {
    const o = threadOutcome('mn', { user: 8, kernel: 2, cores: 4, blocked: 0 });
    expect(o.parallel).toBe(2);
    expect(o.idleCores).toBe(2);
  });
  test('many-to-many with as many kernel threads as processors uses them all, until one blocks', () => {
    expect(threadOutcome('mn', { user: 8, kernel: 4, cores: 4, blocked: 0 }).idleCores).toBe(0);
    expect(threadOutcome('mn', { user: 8, kernel: 4, cores: 4, blocked: 1 }).idleCores).toBe(1);
  });
  test('many-to-many with spare kernel threads keeps every processor busy despite blocking', () => {
    expect(threadOutcome('mn', { user: 8, kernel: 6, cores: 4, blocked: 2 }).idleCores).toBe(0);
  });
});

describe('concurrency and parallelism', () => {
  test('four tasks of three units: one core interleaves, four cores run in parallel', () => {
    const one = timeline(4, 3, 1);
    expect(one.finish).toBe(12);
    expect(one.rows[0].slice(0, 5)).toEqual([0, 1, 2, 3, 0]);
    const four = timeline(4, 3, 4);
    expect(four.finish).toBe(3);
    expect(four.rows.map((r) => r[0]).sort()).toEqual([0, 1, 2, 3]);
    expect(timeline(4, 3, 2).finish).toBe(6);
  });
  test('Amdahl: 25% serial gives 1.6 on two cores and can never pass 4', () => {
    expect(amdahl(0.25, 2)).toBeCloseTo(1.6);
    expect(amdahl(0.25, 4)).toBeCloseTo(2.286, 2);
    expect(amdahl(0.25, 1e9)).toBeLessThan(4);
  });
});

describe('thread pool', () => {
  const burst = [6, 0, 0, 0, 0, 0];
  test('a thread per request needs as many threads as the burst', () => {
    const r = poolSim(burst, 2, Infinity);
    expect(r.peakThreads).toBe(6);
    expect(r.meanWait).toBe(0);
  });
  test('a pool caps the threads and makes the excess wait', () => {
    const r = poolSim(burst, 2, 2);
    expect(r.peakThreads).toBe(2);
    expect(r.served).toBe(6);
    // Requests are served two at a time at ticks 0, 2 and 4: waits 0,0,2,2,4,4.
    expect(r.meanWait).toBe(2);
    expect(r.ticks[0]).toEqual({ arrived: 6, busy: 2, queued: 4 });
  });
  test('a big enough pool behaves like unlimited threads', () => {
    expect(poolSim(burst, 2, 6).meanWait).toBe(0);
  });
});
