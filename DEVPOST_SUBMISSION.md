# FixFast — Devpost Hackathon Submission Package
*Autonomous Emergency Trades & Contractor Dispatch Agent*
**Submission Category:** Enterprise / ML & AI / Communications
**Hackathon:** CALL-E: Your Code Is Calling

---

## 1. Elevator Pitch (The 1-Liner)
**FixFast** is an autonomous phone-dispatch agent that negotiates emergency contractors (plumbers, HVAC, electricians, locksmiths) within strict budget and ETA constraints via **CALL-E**, automatically locking the first qualified technician while mathematically preventing catastrophic double-booking.

---

## 2. Project Overview & Inspiration

### The Problem
When a water pipe bursts at 2:00 AM, a commercial walk-in freezer shuts down at a restaurant, or an electrical panel starts sparking, **every 10 minutes of delay causes thousands of dollars in irreversible physical property damage**.

- **Web forms and emails fail**: Emergency trades are in the field with tools in hand; they only answer live phone calls.
- **The human bottleneck**: A panicked property manager or homeowner has to call 5 to 10 contractors one by one, navigate IVRs, leave voicemails, wait for callbacks, and negotiate emergency premiums.
- **The "Double-Booking" trap**: If a manager panic-calls 3 contractors simultaneously without coordination, all 3 might show up at the door, demanding multiple $150–$300 trip fees.

### The Solution: FixFast
FixFast solves this by transforming **CALL-E** into a goal-driven, sequential conversational dispatch engine:
1. **Intake & Boundary Constraints**: User specifies emergency nature, location, maximum acceptable ETA (e.g. 90 minutes), and budget cap (e.g. $350).
2. **Prioritized Contractor Cascade**: FixFast calls contractor #1. It converses with live receptionists or IVRs, inquires about arrival ETA, and negotiates emergency dispatch fees.
3. **Failover & Escalation**: If contractor #1 is a voicemail, declines, quotes beyond the budget cap, or cannot meet the ETA, FixFast politely terminates and instantly dials contractor #2.
4. **Atomic Booking Lock**: As soon as a qualified contractor agrees within the ETA and budget limits, FixFast confirms the technician, logs their dispatch code, and **immediately cuts off the cascade**, preventing any further outbound dials.
5. **Auditable Grounding**: Spoken terms are cross-referenced with verbatim call transcripts to eliminate AI hallucinations before issuing SMS receipts to tenants and property managers.

---

## 3. How We Built It

- **CALL-E Platform Integration**:
  - Leverages CALL-E's core two-phase calling protocol: `plan_call` (with goal formulation and typed JSON schema) &rarr; user confirmation token &rarr; `run_call` execution &rarr; `get_call_run` polling.
  - Formulates structured system prompts that restrict the agent from committing to rates above the user's budget.
- **Full-Stack Command Center (Next.js 14 App Router)**:
  - **Sequential Dispatch Radar**: Visualizes the live cascade in real time with animated status badges (`DIALING`, `VOICEMAIL`, `OVER BUDGET`, `BOOKING LOCKED`, `PROTECTED`).
  - **Live Audio & Transcript Inspector**: Inspects verbatim dialogue turns between the FixFast agent, IVRs, and emergency dispatchers, alongside the structured JSON output.
  - **Dual-Mode Engine**: Includes a seamless toggle between Live CALL-E and a realistic Dry-Run Simulator so Devpost judges can evaluate complete 3-tier emergency cascades without burning phone credits or requiring live phones.
- **Portable Agent Skill**:
  - Packaged as `skills/fixfast-emergency-dispatch/SKILL.md` for drop-in use across Claude Code, Cursor, OpenClaw, or LangChain agents.

---

## 4. Challenges We Ran Into

- **Preventing Double-Booking Invariants**: Voice calls take anywhere from 30 to 90 seconds. To avoid race conditions where two contractors could accept simultaneously, we designed a strict sequential waterfall state machine with atomic lock states.
- **Audio Grounding vs. Hallucination**: An agent might assume a contractor agreed simply because they sounded polite. FixFast enforces a verification checklist requiring explicit numerical verbal agreement for both arrival minutes and dollar fee before the booking state transitions to `accepted`.
- **Handling Voicemails & Answering Machines**: Detects IVR greetings and voicemail tones within the first 15 seconds to abort early rather than waiting for timeouts.

---

## 5. Accomplishments That We're Proud Of

- **Immediate Real-World Dollar Savings**: Every successful run proves that FixFast stops calling the exact moment a contractor agrees, saving between $150 and $350 in duplicate callout fees every single emergency.
- **High Visual & Audible Polish**: Built an emergency operations command center with dark-mode radar styling, audio waveform animations, and 1-click test scenarios.
- **Judge-Ready Evaluation**: Complete zero-friction demo experience tailored for hackathon reviewers.

---

## 6. What's Next for FixFast

- **Live Contractor Telemetry & GPS Tracking**: Streaming the responding technician's real-time vehicle location onto the FixFast radar map.
- **Insurance Claim Pre-Authorization**: Automatically packaging the verified audio transcript, timestamped photos, and dispatch receipts into an instant insurance claim package for carriers.
- **Inbound Contractor Re-verification**: Handling inbound callbacks if a contractor calls back after a missed call.

---

## 7. 2-Minute Video Demo Script (For Devpost Pitch)

| Timestamp | Visual | Narration / Audio |
|---|---|---|
| **0:00 - 0:25** | High-energy intro. Show picture of burst pipe / flooded apartment at 2:00 AM. | *"It's 2:00 AM. A water pipe bursts in your apartment building, leaking 50 gallons a minute. You need an emergency plumber right now. Web forms and emails don't work—plumbers are in the field and only answer their phones. But if you call 5 plumbers simultaneously, you risk double-booking and paying hundreds in trip fees. Meet FixFast."* |
| **0:25 - 0:50** | Switch to FixFast Dashboard. Click "Burst Water Pipe at 2:00 AM" preset. Point out Max ETA (90 mins) and Budget Cap ($350). | *"FixFast is an autonomous emergency phone dispatch agent built on CALL-E. We set our constraints: maximum ETA 90 minutes, budget cap $350. Now we hit 'Start Emergency Cascade'."* |
| **0:50 - 1:20** | Show Dispatch Radar animating. Call #1 reaches voicemail &rarr; marked skipped. Call #2 quotes $550 &rarr; agent politely declines as over-budget. | *"Watch the sequential cascade in action via CALL-E. Call #1 reaches Apex Plumbers' automated voicemail. FixFast recognizes it's unmonitored and moves immediately to Contractor #2. Bay Area Rooter answers, but quotes $550—our budget cap is $350. FixFast adheres to its safety constraints, declines, and moves to #3."* |
| **1:20 - 1:45** | Call #3 connects with Metro Rooter. Click "View Transcript". Show technician Dave Miller agreed at $220 in 45 mins. Success card pops up! | *"Contractor #3 answers. Dave Miller can arrive in 45 minutes for a $220 fee. FixFast locks the booking! Notice what happens next: all remaining contractors are instantly locked as 'PROTECTED'. Zero duplicate calls. Zero double-booking fees."* |
| **1:45 - 2:00** | Show Confirmed Dispatch Card, SMS preview, and portable `SKILL.md` agent skill. | *"The property manager and tenant receive immediate SMS alerts with the technician's name and ETA. FixFast is fully packaged as a portable Agent Skill ready for the ecosystem. With FixFast and CALL-E, your code isn't just calling—it's saving homes."* |
