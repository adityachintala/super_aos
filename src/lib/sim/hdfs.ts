// Pure logic behind the HDFS visualizations: splitting a file into blocks, rack-aware
// replica placement, and re-replication after DataNode failures.

export interface Topology {
  racks: number;
  nodesPerRack: number;
}

export const nodeCount = (t: Topology) => t.racks * t.nodesPerRack;
export const rackOf = (node: number, t: Topology) => Math.floor(node / t.nodesPerRack);
export const nodeName = (node: number, t: Topology) => `R${rackOf(node, t) + 1}-N${(node % t.nodesPerRack) + 1}`;

/** Splits a file into blocks. The last block only holds what is left over. */
export function splitFile(fileMB: number, blockMB: number): number[] {
  const out: number[] = [];
  for (let left = fileMB; left > 0; left -= blockMB) out.push(Math.min(blockMB, left));
  return out;
}

/** Small deterministic generator so that placements are repeatable in tests and in the UI. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const pick = <T>(items: T[], rand: () => number) => items[Math.floor(rand() * items.length)];

/**
 * Chooses one more DataNode for a block that already has `have` replicas, following the
 * default policy: never two replicas on one node, never more than two on one rack, and
 * (when it can) never all replicas on a single rack.
 */
export function chooseTarget(have: number[], alive: number[], t: Topology, rand: () => number): number | null {
  const free = alive.filter((n) => !have.includes(n));
  if (free.length === 0) return null;
  const perRack = new Map<number, number>();
  for (const n of have) perRack.set(rackOf(n, t), (perRack.get(rackOf(n, t)) ?? 0) + 1);
  const racksUsed = perRack.size;

  // If every replica so far sits on one rack, the next one must go to another rack.
  if (have.length >= 1 && racksUsed === 1) {
    const other = free.filter((n) => !perRack.has(rackOf(n, t)));
    if (other.length) return pick(other, rand);
  }
  const allowed = free.filter((n) => (perRack.get(rackOf(n, t)) ?? 0) < 2);
  return pick(allowed.length ? allowed : free, rand);
}

/**
 * Default placement for a new block: first replica on the writer's node, the second on a
 * node in a different rack, the third on a different node of that second rack.
 */
export function placeBlock(writer: number, alive: number[], t: Topology, replication: number, rand: () => number): number[] {
  const replicas: number[] = [];
  if (alive.includes(writer)) replicas.push(writer);
  while (replicas.length < replication) {
    let next: number | null = null;
    if (replicas.length === 2 && rackOf(replicas[0], t) !== rackOf(replicas[1], t)) {
      // Third replica: same rack as the second, different node.
      const sameRack = alive.filter((n) => rackOf(n, t) === rackOf(replicas[1], t) && !replicas.includes(n));
      if (sameRack.length) next = pick(sameRack, rand);
    }
    next ??= chooseTarget(replicas, alive, t, rand);
    if (next === null) break;
    replicas.push(next);
  }
  return replicas;
}

export interface BlockState {
  id: number;
  sizeMB: number;
  replicas: number[];
}

/** Replicas that are still on live DataNodes. */
export const liveReplicas = (b: BlockState, alive: number[]) => b.replicas.filter((n) => alive.includes(n));

export type Health = 'ok' | 'under' | 'lost';
export function health(b: BlockState, alive: number[], replication: number): Health {
  const live = liveReplicas(b, alive).length;
  return live === 0 ? 'lost' : live < replication ? 'under' : 'ok';
}

/** What the NameNode does once it notices dead DataNodes: copy under-replicated blocks elsewhere. */
export function reReplicate(blocks: BlockState[], alive: number[], t: Topology, replication: number, rand: () => number): BlockState[] {
  return blocks.map((b) => {
    const replicas = liveReplicas(b, alive);
    if (replicas.length === 0) return { ...b, replicas }; // nothing left to copy from
    while (replicas.length < replication) {
      const next = chooseTarget(replicas, alive, t, rand);
      if (next === null) break;
      replicas.push(next);
    }
    return { ...b, replicas };
  });
}

/** Raw disk space consumed across the cluster. */
export const rawStorageMB = (blocks: BlockState[]) => blocks.reduce((a, b) => a + b.sizeMB * b.replicas.length, 0);
