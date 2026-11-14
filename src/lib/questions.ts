// Question formats used by inline checks, checkpoints, unit tests and the mock exam.
// `prompt`, `explanation`, option text and model answers may contain simple inline HTML.

interface Base {
  id: string;
  prompt: string;
  /** Shown after answering. For written questions this is optional extra commentary. */
  explanation?: string;
  hint?: string;
  /** Set when the question comes from a past quiz paper. */
  pastPaper?: boolean;
}

export interface McqQuestion extends Base {
  type: 'mcq';
  options: string[];
  answer: number;
}

export interface MultiQuestion extends Base {
  type: 'multi';
  options: string[];
  answers: number[];
}

export interface NumericQuestion extends Base {
  type: 'numeric';
  answer: number;
  tolerance?: number;
  unit?: string;
}

/** True/false. The explanation should justify the verdict and, if false, give the corrected statement. */
export interface TfQuestion extends Base {
  type: 'tf';
  answer: boolean;
}

/** Exam-style written answer, self-graded against marking points. */
export interface WrittenQuestion extends Base {
  type: 'written';
  marks: number;
  points: string[];
  modelAnswer: string;
}

export type Question = McqQuestion | MultiQuestion | NumericQuestion | TfQuestion | WrittenQuestion;

/** Grades an auto-gradable response. Returns a fraction in 0..1. */
export function grade(q: Exclude<Question, WrittenQuestion>, response: unknown): number {
  switch (q.type) {
    case 'mcq':
      return response === q.answer ? 1 : 0;
    case 'tf':
      return response === q.answer ? 1 : 0;
    case 'numeric': {
      const n = typeof response === 'number' ? response : Number(String(response).replace(/,/g, '').trim());
      if (!Number.isFinite(n) || String(response).trim() === '') return 0;
      return Math.abs(n - q.answer) <= (q.tolerance ?? 0) + 1e-9 ? 1 : 0;
    }
    case 'multi': {
      const picked = [...(response as number[])].sort((a, b) => a - b);
      const want = [...q.answers].sort((a, b) => a - b);
      return picked.length === want.length && picked.every((v, i) => v === want[i]) ? 1 : 0;
    }
  }
}
