// Pure logic behind the thread visualizations.

export type Model = 'm1' | '11' | 'mn';

export interface ThreadSetup {
  /** User-level threads in the process. */
  user: number;
  /** Kernel threads (LWPs) given to the process. Only free to vary in the many-to-many model. */
  kernel: number;
  cores: number;
  /** User threads currently inside a blocking system call. */
  blocked: number;
}

export interface ThreadOutcome {
  /** Kernel threads the process really has under this model. */
  kernelThreads: number;
  /** Kernel threads not stuck in a blocking call. */
  usableKernel: number;
  /** User threads that could run if given a processor. */
  runnable: number;
  /** Threads of this process executing at the same instant. */
  parallel: number;
  idleCores: number;
  /** True if no thread of the process can make progress. */
  processBlocked: boolean;
}

export function threadOutcome(model: Model, s: ThreadSetup): ThreadOutcome {
  const blocked = Math.min(s.blocked, s.user);
  const runnable = s.user - blocked;
  const kernelThreads = model === 'm1' ? 1 : model === '11' ? s.user : s.kernel;
  // Each blocking call ties up the kernel thread underneath it.
  const usableKernel = Math.max(0, kernelThreads - (model === '11' ? blocked : Math.min(blocked, kernelThreads)));
  const parallel = Math.min(runnable, usableKernel, s.cores);
  return { kernelThreads, usableKernel, runnable, parallel, idleCores: s.cores - parallel, processBlocked: parallel === 0 && s.user > 0 };
}

/** Round-robin timeline: `tasks` tasks of `work` units each on `cores` cores. Returns one row per core. */
export function timeline(tasks: number, work: number, cores: number): { rows: (number | null)[][]; finish: number } {
  const left = Array(tasks).fill(work);
  const rows: (number | null)[][] = Array.from({ length: cores }, () => []);
  let next = 0;
  let t = 0;
  while (left.some((w) => w > 0) && t < 1000) {
    const chosen: number[] = [];
    for (let tried = 0; tried < tasks && chosen.length < cores; tried++) {
      const task = (next + tried) % tasks;
      if (left[task] > 0) chosen.push(task);
    }
    for (let c = 0; c < cores; c++) {
      const task = chosen[c] ?? null;
      rows[c].push(task);
      if (task !== null) left[task] -= 1;
    }
    next = chosen.length ? (chosen[chosen.length - 1] + 1) % tasks : next;
    t += 1;
  }
  return { rows, finish: t };
}

// ---------- Thread pool ----------

export interface PoolTick {
  arrived: number;
  busy: number;
  queued: number;
}

/**
 * Requests arrive per tick and each needs `service` ticks of a thread. With a pool of `size`
 * threads, extra requests queue. Pass Infinity to model "create a new thread for every request".
 */
export function poolSim(arrivals: number[], service: number, size: number) {
  const ticks: PoolTick[] = [];
  const running: number[] = []; // remaining ticks per busy thread
  const waiting: number[] = []; // arrival tick of each queued request
  let totalWait = 0;
  let served = 0;
  let peak = 0;
  for (let t = 0; t < arrivals.length || running.length || waiting.length; t++) {
    for (let i = running.length - 1; i >= 0; i--) if (--running[i] <= 0) running.splice(i, 1);
    for (let i = 0; i < (arrivals[t] ?? 0); i++) waiting.push(t);
    while (waiting.length && running.length < size) {
      totalWait += t - (waiting.shift() as number);
      served += 1;
      running.push(service);
    }
    peak = Math.max(peak, running.length);
    ticks.push({ arrived: arrivals[t] ?? 0, busy: running.length, queued: waiting.length });
    if (t > 5000) break;
  }
  return { ticks, meanWait: served ? totalWait / served : 0, peakThreads: peak, served };
}
