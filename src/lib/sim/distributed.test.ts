import { describe, expect, test } from 'bun:test';
import { chooseTarget, health, placeBlock, rackOf, rawStorageMB, reReplicate, rng, splitFile, type BlockState } from './hdfs';
import { onWorkerFailure, partitionOf, run, splitInput, type Task } from './mapreduce';

const T = { racks: 3, nodesPerRack: 3 };
const all = Array.from({ length: 9 }, (_, i) => i);

describe('HDFS blocks and placement', () => {
  test('a 1 GB file in 128 MB blocks is 8 blocks; 500 MB is 4 with a short last block', () => {
    expect(splitFile(1024, 128).length).toBe(8);
    expect(splitFile(500, 128)).toEqual([128, 128, 128, 116]);
    expect(splitFile(10, 128)).toEqual([10]);
  });
  test('default policy: writer node, then two nodes on one other rack', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = placeBlock(4, all, T, 3, rng(seed));
      expect(r.length).toBe(3);
      expect(new Set(r).size).toBe(3);
      expect(r[0]).toBe(4);
      expect(rackOf(r[1], T)).not.toBe(rackOf(r[0], T));
      expect(rackOf(r[2], T)).toBe(rackOf(r[1], T));
    }
  });
  test('never more than two replicas on a rack, never all on one rack', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const rand = rng(seed);
      const have = [0, 1]; // both on rack 0
      const next = chooseTarget(have, all, T, rand)!;
      expect(rackOf(next, T)).not.toBe(0);
    }
  });
  test('losing a node leaves blocks under-replicated until the NameNode copies them', () => {
    const rand = rng(7);
    const blocks: BlockState[] = splitFile(400, 128).map((sizeMB, id) => ({ id, sizeMB, replicas: placeBlock(0, all, T, 3, rand) }));
    expect(rawStorageMB(blocks)).toBe(1200);
    const alive = all.filter((n) => n !== 0);
    expect(blocks.every((b) => health(b, alive, 3) === 'under')).toBe(true);
    const fixed = reReplicate(blocks, alive, T, 3, rand);
    expect(fixed.every((b) => health(b, alive, 3) === 'ok')).toBe(true);
    expect(fixed.every((b) => !b.replicas.includes(0) && new Set(b.replicas.map((n) => rackOf(n, T))).size >= 2)).toBe(true);
  });
  test('a whole rack can fail without losing a block', () => {
    const rand = rng(3);
    const blocks: BlockState[] = [0, 1, 2, 3, 4].map((id) => ({ id, sizeMB: 128, replicas: placeBlock(id, all, T, 3, rand) }));
    for (let rack = 0; rack < 3; rack++) {
      const alive = all.filter((n) => rackOf(n, T) !== rack);
      expect(blocks.some((b) => health(b, alive, 3) === 'lost')).toBe(false);
    }
  });
  test('a block is lost only when every replica is gone', () => {
    const b: BlockState = { id: 0, sizeMB: 128, replicas: [0, 3, 4] };
    expect(health(b, [1, 2, 5, 6, 7, 8], 3)).toBe('lost');
    expect(reReplicate([b], [1, 2, 5], T, 3, rng(1))[0].replicas).toEqual([]);
  });
});

describe('MapReduce', () => {
  const lines = ['see bob throw', 'see spot run'];
  const flat = (r: ReturnType<typeof run>) => Object.fromEntries(r.output.flat());

  test('word count', () => {
    const r = run('wordcount', lines, 2, 2);
    expect(flat(r)).toEqual({ bob: '1', run: '1', see: '2', spot: '1', throw: '1' });
    expect(r.pairsShuffled).toBe(6);
  });
  test('the answer does not depend on how many mappers and reducers there are', () => {
    const text = ['the quick brown fox', 'jumps over the lazy dog', 'the dog barks', 'a fox runs'];
    const want = flat(run('wordcount', text, 1, 1));
    for (const m of [1, 2, 3, 4]) for (const r of [1, 2, 3]) for (const combiner of [false, true]) expect(flat(run('wordcount', text, m, r, { combiner }))).toEqual(want);
  });
  test('a combiner shrinks what is shuffled without changing the result', () => {
    const text = ['a b a', 'b b c'];
    const plain = run('wordcount', text, 2, 1);
    const combined = run('wordcount', text, 2, 1, { combiner: true });
    expect(plain.pairsShuffled).toBe(6);
    expect(combined.pairsShuffled).toBe(4);
    expect(flat(combined)).toEqual({ a: '2', b: '3', c: '1' });
  });
  test('each key goes to exactly one reducer, and each reducer sees its keys sorted', () => {
    const r = run('wordcount', ['d c b a', 'a b c d', 'e f g'], 3, 3);
    const seen = new Set<string>();
    r.grouped.forEach((groups, i) => {
      const keys = groups.map((g) => g.key);
      expect(keys).toEqual([...keys].sort());
      for (const k of keys) {
        expect(seen.has(k)).toBe(false);
        expect(partitionOf(k, 3)).toBe(i);
        seen.add(k);
      }
    });
  });
  test('grep and inverted index', () => {
    const text = ['error: disk full', 'all good', 'ERROR: net down'];
    expect(run('grep', text, 3, 1, { arg: 'error' }).output.flat().map((p) => p[0])).toEqual(['ERROR: net down', 'error: disk full']);
    expect(flat(run('index', ['cat dog', 'dog fish'], 2, 1))).toEqual({ cat: 'doc1', dog: 'doc1, doc2', fish: 'doc2' });
  });
  test('input is split into contiguous chunks', () => {
    expect(splitInput(['a', 'b', 'c', 'd'], 2)).toEqual([['a', 'b'], ['c', 'd']]);
    expect(splitInput(['a'], 4).length).toBe(1);
  });
  test('worker failure: completed map tasks are redone, completed reduce tasks are not', () => {
    const tasks: Task[] = [
      { id: 'map 1', kind: 'map', state: 'completed', worker: 'A' },
      { id: 'map 2', kind: 'map', state: 'in-progress', worker: 'A' },
      { id: 'map 3', kind: 'map', state: 'completed', worker: 'B' },
      { id: 'reduce 1', kind: 'reduce', state: 'completed', worker: 'A' },
      { id: 'reduce 2', kind: 'reduce', state: 'in-progress', worker: 'A' },
    ];
    expect(onWorkerFailure(tasks, 'A').map((t) => t.state)).toEqual(['idle', 'idle', 'completed', 'completed', 'idle']);
  });
});
