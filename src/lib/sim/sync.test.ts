import { describe, expect, test } from 'bun:test';
import { canDeadlock, csCheck, inCritical, raceOutcomes, raceStart, raceStep, SEM_PRESETS, semDeadlocked, semStep, semSystem } from './sync';

describe('the counter race', () => {
  test('the textbook interleaving leaves counter at 4', () => {
    let s = raceStart(5);
    for (const who of ['P', 'P', 'C', 'C', 'P', 'C'] as const) s = raceStep(s, who);
    expect(s.counter).toBe(4);
  });
  test('running each process to completion in turn gives the right answer', () => {
    let s = raceStart(5);
    for (const who of ['P', 'P', 'P', 'C', 'C', 'C'] as const) s = raceStep(s, who);
    expect(s.counter).toBe(5);
  });
  test('of the 20 interleavings only 2 are correct', () => {
    expect(raceOutcomes(5)).toEqual({ 4: 9, 5: 2, 6: 9 });
  });
});

describe('two-process critical-section algorithms', () => {
  test('taking turns: mutual exclusion holds but progress fails (strict alternation)', () => {
    expect(csCheck('turn')).toEqual({ mutualExclusion: true, noDeadlock: true, progress: false });
  });
  test('flags set before testing: mutual exclusion holds but both can wait for ever', () => {
    const v = csCheck('flag');
    expect(v.mutualExclusion).toBe(true);
    expect(v.noDeadlock).toBe(false);
    expect(v.progress).toBe(false);
  });
  test('flags tested before setting: mutual exclusion is violated', () => {
    expect(csCheck('check-first').mutualExclusion).toBe(false);
  });
  test('Peterson: all three hold', () => {
    expect(csCheck('peterson')).toEqual({ mutualExclusion: true, noDeadlock: true, progress: true });
  });
});

describe('semaphore machine', () => {
  const preset = (id: string) => {
    const p = SEM_PRESETS.find((x) => x.id === id)!;
    return semSystem(p.sems, p.programs);
  };
  const run = (sys: ReturnType<typeof semSystem>, names: string[]) => names.reduce((s, n) => semStep(s, n), sys);

  test('a second process blocks on a taken mutex and is woken by signal', () => {
    let s = run(preset('mutex'), ['P1', 'P1']); // remainder, wait
    expect(s.sems.mutex).toBe(0);
    expect(inCritical(s)).toEqual(['P1']);
    s = run(s, ['P2', 'P2']);
    expect(s.procs[1].blockedOn).toBe('mutex');
    expect(s.queues.mutex).toEqual(['P2']);
    s = run(s, ['P1', 'P1']); // critical section, signal
    expect(s.procs[1].blockedOn).toBeNull();
    expect(inCritical(s)).toEqual(['P2']);
    expect(s.sems.mutex).toBe(0);
  });
  test('a blocked process cannot be stepped', () => {
    const s = run(preset('mutex'), ['P1', 'P1', 'P2', 'P2']);
    expect(semStep(s, 'P2')).toBe(s);
  });
  test('mutual exclusion can never be violated and never deadlocks', () => {
    expect(canDeadlock(preset('mutex'))).toBe(false);
    // Random walks: never two processes in the critical section.
    let s = preset('mutex');
    let seed = 7;
    for (let k = 0; k < 3000; k++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const free = s.procs.filter((p) => !p.blockedOn);
      s = semStep(s, free[seed % free.length].name);
      expect(inCritical(s).length).toBeLessThanOrEqual(1);
    }
  });
  test('a semaphore at 0 forces S2 after S1 whichever runs first', () => {
    let s = run(preset('order'), ['P2']);
    expect(s.procs[1].blockedOn).toBe('synch');
    s = run(s, ['P1', 'P1']);
    expect(s.procs[1].blockedOn).toBeNull();
    expect(s.procs[1].pc).toBe(1); // about to run S2
  });
  test('bounded buffer: producer blocks when full, consumer when empty', () => {
    let s = run(preset('buffer'), ['Consumer']);
    expect(s.procs[1].blockedOn).toBe('full');
    const lap = ['Producer', 'Producer', 'Producer', 'Producer', 'Producer', 'Producer'];
    s = run(s, lap); // first item wakes the consumer
    expect(s.procs[1].blockedOn).toBeNull();
    s = run(s, lap);
    s = run(s, ['Producer', 'Producer']);
    expect(s.sems.empty).toBe(0);
    expect(s.procs[0].blockedOn).toBe('empty');
    expect(canDeadlock(preset('buffer'))).toBe(false);
  });
  test('acquiring two semaphores in opposite orders can deadlock', () => {
    const s = run(preset('deadlock'), ['P0', 'P1', 'P0', 'P1']);
    expect(semDeadlocked(s)).toBe(true);
    expect(canDeadlock(preset('deadlock'))).toBe(true);
  });
  test('dining philosophers deadlock; the asymmetric version cannot', () => {
    const s = run(preset('philosophers'), ['Ph0', 'Ph1', 'Ph2', 'Ph3', 'Ph0', 'Ph1', 'Ph2', 'Ph3', 'Ph0', 'Ph1', 'Ph2', 'Ph3']);
    expect(semDeadlocked(s)).toBe(true);
    expect(canDeadlock(preset('philosophers'))).toBe(true);
    expect(canDeadlock(preset('philosophers-fixed'))).toBe(false);
  });
});
