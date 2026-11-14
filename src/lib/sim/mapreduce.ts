// Pure logic behind the MapReduce visualizations.

export type Pair = [key: string, value: string];
export type JobId = 'wordcount' | 'grep' | 'index';

export interface Job {
  name: string;
  /** Map takes one input record (a line, and the name of the split it came from). */
  map: (line: string, source: string, arg: string) => Pair[];
  reduce: (key: string, values: string[]) => string;
  /** An optional combiner runs on each mapper's output before it is sent over the network. */
  combine?: (key: string, values: string[]) => string;
}

const words = (line: string) => line.toLowerCase().match(/[a-z0-9']+/g) ?? [];

export const JOBS: Record<JobId, Job> = {
  wordcount: {
    name: 'Word count',
    map: (line) => words(line).map((w) => [w, '1']),
    reduce: (_k, values) => String(values.reduce((a, v) => a + Number(v), 0)),
    combine: (_k, values) => String(values.reduce((a, v) => a + Number(v), 0)),
  },
  grep: {
    name: 'Distributed grep',
    map: (line, _source, pattern) => (pattern && line.toLowerCase().includes(pattern.toLowerCase()) ? [[line.trim(), '1']] : []),
    reduce: () => '',
  },
  index: {
    name: 'Inverted index',
    map: (line, source) => [...new Set(words(line))].map((w) => [w, source]),
    reduce: (_k, values) => [...new Set(values)].sort().join(', '),
  },
};

/** A simple, stable string hash used by the default partitioning function. */
export function hash(key: string): number {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}
export const partitionOf = (key: string, reducers: number) => hash(key) % reducers;

/** Splits the input lines into M roughly equal contiguous chunks. */
export function splitInput(lines: string[], mappers: number): string[][] {
  const m = Math.max(1, Math.min(mappers, lines.length || 1));
  const out: string[][] = Array.from({ length: m }, () => []);
  lines.forEach((line, i) => out[Math.floor((i * m) / lines.length)].push(line));
  return out;
}

function groupByKey(pairs: Pair[]): Map<string, string[]> {
  const g = new Map<string, string[]>();
  for (const [k, v] of pairs) g.set(k, [...(g.get(k) ?? []), v]);
  return g;
}

export interface Run {
  splits: string[][];
  /** Raw output of each map task. */
  mapped: Pair[][];
  /** What each map task actually sends on (after the combiner, if used). */
  sent: Pair[][];
  /** For each reducer: its keys in sorted order with all their values. */
  grouped: { key: string; values: string[] }[][];
  /** For each reducer: its output file. */
  output: Pair[][];
  pairsShuffled: number;
}

export function run(jobId: JobId, lines: string[], mappers: number, reducers: number, opts: { combiner?: boolean; arg?: string } = {}): Run {
  const job = JOBS[jobId];
  const splits = splitInput(lines, mappers);
  const mapped = splits.map((chunk, i) => chunk.flatMap((line) => job.map(line, `doc${i + 1}`, opts.arg ?? '')));
  const sent = mapped.map((pairs) =>
    opts.combiner && job.combine ? [...groupByKey(pairs)].map(([k, vs]): Pair => [k, job.combine!(k, vs)]) : pairs,
  );

  const buckets: Pair[][] = Array.from({ length: reducers }, () => []);
  for (const pairs of sent) for (const p of pairs) buckets[partitionOf(p[0], reducers)].push(p);

  const grouped = buckets.map((pairs) =>
    [...groupByKey(pairs)].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([key, values]) => ({ key, values })),
  );
  const output = grouped.map((groups) => groups.map(({ key, values }): Pair => [key, job.reduce(key, values)]));
  return { splits, mapped, sent, grouped, output, pairsShuffled: sent.reduce((a, p) => a + p.length, 0) };
}

// ---------- Fault tolerance ----------

export type TaskState = 'idle' | 'in-progress' | 'completed';
export interface Task {
  id: string;
  kind: 'map' | 'reduce';
  state: TaskState;
  worker: string | null;
}

/**
 * What the master does when a worker stops answering pings. Map tasks on that worker are
 * reset even if completed, because their output lived on its local disk. Completed reduce
 * tasks are kept, because their output is already in the global file system.
 */
export function onWorkerFailure(tasks: Task[], worker: string): Task[] {
  return tasks.map((t) => {
    if (t.worker !== worker) return t;
    if (t.kind === 'reduce' && t.state === 'completed') return t;
    return { ...t, state: 'idle', worker: null };
  });
}
