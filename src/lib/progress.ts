import { writable } from 'svelte/store';
import { afterCheckpoint, afterUnitTest, nextStreak, HINT_COST, XP_PER_QUESTION, type Level, type Streak } from './mastery';

const KEY = 'super-aos-progress-v1';

export interface LessonProgress {
  level: Level;
  best: number;
  attempts: number;
}

export interface Progress {
  xp: number;
  streak: Streak;
  lessons: Record<string, LessonProgress>;
  /** Best fraction (0..1) earned so far on each question. */
  answers: Record<string, number>;
  lastLesson: string | null;
  /** Unit tests and mock exams, keyed "unit-2" or "mock": best score (0..1) and number of attempts. */
  tests: Record<string, { best: number; attempts: number }>;
  /** Flashcards: how many times in a row each card was known (0 = needs work, capped at 3). */
  cards: Record<string, number>;
  /** Sections of each lesson that have been read (indexes into the lesson's sections). */
  sections: Record<string, number[]>;
}

const empty = (): Progress => ({
  xp: 0,
  streak: { count: 0, last: null },
  lessons: {},
  answers: {},
  lastLesson: null,
  tests: {},
  cards: {},
  sections: {},
});

export const progress = writable<Progress>(empty());

let loaded = false;

/** Call from onMount. Server render and first paint use empty progress to keep hydration consistent. */
export function loadProgress() {
  if (loaded || typeof localStorage === 'undefined') return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) progress.set({ ...empty(), ...JSON.parse(raw) });
  } catch {
    // unreadable storage: carry on with empty progress
  }
  progress.subscribe((p) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      // storage full or blocked: progress just will not persist
    }
  });
}

/** Records an answer; XP is only paid for improvement over the previous best. Returns XP gained. */
export function recordAnswer(id: string, fraction: number, worth = XP_PER_QUESTION): number {
  let gained = 0;
  progress.update((p) => {
    const prev = p.answers[id] ?? 0;
    gained = Math.max(0, Math.round((fraction - prev) * worth));
    return {
      ...p,
      xp: p.xp + gained,
      streak: nextStreak(p.streak, new Date()),
      answers: { ...p.answers, [id]: Math.max(prev, fraction) },
    };
  });
  return gained;
}

export function spendHint() {
  progress.update((p) => ({ ...p, xp: Math.max(0, p.xp - HINT_COST) }));
}

export function visitLesson(id: string) {
  progress.update((p) => (p.lastLesson === id ? p : { ...p, lastLesson: id }));
}

/** Returns the lesson's level before and after, so the UI can celebrate a level-up. */
export function completeCheckpoint(lessonId: string, score: number): { before: Level; after: Level } {
  let before: Level = 0;
  let after: Level = 0;
  progress.update((p) => {
    const cur = p.lessons[lessonId] ?? { level: 0 as Level, best: 0, attempts: 0 };
    before = cur.level;
    after = afterCheckpoint(cur.level, score);
    return {
      ...p,
      streak: nextStreak(p.streak, new Date()),
      lessons: {
        ...p.lessons,
        [lessonId]: { level: after, best: Math.max(cur.best, score), attempts: cur.attempts + 1 },
      },
    };
  });
  return { before, after };
}

export interface LevelChange {
  lessonId: string;
  before: Level;
  after: Level;
}

/**
 * Records a unit test or mock exam. Each lesson that was examined moves up or down a level
 * according to its own result. Returns the level changes so the UI can show them.
 */
export function completeTest(key: string, perLesson: Record<string, { earned: number; total: number }>): LevelChange[] {
  const changes: LevelChange[] = [];
  progress.update((p) => {
    const lessons = { ...p.lessons };
    let earned = 0;
    let total = 0;
    for (const [lessonId, t] of Object.entries(perLesson)) {
      earned += t.earned;
      total += t.total;
      const cur = lessons[lessonId] ?? { level: 0 as Level, best: 0, attempts: 0 };
      const after = afterUnitTest(cur.level, t.earned, t.total);
      changes.push({ lessonId, before: cur.level, after });
      lessons[lessonId] = { ...cur, level: after };
    }
    const score = total ? earned / total : 0;
    const prev = p.tests[key] ?? { best: 0, attempts: 0 };
    return {
      ...p,
      streak: nextStreak(p.streak, new Date()),
      lessons,
      tests: { ...p.tests, [key]: { best: Math.max(prev.best, score), attempts: prev.attempts + 1 } },
    };
  });
  return changes;
}

/** Flashcard self-rating: a known card moves up a box, an unknown one goes back to the start. */
export function rateCard(id: string, known: boolean) {
  progress.update((p) => ({
    ...p,
    streak: nextStreak(p.streak, new Date()),
    cards: { ...p.cards, [id]: known ? Math.min(3, (p.cards[id] ?? 0) + 1) : 0 },
  }));
}

export const XP_PER_SECTION = 2;

/** Marks one section of a lesson as read. XP is paid only the first time. Returns XP gained. */
export function readSection(lessonId: string, index: number): number {
  let gained = 0;
  progress.update((p) => {
    const done = p.sections[lessonId] ?? [];
    if (done.includes(index)) return p;
    gained = XP_PER_SECTION;
    return {
      ...p,
      xp: p.xp + gained,
      streak: nextStreak(p.streak, new Date()),
      sections: { ...p.sections, [lessonId]: [...done, index] },
    };
  });
  return gained;
}

export function resetProgress() {
  progress.set(empty());
}
