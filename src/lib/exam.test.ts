import { describe, expect, test } from 'bun:test';
import { awarded, buildMockExam, buildUnitTest, clock, marksOf, overall, rng, shuffle, tally, weakSpots, type BankItem } from './exam';
import type { Question } from './questions';
import { units } from './course';

const mcq = (id: string): Question => ({ id, type: 'mcq', prompt: id, options: ['a', 'b'], answer: 0 });
const written = (id: string, marks: number, pastPaper = false): Question => ({ id, type: 'written', prompt: id, marks, points: ['x', 'y'], modelAnswer: '', pastPaper });
const item = (lessonId: string, q: Question): BankItem => ({ lessonId, source: 'checkpoint', q });

const pool: BankItem[] = [];
for (const lesson of ['a', 'b', 'c']) {
  for (let i = 0; i < 6; i++) pool.push(item(lesson, mcq(`${lesson}-m${i}`)));
  pool.push(item(lesson, written(`${lesson}-w0`, 5)));
  pool.push(item(lesson, written(`${lesson}-w1`, 3, true)));
}

describe('random helpers', () => {
  test('the same seed gives the same sequence', () => {
    const a = rng(42);
    const b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(rng(1)()).not.toBe(rng(2)());
  });
  test('shuffle keeps every element', () => {
    const s = shuffle([1, 2, 3, 4, 5, 6], rng(7));
    expect(s.slice().sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('unit test paper', () => {
  const paper = buildUnitTest(pool, ['a', 'b', 'c'], 5);
  test('three auto-graded questions per lesson, then two written from different lessons', () => {
    expect(paper).toHaveLength(11);
    for (const l of ['a', 'b', 'c']) expect(paper.filter((x) => x.lessonId === l && x.q.type !== 'written')).toHaveLength(3);
    const w = paper.slice(9);
    expect(w.every((x) => x.q.type === 'written')).toBe(true);
    expect(w[0].lessonId).not.toBe(w[1].lessonId);
  });
  test('no question appears twice, and a seed reproduces the paper', () => {
    expect(new Set(paper.map((x) => x.q.id)).size).toBe(paper.length);
    expect(buildUnitTest(pool, ['a', 'b', 'c'], 5).map((x) => x.q.id)).toEqual(paper.map((x) => x.q.id));
    expect(buildUnitTest(pool, ['a', 'b', 'c'], 6).map((x) => x.q.id)).not.toEqual(paper.map((x) => x.q.id));
  });
  test('a lesson with few questions contributes what it has', () => {
    const small = [item('z', mcq('z-0')), ...pool];
    expect(buildUnitTest(small, ['z', 'a'], 1).filter((x) => x.lessonId === 'z')).toHaveLength(1);
  });
});

describe('mock exam paper', () => {
  test('written questions only, across every unit, adding up to the target', () => {
    const paper = buildMockExam(pool, [['a'], ['b'], ['c']], 3, 16);
    expect(paper.every((x) => x.q.type === 'written')).toBe(true);
    expect(marksOf(paper)).toBe(16);
    expect(new Set(paper.map((x) => x.lessonId))).toEqual(new Set(['a', 'b', 'c']));
    expect(new Set(paper.map((x) => x.q.id)).size).toBe(paper.length);
  });
  test('past-paper questions are taken first', () => {
    const paper = buildMockExam(pool, [['a'], ['b'], ['c']], 9, 9);
    expect(paper.map((x) => x.q.pastPaper)).toEqual([true, true, true]);
  });
  test('never exceeds the target, and stops when the bank runs out', () => {
    expect(marksOf(buildMockExam(pool, [['a'], ['b'], ['c']], 1, 7))).toBeLessThanOrEqual(7);
    expect(marksOf(buildMockExam(pool, [['a'], ['b'], ['c']], 1, 1000))).toBe(24);
  });
  test('questions are grouped in unit order', () => {
    const paper = buildMockExam(pool, [['a'], ['b'], ['c']], 4, 24);
    const order = paper.map((x) => x.lessonId);
    expect(order).toEqual(order.slice().sort());
  });
});

describe('tallying', () => {
  const paper = [item('a', mcq('1')), item('a', mcq('2')), item('b', written('3', 4))];
  test('one point per question', () => {
    expect(tally(paper, [1, 0, 0.5])).toEqual({ a: { earned: 1, total: 2 }, b: { earned: 0.5, total: 1 } });
  });
  test('by marks, with unanswered questions scoring zero', () => {
    const t = tally(paper, [1, undefined, 0.5], true);
    expect(t).toEqual({ a: { earned: 1, total: 2 }, b: { earned: 2, total: 4 } });
    expect(overall(t)).toEqual({ earned: 3, total: 6 });
  });
  test('marks awarded round to the nearest half', () => {
    expect(awarded(5, 3, 6)).toBe(2.5);
    expect(awarded(4, 2, 3)).toBe(2.5);
    expect(awarded(3, 0, 4)).toBe(0);
    expect(awarded(6, 6, 6)).toBe(6);
  });
});

describe('review queue', () => {
  test('only attempted questions below full marks, weakest first', () => {
    const w = weakSpots(pool, { 'a-m0': 1, 'a-m1': 0, 'b-w0': 0.5, 'not-in-bank': 0 });
    expect(w.map((x) => x.q.id)).toEqual(['a-m1', 'b-w0']);
  });
});

describe('clock', () => {
  test('formats a countdown', () => {
    expect(clock(0)).toBe('00:00');
    expect(clock(75)).toBe('01:15');
    expect(clock(5400)).toBe('1:30:00');
    expect(clock(-3)).toBe('00:00');
  });
});

describe('course outline', () => {
  test('has 20 lessons with unique ids', () => {
    const ids = units.flatMap((u) => u.lessons.map((l) => l.id));
    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
  });
});
