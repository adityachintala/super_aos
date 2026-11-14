// Pure logic behind the CPU-scheduling visualizations. Time advances in whole units.

export type Algo = 'fcfs' | 'sjf' | 'srtf' | 'prio' | 'prio-p' | 'rr' | 'mlfq';

export interface Proc {
  id: string;
  arrival: number;
  burst: number;
  /** Lower number means higher priority. */
  priority: number;
}

export interface Slice {
  /** null means the CPU was idle. */
  id: string | null;
  start: number;
  end: number;
  /** Multilevel feedback queue only: the queue the process ran from. */
  level?: number;
}

export interface ProcStats {
  id: string;
  completion: number;
  turnaround: number;
  waiting: number;
  /** Time from arrival until the process first gets the CPU. */
  response: number;
}

export interface Result {
  gantt: Slice[];
  stats: ProcStats[];
  avgWaiting: number;
  avgTurnaround: number;
  avgResponse: number;
  contextSwitches: number;
}

export const MLFQ_QUANTA = [8, 16, Infinity];

export function schedule(procs: Proc[], algo: Algo, quantum = 4): Result {
  const n = procs.length;
  const remaining = procs.map((p) => p.burst);
  const firstRun: (number | null)[] = Array(n).fill(null);
  const completion: number[] = Array(n).fill(0);
  const admitted: boolean[] = Array(n).fill(false);
  const level: number[] = Array(n).fill(0); // MLFQ queue of each process
  const queue: number[] = []; // RR ready queue; MLFQ uses `queues`
  const queues: number[][] = [[], [], []];
  const gantt: Slice[] = [];
  let running: number | null = null;
  let used = 0; // time the running process has had in its current quantum
  let t = 0;
  let done = 0;
  const horizon = procs.reduce((a, p) => Math.max(a, p.arrival), 0) + procs.reduce((a, p) => a + p.burst, 0) + 1;

  const arrivedReady = () => procs.map((_, i) => i).filter((i) => admitted[i] && remaining[i] > 0);
  const best = (cands: number[], key: (i: number) => number) =>
    cands.reduce((a, b) => (key(b) < key(a) || (key(b) === key(a) && (procs[b].arrival < procs[a].arrival || (procs[b].arrival === procs[a].arrival && b < a))) ? b : a));

  while (done < n && t <= horizon) {
    // 1. Admit arrivals. They join their queue before a process whose quantum has just expired.
    for (let i = 0; i < n; i++) {
      if (!admitted[i] && procs[i].arrival <= t) {
        admitted[i] = true;
        if (algo === 'rr') queue.push(i);
        if (algo === 'mlfq') queues[0].push(i);
      }
    }

    // 2. Decide who runs during [t, t + 1).
    if (algo === 'rr') {
      if (running !== null && used >= quantum) {
        queue.push(running);
        running = null;
      }
      if (running === null && queue.length) {
        running = queue.shift() as number;
        used = 0;
      }
    } else if (algo === 'mlfq') {
      if (running !== null && used >= MLFQ_QUANTA[level[running]]) {
        level[running] = Math.min(2, level[running] + 1); // used its whole quantum: demote
        queues[level[running]].push(running);
        running = null;
      }
      const top = queues.findIndex((q) => q.length > 0);
      if (running !== null && top !== -1 && top < level[running]) {
        // Preempted by a higher queue: it keeps its place at the head of its own queue and,
        // by the convention used here, starts a fresh quantum when it resumes.
        queues[level[running]].unshift(running);
        running = null;
      }
      if (running === null && top !== -1) {
        running = queues[top].shift() as number;
        used = 0;
      }
    } else {
      const ready = arrivedReady();
      const preemptive = algo === 'srtf' || algo === 'prio-p';
      if (running === null || preemptive) {
        if (ready.length === 0) running = null;
        else if (algo === 'fcfs') running = running ?? best(ready, (i) => procs[i].arrival);
        else if (algo === 'sjf') running = best(ready, (i) => procs[i].burst);
        else if (algo === 'prio') running = best(ready, (i) => procs[i].priority);
        else {
          const key = algo === 'srtf' ? (i: number) => remaining[i] : (i: number) => procs[i].priority;
          const cand = best(ready, key);
          // Keep the current process unless the candidate is strictly better.
          running = running !== null && key(running) <= key(cand) ? running : cand;
        }
      }
    }

    // 3. Run for one unit.
    const id = running === null ? null : procs[running].id;
    const lvl = algo === 'mlfq' && running !== null ? level[running] : undefined;
    const last = gantt[gantt.length - 1];
    if (last && last.id === id && last.level === lvl && last.end === t) last.end = t + 1;
    else gantt.push({ id, start: t, end: t + 1, ...(lvl !== undefined ? { level: lvl } : {}) });

    if (running !== null) {
      if (firstRun[running] === null) firstRun[running] = t;
      remaining[running] -= 1;
      used += 1;
      if (remaining[running] === 0) {
        completion[running] = t + 1;
        done += 1;
        running = null;
        used = 0;
      }
    }
    t += 1;
  }

  // Round robin and MLFQ can produce back-to-back slices of the same process; merge them.
  const merged: Slice[] = [];
  for (const s of gantt) {
    const prev = merged[merged.length - 1];
    if (prev && prev.id === s.id && prev.level === s.level) prev.end = s.end;
    else merged.push({ ...s });
  }
  while (merged.length && merged[merged.length - 1].id === null) merged.pop();

  const stats = procs.map((p, i) => ({
    id: p.id,
    completion: completion[i],
    turnaround: completion[i] - p.arrival,
    waiting: completion[i] - p.arrival - p.burst,
    response: (firstRun[i] ?? p.arrival) - p.arrival,
  }));
  const avg = (f: (s: ProcStats) => number) => (n ? stats.reduce((a, s) => a + f(s), 0) / n : 0);
  const busy = merged.filter((s) => s.id !== null);
  return {
    gantt: merged,
    stats,
    avgWaiting: avg((s) => s.waiting),
    avgTurnaround: avg((s) => s.turnaround),
    avgResponse: avg((s) => s.response),
    contextSwitches: Math.max(0, busy.length - 1),
  };
}

// ---------- Predicting the next CPU burst ----------

/** Exponential averaging: tau(n+1) = alpha * t(n) + (1 - alpha) * tau(n). Returns every prediction. */
export function predictBursts(actual: number[], alpha: number, initial: number): number[] {
  const out = [initial];
  for (const t of actual) out.push(alpha * t + (1 - alpha) * out[out.length - 1]);
  return out;
}

// ---------- Real-time scheduling ----------

export interface RtTask {
  name: string;
  period: number;
  burst: number;
}
export type RtPolicy = 'rm' | 'edf';

export const utilization = (tasks: RtTask[]) => tasks.reduce((a, t) => a + t.burst / t.period, 0);
/** Rate-monotonic scheduling is guaranteed to work if utilisation does not exceed n(2^(1/n) - 1). */
export const rmBound = (n: number) => n * (2 ** (1 / n) - 1);

export interface RtResult {
  /** Which task ran in each time unit (index), or null for idle. */
  timeline: (number | null)[];
  /** Deadlines that passed with work still outstanding. */
  misses: { task: number; at: number }[];
}

export function realTime(tasks: RtTask[], policy: RtPolicy, horizon: number): RtResult {
  const left = tasks.map(() => 0);
  const deadline = tasks.map(() => 0);
  const timeline: (number | null)[] = [];
  const misses: { task: number; at: number }[] = [];
  for (let t = 0; t < horizon; t++) {
    tasks.forEach((task, i) => {
      if (t % task.period === 0) {
        if (left[i] > 0) misses.push({ task: i, at: t });
        left[i] = task.burst; // the unfinished job is abandoned in favour of the new one
        deadline[i] = t + task.period;
      }
    });
    const ready = tasks.map((_, i) => i).filter((i) => left[i] > 0);
    if (ready.length === 0) {
      timeline.push(null);
      continue;
    }
    const key = policy === 'rm' ? (i: number) => tasks[i].period : (i: number) => deadline[i];
    const pick = ready.reduce((a, b) => (key(b) < key(a) ? b : a));
    left[pick] -= 1;
    timeline.push(pick);
  }
  return { timeline, misses };
}
