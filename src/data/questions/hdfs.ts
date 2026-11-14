import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  separation: {
    id: 'hdfs-check-separation',
    type: 'mcq',
    prompt: 'A client reads a 1 GB file from HDFS. Through which server does the file’s data flow?',
    options: [
      'All of it passes through the NameNode',
      'It flows directly from DataNodes to the client; the NameNode only supplies block locations',
      'Half through the NameNode and half through the DataNodes',
      'Through the CheckpointNode',
    ],
    answer: 1,
    explanation:
      'HDFS stores metadata and application data separately. The NameNode answers "which blocks, on which DataNodes?" and then steps aside; the client reads the bytes <b>straight from the DataNodes</b>. If data flowed through the single NameNode it would be a hopeless bottleneck.',
  },
  blocks: {
    id: 'hdfs-check-blocks',
    type: 'numeric',
    prompt: 'A 1 GB (1024 MB) file is stored in HDFS with a 128 MB block size and the default replication factor of 3. How many block replicas exist in the cluster?',
    answer: 24,
    unit: 'replicas',
    hint: 'First find the number of blocks, then multiply by the replication factor.',
    explanation: '1024 ÷ 128 = 8 blocks, each stored 3 times: <b>24 replicas</b>, using 3 GB of raw disk space.',
  },
  heartbeat: {
    id: 'hdfs-check-heartbeat',
    type: 'mcq',
    prompt: 'How does the NameNode tell a DataNode to copy one of its blocks to another node?',
    options: [
      'It opens a connection to the DataNode and sends the command',
      'It includes the instruction in its reply to that DataNode’s next heartbeat',
      'It writes the command into the journal, which DataNodes read',
      'It asks the HDFS client to pass the message on',
    ],
    answer: 1,
    explanation:
      'The NameNode <b>never calls DataNodes directly</b>. DataNodes send a heartbeat every three seconds, and the NameNode uses its <b>replies</b> to carry instructions: replicate a block, remove a replica, re-register, shut down, or send an immediate block report.',
  },
  rack: {
    id: 'hdfs-check-rack',
    type: 'mcq',
    prompt: 'With the default placement policy and three replicas, the first replica goes on the writer’s own node. Where do the other two go?',
    options: [
      'On two other nodes in the same rack as the writer',
      'On two different nodes in one other rack',
      'On one node in each of two other racks',
      'On any two nodes chosen at random',
    ],
    answer: 1,
    explanation:
      'The second and third replicas go on <b>two different nodes in a different rack</b>. The block is then on two racks, so it survives the loss of a whole rack, while only one of the two extra copies had to cross between racks, which keeps the write cheap.',
  },
  writer: {
    id: 'hdfs-check-writer',
    type: 'tf',
    prompt: 'True or false: two HDFS clients can write to the same file at the same time, as long as they write to different blocks.',
    answer: false,
    explanation:
      'False. HDFS implements a <b>single-writer, multiple-reader</b> model. The client that opens a file for writing is granted a <b>lease</b>; no other client can write to it until the file is closed and the lease revoked. Many clients may read it concurrently.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  failure: {
    id: 'hdfs-practice-failure',
    type: 'written',
    marks: 5,
    prompt: 'Explain how HDFS detects the failure of a DataNode and how it recovers from it.',
    points: [
      'During normal operation each DataNode sends a heartbeat to the NameNode (every three seconds by default) to confirm it is available',
      'If no heartbeat arrives for ten minutes, the NameNode considers the DataNode out of service and its block replicas unavailable',
      'The NameNode knows which blocks were on that node from its block map, so it finds the blocks that are now under-replicated',
      'It schedules creation of new replicas on other DataNodes, sending the instructions in replies to their heartbeats',
      'Placement of the new replicas still respects the policy (not all replicas on one rack), and clients keep reading from the surviving replicas meanwhile',
    ],
    modelAnswer:
      '<p><b>Detection.</b> Each DataNode sends a <b>heartbeat</b> to the NameNode every three seconds to confirm that it is alive and that the replicas it hosts are available. If the NameNode receives no heartbeat from a DataNode for <b>ten minutes</b>, it considers that DataNode out of service and the block replicas it hosted unavailable.</p><p class="mt-2"><b>Recovery.</b> The NameNode maintains the mapping from blocks to DataNodes, so it knows exactly which blocks have lost a replica and are now <b>under-replicated</b>. It schedules the creation of new replicas of those blocks on other DataNodes. It does not contact DataNodes directly; the "replicate block to node X" commands are carried in its <b>replies to heartbeats</b> from nodes that hold a good copy. The targets are chosen so that the placement policy still holds, in particular that the replicas of a block are not all on one rack.</p><p class="mt-2">Throughout, the data stays available: a client reading the file simply uses one of the remaining replicas. If the failed node later returns, its block report reveals over-replicated blocks, and the NameNode removes the extra copies.</p>',
  },
  placement: {
    id: 'hdfs-practice-placement',
    type: 'written',
    marks: 4,
    prompt: 'Describe the default block placement policy of HDFS and the trade-off it is designed to strike.',
    points: [
      'First replica on the node where the writer is located',
      'Second and third replicas on two different nodes in a different rack',
      'No DataNode holds more than one replica of a block, and no rack holds more than two replicas of it',
      'Trade-off: minimise write cost (only one inter-rack transfer) while maximising reliability and availability (survives a rack failure) and aggregate read bandwidth',
    ],
    modelAnswer:
      '<p>Nodes are spread over multiple racks. Nodes in a rack share a switch, and racks are connected by core switches, so bandwidth between nodes in the same rack is usually greater than between racks.</p><p class="mt-2">The default policy places the <b>first replica on the node where the writer is located</b>, and the <b>second and third replicas on two different nodes in a different rack</b>. Any further replicas go on random nodes, subject to two restrictions: no DataNode contains more than one replica of a block, and no rack contains more than two replicas of the same block (when there are enough racks).</p><p class="mt-2">This is a <b>trade-off</b> between minimising the write cost and maximising data reliability, availability and aggregate read bandwidth. Putting every replica on a different rack would be safest but would send two copies across racks. Putting them all in one rack would be cheapest but a single rack failure would lose the block. The default sends data across racks only once, yet the block survives the loss of any one rack, and readers can choose among replicas on two racks.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'hdfs-cp-roles',
    type: 'mcq',
    prompt: 'Which of these is stored by the NameNode rather than by DataNodes?',
    options: ['The bytes of each file block', 'Checksums of the block data', 'The namespace tree and the mapping of file blocks to DataNodes', 'Intermediate MapReduce output'],
    answer: 2,
    explanation:
      'The NameNode holds the <b>metadata</b>: the hierarchy of files and directories (as inodes) and which blocks make up each file and where their replicas are. DataNodes hold the block data itself, together with a small metadata file of checksums for each block.',
  },
  {
    id: 'hdfs-cp-blockcount',
    type: 'numeric',
    prompt: 'A 700 MB file is written to HDFS with a 128 MB block size. How many blocks does it occupy?',
    answer: 6,
    unit: 'blocks',
    explanation: '700 ÷ 128 = 5.47, so <b>6 blocks</b>: five full 128 MB blocks and a final block holding the remaining 60 MB. A block that is not full uses only as much disk space as its data.',
  },
  {
    id: 'hdfs-cp-raw',
    type: 'numeric',
    prompt: 'How much raw disk space, in MB, does that 700 MB file consume across the cluster with the default replication factor?',
    answer: 2100,
    unit: 'MB',
    explanation: 'Every block is stored three times, so the file uses 3 × 700 = <b>2100 MB</b> of raw storage.',
  },
  {
    id: 'hdfs-cp-timeout',
    type: 'mcq',
    prompt: 'By default, how long must the NameNode go without a heartbeat from a DataNode before it treats the node as out of service?',
    options: ['Three seconds', 'Thirty seconds', 'Ten minutes', 'One hour'],
    answer: 2,
    explanation:
      'Heartbeats are sent every <b>three seconds</b>, but the NameNode waits <b>ten minutes</b> without one before declaring the DataNode dead and re-replicating its blocks. The long wait avoids a storm of copying caused by a brief network hiccup. (One hour is the interval between block reports.)',
  },
  {
    id: 'hdfs-cp-journal',
    type: 'mcq',
    prompt: 'What is the journal kept by the NameNode?',
    options: [
      'A list of every block replica on every DataNode',
      'A write-ahead log of changes to the namespace that must be made persistent',
      'A record of all bytes written by clients, used to rebuild lost blocks',
      'The schedule of the balancer',
    ],
    answer: 1,
    explanation:
      'The journal is a <b>write-ahead commit log</b> for changes to the file-system metadata. Each client-initiated transaction is recorded in it and flushed to disk before the client is told it has succeeded. On restart, the NameNode loads the last checkpoint and replays the journal to get back to the latest state.',
  },
  {
    id: 'hdfs-cp-locations',
    type: 'tf',
    prompt: 'True or false: the locations of block replicas are saved in the NameNode’s persistent checkpoint.',
    answer: false,
    explanation:
      'False. The checkpoint holds the namespace (inodes and the list of blocks belonging to each file), but <b>not where the replicas are</b>. Replica locations change over time and are rebuilt in memory from the <b>block reports</b> that DataNodes send when they register and every hour after.',
  },
  {
    id: 'hdfs-cp-facts',
    type: 'multi',
    prompt: 'Which statements about HDFS are correct?',
    options: [
      'A file that has been closed can have its existing bytes overwritten in place',
      'When reading a block, the client tries the replica closest to it first',
      'Each DataNode periodically scans its replicas and verifies their checksums',
      'The whole namespace is kept in the NameNode’s main memory',
    ],
    answers: [1, 2, 3],
    explanation:
      'After a file is closed its bytes <b>cannot be altered or removed</b>; data can only be added by reopening the file for append. The other three are true: locations are returned ordered by distance from the reader, a block scanner on each DataNode checks checksums, and the NameNode keeps the entire namespace in RAM.',
  },
  {
    id: 'hdfs-cp-largeblock',
    type: 'mcq',
    prompt: 'Why does HDFS use blocks of 64 MB or 128 MB, when a local file system uses 4 KB?',
    options: [
      'Large blocks make small files more efficient to store',
      'Fewer blocks means less metadata in the NameNode’s memory, and long sequential transfers make seek time negligible',
      'DataNodes cannot store files smaller than 64 MB',
      'Large blocks are required for replication to work',
    ],
    answer: 1,
    explanation:
      'HDFS is built for very large files read sequentially in bulk. A big block means the time to seek to its start is tiny compared with the time to transfer it, so data moves at the disk’s transfer rate. It also keeps the number of blocks, and therefore the metadata the single NameNode must hold in RAM, manageable. The price is that HDFS suits a modest number of large files, not billions of tiny ones.',
  },
  {
    id: 'hdfs-cp-architecture',
    type: 'written',
    marks: 6,
    prompt: 'Describe the architecture of HDFS, explaining the roles of the NameNode and the DataNodes and how a client reads a file.',
    points: [
      'Master-slave architecture: a single NameNode (master) and many DataNodes (workers), with metadata and application data stored separately',
      'NameNode: maintains the namespace tree (files and directories as inodes) and the mapping of file blocks to DataNodes, all in RAM, with a checkpoint and journal on disk',
      'File content is split into large blocks (typically 128 MB), each replicated on multiple DataNodes (typically three)',
      'DataNodes: store block replicas as local files with checksums, send heartbeats and block reports, and carry out instructions returned by the NameNode',
      'Read: the client asks the NameNode for the list of blocks and the locations of their replicas, ordered by distance from the client',
      'The client then reads each block directly from the closest DataNode, trying the next replica if a read fails or a checksum does not match',
    ],
    modelAnswer:
      '<p>HDFS is a distributed file system designed to store very large data sets reliably on clusters of commodity machines. It has a <b>master-slave architecture</b> and stores <b>file-system metadata and application data separately</b>.</p><p class="mt-2">The single <b>NameNode</b> is the master. It maintains the <b>namespace</b>, a hierarchy of files and directories represented by inodes (permissions, times, quotas), and the <b>mapping of file blocks to DataNodes</b>. The entire namespace is kept in RAM; a <b>checkpoint</b> of the image and a <b>journal</b> of changes are kept on disk for recovery.</p><p class="mt-2">File content is split into large <b>blocks</b> (typically 128 MB) and each block is independently <b>replicated</b> on several <b>DataNodes</b> (typically three). A DataNode stores each replica as two local files, the data and its checksums. DataNodes send <b>heartbeats</b> every three seconds and <b>block reports</b> every hour; the NameNode’s replies to heartbeats carry its instructions.</p><p class="mt-2"><b>Reading.</b> The client first contacts the NameNode, which returns the list of blocks of the file and, for each, the locations of its replicas <b>ordered by distance</b> from the client. The client then reads block contents <b>directly from the closest DataNode</b>. If that read fails, because the node is down or the checksum shows corruption, it tries the next replica. The NameNode is never on the data path.</p>',
  },
  {
    id: 'hdfs-cp-namenode',
    type: 'written',
    marks: 5,
    prompt: 'The NameNode keeps the whole namespace in memory. Explain how HDFS protects this metadata against loss, mentioning the checkpoint, the journal, the CheckpointNode and the BackupNode.',
    points: [
      'The image is the in-memory metadata; a persistent record of it on disk is called a checkpoint',
      'The journal is a write-ahead log: every transaction is recorded and flushed before the client is acknowledged',
      'On restart the NameNode loads the checkpoint and replays the journal to restore the latest state',
      'Checkpoint and journal can be stored in multiple storage directories on different volumes, one of them on a remote NFS server',
      'The CheckpointNode periodically merges checkpoint and journal into a new checkpoint so the journal can be truncated; the BackupNode additionally keeps an up-to-date in-memory image synchronised with the NameNode',
    ],
    modelAnswer:
      '<p>The inodes and the list of blocks of each file form the metadata called the <b>image</b>, held in RAM. A persistent record of the image written to the NameNode’s local file system is a <b>checkpoint</b>. Changes are recorded in the <b>journal</b>, a <b>write-ahead commit log</b>: for each client-initiated transaction the change is written to the journal and the journal is flushed and synced <i>before</i> the client is told the operation has committed.</p><p class="mt-2">On <b>restart</b>, the NameNode initialises the image from the checkpoint and replays the journal until the image is up to date; it then writes a new checkpoint and an empty journal before serving clients. (Replica locations are not persistent; they are rebuilt from block reports.)</p><p class="mt-2">If the checkpoint or journal is lost or corrupted, namespace information is lost, so HDFS can keep them in <b>multiple storage directories</b>, ideally on different volumes with one on a remote NFS server.</p><p class="mt-2">A long journal means a slow restart and more risk. A <b>CheckpointNode</b>, running on a different host, periodically combines the existing checkpoint and journal into a new checkpoint and an empty journal, letting the NameNode truncate its journal. A <b>BackupNode</b> does the same and, in addition, maintains an <b>in-memory, up-to-date image</b> of the namespace that is always synchronised with the NameNode.</p>',
  },
];
