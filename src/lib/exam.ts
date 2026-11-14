// Pure logic for unit tests, the mock exam and the review queue: choosing questions and
// tallying results. No browser APIs, so it can be unit tested.

import type { Question, WrittenQuestion } from './questions';

export interface BankItem {
  lessonId: string;
  /** Where the question appears in its lesson. */
  source: 'check' | 'practice' | 'checkpoint';
  q: Question;
}

/** A small deterministic random-number generator (mulberry32), so a seed reproduces a paper. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const isWritten = (item: BankItem): item is BankItem & { q: WrittenQuestion } => item.q.type === 'written';

/**
 * A unit test: `perLesson` auto-graded questions from every lesson, in mixed order,
 * followed by up to `written` written questions from different lessons.
 */
export function buildUnitTest(pool: BankItem[], lessonIds: string[], seed: number, perLesson = 3, written = 2): BankItem[] {
  const rand = rng(seed);
  const auto: BankItem[] = [];
  for (const id of lessonIds) {
    const mine = pool.filter((x) => x.lessonId === id && !isWritten(x));
    auto.push(...shuffle(mine, rand).slice(0, perLesson));
  }
  const longOnes: BankItem[] = [];
  for (const id of shuffle(lessonIds, rand)) {
    if (longOnes.length >= written) break;
    const mine = pool.filter((x) => x.lessonId === id && isWritten(x));
    if (mine.length) longOnes.push(shuffle(mine, rand)[0]);
  }
  return [...shuffle(auto, rand), ...longOnes];
}

/**
 * A mock exam: written questions only, drawn in turn from each unit so the paper covers the
 * whole syllabus, adding up to `totalMarks` (or as close below it as the bank allows).
 * Past-paper questions are preferred.
 */
export function buildMockExam(pool: BankItem[], unitLessons: string[][], seed: number, totalMarks = 40): BankItem[] {
  const rand = rng(seed);
  const queues = unitLessons.map((lessons) => {
    const mine = shuffle(pool.filter((x) => lessons.includes(x.lessonId) && isWritten(x)), rand);
    // Stable sort: past-paper questions first, shuffled order otherwise.
    return [...mine.filter((x) => x.q.pastPaper), ...mine.filter((x) => !x.q.pastPaper)];
  });
  const paper: { unit: number; item: BankItem }[] = [];
  const usedLessons = new Set<string>();
  let marks = 0;
  let progress = true;
  while (marks < totalMarks && progress) {
    progress = false;
    // Every unit gets a question in the first round; later rounds visit the units in a random
    // order, so the extra questions do not always go to the first units.
    const order = paper.length ? shuffle(queues.map((_, u) => u), rand) : queues.map((_, u) => u);
    for (const u of order) {
      if (marks >= totalMarks) break;
      const queue = queues[u];
      // Prefer a lesson not yet on the paper.
      let at = queue.findIndex((x) => marks + (x.q as WrittenQuestion).marks <= totalMarks && !usedLessons.has(x.lessonId));
      if (at < 0) at = queue.findIndex((x) => marks + (x.q as WrittenQuestion).marks <= totalMarks);
      if (at < 0) continue;
      const [item] = queue.splice(at, 1);
      paper.push({ unit: u, item });
      usedLessons.add(item.lessonId);
      marks += (item.q as WrittenQuestion).marks;
      progress = true;
    }
  }
  // If the greedy pass fell short, one swap of a chosen question for a longer unused one
  // from the same unit may land exactly on the target.
  const gap = totalMarks - marks;
  if (gap > 0) {
    swap: for (const p of paper) {
      const queue = queues[p.unit];
      const at = queue.findIndex((x) => (x.q as WrittenQuestion).marks - (p.item.q as WrittenQuestion).marks === gap);
      if (at >= 0) {
        [p.item] = queue.splice(at, 1, p.item);
        break swap;
      }
    }
  }
  return paper.sort((a, b) => a.unit - b.unit).map((p) => p.item);
}

export const marksOf = (items: BankItem[]) => items.reduce((s, x) => s + (x.q.type === 'written' ? x.q.marks : 1), 0);

export interface Tally {
  earned: number;
  total: number;
}

/**
 * Per-lesson results. Each question's result is a fraction 0..1. With `byMarks`, a written
 * question counts for its marks; otherwise every question counts once.
 */
export function tally(items: BankItem[], results: (number | undefined)[], byMarks = false): Record<string, Tally> {
  const out: Record<string, Tally> = {};
  items.forEach((item, i) => {
    const weight = byMarks && item.q.type === 'written' ? item.q.marks : 1;
    const t = (out[item.lessonId] ??= { earned: 0, total: 0 });
    t.earned += (results[i] ?? 0) * weight;
    t.total += weight;
  });
  return out;
}

export function overall(t: Record<string, Tally>): Tally {
  return Object.values(t).reduce((a, b) => ({ earned: a.earned + b.earned, total: a.total + b.total }), { earned: 0, total: 0 });
}

/** Marks for a written answer from the points ticked, rounded to the nearest half mark. */
export const awarded = (marks: number, ticked: number, points: number) => (points ? Math.round((marks * ticked * 2) / points) / 2 : 0);

/** Questions that have been attempted but not yet answered fully, weakest first. */
export function weakSpots(pool: BankItem[], answers: Record<string, number>): BankItem[] {
  return pool
    .filter((x) => x.q.id in answers && answers[x.q.id] < 1)
    .sort((a, b) => answers[a.q.id] - answers[b.q.id]);
}

/** mm:ss, or h:mm:ss for an hour or more. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const p = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(s / 3600);
  return h ? `${h}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}` : `${p(Math.floor(s / 60))}:${p(s % 60)}`;
}
