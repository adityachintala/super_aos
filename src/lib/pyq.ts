// Past-paper (PYQ) questions grouped for the /pyq page: repeats merged into one card,
// with every paper they appeared in and how many times they were asked.
// Runs at build time (it reads the question bank).

import { bank } from './bank';
import { units, type Unit } from './course';
import type { Question } from './questions';

/**
 * Questions asked again in reworded form, merged into the first id's card.
 * Exact repeats are already merged in the data: their `source` reads "End-sem 2025 / End-sem 2022".
 */
const REWORDED: Record<string, string[]> = {
  'pq-sr-raid4': ['st-cp-raid345'], // RAID 4: its issue, and how RAID 5 fixes it
  'pq-tl-establish-release': ['tl-cp-establish'], // transport connection establishment
};

/** Label for a past-paper question whose paper was not recorded. */
export const UNKNOWN_PAPER = 'Paper not recorded';

export interface PyqItem {
  q: Question;
  lessonId: string;
  /** Every paper it appeared in, the reworded versions included. */
  sources: string[];
  /** Number of times it was asked across all papers. 2 or more is high-yield. */
  times: number;
  /** Reworded versions asked in other papers, shown on the same card. */
  variants: { q: Question; sources: string[] }[];
  /** 1-based position within its unit, as shown on the card ("Q3"). */
  number: number;
  unitId: Unit['id'];
  /** Plain-text start of the prompt, for link lists. */
  excerpt: string;
}

const papersOf = (q: Question) => (q.source ? q.source.split(' / ').map((s) => s.trim()) : [UNKNOWN_PAPER]);

function plain(html: string, max = 130) {
  const text = html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

const past = bank.filter((x) => x.q.pastPaper);
const byId = new Map(past.map((x) => [x.q.id, x]));
const merged = new Set(Object.values(REWORDED).flat());
for (const [main, others] of Object.entries(REWORDED)) {
  for (const id of [main, ...others]) if (!byId.has(id)) throw new Error(`pyq.ts: unknown past-paper question "${id}"`);
}

function toItem(x: (typeof past)[number], unitId: Unit['id']): Omit<PyqItem, 'number'> {
  const variants = (REWORDED[x.q.id] ?? []).map((id) => ({ q: byId.get(id)!.q, sources: papersOf(byId.get(id)!.q) }));
  const all = [papersOf(x.q), ...variants.map((v) => v.sources)];
  return {
    q: x.q,
    lessonId: x.lessonId,
    sources: [...new Set(all.flat())],
    times: all.reduce((n, s) => n + s.length, 0),
    variants,
    unitId,
    excerpt: plain(x.q.prompt),
  };
}

/** Units, then lessons in course order; within a lesson the most-asked questions come first. */
export const pyqGroups = units
  .map((unit) => {
    let n = 0;
    const lessons = unit.lessons
      .map((lesson) => ({
        lesson,
        items: past
          .filter((x) => x.lessonId === lesson.id && !merged.has(x.q.id))
          .map((x) => toItem(x, unit.id))
          .sort((a, b) => b.times - a.times) // stable: ties keep course order
          .map((it): PyqItem => ({ ...it, number: ++n })),
      }))
      .filter((g) => g.items.length > 0);
    return { unit, lessons, items: lessons.flatMap((l) => l.items) };
  })
  .filter((g) => g.lessons.length > 0);

export const pyqItems: PyqItem[] = pyqGroups.flatMap((g) => g.items);

/** Asked more than once, most-asked first, then in course order. */
export const highYield = pyqItems.filter((x) => x.times > 1).sort((a, b) => b.times - a.times);
