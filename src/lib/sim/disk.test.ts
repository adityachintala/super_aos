import { describe, expect, test } from 'bun:test';
import { arrayMttf, ioTime, parity, raidInfo, raidSurvives, rebuild, revolutionMs, schedule, type RaidLevel } from './disk';

// The standard example: cylinders 0-199, head at 53.
const queue = [98, 183, 37, 122, 14, 124, 65, 67];

describe('disk scheduling', () => {
  test('FCFS moves 640 cylinders', () => {
    expect(schedule(queue, 53, 'fcfs').total).toBe(640);
  });
  test('SSTF moves 236 cylinders', () => {
    const s = schedule(queue, 53, 'sstf');
    expect(s.path).toEqual([53, 65, 67, 37, 14, 98, 122, 124, 183]);
    expect(s.total).toBe(236);
  });
  test('SCAN toward 0 goes to the edge: 236', () => {
    const s = schedule(queue, 53, 'scan', 'down');
    expect(s.path).toEqual([53, 37, 14, 0, 65, 67, 98, 122, 124, 183]);
    expect(s.total).toBe(236);
  });
  test('LOOK toward 0 turns at the last request: 208', () => {
    expect(schedule(queue, 53, 'look', 'down').total).toBe(208);
  });
  test('SCAN and LOOK upward', () => {
    expect(schedule(queue, 53, 'scan', 'up').total).toBe(331);
    expect(schedule(queue, 53, 'look', 'up').total).toBe(299);
  });
  test('C-SCAN upward wraps through both edges: 382', () => {
    const s = schedule(queue, 53, 'cscan', 'up');
    expect(s.path).toEqual([53, 65, 67, 98, 122, 124, 183, 199, 0, 14, 37]);
    expect(s.total).toBe(382);
  });
  test('C-LOOK upward jumps to the lowest request: 322', () => {
    const s = schedule(queue, 53, 'clook', 'up');
    expect(s.path).toEqual([53, 65, 67, 98, 122, 124, 183, 14, 37]);
    expect(s.total).toBe(322);
  });
  test('every algorithm services every request exactly once', () => {
    for (const a of ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'] as const)
      for (const dir of ['up', 'down'] as const) {
        const p = schedule(queue, 53, a, dir).path;
        for (const c of queue) expect(p.filter((x) => x === c).length).toBe(1);
      }
  });
});

describe('timing', () => {
  test('rotational latency', () => {
    expect(revolutionMs(7200) / 2).toBeCloseTo(4.167, 2);
    expect(revolutionMs(15000) / 2).toBe(2);
  });
  test('4KB block on a 7200 RPM disk takes about 9.3 ms', () => {
    const t = ioTime({ seekMs: 5, rpm: 7200, sizeKB: 4, rateGbps: 1, overheadMs: 0.1 });
    expect(t.transferMs).toBeCloseTo(0.031, 2);
    expect(t.totalMs).toBeCloseTo(9.3, 1);
  });
});

describe('RAID', () => {
  test('layouts have one cell per disk and the right capacity', () => {
    for (const l of ['0', '1', '4', '5', '6', '10', '01'] as RaidLevel[]) {
      const info = raidInfo(l);
      for (const row of info.rows) expect(row.length).toBe(info.disks);
    }
    expect(raidInfo('5').usable).toBeCloseTo(0.8);
    expect(raidInfo('6').usable).toBeCloseTo(2 / 3);
  });
  test('RAID 5 spreads parity over every disk; RAID 4 keeps it on one', () => {
    const where = (l: RaidLevel) => new Set(raidInfo(l).rows.map((r) => r.findIndex((c) => c.kind === 'parity')));
    expect(where('4').size).toBe(1);
    expect(where('5').size).toBe(4);
  });
  test('RAID 6 has two parity blocks and four data blocks in each stripe', () => {
    for (const row of raidInfo('6').rows) {
      expect(row.filter((c) => c.kind === 'parity').length).toBe(2);
      expect(row.filter((c) => c.kind === 'data').length).toBe(4);
    }
  });
  test('failure tolerance', () => {
    expect(raidSurvives('0', [2])).toBe(false);
    expect(raidSurvives('5', [1])).toBe(true);
    expect(raidSurvives('5', [1, 3])).toBe(false);
    expect(raidSurvives('6', [1, 3])).toBe(true);
    expect(raidSurvives('6', [0, 1, 3])).toBe(false);
  });
  test('1+0 survives more double failures than 0+1', () => {
    const pairs = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
    expect(pairs.filter((p) => raidSurvives('10', p)).length).toBe(4);
    expect(pairs.filter((p) => raidSurvives('01', p)).length).toBe(2);
  });
  test('parity rebuilds a lost block', () => {
    const data = [0b1011, 0b0110, 0b1100];
    const p = parity(data);
    expect(p).toBe(0b0001);
    expect(rebuild([data[0], data[2]], p)).toBe(data[1]);
  });
  test('more disks, shorter time to first failure', () => {
    expect(arrayMttf(100_000, 100)).toBe(1000);
  });
});
