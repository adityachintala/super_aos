// Pure logic behind the network-layer visualizations.

// ---------- Distance vector routing ----------

export interface DvRow {
  dest: string;
  /** Total delay via each neighbour: cost to the neighbour plus what the neighbour advertises. */
  candidates: { via: string; linkCost: number; advertised: number; total: number }[];
  best: number;
  via: string | null;
}

/**
 * One distance-vector update at a router. `links` gives the measured delay to each neighbour and
 * `vectors` gives the vector each neighbour has just sent (its estimated delay to every destination).
 */
export function dvUpdate(self: string, dests: string[], links: Record<string, number>, vectors: Record<string, number[]>): DvRow[] {
  return dests.map((dest, i) => {
    if (dest === self) return { dest, candidates: [], best: 0, via: null };
    const candidates = Object.keys(links).map((via) => ({ via, linkCost: links[via], advertised: vectors[via][i], total: links[via] + vectors[via][i] }));
    const winner = candidates.reduce((a, b) => (b.total < a.total ? b : a));
    return { dest, candidates, best: winner.total, via: winner.via };
  });
}

/**
 * Count to infinity on a line A - B - C - D - E after A goes down. Returns the distance to A
 * held by B, C, D, E after each synchronous exchange.
 */
export function countToInfinity(exchanges: number, nodes = 4): number[][] {
  let dist = Array.from({ length: nodes }, (_, i) => i + 1);
  const rows = [dist];
  for (let r = 0; r < exchanges; r++) {
    dist = dist.map((_, i) => {
      const left = i === 0 ? Infinity : dist[i - 1]; // the first node's left neighbour is A, which is gone
      const right = i === nodes - 1 ? Infinity : dist[i + 1];
      return 1 + Math.min(left, right);
    });
    rows.push(dist);
  }
  return rows;
}

// ---------- Shortest path (Dijkstra) ----------

export type Graph = Record<string, Record<string, number>>;

export function makeGraph(edges: [string, string, number][]): Graph {
  const g: Graph = {};
  for (const [a, b, w] of edges) {
    (g[a] ??= {})[b] = w;
    (g[b] ??= {})[a] = w;
  }
  return g;
}

export interface DijkstraStep {
  /** The node made permanent in this step. */
  picked: string;
  dist: Record<string, number>;
  prev: Record<string, string | null>;
  permanent: string[];
}

export function dijkstra(g: Graph, source: string): DijkstraStep[] {
  const nodes = Object.keys(g).sort();
  const dist: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, Infinity]));
  const prev: Record<string, string | null> = Object.fromEntries(nodes.map((n) => [n, null]));
  const permanent: string[] = [];
  dist[source] = 0;
  const steps: DijkstraStep[] = [];
  while (permanent.length < nodes.length) {
    const picked = nodes.filter((n) => !permanent.includes(n)).reduce((a, b) => (dist[b] < dist[a] ? b : a));
    if (dist[picked] === Infinity) break;
    permanent.push(picked);
    for (const [nb, w] of Object.entries(g[picked])) {
      if (!permanent.includes(nb) && dist[picked] + w < dist[nb]) {
        dist[nb] = dist[picked] + w;
        prev[nb] = picked;
      }
    }
    steps.push({ picked, dist: { ...dist }, prev: { ...prev }, permanent: [...permanent] });
  }
  return steps;
}

export function pathTo(prev: Record<string, string | null>, target: string): string[] {
  const path = [target];
  while (prev[path[0]]) path.unshift(prev[path[0]] as string);
  return path;
}

// ---------- Traffic shaping ----------

export interface ShapeTick {
  arrived: number;
  sent: number;
  /** Leaky bucket: packets waiting. Token bucket: tokens available after this tick. */
  level: number;
  dropped: number;
}

/** Leaky bucket: whatever arrives, at most `rate` units leave per tick; a full queue drops the excess. */
export function leakyBucket(arrivals: number[], rate: number, capacity: number): ShapeTick[] {
  let queue = 0;
  return arrivals.map((arrived) => {
    const room = capacity - queue;
    const accepted = Math.min(arrived, room);
    queue += accepted;
    const sent = Math.min(queue, rate);
    queue -= sent;
    return { arrived, sent, level: queue, dropped: arrived - accepted };
  });
}

/** Token bucket: tokens arrive at `rate` per tick up to `capacity`; a burst may spend saved tokens. */
export function tokenBucket(arrivals: number[], rate: number, capacity: number): (ShapeTick & { waiting: number })[] {
  let tokens = capacity;
  let waiting = 0;
  return arrivals.map((arrived) => {
    waiting += arrived;
    const sent = Math.min(waiting, tokens);
    waiting -= sent;
    tokens = Math.min(capacity, tokens - sent + rate);
    return { arrived, sent, level: tokens, dropped: 0, waiting };
  });
}

// ---------- Packet scheduling ----------

export interface Served {
  flow: number;
  size: number;
}

/** Packet-by-packet round robin: each backlogged flow sends one whole packet per round. */
export function roundRobin(flows: number[][]): Served[] {
  const out: Served[] = [];
  const queues = flows.map((f) => [...f]);
  while (queues.some((q) => q.length)) queues.forEach((q, flow) => q.length && out.push({ flow, size: q.shift() as number }));
  return out;
}

/**
 * Fair queueing: simulate byte-by-byte round robin by giving each packet a finish number
 * (previous finish in its flow plus its length, divided by the flow's weight) and sending in that order.
 */
export function fairQueue(flows: number[][], weights?: number[]): (Served & { finish: number })[] {
  const tagged: (Served & { finish: number; seq: number })[] = [];
  flows.forEach((packets, flow) => {
    let finish = 0;
    packets.forEach((size, seq) => {
      finish += size / (weights?.[flow] ?? 1);
      tagged.push({ flow, size, finish, seq });
    });
  });
  return tagged.sort((a, b) => a.finish - b.finish || a.flow - b.flow).map(({ flow, size, finish }) => ({ flow, size, finish }));
}

/** Bytes each flow has been sent within the first `budget` bytes of output (a packet cut off by the budget counts in part). */
export function shares(order: Served[], flowCount: number, budget: number): number[] {
  const got = Array(flowCount).fill(0);
  let used = 0;
  for (const p of order) {
    const take = Math.min(p.size, budget - used);
    if (take <= 0) break;
    used += take;
    got[p.flow] += take;
  }
  return got;
}

// ---------- IPv4 prefixes ----------

const toInt = (ip: string) => ip.split('.').reduce((a, o) => a * 256 + Number(o), 0);
const toIp = (n: number) => [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join('.');

export function validIp(ip: string): boolean {
  const parts = ip.split('.');
  return parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}

export function prefixInfo(ip: string, length: number) {
  const size = 2 ** (32 - length);
  const network = Math.floor(toInt(ip) / size) * size;
  return {
    network: toIp(network),
    broadcast: toIp(network + size - 1),
    mask: toIp(2 ** 32 - size),
    addresses: size,
    /** Usable host addresses (the network and broadcast addresses are reserved). */
    hosts: length >= 31 ? size : size - 2,
    first: toIp(network + (length >= 31 ? 0 : 1)),
    last: toIp(network + size - (length >= 31 ? 1 : 2)),
    bits: toInt(ip).toString(2).padStart(32, '0'),
  };
}

export const inPrefix = (ip: string, network: string, length: number) => prefixInfo(ip, length).network === prefixInfo(network, length).network;
