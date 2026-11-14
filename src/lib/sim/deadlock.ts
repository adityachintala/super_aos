// Pure logic behind the deadlock visualizations.

export type Vec = number[];
const leq = (a: Vec, b: Vec) => a.every((v, i) => v <= b[i]);
const add = (a: Vec, b: Vec) => a.map((v, i) => v + b[i]);
const sub = (a: Vec, b: Vec) => a.map((v, i) => v - b[i]);

// ---------- Banker's algorithm ----------

export interface BankState {
  available: Vec;
  max: Vec[];
  allocation: Vec[];
}

export const need = (s: BankState): Vec[] => s.max.map((m, i) => sub(m, s.allocation[i]));

export interface SafetyStep {
  /** The process chosen in this step. */
  process: number;
  /** Work before the process runs, and after it finishes and returns its allocation. */
  workBefore: Vec;
  workAfter: Vec;
}

export interface SafetyResult {
  safe: boolean;
  sequence: number[];
  steps: SafetyStep[];
  /** Processes that could not finish (non-empty only when unsafe). */
  stuck: number[];
}

/** The safety algorithm: repeatedly find a process whose Need fits in Work, and let it finish. */
export function safety(s: BankState): SafetyResult {
  const n = s.max.length;
  const needs = need(s);
  let work = s.available.slice();
  const finish = Array(n).fill(false);
  const steps: SafetyStep[] = [];
  let found = true;
  while (found) {
    found = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i] && leq(needs[i], work)) {
        const after = add(work, s.allocation[i]);
        steps.push({ process: i, workBefore: work, workAfter: after });
        work = after;
        finish[i] = true;
        found = true;
      }
    }
  }
  const stuck = finish.map((f, i) => (f ? -1 : i)).filter((i) => i >= 0);
  return { safe: stuck.length === 0, sequence: steps.map((x) => x.process), steps, stuck };
}

export type RequestOutcome =
  | { granted: true; state: BankState; sequence: number[] }
  | { granted: false; reason: 'exceeds-need' | 'not-available' | 'unsafe'; state: BankState };

/** The resource-request algorithm for process p. */
export function request(s: BankState, p: number, req: Vec): RequestOutcome {
  if (!leq(req, need(s)[p])) return { granted: false, reason: 'exceeds-need', state: s };
  if (!leq(req, s.available)) return { granted: false, reason: 'not-available', state: s };
  // Pretend to allocate, then test the resulting state for safety.
  const trial: BankState = {
    available: sub(s.available, req),
    max: s.max,
    allocation: s.allocation.map((a, i) => (i === p ? add(a, req) : a)),
  };
  const r = safety(trial);
  return r.safe ? { granted: true, state: trial, sequence: r.sequence } : { granted: false, reason: 'unsafe', state: s };
}

/** The standard example: 5 processes, resource types A (10), B (5), C (7). */
export const BANK_EXAMPLE: BankState = {
  available: [3, 3, 2],
  max: [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]],
  allocation: [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]],
};

// ---------- Deadlock detection (several instances of each resource type) ----------

export interface DetectState {
  available: Vec;
  allocation: Vec[];
  request: Vec[];
}

/** Like the safety algorithm, but with current requests in place of maximum needs. */
export function detect(s: DetectState): { deadlocked: number[]; sequence: number[] } {
  const n = s.allocation.length;
  let work = s.available.slice();
  const finish = s.allocation.map((a) => a.every((v) => v === 0)); // holding nothing: cannot be part of a deadlock
  const sequence: number[] = [];
  let found = true;
  while (found) {
    found = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i] && leq(s.request[i], work)) {
        work = add(work, s.allocation[i]);
        finish[i] = true;
        sequence.push(i);
        found = true;
      }
    }
  }
  return { deadlocked: finish.map((f, i) => (f ? -1 : i)).filter((i) => i >= 0), sequence };
}

// ---------- Resource-allocation graphs ----------

export interface Rag {
  processes: string[];
  /** Resource types with their number of instances. */
  resources: Record<string, number>;
  /** Request edges: process wants one instance of the resource. */
  requests: [string, string][];
  /** Assignment edges: one instance of the resource is held by the process. */
  assignments: [string, string][];
}

/** Finds one cycle in the graph (as a list of node names), or null. */
export function findCycle(g: Rag): string[] | null {
  const out: Record<string, string[]> = {};
  for (const [p, r] of g.requests) (out[p] ??= []).push(r);
  for (const [r, p] of g.assignments) (out[r] ??= []).push(p);
  const state: Record<string, number> = {}; // 1 = on the stack, 2 = done
  const stack: string[] = [];
  const visit = (node: string): string[] | null => {
    state[node] = 1;
    stack.push(node);
    for (const next of out[node] ?? []) {
      if (state[next] === 1) return stack.slice(stack.indexOf(next));
      if (!state[next]) {
        const c = visit(next);
        if (c) return c;
      }
    }
    stack.pop();
    state[node] = 2;
    return null;
  };
  for (const node of [...g.processes, ...Object.keys(g.resources)]) {
    if (!state[node]) {
      const c = visit(node);
      if (c) return c;
    }
  }
  return null;
}

/**
 * Graph reduction: repeatedly pick a process all of whose requests can be met from free
 * instances, let it finish and release what it holds. Whatever cannot be reduced is deadlocked.
 */
export function reduceRag(g: Rag): { order: string[]; deadlocked: string[] } {
  const free: Record<string, number> = { ...g.resources };
  for (const [r] of g.assignments) free[r] -= 1;
  const left = new Set(g.processes);
  const order: string[] = [];
  let found = true;
  while (found) {
    found = false;
    for (const p of g.processes) {
      if (!left.has(p)) continue;
      const wants: Record<string, number> = {};
      for (const [q, r] of g.requests) if (q === p) wants[r] = (wants[r] ?? 0) + 1;
      if (Object.entries(wants).every(([r, k]) => free[r] >= k)) {
        for (const [r, q] of g.assignments) if (q === p) free[r] += 1;
        left.delete(p);
        order.push(p);
        found = true;
      }
    }
  }
  return { order, deadlocked: [...left] };
}

export const RAG_EXAMPLES: { id: string; name: string; note: string; graph: Rag }[] = [
  {
    id: 'no-cycle',
    name: 'No cycle',
    note: 'P3 holds R3 and is waiting for nothing, so it can finish. That frees R3 for P2, which then frees R1 for P1.',
    graph: {
      processes: ['P1', 'P2', 'P3'],
      resources: { R1: 1, R2: 2, R3: 1, R4: 3 },
      requests: [['P1', 'R1'], ['P2', 'R3']],
      assignments: [['R1', 'P2'], ['R2', 'P1'], ['R2', 'P2'], ['R3', 'P3']],
    },
  },
  {
    id: 'deadlock',
    name: 'Cycle with deadlock',
    note: 'The same graph, with one more edge: P3 now requests R2. Both instances of R2 are held, so nobody can proceed.',
    graph: {
      processes: ['P1', 'P2', 'P3'],
      resources: { R1: 1, R2: 2, R3: 1, R4: 3 },
      requests: [['P1', 'R1'], ['P2', 'R3'], ['P3', 'R2']],
      assignments: [['R1', 'P2'], ['R2', 'P1'], ['R2', 'P2'], ['R3', 'P3']],
    },
  },
  {
    id: 'cycle-only',
    name: 'Cycle, no deadlock',
    note: 'There is a cycle through P1 and P3, but P2 and P4 are outside it and waiting for nothing. When either finishes, it releases an instance that breaks the cycle.',
    graph: {
      processes: ['P1', 'P2', 'P3', 'P4'],
      resources: { R1: 2, R2: 2 },
      requests: [['P1', 'R1'], ['P3', 'R2']],
      assignments: [['R1', 'P2'], ['R1', 'P3'], ['R2', 'P1'], ['R2', 'P4']],
    },
  },
];
