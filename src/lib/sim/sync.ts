// Pure logic behind the synchronization visualizations.

// ---------- The counter++ / counter-- race ----------

export interface RaceState {
  counter: number;
  reg1: number | null;
  reg2: number | null;
  /** How many of its three machine steps each process has executed. */
  p: number;
  c: number;
}

export const RACE_STEPS = {
  P: ['register1 = counter', 'register1 = register1 + 1', 'counter = register1'],
  C: ['register2 = counter', 'register2 = register2 - 1', 'counter = register2'],
};

export const raceStart = (counter = 5): RaceState => ({ counter, reg1: null, reg2: null, p: 0, c: 0 });

/** Executes the next machine instruction of the producer (P) or the consumer (C). */
export function raceStep(s: RaceState, who: 'P' | 'C'): RaceState {
  if (who === 'P') {
    if (s.p === 0) return { ...s, reg1: s.counter, p: 1 };
    if (s.p === 1) return { ...s, reg1: (s.reg1 as number) + 1, p: 2 };
    if (s.p === 2) return { ...s, counter: s.reg1 as number, p: 3 };
  } else {
    if (s.c === 0) return { ...s, reg2: s.counter, c: 1 };
    if (s.c === 1) return { ...s, reg2: (s.reg2 as number) - 1, c: 2 };
    if (s.c === 2) return { ...s, counter: s.reg2 as number, c: 3 };
  }
  return s;
}

/** Final counter value for every possible interleaving of the two three-step sequences. */
export function raceOutcomes(counter = 5): Record<number, number> {
  const tally: Record<number, number> = {};
  const walk = (s: RaceState) => {
    if (s.p === 3 && s.c === 3) {
      tally[s.counter] = (tally[s.counter] ?? 0) + 1;
      return;
    }
    if (s.p < 3) walk(raceStep(s, 'P'));
    if (s.c < 3) walk(raceStep(s, 'C'));
  };
  walk(raceStart(counter));
  return tally;
}

// ---------- Two-process critical-section algorithms ----------

export type CsAlgo = 'turn' | 'flag' | 'check-first' | 'peterson';
export type Pc = 'rem' | 'entry1' | 'entry2' | 'wait' | 'cs' | 'exit';

export interface CsState {
  pc: [Pc, Pc];
  flag: [boolean, boolean];
  turn: 0 | 1;
}

export const csStart = (): CsState => ({ pc: ['rem', 'rem'], flag: [false, false], turn: 0 });

export const CS_CODE: Record<CsAlgo, { pc: Pc; text: string }[]> = {
  turn: [
    { pc: 'rem', text: 'remainder section' },
    { pc: 'wait', text: 'while (turn != i) ;' },
    { pc: 'cs', text: 'critical section' },
    { pc: 'exit', text: 'turn = j;' },
  ],
  flag: [
    { pc: 'rem', text: 'remainder section' },
    { pc: 'entry1', text: 'flag[i] = true;' },
    { pc: 'wait', text: 'while (flag[j]) ;' },
    { pc: 'cs', text: 'critical section' },
    { pc: 'exit', text: 'flag[i] = false;' },
  ],
  'check-first': [
    { pc: 'rem', text: 'remainder section' },
    { pc: 'wait', text: 'while (flag[j]) ;' },
    { pc: 'entry1', text: 'flag[i] = true;' },
    { pc: 'cs', text: 'critical section' },
    { pc: 'exit', text: 'flag[i] = false;' },
  ],
  peterson: [
    { pc: 'rem', text: 'remainder section' },
    { pc: 'entry1', text: 'flag[i] = true;' },
    { pc: 'entry2', text: 'turn = j;' },
    { pc: 'wait', text: 'while (flag[j] && turn == j) ;' },
    { pc: 'cs', text: 'critical section' },
    { pc: 'exit', text: 'flag[i] = false;' },
  ],
};

/** Runs one statement of process i. Returns the same state if the process is spinning in its while loop. */
export function csStep(algo: CsAlgo, s: CsState, i: 0 | 1): CsState {
  const j = (1 - i) as 0 | 1;
  const pc = s.pc[i];
  const set = (next: Pc, patch: Partial<CsState> = {}): CsState => {
    const pcs = [...s.pc] as [Pc, Pc];
    pcs[i] = next;
    return { ...s, ...patch, pc: pcs };
  };
  const withFlag = (v: boolean): [boolean, boolean] => {
    const f = [...s.flag] as [boolean, boolean];
    f[i] = v;
    return f;
  };

  switch (algo) {
    case 'turn':
      if (pc === 'rem') return set('wait');
      if (pc === 'wait') return s.turn === i ? set('cs') : s;
      if (pc === 'cs') return set('exit');
      return set('rem', { turn: j });
    case 'flag':
      if (pc === 'rem') return set('entry1');
      if (pc === 'entry1') return set('wait', { flag: withFlag(true) });
      if (pc === 'wait') return s.flag[j] ? s : set('cs');
      if (pc === 'cs') return set('exit');
      return set('rem', { flag: withFlag(false) });
    case 'check-first':
      if (pc === 'rem') return set('wait');
      if (pc === 'wait') return s.flag[j] ? s : set('entry1');
      if (pc === 'entry1') return set('cs', { flag: withFlag(true) });
      if (pc === 'cs') return set('exit');
      return set('rem', { flag: withFlag(false) });
    case 'peterson':
      if (pc === 'rem') return set('entry1');
      if (pc === 'entry1') return set('entry2', { flag: withFlag(true) });
      if (pc === 'entry2') return set('wait', { turn: j });
      if (pc === 'wait') return s.flag[j] && s.turn === j ? s : set('cs');
      if (pc === 'cs') return set('exit');
      return set('rem', { flag: withFlag(false) });
  }
}

const key = (s: CsState) => `${s.pc[0]}|${s.pc[1]}|${s.flag[0]}|${s.flag[1]}|${s.turn}`;

export interface CsVerdict {
  mutualExclusion: boolean;
  /** No reachable state in which both processes spin for ever. */
  noDeadlock: boolean;
  /** A process can enter even if the other never leaves its remainder section. */
  progress: boolean;
}

/** Explores every interleaving of the two processes. */
export function csCheck(algo: CsAlgo): CsVerdict {
  const seen = new Map<string, CsState>();
  const frontier = [csStart()];
  let mutualExclusion = true;
  let noDeadlock = true;
  while (frontier.length) {
    const s = frontier.pop() as CsState;
    if (seen.has(key(s))) continue;
    seen.set(key(s), s);
    if (s.pc[0] === 'cs' && s.pc[1] === 'cs') mutualExclusion = false;
    const next = [csStep(algo, s, 0), csStep(algo, s, 1)];
    if (next[0] === s && next[1] === s) noDeadlock = false;
    for (const n of next) if (n !== s) frontier.push(n);
  }

  // Progress: process 1 stays in its remainder section for ever. Can process 0 enter twice?
  let s = csStart();
  let entries = 0;
  for (let k = 0; k < 40 && entries < 2; k++) {
    const n = csStep(algo, s, 0);
    if (n === s) break;
    if (n.pc[0] === 'cs') entries += 1;
    s = n;
  }
  return { mutualExclusion, noDeadlock, progress: entries >= 2 && noDeadlock };
}

// ---------- A small semaphore machine ----------

export type Op = { kind: 'wait' | 'signal'; sem: string } | { kind: 'do'; text: string; critical?: boolean };

export interface SemProc {
  name: string;
  ops: Op[];
  pc: number;
  blockedOn: string | null;
  /** Number of times the process has completed its whole program. */
  laps: number;
}

export interface SemSystem {
  sems: Record<string, number>;
  /** Processes blocked on each semaphore, in the order they blocked. */
  queues: Record<string, string[]>;
  procs: SemProc[];
  log: string;
}

export function semSystem(sems: Record<string, number>, programs: { name: string; ops: Op[] }[]): SemSystem {
  return {
    sems: { ...sems },
    queues: Object.fromEntries(Object.keys(sems).map((k) => [k, []])),
    procs: programs.map((p) => ({ name: p.name, ops: p.ops, pc: 0, blockedOn: null, laps: 0 })),
    log: '',
  };
}

const advance = (p: SemProc): SemProc => {
  const pc = p.pc + 1;
  return pc >= p.ops.length ? { ...p, pc: 0, laps: p.laps + 1 } : { ...p, pc };
};

/** Runs the next operation of the named process. A blocked process cannot be stepped. */
export function semStep(sys: SemSystem, name: string): SemSystem {
  const idx = sys.procs.findIndex((p) => p.name === name);
  const p = sys.procs[idx];
  if (!p || p.blockedOn) return sys;
  const op = p.ops[p.pc];
  const sems = { ...sys.sems };
  const queues = Object.fromEntries(Object.entries(sys.queues).map(([k, v]) => [k, [...v]]));
  const procs = sys.procs.slice();
  let log: string;

  if (op.kind === 'wait') {
    if (sems[op.sem] > 0) {
      sems[op.sem] -= 1;
      procs[idx] = advance(p);
      log = `${name}: wait(${op.sem}) succeeds; ${op.sem} is now ${sems[op.sem]}.`;
    } else {
      queues[op.sem].push(name);
      procs[idx] = { ...p, blockedOn: op.sem };
      log = `${name}: wait(${op.sem}) finds the value 0, so ${name} blocks and joins the queue of ${op.sem}.`;
    }
  } else if (op.kind === 'signal') {
    const woken = queues[op.sem].shift();
    if (woken) {
      const w = procs.findIndex((q) => q.name === woken);
      procs[w] = advance({ ...procs[w], blockedOn: null });
      log = `${name}: signal(${op.sem}) wakes ${woken}, which completes its wait.`;
    } else {
      sems[op.sem] += 1;
      log = `${name}: signal(${op.sem}); nobody was waiting, so ${op.sem} becomes ${sems[op.sem]}.`;
    }
    procs[idx] = advance(procs[idx]);
  } else {
    procs[idx] = advance(p);
    log = `${name}: ${op.text}.`;
  }
  return { sems, queues, procs, log };
}

export const semDeadlocked = (sys: SemSystem) => sys.procs.length > 0 && sys.procs.every((p) => p.blockedOn !== null);

/** Names of processes currently between a critical 'do' and the operation after it. */
export function inCritical(sys: SemSystem): string[] {
  return sys.procs.filter((p) => !p.blockedOn && p.ops[p.pc]?.kind === 'do' && (p.ops[p.pc] as { critical?: boolean }).critical).map((p) => p.name);
}

const W = (sem: string): Op => ({ kind: 'wait', sem });
const S = (sem: string): Op => ({ kind: 'signal', sem });
const D = (text: string, critical = false): Op => ({ kind: 'do', text, critical });

export interface SemPreset {
  id: string;
  name: string;
  about: string;
  sems: Record<string, number>;
  programs: { name: string; ops: Op[] }[];
}

const philosopher = (i: number, first: number, second: number) => ({
  name: `Ph${i}`,
  ops: [D('think'), W(`chopstick${first}`), W(`chopstick${second}`), D('eat', true), S(`chopstick${first}`), S(`chopstick${second}`)],
});

export const SEM_PRESETS: SemPreset[] = [
  {
    id: 'mutex',
    name: 'Mutual exclusion',
    about: 'Three processes guard their critical sections with one semaphore initialised to 1. However you interleave them, at most one is ever inside.',
    sems: { mutex: 1 },
    programs: ['P1', 'P2', 'P3'].map((name) => ({ name, ops: [D('remainder section'), W('mutex'), D('critical section', true), S('mutex')] })),
  },
  {
    id: 'order',
    name: 'Forcing an order',
    about: 'Statement S2 in P2 must run only after S1 in P1. A semaphore initialised to 0 makes P2 wait, whichever process the scheduler runs first.',
    sems: { synch: 0 },
    programs: [
      { name: 'P1', ops: [D('S1'), S('synch'), D('carry on')] },
      { name: 'P2', ops: [W('synch'), D('S2'), D('carry on')] },
    ],
  },
  {
    id: 'buffer',
    name: 'Bounded buffer',
    about: 'A buffer of 2 slots. "empty" counts free slots, "full" counts items, and "mutex" protects the buffer itself. The producer blocks when the buffer is full, the consumer when it is empty.',
    sems: { mutex: 1, empty: 2, full: 0 },
    programs: [
      { name: 'Producer', ops: [D('produce an item'), W('empty'), W('mutex'), D('add item to buffer', true), S('mutex'), S('full')] },
      { name: 'Consumer', ops: [W('full'), W('mutex'), D('remove item from buffer', true), S('mutex'), S('empty'), D('consume the item')] },
    ],
  },
  {
    id: 'deadlock',
    name: 'Two semaphores, wrong order',
    about: 'P0 takes S then Q; P1 takes Q then S. Run one statement of each in turn and they deadlock: each holds what the other needs.',
    sems: { S: 1, Q: 1 },
    programs: [
      { name: 'P0', ops: [W('S'), W('Q'), D('use both', true), S('S'), S('Q')] },
      { name: 'P1', ops: [W('Q'), W('S'), D('use both', true), S('Q'), S('S')] },
    ],
  },
  {
    id: 'philosophers',
    name: 'Dining philosophers',
    about: 'Each philosopher picks up the left chopstick, then the right. Let every one of them pick up the left chopstick before any picks up the right, and nobody can ever eat.',
    sems: { chopstick0: 1, chopstick1: 1, chopstick2: 1, chopstick3: 1 },
    programs: [0, 1, 2, 3].map((i) => philosopher(i, i, (i + 1) % 4)),
  },
  {
    id: 'philosophers-fixed',
    name: 'Philosophers, asymmetric',
    about: 'The same table, but the last philosopher picks up the right chopstick first. That breaks the circle, and the deadlock can no longer be reached.',
    sems: { chopstick0: 1, chopstick1: 1, chopstick2: 1, chopstick3: 1 },
    programs: [philosopher(0, 0, 1), philosopher(1, 1, 2), philosopher(2, 2, 3), philosopher(3, 0, 3)],
  },
];

/** Exhaustive search: can this system reach a state in which every process is blocked? */
export function canDeadlock(start: SemSystem, limit = 200000): boolean {
  const sig = (s: SemSystem) => s.procs.map((p) => `${p.pc}${p.blockedOn ?? ''}`).join(',') + '|' + Object.values(s.sems).join(',') + '|' + Object.values(s.queues).map((q) => q.join('')).join(',');
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length && seen.size < limit) {
    const s = stack.pop() as SemSystem;
    const k = sig(s);
    if (seen.has(k)) continue;
    seen.add(k);
    if (semDeadlocked(s)) return true;
    for (const p of s.procs) if (!p.blockedOn) stack.push(semStep(s, p.name));
  }
  return false;
}
