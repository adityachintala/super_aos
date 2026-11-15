import { describe, expect, test } from 'bun:test';
import { extraPastQuestions } from './pyq-extra';
import { units } from '../lib/course';

const all = Object.values(extraPastQuestions).flat();

describe('extra past-paper questions', () => {
  test('every group belongs to a real lesson', () => {
    const lessons = new Set(units.flatMap((u) => u.lessons.map((l) => l.id)));
    for (const id of Object.keys(extraPastQuestions)) expect(lessons.has(id)).toBe(true);
  });
  test('ids are unique, and every question is marked as a past paper with its source', () => {
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
    for (const q of all) {
      expect(q.pastPaper).toBe(true);
      expect(q.source).toBeTruthy();
    }
  });
  test('written questions have marking points and a model answer', () => {
    for (const q of all) {
      if (q.type !== 'written') continue;
      expect(q.points.length).toBeGreaterThanOrEqual(2);
      expect(q.modelAnswer.length).toBeGreaterThan(100);
    }
  });
});

describe('numbers quoted in the model answers', () => {
  test('44-bit address, 64K pages, 4-byte entries', () => {
    const pageBits = 16;
    expect(2 ** (44 - pageBits)).toBe(2 ** 28);
    const entriesPerTable = 2 ** pageBits / 4;
    expect(Math.log2(entriesPerTable)).toBe(14);
    const programPages = 2 ** 32 / 2 ** pageBits;
    expect(programPages + programPages / entriesPerTable + 1).toBe(65541);
  });
  test('cache, memory and disk: average access time', () => {
    const inMemory = 0.9 * 20 + 0.1 * (60 + 20);
    expect(inMemory).toBeCloseTo(26);
    const ns = 0.6 * inMemory + 0.4 * (12e6 + 60 + 20);
    expect(ns / 1e6).toBeCloseTo(4.8, 2);
    // The other reading of the question, mentioned in the explanation.
    expect((0.9 * 20 + 0.06 * 80 + 0.04 * 12_000_080) / 1e6).toBeCloseTo(0.48, 2);
  });
  test('ALOHA peak throughput', () => {
    expect(0.5 * Math.exp(-1)).toBeCloseTo(0.184, 3);
    expect(Math.exp(-1)).toBeCloseTo(0.368, 3);
  });
  test('enhanced second chance picks B', () => {
    const pages = ['A', 'C', 'G', 'H', 'B', 'L', 'N', 'F'];
    const load = [18, 23, 5, 7, 32, 19, 3, 8];
    const r = [1, 0, 1, 1, 0, 1, 1, 0];
    const m = [1, 1, 1, 0, 0, 0, 1, 1];
    const order = pages.map((_, i) => i).sort((a, b) => load[a] - load[b]);
    expect(order.map((i) => pages[i]).join('')).toBe('NGHFALCB');
    const victim = order.find((i) => r[i] === 0 && m[i] === 0)!;
    expect(pages[victim]).toBe('B');
    expect(order.indexOf(victim)).toBe(7);
  });
});
