import { describe, expect, test } from 'bun:test';
import { accessPath, dataBlocks, inodesPerBlock, locateBlock, locateInode, maxFileBytes, reachable, regionOf, totalInodes } from './fs';

describe('simple file system layout', () => {
  test('64 blocks: 1 super, 2 bitmaps, 5 inode blocks, 56 data blocks', () => {
    const regions = Array.from({ length: 64 }, (_, b) => regionOf(b));
    expect(regions.filter((r) => r === 'inodes').length).toBe(5);
    expect(regions.filter((r) => r === 'data').length).toBe(56);
    expect(regions.slice(0, 3)).toEqual(['super', 'ibitmap', 'dbitmap']);
    expect(regionOf(8)).toBe('data');
    expect(dataBlocks()).toBe(56);
  });
  test('16 inodes per block, 80 in total', () => {
    expect(inodesPerBlock()).toBe(16);
    expect(totalInodes()).toBe(80);
  });
  test('inode 32 is at byte 20K, sector 40', () => {
    const loc = locateInode(32);
    expect(loc.offset).toBe(8192);
    expect(loc.byteAddr).toBe(20 * 1024);
    expect(loc.sector).toBe(40);
    expect(loc.diskBlock).toBe(5);
    expect(loc.slot).toBe(0);
  });
  test('inodes in the same block share a sector address', () => {
    expect(locateInode(33).sector).toBe(40);
    expect(locateInode(15).sector).toBe(24);
    expect(locateInode(79).diskBlock).toBe(7);
  });
});

describe('multi-level index', () => {
  const c = { direct: 12, levels: 1, blockSize: 4096, pointerSize: 4 };
  test('12 direct + single indirect reaches 4144 KB', () => {
    expect(reachable(c)).toEqual([12, 1024]);
    expect(maxFileBytes(c) / 1024).toBe(4144);
  });
  test('a double indirect pointer takes it past 4 GB', () => {
    expect(maxFileBytes({ ...c, levels: 2 })).toBeGreaterThan(4 * 1024 ** 3);
    expect(maxFileBytes({ ...c, levels: 2 })).toBe((12 + 1024 + 1024 * 1024) * 4096);
  });
  test('locating blocks', () => {
    const d = { ...c, levels: 3 };
    expect(locateBlock(0, d)).toEqual({ level: 0, indices: [0], reads: 1 });
    expect(locateBlock(11, d)!.level).toBe(0);
    expect(locateBlock(12, d)).toEqual({ level: 1, indices: [0], reads: 2 });
    expect(locateBlock(1035, d)).toEqual({ level: 1, indices: [1023], reads: 2 });
    expect(locateBlock(1036, d)).toEqual({ level: 2, indices: [0, 0], reads: 3 });
    expect(locateBlock(1036 + 1024 + 5, d)).toEqual({ level: 2, indices: [1, 5], reads: 3 });
    expect(locateBlock(12 + 1024 + 1024 ** 2, d)!.level).toBe(3);
    expect(locateBlock(12, { ...c, levels: 0 })).toBeNull();
  });
});

describe('access paths', () => {
  const count = (op: Parameters<typeof accessPath>[0]) => {
    const p = accessPath(op);
    return { reads: p.filter((i) => i.action === 'read').length, writes: p.filter((i) => i.action === 'write').length };
  };
  test('open /foo/bar is five reads', () => {
    expect(count('open')).toEqual({ reads: 5, writes: 0 });
  });
  test('reading a block is two reads and one write', () => {
    expect(count('read')).toEqual({ reads: 2, writes: 1 });
  });
  test('creating /foo/bar is ten I/Os', () => {
    expect(count('create')).toEqual({ reads: 6, writes: 4 });
  });
  test('an allocating write is five I/Os', () => {
    expect(count('write')).toEqual({ reads: 2, writes: 3 });
  });
});
