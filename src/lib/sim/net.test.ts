import { describe, expect, test } from 'bun:test';
import { bitStuff, bitUnstuff, bridgeFrame, crcRemainder, csma, hammingDistance, slidingWindow, windowFor } from './net';

describe('framing and error detection', () => {
  test('bit stuffing inserts a 0 after five 1s and is reversible', () => {
    expect(bitStuff('011011111111111111110010').stuffed).toBe('011011111011111011111010010');
    expect(bitStuff('0111111').stuffed).toBe('01111101');
    for (const s of ['1111111111', '0101', '011111', '11111011111', '']) expect(bitUnstuff(bitStuff(s).stuffed)).toBe(s);
  });
  test('stuffed data never contains the flag pattern', () => {
    expect(bitStuff('0111111001111110').stuffed.includes('01111110')).toBe(false);
  });
  test('CRC of the standard example', () => {
    // Frame 1101011111 with generator x^4 + x + 1 is transmitted as 11010111110010.
    expect(crcRemainder('1101011111', '10011')).toBe('0010');
    expect(crcRemainder('1101011111' + '0010'.slice(0, 0), '10011')).toBe('0010');
  });
  test('a received frame with no errors divides evenly', () => {
    const sent = '1101011111' + '0010';
    // Dividing the whole transmitted frame (no extra zeros) leaves remainder 0.
    const bits = sent.split('').map(Number);
    const g = [1, 0, 0, 1, 1];
    for (let i = 0; i <= bits.length - g.length; i++) if (bits[i]) for (let j = 0; j < g.length; j++) bits[i + j] ^= g[j];
    expect(bits.slice(-4).join('')).toBe('0000');
  });
  test('Hamming distance', () => {
    expect(hammingDistance('10001001', '10110001')).toBe(3);
  });
});

describe('sliding window', () => {
  test('no loss: both protocols send each frame once', () => {
    expect(slidingWindow('gbn', 8, 4, []).transmissions).toBe(8);
    expect(slidingWindow('sr', 8, 4, []).transmissions).toBe(8);
  });
  test('one loss: Go-Back-N resends the tail of the window, Selective Repeat only the lost frame', () => {
    const gbn = slidingWindow('gbn', 8, 4, [2]);
    expect(gbn.transmissions).toBe(10);
    expect(gbn.log.filter((t) => t.outcome === 'discarded').map((t) => t.frame)).toEqual([3]);
    const sr = slidingWindow('sr', 8, 4, [2]);
    expect(sr.transmissions).toBe(9);
    expect(sr.log.filter((t) => t.retransmission).map((t) => t.frame)).toEqual([2]);
  });
  test('the bigger the window, the more Go-Back-N wastes on a loss', () => {
    expect(slidingWindow('gbn', 16, 8, [0]).wasted).toBe(8);
    expect(slidingWindow('sr', 16, 8, [0]).wasted).toBe(1);
  });
  test('window of 1 is stop-and-wait for both', () => {
    expect(slidingWindow('gbn', 5, 1, [3]).transmissions).toBe(6);
    expect(slidingWindow('sr', 5, 1, [3]).transmissions).toBe(6);
  });
  test('every frame is eventually delivered or buffered exactly once', () => {
    for (const p of ['gbn', 'sr'] as const) {
      const r = slidingWindow(p, 12, 5, [1, 6, 7]);
      for (let f = 0; f < 12; f++) expect(r.log.filter((t) => t.frame === f && (t.outcome === 'delivered' || t.outcome === 'buffered')).length).toBe(1);
    }
  });
  test('window sizing from bandwidth-delay product', () => {
    // 1 Mbps, 50 ms one way, 1000-bit frames: BD = 50 frames, so w = 101.
    expect(windowFor(1_000_000, 0.05, 1000)).toBe(101);
  });
});

describe('CSMA', () => {
  test('under heavy load nonpersistent beats 1-persistent on throughput', () => {
    const one = csma('1', 20, 3);
    const non = csma('non', 20, 3);
    expect(non.throughput).toBeGreaterThan(one.throughput);
    expect(non.collisions).toBeLessThan(one.collisions);
  });
  test('under light load 1-persistent has the shorter delay', () => {
    const one = csma('1', 20, 0.2);
    const non = csma('non', 20, 0.2);
    expect(one.meanDelay).toBeLessThan(non.meanDelay);
    expect(one.throughput).toBeGreaterThan(0.15);
  });
  test('throughput never exceeds the channel capacity', () => {
    for (const p of ['1', 'non', 'p'] as const) for (const g of [0.5, 1, 4]) expect(csma(p, 10, g).throughput).toBeLessThanOrEqual(1);
  });
});

describe('learning bridge', () => {
  test('floods unknown destinations, forwards known ones, filters same-port traffic', () => {
    let s = bridgeFrame({}, 'A', 'D', 0, 3);
    expect(s.action).toBe('flood');
    expect(s.outPorts).toEqual([1, 2]);
    expect(s.table).toEqual({ A: 0 });
    s = bridgeFrame(s.table, 'D', 'A', 2, 3);
    expect(s.action).toBe('forward');
    expect(s.outPorts).toEqual([0]);
    s = bridgeFrame(s.table, 'B', 'A', 0, 3);
    expect(s.action).toBe('filter');
    expect(s.table).toEqual({ A: 0, D: 2, B: 0 });
  });
});
