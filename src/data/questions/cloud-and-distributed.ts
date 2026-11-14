import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  htc: {
    id: 'cl-check-htc',
    type: 'mcq',
    prompt: 'A web-search service handles requests from millions of users at once. Which measure best describes how well it is doing?',
    options: [
      'Floating-point operations per second on the Linpack benchmark',
      'The number of tasks completed per unit of time',
      'The clock speed of its fastest processor',
      'The size of its largest disk',
    ],
    answer: 1,
    explanation:
      'That is <b>high-throughput computing (HTC)</b>: the goal is the number of tasks completed per unit of time, across a huge number of independent requests. Raw floating-point speed is the measure for <b>high-performance computing (HPC)</b>, which serves fewer than 10% of computer users.',
  },
  paradigm: {
    id: 'cl-check-paradigm',
    type: 'mcq',
    prompt: 'Which description fits <b>distributed</b> computing?',
    options: [
      'All resources are centralised in one physical system under one integrated OS',
      'Processors are tightly coupled and communicate through centralised shared memory',
      'Multiple autonomous computers, each with private memory, exchange information by message passing over a network',
      'A single processor executes several instructions at once through pipelining',
    ],
    answer: 2,
    explanation:
      'A distributed system consists of <b>autonomous computers with private memory</b>, communicating through a network by <b>message passing</b>. Tightly coupled processors sharing memory describe parallel computing; one physical system describes centralised computing.',
  },
  ssi: {
    id: 'cl-check-ssi',
    type: 'tf',
    prompt: 'True or false: most clusters have a single system image by default, because their nodes run the same operating system.',
    answer: false,
    explanation:
      'False. Most clusters have loosely coupled nodes whose resources are each managed by their <b>own</b> OS, so by default a cluster has <b>multiple system images</b>. A single system image is an illusion that has to be <i>created</i> by software or hardware (middleware or a distributed OS) so that the cluster appears to the user as one machine.',
  },
  service: {
    id: 'cl-check-service',
    type: 'mcq',
    prompt: 'A startup uploads its Python web application to a provider, which supplies the runtime, database and scaling. The startup never logs in to a server. Which service model is this?',
    options: ['IaaS', 'PaaS', 'SaaS', 'On-premises hosting'],
    answer: 1,
    explanation:
      '<b>Platform as a Service.</b> The user deploys a <i>user-built application</i> onto a virtualised platform that includes middleware, databases, development tools and runtime support, and is freed from managing the infrastructure. Renting bare virtual machines would be IaaS; using someone else’s finished application would be SaaS.',
  },
  amdahl: {
    id: 'cl-check-amdahl',
    type: 'numeric',
    prompt: 'A program has a sequential fraction α = 0.25. According to Amdahl’s law, what is the largest speedup it can ever achieve, however many processors are used?',
    answer: 4,
    hint: 'What does 1 ÷ (α + (1 − α) ÷ n) approach as n becomes very large?',
    explanation: 'As n → ∞ the term (1 − α) ÷ n vanishes and the speedup approaches 1 ÷ α = 1 ÷ 0.25 = <b>4</b>. The bound does not depend on the cluster size at all.',
  },
  avail: {
    id: 'cl-check-avail',
    type: 'numeric',
    prompt: 'A server has a mean time to failure of 990 hours and a mean time to repair of 10 hours. What is its availability, as a percentage?',
    answer: 99,
    tolerance: 0.01,
    unit: '%',
    explanation: 'Availability = MTTF ÷ (MTTF + MTTR) = 990 ÷ 1000 = <b>99%</b>. That still means about 88 hours of downtime in a year.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  network: {
    id: 'cl-practice-network',
    type: 'written',
    pastPaper: true,
    marks: 2,
    prompt: 'What is the difference between a distributed system and a computer network?',
    points: [
      'A computer network is a collection of autonomous computers that are interconnected; users see the individual machines and must explicitly address or log in to them',
      'A distributed system is software built on top of a network that makes the collection of independent computers appear to its users as a single coherent system (transparency)',
    ],
    modelAnswer:
      '<p>A <b>computer network</b> is a collection of autonomous computers interconnected so that they can exchange information. The machines are <b>visible</b> to the user, who must explicitly choose a machine, log in to it, and move files or submit jobs to it.</p><p class="mt-2">A <b>distributed system</b> is a collection of independent computers that <b>appears to its users as a single coherent system</b>. It is a software system (middleware or a distributed OS) built <i>on top of</i> a network, which hides where programs run and where files are stored. The distinction therefore lies in the <b>software</b>, in particular the degree of transparency, rather than in the hardware.</p>',
  },
  virtualization: {
    id: 'cl-practice-vmops',
    type: 'written',
    marks: 4,
    prompt: 'Describe the four basic operations on virtual machines that make cloud data centres flexible, and state the main benefit they bring.',
    points: [
      'VMs can be multiplexed between hardware machines (several VMs share one physical machine)',
      'A VM can be suspended and stored in stable storage',
      'A suspended VM can be resumed or provisioned to a new hardware platform',
      'A VM can be migrated from one hardware platform to another',
      'Benefit: workloads can be provisioned on any available hardware and consolidated, raising server utilisation (claimed from 5–15% to 60–80%) and eliminating server sprawl',
    ],
    modelAnswer:
      '<p>A virtual machine monitor provides the VM abstraction between the guest OS and the host hardware, and supports four primitive operations:</p><ol class="mt-1 list-decimal space-y-1 pl-5"><li><b>Multiplexing:</b> several VMs share the same hardware machine.</li><li><b>Suspension:</b> a VM can be suspended and stored in stable storage.</li><li><b>Provisioning (resume):</b> a suspended VM can be resumed, or provisioned onto a new hardware platform.</li><li><b>Migration:</b> a VM can be moved from one hardware platform to another.</li></ol><p class="mt-2">These let a VM be provisioned to <b>any available hardware platform</b> and make distributed applications easy to port. Above all they allow <b>server consolidation</b>: many server functions are packed onto the same hardware, which eliminates server sprawl and greatly improves utilisation. VMware claimed that server utilisation could be raised from its typical 5–15% to 60–80%.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'cl-cp-amdahl',
    type: 'numeric',
    prompt: 'A program has a sequential fraction α = 0.25 and is run on 16 processors. What speedup does Amdahl’s law predict? (Two decimal places.)',
    answer: 3.37,
    tolerance: 0.01,
    hint: 'S = 1 ÷ (α + (1 − α) ÷ n).',
    explanation: 'S = 1 ÷ (0.25 + 0.75 ÷ 16) = 1 ÷ 0.296875 = <b>3.37</b>. Sixteen processors, and barely more than a threefold gain: the sequential quarter dominates.',
  },
  {
    id: 'cl-cp-gustafson',
    type: 'numeric',
    prompt: 'For the same program (α = 0.25) on 16 processors, what is the scaled-workload speedup according to Gustafson’s law?',
    answer: 12.25,
    tolerance: 0.01,
    hint: 'S′ = α + (1 − α) × n.',
    explanation: 'S′ = 0.25 + 0.75 × 16 = <b>12.25</b>. The difference from Amdahl comes from the assumption: here the parallel part of the workload is scaled up 16 times to match the machine.',
  },
  {
    id: 'cl-cp-efficiency',
    type: 'mcq',
    prompt: 'With α = 0.25 on a cluster of 256 nodes, Amdahl’s law gives a system efficiency of about 1.5%. What does that tell you?',
    options: [
      'The cluster is too small for the problem',
      'Only a few processors are doing useful work at any time, while most sit idle',
      'The network is the bottleneck',
      'The program has no sequential part',
    ],
    answer: 1,
    explanation:
      'Efficiency is speedup divided by the number of processors: about 3.95 ÷ 256 ≈ 1.5%. During the sequential part only one node works and the other 255 wait. With a <b>fixed workload</b>, adding nodes alone does not give good speedup; either shrink the sequential bottleneck or scale the problem.',
  },
  {
    id: 'cl-cp-avail',
    type: 'numeric',
    prompt: 'A system has an MTTF of 4,995 hours and an MTTR of 5 hours. What is its availability, as a percentage?',
    answer: 99.9,
    tolerance: 0.01,
    unit: '%',
    explanation: '4995 ÷ (4995 + 5) = 4995 ÷ 5000 = 0.999, or <b>99.9%</b> ("three nines"), which is still nearly nine hours of downtime a year.',
  },
  {
    id: 'cl-cp-models',
    type: 'mcq',
    prompt: 'In which service model does the customer manage the guest operating system but not the physical servers?',
    options: ['SaaS', 'PaaS', 'IaaS', 'None: the provider always manages the operating system'],
    answer: 2,
    explanation:
      '<b>IaaS.</b> The provider supplies servers, storage, networks and the data-centre fabric; the user deploys and runs VMs with guest operating systems and applications, and decides when to request and release resources, without controlling the underlying infrastructure.',
  },
  {
    id: 'cl-cp-classes',
    type: 'mcq',
    prompt: 'Which class of system is built from client machines that are globally distributed, where every node acts as both client and server and there is no central coordination?',
    options: ['A computer cluster', 'A peer-to-peer network', 'A computational grid', 'An Internet cloud'],
    answer: 1,
    explanation:
      'A <b>P2P network</b>. Peers join and leave freely, each is both a client and a server, and no central database or master is needed. A cluster is a tightly connected set of homogeneous nodes in one place; a grid couples resources of several organisations; a cloud is a pool of virtualised resources in data centres.',
  },
  {
    id: 'cl-cp-parallelism',
    type: 'mcq',
    prompt: 'Multicore processors made which level of parallelism available, the one that is still hard to exploit because of the difficulty of programming for it?',
    options: ['Bit-level parallelism', 'Instruction-level parallelism', 'Data-level parallelism', 'Task-level parallelism'],
    answer: 3,
    explanation:
      '<b>Task-level parallelism (TLP)</b> arrived with multicore processors and chip multiprocessors. Bit-, instruction- and data-level parallelism are well supported by hardware and compilers, but TLP is far from fully successful because programming and compiling code to run efficiently on many cores is hard.',
  },
  {
    id: 'cl-cp-reasons',
    type: 'multi',
    prompt: 'Which of these are genuine reasons for adopting cloud computing?',
    options: [
      'Peak-load capacity is shared among a large pool of users, improving overall utilisation',
      'Infrastructure maintenance is separated from application development',
      'It removes all privacy and security concerns',
      'There is no upfront investment in servers for the customer',
    ],
    answers: [0, 1, 3],
    explanation:
      'Sharing peak capacity, separating infrastructure maintenance from domain-specific development, and replacing upfront investment with pay-per-use are real benefits. Privacy, security, copyright and reliability are <b>open issues</b> that cloud adoption has to deal with, not problems it removes.',
  },
  {
    id: 'cl-cp-service-models',
    type: 'written',
    marks: 6,
    prompt: 'Explain the three cloud service models (IaaS, PaaS and SaaS), stating in each case what the provider supplies and what the user is responsible for.',
    points: [
      'IaaS: the provider puts together the infrastructure users demand - servers, storage, networks and the data-centre fabric - offered as virtual machines',
      'IaaS user: deploys and runs guest operating systems and applications on the VMs, chooses when to request and release resources, but does not manage the underlying infrastructure',
      'PaaS: the provider supplies a virtualised platform (hardware plus middleware, databases, development tools, runtime support) with programming interfaces',
      'PaaS user: deploys user-built applications on the platform and is freed from managing the cloud infrastructure',
      'SaaS: the provider runs complete application software, accessed through a browser by many paying customers (CRM, ERP, HR, collaboration)',
      'SaaS user: only uses the application; no upfront investment in servers or licences, and low cost for the provider compared with conventional hosting',
    ],
    modelAnswer:
      '<p><b>Infrastructure as a Service (IaaS).</b> The provider assembles the infrastructure that users demand: <b>servers, storage, networks and the data-centre fabric</b>, typically offered as virtual machines. The user can deploy and run <b>guest operating systems and applications</b> on multiple VMs. The user does not manage or control the underlying cloud infrastructure, but can specify when to request and release resources.</p><p class="mt-2"><b>Platform as a Service (PaaS).</b> The provider supplies a <b>virtualised cloud platform</b> that integrates hardware with software: middleware, databases, development tools and runtime support, exposed through specific programming interfaces (for example Java, Python or .NET). The user <b>deploys user-built applications</b> onto it and is freed from managing the infrastructure.</p><p class="mt-2"><b>Software as a Service (SaaS).</b> The provider runs <b>complete application software</b>, initiated from a browser by thousands of paying customers. It applies to business processes, CRM, ERP, HR and collaborative applications. The customer simply uses it: there is <b>no upfront investment</b> in servers or software licensing, and the provider’s costs are low compared with conventional hosting of user applications.</p><p class="mt-2">Going from IaaS to PaaS to SaaS, the provider manages more of the stack and the user manages less.</p>',
  },
  {
    id: 'cl-cp-laws',
    type: 'written',
    marks: 5,
    prompt: 'State Amdahl’s law and explain the "sequential bottleneck". What problem arises with a fixed workload on a large cluster, and how does Gustafson’s law address it?',
    points: [
      'Amdahl: if a fraction α of the code must run sequentially, speedup on n processors is S = 1 / (α + (1 − α)/n)',
      'As n grows, S approaches the upper bound 1/α, independent of cluster size; the sequential bottleneck is the part of the code that cannot be parallelised',
      'Fixed-workload problem: efficiency E = S/n falls sharply on a large cluster, since only a few processors are busy while the rest idle',
      'Gustafson: scale the problem size with the machine, W′ = αW + (1 − α)nW, so only the parallel portion grows',
      'Scaled speedup S′ = α + (1 − α)n grows nearly linearly, giving much higher efficiency',
    ],
    modelAnswer:
      '<p><b>Amdahl’s law.</b> Let a program take time T on one processor, with a fraction α that must be executed sequentially and (1 − α) that can be executed in parallel on n processors. The total time becomes αT + (1 − α)T/n, so the speedup is</p><p class="mt-1 font-mono">S = 1 / (α + (1 − α)/n)</p><p class="mt-2">The maximum speedup n is reached only if α = 0. As n → ∞, S approaches <b>1/α</b>, an upper bound that is <b>independent of the cluster size</b>. The <b>sequential bottleneck</b> is the portion of the code that cannot be parallelised: with α = 0.25 the speedup can never exceed 4, even with hundreds of processors.</p><p class="mt-2"><b>Fixed-workload problem.</b> Amdahl assumes the same workload whatever the machine size. System efficiency E = S/n = 1/(αn + 1 − α) then becomes very low on a large cluster; with n = 256 and α = 0.25 it is about 1.5%, because only a few processors are busy while the rest are idle.</p><p class="mt-2"><b>Gustafson’s law.</b> To use a large cluster efficiently, scale the problem size to match it. The workload is scaled to W′ = αW + (1 − α)nW: only the parallelisable portion grows n times. The scaled-workload speedup is</p><p class="mt-1 font-mono">S′ = W′/W = α + (1 − α)n</p><p class="mt-2">which grows almost linearly with n. For n = 256 and α = 0.25, S′ = 192.25 and the efficiency is about 75%. Amdahl’s law applies when the workload is fixed; Gustafson’s when the problem is scaled.</p>',
  },
];
