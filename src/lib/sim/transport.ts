// Pure logic behind the transport-layer visualizations.

// ---------- Max-min fairness on one bottleneck ----------

/**
 * Max-min fair shares of a link of the given capacity. Flows that want less than an equal
 * share get what they ask for; what they leave is divided equally among the rest.
 */
export function maxMin(capacity: number, demands: number[]): number[] {
  const alloc = demands.map(() => 0);
  let left = capacity;
  let open = demands.map((_, i) => i);
  while (open.length && left > 1e-9) {
    const share = left / open.length;
    const satisfied = open.filter((i) => demands[i] - alloc[i] <= share + 1e-9);
    if (satisfied.length === 0) {
      for (const i of open) alloc[i] += share;
      left = 0;
      break;
    }
    for (const i of satisfied) {
      left -= demands[i] - alloc[i];
      alloc[i] = demands[i];
    }
    open = open.filter((i) => !satisfied.includes(i));
  }
  return alloc;
}

// ---------- Two flows adjusting their rates ----------

export type Law = 'aimd' | 'aiad' | 'mimd';

/**
 * Two flows share a link. Each step both see the same signal: under capacity, increase;
 * over capacity, decrease. Returns the successive (x, y) rates.
 */
export function rateTrajectory(law: Law, x0: number, y0: number, capacity: number, steps: number): [number, number][] {
  const points: [number, number][] = [[x0, y0]];
  let x = x0;
  let y = y0;
  for (let i = 0; i < steps; i++) {
    const congested = x + y > capacity;
    if (congested) {
      if (law === 'aiad') {
        x = Math.max(0, x - 2);
        y = Math.max(0, y - 2);
      } else {
        x *= 0.5;
        y *= 0.5;
      }
    } else if (law === 'mimd') {
      x *= 1.15;
      y *= 1.15;
    } else {
      x += 1;
      y += 1;
    }
    points.push([x, y]);
  }
  return points;
}

/** 1 means a perfectly equal split; 0 means one flow has everything. */
export const fairness = ([x, y]: [number, number]) => (Math.max(x, y) === 0 ? 1 : Math.min(x, y) / Math.max(x, y));

// ---------- TCP congestion window ----------

export type Variant = 'tahoe' | 'reno';
export type LossKind = 'timeout' | 'dupack';
export interface CwndPoint {
  rtt: number;
  cwnd: number;
  ssthresh: number;
  phase: 'slow start' | 'congestion avoidance';
  /** Set on the round in which a loss was detected. */
  loss?: LossKind;
}

/**
 * Congestion window in segments, one point per round-trip time. `losses` maps a round number to
 * the way the loss in that round is detected. Tahoe always restarts from one segment; Reno uses
 * fast recovery after three duplicate ACKs and only restarts after a timeout.
 */
export function cwndTrace(variant: Variant, rounds: number, losses: Record<number, LossKind>, initialSsthresh = 32): CwndPoint[] {
  let cwnd = 1;
  let ssthresh = initialSsthresh;
  const out: CwndPoint[] = [];
  for (let rtt = 0; rtt < rounds; rtt++) {
    const loss = losses[rtt];
    out.push({ rtt, cwnd, ssthresh, phase: cwnd < ssthresh ? 'slow start' : 'congestion avoidance', ...(loss ? { loss } : {}) });
    if (loss) {
      ssthresh = Math.max(2, Math.floor(cwnd / 2));
      cwnd = variant === 'reno' && loss === 'dupack' ? ssthresh : 1;
    } else if (cwnd < ssthresh) {
      cwnd = Math.min(cwnd * 2, ssthresh);
    } else {
      cwnd += 1;
    }
  }
  return out;
}

// ---------- Retransmission timer ----------

export interface RtoPoint {
  sample: number;
  srtt: number;
  rttvar: number;
  rto: number;
}

/** Jacobson's estimator: smoothed RTT, smoothed deviation, and RTO = SRTT + 4 x RTTVAR. */
export function rtoTrace(samples: number[], alpha = 7 / 8, beta = 3 / 4): RtoPoint[] {
  let srtt = 0;
  let rttvar = 0;
  return samples.map((sample, i) => {
    if (i === 0) {
      srtt = sample;
      rttvar = sample / 2;
    } else {
      rttvar = beta * rttvar + (1 - beta) * Math.abs(srtt - sample);
      srtt = alpha * srtt + (1 - alpha) * sample;
    }
    return { sample, srtt, rttvar, rto: srtt + 4 * rttvar };
  });
}

/** Size of the jitter (playout) buffer delay needed so that no packet arrives after its playout time. */
export function playoutDelay(sendTimes: number[], arrivalTimes: number[]): number {
  return Math.max(...arrivalTimes.map((a, i) => a - sendTimes[i])) - Math.min(...arrivalTimes.map((a, i) => a - sendTimes[i]));
}
