import { describe, expect, test } from 'bun:test';
import { debugEffort, hierarchyLinks, interruptsNeeded, legalAddress, meshLinks, newMachine, raise, run, runJobs, show, spool, step } from './foundations';

describe('coping with complexity', () => {
  test('K modules cut debugging effort by a factor of K', () => {
    expect(debugEffort(1000, 1)).toBe(1_000_000);
    expect(debugEffort(1000, 10)).toBe(100_000);
    expect(debugEffort(1000, 1) / debugEffort(1000, 10)).toBe(10);
  });
  test('a full mesh of n components has n(n-1)/2 interconnections', () => {
    expect(meshLinks(4)).toBe(6);
    expect(meshLinks(16)).toBe(120);
  });
  test('a hierarchy has far fewer', () => {
    expect(hierarchyLinks(16, 4)).toEqual({ links: 30, levels: [16, 4, 1] });
    expect(hierarchyLinks(27, 3)).toEqual({ links: 39, levels: [27, 9, 3, 1] });
    expect(hierarchyLinks(5, 8).links).toBe(meshLinks(5));
  });
});

describe('spooling', () => {
  const jobs = [
    { read: 4, compute: 2, print: 4 },
    { read: 4, compute: 2, print: 4 },
    { read: 4, compute: 2, print: 4 },
  ];
  test('without spooling the CPU waits for the reader and the printer', () => {
    const r = spool(jobs, false);
    expect(r.total).toBe(30);
    expect(r.cpuBusy).toBe(6);
    expect(r.utilisation).toBeCloseTo(0.2);
    expect(r.cpu[1]).toEqual({ job: 1, start: 14, end: 16 });
  });
  test('with spooling the devices overlap', () => {
    const r = spool(jobs, true);
    expect(r.reader.map((s) => s.end)).toEqual([4, 8, 12]);
    expect(r.cpu.map((s) => [s.start, s.end])).toEqual([[4, 6], [8, 10], [12, 14]]);
    expect(r.printer.map((s) => [s.start, s.end])).toEqual([[6, 10], [10, 14], [14, 18]]);
    expect(r.total).toBe(18);
    expect(r.utilisation).toBeCloseTo(1 / 3);
  });
});

describe('multiprogramming', () => {
  const jobs = [[2, 6, 2], [2, 6, 2], [2, 6, 2]];
  test('one job at a time: the CPU idles during I/O', () => {
    const r = runJobs(jobs, false);
    expect(r.total).toBe(30);
    expect(r.cpuBusy).toBe(12);
    expect(r.utilisation).toBeCloseTo(0.4);
    expect(r.finish).toEqual([10, 20, 30]);
  });
  test('multiprogrammed: another job computes while one waits for I/O', () => {
    const r = runJobs(jobs, true);
    expect(r.total).toBe(14);
    expect(r.utilisation).toBeCloseTo(12 / 14);
    expect(r.finish).toEqual([10, 12, 14]);
    expect(r.rows[1]).toEqual([
      { job: 1, kind: 'ready', start: 0, end: 2 },
      { job: 1, kind: 'cpu', start: 2, end: 4 },
      { job: 1, kind: 'io', start: 4, end: 10 },
      { job: 1, kind: 'cpu', start: 10, end: 12 },
    ]);
  });
  test('a single job gains nothing', () => {
    expect(runJobs([[2, 6, 2]], true).total).toBe(runJobs([[2, 6, 2]], false).total);
  });
  test('the CPU is never given to two jobs at once', () => {
    const r = runJobs([[3, 2, 1], [1, 1, 4], [2, 5, 2], [4]], true);
    const busy = new Set<number>();
    for (const row of r.rows) for (const s of row) if (s.kind === 'cpu') for (let t = s.start; t < s.end; t++) {
      expect(busy.has(t)).toBe(false);
      busy.add(t);
    }
    expect(busy.size).toBe(r.cpuBusy);
  });
});

describe('the simple computer', () => {
  test('instructions are shown as mnemonics', () => {
    expect(show(0x1940)).toBe('LOAD 940');
    expect(show(0x5941)).toBe('ADD 941');
    expect(show(0x7000)).toBe('IRET');
  });
  test('fetch then execute', () => {
    let m = step(newMachine());
    expect(m).toMatchObject({ ir: 0x1940, pc: 0x301, phase: 'execute' });
    m = step(m);
    expect(m).toMatchObject({ ac: 3, phase: 'fetch' });
  });
  test('the program adds 3 and 2 and stores 5', () => {
    const m = run(newMachine());
    expect(m.halted).toBe(true);
    expect(m.mem[0x941]).toBe(5);
    expect(m.mem[0x942]).toBe(0);
  });
  test('an interrupt is serviced between instructions and the program still gets the right answer', () => {
    let m = step(newMachine()); // fetch LOAD
    m = raise(m);
    m = step(m); // execute LOAD, then notice the interrupt
    expect(m.phase).toBe('interrupt');
    m = step(m);
    expect(m).toMatchObject({ pc: 0x500, enabled: false, supervisor: true, pending: false });
    expect(m.saved).toEqual({ pc: 0x301, enabled: true, supervisor: false });
    m = run(m);
    expect(m.mem[0x942]).toBe(7);
    expect(m.mem[0x941]).toBe(5);
    expect(m).toMatchObject({ enabled: true, supervisor: false, saved: null });
  });
  test('a second interrupt waits while the first is being handled', () => {
    let m = step(step(raise(step(newMachine())))); // now at the handler, interrupts disabled
    m = step(step(raise(m))); // fetch and execute IN
    expect(m.phase).toBe('fetch');
    expect(m.pending).toBe(true);
    m = step(step(m)); // IRET re-enables interrupts, so the pending one is taken next
    expect(m.phase).toBe('interrupt');
  });
});

describe('hardware protection', () => {
  test('base and limit registers', () => {
    expect(legalAddress(300040, 300040, 120900)).toBe(true);
    expect(legalAddress(420939, 300040, 120900)).toBe(true);
    expect(legalAddress(420940, 300040, 120900)).toBe(false);
    expect(legalAddress(300039, 300040, 120900)).toBe(false);
  });
  test('DMA raises one interrupt per block', () => {
    expect(interruptsNeeded(4096, 512, false)).toBe(4096);
    expect(interruptsNeeded(4096, 512, true)).toBe(8);
  });
});
