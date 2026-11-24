# Unit 3 Networking

## Networks and the Data Link Layer

### PYQ-83
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 2020, Q1 (2 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: What is the difference between distributed system and computer network?
Answer: **Core sentence:** in a distributed system the collection of independent computers appears to its users as a *single coherent system*, whereas in a computer network the users are exposed to the individual machines.

Expand in two lines: a computer network is simply a large number of separate but interconnected computers. A distributed system adds another software layer on top of that network — the World Wide Web is the example in the slides — and that layer hides where things actually run. So the difference lies in the software, not in the hardware: a distributed system is normally built on top of a computer network.
Marking points:
- in a distributed system the collection of independent computers appears to its users as a single coherent system, whereas in a computer network the users are exposed to the individual machines.
- Expand in two lines: a computer network is simply a large number of separate but interconnected computers.
- A distributed system adds another software layer on top of that network — the World Wide Web is the example in the slides — and that layer hides where things actually run.
- So the difference lies in the software, not in the hardware: a distributed system is normally built on top of a computer network.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-84
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 (alt set) 2020, Q1 (not recorded)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: In operating systems we have developed a producer-consumer paradigm to communicate. How is communication between two computers over a network different from it? (opening words as copied on a student answer sheet; the rest follows the networking slides)
Answer: **The paradigm as the OS has it.** A producer places an item in a shared buffer and a consumer takes it out; the producer waits if the buffer is full and the consumer waits if it is empty. Both normally run on the *same* computer, so the buffer is ordinary memory: nothing is ever lost in transit, delivery is instant, and the only coordination needed is a mutex plus two counting semaphores.

**What a network changes.** The producer is on one computer and the consumer on another, connected by a long communication channel — thousands of kilometres, with intermediate links and junctions.

- The **links might not be reliable** , and **all the data may not be delivered** : frames can be corrupted, lost or duplicated.
- Delay is long and *variable* , instead of a memory access.
- There is **no shared memory** , so there is no shared mutex and no shared buffer to inspect; each side only knows what the other tells it, and that information is itself late.
- Buffering exists at *both* ends and must be allocated dynamically for many connections, rather than being one fixed-size queue.
- Traffic normally flows in both directions at once.

**Core sentence:** because the channel is unreliable and long, more mechanisms are needed — **error control** (checksums, acknowledgements, timers, sequence numbers and retransmission) and **flow control** (the receiver grants the sender a window).

**The similarity worth stating:** flow control *is* the networked form of "the producer waits if the buffer is full" — the receiver's window is simply the free space in its buffer, reported across the network instead of read directly out of memory.
Marking points:
- because the channel is unreliable and long, more mechanisms are needed — error control (checksums, acknowledgements, timers, sequence numbers and retransmission) and flow control (the receiver grants the sender a window).
- The links might not be reliable , and all the data may not be delivered : frames can be corrupted, lost or duplicated.
- Delay is long and variable , instead of a memory access.
- There is no shared memory , so there is no shared mutex and no shared buffer to inspect; each side only knows what the other tells it, and that information …
- Buffering exists at both ends and must be allocated dynamically for many connections, rather than being one fixed-size queue.
- Traffic normally flows in both directions at once.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-85
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 (alt set) 2020, Q2 (not recorded); OSN End-sem 2022, Q1.9 (1 mark); AOS Quiz 2 2026, Q3 (2 marks)
Times asked: 3
Reworded versions: "Identify whether the following statement is TRUE or FALSE. If the statement is FALSE, correct it and justify the corrected sentence. If the statement is TRUE, justify it. Restrict the justification to a few (less than five) sentences. "A change in the service provided at layer "k", will impact services at both layers "k-1" and "k+1"."" (OSN End-sem 2022); "Suppose there is a change in the service provided at layer k. How does this impact layers k-1 and k+1? (as copied on a student answer sheet)" (OSN Quiz 8 (alt set) 2020)
In syllabus: yes
Question: In case of networking, suppose there is a change in the service provided at layer k. How does this impact services at layers "k-1" and "k+1"?
Answer: **FALSE.** Corrected: a change in the service provided at layer k affects only layer **k+1**; the services of the lower layers are not affected.

**Justification:** layering is one-directional in its dependency. Layer k is a *consumer* of layer k−1's service and a *provider* to layer k+1. Changing what layer k offers changes what k+1 can rely on, so k+1 must adapt. Layer k−1 neither knows nor cares who uses it: it keeps offering the same interface regardless. That one-way dependency is exactly why layering allows each layer to be developed and replaced independently.
Marking points:
- FALSE: Corrected: a change in the service provided at layer k affects only layer k+1; the services of the lower layers are not affected.
- layering is one-directional in its dependency.
Answer source: professor's key
Weak / low priority: no

### PYQ-86
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: AOS Quiz 2 2026, Q2 (2 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: Give two example applications where connection-oriented service is appropriate. Also, give two examples where connection-less service is best.
Answer: **The two services.** A connection-oriented service must be set up before use and torn down after it, like a phone call; a connectionless service handles every message separately, like postal delivery. The practical difference is reliability: a connection lets both ends keep state (sequence numbers, acknowledgements), so it can deliver everything in order; a connectionless service is cheaper and faster to start but promises nothing.

| Connection-oriented (every byte must arrive, in order) | Connectionless (speed matters more than a lost packet) |
| --- | --- |
| Sending an email; opening a web page (also file transfer, remote login) | A video call; watching a streamed movie (also DNS lookups, where one request and one reply do not justify a set-up) |

**Key:** connection-oriented for email and web pages; connectionless for video calls and streaming — because a late retransmitted video frame is useless, while a missing byte in an email is not acceptable.
Marking points:
- connection-oriented for email and web pages; connectionless for video calls and streaming — because a late retransmitted video frame is useless, while a missing byte in an email is not acceptable.
- The two services: A connection-oriented service must be set up before use and torn down after it, like a phone call; a connectionless service handles every message separately, like postal delivery.
- Sending an email; opening a web page (also file transfer, remote login): A video call; watching a streamed movie (also DNS lookups, where one request and one reply do not justify a set-up)
Answer source: professor's key
Weak / low priority: no

### PYQ-87
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN End-sem 2023, Q5b, Q5c (4 + 3 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: The Net team has developed a simple web application to test their TCP implementation. The web application is a simple process that will be sending a stream of data 11100110011001101101010101010101 to another process in a different machine (running IndixOS). Moreover, the team also would like to develop some mechanisms to guarantee reliability during the transfer. However, they are still determining how this can be implemented, and they require your suggestions: b. How can the process in the destination machine validate the incoming data? c. Further, how can the Net team provide guarantees on data reliability and flow control?
Answer: **(b) Validating the data — error-detecting codes.** The sender adds structured redundancy computed over the bits, and the receiver recomputes it:

- **Parity** : a single bit making the count of 1s even or odd; catches any odd number of bit errors, cheap but weak.
- **Checksum** : the data is treated as numbers and summed (the Internet checksum is a 16-bit one's-complement sum); carried in the TCP/IP headers.
- **CRC (cyclic redundancy code)** : the frame is treated as a polynomial and divided by a generator polynomial; the remainder is appended. This is what the data link layer actually uses, because it catches all burst errors shorter than the CRC and is cheap in hardware.

If the recomputed value disagrees, the frame is discarded as damaged. Error *correction* codes (Hamming, convolutional, Reed–Solomon, LDPC) are the alternative when retransmission is too expensive, for example on a wireless or satellite link.

**(c) Reliability** is error control: the receiver *acknowledges* frames that arrive correctly; the sender starts a *timer* when it sends and *retransmits* if no ack arrives (ARQ, automatic repeat request); and every frame and ack carries a *sequence number* so that a retransmission is not mistaken for a new frame and duplicates are discarded. For stop-and-wait, one bit of sequence number is enough.

**Flow control** stops a fast sender outpacing a slow receiver. Feedback-based control has the receiver grant permission to send — in its simplest form stop-and-wait (one frame outstanding), and in general a **sliding window** whose size bounds the number of unacknowledged frames. Rate-based control instead limits the sending rate directly, with no feedback.

**Core sentence:** validation is done by redundancy (CRC/checksum); reliability by acknowledgements, timers and sequence numbers; flow control by the receiver's window.
Marking points:
- validation is done by redundancy (CRC/checksum); reliability by acknowledgements, timers and sequence numbers; flow control by the receiver's window.
- Parity : a single bit making the count of 1s even or odd; catches any odd number of bit errors, cheap but weak.
- Checksum : the data is treated as numbers and summed (the Internet checksum is a 16-bit one's-complement sum); carried in the TCP/IP headers.
- CRC (cyclic redundancy code) : the frame is treated as a polynomial and divided by a generator polynomial; the remainder is appended.
- (b) Validating the data — error-detecting codes.
- (c) Reliability is error control: the receiver acknowledges frames that arrive correctly; the sender starts a timer when it sends and retransmits if no ack arrives (ARQ, automatic repeat request); and every frame and ack …
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-88
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: AOS Quiz 2 2025, Q6 (2 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: List the issues in designing the data link layer. Briefly explain one protocol and discuss how these issues are addressed.
Answer: **The design issues** (Tanenbaum 3.1, and section 4 of this page):

1. **Service to the network layer** : unacknowledged connectionless (Ethernet), acknowledged connectionless (802.11) or acknowledged connection-oriented.
2. **Framing** : cutting the bit stream into frames so the receiver knows where each begins and ends (flag bytes with byte stuffing, or flag bits with bit stuffing).
3. **Error control** : detecting damaged frames (CRC) and making sure every frame is eventually delivered exactly once, in order (acks, timers, sequence numbers).
4. **Flow control** : stopping a fast sender from swamping a slow receiver.
5. On broadcast links, **medium access** : who may transmit next (the MAC sublayer, section 6).

**One protocol: stop-and-wait ARQ over a noisy channel** (Tanenbaum protocol 3, "PAR"). The sender sends one frame, starts a timer and waits; the receiver checks the checksum and, if the frame is good, passes it up and sends an ack; if the timer expires first, the sender resends the same frame.

| Issue | How stop-and-wait ARQ handles it |
| --- | --- |
| Framing | Each packet travels in its own frame with a header (sequence number) and a trailer (checksum) |
| Error detection | The checksum; a damaged frame is silently discarded |
| Lost frame or lost ack | The sender's timer fires and the frame is resent |
| Duplicates | A 1-bit sequence number: the receiver discards a frame with the number it has already accepted, but still acks it |
| Flow control | Only one frame is ever outstanding, and the receiver acks only when it is ready |

**What it still gets wrong:** efficiency — on a long link the sender idles for a whole round trip per frame. That is why sliding windows exist (Go-Back-N and Selective Repeat), which keep the same mechanisms but allow several frames in flight.
Marking points:
- Service to the network layer : unacknowledged connectionless (Ethernet), acknowledged connectionless (802.11) or acknowledged connection-oriented.
- Framing : cutting the bit stream into frames so the receiver knows where each begins and ends (flag bytes with byte stuffing, or flag bits with bit stuffing).
- Error control : detecting damaged frames (CRC) and making sure every frame is eventually delivered exactly once, in order (acks, timers, sequence numbers).
- Flow control : stopping a fast sender from swamping a slow receiver.
- On broadcast links, medium access : who may transmit next (the MAC sublayer, section 6).
- The design issues (Tanenbaum 3.1, and section 4 of this page):
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-89
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 2020, Q5 (5 marks); AOS Quiz 2 2026, Q5 (2 marks)
Times asked: 2
Reworded versions: "Explain how the notion of piggybacking is employed by datalike layer? What is the issue with piggybacking?" (OSN Quiz 8 2020)
In syllabus: yes
Question: Explain how the notion of piggybacking is employed by the data link layer. What is the issue with piggybacking?
Answer: **Why it exists.** In the earlier protocols data frames travel in one direction only, but in most practical situations frames must travel both ways. Each link has a forward and a reverse channel, and if the reverse channel carries only acknowledgements its capacity is largely wasted. So the same link is used in both directions, and A's data frames are intermixed with acks for B's frames.

**How it works.** *Piggybacking* is temporarily delaying an outgoing acknowledgement so that it can be hooked onto the next outgoing data frame, carried in a field of that frame's header. One frame then does two jobs, saving a frame header, a channel access and processing at both ends — better use of bandwidth.

**The issue.** Piggybacking **increases the delay**: the ack is held back while the link layer waits for a data frame to attach it to. If no data frame appears soon, the sender's timer may expire and it retransmits unnecessarily. The receiver also cannot wait indefinitely, since it has no way to know how long the wait will be.

**The fix to state:** use a hybrid — if a data frame is ready within a short bounded time, piggyback the ack on it; otherwise send a separate ack frame. An ack timer bounds the wait.

**The professor's key (Quiz 2 2026), in its own words:** the ack is temporarily delayed so that it can be hooked onto the next outgoing data frame; the issue is that if there are no regular outgoing frames, piggybacking increases the delay; the solution is a hybrid — piggyback when possible, otherwise send a separate ack frame after a timer expires.
Marking points:
- Why it exists: In the earlier protocols data frames travel in one direction only, but in most practical situations frames must travel both ways.
- How it works: Piggybacking is temporarily delaying an outgoing acknowledgement so that it can be hooked onto the next outgoing data frame, carried in a field of that frame's header.
- The issue: Piggybacking increases the delay: the ack is held back while the link layer waits for a data frame to attach it to.
- The fix to state: use a hybrid — if a data frame is ready within a short bounded time, piggyback the ack on it; otherwise send a separate ack frame.
- The professor's key (Quiz 2 2026), in its own words: the ack is temporarily delayed so that it can be hooked onto the next outgoing data frame; the issue is that if there are no …
Answer source: professor's key
Weak / low priority: no

### PYQ-90
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 (alt set) 2020, Q4 (not recorded); OSN End-sem (question list) 2021, Q6 (not given); OSN End-sem 2022, Q2.5 (3 marks); AOS Quiz 2 2026, Q4 (2 marks)
Times asked: 4
Reworded versions: "Explain the tradeoffs between "Go-Back-N" Sliding Window Protocol and "Selective Repeat" Sliding Window Protocol." (OSN End-sem 2022); "Explain the trade-off between Go-Back-N and Selective Repeat. (as copied on a student answer sheet)" (OSN Quiz 8 (alt set) 2020)
In syllabus: yes
Question: Explain the tradeoff between the "Go-Back-N Sliding Window Protocol" and the "Selective Repeat Sliding Window Protocol".
Answer: **Go-Back-N**: the receiver keeps a window of 1 and discards every frame that follows a missing one, so it needs **very few buffers** and is simple. The price is performance: when a frame is lost, the sender must retransmit that frame *and all outstanding frames after it*, so good frames are sent twice and bandwidth is wasted. The damage grows with the window size and with the error rate.

**Selective Repeat**: the receiver accepts frames anywhere in its window and buffers the out-of-order ones, sending a NAK for the missing frame, so the sender retransmits **only the missing frame**. Performance is much better, but it needs **a buffer per window slot** at the receiver and is more complex — the receiver must also sort frames back into order before delivering them upward.

**Trade-off in one line:** Go-Back-N spends bandwidth to save memory and complexity; Selective Repeat spends memory and complexity to save bandwidth. Choose Go-Back-N when errors are rare, Selective Repeat when errors are frequent or the link has a large bandwidth-delay product.
Marking points:
- Go-Back-N: the receiver keeps a window of 1 and discards every frame that follows a missing one, so it needs very few buffers and is simple.
- Selective Repeat: the receiver accepts frames anywhere in its window and buffers the out-of-order ones, sending a NAK for the missing frame, so the sender retransmits only the missing frame.
- Trade-off in one line: Go-Back-N spends bandwidth to save memory and complexity; Selective Repeat spends memory and complexity to save bandwidth.
Answer source: professor's key
Weak / low priority: no

### PYQ-91
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN End-sem (question list) 2021, Q7 (not given); OSN End-sem 2022, Q9 (5 marks)
Times asked: 2
Reworded versions: none
In syllabus: yes
Question: Explain the difference between "Pure ALOHA" and "Slotted ALOHA" in terms of implementation? What is the reason for the improved performance of "Slotted ALOHA" over "Pure ALOHA"?
Answer: **Implementation.** In pure ALOHA a station transmits *whenever* it has a frame ready, with no coordination at all. In slotted ALOHA time is divided into discrete intervals of one frame time, and a station may begin transmitting **only at the start of a slot**; this requires all stations to agree on slot boundaries, that is, **global time synchronization** (originally one special station emitting a pip at the start of each interval).

**Why slotted performs better.** In pure ALOHA a frame is destroyed if another station starts at any moment from one frame time before it to one frame time after it, so the **vulnerable period is two frame times** and even a one-bit overlap ruins both frames. In slotted ALOHA, stations can only start at the same instant, so a collision is always a complete overlap and never a partial one: the **vulnerable period is one frame time**.

**Core sentence:** halving the vulnerable period roughly doubles the throughput — from about **18% (1/2e)** for pure ALOHA to about **37% (1/e)** for slotted ALOHA.

Cost to acknowledge: slotted ALOHA needs synchronization, and a station with a frame ready mid-slot must wait for the next boundary, adding a small delay.
Marking points:
- halving the vulnerable period roughly doubles the throughput — from about 18% (1/2e) for pure ALOHA to about 37% (1/e) for slotted ALOHA.
- Implementation: In pure ALOHA a station transmits whenever it has a frame ready, with no coordination at all.
- Why slotted performs better: In pure ALOHA a frame is destroyed if another station starts at any moment from one frame time before it to one frame time after it, so the vulnerable period is two frame times …
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-92
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 2020, Q6 (5 marks); OSN Quiz 8 (alt set) 2020, Q5 (not recorded)
Times asked: 2
Reworded versions: "Why does nonpersistent CSMA give better performance than 1-persistent CSMA? (as copied on a student answer sheet)" (OSN Quiz 8 (alt set) 2020)
In syllabus: yes
Question: Why Nonpersistent CSMA Protocol gives better performance over 1-Persistent CSMA Protocol? Discuss.
Answer: **What each does.** In *1-persistent* CSMA a station that finds the channel busy keeps listening continuously and transmits with probability 1 the instant the channel goes idle. In *nonpersistent* CSMA the station does not keep listening: it waits a random period of time and then senses the channel again.

**Why 1-persistent is worse.** If two or more stations become ready while a transmission is in progress, they are all listening and all pounce at the same instant the channel clears, so a **collision is guaranteed**. The greedier the stations, the worse this gets, and as load rises almost every end-of-transmission is followed by a collision. The slide's note adds a second cause: even with only two ready stations, collisions occur because neither is patient. Propagation delay makes it worse still — a station may sense idle because another's signal has not yet arrived.

**Why nonpersistent is better.** Each waiting station backs off for an independent random time, so the waiting stations are **spread out in time** rather than synchronized at the moment the channel frees. Fewer stations attempt at the same instant, so there are far fewer collisions and higher channel utilization at high load.

**The trade-off to state:** nonpersistent CSMA achieves better throughput but at the cost of *longer delays*, because the channel may sit idle while every station is in the middle of its random wait. 1-persistent wins only at low load, where a greedy station grabs an idle channel immediately. p-persistent is the compromise between them.
Marking points:
- What each does: In 1-persistent CSMA a station that finds the channel busy keeps listening continuously and transmits with probability 1 the instant the channel goes idle.
- Why 1-persistent is worse: If two or more stations become ready while a transmission is in progress, they are all listening and all pounce at the same instant the channel clears, so a collision is guaranteed.
- Why nonpersistent is better: Each waiting station backs off for an independent random time, so the waiting stations are spread out in time rather than synchronized at the moment the channel frees.
- The trade-off to state: nonpersistent CSMA achieves better throughput but at the cost of longer delays, because the channel may sit idle while every station is in the middle of its random wait.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-93
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: AOS Quiz 2 2025, Q7 (2 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: Discuss the p-persistent CSMA protocol. How does it improve performance over 1-persistent CSMA?
Answer: **The protocol** (slotted channels). When a station is ready to send it senses the channel. If the channel is idle, it transmits with probability *p* and defers to the next slot with probability q = 1 − p. If that next slot is also idle it repeats the coin toss, and so on, until it has either sent or another station has started; if someone else starts, it treats the event as a collision — waits a random time and starts again. If the channel was busy at the start, it waits for the next slot and applies the same rule.

**Why it beats 1-persistent.** 1-persistent is p-persistent with p = 1: every station waiting on a busy channel transmits the instant the channel goes idle, so if two or more are waiting they *always* collide. With p < 1 the waiting stations are spread over several slots, so usually only one transmits first and the others hear it and back off. Fewer collisions means less wasted channel time and higher throughput at high load.

**Core sentence:** p is a dial — a smaller p means fewer collisions and higher throughput under heavy load, at the cost of extra delay (idle slots) when the load is light; 1-persistent is the greedy end of that dial and nonpersistent is close to the cautious end.
Marking points:
- p is a dial — a smaller p means fewer collisions and higher throughput under heavy load, at the cost of extra delay (idle slots) when the load is light; 1-persistent is the greedy end of that dial and nonpersistent is close to the cautious end.
- The protocol (slotted channels).
- Why it beats 1-persistent: 1-persistent is p-persistent with p = 1: every station waiting on a busy channel transmits the instant the channel goes idle, so if two or more are waiting they always collide.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-94
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: true/false
Asked in: AOS End-sem 2025, Q1.8 (1 mark)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: TRUE or FALSE. If FALSE, correct it and justify the corrected sentence; if TRUE, justify it. Fewer than five sentences. "In the given network, it does not make any difference if we replace the "bridge" with the "switch"." (The figure of the network is not available.)
Answer: **TRUE.**

**Justification.** A bridge and a switch are the same kind of device: both work at the **data link layer**, read only the Ethernet (MAC) destination address, learn station locations by backward learning, flood frames for unknown destinations, and give each port its own collision domain. A switch is simply the modern name for a bridge with many ports, typically used to connect individual computers rather than whole LANs. So replacing one with the other changes neither which frames are forwarded where nor the collision domains. What would make a difference is replacing it with a *hub* (one shared collision domain, physical layer) or a *router* (network layer, IP addresses, separate broadcast domains).
Marking points:
- States TRUE.
- A bridge and a switch are the same kind of device: both work at the data link layer, read only the Ethernet (MAC) destination address, learn station locations by backward learning, flood frames for unknown …
- A switch is simply the modern name for a bridge with many ports, typically used to connect individual computers rather than whole LANs.
- So replacing one with the other changes neither which frames are forwarded where nor the collision domains.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-95
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 2020, Q2 (2 marks)
Times asked: 1
Reworded versions: none
In syllabus: no: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers
Question: What is the purpose of communication satellites?
Answer: Communication satellites relay signals between points on Earth that cannot reach each other directly.

- A satellite carries **transponders**: each receives a signal on one frequency (uplink), amplifies it and rebroadcasts it on another (downlink).
- It covers a very large area with one hop, so it serves remote regions, ships and aircraft where laying cable is impractical.
- It is naturally a **broadcast** medium: one transmission reaches every receiver in its footprint (television, radio).
- Kinds: geostationary (GEO, about 36,000 km, fixed in the sky, about 250 ms one-way delay), medium-Earth orbit (MEO, e.g. GPS) and low-Earth orbit (LEO, small delay, need a constellation of many satellites).
Marking points:
- Relay (repeater) in the sky: uplink, amplify, downlink via transponders.
- Wide coverage, remote areas, mobile users.
- Broadcast nature.
- GEO / MEO / LEO and their delay trade-off.
Answer source: written by Claude, no key
Weak / low priority: yes: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers

### PYQ-96
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 2020, Q3 (5 marks)
Times asked: 1
Reworded versions: none
In syllabus: no: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers
Question: How Fourier analysis will help to reduce the bandwidth?
Answer: **Fourier analysis** shows that any periodic signal can be written as a sum of sine and cosine harmonics (a constant term plus frequencies f, 2f, 3f, ...).

- A real channel passes only a limited band of frequencies, so it can carry only the first few harmonics of a digital signal.
- Fourier analysis tells us **how many harmonics are needed** for the receiver to still recognize the 0s and 1s correctly. Only those need to be sent, so the signal can be squeezed into a much smaller bandwidth.
- It also gives the relation between data rate and bandwidth: for a bit rate of b bits/s, the first harmonic is at b/8 Hz for an 8-bit character, so a channel of H Hz passes about 8H/b harmonics. A higher data rate leaves fewer harmonics and a more distorted signal.
- So, by knowing which frequency components matter, the system uses the least bandwidth for a given rate, and more signals can share the same frequency range.
Marking points:
- Any periodic signal = sum of harmonics.
- Channel passes limited frequencies; only the first harmonics get through.
- Fourier analysis identifies how many harmonics are enough to decode the bits.
- Sending only those reduces the bandwidth needed.
- Link between bit rate and number of harmonics.
Answer source: written by Claude, no key
Weak / low priority: yes: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers

### PYQ-97
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: true/false
Asked in: OSN End-sem 2022, Q1.7 (1 mark)
Times asked: 1
Reworded versions: none
In syllabus: no: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers
Question: Identify whether the following statement is TRUE or FALSE. If the statement is FALSE, correct it and justify the corrected sentence. If the statement is TRUE, justify it. Restrict the justification to a few (less than five) sentences. "Fourier theorem helps to improve the efficiency of the channel/link."
Answer: **TRUE.**

A channel has limited bandwidth. The Fourier theorem allows identification of the required number of major frequency components of the signal so that a signal can be transmitted successfully. As a result, the bandwidth of the channel can be conserved, and more signals can be transmitted in the given frequency range of the channel or link.
Marking points:
- TRUE.
- Channel bandwidth is limited.
- Fourier theorem identifies the major frequency components needed.
- Bandwidth is conserved, so more signals fit in the channel.
Answer source: professor's key
Weak / low priority: yes: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers

### PYQ-98
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 2020, Q4 (5 marks)
Times asked: 1
Reworded versions: none
In syllabus: no: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers
Question: What is the purpose of multiplexing? What will happen if you do not use multiplexing?
Answer: **Multiplexing** lets many independent signals or conversations share one physical channel.

- Kinds: frequency-division (FDM: each signal gets its own frequency band), time-division (TDM: each signal gets its own time slots), wavelength-division (WDM, on fibre) and code-division (CDM/CDMA).
- Purpose: a long-haul link (a trunk, a fibre, a satellite transponder) is expensive and has far more capacity than one conversation needs, so sharing it lowers the cost per user and keeps the capacity in use.

**Without multiplexing,** every pair of users would need its own physical link: the cost of cabling and equipment would explode, most links would sit idle most of the time, and spectrum on shared media such as radio could not be divided among users without interference.
Marking points:
- Definition: many signals share one channel.
- FDM, TDM (and WDM, CDM).
- Purpose: cost and full use of expensive high-capacity links.
- Without it: one link per conversation, high cost, idle capacity.
Answer source: written by Claude, no key
Weak / low priority: yes: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers

### PYQ-99
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Asked in: OSN Quiz 8 (alt set) 2020, Q3 (not recorded)
Times asked: 1
Reworded versions: none
In syllabus: no: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers
Question: What will happen if we send digital bits without modulation? (as copied on a student answer sheet)
Answer: Sending raw digital bits (baseband) without modulation causes several problems:

- **Attenuation and distortion:** a square digital signal contains many high-frequency harmonics; over distance they are attenuated by different amounts, so the pulses smear and the receiver cannot tell 0s from 1s. Very high transmitter power would be needed to go far.
- **No fit with band-limited channels:** wireless and telephone channels pass only a band of frequencies far from zero, so a baseband signal cannot travel over them at all; radio would also need impractically large antennas for low frequencies.
- **No sharing:** without moving signals to different carrier frequencies, several users cannot share the medium (no FDM).
- **Noise and multipath fading** hurt a baseband signal more.

Modulation (varying the amplitude, frequency or phase of a carrier) solves these: it moves the signal into the band the channel passes, lets many signals share the medium, and allows long-distance transmission with reasonable power and antennas.
Marking points:
- Attenuation and distortion of baseband pulses over distance.
- Band-limited channels (radio, telephone) cannot carry baseband.
- Cannot share the medium by frequency.
- Modulation shifts the signal onto a carrier: AM, FM, PM.
Answer source: written by Claude, no key
Weak / low priority: yes: physical layer; the end-sem networking list covers only the data link, MAC, network and transport layers

### PRED-57
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers); same section as PYQ-88, PYQ-89, PYQ-90
In syllabus: yes
Question: A 10 Mbps link has a one-way propagation delay of 20 ms and carries 1250-byte frames. What window size keeps the link fully utilized? What is the utilization if stop-and-wait is used instead?
Answer: **Frame transmission time** = 1250 bytes × 8 = 10,000 bits ÷ 10 Mbps = **1 ms**.

**Bandwidth-delay in frames.** BD = (bandwidth × one-way delay) ÷ frame size = (10 Mbps × 20 ms) ÷ 10,000 bits = 200,000 ÷ 10,000 = **20 frames**.

Using the slide's rule, **w ≥ 2BD + 1 = 41 frames**. The intuition: the first ack cannot come back before 2 × 20 = 40 ms plus the 1 ms it took to send, which is 41 frame times, so the sender needs 41 frames in flight to avoid ever stopping.

**Stop-and-wait utilization** = transmit time ÷ (transmit time + round-trip time) = 1 ÷ (1 + 40) ≈ **2.4%**. Over 97% of the link's capacity would be wasted, which is precisely why windows exist.

State the sequence-number consequence too: a window of 41 needs sequence numbers ranging over at least 42 values for Go-Back-N (w ≤ 2ⁿ − 1), so 6 bits.
Marking points:
- Frame transmission time = 1250 bytes × 8 = 10,000 bits ÷ 10 Mbps = 1 ms.
- Bandwidth-delay in frames: BD = (bandwidth × one-way delay) ÷ frame size = (10 Mbps × 20 ms) ÷ 10,000 bits = 200,000 ÷ 10,000 = 20 frames.
- Stop-and-wait utilization = transmit time ÷ (transmit time + round-trip time) = 1 ÷ (1 + 40) ≈ 2.4%.
Answer source: written by Claude, no key
Weak / low priority: no

### PRED-58
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers); same section as PYQ-91, PYQ-92, PYQ-93
In syllabus: yes
Question: What does CSMA/CD add to CSMA, and why must a transmitting station keep listening for at least 2τ? Why is classic Ethernet's backoff *exponential*?
Answer: **What CD adds.** In plain CSMA, if two stations sense idle and both begin, the signals collide and each station still transmits its *entire* frame, wasting the whole frame time. With collision detection, a station listens while transmitting, detects the collision quickly, **aborts immediately**, waits a random period and tries again. That saves time and bandwidth, so the channel alternates between contention periods, transmission periods and idle periods.

**Why 2τ.** Let τ be the propagation time between the two farthest stations. A station at one end may begin just before the other's signal arrives, so the worst case is: station A starts at t = 0; station B starts at t = τ − ε and detects the collision immediately; B's aborted signal takes another τ to reach A, so A can only be certain at **t ≈ 2τ**. A station must therefore still be transmitting at 2τ to be sure of hearing a collision — which is why Ethernet imposes a minimum frame size, and why performance is good only when the frame time is much larger than τ. For a 1 km coaxial cable, τ ≈ 5 µs.

**Why exponential backoff.** After the i-th collision a station waits a random number of slot times in the range 0 to 2ⁱ − 1. A small window gives a quick retry when only a couple of stations are competing; doubling it after each further collision automatically spreads out the stations when many are competing. The protocol therefore adapts to an unknown number of contenders without any station knowing how many there are.
Marking points:
- What CD adds: In plain CSMA, if two stations sense idle and both begin, the signals collide and each station still transmits its entire frame, wasting the whole frame time.
- Why 2τ: Let τ be the propagation time between the two farthest stations.
- Why exponential backoff: After the i-th collision a station waits a random number of slot times in the range 0 to 2ⁱ − 1.
Answer source: written by Claude, no key
Weak / low priority: no

### PRED-59
Unit: 3 Networking
Topic: Networks and the Data Link Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers); same section as PYQ-94
In syllabus: yes
Question: Explain the backward learning algorithm used by a learning bridge. What does the bridge do with a frame whose destination it has not yet learned, and why must learned entries be forgotten?
Answer: **Backward learning.** When a frame arrives on a port, the bridge associates the frame's *source* address with that *input* port and stores the pair in a table. Later, a frame whose *destination* matches a learned address is sent only to that learned port, so traffic between two machines on the same port never crosses the bridge at all. The scheme needs **no configuration**: the bridge builds its table from the traffic it already carries.

**Unknown destination.** The frame is **flooded** — sent out on all ports except the one it arrived on. This is correct but wasteful, and it resolves itself as soon as that station replies, since the reply teaches the bridge where it is.

**Why entries expire.** Machines are moved, unplugged and replugged into other ports. An entry that is never forgotten would keep sending frames to a port where the machine no longer is. So unused addresses are aged out, allowing the topology to change.

**Why it is worth it:** a bridge is bandwidth-efficient for two-way traffic and gives each line its own collision domain, while a hub makes the whole device one collision domain. A bridge uses but does not remove the Ethernet header, and never inspects the network header — it is a link-layer device.
Marking points:
- Backward learning: When a frame arrives on a port, the bridge associates the frame's source address with that input port and stores the pair in a table.
- Unknown destination: The frame is flooded — sent out on all ports except the one it arrived on.
- Why entries expire: Machines are moved, unplugged and replugged into other ports.
- Why it is worth it: a bridge is bandwidth-efficient for two-way traffic and gives each line its own collision domain, while a hub makes the whole device one collision domain.
Answer source: written by Claude, no key
Weak / low priority: no

## The Network Layer

### PYQ-100
Unit: 3 Networking
Topic: The Network Layer
Type: numerical
Asked in: OSN Quiz 9 (alt set) 2020, Q3 (not recorded); OSN End-sem (question list) 2021, Q9 (not given); OSN End-sem 2022, Q11 (5 marks); AOS End-sem 2025, Q12 (5 marks)
Times asked: 4
Reworded versions: "Consider the following network. Distance vector routing is used and the following vectors have just come in to router C; from B: (5,0,8,1,6,2); from D: (16,12,6,0,9,10); from E: (7,6,3,9,0,4). The cost of the links from C to B, D and E are 6, 3 and 5 respectively. What is C's new routing table?" (AOS End-sem 2025)
In syllabus: yes
Question: Consider the following network. Distance vector routing is used and the following vectors have just come in to router C; from B: (5,0,8,12,6,2); from D: (16,12,6,0,9,10); from E: (7,6,3,9,0,4). The cost of the links from C to B, D, and E, are 6, 3 and 5 respectively. What is C's new routing table?
Answer: **Step 1 — add each link's cost to the whole vector that came over it.** The vectors are indexed by destination A, B, C, D, E, F.

| Route via | A | B | C | D | E | F |
| --- | --- | --- | --- | --- | --- | --- |
| B (+6) | 11 | **6** | 14 | 18 | 12 | **8** |
| D (+3) | 19 | 15 | 9 | **3** | 12 | 13 |
| E (+5) | 12 | 11 | 8 | 14 | **5** | 9 |

For A, via B gives 11 (best, beating 19 and 12).

**Step 2 — take the minimum of each column, and record the line.**

| Destination | A | B | C | D | E | F |
| --- | --- | --- | --- | --- | --- | --- |
| **New distance** | 11 | 6 | 0 | 3 | 5 | 8 |
| **Line to use** | B | B | — | D | E | B |

**Answer:** C's new routing table is **(11, 6, 0, 3, 5, 8)** with outgoing lines **(B, B, –, D, E, B)**.

Two things examiners look for: C's entry for *itself* is 0, not the 8 or 9 that comes back through a neighbour; and the cost of the link must be added to *every* entry of that neighbour's vector before comparing, because the vector is the neighbour's distance, not C's.

**AOS End-sem 2025 version, with B's vector (5,0,8,1,6,2):**

**Only one entry moves.** B now claims distance 1 to D, so the route to D via B costs 6 + 1 = **7** instead of 18.

| Route via | A | B | C | D | E | F |
| --- | --- | --- | --- | --- | --- | --- |
| B (+6) | **11** | **6** | 14 | 7 | 12 | **8** |
| D (+3) | 19 | 15 | 9 | **3** | 12 | 13 |
| E (+5) | 12 | 11 | 8 | 14 | **5** | 9 |

For D, the minimum is still the direct link (3 < 7 < 14).

**Answer:** the table is unchanged — distances **(11, 6, 0, 3, 5, 8)** with outgoing lines **(B, B, –, D, E, B)**.

Write the full three-row working anyway: the marks are for adding each link cost to the *whole* vector and taking the column minimum. If the number in your paper is different again, the same two steps work.
Marking points:
- Final answer: Answer: the table is unchanged — distances (11, 6, 0, 3, 5, 8) with outgoing lines (B, B, –, D, E, B).
- C's new routing table is (11, 6, 0, 3, 5, 8) with outgoing lines (B, B, –, D, E, B).
- Only one entry moves: B now claims distance 1 to D, so the route to D via B costs 6 + 1 = 7 instead of 18.
Answer source: professor's key
Weak / low priority: no

### PYQ-101
Unit: 3 Networking
Topic: The Network Layer
Type: true/false
Asked in: OSN End-sem 2022, Q1.8 (1 mark); AOS Quiz 2 2026, Q6 (2 marks)
Times asked: 2
Reworded versions: none
In syllabus: yes
Question: Identify whether the following statement is TRUE or FALSE. If the statement is FALSE, correct it and justify the corrected sentence. If the statement is TRUE, justify it. Restrict the justification to a few (less than five) sentences. "Hierarchical routing results in shorter paths than flat routing".
Answer: **FALSE.** Corrected: hierarchical routing may result in *slightly longer* paths than flat routing; what it reduces is the work of route computation and the size of the routing tables.

**Justification:** in hierarchical routing a router knows the exact route only inside its own region; for a destination in another region it knows only how to reach that region's representative router. The packet is therefore sent toward the region, not toward the specific destination, and the path chosen can be worse than the true shortest path a flat algorithm would have found. The trade is worth making because as a network grows, flat routing tables grow proportionately and consume more memory, CPU time and bandwidth, until it is no longer possible to send a table to every router.
Marking points:
- States FALSE.
- Corrected: hierarchical routing may result in slightly longer paths than flat routing; what it reduces is the work of route computation and the size of the routing tables.
- in hierarchical routing a router knows the exact route only inside its own region; for a destination in another region it knows only how to reach that region's representative router.
Answer source: professor's key
Weak / low priority: no

### PYQ-102
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: AOS Quiz 2 2025, Q8 (2 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: Briefly explain the link state routing algorithm.
Answer: **Idea:** instead of telling neighbours its distances (distance vector), every router tells *everyone* about its neighbours, so each router can build the whole map and compute its own shortest paths. Five steps:

1. **Discover neighbours** and learn their addresses, by sending a HELLO packet on each line.
2. **Measure the cost** to each neighbour — for example delay, measured by an ECHO packet's round trip, or a cost inversely proportional to bandwidth.
3. **Build a link state packet** : sender identity, a sequence number, an age, and the list of neighbours with their costs.
4. **Flood it to all routers** , reliably: duplicates are discarded by sequence number, the age field lets stale packets expire, and every packet is acknowledged.
5. **Compute the new routes** : with the full set of packets each router has the whole graph, and runs Dijkstra's shortest-path algorithm locally.

**Why it replaced distance vector:** distance vector converges slowly (the count-to-infinity problem), because news travels only one hop per exchange; link state floods the news to everyone at once, at the cost of more memory and computation. IS-IS and OSPF are link state protocols.
Marking points:
- Discover neighbours and learn their addresses, by sending a HELLO packet on each line.
- Measure the cost to each neighbour — for example delay, measured by an ECHO packet's round trip, or a cost inversely proportional to bandwidth.
- Build a link state packet : sender identity, a sequence number, an age, and the list of neighbours with their costs.
- Flood it to all routers , reliably: duplicates are discarded by sequence number, the age field lets stale packets expire, and every packet is acknowledged.
- Compute the new routes : with the full set of packets each router has the whole graph, and runs Dijkstra's shortest-path algorithm locally.
- Idea: instead of telling neighbours its distances (distance vector), every router tells everyone about its neighbours, so each router can build the whole map and compute its own shortest paths.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-103
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN End-sem (question list) 2021, Q10 (not given)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: Looking at the following network, how many packets are generated by a broadcast from B using (a) reverse path forwarding (b) the sink tree? Which is favored for the implementation and why? (The network figure is not available.)
Answer: **The two methods.**

- **Sink tree (spanning tree) broadcast** : the source sends the packet down its own sink tree — each router copies it onto every tree line except the one it arrived on. Every router is reached exactly once, so the count is exactly **n − 1 packets** for n routers, the minimum possible. But each router must know the spanning tree, which link state routing provides and distance vector does not.
- **Reverse path forwarding (RPF)** : when a broadcast packet arrives, the router checks whether it came in on the line it would itself use to send packets *to* the source. If yes, it is probably the first copy, travelling the best route, so it is forwarded on all other lines; if no, it is discarded as a likely duplicate.

**How to count, on whatever figure you get.** Draw the sink tree of the source first. For RPF, go hop by hop: at each hop, every router that received a copy on its preferred line sends one packet on *each* of its other lines, and routers that received a copy on a non-preferred line send nothing. Count every packet sent, including the ones that are later discarded. The textbook's worked example (Tanenbaum fig. 5-15, broadcast from router I): RPF stops after **5 hops and 24 packets**; following the sink tree exactly takes **4 hops and 14 packets**.

**Which is favoured:** RPF is favoured for implementation. It needs nothing beyond the ordinary unicast routing table that every router already has — no sequence numbers to remember, no list of destinations in the packet and no explicit spanning tree — and it still sends each packet over each link at most once in each direction. The sink tree is optimal in packet count but requires every router to know the spanning tree.
Marking points:
- Sink tree (spanning tree) broadcast : the source sends the packet down its own sink tree — each router copies it onto every tree line except the one it arrived …
- Reverse path forwarding (RPF) : when a broadcast packet arrives, the router checks whether it came in on the line it would itself use to send packets to the source.
- The two methods.
- How to count, on whatever figure you get.
- Which is favoured: RPF is favoured for implementation.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-104
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: AOS Quiz 2 2026, Q10 (2 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: Briefly discuss the protocol to handle congestion with Explicit Congestion Notification (ECN).
Answer: **The protocol.** ECN is a form of traffic throttling that does not create any extra packets. A router that is experiencing congestion (its queueing delay is building up) **tags** a packet it forwards, by setting a bit in the packet header, instead of dropping it or sending a choke packet. The packet continues to the receiver. The receiver sees the mark and **informs the sender in its next acknowledgement**. The sender then slows down, just as it would have after a choke packet.

**Key, in the professor's words:** the router can tag any packet it forwards to signal that it is experiencing congestion; when the network delivers the packet, the receiver informs the sender about the congestion through an ack message.

**Why it is better than the alternatives:** a choke packet adds load to a network that is already congested; dropping a packet (or RED) wastes the work already done on it. ECN signals congestion without losing anything. Its cost is that the signal takes a full round trip to reach the sender, during which congestion can worsen.
Marking points:
- the router can tag any packet it forwards to signal that it is experiencing congestion; when the network delivers the packet, the receiver informs the sender about the congestion through an ack message.
- The protocol: ECN is a form of traffic throttling that does not create any extra packets.
- Why it is better than the alternatives: a choke packet adds load to a network that is already congested; dropping a packet (or RED) wastes the work already done on it.
Answer source: professor's key
Weak / low priority: no

### PYQ-105
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN Quiz 9 2020, Q2 (6 marks); OSN End-sem 2022, Q1.10 (1 mark)
Times asked: 2
Reworded versions: "Identify whether the following statement is TRUE or FALSE. If the statement is FALSE, correct it and justify the corrected sentence. If the statement is TRUE, justify it. Restrict the justification to a few (less than five) sentences. "Leaky bucket performs better than token bucket."" (OSN End-sem 2022 (Q1.10))
In syllabus: yes
Question: Explain the purpose of leaky bucket algorithm? What will happen, if you do not implement leaky bucket algorithm?
Answer: **Purpose.** The leaky bucket is a *traffic-shaping* mechanism at the edge of the network. Packets from the host are put into a bucket (a finite queue) and leave it at a **constant rate**, one per clock tick, regardless of how they arrived. A bursty source is therefore converted into a smooth, predictable stream that matches what the network agreed to carry. If the bucket is full when a packet arrives, that packet is **discarded**. Shaping is what makes a service-level agreement checkable and makes resource reservation and QoS guarantees possible at all.

**If it is not implemented:**

- Bursts enter the network unregulated, so router queues build up suddenly — delay and jitter rise, and buffers overflow, so packets are lost.
- The network cannot police what a source actually sends against what it promised, so no guarantee can be enforced and QoS for other flows is destroyed.
- One bursty source can consume the capacity other flows were relying on; repeated loss plus retransmission can push the network toward congestion collapse.

**The true/false part: FALSE.** Corrected: the *token bucket* generally performs better. The leaky bucket enforces a rigid constant output rate, which smooths traffic but also destroys legitimate bursts and makes a source that has been idle gain nothing from its silence. The token bucket accumulates tokens while the source is idle, up to the bucket's capacity, and so allows a variable output rate — a burst is permitted up to the number of saved tokens, after which the long-term rate is still the token rate. It also discards *tokens* rather than packets when it overflows, so no data is lost at the shaper.
Marking points:
- Bursts enter the network unregulated, so router queues build up suddenly — delay and jitter rise, and buffers overflow, so packets are lost.
- The network cannot police what a source actually sends against what it promised, so no guarantee can be enforced and QoS for other flows is destroyed.
- One bursty source can consume the capacity other flows were relying on; repeated loss plus retransmission can push the network toward congestion collapse.
- Purpose: The leaky bucket is a traffic-shaping mechanism at the edge of the network.
- The true/false part: FALSE: Corrected: the token bucket generally performs better.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-106
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN Quiz 9 2020, Q1 (6 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: Explain why FIFO packet scheduling algorithm fails to provide good service for diverse applications?
Answer: **What FIFO does.** One queue per outgoing line; packets are transmitted in the order they arrive, and when the queue is full newly arriving packets are dropped (tail drop). It treats every packet identically.

**Why that fails:**

- **No isolation between flows.** A single aggressive sender — a large file transfer — can fill the queue, so a well-behaved flow's packets are delayed behind it or dropped. The greedy flow is actually *rewarded* for sending more.
- **Delay-sensitive traffic suffers.** Telephony and videoconferencing need low delay and low jitter, but a voice packet that arrives behind a long burst of bulk data waits for the whole burst. Queueing delay varies with the queue's length, which is exactly jitter.
- **Applications have opposite needs** (see the requirements table): email tolerates delay but not loss; audio tolerates loss but not jitter. A single FIFO queue cannot give both what they want, because there is only one order to send in.
- **No notion of importance.** FIFO cannot honour priorities, reservations or service categories, so no QoS guarantee can be built on it.

**The fix:** fair queueing — a separate queue per flow, served round-robin, so each flow gets its own share and a burst in one queue cannot delay another; weighted fair queueing (WFQ) adds per-flow weights so more important flows receive proportionally more of the line.
Marking points:
- No isolation between flows.
- Delay-sensitive traffic suffers.
- Applications have opposite needs (see the requirements table): email tolerates delay but not loss; audio tolerates loss but not jitter.
- No notion of importance.
- What FIFO does: One queue per outgoing line; packets are transmitted in the order they arrive, and when the queue is full newly arriving packets are dropped (tail drop).
- The fix: fair queueing — a separate queue per flow, served round-robin, so each flow gets its own share and a burst in one queue cannot delay another; weighted fair queueing (WFQ) adds per-flow weights so more …
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-107
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN Quiz 9 (alt set) 2020, Q4 (not recorded)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: Explain the issue of the round-robin fair queueing packet scheduling algorithm. (as copied on a student answer sheet)
Answer: **What the algorithm does.** The router keeps a *separate queue for each flow*. When the output line becomes idle, it scans the queues in round robin and takes one packet from each non-empty queue in turn. Each of n flows therefore gets roughly 1/n of the line, and a greedy flow can no longer monopolize it the way it could under a single FIFO queue — which was the whole reason for abandoning FIFO.

**The issue:** round robin gives each flow one *packet* per turn, but packets are not the same size. A host that sends large packets therefore receives **more bandwidth** than a host that sends small packets, even though both are served equally often. The algorithm is fair in packets, not fair in bytes — and bandwidth is measured in bytes.

**The fix: byte-by-byte round robin.** Conceptually, each round drains one *byte* from every queue that has data, so all hosts are given the same priority per byte regardless of how they packetize. Since a router cannot really transmit a byte at a time, it simulates this:

- compute a **virtual time** for each packet — the round number at which that packet *would* finish being sent under byte-by-byte service;
- sort the packets in order of their finishing times;
- transmit whole packets in that order.

The result simulates byte-by-byte service while sending complete packets, and so improves fairness over plain round-robin fair queueing.

**Then WFQ.** Equal shares are not always what you want — a videoconference legitimately deserves more of the line than a mail transfer. **Weighted fair queueing** gives each flow a weight and divides its finish times by that weight, so bandwidth is allocated in proportion to the weights rather than equally.

**Costs to mention:** the router must keep per-flow state and sort by finish time, which is work it did not do under FIFO; and a flow that has been idle can still burst when it returns, so shaping at the edge (the leaky or token bucket) is still needed.
Marking points:
- compute a virtual time for each packet — the round number at which that packet would finish being sent under byte-by-byte service;
- sort the packets in order of their finishing times;
- transmit whole packets in that order.
- What the algorithm does: The router keeps a separate queue for each flow.
- The issue: round robin gives each flow one packet per turn, but packets are not the same size.
- The fix: byte-by-byte round robin: Conceptually, each round drains one byte from every queue that has data, so all hosts are given the same priority per byte regardless of how they packetize.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-108
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN Quiz 7 2020, Q1 (3 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: Briefly explain the importance of "quality of service" and "admission control".
Answer: **Why QoS matters.** Congestion control keeps the network usable on average, but some applications need stronger guarantees than an average: telephony and videoconferencing are strictly delay-sensitive and extremely jitter-sensitive, while audio and video on demand need sustained bandwidth. The alternative to QoS is overprovisioning — buying far more capacity than is needed — which works but is expensive. With QoS mechanisms the network can honour guarantees on bandwidth, delay, jitter and loss, *at the cost of turning some requests down*.

**Why admission control matters.** A guarantee is only credible if the network refuses work it cannot do. Admission control does not set up a new flow or virtual circuit unless the network can carry the added traffic without becoming congested, so an attempt to open one may fail — exactly like the telephone system refusing a call. Without it, accepting every request degrades *every* existing flow, so nobody gets their guarantee and everyone suffers.

Two practical points worth adding: admission control works best when the traffic is first *shaped* (leaky or token bucket), because the router must know what it is being asked to accept, and bursty traffic such as web browsing is much harder to characterize than video. It can also be combined with traffic-aware routing: redraw the topology without the congested routers and look for a route through what remains.
Marking points:
- Why QoS matters: Congestion control keeps the network usable on average, but some applications need stronger guarantees than an average: telephony and videoconferencing are strictly delay-sensitive and extremely jitter-sensitive, while audio and video on demand need sustained bandwidth.
- Why admission control matters: A guarantee is only credible if the network refuses work it cannot do.
- Why QoS matters.
- The alternative to QoS is overprovisioning — buying far more capacity than is needed — which works but is expensive.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-109
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN End-sem 2023, Q6a, Q6b (5 + 5 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: The Net Team has completed the network stack development following the OSI model. Now, they want to perform some tests to check if everything is working fine. They have a machine with an IP address 192.168.1.25, MAC 9B:8C:6D:5E:3E:2F, with a subnet mask of /24. The public IP address of the network is 17.84.18.65, and the IP address of the router is 172.18.12.92; MAC address ID: 7G:98:1C:1A:2D. The team wants to understand how the data transfer can be achieved in the following cases: a. The destination machine has an IP address of 192.168.1.32 with a subnet mask 255.255.255.0, MAC 8A:9B:1C:2F:9F:6D. From L2 perspective, can you help the team understand how this communication can work with reasoning. b. The destination machine has an IP address of 10.8.17.65 with a subnet mask of 255.255.255.0 and a MAC address of 1A:2B:3C:4D:9C:5A. The machine is in a network with an outgoing IP address of the router being 18.72.19.85 and the internal address of the router is 10.8.17.89 /24. Can you explain to the team how the data transfer works in this scenario? (Hint: Think about both L2 and L3)
Answer: **(a) Same subnet.** The host ANDs its own address and the destination with the /24 mask (255.255.255.0): both give 192.168.1.0, so the destination is on the same subnet and can be reached *directly*, with no router.

- It needs a MAC address to build the frame, so it checks its **ARP cache** ; on a miss it broadcasts an ARP request, "who has 192.168.1.32?", to the whole LAN.
- Only 192.168.1.32 replies, with its MAC address, which the sender caches.
- The frame goes out with destination MAC = B's MAC and destination IP = B's IP. A switch forwards it on the learned port; **one hop, nothing is rewritten** .

**(b) Different subnet.** Masking 10.8.17.65 with /24 gives 10.8.17.0 ≠ 192.168.1.0, so the destination is elsewhere and the packet must go to the **default gateway**.

- Layer 3: the IP header carries source 192.168.1.25 and destination 10.8.17.65 — **unchanged for the whole journey** . Each router looks up the destination in its routing table, decrements TTL and recomputes the header checksum.
- Layer 2: the host ARPs for the *gateway's* MAC address, not the destination's, and sends a frame addressed to the router. The router strips that frame, and builds a **new** frame on the next link with its own outgoing interface's MAC as source and the next hop's MAC as destination — found by ARP on that link.
- So the **MAC source and destination are rewritten at every hop** , while the IP addresses and the port numbers stay the same.

**Core sentence (this is the MCQ answer from mid 2025):** MAC addresses are link-local and change at every hop; IP addresses and port numbers are end-to-end and do not change.

The one exception to quote: if the packet passes through a **NAT** box on the way to the public Internet, the NAT rewrites the private source IP and the source port to its own public address and a mapped port — which is precisely why NAT is described as violating layering.
Marking points:
- MAC addresses are link-local and change at every hop; IP addresses and port numbers are end-to-end and do not change.
- It needs a MAC address to build the frame, so it checks its ARP cache ; on a miss it broadcasts an ARP request, "who has 192.168.1.32?", to the whole …
- Only 192.168.1.32 replies, with its MAC address, which the sender caches.
- The frame goes out with destination MAC = B's MAC and destination IP = B's IP.
- Layer 3: the IP header carries source 192.168.1.25 and destination 10.8.17.65 — unchanged for the whole journey .
- Layer 2: the host ARPs for the gateway's MAC address, not the destination's, and sends a frame addressed to the router.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-110
Unit: 3 Networking
Topic: The Network Layer
Type: MCQ
Asked in: OSN Mid-sem 2025, Q6 (3 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: The LangOS network team wants to check the end-to-end network communication capabilities. The team is investigating a scenario of a process on Machine A with IP 192.168.1.10 and MAC AA:BB:CC:DD:EE:01 running on Port number 5000, sends data to a process on Machine B with an IP address of 10.0.0.20, MAC AA:BB:CC:DD:EE:02 on Port number 6000. The packet travels through a router R with two interfaces: LAN side: IP = 192.168.1.1, MAC = AA:BB:CC:DD:EE:11; WAN side: IP = 10.0.0.1, MAC = AA:BB:CC:DD:EE:22. Given this scenario, in your opinion, which of the following statements is correct with respect to the OSI layer?
Options: A) MAC source/destination addresses are rewritten at every hop B) The IP addresses of the source and destination change at each router, but others remain the same C) The port numbers are reassigned by the router (to avoid conflicts), while the IP and MAC addresses remain the same D) Both IP and MAC addresses change at every hop, but the port numbers remain unchanged
Answer: **Answer: (a).**

- Layer 2 addresses are local to one link. When R forwards the frame from the LAN to the WAN, it removes the old Ethernet header and builds a new one: on the LAN the frame goes AA:...:01 to AA:...:11; on the WAN it goes AA:...:22 to AA:...:02. So the MAC source and destination are rewritten at every hop.
- Layer 3 addresses are end to end: the packet carries 192.168.1.10 to 10.0.0.20 on both links (no NAT is mentioned). So (b) and (d) are wrong.
- Layer 4 port numbers (5000 to 6000) are end to end too and are not touched by a router; ports are rewritten only by a NAT device. So (c) is wrong.
Marking points:
- Chooses (a).
- MAC addresses are per link and rewritten at each router.
- IP addresses stay the same end to end (no NAT).
- Ports are not changed by a router.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-111
Unit: 3 Networking
Topic: The Network Layer
Type: MCQ
Asked in: OSN End-sem 2023, Q7 (3 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: The Net Team, in order to test their network stack, has decided to connect a machine with IndixOS to a network (172.18.20.x/24). However, the team wanted to check with you how the host machine can get an IP address in the given network. What can be the protocol that can be leveraged, and how does it work?
Options: A) DNS B) HTTP C) DHCP D) ARP
Answer: **Answer: (c) DHCP.**

How it works (four messages, all over UDP, ports 67 and 68):

1. **DHCPDISCOVER:** the host has no address yet, so it broadcasts to 255.255.255.255 from 0.0.0.0.
2. **DHCPOFFER:** a DHCP server on the 172.18.20.x/24 network offers a free address, for example 172.18.20.57.
3. **DHCPREQUEST:** the host broadcasts that it accepts that offer.
4. **DHCPACK:** the server confirms. The address is leased for a fixed time and must be renewed.

Along with the IP address, DHCP gives the subnet mask (/24), the default gateway and the DNS servers.

Why not the others: DNS maps names to IP addresses; ARP maps an IP address to a MAC address on the LAN; HTTP is an application protocol.
Marking points:
- Chooses DHCP.
- DISCOVER, OFFER, REQUEST, ACK, with broadcast at the start.
- Lease with renewal.
- Also gives mask, gateway, DNS.
- Why DNS, ARP, HTTP do not assign addresses.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-112
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN End-sem 2025, Q6 (10 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes (part b also touches DNS, an application-layer protocol)
Question: A node running AgentOS connects to a network without having any IP address assigned. Immediately after joining, a user process attempts to send an HTTP request to http://anotherdomain.com (server IP: 179.20.10.6). The AgentOS team requires your help in understanding the end-to-end sequence of steps from the moment the node connects until the HTTP request is ready to leave the link layer and move toward the next hop. a. Describe what the Operating System must provide to enable network communication. b. Explain the mechanisms the node uses to acquire its own IP address and to resolve the destination server's IP address. c. Describe the activities at the link layer that prepare the HTTP request for transmission toward the next hop (excluding network-layer routing details).
Answer: **(a) What the OS must provide (2).** The protocol stack itself — implementations of TCP/UDP, IP, ARP and the link-layer protocol — living in the kernel; **device drivers** for the network interface card; a **socket API** (the Berkeley sockets primitives: socket, bind, listen, connect, send, receive, close) so that user processes can reach the stack through system calls; buffers for send and receive queues, with the associated blocking and interrupt handling; and the configuration state: its own IP address, mask, default gateway, DNS server and ARP cache.

**(b) Getting an address, then resolving one (4).**

- **DHCP** gives the node its own address. With no IP address it cannot be addressed individually, so it *broadcasts* a DHCP DISCOVER from 0.0.0.0 to 255.255.255.255; a DHCP server replies with an OFFER; the node sends a REQUEST for that offer; the server confirms with an ACK. The reply carries not only the IP address but the subnet mask, the default gateway and the DNS server's address, and it is a **lease** with a finite lifetime that must be renewed.
- **DNS** resolves the name. The node sends a DNS query for `anotherdomain.com` (normally UDP to port 53) to the resolver it just learned from DHCP. The resolver walks the hierarchy — root, then the .com servers, then the domain's authoritative server — and returns **179.20.10.6** , which is cached for its TTL.

**(c) Down the stack, layer by layer (4).**

- **Application** : the browser builds the HTTP request text — `GET / HTTP/1.1` with a Host header — and writes it to a socket opened to 179.20.10.6 port 80.
- **Transport** : TCP first establishes a connection with the *three-way handshake* (SYN, SYN-ACK, ACK), choosing an ephemeral source port. It then segments the byte stream, adds the TCP header with source and destination ports, sequence and acknowledgement numbers, window and checksum, and keeps the data buffered until it is acknowledged.
- **Network** : IP adds a header with source = the node's new address, destination = 179.20.10.6, plus TTL and a header checksum. Masking shows the destination is outside the local subnet, so the packet is sent to the default gateway.
- **Link** : the node needs the gateway's MAC address, so it **ARPs** for it (broadcast query, unicast reply, cached). The frame is then built with source MAC = the node's NIC, destination MAC = the gateway, a CRC appended, and the MAC sublayer waits for the medium before transmitting.

**The sentence that ties it together:** the packet leaves carrying the *end-to-end* IP address of the server but the *link-local* MAC address of the very next hop.
Marking points:
- DHCP gives the node its own address.
- DNS resolves the name.
- Application : the browser builds the HTTP request text — GET / HTTP/1.1 with a Host header — and writes it to a socket opened to 179.20.10.6 port 80.
- Transport : TCP first establishes a connection with the three-way handshake (SYN, SYN-ACK, ACK), choosing an ephemeral source port.
- Network : IP adds a header with source = the node's new address, destination = 179.20.10.6, plus TTL and a header checksum.
- Link : the node needs the gateway's MAC address, so it ARPs for it (broadcast query, unicast reply, cached).
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-113
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN End-sem 2025, Q9b(i), Q9b(ii) (4 + 3 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes (part ii, OSPF vs BGP, is network-layer routing; BGP is covered in Tanenbaum, less in the slides)
Question: The router described above is in an Autonomous System (AS 300). Considering a node with a public IP address 179.81.26.18 in this autonomous system wants to send data to another node in another autonomous system (AS 700) with an IP address 17.65.21.89. Given this scenario: i. Explain how such a communication can work using different protocols. ii. Do we need different protocols like OSPF and BGP, or will one protocol suffice for the entire internet routing? Explain.
Answer: **(i) How it works.** An *autonomous system* is a network under one administrative authority with its own routing policy. Inside AS 300, routers use an **interior gateway protocol** — OSPF, a link-state algorithm: each router discovers its neighbours, floods link-state packets describing its links and costs, builds the complete map and runs a shortest-path computation. The packet is forwarded hop by hop on that basis to the AS's border router.

Between autonomous systems, the border routers speak **BGP**, an exterior gateway protocol of the path-vector family: each AS advertises which prefixes it can reach *and the full AS path* to them, so AS 300's border router learns that AS 700's prefix is reachable via, say, AS 300 → AS 500 → AS 700. BGP chooses among such paths by *policy* — business agreements about whose traffic an AS will carry — not simply by shortest distance, and the AS path also makes loops detectable, since an AS rejects any path already containing itself. Inside AS 700, OSPF again carries the packet to the destination host. Through all of this, the IP addresses stay fixed while each hop's MAC addresses are rewritten and the TTL falls.

**(ii) Why two protocols are needed.** One protocol would not do, for three reasons:

- **Scale.** A link-state protocol requires every router to hold a map of the whole area and recompute shortest paths when anything changes. Running that over the entire Internet is impossible in memory, CPU and bandwidth — this is exactly the argument for hierarchical routing, and AS-level routing *is* that hierarchy.
- **Policy versus metric.** Inside one AS the goal is simply performance, so a shortest-path metric is right. Between ASes the goal is to honour commercial relationships: an AS may refuse to carry transit traffic for a competitor even though that path is shorter. A metric-only protocol cannot express "do not route this through that neighbour".
- **Autonomy and trust.** Each AS wants to choose its own internal protocol and metrics, and must not be forced to reveal its internal topology to others. BGP exchanges only reachability and AS paths, keeping internals private.

**Core sentence:** OSPF optimizes a path inside one administrative domain; BGP chooses a path between domains by policy. Those are different problems, so they need different protocols.
Marking points:
- OSPF optimizes a path inside one administrative domain; BGP chooses a path between domains by policy.
- Policy versus metric.
- Autonomy and trust.
- (i) How it works: An autonomous system is a network under one administrative authority with its own routing policy.
- (ii) Why two protocols are needed: One protocol would not do, for three reasons:
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-114
Unit: 3 Networking
Topic: The Network Layer
Type: written
Asked in: OSN Mid-sem 2025, Bonus 1 (2 (bonus))
Times asked: 1
Reworded versions: none
In syllabus: yes (IPv6 is network layer)
Question: Bonus: The LangOS team has been thinking of using IPv6 and would like to know some details from you. What part of the IPv6 header can be used to track the path of a package in a network? How is it able to track it?
Answer: Two fields of the IPv6 base header are relevant:

- **Flow Label (20 bits):** the source puts the same label on every packet of one flow. Routers can recognise the packets of that flow without looking deeper into the packet and keep per-flow state, so the flow can be followed and handled consistently along its path (for example, kept on the same path, or given its reserved quality of service).
- **Hop Limit (8 bits):** set by the source and decremented by one at every router; the packet is discarded when it reaches 0. Tools such as traceroute send packets with Hop Limit 1, 2, 3, ...; each router where the limit runs out returns an ICMPv6 "time exceeded" message, which reveals the routers on the path one by one.
Marking points:
- Names the Flow Label and what it does.
- Names the Hop Limit, decremented per router.
- Explains traceroute-style path discovery with ICMPv6 time exceeded.
Answer source: written by Claude, no key
Weak / low priority: no

### PRED-60
Unit: 3 Networking
Topic: The Network Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers)
In syllabus: yes
Question: The Internet chose a connectionless datagram network layer, yet quality of service is easier to provide with virtual circuits. Justify the datagram choice, and explain how MPLS recovers some of the benefit.
Answer: **Why datagrams.** The design goals for the network layer were independence from router technology, shielding the transport layer from topology, and a uniform numbering plan. A connectionless service meets all three with almost no machinery: SEND PACKET and RECEIVE PACKET, with a destination address in every packet and no ordering or flow control in the network. The practical benefits follow — no setup delay before the first packet, no per-connection state in routers (so routers scale and are cheap), and **robustness**: when a router fails, only the packets inside it are lost, and later packets simply route around the failure. That robustness was the original design priority of the Internet.

**What it costs.** Packets of the same message may take different paths and arrive out of order, so reordering and reliability must be done end-to-end in the transport layer, and the network cannot easily reserve resources — which is why QoS and congestion handling are hard in a pure datagram network, especially for real-time traffic.

**MPLS.** Label switching adds a virtual-circuit-like path *below* the IP layer: a 20-bit label is wrapped around the packet and routers forward on the label rather than searching the IP address, following an established path. ISPs use it for QoS and traffic engineering while keeping IP's connectionless model above it.
Marking points:
- Why datagrams: The design goals for the network layer were independence from router technology, shielding the transport layer from topology, and a uniform numbering plan.
- What it costs: Packets of the same message may take different paths and arrive out of order, so reordering and reliability must be done end-to-end in the transport layer, and the network cannot easily reserve resources — which …
- MPLS: Label switching adds a virtual-circuit-like path below the IP layer: a 20-bit label is wrapped around the packet and routers forward on the label rather than searching the IP address, following an established path.
Answer source: written by Claude, no key
Weak / low priority: no

### PRED-61
Unit: 3 Networking
Topic: The Network Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers); same section as PYQ-105, PYQ-106, PYQ-107, PYQ-108
In syllabus: yes
Question: Distinguish congestion control from flow control. When a router must shed load, how does it decide which packets to drop?
Answer: **Congestion control** concerns the whole network: it involves the behaviour of all hosts and all routers, and the problem is that the total offered load exceeds what the network can carry. **Flow control** concerns the traffic between one particular sender and one particular receiver, and the problem is that the receiver cannot keep up. The two are independent: a fast receiver on a congested network still needs congestion control, and a slow receiver on an idle network still needs flow control.

**Load shedding.** When routers are inundated with packets they cannot handle, they throw some away. Which ones depends on the application, so the application must *mark importance* on its packets:

- **Wine policy** — older is better: for file transfer, an old packet is more valuable than a new one, because discarding packet n forces everything after it to be resent anyway.
- **Milk policy** — fresher is better: for real-time traffic, a new packet is more valuable, since an old audio or video frame is useless once its play-out moment has passed.

**RED** improves on dropping at the last moment: routers keep a running average of queue length and begin dropping packets at random once it exceeds a threshold. Faster senders have more packets in the queue and so lose more of them, notice the missing acknowledgements, and slow down before the queue actually overflows.
Marking points:
- Wine policy — older is better: for file transfer, an old packet is more valuable than a new one, because discarding packet n forces everything after it to be resent …
- Milk policy — fresher is better: for real-time traffic, a new packet is more valuable, since an old audio or video frame is useless once its play-out moment has passed.
- Congestion control concerns the whole network: it involves the behaviour of all hosts and all routers, and the problem is that the total offered load exceeds what the network can carry.
- Load shedding: When routers are inundated with packets they cannot handle, they throw some away.
- RED improves on dropping at the last moment: routers keep a running average of queue length and begin dropping packets at random once it exceeds a threshold.
Answer source: written by Claude, no key
Weak / low priority: no

### PRED-62
Unit: 3 Networking
Topic: The Network Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers); same section as PYQ-109, PYQ-112, PYQ-113
In syllabus: yes
Question: A host is configured as 172.18.20.37/24. Which of 172.18.20.200 and 172.18.21.5 are on its own subnet? What happens differently for the other one?
Answer: The /24 mask is 255.255.255.0, so the network part is the first three octets.

- 172.18.20.37 → network **172.18.20.0**
- 172.18.20.200 → network **172.18.20.0** — **same subnet**
- 172.18.21.5 → network **172.18.21.0** — **different subnet**

**Same subnet (…20.200):** delivered directly. The host ARPs for that machine's own MAC address and sends the frame straight to it over the LAN; no router is involved.

**Different subnet (…21.5):** the host sends the packet to its **default gateway**. It ARPs for the *gateway's* MAC, and the frame carries the gateway's MAC as destination while the IP header still names 172.18.21.5. The router then forwards it on, rewriting the MAC addresses for the next link and decrementing TTL, while the IP addresses remain unchanged.

Note the usable range on the subnet: 172.18.20.1 to 172.18.20.254, since .0 is the network address and .255 is the broadcast address.
Marking points:
- 172.18.20.37 → network 172.18.20.0
- 172.18.20.200 → network 172.18.20.0 — same subnet
- 172.18.21.5 → network 172.18.21.0 — different subnet
- Same subnet (…20.200): delivered directly.
- Different subnet (…21.5): the host sends the packet to its default gateway.
Answer source: written by Claude, no key
Weak / low priority: no

## The Transport Layer

### PYQ-115
Unit: 3 Networking
Topic: The Transport Layer
Type: written
Asked in: OSN End-sem 2023, Q5a (3 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: The web application is a simple process that will be sending a stream of data 11100110011001101101010101010101 to another process in a different machine (running IndixOS). a. The Net Team would first like to understand what kind of APIs the OS needs to provide to make this communication happen (based on Unix implementation) and what is the role of the OS when such communication happens.
Answer: **The API: Berkeley sockets**, the primitives that began with TCP on UNIX, where a *socket* is a transport endpoint identified by an IP address plus a port number.

| Primitive | Meaning |
| --- | --- |
| SOCKET | Create a new communication endpoint |
| BIND | Associate a local address with the socket |
| LISTEN | Announce willingness to accept connections; set the queue size |
| ACCEPT | Passively establish an incoming connection |
| CONNECT | Actively attempt to establish a connection |
| SEND / RECEIVE | Send and receive data over the connection |
| CLOSE | Release the connection |

**The OS's role.** The protocol stack itself lives in the kernel: TCP/UDP, IP, ARP and the link layer are kernel code, reached through system calls, so the application never touches the network directly. The OS owns the device drivers for the network interface and handles its interrupts; it maintains the send and receive **buffers** for every connection, blocking the process when a buffer is full or empty and waking it when the state changes; it keeps the per-connection state (sequence numbers, window, timers) and runs the retransmission timers; it demultiplexes arriving segments to the right socket by port number; and it enforces protection — ports below 1024 can only be bound by privileged users.

**Core sentence:** the OS turns an unreliable packet network into a reliable byte stream that a process can use with ordinary read and write calls, and sockets are the interface where that happens.
Marking points:
- the OS turns an unreliable packet network into a reliable byte stream that a process can use with ordinary read and write calls, and sockets are the interface where that happens.
- The API: Berkeley sockets, the primitives that began with TCP on UNIX, where a socket is a transport endpoint identified by an IP address plus a port number.
- The OS's role: The protocol stack itself lives in the kernel: TCP/UDP, IP, ARP and the link layer are kernel code, reached through system calls, so the application never touches the network directly.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-116
Unit: 3 Networking
Topic: The Transport Layer
Type: written
Asked in: OSN Quiz 9 2020, Q3 (6 marks); OSN End-sem 2022, Q10 (5 marks); OSN End-sem 2025, Q5 (3 marks)
Times asked: 3
Reworded versions: "Issues in connection establishment and how the three-way handshake solves them (the question text is only partly legible in the scan; the key answers with the forbidden region and fresh sequence numbers)." (OSN End-sem 2022); "As part of diagnosing intermittent network failures in AgentOS, the networking team asks you to verify whether the system is correctly following the TCP three-way handshake. A TCP client module P in AgentOS initiates a connection to a remote TCP service Q. Let Np denote the sequence number in the SYN sent from P to Q, and let Nq denote the acknowledgement number in the SYN-ACK sent from Q back to P. Based on standard TCP behaviour, which of the following statements is/are CORRECT and why? (a) The sequence number Np is randomly chosen (b) The sequence number is set to 0 (c) The acknowledgement number is Nq = Np (d) The acknowledgement number is Nq = Np + 1" (OSN End-sem 2025)
In syllabus: yes
Question: What are the issues of implementing "Connection Establishment" in the transport protocol? Explain the justification of employing three-way hand shake.
Answer: **The issues.** The network may lose, corrupt, delay and duplicate packets, and the key danger is the **delayed duplicate**: a connection request takes the longest route, the sender times out and sends it again, and the receiver eventually gets both. If the stale copy is accepted as new, a connection is opened that nobody asked for, and stale *data* from a previous connection can be accepted inside it.

- Loss and corruption are handled by ARQ and checksums; that part is easy.
- Preventing packets from looping by restricting the network design is difficult; hop counters and timestamps help but are not enough — and it is not only the data packets that must die, *all the acknowledgements must be dead too* .
- So the rule is: **do not reuse a sequence number within twice the maximum segment lifetime** (2T = 240 seconds), deriving the initial sequence number from a clock.
- That raises its own issue: keeping sequence numbers out of the **forbidden region** . A host that sends too much data too fast runs its sequence numbers into the forbidden curve; a host that sends slower than the clock rate also gets into trouble.

**Why the three-way handshake solves it.** Because no state survives from a previous connection, **both hosts contribute fresh sequence numbers each time a connection is set up**:

1. Host 1 chooses a sequence number x and sends CR(x).
2. Host 2 replies with ACK(x) and its own fresh sequence number y.
3. Host 1 acknowledges host 2's choice with ACK(y), and data flows.

Now test it against the bad cases. If an *old duplicate CR* arrives out of nowhere, host 2 replies with a fresh y, but host 1 — which never opened a connection — rejects it, so nothing is established. If an *old duplicate CR and an old duplicate data packet* both arrive, the stale data acknowledges some old sequence number z rather than the freshly chosen y, so it is rejected too. The freshness of y is what makes replay impossible.

**For the MCQ:** the initial sequence number Np is *randomly chosen* (precisely so that it cannot be guessed or replayed), and the acknowledgement number in the SYN-ACK is **Np + 1**, not Np, because an acknowledgement names the next byte expected and the SYN flag consumes one sequence number.
Marking points:
- Loss and corruption are handled by ARQ and checksums; that part is easy.
- Preventing packets from looping by restricting the network design is difficult; hop counters and timestamps help but are not enough — and it is not only the data packets …
- So the rule is: do not reuse a sequence number within twice the maximum segment lifetime (2T = 240 seconds), deriving the initial sequence number from a clock.
- That raises its own issue: keeping sequence numbers out of the forbidden region .
- Host 1 chooses a sequence number x and sends CR(x).
- Host 2 replies with ACK(x) and its own fresh sequence number y.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-117
Unit: 3 Networking
Topic: The Transport Layer
Type: written
Asked in: AOS End-sem 2025, Q5 (5 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: In TCP protocol, explain the issues with the connection establishment and connection release. Briefly explain the solutions.
Answer: Answer it as two halves with the same shape: *issue → solution*.

**1. Establishment — the issue.** The network can lose, corrupt, delay and **duplicate** packets. A delayed duplicate of an old connection request (or of old data) can arrive long after the connection it belonged to has ended; if it is accepted, a connection nobody asked for is opened, or a transaction such as a money transfer is carried out twice. Loss is easy (timeouts and retransmission); delayed duplicates are the real problem.

**Establishment — the solutions.**

- Limit packet lifetime (hop counts, timestamps) and **never reuse a sequence number within 2 × MSL** (maximum segment lifetime); TCP takes its initial sequence number from a clock, so old packets carry numbers that are no longer valid, and the sender must keep out of the forbidden region.
- **The three-way handshake** : host 1 sends SYN with a fresh sequence number x; host 2 replies SYN+ACK acknowledging x + 1 and choosing its own fresh y; host 1 acknowledges y + 1. Because both sides contribute a fresh number, an old duplicate SYN draws a SYN+ACK that host 1 rejects, and old data carrying an acknowledgement of some old z instead of y is rejected too.

**2. Release — the issue.** *Asymmetric* release (one side hangs up, as on a telephone) is abrupt and can lose data still in flight. *Symmetric* release closes each direction separately, but then both sides must agree that they are done, and the **two-army problem** shows that no protocol can make that agreement certain over an unreliable channel: whoever sends the last message can never know it arrived, so a three-way, four-way or n-way exchange does not help.

**Release — the solution TCP uses.** Give up on certainty and use timers. Each side sends a FIN when it has finished sending, and that direction is closed when the FIN is acknowledged; the other direction keeps working until its own FIN (so it is a four-segment exchange, or three when the second FIN is piggybacked on the ACK). If a FIN gets no answer within two maximum packet lifetimes, the sender releases anyway, and the side that sends the last ACK waits in TIME_WAIT (2 × MSL) so that a lost final ACK can be repeated and old segments die out before the port pair is reused.

**Core sentence:** establishment is solved exactly (fresh sequence numbers plus the three-way handshake defeat delayed duplicates), but release can only be solved in practice (symmetric FINs plus timers), because the two-army problem proves that perfect agreement is impossible.
Marking points:
- establishment is solved exactly (fresh sequence numbers plus the three-way handshake defeat delayed duplicates), but release can only be solved in practice (symmetric FINs plus timers), because the two-army problem proves that perfect agreement is impossible.
- Limit packet lifetime (hop counts, timestamps) and never reuse a sequence number within 2 × MSL (maximum segment lifetime); TCP takes its initial sequence number from a clock, so old …
- The three-way handshake : host 1 sends SYN with a fresh sequence number x; host 2 replies SYN+ACK acknowledging x + 1 and choosing its own fresh y; host 1 …
- 1. Establishment — the issue: The network can lose, corrupt, delay and duplicate packets.
- Establishment — the solutions.
- 2. Release — the issue: Asymmetric release (one side hangs up, as on a telephone) is abrupt and can lose data still in flight.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-118
Unit: 3 Networking
Topic: The Transport Layer
Type: written
Asked in: OSN Quiz 9 (alt set) 2020, Q1 (not recorded); OSN End-sem (question list) 2021, Q8 (not given); OSN End-sem 2022, Q2.2 (3 marks)
Times asked: 3
Reworded versions: none
In syllabus: yes
Question: Explain the reason why transport protocols use larger size sliding windows as compared to the size of sliding windows of data link layer?
Answer: **Core sentence:** the window must cover the bandwidth-delay product, and the transport layer's delay is far larger and far more variable than the link layer's, so many more segments are unacknowledged in flight.

- **The link layer runs over a direct connection** between two adjacent machines. The delay is small (microseconds), predictable, and acknowledgements come back promptly, so a small window keeps the link busy.
- **The transport layer runs across the whole network** , through many routers. The delay is milliseconds and highly variable, because packets queue at every hop and may take different routes, and acknowledgements can be delayed unpredictably.
- Since w ≥ 2BD + 1, a round-trip time measured in milliseconds over a fast path means a large number of segments must be outstanding simply to stop the sender idling.
- Consequence to mention: the host therefore needs substantial buffer space to hold all the unacknowledged segments, for every connection, which is why transport buffers are allocated dynamically rather than fixed per link.
Marking points:
- the window must cover the bandwidth-delay product, and the transport layer's delay is far larger and far more variable than the link layer's, so many more segments are unacknowledged in flight.
- The link layer runs over a direct connection between two adjacent machines.
- The transport layer runs across the whole network , through many routers.
- Since w ≥ 2BD + 1, a round-trip time measured in milliseconds over a fast path means a large number of segments must be outstanding simply to stop the sender …
- Consequence to mention: the host therefore needs substantial buffer space to hold all the unacknowledged segments, for every connection, which is why transport buffers are allocated dynamically rather than fixed …
Answer source: professor's key
Weak / low priority: no

### PYQ-119
Unit: 3 Networking
Topic: The Transport Layer
Type: written
Asked in: OSN Quiz 9 2020, Q4 (6 marks); OSN Quiz 9 (alt set) 2020, Q2 (not recorded)
Times asked: 2
Reworded versions: none
In syllabus: yes
Question: Explain the issue of regulating the sending rates to obtain desirable bandwidth controlling the congestion? Additive Increase Multiplicative Decrease (AIMD)?
Answer: **Two different reasons to slow down.** A sender may have to slow down because the *receiver* is not fast enough — that is flow control, a fast network feeding a low-capacity receiver — or because the *network* is not fast enough, which is congestion: a slow network feeding a high-capacity receiver. Both end up adjusting the same sending rate, but they are different problems and the transport layer must handle both.

**What a desirable allocation looks like.** It must be *efficient* (high goodput, low delay — pushing past the knee of the goodput curve only adds queueing delay and eventually causes collapse); it must be *fair*, in the max-min sense that no flow's bandwidth can be increased without reducing that of a flow with an equal or smaller share, so no flow starves; and it must *converge* quickly when the traffic pattern changes.

**The difficulty.** The sender cannot see the network's state; it only gets signals (loss, delay, or an explicit mark such as ECN), and those arrive a round trip late. Worse, if every flow adjusts its rate in the same proportional way, the *ratio* between two flows never changes, so an unfair split stays unfair forever even if the total is correct.

**The answer: AIMD (additive increase, multiplicative decrease).** In the absence of a congestion signal the sender increases its rate additively, by a fixed small amount per round trip — a cheap probe for spare capacity. On a congestion signal it decreases multiplicatively, halving the rate — a sharp retreat, because congestion must be relieved quickly. Plotting two flows' rates shows why this works: additive steps move parallel to the fairness line and multiplicative cuts move toward it, so the allocation spirals in to the point that is both fair and efficient. **TCP uses AIMD for exactly this reason**, implemented as a congestion window.

**One caveat to add:** AIMD assumes loss means congestion. On a wireless link, packets are lost to transmission errors, so a naive TCP would keep halving its rate and run very slowly; wireless links therefore use ARQ to mask errors locally before TCP ever sees them.
Marking points:
- Two different reasons to slow down: A sender may have to slow down because the receiver is not fast enough — that is flow control, a fast network feeding a low-capacity receiver — or because the network is not fast enough …
- What a desirable allocation looks like: It must be efficient (high goodput, low delay — pushing past the knee of the goodput curve only adds queueing delay and eventually causes collapse); it must be fair, in the max-min sense that no …
- The difficulty: The sender cannot see the network's state; it only gets signals (loss, delay, or an explicit mark such as ECN), and those arrive a round trip late.
- One caveat to add: AIMD assumes loss means congestion.
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-120
Unit: 3 Networking
Topic: The Transport Layer
Type: MCQ
Asked in: OSN End-sem 2025, Q2 (3 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: EstimatedRTT = 50 ms, DevRTT = 4 ms, the latest RTT sample is 60 ms, α = 0.125 and β = 0.25. What is the next timeout interval?
Options: A) 67.25 ms B) 72.00 ms C) 51.25 ms D) 70.75 ms
Answer: **Answer: (b) 72.00 ms.**

**Step 1 — update the smoothed RTT.** Here α weights the *new sample*:  
 EstimatedRTT = (1 − α)·EstimatedRTT + α·SampleRTT = 0.875 × 50 + 0.125 × 60 = 43.75 + 7.5 = **51.25 ms**

**Step 2 — update the deviation**, using the *newly updated* EstimatedRTT:  
 DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT| = 0.75 × 4 + 0.25 × |60 − 51.25| = 3 + 0.25 × 8.75 = 3 + 2.1875 = **5.1875 ms**

**Step 3 — the timeout.**  
 TimeoutInterval = EstimatedRTT + 4 × DevRTT = 51.25 + 4 × 5.1875 = 51.25 + 20.75 = **72.00 ms**

The trap in the distractors

**(c) 51.25** is the new EstimatedRTT alone — the answer if you forget the *+ 4 × DevRTT*.  
 **(a) 67.25** is 51.25 + 4 × 4 — the answer if you keep the *old* DevRTT instead of updating it.  
 Note also the ordering question: RFC 6298 computes RTTVAR *before* updating SRTT, using the old SRTT, which would give 0.75 × 4 + 0.25 × |50 − 60| = 5.5 and a timeout of 73.25 ms. That value is not offered, so the intended convention is the textbook one above — update EstimatedRTT first, then use it in DevRTT. In an exam, state which order you used.

**Why the formula looks like this:** acknowledgement arrival times in TCP have a much flatter probability density than in the link layer, so the variation matters as much as the mean; adding four deviations makes a needless retransmission unlikely while still reacting quickly when the network is stable.
Marking points:
- Final answer: (a) 67.25 is 51.25 + 4 × 4 — the answer if you keep the old DevRTT instead of updating it.
- Step 1 — update the smoothed RTT.
- Step 2 — update the deviation, using the newly updated EstimatedRTT: DevRTT = (1 − β)·DevRTT + β·|SampleRTT − EstimatedRTT| = 0.75 × 4 + 0.25 × |60 − 51.25| = 3 + 0.25 × …
- Step 3 — the timeout: TimeoutInterval = EstimatedRTT + 4 × DevRTT = 51.25 + 4 × 5.1875 = 51.25 + 20.75 = 72.00 ms
- (c) 51.25 is the new EstimatedRTT alone — the answer if you forget the + 4 × DevRTT.
- Why the formula looks like this: acknowledgement arrival times in TCP have a much flatter probability density than in the link layer, so the variation matters as much as the mean; adding four deviations makes a needless retransmission unlikely while still …
Answer source: written by Claude, no key
Weak / low priority: no

### PYQ-121
Unit: 3 Networking
Topic: The Transport Layer
Type: MCQ
Asked in: OSN Mid-sem 2025, Q4 (3 marks)
Times asked: 1
Reworded versions: none
In syllabus: yes
Question: The LangOS networking group is debugging a connection and prints out part of the TCP header. One of the junior engineers claims: "The TCP header must always include an ACK number, otherwise the receiver won't know which byte to expect next." They wanted to know the correct explanation from you.
Options: A) ACK field is always present in the TCP header, but the ACK bit in the flags determines if the value is valid B) The ACK field is included only when the ACK bit is set; otherwise, it is not part of the header C) The ACK number exists only in the three-way handshake and is dropped after connection setup D) The ACK field is optional and used only if the application enables reliability
Answer: **Answer: (a).** The TCP header has a *fixed* 20-byte base layout, and the 32-bit acknowledgement number is one of its fixed fields — it occupies those four bytes in every segment, including the very first SYN. What varies is whether its contents mean anything, and that is what the **ACK flag** says: ACK = 1 means the acknowledgement number is valid.

So in the first SYN of a connection the ACK bit is 0 and the field is ignored; in the SYN-ACK and in every segment thereafter the ACK bit is 1 and the field carries the next byte expected.

**Why the others are wrong.** (b) would make the header variable in a way the fixed layout does not allow — optional data goes in the options area, after the fixed fields, which is what the header-length field measures. (c) is wrong because acknowledgements continue for the whole connection; that is how the sliding window advances. (d) is wrong because reliability is not an application switch: TCP is always reliable, and an application that wants no reliability uses UDP instead.
Marking points:
- Final answer: Answer: (a): The TCP header has a fixed 20-byte base layout, and the 32-bit acknowledgement number is one of its fixed fields — it occupies those four bytes in every segment, including the very first SYN.
- Why the others are wrong: (b) would make the header variable in a way the fixed layout does not allow — optional data goes in the options area, after the fixed fields, which is what the header-length field measures.
Answer source: written by Claude, no key
Weak / low priority: no

### PRED-63
Unit: 3 Networking
Topic: The Transport Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers)
In syllabus: yes
Question: Why do real-time applications use UDP rather than TCP, and what must they add on top of it?
Answer: **Why not TCP.** TCP guarantees a reliable, ordered byte stream, and it buys that guarantee with retransmission: a lost segment is sent again and everything after it waits. For audio or video that is the wrong trade — a packet that arrives after its play-out moment is useless, so the retransmission has added delay for nothing, and TCP's congestion control also varies the rate in a way a constant-rate stream cannot follow. From the application-requirements table, these applications are extremely sensitive to delay and jitter but tolerate loss: people do not notice short pauses or skipped frames.

**What UDP gives.** A thin layer over IP: ports to reach the right process, a length, and a checksum covering the segment and the IP pseudoheader for an end-to-end integrity check. Nothing else, so nothing is retransmitted and nothing is held back.

**What the application must add**, which is what **RTP** does, usually inside the application itself: a media type field, sequence numbers and timestamps so streams can be synchronized and losses detected, RTCP for management, and at the receiver a **playout buffer** that deliberately delays packets so that they can be played at a constant rate despite varying arrival times. The buffer is sized by the *jitter*, not the propagation delay.
Marking points:
- Why not TCP: TCP guarantees a reliable, ordered byte stream, and it buys that guarantee with retransmission: a lost segment is sent again and everything after it waits.
- What UDP gives: A thin layer over IP: ports to reach the right process, a length, and a checksum covering the segment and the IP pseudoheader for an end-to-end integrity check.
- What the application must add, which is what RTP does, usually inside the application itself: a media type field, sequence numbers and timestamps so streams can be synchronized and losses detected, RTCP for management …
Answer source: written by Claude, no key
Weak / low priority: no

### PRED-64
Unit: 3 Networking
Topic: The Transport Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers); same section as PYQ-120, PYQ-121
In syllabus: yes
Question: Explain the silly window syndrome. How do Clark's algorithm and Nagle's algorithm each attack the problem, and why are two different fixes needed?
Answer: **The syndrome.** The receiving application reads data one byte at a time. Each read frees one byte of buffer, so the receiver advertises a window of one byte; the sender immediately sends a one-byte segment, which is 21 bytes of TCP plus an IP header, and gets a 40-byte acknowledgement back. The connection does an enormous amount of work per byte — the slide counts 162 bytes of bandwidth and four segments for a single character.

**Two different causes need two different fixes:**

- **Clark's algorithm fixes the receiver.** It does not advertise the newly freed space straight away; it waits until a decent amount of space is available — half the buffer, or one maximum segment — and advertises that instead. Until then it keeps saying the window is zero.
- **Nagle's algorithm fixes the sender.** When an application offers data a byte at a time, TCP sends the first piece immediately and *buffers the rest* until that first piece is acknowledged; then everything accumulated goes out as one segment. On a fast connection the acknowledgement comes back quickly and little is delayed; on a slow one, more is batched.
- **Delayed acknowledgements** complete the picture by holding an ack for up to 500 ms so it can ride with data or a window update.

**Why two:** a tiny window advertised by the receiver and a tiny write offered by the application are independent causes, and either one alone recreates the problem. The caveat worth adding is that Nagle's algorithm must be disabled for interactive applications such as games, where an added round-trip of delay matters far more than the wasted bandwidth.
Marking points:
- Clark's algorithm fixes the receiver.
- Nagle's algorithm fixes the sender.
- Delayed acknowledgements complete the picture by holding an ack for up to 500 ms so it can ride with data or a window update.
- The syndrome: The receiving application reads data one byte at a time.
- Why two: a tiny window advertised by the receiver and a tiny write offered by the application are independent causes, and either one alone recreates the problem.
Answer source: written by Claude, no key
Weak / low priority: no

### PRED-65
Unit: 3 Networking
Topic: The Transport Layer
Type: written
Based on: imitates the professor's short explain / justify / compare questions (2020 quizzes, 2022 keys, AOS 2025 papers); same section as PYQ-120, PYQ-121
In syllabus: yes
Question: Describe the phases of TCP congestion control. Why does TCP react differently to a timeout than to three duplicate acknowledgements?
Answer: **The congestion window** (cwnd) limits how many segments may be in the network; the rate is cwnd / RTT, and arriving acknowledgements form an *ACK clock* that paces the sender.

- **Slow start.** Beginning from one segment, cwnd *doubles every round trip* — exponential growth — because the sender has no idea what the network can take and must find out quickly. It keeps the ACK clock going as it grows.
- **Additive increase.** Once cwnd reaches the threshold, growth becomes +1 segment per round trip: a gentle probe, the AI of AIMD.
- **On loss,** the threshold is set to **half** the cwnd at which the loss occurred — the MD of AIMD.

**Why the two signals differ.** A **timeout** means no acknowledgements are coming back at all, so the *ACK clock has stopped*: the sender knows nothing about the current state of the network and must restart from one segment with slow start. That is **TCP Tahoe**.

Three **duplicate acknowledgements** mean the opposite: later segments *are* still arriving, each triggering a repeat ack for the hole, so the clock is alive and the path still works. TCP can therefore retransmit just the missing segment (fast retransmit), halve cwnd and continue with additive increase rather than restarting — **fast recovery**, which gives the classic sawtooth of **TCP Reno**. **SACK** improves this further by letting the receiver list the ranges it actually received, so the sender knows exactly which segments were lost instead of guessing from a single cumulative ack.
Marking points:
- Additive increase.
- On loss, the threshold is set to half the cwnd at which the loss occurred — the MD of AIMD.
- The congestion window (cwnd) limits how many segments may be in the network; the rate is cwnd / RTT, and arriving acknowledgements form an ACK clock that paces the sender.
- Why the two signals differ: A timeout means no acknowledgements are coming back at all, so the ACK clock has stopped: the sender knows nothing about the current state of the network and must restart from one segment with slow …
Answer source: written by Claude, no key
Weak / low priority: no
