import { describe, expect, test } from 'bun:test';
import { cwndTrace, fairness, maxMin, playoutDelay, rateTrajectory, rtoTrace } from './transport';

describe('max-min fairness', () => {
  test('small demands are met in full and the rest is shared equally', () => {
    expect(maxMin(10, [2, 2.6, 4, 5])).toEqual([2, 2.6, 2.7, 2.7]);
    expect(maxMin(12, [2, 8, 8])).toEqual([2, 5, 5]);
  });
  test('when everything fits, everyone gets what they asked for', () => {
    expect(maxMin(20, [3, 4, 5])).toEqual([3, 4, 5]);
  });
  test('equal greedy flows split the link equally', () => {
    expect(maxMin(9, [100, 100, 100])).toEqual([3, 3, 3]);
  });
});

describe('rate control laws', () => {
  test('AIMD converges towards a fair split', () => {
    const pts = rateTrajectory('aimd', 2, 30, 40, 400);
    expect(fairness(pts[0])).toBeLessThan(0.1);
    expect(fairness(pts[pts.length - 1])).toBeGreaterThan(0.95);
  });
  test('additive increase with additive decrease never changes the gap', () => {
    const pts = rateTrajectory('aiad', 5, 25, 40, 200);
    for (const [x, y] of pts) expect(y - x).toBe(20);
  });
  test('multiplicative increase with multiplicative decrease never changes the ratio', () => {
    const pts = rateTrajectory('mimd', 5, 25, 40, 200);
    for (const p of pts) expect(fairness(p)).toBeCloseTo(0.2, 6);
  });
});

describe('TCP congestion window', () => {
  test('slow start doubles up to the threshold, then additive increase', () => {
    const t = cwndTrace('tahoe', 9, {}, 32);
    expect(t.map((p) => p.cwnd)).toEqual([1, 2, 4, 8, 16, 32, 33, 34, 35]);
    expect(t[4].phase).toBe('slow start');
    expect(t[5].phase).toBe('congestion avoidance');
  });
  test('Tahoe restarts from one segment after any loss', () => {
    const t = cwndTrace('tahoe', 20, { 13: 'dupack' }, 32);
    expect(t[13].cwnd).toBe(40);
    expect(t[14]).toMatchObject({ cwnd: 1, ssthresh: 20 });
    expect(t.slice(14, 20).map((p) => p.cwnd)).toEqual([1, 2, 4, 8, 16, 20]);
  });
  test('Reno halves the window after duplicate ACKs but restarts after a timeout', () => {
    const fast = cwndTrace('reno', 17, { 13: 'dupack' }, 32);
    expect(fast.slice(14, 17).map((p) => p.cwnd)).toEqual([20, 21, 22]);
    const slow = cwndTrace('reno', 16, { 13: 'timeout' }, 32);
    expect(slow[14]).toMatchObject({ cwnd: 1, ssthresh: 20 });
  });
});

describe('retransmission timer', () => {
  test('a steady RTT gives a timeout that settles just above it', () => {
    const t = rtoTrace(Array(40).fill(100));
    expect(t[0]).toMatchObject({ srtt: 100, rttvar: 50, rto: 300 });
    expect(t[39].srtt).toBe(100);
    expect(t[39].rto).toBeLessThan(101);
  });
  test('one slow sample moves the estimate only a little but widens the timeout', () => {
    const t = rtoTrace([...Array(30).fill(100), 300]);
    const before = t[29];
    const after = t[30];
    expect(after.srtt).toBeCloseTo(125, 3);
    expect(after.rttvar).toBeGreaterThan(before.rttvar + 49);
    expect(after.rto).toBeGreaterThan(300);
  });
  test('jitter decides the playout buffer, not the absolute delay', () => {
    expect(playoutDelay([0, 10, 20], [50, 62, 71])).toBe(2);
    expect(playoutDelay([0, 10, 20], [500, 512, 521])).toBe(2);
  });
});
