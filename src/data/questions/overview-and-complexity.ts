import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  system: {
    id: 'oc-check-system',
    type: 'mcq',
    prompt: 'For a fast-food restaurant viewed as a system, the health department’s regulations are best described as…',
    options: ['An input', 'A component', 'A constraint', 'An interface'],
    answer: 2,
    explanation:
      'A <b>constraint</b> is a limit on what the system can accomplish. The health department itself is part of the <b>environment</b>; the rules it imposes are constraints. Inputs are what the system takes in to fulfil its purpose (food, labour, cash).',
  },
  os: {
    id: 'oc-check-os',
    type: 'mcq',
    prompt: 'In the view that every tool has a machine part and an operating part, what is the purpose of the operating part?',
    options: [
      'To make the machine run faster',
      'To facilitate operation of the underlying machine by hiding its details behind simple services',
      'To replace the machine part',
      'To store the user’s data',
    ],
    answer: 1,
    explanation:
      'The operating part <b>abstracts the machine part in terms of simple services</b>, hiding the details. A car’s steering wheel and pedals are its operating system: you drive without knowing how the engine works. A computer operating system does the same for hardware.',
  },
  goals: {
    id: 'oc-check-goals',
    type: 'mcq',
    prompt: 'The two goals of an operating system are convenience and efficiency. Which statement is correct?',
    options: [
      'They never conflict',
      'They are sometimes contradictory, and which one dominates depends on the kind of system',
      'Efficiency always matters more',
      'Convenience always matters more',
    ],
    answer: 1,
    explanation:
      'A system shared by many users (a mainframe) is designed mainly for <b>efficient</b> use of scarce hardware; a personal computer or phone is designed mainly for <b>convenience</b>. The two goals are sometimes contradictory, and much of operating-system theory concentrates on the optimal use of resources.',
  },
  signs: {
    id: 'oc-check-signs',
    type: 'multi',
    prompt: 'Which of these are signs that a system is complex?',
    options: ['A large number of components', 'A large number of interconnections', 'Many irregularities and exceptions', 'A long description', 'It is written in a low-level language'],
    answers: [0, 1, 2, 3],
    explanation:
      'The five signs are a <b>large number of components</b>, a <b>large number of interconnections</b>, <b>many irregularities</b>, a <b>long description</b>, and a <b>team</b> of designers, implementers or maintainers. The language it is written in is not one of them.',
  },
  modularity: {
    id: 'oc-check-modularity',
    type: 'numeric',
    prompt: 'A 2,000-statement program is divided into 20 equal modules. Under the N × N debugging model, by what factor does debugging time fall?',
    answer: 20,
    explanation: 'Whole program: 2000² = 4,000,000. Modules: 20 × (2000/20)² = 20 × 10,000 = 200,000. The ratio is <b>20</b>, which is K, the number of modules.',
  },
  layering: {
    id: 'oc-check-layering',
    type: 'mcq',
    prompt: 'What distinguishes layering from modularity in general?',
    options: [
      'Layers are larger than modules',
      'Each layer is built only from the complete set of mechanisms offered by the layer below, so a module interacts only with its peers and the adjacent layers',
      'Layers cannot contain modules',
      'Layering removes the need for abstraction',
    ],
    answer: 1,
    explanation:
      'Layering is a particular way of <b>organising</b> modules to reduce interconnections: use a set of mechanisms that is already complete (the lower layer) to create a different complete set of mechanisms (the upper layer). A layer may itself be implemented as several modules.',
  },
  digital: {
    id: 'oc-check-digital',
    type: 'mcq',
    prompt: 'Why do computer systems have "no nearby bounds on composition", unlike analog systems?',
    options: [
      'Computers are cheaper',
      'Digital components regenerate signals, so noise does not accumulate as components are added; and software has no physical limits',
      'Computers are built by larger teams',
      'Analog components are slower',
    ],
    answer: 1,
    explanation:
      'In an analog system each component adds noise, and beyond some number of components noise dominates (a photocopy of a photocopy). Digital logic maps a <b>range</b> of analog values to 0 or 1, so small errors are removed at every stage. With no noise limit and software that has no physical limits at all, the only bound left is <b>the ability of humans to understand</b> the system.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice, shown before the checkpoint. */
export const practice = {
  inputOutput: {
    id: 'oc-practice-io',
    type: 'written',
    pastPaper: true,
    marks: 3,
    prompt: 'What are the input and the output of an operating system?',
    points: [
      'An operating system is a system; input is whatever a system takes from its environment to fulfil its purpose, and output is whatever it returns',
      'Input: requests for service, that is commands from users, system calls from application programs, and interrupts from hardware devices (together with the programs and data to be processed)',
      'Output: the services delivered and their results, that is programs executed, data transferred to and from devices and files, resources allocated, and status or error reports (control signals to the hardware)',
    ],
    modelAnswer:
      '<p>An operating system is a <b>system</b>: a set of interrelated components with a boundary, working together for a purpose. For any system, the <b>input</b> is whatever it takes from its environment in order to fulfil its purpose, and the <b>output</b> is whatever it returns to its environment. The environment of an operating system is the users and application programs above it and the hardware below it.</p><p class="mt-2"><b>Input.</b> Requests for service, arriving as <b>events</b>: commands typed or clicked by users, <b>system calls</b> made by running programs, and <b>interrupts</b> raised by hardware devices (a key pressed, a disk transfer finished, the timer expiring). The programs and data to be run are also taken in.</p><p class="mt-2"><b>Output.</b> The <b>services</b> it performs in response and their results: programs loaded and executed, data read from and written to files and devices, resources (CPU time, memory, devices) allocated, and status and error reports returned to the requester. Towards the hardware, its output is the control signals that drive the devices.</p><p class="mt-2">This is why an operating system is described as <b>interrupt driven</b>: it sits idle until an input event arrives, services it, and returns.</p>',
  },
  cope: {
    id: 'oc-practice-cope',
    type: 'written',
    marks: 6,
    prompt: 'Name and explain the four general techniques for coping with complexity in system design. Why are they not sufficient for computer systems, and what two further techniques are used?',
    points: [
      'Modularity: divide and conquer; analyse or design the system as a collection of interacting modules, each of which can be considered in isolation (debugging time falls from N² to N²/K; allows incremental improvement)',
      'Abstraction: a module treats all others purely on the basis of their external specifications, without knowing what goes on inside; limits propagation of effects',
      'Layering: build each layer from the complete set of mechanisms of the layer below; a module interacts only with peers and adjacent layers, reducing interconnections',
      'Hierarchy: assemble small groups of modules into stable subsystems with well-defined interfaces, and those into larger subsystems, giving a tree; reduces interconnections',
      'Not sufficient because computer systems have no nearby bounds on composition (digital, controlled by software) and technology changes at an unprecedented rate, so it is hard to choose the right modularity, abstraction, layering and hierarchy in advance',
      'Iteration: start with a simple working system that meets a modest number of requirements and evolve it in small steps, planning for feedback. Keep it simple: resist adding features; consider the cumulative impact of each',
    ],
    modelAnswer:
      '<p><b>1. Modularity.</b> Divide and conquer: analyse or design the system as a collection of interacting subsystems called <b>modules</b>, so that each can be thought about in isolation. If debugging a program of N statements costs about N × N, dividing it into K modules costs K × (N/K)² = N²/K: a reduction by a factor of K. Modularity also allows <b>incremental improvement</b>: an inferior module can be replaced by a better one.</p><p class="mt-2"><b>2. Abstraction.</b> The ability of any module to treat all the others entirely on the basis of their <b>external specifications</b>, with no knowledge of what goes on inside. A good abstraction means the discovery of a bug leads to examining only one module, with little or no <b>propagation of effects</b>.</p><p class="mt-2"><b>3. Layering.</b> A way of organising modules that reduces interconnections: use a complete set of mechanisms (the lower layer) to create a different complete set of mechanisms (the upper layer). A module interacts only with its peers in the same layer and with the layers immediately below and above.</p><p class="mt-2"><b>4. Hierarchy.</b> Assemble a small group of modules into a stable, self-contained subsystem with a well-defined interface; assemble a small group of such subsystems into a larger one; repeat. The result is a tree. Each element interacts only with the few others in its own group, which reduces interconnections.</p><p class="mt-2"><b>Why these are not enough.</b> Computer systems differ from other complex systems in two ways. They have <b>no nearby bounds on composition</b>: digital components do not accumulate noise and software has no physical limits, so nothing stops the designer adding more. And the <b>rate of change of technology is unprecedented</b>, so a design can be obsolete by the time it is delivered. It is therefore hard to pick the <i>right</i> modularity, abstraction, layering and hierarchy from the many plausible alternatives.</p><p class="mt-2"><b>Two further techniques.</b> <b>Iteration</b>: begin by building a simple working system that meets only a modest number of requirements, then evolve it in small steps, planning for feedback and studying failures. <b>Keep it simple</b>: the designer must impose limits and weigh the cumulative impact of each new feature.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'oc-cp-definition',
    type: 'mcq',
    prompt: 'Which is the best definition of a system?',
    options: [
      'Any collection of hardware',
      'An interrelated set of components with an identifiable boundary, working together for some purpose',
      'A program that controls other programs',
      'A set of independent parts',
    ],
    answer: 1,
    explanation: 'The three essentials are <b>interrelated components</b>, an <b>identifiable boundary</b> and a <b>purpose</b>. Systems may be natural (the human body, the solar system) or fabricated (a bus, a computer, a government).',
  },
  {
    id: 'oc-cp-interface',
    type: 'mcq',
    prompt: 'For an operating system viewed as a system, the system-call interface is an example of which characteristic?',
    options: ['A constraint', 'A purpose', 'An interface: a point of contact between the system and its environment', 'An output'],
    answer: 2,
    explanation: 'An <b>interface</b> is the point of contact where a system meets its environment, or where subsystems meet each other. Application programs, which are in the operating system’s environment, reach it through system calls.',
  },
  {
    id: 'oc-cp-components',
    type: 'mcq',
    prompt: 'A computer system can be divided into four components. Which list is correct?',
    options: [
      'CPU, memory, disk, network',
      'Hardware, operating system, application programs, users',
      'Kernel, shell, compiler, editor',
      'Input, processing, output, storage',
    ],
    answer: 1,
    explanation:
      '<b>Hardware</b> provides the basic computing resources. The <b>operating system</b> controls and coordinates the use of the hardware among the application programs for the users. <b>Application programs</b> define how the resources are used to solve users’ problems. <b>Users</b> are people, machines or other computers.',
  },
  {
    id: 'oc-cp-kernel',
    type: 'mcq',
    prompt: 'Which of these describes the kernel?',
    options: [
      'Everything a vendor ships when you order an operating system',
      'The one program running at all times on the computer',
      'The program that the user types commands into',
      'The firmware that starts the machine',
    ],
    answer: 1,
    explanation: 'The <b>kernel</b> is the one program running at all times. Everything else is either a system program or an application program. The other common descriptions of an operating system are <b>resource allocator</b> and <b>control program</b>.',
  },
  {
    id: 'oc-cp-escalating',
    type: 'mcq',
    prompt: 'The principle of escalating complexity says that…',
    options: [
      'Complexity grows in proportion to the number of requirements',
      'Adding a requirement increases complexity out of proportion',
      'Complex systems cannot be built',
      'Complexity falls as systems age',
    ],
    answer: 1,
    explanation:
      'Requirements <b>interact</b>. Each new telephone feature (call waiting, call forwarding, caller ID, caller ID blocking, anonymous call rejection…) must be made to work with every existing one, so the number of interactions to consider grows much faster than the number of features.',
  },
  {
    id: 'oc-cp-generality',
    type: 'tf',
    prompt: 'True or false: a good system design should be made as general as possible, so that it meets every conceivable requirement.',
    answer: false,
    explanation:
      '<b>False.</b> Generality, meeting many requirements with a single design, is itself a source of complexity, and the result may not be efficient at anything (a vehicle that is both a car and a boat). Use judgement about how much generality is needed. Corrected: <b>avoid excessive generality</b>; if it is good for everything, it is good for nothing.',
  },
  {
    id: 'oc-cp-mesh',
    type: 'numeric',
    prompt: 'A system has 10 components, and any component may interact with any other. How many possible pairwise interconnections are there?',
    answer: 45,
    hint: 'Each of n components can pair with n − 1 others, and each pair is counted twice.',
    explanation: 'n(n − 1)/2 = 10 × 9 / 2 = <b>45</b>. Doubling the components to 20 gives 190: interconnections grow with the square of the number of components, which is why layering and hierarchy matter.',
  },
  {
    id: 'oc-cp-abstraction',
    type: 'mcq',
    prompt: 'A change inside the file-system module forces changes in the scheduler and the memory manager. Which technique for coping with complexity has failed?',
    options: ['Iteration', 'Abstraction: modules should depend only on each other’s external specifications', 'Scaling', 'Generality'],
    answer: 1,
    explanation:
      'With good <b>abstraction</b> there is little or no <b>propagation of effects</b> from one module to another. A dependence on a module’s internals is a <b>leaky abstraction</b>: it does not perfectly conceal the underlying implementation.',
  },
  {
    id: 'oc-cp-robust',
    type: 'mcq',
    prompt: 'The robustness principle states…',
    options: [
      'Be strict on inputs and tolerant on outputs',
      'Be tolerant of inputs and strict on outputs',
      'Reject every input that is not perfect',
      'Never report errors',
    ],
    answer: 1,
    explanation:
      '<b>Be tolerant of inputs and strict on outputs.</b> A module that accepts slightly out-of-specification inputs but produces outputs well within specification stops small errors from propagating. The related <b>safety-margin principle</b> says to keep track of how far inputs are from the edge of tolerance and report those that are drifting out of range.',
  },
  {
    id: 'oc-cp-iteration',
    type: 'mcq',
    prompt: 'Which describes the iterative approach to building a complex system?',
    options: [
      'Specify every requirement completely, then build the whole system at once',
      'Build a simple working system that meets a modest number of requirements, then evolve it in small steps with feedback',
      'Build each module in isolation and integrate at the end',
      'Add every feature a competitor has',
    ],
    answer: 1,
    explanation:
      'Because it is so hard to choose the right modularity and abstractions in advance, start simple and evolve: <b>take small steps, do not rush, plan for feedback, and study failures</b>. Small steps reduce risk. UNIX itself began as a very small system.',
  },
  {
    id: 'oc-cp-written-os',
    type: 'written',
    marks: 4,
    prompt: 'What is an operating system? Give the two goals it pursues and explain the "resource allocator" and "control program" views.',
    points: [
      'A program (the operating part of the computer) that acts as an intermediary between the user of a computer and the computer hardware, hiding hardware details behind simple services',
      'Goals: make the computer system convenient to use; use the computer hardware in an efficient manner (the two are sometimes contradictory)',
      'Resource allocator: manages all resources (CPU time, memory space, file storage, I/O devices) and decides between conflicting requests for efficient and fair use',
      'Control program: controls the execution of user programs and the operation of I/O devices, to prevent errors and improper use of the computer',
    ],
    modelAnswer:
      '<p>Every tool has a machine part and an operating part; the operating part of a computer is its <b>operating system</b>. It is a program that acts as an <b>intermediary between a user of a computer and the computer hardware</b>, abstracting the hardware in terms of simple services and hiding its details.</p><p class="mt-2"><b>Goals.</b> (1) To make the computer system <b>convenient</b> to use. (2) To use the computer hardware in an <b>efficient</b> manner. The two are sometimes contradictory.</p><p class="mt-2"><b>Resource allocator.</b> From the system’s point of view the operating system manages all the resources, CPU time, memory space, file-storage space and I/O devices, and decides between <b>conflicting requests</b> so that the resources are used efficiently and fairly.</p><p class="mt-2"><b>Control program.</b> It controls the <b>execution of user programs</b> and the operation of I/O devices, to prevent errors and improper use of the computer.</p><p class="mt-2">A third description is the <b>kernel</b>: the one program running at all times on the computer, everything else being a system program or an application program.</p>',
  },
  {
    id: 'oc-cp-written-sources',
    type: 'written',
    marks: 5,
    prompt: 'Explain four sources of complexity in systems, with an example of each.',
    points: [
      'Cascading and interacting requirements: more requirements mean more interactions; adding one increases complexity out of proportion (telephone features)',
      'Generality: meeting many requirements with one design; excessive generality adds complexity and loses efficiency (a vehicle that is both car and boat)',
      'Scaling: a design that works at one size needs new mechanisms at another (insects breathe through skin, large animals need lungs; a toaster controller versus a video game)',
      'Change and age: as the environment changes, requirements change; changes propagate and one bug fix introduces another, so systems accumulate complexity as they age',
      'Maintaining high utilisation: trying to get the most out of a scarce resource increases complexity',
    ],
    modelAnswer:
      '<p>"Complex" means difficult to understand. The main sources are:</p><p class="mt-2"><b>1. Cascading and interacting requirements.</b> The more requirements, the more complexity, because requirements interact. A telephone system with call waiting, call forwarding, call blocking, caller ID and caller ID blocking must define what happens for every combination. The <b>principle of escalating complexity</b>: adding a requirement increases complexity out of proportion.</p><p class="mt-2"><b>2. Generality.</b> Meeting many requirements with a single design, so that it applies in a variety of circumstances. A car with four independent steering wheels, or a vehicle that can be driven on the highway and used as a boat, is more complex and may not be efficient at either job. <b>If it is good for everything, it is good for nothing.</b></p><p class="mt-2"><b>3. Scaling.</b> Small insects absorb oxygen through their skins, but a larger organism’s need grows with its volume, so it must add lungs and blood vessels. A programmer of a 4-bit microprocessor can control a toaster in binary; programmers of video games on 64-bit processors need operating systems, compilers and editors.</p><p class="mt-2"><b>4. Change over time.</b> When the environment changes, requirements change. The original design may lose its relevance, knowledge of old parts disappears, and changes propagate: fixing one bug introduces another. <b>As systems age they accumulate changes and become more complex.</b></p><p class="mt-2"><b>5. Maintaining high utilisation.</b> When a resource is scarce we want its utilisation to be high, and squeezing more out of a limited resource increases complexity. Much of an operating system’s scheduling and memory-management machinery exists for this reason.</p>',
  },
];
