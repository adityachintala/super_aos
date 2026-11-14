import { describe, expect, test } from 'bun:test';
import { predictBursts, realTime, rmBound, schedule, utilization, type Proc } from './sched';

const at0 = (bursts: number[], prios?: number[]): Proc[] => bursts.map((burst, i) => ({ id: `P${i + 1}`, arrival: 0, burst, priority: prios?.[i] ?? 0 }));
const waits = (r: ReturnType<typeof schedule>) => r.stats.map((s) => s.waiting);
const chart = (r: ReturnType<typeof schedule>) => r.gantt.map((s) => `${s.id ?? 'idle'}:${s.start}-${s.end}`).join(' ');

describe('FCFS', () => {
  test('long job first: average wait 17 (the convoy effect)', () => {
    const r = schedule(at0([24, 3, 3]), 'fcfs');
    expect(waits(r)).toEqual([0, 24, 27]);
    expect(r.avgWaiting).toBe(17);
  });
  test('short jobs first: average wait 3', () => {
    expect(schedule(at0([3, 3, 24]), 'fcfs').avgWaiting).toBe(3);
  });
  test('the CPU idles until the first arrival', () => {
    const r = schedule([{ id: 'P1', arrival: 3, burst: 2, priority: 0 }], 'fcfs');
    expect(chart(r)).toBe('idle:0-3 P1:3-5');
    expect(r.stats[0].waiting).toBe(0);
  });
});

describe('SJF', () => {
  const procs: Proc[] = [
    { id: 'P1', arrival: 0, burst: 7, priority: 0 },
    { id: 'P2', arrival: 2, burst: 4, priority: 0 },
    { id: 'P3', arrival: 4, burst: 1, priority: 0 },
    { id: 'P4', arrival: 5, burst: 4, priority: 0 },
  ];
  test('non-preemptive: average wait 4', () => {
    const r = schedule(procs, 'sjf');
    expect(chart(r)).toBe('P1:0-7 P3:7-8 P2:8-12 P4:12-16');
    expect(waits(r)).toEqual([0, 6, 3, 7]);
    expect(r.avgWaiting).toBe(4);
  });
  test('preemptive (shortest remaining time first): average wait 3', () => {
    const r = schedule(procs, 'srtf');
    expect(chart(r)).toBe('P1:0-2 P2:2-4 P3:4-5 P2:5-7 P4:7-11 P1:11-16');
    expect(waits(r)).toEqual([9, 1, 0, 2]);
    expect(r.avgWaiting).toBe(3);
  });
  test('all arriving together: 6, 8, 7, 3 gives average wait 7', () => {
    expect(schedule(at0([6, 8, 7, 3]), 'sjf').avgWaiting).toBe(7);
  });
  test('SJF never has a longer average wait than FCFS', () => {
    for (const bursts of [[6, 8, 7, 3], [24, 3, 3], [5, 5, 5], [1, 9, 2, 8]]) expect(schedule(at0(bursts), 'sjf').avgWaiting).toBeLessThanOrEqual(schedule(at0(bursts), 'fcfs').avgWaiting);
  });
});

describe('priority', () => {
  test('textbook example: average wait 8.2', () => {
    const r = schedule(at0([10, 1, 2, 1, 5], [3, 1, 4, 5, 2]), 'prio');
    expect(chart(r)).toBe('P2:0-1 P5:1-6 P1:6-16 P3:16-18 P4:18-19');
    expect(r.avgWaiting).toBeCloseTo(8.2);
  });
  test('preemptive priority lets a late, urgent arrival take the CPU', () => {
    const r = schedule(
      [
        { id: 'P1', arrival: 0, burst: 5, priority: 3 },
        { id: 'P2', arrival: 2, burst: 2, priority: 1 },
      ],
      'prio-p',
    );
    expect(chart(r)).toBe('P1:0-2 P2:2-4 P1:4-7');
  });
});

describe('round robin', () => {
  test('quantum 20 on bursts 53, 17, 68, 24', () => {
    const r = schedule(at0([53, 17, 68, 24]), 'rr', 20);
    expect(chart(r)).toBe('P1:0-20 P2:20-37 P3:37-57 P4:57-77 P1:77-97 P3:97-117 P4:117-121 P1:121-134 P3:134-162');
    expect(waits(r)).toEqual([81, 20, 94, 97]);
    expect(r.avgWaiting).toBe(73);
  });
  test('quantum 4 on bursts 24, 3, 3: average wait 5.67', () => {
    const r = schedule(at0([24, 3, 3]), 'rr', 4);
    expect(waits(r)).toEqual([6, 4, 7]);
    expect(r.avgWaiting).toBeCloseTo(5.667, 2);
  });
  test('a very large quantum turns round robin into FCFS', () => {
    expect(chart(schedule(at0([24, 3, 3]), 'rr', 100))).toBe(chart(schedule(at0([24, 3, 3]), 'fcfs')));
  });
  test('smaller quanta mean more context switches', () => {
    const p = at0([10]);
    expect(schedule([...p, ...at0([10]).map((x) => ({ ...x, id: 'P2' }))], 'rr', 1).contextSwitches).toBe(19);
    expect(schedule([...p, ...at0([10]).map((x) => ({ ...x, id: 'P2' }))], 'rr', 6).contextSwitches).toBe(3);
  });
  test('response time is bounded by (n - 1) quanta', () => {
    const r = schedule(at0([30, 30, 30, 30]), 'rr', 5);
    expect(Math.max(...r.stats.map((s) => s.response))).toBe(15);
  });
});

describe('multilevel feedback queue', () => {
  test('a short job finishes in the top queue; a long one is demoted twice', () => {
    const r = schedule(at0([5, 40]), 'mlfq');
    expect(r.gantt.map((s) => `${s.id}@${s.level}:${s.start}-${s.end}`).join(' ')).toBe('P1@0:0-5 P2@0:5-13 P2@1:13-29 P2@2:29-45');
  });
  test('a new arrival in the top queue preempts a job running from a lower queue', () => {
    const r = schedule(
      [
        { id: 'P1', arrival: 0, burst: 30, priority: 0 },
        { id: 'P2', arrival: 10, burst: 3, priority: 0 },
      ],
      'mlfq',
    );
    // A preempted job goes back to the head of its queue and gets a fresh quantum when it resumes.
    expect(r.gantt.map((s) => `${s.id}@${s.level}:${s.start}-${s.end}`).join(' ')).toBe('P1@0:0-8 P1@1:8-10 P2@0:10-13 P1@1:13-29 P1@2:29-33');
    expect(r.stats[1].response).toBe(0);
  });
});

describe('every algorithm', () => {
  test('does exactly the work asked of it', () => {
    const procs: Proc[] = [
      { id: 'P1', arrival: 0, burst: 8, priority: 2 },
      { id: 'P2', arrival: 1, burst: 4, priority: 1 },
      { id: 'P3', arrival: 2, burst: 9, priority: 3 },
      { id: 'P4', arrival: 3, burst: 5, priority: 2 },
    ];
    for (const a of ['fcfs', 'sjf', 'srtf', 'prio', 'prio-p', 'rr', 'mlfq'] as const) {
      const r = schedule(procs, a, 3);
      for (const p of procs) expect(r.gantt.filter((s) => s.id === p.id).reduce((x, s) => x + s.end - s.start, 0)).toBe(p.burst);
      expect(r.gantt[r.gantt.length - 1].end).toBe(26);
      for (const s of r.stats) expect(s.waiting).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('burst prediction', () => {
  test('exponential averaging with alpha = 1/2 and an initial guess of 10', () => {
    expect(predictBursts([6, 4, 6, 4, 13, 13, 13], 0.5, 10)).toEqual([10, 8, 6, 6, 5, 9, 11, 12]);
  });
  test('alpha = 0 ignores history; alpha = 1 uses only the last burst', () => {
    expect(predictBursts([6, 4], 0, 10)).toEqual([10, 10, 10]);
    expect(predictBursts([6, 4], 1, 10)).toEqual([10, 6, 4]);
  });
});

describe('real-time scheduling', () => {
  const easy = [
    { name: 'P1', period: 50, burst: 20 },
    { name: 'P2', period: 100, burst: 35 },
  ];
  const tight = [
    { name: 'P1', period: 50, burst: 25 },
    { name: 'P2', period: 80, burst: 35 },
  ];
  test('utilisation and the rate-monotonic bound', () => {
    expect(utilization(easy)).toBeCloseTo(0.75);
    expect(utilization(tight)).toBeCloseTo(0.9375);
    expect(rmBound(2)).toBeCloseTo(0.828, 3);
    expect(rmBound(1)).toBe(1);
  });
  test('rate monotonic meets every deadline when utilisation is under the bound', () => {
    expect(realTime(easy, 'rm', 400).misses).toEqual([]);
  });
  test('rate monotonic misses a deadline at 80 on the tight task set; EDF does not', () => {
    const rm = realTime(tight, 'rm', 400);
    expect(rm.misses[0]).toEqual({ task: 1, at: 80 });
    expect(realTime(tight, 'edf', 400).misses).toEqual([]);
  });
  test('nothing can schedule a task set that needs more than 100% of the CPU', () => {
    const over = [
      { name: 'P1', period: 10, burst: 6 },
      { name: 'P2', period: 10, burst: 6 },
    ];
    expect(realTime(over, 'edf', 100).misses.length).toBeGreaterThan(0);
  });
});
