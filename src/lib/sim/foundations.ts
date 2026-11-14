// Pure logic behind the Unit 1 visualizations: complexity, early systems, and a simple computer.

// ---------- Coping with complexity ----------

/** Debugging effort for N statements split into K equal modules: K modules of (N/K)^2 each. */
export const debugEffort = (n: number, k: number) => (k * (n / k) * (n / k));

/** Interconnections when every one of n components may interact with every other. */
export const meshLinks = (n: number) => (n * (n - 1)) / 2;

/**
 * Interconnections when components are assembled into a hierarchy: groups of at most `g`
 * interact freely inside the group, and each group is then treated as one component at the next level.
 */
export function hierarchyLinks(n: number, g: number): { links: number; levels: number[] } {
  const levels: number[] = [];
  let links = 0;
  let count = n;
  while (count > 1) {
    levels.push(count);
    const groups = Math.ceil(count / g);
    for (let i = 0; i < groups; i++) links += meshLinks(Math.min(g, count - i * g));
    count = groups;
  }
  levels.push(1);
  return { links, levels };
}

// ---------- Spooling ----------

export interface Segment {
  job: number;
  start: number;
  end: number;
}

export interface BatchJob {
  /** Time to read the job's cards, to compute, and to print its output. */
  read: number;
  compute: number;
  print: number;
}

export interface SpoolResult {
  reader: Segment[];
  cpu: Segment[];
  printer: Segment[];
  total: number;
  cpuBusy: number;
  /** Fraction of the total time during which the CPU was computing. */
  utilisation: number;
}

/**
 * Without spooling the CPU deals with the card reader and printer directly, so each job is
 * read, computed and printed strictly one after another. With spooling the disk is a buffer:
 * the reader runs ahead, the CPU computes a job as soon as its input is on disk, and the printer
 * drains finished output while the CPU works on the next job.
 */
export function spool(jobs: BatchJob[], spooling: boolean): SpoolResult {
  const reader: Segment[] = [];
  const cpu: Segment[] = [];
  const printer: Segment[] = [];
  let r = 0;
  let c = 0;
  let p = 0;
  jobs.forEach((j, job) => {
    if (spooling) {
      reader.push({ job, start: r, end: r + j.read });
      r += j.read;
      const cs = Math.max(c, r);
      cpu.push({ job, start: cs, end: cs + j.compute });
      c = cs + j.compute;
      const ps = Math.max(p, c);
      printer.push({ job, start: ps, end: ps + j.print });
      p = ps + j.print;
    } else {
      const t = Math.max(r, c, p);
      reader.push({ job, start: t, end: t + j.read });
      cpu.push({ job, start: t + j.read, end: t + j.read + j.compute });
      printer.push({ job, start: t + j.read + j.compute, end: t + j.read + j.compute + j.print });
      r = c = p = t + j.read + j.compute + j.print;
    }
  });
  const total = Math.max(r, c, p);
  const cpuBusy = jobs.reduce((s, j) => s + j.compute, 0);
  return { reader, cpu, printer, total, cpuBusy, utilisation: total ? cpuBusy / total : 0 };
}

// ---------- Multiprogramming ----------

export interface JobSegment extends Segment {
  kind: 'cpu' | 'io' | 'ready';
}

export interface MultiResult {
  /** One row of segments per job. */
  rows: JobSegment[][];
  total: number;
  cpuBusy: number;
  utilisation: number;
  /** Completion time of each job. */
  finish: number[];
}

/**
 * Each job is a list of bursts that alternate CPU, I/O, CPU, ... (starting with CPU).
 * With `multi` false, jobs run strictly one after another and the CPU idles during I/O.
 * With `multi` true, all jobs are in memory; when the running job starts I/O the CPU is given
 * to the next ready job (first come, first served). Each job does I/O on its own device.
 */
export function runJobs(jobs: number[][], multi: boolean): MultiResult {
  const rows: JobSegment[][] = jobs.map(() => []);
  const finish = jobs.map(() => 0);
  const cpuBusy = jobs.reduce((s, b) => s + b.reduce((x, v, i) => x + (i % 2 === 0 ? v : 0), 0), 0);
  const push = (job: number, kind: JobSegment['kind'], start: number, end: number) => {
    const row = rows[job];
    const last = row[row.length - 1];
    if (last && last.kind === kind && last.end === start) last.end = end;
    else if (end > start) row.push({ job, kind, start, end });
  };

  if (!multi) {
    let t = 0;
    jobs.forEach((bursts, job) => {
      bursts.forEach((len, i) => {
        push(job, i % 2 === 0 ? 'cpu' : 'io', t, t + len);
        t += len;
      });
      finish[job] = t;
    });
    return { rows, total: t, cpuBusy, utilisation: t ? cpuBusy / t : 0, finish };
  }

  const at = jobs.map(() => 0); // index of the current burst
  const left = jobs.map((b) => b[0] ?? 0);
  const status: ('ready' | 'cpu' | 'io' | 'done')[] = jobs.map((b) => (b.length ? 'ready' : 'done'));
  const queue = jobs.map((_, i) => i).filter((i) => status[i] === 'ready');
  let running = -1;
  let t = 0;
  while (status.some((s) => s !== 'done') && t < 100000) {
    if (running < 0 && queue.length) {
      running = queue.shift()!;
      status[running] = 'cpu';
    }
    const woken: number[] = [];
    jobs.forEach((bursts, j) => {
      if (status[j] === 'done') return;
      push(j, status[j] as JobSegment['kind'], t, t + 1);
      if (status[j] === 'ready') return;
      left[j] -= 1;
      if (left[j] > 0) return;
      const wasCpu = status[j] === 'cpu';
      if (wasCpu) running = -1;
      at[j] += 1;
      if (at[j] >= bursts.length) {
        status[j] = 'done';
        finish[j] = t + 1;
      } else {
        left[j] = bursts[at[j]];
        if (wasCpu) status[j] = 'io';
        else woken.push(j);
      }
    });
    for (const j of woken) {
      status[j] = 'ready';
      queue.push(j);
    }
    t += 1;
  }
  return { rows, total: t, cpuBusy, utilisation: t ? cpuBusy / t : 0, finish };
}

// ---------- A simple computer: fetch, execute, interrupt ----------

export const OPS: Record<number, string> = { 0: 'HLT', 1: 'LOAD', 2: 'STORE', 3: 'IN', 5: 'ADD', 7: 'IRET' };

export type Phase = 'fetch' | 'execute' | 'interrupt';

export interface Machine {
  pc: number;
  ir: number;
  ac: number;
  mem: Record<number, number>;
  phase: Phase;
  halted: boolean;
  /** A device has raised the interrupt request line. */
  pending: boolean;
  /** The interrupt-enable bit of the PSW. */
  enabled: boolean;
  /** Supervisor (monitor) mode bit of the PSW. */
  supervisor: boolean;
  /** PC and PSW saved by the interrupt cycle. */
  saved: { pc: number; enabled: boolean; supervisor: boolean } | null;
  /** The value waiting in the device controller's local buffer. */
  device: number;
  /** What the last step did, in words. */
  note: string;
}

export const HANDLER = 0x500;
const hex = (n: number) => n.toString(16).toUpperCase();
export const decode = (word: number) => ({ op: word >> 12, addr: word & 0xfff });
export const show = (word: number) => {
  const { op, addr } = decode(word);
  const name = OPS[op];
  if (!name) return hex(word);
  return op === 0 || op === 7 ? name : `${name} ${hex(addr)}`;
};

/** LOAD 940; ADD 941; STORE 941; HLT, with an interrupt handler at 500 that reads the device. */
export function newMachine(): Machine {
  return {
    pc: 0x300,
    ir: 0,
    ac: 0,
    mem: {
      0x300: 0x1940,
      0x301: 0x5941,
      0x302: 0x2941,
      0x303: 0x0000,
      0x500: 0x3942,
      0x501: 0x7000,
      0x940: 3,
      0x941: 2,
      0x942: 0,
    },
    phase: 'fetch',
    halted: false,
    pending: false,
    enabled: true,
    supervisor: false,
    saved: null,
    device: 7,
    note: 'The program counter holds the address of the first instruction.',
  };
}

/** Performs one phase of the instruction cycle and returns the new state. */
export function step(m: Machine): Machine {
  if (m.halted) return m;
  const s: Machine = { ...m, mem: { ...m.mem } };
  if (s.phase === 'fetch') {
    s.ir = s.mem[s.pc] ?? 0;
    s.note = `Fetch: the instruction at address ${hex(s.pc)} is copied into the IR, and the PC is incremented to ${hex(s.pc + 1)}.`;
    s.pc += 1;
    s.phase = 'execute';
    return s;
  }
  if (s.phase === 'execute') {
    const { op, addr } = decode(s.ir);
    switch (op) {
      case 1:
        s.ac = s.mem[addr] ?? 0;
        s.note = `Execute LOAD: the contents of location ${hex(addr)} (${s.ac}) are loaded into the accumulator.`;
        break;
      case 5: {
        const v = s.mem[addr] ?? 0;
        s.note = `Execute ADD: the contents of location ${hex(addr)} (${v}) are added to the accumulator, giving ${s.ac + v}.`;
        s.ac += v;
        break;
      }
      case 2:
        s.mem[addr] = s.ac;
        s.note = `Execute STORE: the accumulator (${s.ac}) is stored in location ${hex(addr)}.`;
        break;
      case 3:
        s.mem[addr] = s.device;
        s.note = `Execute IN (privileged): the handler moves the value ${s.device} from the device controller's buffer into location ${hex(addr)}.`;
        break;
      case 7:
        if (s.saved) {
          s.pc = s.saved.pc;
          s.enabled = s.saved.enabled;
          s.supervisor = s.saved.supervisor;
          s.saved = null;
        }
        s.note = `Execute IRET: the saved PC (${hex(s.pc)}) and PSW are restored. The interrupted program continues as if nothing had happened.`;
        break;
      default:
        s.halted = true;
        s.note = 'Execute HLT: the processor halts.';
        return s;
    }
    if (s.pending && s.enabled) {
      s.phase = 'interrupt';
      s.note += ' The interrupt request line is raised, so an interrupt cycle follows.';
    } else {
      s.phase = 'fetch';
      if (s.pending) s.note += ' An interrupt is pending but interrupts are disabled, so it must wait.';
    }
    return s;
  }
  // Interrupt cycle
  s.saved = { pc: s.pc, enabled: s.enabled, supervisor: s.supervisor };
  s.note = `Interrupt cycle: the PC (${hex(s.pc)}) and PSW are saved, interrupts are disabled, the mode switches to supervisor, and the PC is loaded with the handler's address (${hex(HANDLER)}) from the interrupt vector.`;
  s.pc = HANDLER;
  s.enabled = false;
  s.supervisor = true;
  s.pending = false;
  s.phase = 'fetch';
  return s;
}

export const raise = (m: Machine): Machine => (m.halted ? m : { ...m, pending: true });

/** Runs until the machine halts (bounded). */
export function run(m: Machine, limit = 200): Machine {
  let s = m;
  for (let i = 0; i < limit && !s.halted; i++) s = step(s);
  return s;
}

// ---------- Hardware protection ----------

/** Base and limit registers: an address is legal if base <= address < base + limit. */
export const legalAddress = (address: number, base: number, limit: number) => address >= base && address < base + limit;

/** Interrupts needed to transfer `bytes` bytes: one per byte, or one per block with DMA. */
export const interruptsNeeded = (bytes: number, blockSize: number, dma: boolean) => (dma ? Math.ceil(bytes / blockSize) : bytes);
