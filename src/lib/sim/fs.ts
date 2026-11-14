// Pure logic behind the file-system visualizations, modelled on a "very simple file system":
// a superblock, two bitmaps, an inode table and a data region.

export type Region = 'super' | 'ibitmap' | 'dbitmap' | 'inodes' | 'data';

export interface Layout {
  blocks: number;
  blockSize: number;
  inodeSize: number;
  inodeBlocks: number;
  /** First block of the inode table. */
  inodeStart: number;
}

export const VSFS: Layout = { blocks: 64, blockSize: 4096, inodeSize: 256, inodeBlocks: 5, inodeStart: 3 };

export function regionOf(block: number, l: Layout = VSFS): Region {
  if (block === 0) return 'super';
  if (block === 1) return 'ibitmap';
  if (block === 2) return 'dbitmap';
  if (block < l.inodeStart + l.inodeBlocks) return 'inodes';
  return 'data';
}

export const inodesPerBlock = (l: Layout = VSFS) => l.blockSize / l.inodeSize;
export const totalInodes = (l: Layout = VSFS) => inodesPerBlock(l) * l.inodeBlocks;
export const dataBlocks = (l: Layout = VSFS) => l.blocks - l.inodeStart - l.inodeBlocks;

/** Where on disk an inode lives, given its number. */
export function locateInode(inumber: number, l: Layout = VSFS, sectorSize = 512) {
  const offset = inumber * l.inodeSize; // bytes into the inode table
  const blk = Math.floor(offset / l.blockSize); // which block of the inode table
  const inodeStartAddr = l.inodeStart * l.blockSize;
  return {
    offset,
    blk,
    diskBlock: l.inodeStart + blk,
    byteAddr: inodeStartAddr + offset,
    blockByteAddr: inodeStartAddr + blk * l.blockSize,
    sector: (blk * l.blockSize + inodeStartAddr) / sectorSize,
    slot: inumber % inodesPerBlock(l),
  };
}

// ---------- Multi-level index ----------

export interface IndexConfig {
  direct: number;
  /** How many levels of indirection the inode has: 0 to 3. */
  levels: number;
  blockSize: number;
  pointerSize: number;
}

/** Number of data blocks reachable through direct pointers and each indirect level. */
export function reachable(c: IndexConfig): number[] {
  const per = c.blockSize / c.pointerSize;
  const out = [c.direct];
  for (let i = 1; i <= c.levels; i++) out.push(per ** i);
  return out;
}

export function maxFileBytes(c: IndexConfig): number {
  return reachable(c).reduce((a, b) => a + b, 0) * c.blockSize;
}

/** Which pointer chain leads to file block n. `indices` are the slots followed at each level. */
export function locateBlock(n: number, c: IndexConfig): { level: number; indices: number[]; reads: number } | null {
  const per = c.blockSize / c.pointerSize;
  if (n < c.direct) return { level: 0, indices: [n], reads: 1 };
  let rest = n - c.direct;
  for (let level = 1; level <= c.levels; level++) {
    const span = per ** level;
    if (rest < span) {
      const indices: number[] = [];
      for (let k = level - 1; k >= 0; k--) {
        indices.push(Math.floor(rest / per ** k));
        rest %= per ** k;
      }
      // One read per pointer block, plus the data block itself (the inode is assumed already in memory).
      return { level, indices, reads: level + 1 };
    }
    rest -= span;
  }
  return null; // beyond the maximum file size
}

// ---------- Access paths ----------

export type Structure = 'dbitmap' | 'ibitmap' | 'rootInode' | 'fooInode' | 'barInode' | 'rootData' | 'fooData' | 'barData';
export interface Io {
  on: Structure;
  action: 'read' | 'write';
  why: string;
}
export type Operation = 'open' | 'read' | 'create' | 'write';

/** The disk I/Os a simple file system performs for an operation on /foo/bar (nothing cached). */
export function accessPath(op: Operation): Io[] {
  const walk: Io[] = [
    { on: 'rootInode', action: 'read', why: 'The root inode number is well known (usually 2). Read it to find the root directory’s data blocks.' },
    { on: 'rootData', action: 'read', why: 'Search the root directory for the entry "foo" to get its inode number.' },
    { on: 'fooInode', action: 'read', why: 'Read the inode of /foo to find its data blocks and check permissions.' },
    { on: 'fooData', action: 'read', why: 'Search the directory /foo for the entry "bar".' },
  ];
  switch (op) {
    case 'open':
      return [...walk, { on: 'barInode', action: 'read', why: 'Read bar’s inode into memory, check permissions, and return a file descriptor.' }];
    case 'read':
      return [
        { on: 'barInode', action: 'read', why: 'Consult the inode (already open) to find where the wanted block is.' },
        { on: 'barData', action: 'read', why: 'Read the data block itself.' },
        { on: 'barInode', action: 'write', why: 'Update the last-accessed time in the inode.' },
      ];
    case 'create':
      return [
        ...walk,
        { on: 'ibitmap', action: 'read', why: 'The name "bar" was not found, so a new file is needed. Read the inode bitmap to find a free inode.' },
        { on: 'ibitmap', action: 'write', why: 'Mark that inode as allocated.' },
        { on: 'fooData', action: 'write', why: 'Add the entry (bar, inode number) to the directory /foo.' },
        { on: 'barInode', action: 'read', why: 'Read the block holding the new inode, because the whole block must be written back.' },
        { on: 'barInode', action: 'write', why: 'Initialise the new inode.' },
        { on: 'fooInode', action: 'write', why: 'Update the directory’s own inode (size and modification time).' },
      ];
    case 'write':
      return [
        { on: 'barInode', action: 'read', why: 'Read the inode to see which blocks the file already has.' },
        { on: 'dbitmap', action: 'read', why: 'The write needs a new block. Read the data bitmap to find a free one.' },
        { on: 'dbitmap', action: 'write', why: 'Mark that data block as allocated.' },
        { on: 'barData', action: 'write', why: 'Write the actual data into the new block.' },
        { on: 'barInode', action: 'write', why: 'Record the new block pointer, size and modification time in the inode.' },
      ];
  }
}
