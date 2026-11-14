import { describe, expect, test } from 'bun:test';
import { afterCheckpoint, afterUnitTest, checkpointLevel, liveStreak, nextStreak } from './mastery';
import { grade } from './questions';

describe('mastery', () => {
  test('checkpoint levels', () => {
    expect(checkpointLevel(0.2)).toBe(1);
    expect(checkpointLevel(0.6)).toBe(2);
    expect(checkpointLevel(0.9)).toBe(3);
    expect(checkpointLevel(1)).toBe(3); // never Mastered from a checkpoint
  });
  test('checkpoint never lowers a level', () => {
    expect(afterCheckpoint(4, 0.1)).toBe(4);
    expect(afterCheckpoint(1, 0.9)).toBe(3);
  });
  test('unit test moves one level up or down', () => {
    expect(afterUnitTest(3, 5, 5)).toBe(4);
    expect(afterUnitTest(0, 5, 5)).toBe(3);
    expect(afterUnitTest(4, 1, 5)).toBe(3);
    expect(afterUnitTest(1, 0, 5)).toBe(1);
    expect(afterUnitTest(2, 3, 5)).toBe(2);
  });
});

describe('streak', () => {
  const d = (s: string) => new Date(`${s}T12:00:00`);
  test('starts, continues, holds and resets', () => {
    let s = nextStreak({ count: 0, last: null }, d('2026-01-01'));
    expect(s.count).toBe(1);
    s = nextStreak(s, d('2026-01-01'));
    expect(s.count).toBe(1);
    s = nextStreak(s, d('2026-01-02'));
    expect(s.count).toBe(2);
    expect(liveStreak(s, d('2026-01-03'))).toBe(2);
    expect(liveStreak(s, d('2026-01-04'))).toBe(0);
    s = nextStreak(s, d('2026-01-05'));
    expect(s.count).toBe(1);
  });
});

describe('grading', () => {
  test('numeric accepts tolerance and rejects blanks', () => {
    const q = { id: 'n', type: 'numeric', prompt: '', answer: 140, tolerance: 0.5 } as const;
    expect(grade(q, '140.4')).toBe(1);
    expect(grade(q, '141')).toBe(0);
    expect(grade(q, '')).toBe(0);
    expect(grade(q, 'abc')).toBe(0);
  });
  test('multi needs the exact set', () => {
    const q = { id: 'm', type: 'multi', prompt: '', options: ['a', 'b', 'c'], answers: [0, 2] } as const;
    expect(grade(q as any, [2, 0])).toBe(1);
    expect(grade(q as any, [0])).toBe(0);
    expect(grade(q as any, [0, 1, 2])).toBe(0);
  });
});
