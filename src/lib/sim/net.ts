// Pure logic behind the link-layer visualizations.

import { rng } from './hdfs';

// ---------- Framing and error detection ----------

export const FLAG = '01111110';

/** Bit stuffing: after five consecutive 1s in the data, insert a 0. */
export function bitStuff(bits: string): { stuffed: string; inserted: number[] } {
  let out = '';
  let run = 0;
  const inserted: number[] = [];
  for (const b of bits) {
    out += b;
    run = b === '1' ? run + 1 : 0;
    if (run === 5) {
      inserted.push(out.length);
      out += '0';
      run = 0;
    }
  }
  return { stuffed: out, inserted };
}

export function bitUnstuff(bits: string): string {
  let out = '';
  let run = 0;
  for (let i = 0; i < bits.length; i++) {
    out += bits[i];
    run = bits[i] === '1' ? run + 1 : 0;
    if (run === 5) {
      i += 1; // skip the stuffed 0
      run = 0;
    }
  }
  return out;
}

/** CRC: remainder of (data followed by r zeros) divided by the generator, in modulo-2 arithmetic. */
export function crcRemainder(data: string, generator: string): string {
  const r = generator.length - 1;
  const bits = (data + '0'.repeat(r)).split('').map(Number);
  const g = generator.split('').map(Number);
  for (let i = 0; i < data.length; i++) {
    if (bits[i] === 1) for (let j = 0; j < g.length; j++) bits[i + j] ^= g[j];
  }
  return bits.slice(-r).join('');
}

export const hammingDistance = (a: string, b: string) => a.split('').filter((ch, i) => ch !== b[i]).length;

// ---------- Sliding window: Go-Back-N against Selective Repeat ----------

export type Arq = 'gbn' | 'sr';
export type Outcome = 'delivered' | 'lost' | 'discarded' | 'buffered';
export interface Transmission {
  frame: number;
  round: number;
  outcome: Outcome;
  retransmission: boolean;
}

/**
 * Sends `frames` frames with a window of `window`. Each frame listed in `lost` is lost the
 * first time it is sent. Go-Back-N receivers discard everything after a gap; Selective
 * Repeat receivers buffer it, so only the lost frame is sent again.
 */
export function slidingWindow(protocol: Arq, frames: number, window: number, lost: number[]) {
  const toLose = new Set(lost);
  const received = new Set<number>();
  const sentBefore = new Set<number>();
  const log: Transmission[] = [];
  let base = 0;
  let round = 0;

  while (base < frames && round < 200) {
    round += 1;
    let gap = false;
    for (let f = base; f < Math.min(base + window, frames); f++) {
      if (received.has(f)) continue; // Selective Repeat: already buffered at the receiver
      const retransmission = sentBefore.has(f);
      sentBefore.add(f);
      let outcome: Outcome;
      if (toLose.has(f)) {
        toLose.delete(f);
        outcome = 'lost';
        gap = true;
      } else if (gap) {
        outcome = protocol === 'gbn' ? 'discarded' : 'buffered';
        if (protocol === 'sr') received.add(f);
      } else {
        outcome = 'delivered';
        received.add(f);
      }
      log.push({ frame: f, round, outcome, retransmission });
    }
    while (received.has(base)) base += 1;
  }
  return { log, transmissions: log.length, rounds: round, wasted: log.length - frames };
}

// ---------- CSMA ----------

export type Persistence = '1' | 'non' | 'p';
export interface CsmaResult {
  /** Fraction of slots carrying a frame that got through. */
  throughput: number;
  collisions: number;
  delivered: number;
  /** Average slots a delivered frame waited between arriving and starting its successful transmission. */
  meanDelay: number;
}

/**
 * A slotted model of carrier sensing. Each station gets a new frame with probability `load / stations`
 * per slot (if it has none). A frame occupies `frameSlots` slots. Stations that start in the same slot collide.
 */
export function csma(persistence: Persistence, stations: number, load: number, slots = 20000, frameSlots = 8, p = 0.1, seed = 1): CsmaResult {
  const rand = rng(seed);
  const arrival = load / stations / frameSlots;
  const has = Array(stations).fill(false);
  const since = Array(stations).fill(0);
  const backoff = Array(stations).fill(0);
  const tries = Array(stations).fill(0); // collisions suffered by the current frame
  let busyUntil = 0;
  let good = 0;
  let collisions = 0;
  let delivered = 0;
  let delay = 0;

  for (let t = 0; t < slots; t++) {
    for (let s = 0; s < stations; s++) {
      if (!has[s] && rand() < arrival) {
        has[s] = true;
        since[s] = t;
        backoff[s] = 0;
        tries[s] = 0;
      }
    }
    const idle = t >= busyUntil;
    const senders: number[] = [];
    for (let s = 0; s < stations; s++) {
      if (!has[s]) continue;
      if (backoff[s] > 0) {
        backoff[s] -= 1;
        continue;
      }
      if (idle) {
        if (persistence !== 'p' || rand() < p) senders.push(s);
      } else if (persistence === 'non') {
        backoff[s] = 1 + Math.floor(rand() * frameSlots * 4); // go away and sense again later
      }
      // 1-persistent and p-persistent keep listening and act the moment the channel is idle
    }
    if (senders.length === 1) {
      const s = senders[0];
      has[s] = false;
      good += frameSlots;
      delivered += 1;
      delay += t - since[s];
      busyUntil = t + frameSlots;
    } else if (senders.length > 1) {
      collisions += 1;
      busyUntil = t + frameSlots; // the garbled frames still occupy the channel
      // Binary exponential backoff: the range doubles with each collision of the same frame.
      for (const s of senders) {
        tries[s] = Math.min(tries[s] + 1, 8);
        backoff[s] = 1 + Math.floor(rand() * frameSlots * 2 ** tries[s]);
      }
    }
  }
  return { throughput: good / slots, collisions, delivered, meanDelay: delivered ? delay / delivered : 0 };
}

// ---------- Learning bridge ----------

export interface BridgeStep {
  table: Record<string, number>;
  action: 'flood' | 'forward' | 'filter';
  outPorts: number[];
  learned: boolean;
}

/** Backward learning: remember which port the source is on; forward to a known port or flood. */
export function bridgeFrame(table: Record<string, number>, src: string, dst: string, inPort: number, ports: number): BridgeStep {
  const learned = table[src] !== inPort;
  const next = { ...table, [src]: inPort };
  const known = next[dst];
  if (known === undefined) return { table: next, action: 'flood', outPorts: Array.from({ length: ports }, (_, i) => i).filter((p) => p !== inPort), learned };
  if (known === inPort) return { table: next, action: 'filter', outPorts: [], learned };
  return { table: next, action: 'forward', outPorts: [known], learned };
}

/** Smallest sliding window that keeps a link busy: w = 2BD + 1, with BD in frames. */
export function windowFor(bitsPerSecond: number, oneWayDelaySeconds: number, frameBits: number): number {
  const bd = (bitsPerSecond * oneWayDelaySeconds) / frameBits;
  return 2 * bd + 1;
}
