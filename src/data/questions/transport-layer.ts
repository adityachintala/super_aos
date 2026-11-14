import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  why: {
    id: 'tl-check-why',
    type: 'mcq',
    prompt: 'The transport service looks a lot like the network service. Why is it a separate layer?',
    options: [
      'Because the network layer cannot carry data',
      'Because the transport layer runs entirely on the users’ machines, so users can add reliability to a network they do not control',
      'Because routers need the transport layer to forward packets',
      'Because the transport layer is faster',
    ],
    answer: 1,
    explanation:
      'The network layer runs mostly on <b>routers operated by the carrier</b>. Users have no control over it: they cannot fix poor service by using better routers. The transport code runs entirely on the <b>users’ own machines</b>, so it is the only place where they can put a layer that detects lost packets and retransmits, making the service more reliable than the network beneath.',
  },
  port: {
    id: 'tl-check-port',
    type: 'mcq',
    prompt: 'A host has one IP address but runs a web server, a mail server and several client programs. How does an arriving segment reach the right process?',
    options: ['By its IP address alone', 'By the port number (TSAP) in the transport header', 'By the Ethernet address', 'The operating system guesses from the contents'],
    answer: 1,
    explanation:
      'The IP address (an NSAP) identifies the <b>host</b>. The <b>port</b>, the transport service access point, identifies a particular <b>process</b> on it. Many transport endpoints can share one network address, which is why a connection is identified by the pair of sockets (IP address and port) at its two ends.',
  },
  handshake: {
    id: 'tl-check-handshake',
    type: 'mcq',
    prompt: 'An old, delayed duplicate of a CONNECTION REQUEST arrives at host 2 out of nowhere. Host 2 replies with an acknowledgement. Under the three-way handshake, what does host 1 do?',
    options: [
      'Accepts the connection, creating a duplicate connection',
      'Rejects it, because it knows it did not ask for a connection with that sequence number',
      'Ignores it and waits for a timeout',
      'Sends its data again',
    ],
    answer: 1,
    explanation:
      'Host 2 cannot tell that the request is a stale duplicate, so it answers with an ACK that echoes the sequence number x from the request and proposes its own, y. But host 1 knows it is <b>not</b> trying to open a connection with sequence number x, so it sends a <b>REJECT</b>. Host 2 realises it was tricked and abandons the connection. A delayed duplicate does no damage.',
  },
  twoArmy: {
    id: 'tl-check-twoarmy',
    type: 'tf',
    prompt: 'True or false: with enough rounds of acknowledgement (a four-way or five-way handshake), two hosts can be made certain that both agree to release a connection, even over a network that may lose messages.',
    answer: false,
    explanation:
      'False. This is the <b>two-army problem</b>. Whoever sends the <i>last</i> message can never know whether it arrived, and adding another round only moves the doubt to the new last message. No protocol works. In practice TCP settles for <b>timers</b>: if no response to a FIN arrives within two maximum packet lifetimes, the sender releases the connection anyway.',
  },
  slowstart: {
    id: 'tl-check-slowstart',
    type: 'numeric',
    prompt: 'A TCP connection starts with a congestion window of 1 segment and a slow-start threshold of 32. With no losses, what is the congestion window after 7 round-trip times (that is, at the start of the eighth round)?',
    answer: 34,
    unit: 'segments',
    hint: 'The window doubles each round until it reaches the threshold, then grows by one per round.',
    explanation: 'Rounds give 1, 2, 4, 8, 16, 32 (threshold reached after 5 round trips), then additive increase: 33 after six and <b>34</b> after seven.',
  },
  rto: {
    id: 'tl-check-rto',
    type: 'numeric',
    prompt: 'A TCP sender has SRTT = 100 ms and RTTVAR = 5 ms. What retransmission timeout does it use?',
    answer: 120,
    unit: 'ms',
    explanation: 'RTO = SRTT + 4 × RTTVAR = 100 + 4 × 5 = <b>120 ms</b>. The factor of four on the variation keeps spurious retransmissions rare while reacting quickly to real losses.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  window: {
    id: 'tl-practice-window',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Explain the reason why transport protocols use larger sliding windows compared with data link protocols, and how the buffering is managed.',
    points: [
      'A data link protocol runs over a single wire between two adjacent machines; a transport protocol runs across the entire network, through many routers',
      'The end-to-end path has a much larger bandwidth-delay product, so many more segments are in flight and unacknowledged at once; a small window would leave the path idle',
      'The sender must buffer every unacknowledged segment, and a host has many connections, so a substantial amount of buffer space is needed',
      'The receiver may not dedicate buffers per connection in advance; it may buffer dynamically or drop a segment if no buffer is free',
      'So buffering is decoupled from acknowledgements: the receiver advertises a variable-sized window (how many buffers it currently has), and the sender’s limit is the ACK plus that window',
      'Buffers can be organised as chained fixed-size buffers, chained variable-size buffers or one large circular buffer per connection; and the transport checksum protects the segment end to end, not just a frame on one hop',
    ],
    modelAnswer:
      '<p>The mechanisms are the same in both layers: checksums, sequence numbers, retransmission (ARQ) and a sliding window. The <b>environment</b> differs. A data link protocol operates over a <b>direct connection</b> between two adjacent machines, while a transport protocol operates over the <b>entire network</b>, where delays are longer and more variable, more failures occur, and a host handles a large number of connections at once.</p><p class="mt-2">For a wireless or short wired link the bandwidth-delay product is small, and a window of a few frames, even one, is enough. An end-to-end path can have a <b>large bandwidth-delay product</b>: many segments are in transit and unacknowledged at any moment. To use the path fully the transport layer therefore needs a <b>much larger sliding window</b>.</p><p class="mt-2">A large window has a cost. The <b>sender must buffer</b> all transmitted but unacknowledged segments, because they may have to be retransmitted. The <b>receiver</b> may or may not dedicate buffers to each connection; with many connections it often cannot, so it buffers from a shared pool and may have to discard a segment if no buffer is free, relying on the sender to retransmit.</p><p class="mt-2">This leads to <b>dynamic buffer allocation</b>. Buffering is <b>decoupled from acknowledgements</b>: the receiver tells the sender how many buffers it has available by advertising a <b>variable-sized window</b>, and the sender may send only up to the acknowledged byte plus that window. The buffer pool can be organised as <b>chained fixed-size buffers</b>, <b>chained variable-sized buffers</b>, or <b>one large circular buffer per connection</b>, each trading simplicity against efficient use of memory. Finally, the transport checksum protects a <b>segment</b> across the whole path, whereas a link-layer checksum protects only a frame on one hop.</p>',
  },
  nagle: {
    id: 'tl-practice-nagle',
    type: 'written',
    marks: 5,
    prompt: 'What problem do Nagle’s algorithm and Clark’s solution to the silly window syndrome each address, and how?',
    points: [
      'Problem 1: an interactive application sends one byte at a time, so each character creates a 21-byte segment in a 41-byte IP datagram, followed by acknowledgements and window updates',
      'Nagle (sender side): send the first piece of data and buffer the rest until it is acknowledged, then send all the buffered data in one segment',
      'Nagle is widely used but is unsuitable for some applications such as interactive games, and it can interact badly with delayed acknowledgements',
      'Problem 2 (silly window syndrome): data arrives in large blocks but the receiving application reads one byte at a time, so the receiver keeps advertising a window of one byte',
      'Clark (receiver side): do not send a window update for one byte; wait until a decent amount of space is available (a full segment or half the buffer) and advertise that',
    ],
    modelAnswer:
      '<p>Senders are not required to transmit data the moment it arrives from the application, and receivers are not required to send acknowledgements as soon as possible. Both freedoms are used to improve performance.</p><p class="mt-2"><b>The small-packet problem.</b> In a remote-login session each keystroke may produce a 21-byte TCP segment in a 41-byte IP datagram. The receiver immediately sends a 40-byte acknowledgement, then a 40-byte window update when the application reads the byte, and then the echo. In all, <b>162 bytes of bandwidth and four segments for each character typed</b>. <b>Delayed acknowledgements</b> (holding an ACK for up to 500 ms in the hope of piggybacking it on data) reduce the receiver’s share, but a sender that sends many short packets is still inefficient.</p><p class="mt-2"><b>Nagle’s algorithm</b> fixes the sender. When data comes in a little at a time, <b>send the first piece and buffer all the rest until the first piece is acknowledged</b>; then send all the buffered data in one segment and start buffering again. It is widely used, but it should be disabled for applications such as interactive games that need a rapid stream of short packets.</p><p class="mt-2"><b>Silly window syndrome</b> is the mirror image. Data is passed to the sending TCP in large blocks, but the application on the receiving side reads <b>one byte at a time</b>. The buffer fills, the application reads a byte, and the receiver advertises a window of one byte, so the sender sends a one-byte segment, and so on for ever.</p><p class="mt-2"><b>Clark’s solution</b> fixes the receiver: do <b>not send a window update for a single byte</b>. Wait until a decent amount of space is available, the maximum segment size advertised at connection set-up or half the buffer, whichever is smaller, and advertise that. Nagle’s algorithm and Clark’s solution are complementary: the sender avoids sending small segments and the receiver avoids asking for them.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'tl-cp-primitives',
    type: 'mcq',
    prompt: 'Which Berkeley socket primitive does a server call to block until a client’s connection request arrives and then obtain a connected socket?',
    options: ['BIND', 'LISTEN', 'ACCEPT', 'CONNECT'],
    answer: 2,
    explanation:
      'A server calls SOCKET to create an endpoint, BIND to give it a local address, LISTEN to announce willingness to accept connections and set the queue size, and then <b>ACCEPT</b> to passively establish an incoming connection. The client calls CONNECT, the active side.',
  },
  {
    id: 'tl-cp-udp',
    type: 'multi',
    prompt: 'Which statements about UDP are correct?',
    options: [
      'It is connectionless: segments are sent without setting up a connection',
      'It retransmits lost segments automatically',
      'Its header contains source and destination ports, a length and a checksum',
      'It is a suitable transport for remote procedure calls and real-time media',
    ],
    answers: [0, 2, 3],
    explanation:
      'UDP is a thin layer over IP: it adds <b>ports</b> for demultiplexing to processes, a length and an optional end-to-end checksum, and nothing else. It does <b>no</b> flow control, congestion control or retransmission; those are left to the application. That makes it right for short request-reply exchanges (RPC, DNS) and for real-time media carried by RTP.',
  },
  {
    id: 'tl-cp-handshake',
    type: 'mcq',
    prompt: 'In the three-way handshake, why does each side choose its own fresh initial sequence number and have it acknowledged by the other?',
    options: [
      'To make the connection faster',
      'So that delayed duplicate segments from an earlier connection cannot be mistaken for part of the new one',
      'To agree on the maximum segment size',
      'Because sequence numbers must always start at zero',
    ],
    answer: 1,
    explanation:
      'There is no state left over from a previous connection, so neither side can tell by itself whether an arriving connection request is new or a <b>delayed duplicate</b>. Each side contributes a fresh sequence number and requires the other to echo it. A stale request or acknowledgement carries numbers the other side does not recognise, and is rejected.',
  },
  {
    id: 'tl-cp-aimd',
    type: 'mcq',
    prompt: 'Why does TCP use additive increase with multiplicative decrease, rather than additive increase with additive decrease?',
    options: [
      'Because it uses the link more aggressively',
      'Because it is the combination that converges to an allocation that is both efficient and fair, whatever the starting point',
      'Because multiplication is cheaper to compute',
      'Because it avoids the need for acknowledgements',
    ],
    answer: 1,
    explanation:
      'If two flows both add and subtract the same amounts, the difference between their rates never changes; if both multiply, the ratio never changes. With <b>AIMD</b>, each multiplicative decrease shrinks the gap in proportion while additive increase preserves it, so the operating point moves steadily towards the <b>fair and efficient</b> point.',
  },
  {
    id: 'tl-cp-reno',
    type: 'numeric',
    prompt: 'A TCP Reno sender has a congestion window of 40 segments when it receives three duplicate ACKs. What is its congestion window immediately after fast recovery?',
    answer: 20,
    unit: 'segments',
    explanation: 'The slow-start threshold is set to half the current window, 20, and with fast recovery the window is set to that threshold: <b>20</b>. Additive increase continues from there. TCP Tahoe would instead have restarted slow start from 1 segment.',
  },
  {
    id: 'tl-cp-timeout',
    type: 'numeric',
    prompt: 'A TCP Reno sender with a congestion window of 24 segments suffers a retransmission <b>timeout</b>. To what value is the congestion window set?',
    answer: 1,
    unit: 'segment',
    explanation: 'A timeout means the ACK clock has stopped, so the sender cannot keep pacing itself. The threshold becomes 12 and the window restarts at <b>1</b> segment with slow start. Only a loss signalled by duplicate ACKs gets the gentler fast-recovery treatment.',
  },
  {
    id: 'tl-cp-maxmin',
    type: 'numeric',
    prompt: 'Three flows share a 12 Mbps bottleneck link. They would like 2, 8 and 8 Mbps. With max-min fairness, how much does each of the two large flows receive, in Mbps?',
    answer: 5,
    unit: 'Mbps',
    hint: 'First satisfy any flow that wants less than an equal share, then divide what is left.',
    explanation: 'An equal share would be 4 Mbps each. The first flow wants only 2, so it gets 2. The remaining 10 Mbps is split equally between the other two: <b>5 Mbps</b> each.',
  },
  {
    id: 'tl-cp-window',
    type: 'mcq',
    prompt: 'A TCP receiver advertises WIN = 0. What must the sender do, and how is deadlock avoided if the later window update is lost?',
    options: [
      'Keep sending; the receiver will discard the data',
      'Stop sending; a persistence timer makes it send a window probe so that the receiver re-announces its window',
      'Close the connection',
      'Stop sending and wait indefinitely for an update',
    ],
    answer: 1,
    explanation:
      'A window of zero tells the sender to <b>stop</b>. If the receiver later reopens the window but that segment is lost, both sides would wait for ever. So the sender runs a <b>persistence timer</b>; when it expires the sender sends a small <b>window probe</b>, and the reply carries the current window size.',
  },
  {
    id: 'tl-cp-establish',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'What are the issues in implementing "connection establishment" in a transport protocol? Explain the justification for employing a three-way handshake.',
    points: [
      'The network can lose, corrupt, delay and duplicate packets, so simply sending a CONNECTION REQUEST and waiting for an ACCEPT is not enough',
      'The key issue is delayed duplicates: an old copy of a request (or data) may emerge from the network long after the original, and must not be treated as new',
      'Packet lifetime is bounded (restricted network design, hop counter, or timestamps) so that after a time T all old packets and their acknowledgements are dead',
      'Sequence numbers are not reused within that lifetime (a clock-based scheme, with the forbidden region), but the two sides still have no shared memory of earlier connections',
      'Three-way handshake: host 1 sends CR with sequence number x; host 2 replies ACK with its own number y, acknowledging x; host 1 acknowledges y, possibly with the first data',
      'Justification: each side picks a fresh number and has it echoed, so a duplicate CR is answered but then rejected by host 1, and a duplicate CR plus a duplicate ACK is rejected because it acknowledges the wrong number',
    ],
    modelAnswer:
      '<p>Establishing a connection sounds easy: one transport entity sends a CONNECTION REQUEST and waits for a CONNECTION ACCEPTED reply. The problem is that the network can <b>lose, delay, corrupt and duplicate packets</b>.</p><p class="mt-2"><b>The key issue is delayed duplicates.</b> A user sends packets, they take a long, congested route, the user’s timer expires and the packets are sent again. The receiver may then get both the old and the new copies, possibly long after the original connection has closed. A duplicated connection request and data could, for instance, make a bank transfer the same money twice.</p><p class="mt-2">Approaches: first <b>bound the packet lifetime</b>, by a restricted network design that prevents looping, a <b>hop counter</b> in each packet, or <b>timestamps</b>, so that after a maximum segment lifetime T all old packets, and all acknowledgements to them, are dead. Then make sure that <b>sequence numbers are not reused within that time</b> (in practice within 2T = 240 s), using a time-of-day clock to choose initial sequence numbers and keeping out of the "forbidden region". Even so, the two hosts <b>remember nothing</b> about previous connections, so the receiver has no way to tell whether an incoming request is fresh.</p><p class="mt-2"><b>The three-way handshake</b> solves this. (1) Host 1 chooses a sequence number x and sends CR(seq = x). (2) Host 2 replies ACK(seq = y, ack = x), acknowledging x and announcing its own initial number y. (3) Host 1 acknowledges y in the first data segment it sends.</p><p class="mt-2"><b>Justification.</b> Since there is no state from a previous connection, <b>both hosts contribute fresh sequence numbers and each must hear its own echoed back</b>. If an <b>old duplicate CR</b> arrives, host 2 answers it, but host 1 knows it never asked for a connection with that number and sends a REJECT, so no connection results. If an old <b>duplicate CR and an old duplicate ACK/DATA</b> both appear, host 2 has proposed y, but the stale segment acknowledges some other number z, so host 2 recognises it as old and rejects it. There is no combination of old segments that can cause the protocol to fail and establish a connection by accident.</p>',
  },
  {
    id: 'tl-cp-regulate',
    type: 'written',
    pastPaper: true,
    marks: 6,
    prompt: 'Explain the issue of regulating the sending rates to obtain a desirable bandwidth allocation while controlling congestion. What is Additive Increase Multiplicative Decrease (AIMD)?',
    points: [
      'A desirable allocation is efficient (uses the available capacity without congestion), fair (for example max-min fair across flows) and converges quickly when traffic changes',
      'The sending rate may be limited by flow control (a slow receiver) or by congestion (a slow network); the sender must obey the smaller limit',
      'The sender learns of congestion from a signal: explicit (ECN, rate feedback) or implicit (packet loss, delay). Often the signal says only "slow down", not by how much',
      'If flows adjust additively in both directions the gap between them never closes, and if multiplicatively in both directions the ratio never changes, so they do not converge to a fair allocation',
      'AIMD: with no congestion signal, increase the rate additively (by a fixed amount); on a congestion signal, decrease it multiplicatively (for example halve it)',
      'AIMD converges to the efficient and fair operating point from any starting point, which is why TCP uses it (implemented through the congestion window)',
    ],
    modelAnswer:
      '<p><b>What is wanted.</b> A good congestion-control algorithm finds an allocation of bandwidth to transport entities that is <b>efficient</b> (it uses all the available capacity but avoids congestion; goodput collapses and delay rises sharply if the offered load approaches capacity), <b>fair</b> across competing flows (the usual notion is <b>max-min fairness</b>: the bandwidth given to one flow cannot be increased without decreasing that of a flow with an allocation no larger), and that <b>converges quickly</b> as flows come and go.</p><p class="mt-2"><b>Regulating the rate.</b> A sender may have to slow down for two reasons: <b>flow control</b>, when the receiver has insufficient buffering, and <b>congestion</b>, when the network has insufficient capacity. It must respect whichever limit is smaller. How it learns about congestion depends on the <b>signal</b> the network provides. This may be <b>explicit</b> (routers tell the sender its rate, or mark packets with ECN) or <b>implicit</b> (packet loss, or rising delay). Frequently the signal tells senders only to slow down, <b>not by how much</b>.</p><p class="mt-2"><b>The difficulty.</b> Consider two flows on one link, each raising its rate when the network is free and lowering it when it is busy. If both <b>add and subtract</b> the same amount, the operating point just oscillates along a 45° line: the difference between the flows never changes, so an unfair split stays unfair. If both <b>multiply</b> up and down, it oscillates along a line through the origin: the ratio never changes. Neither converges to the fair point.</p><p class="mt-2"><b>AIMD.</b> The <b>Additive Increase Multiplicative Decrease</b> control law is: in the <b>absence</b> of a congestion signal, senders <b>increase</b> their rates <b>additively</b>, by a fixed amount; in the <b>presence</b> of a congestion signal, they <b>decrease</b> them <b>multiplicatively</b>, for example by half. A multiplicative cut reduces the larger flow by more, pulling the two closer, and the additive climb keeps them close. The path therefore <b>converges to the optimal point, both fair and efficient, whatever the starting point</b>. By the same argument it is the only combination of the four that does. TCP uses AIMD for this reason, implemented by adjusting its congestion window: the result is the familiar sawtooth.</p>',
  },
];
