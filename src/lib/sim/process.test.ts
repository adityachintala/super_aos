import { describe, expect, test } from 'bun:test';
import { applyEvent, consume, count, countNodes, emptyRing, forkProcesses, forkTree, isEmpty, isFull, legalEvents, produce, sendBlocks, type Proc } from './process';

describe('process states', () => {
  const procs: Proc[] = [
    { id: 'P1', state: 'running' },
    { id: 'P2', state: 'ready' },
    { id: 'P3', state: 'waiting' },
    { id: 'P4', state: 'new' },
  ];
  test('a running process can be interrupted, wait or exit', () => {
    expect(legalEvents(procs[0], procs).sort()).toEqual(['exit', 'interrupt', 'io-wait']);
  });
  test('a ready process cannot be dispatched while the CPU is busy', () => {
    expect(legalEvents(procs[1], procs)).toEqual([]);
    const freed = applyEvent(procs, 'P1', 'io-wait');
    expect(legalEvents(freed[1], freed)).toEqual(['dispatch']);
  });
  test('a waiting process goes to ready, never straight to running', () => {
    expect(legalEvents(procs[2], procs)).toEqual(['io-done']);
    expect(applyEvent(procs, 'P3', 'io-done')[2].state).toBe('ready');
  });
  test('illegal events change nothing', () => {
    expect(applyEvent(procs, 'P2', 'exit')).toEqual(procs);
  });
});

describe('fork', () => {
  test('n consecutive forks give 2^n processes', () => {
    for (let n = 0; n <= 5; n++) {
      expect(countNodes(forkTree(n))).toBe(2 ** n);
      expect(forkProcesses(n)).toBe(2 ** n);
    }
  });
  test('the original process has one child per fork call', () => {
    const t = forkTree(3);
    expect(t.children.map((c) => c.bornAt)).toEqual([1, 2, 3]);
    expect(t.children[0].children.map((c) => c.bornAt)).toEqual([2, 3]);
    expect(t.children[2].children).toEqual([]);
  });
});

describe('bounded buffer', () => {
  test('holds size - 1 items', () => {
    let r = emptyRing(5);
    expect(isEmpty(r)).toBe(true);
    for (let i = 0; i < 4; i++) r = produce(r, i)!;
    expect(isFull(r)).toBe(true);
    expect(count(r)).toBe(4);
    expect(produce(r, 99)).toBeNull();
  });
  test('items come out in the order they went in, and the pointers wrap', () => {
    let r = emptyRing(4);
    const out: number[] = [];
    for (let i = 0; i < 10; i++) {
      r = produce(r, i)!;
      const c = consume(r)!;
      r = c.ring;
      out.push(c.item);
    }
    expect(out).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(isEmpty(r)).toBe(true);
    expect(consume(r)).toBeNull();
    expect(r.in).toBe(10 % 4);
  });
});

describe('message buffering', () => {
  test('zero capacity is a rendezvous', () => {
    expect(sendBlocks('zero', 0, 0, false)).toBe(true);
    expect(sendBlocks('zero', 0, 0, true)).toBe(false);
  });
  test('bounded blocks only when full; unbounded never blocks', () => {
    expect(sendBlocks('bounded', 2, 3, false)).toBe(false);
    expect(sendBlocks('bounded', 3, 3, false)).toBe(true);
    expect(sendBlocks('unbounded', 1000, 0, false)).toBe(false);
  });
});
