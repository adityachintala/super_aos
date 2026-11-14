import { describe, expect, test } from 'bun:test';
import { countToInfinity, dijkstra, dvUpdate, fairQueue, inPrefix, leakyBucket, makeGraph, pathTo, prefixInfo, roundRobin, shares, tokenBucket } from './routing';

describe('distance vector', () => {
  test('router J in the classic 12-node example', () => {
    const dests = 'ABCDEFGHIJKL'.split('');
    const rows = dvUpdate('J', dests, { A: 8, I: 10, H: 12, K: 6 }, {
      A: [0, 12, 25, 40, 14, 23, 18, 17, 21, 9, 24, 29],
      I: [24, 36, 18, 27, 7, 20, 31, 20, 0, 11, 22, 33],
      H: [20, 31, 19, 8, 30, 19, 6, 0, 14, 7, 22, 9],
      K: [21, 28, 36, 24, 22, 40, 31, 19, 22, 10, 0, 9],
    });
    expect(rows.map((r) => r.best)).toEqual([8, 20, 28, 20, 17, 30, 18, 12, 10, 0, 6, 15]);
    expect(rows.map((r) => r.via ?? '-').join('')).toBe('AAIHIIHHI-KK');
    const g = rows[6];
    expect(g.candidates.map((c) => c.total)).toEqual([26, 41, 18, 37]);
  });
  test('router C in the past-quiz example', () => {
    const rows = dvUpdate('C', 'ABCDEF'.split(''), { B: 6, D: 3, E: 5 }, {
      B: [5, 0, 8, 12, 6, 2],
      D: [16, 12, 6, 0, 9, 10],
      E: [7, 6, 3, 9, 0, 4],
    });
    expect(rows.map((r) => r.best)).toEqual([11, 6, 0, 3, 5, 8]);
    expect(rows.map((r) => r.via ?? '-').join('')).toBe('BB-DEB');
  });
  test('count to infinity after A goes down', () => {
    const rows = countToInfinity(6);
    expect(rows[0]).toEqual([1, 2, 3, 4]);
    expect(rows[1]).toEqual([3, 2, 3, 4]);
    expect(rows[2]).toEqual([3, 4, 3, 4]);
    expect(rows[3]).toEqual([5, 4, 5, 4]);
    expect(rows[4]).toEqual([5, 6, 5, 6]);
    expect(rows[6]).toEqual([7, 8, 7, 8]);
  });
});

describe('Dijkstra', () => {
  const g = makeGraph([
    ['A', 'B', 2], ['A', 'G', 6], ['B', 'C', 7], ['B', 'E', 2], ['C', 'D', 3], ['C', 'F', 3],
    ['D', 'H', 2], ['E', 'F', 2], ['E', 'G', 1], ['F', 'H', 2], ['G', 'H', 4],
  ]);
  test('shortest path from A to D is A B E F H D with length 10', () => {
    const steps = dijkstra(g, 'A');
    const last = steps[steps.length - 1];
    expect(last.dist.D).toBe(10);
    expect(pathTo(last.prev, 'D').join('')).toBe('ABEFHD');
    expect(steps.map((s) => s.picked).slice(0, 4).join('')).toBe('ABEG');
    expect(last.dist).toEqual({ A: 0, B: 2, C: 9, D: 10, E: 4, F: 6, G: 5, H: 8 });
  });
});

describe('traffic shaping', () => {
  const burst = [10, 10, 0, 0, 0, 0, 0, 0];
  test('a leaky bucket turns a burst into a steady trickle', () => {
    const out = leakyBucket(burst, 3, 100);
    expect(out.map((t) => t.sent)).toEqual([3, 3, 3, 3, 3, 3, 2, 0]);
    expect(out.every((t) => t.dropped === 0)).toBe(true);
  });
  test('a small leaky bucket drops what it cannot hold', () => {
    const out = leakyBucket([10, 0, 0], 2, 5);
    expect(out[0].dropped).toBe(5);
    expect(out.map((t) => t.sent)).toEqual([2, 2, 1]);
  });
  test('a token bucket lets a burst through up to its capacity, then limits to the rate', () => {
    const out = tokenBucket(burst, 3, 8);
    expect(out.map((t) => t.sent)).toEqual([8, 3, 3, 3, 3, 0, 0, 0]);
    expect(out.reduce((a, t) => a + t.sent, 0)).toBe(20);
  });
  test('an idle token bucket saves up, but never beyond its capacity', () => {
    const out = tokenBucket([0, 0, 0, 0, 20], 3, 8);
    expect(out[3].level).toBe(8);
    expect(out[4].sent).toBe(8);
  });
});

describe('packet scheduling', () => {
  // Flow 0 sends 1500-byte packets, flow 1 sends 500-byte packets.
  const flows = [Array(6).fill(1500), Array(18).fill(500)];
  test('packet round robin gives the flow with big packets three times the bandwidth', () => {
    const s = shares(roundRobin(flows), 2, 8000);
    expect(s[0]).toBe(6000);
    expect(s[1]).toBe(2000);
  });
  test('fair queueing gives them equal shares', () => {
    const s = shares(fairQueue(flows), 2, 9000);
    expect(s[0]).toBe(4500);
    expect(s[1]).toBe(4500);
  });
  test('weighted fair queueing follows the weights', () => {
    const s = shares(fairQueue(flows, [1, 2]), 2, 9000);
    expect(s[1]).toBe(2 * s[0]);
  });
  test('both disciplines send every packet', () => {
    expect(roundRobin(flows).length).toBe(24);
    expect(fairQueue(flows).length).toBe(24);
  });
});

describe('IPv4 prefixes', () => {
  test('a /24', () => {
    const p = prefixInfo('18.0.31.77', 24);
    expect(p.network).toBe('18.0.31.0');
    expect(p.broadcast).toBe('18.0.31.255');
    expect(p.mask).toBe('255.255.255.0');
    expect(p.addresses).toBe(256);
    expect(p.hosts).toBe(254);
  });
  test('a /22 and a /27', () => {
    expect(prefixInfo('128.208.2.151', 22)).toMatchObject({ network: '128.208.0.0', broadcast: '128.208.3.255', mask: '255.255.252.0', addresses: 1024 });
    expect(prefixInfo('192.168.1.100', 27)).toMatchObject({ network: '192.168.1.96', broadcast: '192.168.1.127', hosts: 30, first: '192.168.1.97', last: '192.168.1.126' });
  });
  test('membership', () => {
    expect(inPrefix('192.168.1.100', '192.168.1.96', 27)).toBe(true);
    expect(inPrefix('192.168.1.130', '192.168.1.96', 27)).toBe(false);
  });
});
