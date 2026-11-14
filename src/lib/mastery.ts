// Pure mastery, XP and streak rules. No browser APIs here so it can be unit tested.

export type Level = 0 | 1 | 2 | 3 | 4;

export const LEVELS = ['Not started', 'Attempted', 'Familiar', 'Proficient', 'Mastered'] as const;

export const XP_PER_QUESTION = 10;
export const HINT_COST = 2;

/** Level earned by a lesson checkpoint. A checkpoint alone never grants Mastered. */
export function checkpointLevel(score: number): Level {
  if (score >= 0.85) return 3;
  if (score >= 0.6) return 2;
  return 1;
}

/** A checkpoint can only raise a lesson's level. */
export function afterCheckpoint(current: Level, score: number): Level {
  return Math.max(current, checkpointLevel(score)) as Level;
}

/** Unit tests and mock exams move a lesson up or down one level. */
export function afterUnitTest(current: Level, correct: number, total: number): Level {
  if (total === 0) return current;
  const ratio = correct / total;
  if (ratio >= 0.8) return Math.min(4, Math.max(current, 2) + 1) as Level;
  if (ratio < 0.5) return Math.max(1, current - 1) as Level;
  return Math.max(current, 1) as Level;
}

export interface Streak {
  count: number;
  last: string | null; // YYYY-MM-DD
}

export function dayString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function nextStreak(streak: Streak, today: Date): Streak {
  const t = dayString(today);
  if (streak.last === t) return streak;
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return { count: streak.last === dayString(y) ? streak.count + 1 : 1, last: t };
}

/** A streak is only "alive" if the learner studied today or yesterday. */
export function liveStreak(streak: Streak, today: Date): number {
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  return streak.last === dayString(today) || streak.last === dayString(y) ? streak.count : 0;
}
