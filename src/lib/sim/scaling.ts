// Speedup laws, availability and live-migration arithmetic for the cloud and VM lessons.

/** Amdahl's law: speedup of a fixed workload on n processors when a fraction alpha is sequential. */
export const amdahl = (alpha: number, n: number) => 1 / (alpha + (1 - alpha) / n);

/** The ceiling Amdahl's law approaches as n grows without bound. */
export const amdahlLimit = (alpha: number) => (alpha === 0 ? Infinity : 1 / alpha);

/** Gustafson's law: scaled-workload speedup, where the parallel part grows with n. */
export const gustafson = (alpha: number, n: number) => alpha + (1 - alpha) * n;

/** System efficiency: speedup per processor. */
export const efficiency = (speedup: number, n: number) => speedup / n;

/** Availability = MTTF / (MTTF + MTTR). */
export const availability = (mttf: number, mttr: number) => mttf / (mttf + mttr);

export const downtimeHoursPerYear = (avail: number) => (1 - avail) * 365 * 24;

// ---------- Live migration by iterative pre-copy ----------

export interface MigrationRound {
  /** Pages sent in this round. */
  sent: number;
  seconds: number;
  /** Pages the still-running guest dirtied while this round was being sent. */
  dirtied: number;
}

export interface Migration {
  rounds: MigrationRound[];
  /** Pages left to send while the guest is frozen. */
  finalPages: number;
  downtimeSeconds: number;
  totalSeconds: number;
  converged: boolean;
}

/**
 * Iterative pre-copy. Round 1 sends every page; each later round resends what the guest
 * dirtied meanwhile. When what is left is small enough, the guest is frozen and the rest sent.
 */
export function preCopy(pages: number, sendRate: number, dirtyRate: number, threshold: number, maxRounds = 30): Migration {
  const rounds: MigrationRound[] = [];
  let toSend = pages;
  let converged = false;
  while (rounds.length < maxRounds) {
    const seconds = toSend / sendRate;
    const dirtied = Math.min(pages, dirtyRate * seconds);
    rounds.push({ sent: toSend, seconds, dirtied });
    toSend = dirtied;
    if (toSend <= threshold) {
      converged = true;
      break;
    }
  }
  const downtimeSeconds = toSend / sendRate;
  return {
    rounds,
    finalPages: toSend,
    downtimeSeconds,
    totalSeconds: rounds.reduce((a, r) => a + r.seconds, 0) + downtimeSeconds,
    converged,
  };
}
