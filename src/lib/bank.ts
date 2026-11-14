// Every question on the site, gathered from src/data/questions/<lesson id>.ts.
// Used at build time by the unit test, mock exam, review and past-paper pages.

import { allLessons } from './course';
import type { BankItem } from './exam';
import type { Question } from './questions';

interface QuestionModule {
  checks?: Record<string, Question>;
  practice?: Record<string, Question>;
  checkpoint?: Question[];
}

const modules = import.meta.glob<QuestionModule>('../data/questions/*.ts', { eager: true });

const byLesson = new Map<string, BankItem[]>();
for (const [path, mod] of Object.entries(modules)) {
  const lessonId = path.split('/').pop()!.replace(/\.ts$/, '');
  const items: BankItem[] = [
    ...Object.values(mod.checks ?? {}).map((q) => ({ lessonId, source: 'check' as const, q })),
    ...Object.values(mod.practice ?? {}).map((q) => ({ lessonId, source: 'practice' as const, q })),
    ...(mod.checkpoint ?? []).map((q) => ({ lessonId, source: 'checkpoint' as const, q })),
  ];
  byLesson.set(lessonId, items);
}

/** All questions, in course order. */
export const bank: BankItem[] = allLessons.flatMap((l) => byLesson.get(l.id) ?? []);

export const questionsFor = (lessonIds: string[]) => bank.filter((x) => lessonIds.includes(x.lessonId));

const ids = bank.map((x) => x.q.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) throw new Error(`Duplicate question ids: ${[...new Set(dupes)].join(', ')}`);
