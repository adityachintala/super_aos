import { describe, expect, test } from 'bun:test';
import { BANK_EXAMPLE, detect, findCycle, need, RAG_EXAMPLES, reduceRag, request, safety } from './deadlock';

describe("Banker's algorithm", () => {
  test('need = max - allocation', () => {
    expect(need(BANK_EXAMPLE)).toEqual([[7, 4, 3], [1, 2, 2], [6, 0, 0], [0, 1, 1], [4, 3, 1]]);
  });
  test('the standard state is safe', () => {
    const r = safety(BANK_EXAMPLE);
    expect(r.safe).toBe(true);
    expect(r.sequence).toEqual([1, 3, 4, 0, 2]);
    expect(r.steps[0]).toEqual({ process: 1, workBefore: [3, 3, 2], workAfter: [5, 3, 2] });
    // When everyone has finished, Work equals the total number of instances.
    expect(r.steps[r.steps.length - 1].workAfter).toEqual([10, 5, 7]);
  });
  test('P1 requesting (1, 0, 2) is granted', () => {
    const r = request(BANK_EXAMPLE, 1, [1, 0, 2]);
    expect(r.granted).toBe(true);
    if (r.granted) {
      expect(r.state.available).toEqual([2, 3, 0]);
      expect(r.state.allocation[1]).toEqual([3, 0, 2]);
      expect(r.sequence).toEqual([1, 3, 4, 0, 2]);
    }
  });
  test('after that, P4 requesting (3, 3, 0) cannot be granted: not available', () => {
    const after = request(BANK_EXAMPLE, 1, [1, 0, 2]);
    expect(after.granted).toBe(true);
    const r = request(after.state, 4, [3, 3, 0]);
    expect(r).toMatchObject({ granted: false, reason: 'not-available' });
  });
  test('and P0 requesting (0, 2, 0) is refused: the resulting state would be unsafe', () => {
    const after = request(BANK_EXAMPLE, 1, [1, 0, 2]);
    const r = request(after.state, 0, [0, 2, 0]);
    expect(r).toMatchObject({ granted: false, reason: 'unsafe' });
  });
  test('a request beyond the declared maximum is an error', () => {
    expect(request(BANK_EXAMPLE, 3, [1, 0, 0])).toMatchObject({ granted: false, reason: 'exceeds-need' });
  });
  test('the tape-drive example: safe at t0, unsafe once P2 is given one more drive', () => {
    const max = [[10], [4], [9]];
    const t0 = safety({ available: [3], max, allocation: [[5], [2], [2]] });
    expect(t0.safe).toBe(true);
    expect(t0.sequence).toEqual([1, 0, 2]);
    const t1 = safety({ available: [2], max, allocation: [[5], [2], [3]] });
    expect(t1.safe).toBe(false);
    expect(t1.stuck).toEqual([0, 2]);
  });
  test('the detection example can also finish in the order P0, P2, P3, P1, P4', () => {
    // Work after each step, as tabulated in the lesson.
    const alloc = [[0, 1, 0], [3, 0, 3], [2, 1, 1], [2, 0, 0], [0, 0, 2]];
    const work = [0, 0, 0];
    const seen = alloc.map((a) => a.map((v, i) => (work[i] += v)).slice());
    expect(seen).toEqual([[0, 1, 0], [3, 1, 3], [5, 2, 4], [7, 2, 4], [7, 2, 6]]);
  });
  test('the 2022 end-sem state (C = 6, 4, 4, 2) is safe; P2 must go first and P1 last', () => {
    const max = [[3, 2, 1, 1], [1, 2, 0, 2], [1, 1, 2, 0], [3, 2, 1, 0], [2, 1, 0, 1]];
    const allocation = [[2, 0, 1, 1], [1, 1, 0, 0], [1, 1, 0, 0], [1, 0, 1, 0], [0, 1, 0, 1]];
    const total = [6, 4, 4, 2];
    const available = total.map((t, j) => t - allocation.reduce((s, a) => s + a[j], 0));
    expect(available).toEqual([1, 1, 2, 0]);
    const state = { available, max, allocation };
    expect(need(state)).toEqual([[1, 2, 0, 0], [0, 1, 0, 2], [0, 0, 2, 0], [2, 2, 0, 0], [2, 0, 0, 0]]);
    const r = safety(state);
    expect(r.safe).toBe(true);
    expect(r.sequence[0]).toBe(2);
    expect(r.sequence[4]).toBe(1);
    expect(r.steps[4].workAfter).toEqual(total);
  });
  test('an unsafe state names the processes that cannot finish', () => {
    const r = safety({ available: [0, 0, 0], max: [[1, 1, 1], [1, 1, 1]], allocation: [[1, 0, 0], [0, 1, 0]] });
    expect(r.safe).toBe(false);
    expect(r.stuck).toEqual([0, 1]);
  });
});

describe('deadlock detection', () => {
  const allocation = [[0, 1, 0], [2, 0, 0], [3, 0, 3], [2, 1, 1], [0, 0, 2]];
  test('no deadlock in the standard example', () => {
    const r = detect({ available: [0, 0, 0], allocation, request: [[0, 0, 0], [2, 0, 2], [0, 0, 0], [1, 0, 0], [0, 0, 2]] });
    expect(r.deadlocked).toEqual([]);
    expect(r.sequence).toEqual([0, 2, 3, 4, 1]);
  });
  test('one more request by P2 deadlocks P1, P2, P3 and P4', () => {
    const r = detect({ available: [0, 0, 0], allocation, request: [[0, 0, 0], [2, 0, 2], [0, 0, 1], [1, 0, 0], [0, 0, 2]] });
    expect(r.deadlocked).toEqual([1, 2, 3, 4]);
  });
});

describe('resource-allocation graphs', () => {
  const g = (id: string) => RAG_EXAMPLES.find((e) => e.id === id)!.graph;
  test('no cycle means no deadlock', () => {
    expect(findCycle(g('no-cycle'))).toBeNull();
    expect(reduceRag(g('no-cycle')).deadlocked).toEqual([]);
  });
  test('a cycle with single paths out: deadlock of P1, P2 and P3', () => {
    expect(findCycle(g('deadlock'))).not.toBeNull();
    expect(reduceRag(g('deadlock')).deadlocked).toEqual(['P1', 'P2', 'P3']);
  });
  test('a cycle is necessary but not sufficient when resources have several instances', () => {
    const cycle = findCycle(g('cycle-only'));
    expect(cycle).not.toBeNull();
    expect(new Set(cycle)).toEqual(new Set(['P1', 'R1', 'P3', 'R2']));
    const r = reduceRag(g('cycle-only'));
    expect(r.deadlocked).toEqual([]);
    expect(r.order.slice(0, 2)).toEqual(['P2', 'P4']);
  });
});
