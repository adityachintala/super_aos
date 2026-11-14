import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  signature: {
    id: 'mr-check-signature',
    type: 'mcq',
    prompt: 'In word count, what does the <b>reduce</b> function receive each time it is called?',
    options: [
      'One line of an input document',
      'A word together with the list of all the counts emitted for that word',
      'The complete list of all (word, 1) pairs',
      'One (word, 1) pair at a time',
    ],
    answer: 1,
    explanation:
      'The library groups together all intermediate values that share a key. Reduce is called <b>once per unique key</b> with that key and the list of its values, for example <code>("see", [1, 1])</code>, and emits the sum.',
  },
  pairs: {
    id: 'mr-check-pairs',
    type: 'numeric',
    prompt: 'Word count runs with two map tasks. Split 1 contains "a b a" and split 2 contains "b b c". With <b>no combiner</b>, how many intermediate key/value pairs are sent to the reduce phase?',
    answer: 6,
    unit: 'pairs',
    explanation: 'Map emits one <code>(word, 1)</code> pair per word occurrence: three from each split, <b>6</b> in all.',
  },
  combiner: {
    id: 'mr-check-combiner',
    type: 'numeric',
    prompt: 'Same job and input (split 1: "a b a", split 2: "b b c"), but now each map worker runs a combiner. How many pairs are sent to the reduce phase?',
    answer: 4,
    unit: 'pairs',
    hint: 'The combiner merges pairs with the same key within each map task, but cannot see the other map task’s output.',
    explanation: 'Map task 1 sends <code>(a, 2)</code> and <code>(b, 1)</code>; map task 2 sends <code>(b, 2)</code> and <code>(c, 1)</code>. That is <b>4</b> pairs, and the final answer (a 2, b 3, c 1) is unchanged.',
  },
  partition: {
    id: 'mr-check-partition',
    type: 'mcq',
    prompt: 'A job runs with R = 5 reduce tasks. How does the library decide which reduce task processes the intermediate key "spot"?',
    options: [
      'The master assigns keys to reducers in alphabetical order',
      'Whichever reducer is idle takes it',
      'A partitioning function, by default hash(key) mod R',
      'The map task that produced it chooses at random',
    ],
    answer: 2,
    explanation:
      'Intermediate keys are divided into R pieces by a <b>partitioning function</b>, by default <code>hash(key) mod R</code>. Because the function is deterministic, every pair with the key "spot" goes to the same reduce task, whichever map task produced it. That is what makes it possible to group all values for a key.',
  },
  redo: {
    id: 'mr-check-redo',
    type: 'mcq',
    prompt: 'A worker machine fails. It had <b>completed</b> two map tasks and <b>completed</b> one reduce task. Which of these must be executed again?',
    options: ['Nothing: completed tasks are safe', 'Only the reduce task', 'Only the two map tasks', 'All three tasks'],
    answer: 2,
    explanation:
      'Completed <b>map</b> tasks are re-executed because their output is stored on the <b>local disk</b> of the failed machine and is now unreachable. Completed <b>reduce</b> tasks are not, because their output is stored in the <b>global file system</b>.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  wordcount: {
    id: 'mr-practice-wordcount',
    type: 'written',
    marks: 5,
    prompt: 'Explain how the number of occurrences of each word in a large collection of documents can be computed with MapReduce. Give the map and reduce functions.',
    points: [
      'Input is a set of (document name, contents) pairs, split across many map tasks',
      'map(key = document, value = contents): for each word w in the contents, emit the intermediate pair (w, 1)',
      'The library groups all intermediate values with the same key (word) and passes them to reduce',
      'reduce(key = word, values = list of counts): sum the values and emit (word, sum)',
      'Map and reduce tasks run in parallel on many machines, and the library handles partitioning, scheduling and failures',
    ],
    modelAnswer:
      '<p>The input is a set of <code>(document name, contents)</code> pairs. The user supplies two functions.</p><p class="mt-2"><b>Map</b> takes one document and emits an intermediate pair for every word occurrence:</p><pre class="bg-background mt-1 overflow-x-auto rounded-md border p-2 text-xs">map(String key, String value):\n  // key: document name, value: document contents\n  for each word w in value:\n    EmitIntermediate(w, "1");</pre><p class="mt-2">The MapReduce library then <b>groups together all intermediate values associated with the same word</b> and passes them to reduce.</p><p class="mt-2"><b>Reduce</b> takes a word and the list of counts emitted for it, and sums them:</p><pre class="bg-background mt-1 overflow-x-auto rounded-md border p-2 text-xs">reduce(String key, Iterator values):\n  // key: a word, values: a list of counts\n  int result = 0;\n  for each v in values:\n    result += ParseInt(v);\n  Emit(key, AsString(result));</pre><p class="mt-2">For the input "see bob throw" and "see spot run", map emits (see,1) (bob,1) (throw,1) (see,1) (spot,1) (run,1), and reduce outputs bob 1, run 1, see 2, spot 1, throw 1. The input is split into many pieces processed by map tasks <b>in parallel</b> on different machines, and the reduce tasks also run in parallel; the library takes care of distribution, scheduling and fault tolerance.</p>',
  },
  refinements: {
    id: 'mr-practice-refinements',
    type: 'written',
    marks: 4,
    prompt: 'What are "backup tasks" and the "locality optimisation" in MapReduce, and what problem does each solve?',
    points: [
      'Problem 1: stragglers, machines that take unusually long (bad disk, competing load) and delay completion of the whole job',
      'Backup tasks: near the end of a phase the master schedules duplicate executions of the remaining in-progress tasks; whichever copy finishes first wins',
      'Problem 2: network bandwidth is scarce, so shipping input data to the workers would limit the read rate',
      'Locality: the master uses the file system’s replica locations to schedule each map task on (or on the same rack as) a machine holding its input block, so input is read from local disk',
    ],
    modelAnswer:
      '<p><b>Backup tasks</b> address <b>stragglers</b>: machines that take an unusually long time to finish one of the last few tasks, for example because of a bad disk that transfers data slowly, other jobs competing for the machine, or a misconfiguration. A single straggler can greatly lengthen the total job time. When an operation is close to completion, the master schedules <b>backup executions</b> of the remaining in-progress tasks; a task is marked complete when either the primary or the backup finishes. This costs a few percent more resources and dramatically shortens job completion time.</p><p class="mt-2">The <b>locality optimisation</b> addresses <b>scarce network bandwidth</b>. The input is stored in the distributed file system as 64 MB blocks, each replicated on several machines. The master asks the file system where the replicas of each input block are and tries to schedule the map task <b>on a machine that holds a replica</b>, or failing that on a machine on the same rack. Most input is then read from the <b>local disk</b> and consumes no network bandwidth, so thousands of machines can read input at disk speed rather than being limited by the rack switches.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'mr-cp-map',
    type: 'mcq',
    prompt: 'For the inverted-index job, the map function parses a document and emits which pairs?',
    options: ['(document ID, word)', '(word, document ID)', '(word, 1)', '(document ID, number of words)'],
    answer: 1,
    explanation:
      'Map emits <b>(word, document ID)</b> for each word in the document. Reduce then receives a word with all the document IDs it appears in, sorts them, and emits (word, list of document IDs). The set of all outputs is the inverted index.',
  },
  {
    id: 'mr-cp-output',
    type: 'numeric',
    prompt: 'A MapReduce job runs with M = 200 map tasks and R = 10 reduce tasks. How many output files does it produce?',
    answer: 10,
    unit: 'files',
    explanation: 'Each reduce task writes its own output file, so there are <b>R = 10</b> output files. They are often fed straight into another MapReduce job, so there is usually no need to merge them.',
  },
  {
    id: 'mr-cp-count',
    type: 'numeric',
    prompt: 'Word count is run on the two lines "see bob throw" and "see spot run". What value does reduce emit for the key "see"?',
    answer: 2,
    explanation: 'Map emits (see, 1) once for each line. Reduce is called with ("see", [1, 1]) and emits the sum, <b>2</b>.',
  },
  {
    id: 'mr-cp-sorted',
    type: 'tf',
    prompt: 'True or false: within a single reduce partition, the intermediate keys are processed in sorted order.',
    answer: true,
    explanation:
      'True. The reduce worker sorts all the intermediate data it has read by key, so that all occurrences of the same key are grouped together. As a side effect each output file is sorted by key, which is an <b>ordering guarantee</b> the library provides within a partition.',
  },
  {
    id: 'mr-cp-master',
    type: 'mcq',
    prompt: 'In the original MapReduce design, what happens if the master fails?',
    options: [
      'A backup master takes over instantly',
      'The workers elect a new master',
      'The computation is aborted and the client can retry',
      'Nothing: the master is not needed once tasks are assigned',
    ],
    answer: 2,
    explanation:
      'There is only one master, so its failure is unlikely. The original implementation simply <b>aborts</b> the computation, and the client can retry the job. (The master could write periodic checkpoints so that a new copy could resume, but that was not relied on.)',
  },
  {
    id: 'mr-cp-detect',
    type: 'mcq',
    prompt: 'How does the master discover that a worker has failed?',
    options: [
      'The worker sends a failure report before it crashes',
      'The master pings every worker periodically, and a worker that does not respond in time is marked failed',
      'The distributed file system informs the master',
      'Another worker notices that its neighbour is silent',
    ],
    answer: 1,
    explanation:
      'The master <b>pings every worker periodically</b> (a heartbeat). If no response is received within a certain time, the master marks the worker as failed and resets its tasks to idle so that they can be rescheduled on other workers.',
  },
  {
    id: 'mr-cp-refine',
    type: 'multi',
    prompt: 'Which of these are refinements used by MapReduce to improve performance or robustness?',
    options: [
      'Scheduling map tasks on machines that already hold a replica of their input data',
      'Running backup copies of the last in-progress tasks to beat slow machines',
      'Making every reduce task read the entire input again',
      'Skipping a record after it has caused two crashes',
    ],
    answers: [0, 1, 3],
    explanation:
      'Locality optimisation, backup tasks and skipping bad records are all real refinements, as are combiners, custom partitioning functions and compression of intermediate data. Reduce tasks never read the original input; they read only the intermediate data produced by the map tasks.',
  },
  {
    id: 'mr-cp-granularity',
    type: 'mcq',
    prompt: 'Why are M and R usually chosen to be much larger than the number of worker machines?',
    options: [
      'So that each machine can be given exactly one task',
      'Fine-grained tasks improve dynamic load balancing and speed up recovery when a worker fails',
      'Because the master can only track tasks, not machines',
      'To reduce the amount of state the master keeps',
    ],
    answer: 1,
    explanation:
      'Having each worker perform many different small tasks improves <b>dynamic load balancing</b> and <b>speeds up recovery</b>: the many map tasks a failed worker had completed can be spread over all the other machines. It increases, not reduces, the master’s state (O(M + R) scheduling decisions and O(M × R) state), which is what limits how large M and R can be. A typical run used M = 200,000 and R = 5,000 on 2,000 machines.',
  },
  {
    id: 'mr-cp-execution',
    type: 'written',
    marks: 6,
    prompt: 'Describe the sequence of steps that occur when a user program calls the MapReduce library.',
    points: [
      'The library splits the input files into M pieces and starts many copies of the program on a cluster; one copy is the master, the rest are workers',
      'The master assigns the M map tasks and R reduce tasks to idle workers',
      'A map worker reads its input split, passes each key/value pair to the user’s Map function, and buffers the intermediate pairs in memory',
      'Buffered pairs are periodically written to local disk, partitioned into R regions by the partitioning function; their locations are passed to the master',
      'A reduce worker reads the buffered data from the map workers’ local disks by remote procedure call, then sorts it by intermediate key so that equal keys are grouped',
      'For each unique key it calls the user’s Reduce function with the key and its values and appends the output to the final output file for that partition; when all tasks finish, the master wakes the user program',
    ],
    modelAnswer:
      '<ol class="list-decimal space-y-1 pl-5"><li>The library <b>splits the input</b> files into M pieces (typically 16 to 64 MB each) and starts many copies of the program on a cluster of machines.</li><li>One copy is the <b>master</b>; the rest are <b>workers</b>. The master picks idle workers and assigns each a map task or a reduce task. There are M map tasks and R reduce tasks.</li><li>A worker assigned a <b>map task</b> reads the corresponding input split, parses key/value pairs out of it, and passes each to the user-defined <b>Map</b> function. The intermediate pairs produced are buffered in memory.</li><li>Periodically the buffered pairs are <b>written to local disk</b>, partitioned into R regions by the partitioning function (<code>hash(key) mod R</code>). The locations of these regions are passed back to the master, which forwards them to the reduce workers.</li><li>A <b>reduce worker</b>, notified of these locations, uses remote procedure calls to read the buffered data from the map workers’ local disks. When it has all its intermediate data it <b>sorts</b> it by key, so that all occurrences of the same key are grouped together.</li><li>The reduce worker iterates over the sorted data and, for each unique key, passes the key and its set of values to the user’s <b>Reduce</b> function. The output is appended to a final output file for this reduce partition.</li><li>When all map and reduce tasks have completed, the master <b>wakes up the user program</b>, and the MapReduce call returns. The output is available in R output files.</li></ol>',
  },
  {
    id: 'mr-cp-fault',
    type: 'written',
    marks: 5,
    prompt: 'How does MapReduce tolerate worker failures? Why are completed map tasks re-executed but completed reduce tasks not?',
    points: [
      'The master pings every worker periodically; a worker that does not respond within a certain time is marked as failed',
      'Any map or reduce task in progress on the failed worker is reset to idle and becomes eligible for rescheduling on other workers',
      'Map tasks completed by the failed worker are also reset to idle and re-executed',
      'Reason: map output is stored on the local disk of the failed machine and is therefore inaccessible',
      'Completed reduce tasks need not be re-executed because their output is stored in a global (distributed) file system; reduce workers are told to read re-executed map output from the new worker',
    ],
    modelAnswer:
      '<p>Because the library is meant to run on hundreds or thousands of commodity machines, it must tolerate machine failures gracefully. It does so by <b>re-execution</b>.</p><p class="mt-2">The <b>master pings every worker periodically</b>. If no response is received from a worker within a certain time, the master marks it as failed. Any map task or reduce task <b>in progress</b> on that worker is reset to the idle state and becomes eligible for scheduling on other workers.</p><p class="mt-2">Map tasks that the worker had already <b>completed</b> are <i>also</i> reset to idle and re-executed. This is necessary because their output is stored on the <b>local disk of the failed machine</b> and is therefore inaccessible. When such a map task is re-executed by another worker, all reduce workers are notified, and any that have not yet read the data read it from the new worker.</p><p class="mt-2">Completed <b>reduce</b> tasks do <b>not</b> need to be re-executed, because their output is stored in the <b>global file system</b>, where it is replicated and remains available.</p><p class="mt-2">The approach is robust: in one incident 1,600 of 1,800 machines were lost and the job still completed successfully.</p>',
  },
];
