import type { Question } from '../../lib/questions';

/** Quick checks placed inside the lesson text. */
export const checks = {
  peers: {
    id: 'dl-check-peers',
    type: 'mcq',
    prompt: 'In a layered network architecture, what is a <b>protocol</b>?',
    options: [
      'The set of operations a layer offers to the layer above it',
      'The rules by which a layer talks to its peer layer on another machine',
      'The physical cable connecting two machines',
      'A header added by the application',
    ],
    answer: 1,
    explanation:
      'A <b>service</b> is what a layer provides to the layer above (vertical). A <b>protocol</b> is the set of rules governing the exchange between <b>peer</b> entities in the same layer on different machines (horizontal). A layer may change its protocol freely as long as the service it offers stays the same.',
  },
  layerK: {
    id: 'dl-check-layerk',
    type: 'mcq',
    pastPaper: true,
    prompt: 'Suppose the <b>service</b> provided by layer k changes. Which layers are affected?',
    options: [
      'Layer k − 1 only',
      'Layer k + 1, which uses that service; layer k − 1 is not affected',
      'Both layer k − 1 and layer k + 1',
      'No other layer',
    ],
    answer: 1,
    explanation:
      'A layer uses only the services of the layer directly below it. Layer k − 1 knows nothing about the service that k offers, so it is <b>unaffected</b>. Layer <b>k + 1</b> is built on that service and may have to be re-implemented. (If only the <i>implementation</i> or protocol of layer k changed while its service stayed the same, no other layer would be affected at all.)',
  },
  stuffing: {
    id: 'dl-check-stuffing',
    type: 'mcq',
    prompt: 'A link uses the flag 01111110 and bit stuffing. The data to send is 0111110111111. What is transmitted between the flags?',
    options: ['0111110111111', '011111001111101', '01111100111111', '011111011111010'],
    answer: 1,
    hint: 'Insert a 0 after every run of five consecutive 1s, including a run that happens to be followed by a 0 already.',
    explanation:
      'Scan left to right: after the first five 1s (01111<b>1</b>) insert a 0, giving 0111110 then the original 0, then 11111 reaches five again, so insert another 0, then the last 1: <b>011111001111101</b>. The receiver deletes each 0 that follows five 1s.',
  },
  seq: {
    id: 'dl-check-seq',
    type: 'mcq',
    prompt: 'In stop-and-wait ARQ, why must frames carry a sequence number at all, if only one frame is outstanding at a time?',
    options: [
      'To let the receiver reorder frames that arrive out of order',
      'So the receiver can tell a retransmitted frame from a new one when an acknowledgement was lost',
      'To detect bit errors inside the frame',
      'To tell the sender how big the receiver’s buffer is',
    ],
    answer: 1,
    explanation:
      'If the <b>acknowledgement</b> is lost, the sender times out and sends the same frame again. Without a number the receiver would accept the duplicate as new data. One bit (two sequence numbers) is enough for stop-and-wait: the receiver only has to distinguish "the frame I expect" from "the one I already have".',
  },
  window: {
    id: 'dl-check-window',
    type: 'numeric',
    prompt: 'A 1 Mbps link has a one-way propagation delay of 50 ms and carries 1,000-bit frames. What window size keeps the link fully utilised (w = 2BD + 1)?',
    answer: 101,
    unit: 'frames',
    hint: 'BD is the bandwidth-delay product measured in frames: how many frames fit "in flight" one way.',
    explanation: 'In 50 ms the link carries 1,000,000 × 0.05 = 50,000 bits, which is BD = 50 frames. So w = 2 × 50 + 1 = <b>101</b>. Stop-and-wait (w = 1) would use under 1% of this link.',
  },
  collision: {
    id: 'dl-check-collision',
    type: 'mcq',
    prompt: 'Five computers are plugged into a hub, and that hub is plugged into one port of a switch. How many collision domains are there on that switch port?',
    options: ['Five', 'One', 'None', 'It depends on the frame size'],
    answer: 1,
    explanation:
      'A <b>hub</b> joins its lines electrically: a frame arriving on any line is sent to all the others, and two frames arriving together collide. The whole hub is <b>one collision domain</b>. A switch (or bridge) is different: each of its ports is a separate collision domain.',
  },
} satisfies Record<string, Question>;

/** Exam-style written practice shown before the checkpoint. */
export const practice = {
  producer: {
    id: 'dl-practice-producer',
    type: 'written',
    pastPaper: true,
    marks: 5,
    prompt: 'In operating systems we developed the producer-consumer paradigm for two processes to communicate. Explain the similarities and differences between that problem and communication between two computers over a network.',
    points: [
      'Similarity: in both, one party produces data and the other consumes it, with a buffer in between, and the fast party must be held back (flow control)',
      'In the OS case both are normally on the same computer sharing a buffer in memory, protected by mutual exclusion; the transfer itself is perfectly reliable',
      'In networking the producer and consumer are on different computers, connected by a long channel (thousands of kilometres) through intermediate links and junctions',
      'The links may be unreliable: data may be lost, corrupted, duplicated or delayed, so all the data may not be delivered',
      'Hence extra mechanisms are needed: error control (acknowledgements, timers, retransmission, sequence numbers) as well as flow control, and there is no shared memory to synchronise on',
    ],
    modelAnswer:
      '<p><b>Similarity.</b> In both cases a producer generates items and a consumer takes them, with a <b>buffer</b> between them. The producer must wait when the buffer is full and the consumer must wait when it is empty, so both need <b>flow control</b> between a fast party and a slow one.</p><p class="mt-2"><b>Differences.</b> In the operating-system problem the producer and consumer are normally processes on the <b>same computer</b>. They share a bounded buffer in memory, access to it is coordinated with <b>mutual exclusion</b> (semaphores), and nothing is ever lost.</p><p class="mt-2">In a network the producer is on one computer and the consumer on another, connected through a <b>long communication channel</b>, possibly thousands of kilometres, with intermediate links and junctions. There is <b>no shared memory</b>, so there is nothing to lock. The links <b>may not be reliable</b>: data can be lost, damaged, duplicated or delayed, and all of it may not be delivered. More mechanisms are therefore required: <b>error control</b> (error-detecting codes, acknowledgements, timers, retransmissions and sequence numbers) in addition to <b>flow control</b> (the receiver telling the sender how much it can accept). Communication can also be in both directions over independent channels.</p>',
  },
  piggyback: {
    id: 'dl-practice-piggyback',
    type: 'written',
    pastPaper: true,
    marks: 5,
    prompt: 'Explain how the notion of piggybacking is employed by the data link layer. What is the issue with piggybacking?',
    points: [
      'Data usually flows in both directions over the same link, so data frames from A to B are intermixed with frames from B to A',
      'Instead of sending a separate acknowledgement frame, the receiver waits and attaches the acknowledgement to its next outgoing data frame, in an ack field of the header',
      'Benefit: better use of the channel capacity, since an ack field costs only a few bits against a whole separate frame with header and checksum',
      'Issue: how long to wait for a data frame to carry the ack; if it waits too long the sender’s timer expires and it retransmits, so delay increases',
      'Solution: wait a fixed short time (an ack timer); if no outgoing frame appears, send a separate acknowledgement frame',
    ],
    modelAnswer:
      '<p>In most practical situations data must be transmitted in <b>both directions</b>. Using two separate channels, one for data and one for acknowledgements, wastes almost all the capacity of the reverse channel. Instead the <b>same link</b> carries data in both directions, so data frames from A to B are intermixed with acknowledgement frames from B to A.</p><p class="mt-2"><b>Piggybacking</b> improves on this. When a data frame arrives, the receiver does not immediately send a separate control frame. It <b>waits until the network layer passes it the next packet</b> and attaches the acknowledgement to that outgoing data frame, using the <b>ack field</b> in the frame header. The acknowledgement gets a free ride.</p><p class="mt-2"><b>Advantage.</b> Better use of the available bandwidth: the ack field costs only a few bits, whereas a separate frame needs a header, the acknowledgement and a checksum, and fewer frames mean less processing.</p><p class="mt-2"><b>Issue.</b> How long should the data link layer wait for a packet onto which to piggyback the acknowledgement? If it waits longer than the sender’s timeout, the frame is <b>retransmitted</b>, defeating the purpose; and in any case the acknowledgement is <b>delayed</b>. The usual solution is a hybrid: wait a fixed number of milliseconds (an ack timer). If a new packet arrives quickly, piggyback; otherwise send a <b>separate acknowledgement frame</b>.</p>',
  },
  physical: {
    id: 'dl-practice-physical',
    type: 'written',
    pastPaper: true,
    marks: 5,
    prompt: 'What is the purpose of multiplexing? What will happen if you do not use multiplexing?',
    points: [
      'Multiplexing lets many signals (conversations, users) share a single physical channel',
      'It is done by dividing the channel in frequency (FDM), in time (TDM) or by code (CDM); on fibre, by wavelength (WDM)',
      'Purpose: economy of scale, since installing and maintaining one high-capacity link costs little more than a low-capacity one',
      'Without multiplexing each conversation would need its own separate physical line between the two points',
      'That would be prohibitively expensive and wasteful, since most of the capacity of each line would sit idle',
    ],
    modelAnswer:
      '<p><b>Multiplexing</b> is the sharing of one physical channel by <b>many signals at once</b>. Channels are expensive to install, and it costs about the same to lay and maintain a high-capacity cable or fibre as a low-capacity one, so schemes were developed to carry many conversations over a single link.</p><p class="mt-2">The main schemes are <b>frequency division multiplexing (FDM)</b>, in which the spectrum is divided into bands and each user has exclusive use of one band; <b>time division multiplexing (TDM)</b>, in which users take turns, each periodically getting the whole bandwidth for a short slot; <b>code division multiplexing (CDM)</b>, in which users transmit over the whole band at once with different codes; and <b>wavelength division multiplexing (WDM)</b> on optical fibre.</p><p class="mt-2"><b>Without multiplexing</b>, every pair of communicating parties would need a <b>dedicated physical line</b>. A trunk between two telephone exchanges would have to be thousands of separate cables. That is prohibitively expensive, physically impractical, and wasteful, because each dedicated line would be idle most of the time while its capacity could not be used by anyone else.</p>',
  },
} satisfies Record<string, Question>;

/** End-of-lesson checkpoint. */
export const checkpoint: Question[] = [
  {
    id: 'dl-cp-layers',
    type: 'mcq',
    prompt: 'Which layer of the reference model is responsible for moving frames across a single link and for deciding who may transmit on a shared medium?',
    options: ['Physical', 'Data link', 'Network', 'Transport'],
    answer: 1,
    explanation:
      'The <b>data link layer</b> delivers frames over one link, handling transmission errors and flow control. Its lower part, the <b>MAC sublayer</b>, decides who sends next on a multi-access channel. The network layer deals with the whole path across many links.',
  },
  {
    id: 'dl-cp-units',
    type: 'mcq',
    prompt: 'A transport segment is handed down the stack. In what order is it wrapped?',
    options: [
      'Segment inside a frame inside a packet',
      'Segment inside a packet inside a frame',
      'Packet inside a segment inside a frame',
      'Frame inside a packet inside a segment',
    ],
    answer: 1,
    explanation:
      'Each lower layer adds its own header to what it receives. The transport <b>segment</b> becomes the payload of a network <b>packet</b>, which becomes the payload of a link-layer <b>frame</b>. On receipt the headers are removed in the reverse order.',
  },
  {
    id: 'dl-cp-crc',
    type: 'mcq',
    prompt: 'The frame 1101011111 is to be sent with the CRC generator 10011. What checksum (remainder) is appended?',
    options: ['0010', '1110', '0101', '1001'],
    answer: 0,
    hint: 'Append four zeros (the degree of the generator) to the frame and divide by 10011 using modulo-2 subtraction (XOR).',
    explanation:
      'Divide 11010111110000 by 10011 modulo 2. The remainder is <b>0010</b>, so the transmitted frame is 11010111110010. The receiver divides what it gets by the same generator; a non-zero remainder means an error.',
  },
  {
    id: 'dl-cp-gbn',
    type: 'numeric',
    prompt: 'Eight frames (0 to 7) are sent with a window of 4 using <b>Go-Back-N</b>. Frame 2 is lost the first time it is sent; nothing else is lost. How many frame transmissions happen in total?',
    answer: 10,
    unit: 'transmissions',
    hint: 'The first window is frames 0 to 3. What does the receiver do with frame 3?',
    explanation:
      'First window: 0, 1 delivered; 2 lost; 3 arrives out of order and is <b>discarded</b>. After the timeout the sender goes back to 2 and sends 2, 3, 4, 5, then 6, 7. Total 4 + 4 + 2 = <b>10</b>. Selective Repeat would buffer frame 3 and resend only frame 2, for 9.',
  },
  {
    id: 'dl-cp-sr',
    type: 'mcq',
    pastPaper: true,
    prompt: 'Which statement correctly describes the trade-off between Go-Back-N and Selective Repeat?',
    options: [
      'Go-Back-N uses bandwidth better; Selective Repeat needs less buffer space',
      'Go-Back-N is simpler and needs a receiver buffer of one frame, but wastes bandwidth on errors; Selective Repeat resends only lost frames but needs more buffering and logic',
      'They behave identically when frames are lost',
      'Selective Repeat cannot be used with timers',
    ],
    answer: 1,
    explanation:
      'The trade-off is between <b>efficient use of bandwidth</b> and <b>data-link buffer space</b>. Go-Back-N has a simple receiver (window of 1, cumulative acks) but retransmits the whole tail of the window after one error, which is costly on long, fast or noisy links. Selective Repeat retransmits only the bad frame, but the receiver must buffer a window of frames, acknowledge them individually, and the sequence space must be at least twice the window.',
  },
  {
    id: 'dl-cp-csma',
    type: 'mcq',
    prompt: 'A station using nonpersistent CSMA has a frame to send and finds the channel busy. What does it do?',
    options: [
      'Keeps listening and transmits the instant the channel becomes idle',
      'Transmits immediately anyway',
      'Waits a random period of time and then senses the channel again',
      'Transmits with probability p in the next slot',
    ],
    answer: 2,
    explanation:
      'A <b>nonpersistent</b> station does not continually sense the channel in order to seize it. If the channel is in use it <b>waits a random time</b> and repeats the algorithm. A 1-persistent station would keep listening and transmit as soon as the channel is idle.',
  },
  {
    id: 'dl-cp-backoff',
    type: 'numeric',
    prompt: 'Classic Ethernet uses binary exponential backoff. After its <b>third</b> successive collision, a station waits a random number of slot times chosen from 0 up to what maximum?',
    answer: 7,
    unit: 'slots',
    hint: 'After i collisions the range is 0 to 2^i − 1.',
    explanation: 'After i collisions a random number between 0 and 2<sup>i</sup> − 1 is chosen. For i = 3 that is 0 to <b>7</b>. The range doubles with each collision (up to a cap of 1023), so the delay adapts to how many stations are contending.',
  },
  {
    id: 'dl-cp-bridge',
    type: 'multi',
    prompt: 'A learning bridge receives a frame. Which statements are correct?',
    options: [
      'It records the frame’s source address against the port the frame arrived on',
      'If the destination is not in its table, it sends the frame out of all ports except the arrival port',
      'It must be configured by an administrator before it can forward anything',
      'If the destination is on the same port the frame arrived on, the frame is discarded',
    ],
    answers: [0, 1, 3],
    explanation:
      '<b>Backward learning</b> associates the source address with the input port. Frames for unknown destinations are <b>flooded</b>; frames for known destinations go to the learned port, or are dropped (filtered) if that is the arrival port. The whole point is that bridges need <b>no configuration</b>: they are plug and play.',
  },
  {
    id: 'dl-cp-nonpersistent',
    type: 'written',
    pastPaper: true,
    marks: 5,
    prompt: 'Why does the nonpersistent CSMA protocol give better performance than the 1-persistent CSMA protocol? Discuss.',
    points: [
      '1-persistent: a station with data senses the channel; if busy it keeps listening and transmits with probability 1 as soon as the channel becomes idle',
      'If two or more stations become ready while a frame is being sent, they all wait and then start at exactly the same moment, so a collision is certain',
      'Nonpersistent: if the channel is busy the station does not keep sensing; it waits a random time and then senses again',
      'The random waits spread the stations out, so they are unlikely to start together: fewer collisions and better channel utilisation (throughput) at high load',
      'The price is longer delay, especially at low load, since a station may wait although the channel has become idle',
    ],
    modelAnswer:
      '<p>In <b>1-persistent CSMA</b>, a station with data listens to the channel. If the channel is idle it sends. If the channel is busy the station <b>waits until it becomes idle and then transmits with probability 1</b>. The weakness is its greed: if two or more stations become ready in the middle of a third station’s transmission, they will all wait politely and then <b>all begin transmitting at exactly the same instant</b>, the moment the channel goes idle. A collision is then certain.</p><p class="mt-2">In <b>nonpersistent CSMA</b>, a station that finds the channel busy does <b>not continually sense it</b> in order to seize it immediately. Instead it <b>waits a random period of time</b> and then repeats the algorithm. Stations that became ready during the same transmission therefore come back at different times, so they are much less likely to collide.</p><p class="mt-2">Consequently nonpersistent CSMA has <b>fewer collisions and better channel utilisation</b>, and its throughput stays high as the load increases, whereas 1-persistent throughput peaks and then falls. The cost is <b>longer delays</b> than 1-persistent CSMA, particularly at low load, because a station may sit out its random wait even though the channel has already become free.</p>',
  },
  {
    id: 'dl-cp-services',
    type: 'written',
    marks: 4,
    prompt: 'What two main tasks does the data link layer perform to turn a raw, error-prone link into a reliable one? Briefly describe how each is achieved.',
    points: [
      'Error control: making sure all frames are eventually delivered to the network layer, in order and without duplicates',
      'Achieved by error-detecting codes, positive/negative acknowledgements, timers and retransmission, with sequence numbers to recognise duplicates',
      'Flow control: preventing a fast sender from swamping a slow receiver',
      'Achieved by feedback-based flow control (the receiver grants permission to send, as in sliding window protocols) or rate-based flow control (a built-in limit on the sending rate)',
    ],
    modelAnswer:
      '<p>The data link layer delivers frames over a single link. Beyond framing, its two key tasks are error control and flow control.</p><p class="mt-2"><b>Error control</b> ensures that all frames are eventually delivered to the network layer at the destination, in the proper order. The receiver detects damaged frames using an <b>error-detecting code</b> (parity, checksum or CRC) and returns <b>positive or negative acknowledgements</b>. Because a frame or its acknowledgement may vanish entirely, the sender starts a <b>timer</b> with each frame and <b>retransmits</b> if no acknowledgement arrives. Since a frame may then be received more than once, frames carry <b>sequence numbers</b> so the receiver can tell retransmissions from originals.</p><p class="mt-2"><b>Flow control</b> prevents a fast sender from out-pacing a slow receiver. With <b>feedback-based</b> flow control the receiver sends back information giving the sender permission to send more, or telling it how it is doing; sliding window protocols work this way. With <b>rate-based</b> flow control the protocol has a built-in mechanism that limits the rate at which senders may transmit, without feedback from the receiver.</p>',
  },
];
