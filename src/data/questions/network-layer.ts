import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  vc: {
    id: 'nl-check-vc',
    type: 'mcq',
    prompt: 'In which kind of network does every packet have to carry the full source and destination addresses?',
    options: ['A virtual-circuit network', 'A datagram network', 'Both', 'Neither: addresses are kept only in routers'],
    answer: 1,
    explanation:
      'In a <b>datagram</b> (connectionless) network each packet is routed independently, so it must carry the full destination address. In a <b>virtual-circuit</b> network the route is chosen once at set-up and stored in router tables; packets then carry only a short connection identifier (label).',
  },
  forwarding: {
    id: 'nl-check-forwarding',
    type: 'mcq',
    prompt: 'Which statement distinguishes routing from forwarding?',
    options: [
      'Routing handles each packet as it arrives; forwarding fills in the tables',
      'Forwarding handles each packet as it arrives by looking up its outgoing line; routing is the process that fills in and updates the tables',
      'They are two names for the same thing',
      'Forwarding is done only by hosts',
    ],
    answer: 1,
    explanation:
      '<b>Forwarding</b> is what a router does when a packet arrives: look up the outgoing line in its table and send the packet. <b>Routing</b> is the process responsible for filling in and updating those tables, and it is where the routing algorithm comes into play.',
  },
  dv: {
    id: 'nl-check-dv',
    type: 'numeric',
    prompt: 'Router J measures its delay to neighbours A, I, H and K as 8, 10, 12 and 6 ms. They advertise delays to destination G of 18, 31, 6 and 31 ms respectively. What delay does J record for G?',
    answer: 18,
    unit: 'ms',
    hint: 'Add J’s delay to each neighbour to what that neighbour claims, and take the minimum.',
    explanation: 'Via A: 8 + 18 = 26. Via I: 10 + 31 = 41. Via H: 12 + 6 = <b>18</b>. Via K: 6 + 31 = 37. The best is 18, so J routes packets for G over the line to H.',
  },
  congestion: {
    id: 'nl-check-congestion',
    type: 'mcq',
    prompt: 'What is the difference between congestion control and flow control?',
    options: [
      'Congestion control is done by the receiver; flow control by routers',
      'Congestion control makes sure the network can carry the offered traffic and involves all hosts and routers; flow control concerns the traffic between one particular sender and one particular receiver',
      'There is none; they are synonyms',
      'Flow control applies only to wireless links',
    ],
    answer: 1,
    explanation:
      '<b>Congestion control</b> is a global issue: making sure the network is able to carry the offered traffic, involving the behaviour of all hosts and routers. <b>Flow control</b> relates to the traffic between a particular sender and a particular receiver, and makes sure a fast sender does not swamp a slow receiver. They are confused because the best remedy for both is often to make a host slow down.',
  },
  bucket: {
    id: 'nl-check-bucket',
    type: 'numeric',
    prompt: 'A token bucket has a capacity of 8 tokens and refills at 3 tokens per tick. It is full when a burst of 20 packets arrives. How many packets are sent in the first tick?',
    answer: 8,
    unit: 'packets',
    explanation: 'A token bucket lets a burst through as long as there are tokens. With <b>8</b> tokens saved, 8 packets go at once. After that the bucket refills at 3 per tick, so the remaining 12 leave at 3 per tick. A leaky bucket with the same rate would have sent only 3 in the first tick.',
  },
  prefix: {
    id: 'nl-check-prefix',
    type: 'numeric',
    prompt: 'How many addresses are there in the block 18.0.31.0/24?',
    answer: 256,
    unit: 'addresses',
    explanation: 'A /24 prefix fixes the top 24 bits as the network portion, leaving 32 − 24 = 8 bits for hosts: 2<sup>8</sup> = <b>256</b> addresses, from 18.0.31.0 to 18.0.31.255.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  leaky: {
    id: 'nl-practice-leaky',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Explain the purpose of the leaky bucket algorithm. What will happen if you do not implement the leaky bucket algorithm?',
    points: [
      'Traffic in data networks is bursty, and bursts are harder for the network to handle than steady traffic because they fill buffers and cause packets to be lost',
      'Purpose: traffic shaping - regulating the average rate and burstiness of a flow as it enters the network, so that it conforms to what was agreed with the provider',
      'Mechanism: packets enter a finite queue (the bucket) and leave at a constant rate R; if the bucket is full, arriving packets are discarded (or queued at the host)',
      'Result: an uneven flow from the host is converted into an even flow into the network, smoothing out bursts',
      'Without it: bursts enter the network unchecked, causing congestion, queue overflow, packet loss and delay at routers',
      'The network also could not guarantee quality of service or do admission control, since it would not know or be able to police what each flow sends',
    ],
    modelAnswer:
      '<p>Traffic in data networks is <b>bursty</b>: it arrives at non-uniform rates as the traffic rate varies, users interact with applications and computers switch between tasks. Bursts are much harder to handle than constant-rate traffic because they can <b>fill buffers and cause packets to be lost</b>.</p><p class="mt-2">The leaky bucket algorithm is a <b>traffic-shaping</b> technique: it regulates the average rate and burstiness of a flow of data entering the network. Imagine a bucket with a small hole in the bottom. However fast water enters, the outflow is at a <b>constant rate R</b> when there is water in the bucket, and zero when it is empty. Once the bucket is full to its capacity B, any additional water spills over and is <b>lost</b>. In the same way each host is connected to the network through an interface containing a finite queue: packets may arrive in bursts, but they are released onto the network at a steady rate, and packets that arrive when the queue is full are queued at the host or discarded. An <b>uneven flow is turned into an even flow</b>, so the traffic conforms to the pattern agreed with the provider in a service-level agreement, and the provider can <b>police</b> it.</p><p class="mt-2"><b>Without it</b>, hosts would inject bursts into the network unchecked. Routers’ queues would overflow, causing <b>congestion</b>, packet loss, retransmissions and long, variable delays for everyone. The network would be unable to make <b>quality-of-service guarantees</b> or decide safely whether to admit a new flow, because it would neither know nor control how much traffic each flow would send.</p>',
  },
  fifo: {
    id: 'nl-practice-fifo',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Explain why the FIFO packet scheduling algorithm fails to provide good service for diverse applications. What is the issue with round-robin fair queueing, and how is it fixed?',
    points: [
      'FIFO: each router buffers packets in one queue per output line and sends them in the order they arrived; when the queue is full, new arrivals are dropped (tail drop)',
      'FIFO gives no isolation: an aggressive flow that sends more packets gets more of the bandwidth and delays or starves the other flows',
      'So FIFO cannot give applications with different needs (interactive, real-time, bulk) the delay, jitter or bandwidth each requires',
      'Fair queueing: a separate queue per flow, scanned round robin, one packet from each in turn, so a flow that sends more only lengthens its own queue',
      'Issue with packet-by-packet round robin: it gives more bandwidth to flows that use large packets than to flows that use small packets',
      'Fix: simulate byte-by-byte round robin by computing a virtual finish time for each packet and sending packets in order of finish time; weights give weighted fair queueing',
    ],
    modelAnswer:
      '<p><b>FIFO.</b> With first-in first-out (first-come first-served) scheduling, each router buffers packets in a single queue for each output line and sends them in the order they arrived. When the queue is full, newly arriving packets are dropped (tail drop). It is simple, but it is <b>not suited to providing good quality of service when there are multiple flows</b>. One flow can easily affect the performance of the others: if the first flow is aggressive and sends large bursts, they lodge in the queue, and processing packets in arrival order means the aggressive sender <b>hogs most of the capacity</b> of the routers its packets traverse, starving the other flows. Diverse applications need different things: a telephone call needs low delay and jitter, a file transfer needs throughput. FIFO treats all packets alike and <b>provides no isolation between flows</b>.</p><p class="mt-2"><b>Fair queueing.</b> Routers keep a <b>separate queue for each flow</b> for a given output line. When the line becomes idle the router scans the queues <b>round robin</b> and takes the first packet from the next queue. With n hosts competing, each gets to send one out of every n packets, so sending more packets does not improve a flow’s share.</p><p class="mt-2"><b>The issue.</b> This gives <b>more bandwidth to hosts that use large packets</b> than to hosts that use small packets, because fairness is counted in packets, not bytes.</p><p class="mt-2"><b>The fix.</b> Simulate a <b>byte-by-byte round robin</b>. Compute for each packet a virtual time, the number of the round at which it would <i>finish</i> being sent: F<sub>i</sub> = max(A<sub>i</sub>, F<sub>i−1</sub>) + L<sub>i</sub>. Packets are then sorted in order of their finish times and sent in that order. Giving flows weights W, so that F<sub>i</sub> = max(A<sub>i</sub>, F<sub>i−1</sub>) + L<sub>i</sub>/W, yields <b>weighted fair queueing</b>, in which some flows deliberately receive a larger share.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'nl-cp-dv',
    type: 'mcq',
    pastPaper: true,
    prompt: 'Distance vector routing is used. Router C has just received these vectors of delays to (A, B, C, D, E, F): from B (5, 0, 8, 12, 6, 2); from D (16, 12, 6, 0, 9, 10); from E (7, 6, 3, 9, 0, 4). The measured delays from C to B, D and E are 6, 3 and 5. What is C’s new delay vector?',
    options: ['(11, 6, 0, 3, 5, 8)', '(5, 0, 8, 12, 6, 2)', '(12, 11, 0, 3, 5, 9)', '(11, 6, 0, 12, 5, 8)'],
    answer: 0,
    hint: 'For each destination, add the link delay to what each neighbour advertises and take the minimum. Check D and E carefully: the direct line may win.',
    explanation:
      'Via B add 6: (11, 6, 14, 18, 12, 8). Via D add 3: (19, 15, 9, 3, 12, 13). Via E add 5: (12, 11, 8, 14, 5, 9). Taking the minimum for each destination gives <b>(11, 6, 0, 3, 5, 8)</b>, with outgoing lines (B, B, –, D, E, B). You can step through this in the simulator.',
  },
  {
    id: 'nl-cp-flooding',
    type: 'multi',
    prompt: 'Which statements about flooding are correct?',
    options: [
      'It always finds the shortest path, because it tries every path in parallel',
      'It generates vast numbers of duplicate packets unless damped by a hop counter or by tracking which packets have been seen',
      'It requires routers to know the complete network topology',
      'It is extremely robust: if any path to the destination exists, flooding will find it',
    ],
    answers: [0, 1, 3],
    explanation:
      'Flooding sends each incoming packet out on every line except the one it arrived on. It needs <b>no knowledge of the topology</b> beyond a router’s own neighbours. It is not practical for ordinary traffic because of the duplicates, but it is tremendously robust, delivers with the shortest possible delay, and is used as a yardstick for other algorithms and for spreading routing information.',
  },
  {
    id: 'nl-cp-linkstate',
    type: 'mcq',
    prompt: 'What does each router send out in link state routing?',
    options: [
      'Its entire routing table, to its immediate neighbours only',
      'A packet describing the cost to each of its own neighbours, flooded to all routers',
      'Nothing: a central server computes all routes',
      'The complete topology of the network, to its neighbours only',
    ],
    answer: 1,
    explanation:
      'A link state router discovers its neighbours, sets the cost to each, builds a <b>link state packet</b> containing just that information, and <b>floods it to all other routers</b>. Every router then has the complete topology and runs Dijkstra’s algorithm locally. Distance vector does the opposite: it tells only its neighbours, but tells them about everything.',
  },
  {
    id: 'nl-cp-shortest',
    type: 'numeric',
    prompt: 'In a network, the links and their costs are A–B 2, A–G 6, B–C 7, B–E 2, C–D 3, C–F 3, D–H 2, E–F 2, E–G 1, F–H 2, G–H 4. What is the cost of the shortest path from A to D?',
    answer: 10,
    hint: 'Run Dijkstra from A: make permanent the node with the smallest tentative distance, relabel its neighbours, repeat.',
    explanation: 'The shortest path is A → B → E → F → H → D with cost 2 + 2 + 2 + 2 + 2 = <b>10</b>. The path through C (A–B–C–D) costs 12, and A–G–H–D costs 12 as well.',
  },
  {
    id: 'nl-cp-shedding',
    type: 'mcq',
    prompt: 'A congested router must discard packets. For which kind of traffic is it better to drop a <b>new</b> packet and keep the old ones?',
    options: ['Real-time video', 'A file transfer', 'A telephone call', 'It never matters which packet is dropped'],
    answer: 1,
    explanation:
      'For a <b>file transfer</b>, an old packet is worth more than a new one: dropping an old packet may force the receiver to buffer or the sender to retransmit everything after it. This is the "wine" policy (old is better than new). For <b>real-time media</b> a new packet is worth more than an old one, because a late packet is useless: the "milk" policy.',
  },
  {
    id: 'nl-cp-red',
    type: 'mcq',
    prompt: 'How does random early detection (RED) help with congestion?',
    options: [
      'It encrypts packets so that fewer are retransmitted',
      'Routers drop a small fraction of packets at random when the average queue length exceeds a threshold, before the queue is actually full, so that senders slow down early',
      'It reserves bandwidth for each flow in advance',
      'It sends every packet twice',
    ],
    answer: 1,
    explanation:
      'With RED, routers maintain a running <b>average of their queue lengths</b>. When the average on a line exceeds a threshold, the line is said to be congested and a small fraction of packets is <b>dropped at random</b>. Fast senders are more likely to lose a packet; they notice the loss (no acknowledgement) and slow down, before the queue overflows and everyone loses packets.',
  },
  {
    id: 'nl-cp-qos',
    type: 'mcq',
    prompt: 'Which application has the most stringent requirements on delay and jitter but can tolerate some packet loss?',
    options: ['E-mail', 'File sharing', 'Videoconferencing', 'Web access'],
    answer: 2,
    explanation:
      '<b>Videoconferencing</b> (like telephony) is interactive and real-time: it is strictly sensitive to delay and to jitter, but people do not notice a short pause or a skipped frame, so some loss is acceptable. E-mail, file sharing and web access are the reverse: they tolerate delay and jitter but need every bit delivered correctly.',
  },
  {
    id: 'nl-cp-subnet',
    type: 'numeric',
    prompt: 'A host has the address 192.168.1.100 with a /27 prefix. How many usable host addresses does its subnet have?',
    answer: 30,
    unit: 'hosts',
    hint: 'How many bits are left for the host part? Two addresses in every subnet are reserved.',
    explanation: 'A /27 leaves 32 − 27 = 5 host bits, so the block has 2<sup>5</sup> = 32 addresses (192.168.1.96 to 192.168.1.127). The first is the network address and the last is the broadcast address, leaving <b>30</b> for hosts.',
  },
  {
    id: 'nl-cp-compare',
    type: 'written',
    marks: 6,
    prompt: 'Compare virtual-circuit and datagram networks with respect to circuit set-up, addressing, state information, routing, the effect of router failures, and quality of service.',
    points: [
      'Set-up: datagrams need none; a virtual circuit must be established before data is sent',
      'Addressing: each datagram carries the full source and destination address; a VC packet carries only a short VC number',
      'State: datagram routers hold no state about connections; VC routers need table space for every connection',
      'Routing: each datagram is routed independently; with VCs the route is chosen at set-up and all packets follow it',
      'Router failure: datagrams lose only the packets in the crashed router; all VCs passing through a failed router are terminated',
      'Quality of service and congestion control: difficult with datagrams; easy with VCs if enough resources can be allocated in advance for each circuit',
    ],
    modelAnswer:
      '<table class="mt-1 w-full text-left text-xs"><thead><tr class="border-b"><th class="py-1 pr-2">Issue</th><th class="py-1 pr-2">Datagram network</th><th class="py-1">Virtual-circuit network</th></tr></thead><tbody><tr class="border-b"><td class="py-1 pr-2 font-medium">Circuit set-up</td><td class="py-1 pr-2">Not needed</td><td class="py-1">Required</td></tr><tr class="border-b"><td class="py-1 pr-2 font-medium">Addressing</td><td class="py-1 pr-2">Each packet contains the full source and destination address</td><td class="py-1">Each packet contains a short VC number</td></tr><tr class="border-b"><td class="py-1 pr-2 font-medium">State information</td><td class="py-1 pr-2">Routers do not hold state about connections</td><td class="py-1">Each VC requires router table space per connection</td></tr><tr class="border-b"><td class="py-1 pr-2 font-medium">Routing</td><td class="py-1 pr-2">Each packet is routed independently</td><td class="py-1">Route chosen when the VC is set up; all packets follow it</td></tr><tr class="border-b"><td class="py-1 pr-2 font-medium">Effect of router failures</td><td class="py-1 pr-2">None, except for packets lost during the crash</td><td class="py-1">All VCs that passed through the failed router are terminated</td></tr><tr class="border-b"><td class="py-1 pr-2 font-medium">Quality of service</td><td class="py-1 pr-2">Difficult</td><td class="py-1">Easy if enough resources can be allocated in advance for each VC</td></tr><tr><td class="py-1 pr-2 font-medium">Congestion control</td><td class="py-1 pr-2">Difficult</td><td class="py-1">Easy if enough resources can be allocated in advance for each VC</td></tr></tbody></table><p class="mt-2">In short, datagrams trade per-packet overhead (full addresses, a routing decision each time) for robustness and simplicity; virtual circuits trade set-up time and router state for cheaper forwarding and the ability to reserve resources. The Internet’s IP is a datagram service; MPLS adds virtual-circuit-like label switching on top of it.</p>',
  },
  {
    id: 'nl-cp-qos-admission',
    type: 'written',
    pastPaper: true,
    marks: 3,
    prompt: 'Briefly explain the importance of "quality of service" and "admission control".',
    points: [
      'Quality of service: some applications, especially multimedia, need stronger performance guarantees than best-effort delivery - on bandwidth, delay, jitter and loss',
      'Admission control: a new flow or virtual circuit is accepted only if the network has the capacity to carry it without degrading the guarantees already given; otherwise it is refused',
      'Together they let a network honour performance guarantees at the cost of turning down some requests, rather than over-provisioning or letting every flow suffer',
    ],
    modelAnswer:
      '<p><b>Quality of service (QoS).</b> Making the network perform well on average is not enough for some applications. Multimedia applications in particular need a minimum throughput and a maximum latency to work. QoS is the set of mechanisms by which a network gives a flow guarantees on <b>bandwidth, delay, jitter and loss</b>, matched to what the application needs (a telephone call needs low delay and jitter, a file transfer needs no loss). The alternative, over-provisioning, costs a great deal of money.</p><p class="mt-2"><b>Admission control.</b> A guarantee is only meaningful if the network does not accept more traffic than it can carry. With admission control, the user offers a flow with a described traffic pattern and a QoS requirement, and the network decides, based on its capacity and its existing commitments, whether to <b>accept or reject</b> it. A new virtual circuit is not set up unless the network can carry the added traffic without becoming congested, in the same way that the telephone system gives a busy signal rather than degrade the calls in progress.</p><p class="mt-2">With these mechanisms the network can <b>honour performance guarantees, at the cost of turning down some requests</b>.</p>',
  },
];
