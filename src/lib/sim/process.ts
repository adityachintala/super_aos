// Pure logic behind the process and IPC visualizations.

// ---------- Process states ----------

export type PState = 'new' | 'ready' | 'running' | 'waiting' | 'terminated';
export type PEvent = 'admit' | 'dispatch' | 'interrupt' | 'io-wait' | 'io-done' | 'exit';

export const TRANSITIONS: Record<PEvent, { from: PState; to: PState; label: string; why: string }> = {
  admit: { from: 'new', to: 'ready', label: 'Admitted', why: 'The long-term scheduler admits the new process: the OS is prepared to take on another one.' },
  dispatch: { from: 'ready', to: 'running', label: 'Scheduler dispatch', why: 'The short-term scheduler selects this process and the dispatcher gives it the CPU.' },
  interrupt: { from: 'running', to: 'ready', label: 'Interrupt', why: 'A timer interrupt (or a higher-priority arrival) takes the CPU away. The process is still able to run, so it goes back to the ready queue.' },
  'io-wait': { from: 'running', to: 'waiting', label: 'I/O or event wait', why: 'The process requests something it must wait for, such as I/O. It cannot use the CPU until that event occurs.' },
  'io-done': { from: 'waiting', to: 'ready', label: 'I/O or event completion', why: 'The event the process was waiting for has occurred. It does not run at once: it joins the ready queue.' },
  exit: { from: 'running', to: 'terminated', label: 'Exit', why: 'The process has finished executing, or was aborted. Its resources are deallocated.' },
};

export interface Proc {
  id: string;
  state: PState;
}

/** Events that are legal for a process right now. Only one process may be running. */
export function legalEvents(p: Proc, all: Proc[]): PEvent[] {
  const cpuBusy = all.some((q) => q.state === 'running');
  return (Object.keys(TRANSITIONS) as PEvent[]).filter((e) => TRANSITIONS[e].from === p.state && !(e === 'dispatch' && cpuBusy));
}

export function applyEvent(all: Proc[], id: string, e: PEvent): Proc[] {
  return all.map((p) => (p.id === id && TRANSITIONS[e].from === p.state ? { ...p, state: TRANSITIONS[e].to } : p));
}

// ---------- fork() ----------

export interface ForkNode {
  id: number;
  /** The fork() call (1-based) at which this process was created; 0 for the original. */
  bornAt: number;
  children: ForkNode[];
}

/** The process tree produced by n consecutive fork() calls executed by every process. */
export function forkTree(n: number): ForkNode {
  let next = 0;
  const build = (bornAt: number): ForkNode => {
    const node: ForkNode = { id: next++, bornAt, children: [] };
    // This process executes every fork() after the one that created it.
    for (let call = bornAt + 1; call <= n; call++) node.children.push(build(call));
    return node;
  };
  return build(0);
}

export const countNodes = (t: ForkNode): number => 1 + t.children.reduce((a, c) => a + countNodes(c), 0);
export const forkProcesses = (n: number) => 2 ** n;

// ---------- Bounded buffer (shared memory) ----------

export interface Ring {
  size: number;
  slots: (number | null)[];
  in: number;
  out: number;
}

export const emptyRing = (size: number): Ring => ({ size, slots: Array(size).fill(null), in: 0, out: 0 });
export const isEmpty = (r: Ring) => r.in === r.out;
/** With only in and out pointers, one slot is always left unused: full means (in + 1) % size == out. */
export const isFull = (r: Ring) => (r.in + 1) % r.size === r.out;
export const count = (r: Ring) => (r.in - r.out + r.size) % r.size;

export function produce(r: Ring, item: number): Ring | null {
  if (isFull(r)) return null;
  const slots = r.slots.slice();
  slots[r.in] = item;
  return { ...r, slots, in: (r.in + 1) % r.size };
}

export function consume(r: Ring): { ring: Ring; item: number } | null {
  if (isEmpty(r)) return null;
  const slots = r.slots.slice();
  const item = slots[r.out] as number;
  slots[r.out] = null;
  return { ring: { ...r, slots, out: (r.out + 1) % r.size }, item };
}

// ---------- Message passing ----------

export type Capacity = 'zero' | 'bounded' | 'unbounded';

/** Does a send() block, given the link's buffering and how many messages are already queued? */
export function sendBlocks(capacity: Capacity, queued: number, bound: number, receiverWaiting: boolean): boolean {
  if (capacity === 'zero') return !receiverWaiting; // rendezvous
  if (capacity === 'bounded') return queued >= bound;
  return false;
}
