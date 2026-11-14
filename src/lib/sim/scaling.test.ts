import { describe, expect, test } from 'bun:test';
import { amdahl, amdahlLimit, availability, downtimeHoursPerYear, efficiency, gustafson, preCopy } from './scaling';

describe('speedup laws', () => {
  test('Amdahl: a quarter sequential caps speedup at 4', () => {
    expect(amdahlLimit(0.25)).toBe(4);
    expect(amdahl(0.25, 16)).toBeCloseTo(3.368, 2);
    expect(amdahl(0.25, 256)).toBeLessThan(4);
    expect(amdahl(0.25, 256)).toBeCloseTo(3.95, 1);
    expect(amdahl(0, 64)).toBe(64);
    expect(amdahl(0.5, 1)).toBe(1);
  });
  test('Amdahl efficiency collapses on a large cluster', () => {
    expect(efficiency(amdahl(0.25, 256), 256)).toBeCloseTo(0.0154, 3);
  });
  test('Gustafson: scaling the workload keeps speedup growing', () => {
    expect(gustafson(0.25, 16)).toBe(12.25);
    expect(gustafson(0.25, 256)).toBe(192.25);
    expect(efficiency(gustafson(0.25, 256), 256)).toBeCloseTo(0.751, 3);
  });
});

describe('availability', () => {
  test('MTTF / (MTTF + MTTR)', () => {
    expect(availability(990, 10)).toBe(0.99);
    expect(availability(999, 1)).toBeCloseTo(0.999);
    expect(downtimeHoursPerYear(0.99)).toBeCloseTo(87.6);
    expect(downtimeHoursPerYear(0.9999)).toBeCloseTo(0.876);
  });
});

describe('live migration pre-copy', () => {
  test('each round resends what was dirtied during the previous one', () => {
    const m = preCopy(8000, 1000, 500, 100);
    expect(m.rounds[0]).toEqual({ sent: 8000, seconds: 8, dirtied: 4000 });
    expect(m.rounds[1].sent).toBe(4000);
    expect(m.rounds[2].sent).toBe(2000);
    expect(m.converged).toBe(true);
    expect(m.finalPages).toBeLessThanOrEqual(100);
    expect(m.downtimeSeconds).toBeLessThanOrEqual(0.1);
  });
  test('converges geometrically with ratio dirty rate / send rate', () => {
    const m = preCopy(1000, 100, 50, 10);
    expect(m.rounds.map((r) => r.sent)).toEqual([1000, 500, 250, 125, 62.5, 31.25, 15.625]);
    expect(m.finalPages).toBe(7.8125);
  });
  test('a guest that dirties pages as fast as they are sent never converges', () => {
    const m = preCopy(1000, 100, 100, 10, 12);
    expect(m.converged).toBe(false);
    expect(m.rounds.length).toBe(12);
    expect(m.downtimeSeconds).toBe(10);
  });
  test('an idle guest migrates in one round with no downtime', () => {
    const m = preCopy(1000, 100, 0, 10);
    expect(m.rounds.length).toBe(1);
    expect(m.downtimeSeconds).toBe(0);
  });
});
