import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  inodeCount: {
    id: 'fs-check-inodecount',
    type: 'numeric',
    prompt: 'A file system uses 4 KB blocks and 128-byte inodes, and reserves 5 blocks for its inode table. What is the maximum number of files it can hold?',
    answer: 160,
    unit: 'files',
    hint: 'First work out how many inodes fit in one block.',
    explanation: '4096 ÷ 128 = 32 inodes per block, and 5 × 32 = <b>160</b> inodes. Each file (and each directory) needs exactly one inode, so that is the limit.',
  },
  inodeName: {
    id: 'fs-check-inodename',
    type: 'mcq',
    prompt: 'Which of these is <b>not</b> stored in a file’s inode?',
    options: ['The size of the file', 'Pointers to its data blocks', 'The name of the file', 'Its owner and permissions'],
    answer: 2,
    explanation:
      'The <b>name</b> lives in a directory entry, which pairs a name with an inode number. That is why one file can have several names (hard links): several directory entries simply hold the same inode number.',
  },
  imbalanced: {
    id: 'fs-check-imbalanced',
    type: 'mcq',
    prompt: 'Why does an inode keep a few direct pointers and only then fall back on indirect pointers, instead of using indirect blocks for everything?',
    options: [
      'Indirect blocks cannot be stored on the same disk as the inode',
      'Most files are small, so the common case should need no extra disk read',
      'Direct pointers can address larger blocks',
      'It makes the inode bitmap smaller',
    ],
    answer: 1,
    explanation:
      'Measurements of real file systems consistently show that <b>most files are small</b> (around 2 KB is the most common size), even though most bytes are in a few large files. With about a dozen direct pointers, a small file is read with no pointer-block I/O at all, and only the rare large file pays for indirection.',
  },
  openCost: {
    id: 'fs-check-opencost',
    type: 'numeric',
    prompt: 'With nothing cached, how many disk reads does it take to open the existing file <code>/a/b/c</code> in a simple file system where every directory fits in one block?',
    answer: 7,
    unit: 'reads',
    hint: 'Each directory on the path costs two reads: its inode and its data. Then the file’s own inode must be read.',
    explanation:
      'Root inode, root data, <code>a</code> inode, <code>a</code> data, <code>b</code> inode, <code>b</code> data, then <code>c</code>’s inode: <b>7 reads</b>. In general, 2 × (number of directories on the path) + 1. Long pathnames make open() expensive.',
  },
  buffering: {
    id: 'fs-check-buffering',
    type: 'mcq',
    prompt: 'A file system keeps written data in memory for up to 30 seconds before writing it to disk. Which of the following is a <b>cost</b> of doing this?',
    options: [
      'Several updates to the same block must each be written separately',
      'Data written just before a crash can be lost',
      'The disk scheduler has fewer requests to reorder',
      'Files that are created and quickly deleted cause more I/O',
    ],
    answer: 1,
    explanation:
      'Write buffering lets the system batch updates, schedule them well and even avoid writing short-lived data at all. The price is <b>durability</b>: anything still in memory when the system crashes is gone. Applications that cannot accept that, such as databases, call <code>fsync()</code> to force the data out.',
  },
  semantics: {
    id: 'fs-check-semantics',
    type: 'mcq',
    prompt: 'Two users have the same file open. One writes to it. Under <b>session semantics</b>, when does the other user see the change?',
    options: [
      'Immediately',
      'As soon as the writer closes the file',
      'Only if they open the file again after the writer has closed it',
      'Never: the file becomes read-only',
    ],
    answer: 2,
    explanation:
      'With session semantics, writes are not visible to others who have the file open, and even after the writer closes it, instances that are <i>already open</i> do not reflect the change. Only sessions that <b>start later</b> see it. Under UNIX semantics the answer would be "immediately".',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  structures: {
    id: 'fs-practice-structures',
    type: 'written',
    marks: 5,
    prompt: 'Describe the on-disk structures of a simple UNIX-like file system and the purpose of each.',
    points: [
      'The disk is divided into fixed-size blocks; most of them form the data region, holding file and directory contents',
      'The inode table holds one inode per file: its metadata (type, size, owner, permissions, times) and pointers to its data blocks',
      'An inode bitmap and a data bitmap record which inodes and which data blocks are free or allocated',
      'The superblock describes the file system as a whole: number of inodes and data blocks, where the inode table starts, a magic number',
      'When mounting, the OS reads the superblock first, initialises its parameters and attaches the volume to the file-system tree',
    ],
    modelAnswer:
      '<p>The disk is divided into <b>blocks</b> (commonly 4 KB). Most blocks belong to the <b>data region</b>, which stores user data: the contents of files and of directories.</p><p class="mt-2">The <b>inode table</b> is an array of on-disk inodes. Each file has one inode holding its metadata (type, size, owner, permissions, time stamps, link count) and the pointers that say which data blocks make up the file. The number of inodes fixes the maximum number of files.</p><p class="mt-2">Two <b>bitmaps</b>, one for inodes and one for data blocks, track allocation: each bit says whether the corresponding object is free (0) or in use (1).</p><p class="mt-2">The <b>superblock</b> holds information about the whole file system: how many inodes and data blocks there are, where the inode table begins, and a magic number identifying the file-system type. On <b>mount</b>, the OS reads the superblock first, initialises its parameters, and attaches the volume to the file-system tree, after which it knows where to find everything else.</p>',
  },
  append: {
    id: 'fs-practice-append',
    type: 'written',
    marks: 5,
    prompt: 'A process writes one new block to the end of an already open file. List the disk I/Os a simple file system performs, and explain why file creation is even more expensive.',
    points: [
      'Read the file’s inode',
      'Read the data bitmap to find a free block, then write the data bitmap to mark it allocated',
      'Write the data block itself',
      'Write the inode with the new block pointer, size and times, making five I/Os in total',
      'Creation also needs the path walked, the inode bitmap read and written, the new inode initialised, and the parent directory’s data and inode updated, about ten I/Os for /foo/bar',
    ],
    modelAnswer:
      '<p>An allocating write logically generates <b>five I/Os</b>: (1) read the inode, (2) read the data bitmap to find a free block, (3) write the data bitmap to mark the block in use, (4) write the new data block, and (5) write the inode, updated with the new block’s location, the new size and the modification time.</p><p class="mt-2"><b>Creating</b> a file costs more, because both an inode and a directory entry must be allocated. For <code>/foo/bar</code> the path is traversed (root inode, root data, foo inode, foo data); the inode bitmap is read and written to allocate an inode; foo’s data block is written to add the new entry; the new inode’s block is read and written to initialise it; and foo’s inode is written to update the directory. That is about <b>ten I/Os</b>, and more if the directory needs to grow into a new block. This is why file systems rely so heavily on caching and write buffering.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'fs-cp-sector',
    type: 'numeric',
    prompt: 'A file system has 4 KB blocks, 256-byte inodes and an inode table that begins at byte address 12 KB. Sectors are 512 bytes. Which sector must be read to fetch the block containing inode number 32?',
    answer: 40,
    hint: 'blk = (inumber × inode size) ÷ block size, rounded down. sector = (blk × block size + start address) ÷ sector size.',
    explanation:
      'Offset = 32 × 256 = 8192 bytes, so blk = 8192 ÷ 4096 = 2. Byte address of that block = 2 × 4096 + 12,288 = 20,480 (20 KB). Sector = 20,480 ÷ 512 = <b>40</b>.',
  },
  {
    id: 'fs-cp-maxsize',
    type: 'numeric',
    prompt: 'An inode has 12 direct pointers and one single indirect pointer. Blocks are 4 KB and disk pointers are 4 bytes. What is the largest file it can describe, in KB?',
    answer: 4144,
    unit: 'KB',
    hint: 'How many 4-byte pointers fit in one 4 KB block?',
    explanation: 'One block holds 4096 ÷ 4 = 1024 pointers. The file can have 12 + 1024 = 1036 blocks, which is 1036 × 4 KB = <b>4144 KB</b>.',
  },
  {
    id: 'fs-cp-superblock',
    type: 'mcq',
    prompt: 'Which structure does the operating system read first when mounting a file system?',
    options: ['The root directory’s data block', 'The inode bitmap', 'The superblock', 'The first data block'],
    answer: 2,
    explanation:
      'The <b>superblock</b> describes the file system: how many inodes and data blocks it has, where the inode table starts, and its type. Without it, the OS would not know where anything else is.',
  },
  {
    id: 'fs-cp-directory',
    type: 'tf',
    prompt: 'True or false: in a UNIX-like file system a directory is stored as a special kind of file, with its own inode and its contents in data blocks.',
    answer: true,
    explanation:
      'True. A directory has an inode (with its type field set to "directory") whose data blocks contain a list of (entry name, inode number) pairs. This is why the same machinery of inodes and data blocks serves both.',
  },
  {
    id: 'fs-cp-open',
    type: 'numeric',
    prompt: 'With nothing cached, how many disk reads are needed to open the existing file <code>/foo/bar</code> in a simple file system?',
    answer: 5,
    unit: 'reads',
    explanation: 'Root inode, root data, foo inode, foo data, bar inode: <b>5 reads</b>. Opening does not touch the allocation bitmaps, since nothing is being allocated.',
  },
  {
    id: 'fs-cp-create',
    type: 'mcq',
    prompt: 'Creating the new file <code>/foo/bar</code> needs about how many disk I/Os in a simple file system with nothing cached?',
    options: ['2', '5', '10', '25'],
    answer: 2,
    explanation:
      '<b>Ten</b>: four reads to walk the path; read and write the inode bitmap; write foo’s data to add the entry; read and write the new inode; and write foo’s inode. Step through "Create" in the simulator to see each one.',
  },
  {
    id: 'fs-cp-extent',
    type: 'mcq',
    prompt: 'What is an extent?',
    options: [
      'A spare block kept for bad-sector replacement',
      'A disk pointer plus a length, describing a run of contiguous blocks',
      'A block that contains only pointers to other blocks',
      'The portion of a file held in the page cache',
    ],
    answer: 1,
    explanation:
      'An extent is a <b>pointer and a length</b> (in blocks). Instead of one pointer per block, a few extents describe a whole file, as long as contiguous free space can be found. Extent-based schemes are more compact but less flexible than pointer-based ones; Linux ext4 uses them.',
  },
  {
    id: 'fs-cp-password',
    type: 'tf',
    pastPaper: true,
    prompt: 'True or false: in UNIX, the system administrator (root) can find out the passwords of users.',
    answer: false,
    explanation:
      'False. UNIX does not store passwords. It stores the result of a <b>one-way hash</b> of each password (combined with a random salt), and at login it hashes what the user types and compares the results. Root can read the hashes and can <i>reset</i> any password, but cannot turn a hash back into the password. Corrected statement: "In UNIX, root can read the hashed passwords and change them, but cannot know the passwords themselves."',
  },
  {
    id: 'fs-cp-consistency',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Briefly explain the following consistency semantics with their positive and negative points: (i) UNIX semantics (ii) session semantics.',
    points: [
      'UNIX semantics: writes to an open file are visible immediately to all other users who have the file open',
      'UNIX: a file has a single image that is shared (optionally including the current-position pointer), which gives intuitive, up-to-date sharing',
      'UNIX negative: the single image is accessed as an exclusive resource, so contention delays user processes; hard to provide efficiently in a distributed system',
      'Session semantics: writes are not visible to other users who have the file open at the same time',
      'Session: once the file is closed, the changes are visible only in sessions that start later; already-open instances do not see them',
      'Session positive: a file can have several images, so users read and write concurrently without delay (good for distributed file systems such as AFS); negative: users may work on stale data and the last close wins',
    ],
    modelAnswer:
      '<p>Consistency semantics specify how several users accessing a shared file at the same time see each other’s changes.</p><p class="mt-2"><b>(i) UNIX semantics.</b> A write to an open file is <b>visible immediately</b> to every other user who has that file open. There is one mode of sharing in which users also share the current-location pointer, so one user advancing it affects the others. The file has a <b>single image</b> that interleaves all accesses. <i>Positive:</i> everyone always sees the latest data, and the behaviour is simple to reason about. <i>Negative:</i> the single image is accessed as an exclusive resource, so contention for it <b>delays user processes</b>, and it is costly to implement across a network.</p><p class="mt-2"><b>(ii) Session semantics</b> (used by the Andrew file system). Writes to an open file are <b>not visible</b> to other users who have it open. When the file is closed, its changes become visible only in <b>sessions starting later</b>; instances already open do not reflect them. A file may therefore be associated with <b>several, possibly different, images</b> at once. <i>Positive:</i> users can read and write their own images concurrently with no delay and almost no constraints on scheduling, which suits distributed systems where the file is cached locally. <i>Negative:</i> users may be working with out-of-date contents, and concurrent writers can overwrite each other when they close.</p>',
  },
  {
    id: 'fs-cp-cache',
    type: 'written',
    marks: 4,
    prompt: 'How do caching and write buffering reduce the I/O cost of file-system operations? What is the trade-off?',
    points: [
      'A cache in memory holds popular blocks (inodes, directory data), so repeated opens and reads of the same files cause little or no disk I/O',
      'Modern systems use a unified, dynamically sized page cache shared with virtual memory rather than a fixed-size cache',
      'Write buffering delays writes so that updates can be batched, scheduled efficiently, or avoided entirely if the data is overwritten or deleted soon',
      'The trade-off is durability: buffered data is lost if the system crashes before it reaches the disk; applications needing a guarantee use fsync() or direct I/O',
    ],
    modelAnswer:
      '<p>Reading and writing files requires many I/Os (five reads just to open <code>/foo/bar</code>), so file systems use memory aggressively.</p><p class="mt-2"><b>Caching.</b> Popular blocks, especially inodes and directory contents, are kept in memory. The first open of a file causes a burst of reads; later opens of the same file, or of others in the same directory, mostly <b>hit the cache</b> and need no I/O. Early systems set aside a fixed fraction of memory for this; modern ones integrate file pages and virtual-memory pages in a <b>unified page cache</b> whose share of memory changes dynamically with demand.</p><p class="mt-2"><b>Write buffering.</b> Writes must eventually reach the disk, but delaying them (typically 5 to 30 seconds) has three benefits: updates can be <b>batched</b> (one bitmap write covering several allocations), the pending writes can be <b>scheduled</b> in an efficient order, and some writes are <b>avoided</b> altogether, for example when a file is created and deleted shortly after.</p><p class="mt-2"><b>Trade-off.</b> Performance is bought with <b>durability</b>: if the machine crashes before the buffered data is written, it is lost. Applications that cannot tolerate this force writes with <code>fsync()</code>, use direct I/O, or use the raw disk.</p>',
  },
];
