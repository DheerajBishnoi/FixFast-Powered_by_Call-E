# FixFast ☎️🚨
### Autonomous Emergency Trades & Contractor Dispatch Agent
*Built with CALL-E for the "CALL-E: Your Code Is Calling" Hackathon 2026*

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![CALL-E](https://img.shields.io/badge/Powered%20by-CALL--E-amber)](https://heycall-e.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## The Problem
When property disasters strike (burst pipes at 2:00 AM, restaurant walk-in coolers failing, broken storefront locks, sparking electric panels), **every 10 minutes of delay causes thousands in physical damage**.

- **Web forms & emails fail**: Technicians in the field only answer live voice calls.
- **The human bottleneck**: Property managers spend precious hours calling down phone lists in the middle of the night.
- **Double-booking disaster**: Panic-calling multiple contractors without coordination results in multiple trucks arriving and charging duplicate $150–$350 trip fees.

---

## The Solution: FixFast
**FixFast** is a goal-driven, sequential conversational phone dispatch engine built on CALL-E.

```mermaid
flowchart TD
    A["Incident Reported\n(e.g., Burst Pipe at 420 Market St)"] --> B["FixFast Intake Constraints\n- Max ETA: 90 mins\n- Max Budget Cap: $350"]
    B --> C["Prioritized Contractor Roster\n(Contractor A, B, C, D)"]
    
    subgraph CascadeEngine ["Strict Sequential Cascade Engine"]
        C --> D["Dial Contractor #1 via CALL-E"]
        D --> E{"Call Outcome?"}
        E -- "Voicemail / Declined / Out of Budget" --> F["Log Reason & Move Next"]
        F --> G["Dial Contractor #2 via CALL-E"]
        E -- "Accepted within ETA & Fee" --> H["Lock Dispatch & Confirm"]
    end
    
    H --> I["STOP All Outbound Calls\n(Zero Double-Booking Guard)"]
    I --> J["Generate Dispatch Card\n- Technician Name & Contact\n- Arrival ETA & Cost\n- Verbatim Transcript Proof"]
    J --> K["SMS Alert to Property Manager & Tenant"]
```

---

## Key Features

1. **Strict Sequential Cascade State Machine**:
   - Dials contractors one-by-one according to priority.
   - Evaluates arrival ETA and callout fees against strict budget/time constraints.
   - Cuts off the cascade atomically the instant an agreement is confirmed (100% immune to double-booking).
2. **Audio Grounding & Anti-Hallucination**:
   - Parses the verbatim spoken dialogue returned by CALL-E to verify that the technician explicitly agreed to the fee and arrival window.
3. **Dual-Mode Engine**:
   - **Live CALL-E Mode**: Integrates with the official CALL-E CLI / API (`plan_call` &rarr; token &rarr; `run_call` &rarr; `get_call_run`).
   - **Judge Dry-Run Simulator**: Simulates complete realistic multi-turn calls with IVRs, fee negotiation, and dispatch confirmations without burning phone credits or requiring live phones.
4. **Emergency Ops Command Center**:
   - Dark-mode tactical UI with radar waterfall, animated audio waveform, live transcript drawer, and automated SMS receipts.
5. **Portable Agent Skill**:
   - Packaged in `skills/fixfast-emergency-dispatch/SKILL.md` for drop-in use in any AI agent framework (Claude Code, Cursor, OpenClaw, LangChain).

---

## Quickstart

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/FixFast.git
cd FixFast

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the FixFast Command Center.

---

## Testing Scenarios

FixFast includes 4 pre-configured emergency scenarios for instant evaluation:
- **Scenario 1**: 2:00 AM Burst Water Pipe (Plumbing) &bull; Max ETA 90m &bull; Max Budget $350
- **Scenario 2**: Restaurant Walk-in Freezer Down (HVAC) &bull; Max ETA 60m &bull; Max Budget $450
- **Scenario 3**: Storefront Main Glass Door Damaged (Locksmith) &bull; Max ETA 45m &bull; Max Budget $280
- **Scenario 4**: Sparking Electrical Subpanel (Electrical) &bull; Max ETA 75m &bull; Max Budget $400

---

## Portable Skill Integration

Install or run directly via `skills.sh`:

```bash
npx -y skills run ./skills/fixfast-emergency-dispatch \
  --trade plumbing \
  --address "420 Market St, Apt 4B, San Francisco, CA" \
  --description "Main supply line burst in master bathroom" \
  --max-eta 90 \
  --max-budget 350
```

---

## Hackathon Submission Details
- **Hackathon**: [CALL-E: Your Code Is Calling (Devpost)](https://call-e.devpost.com/)
- **Category**: Enterprise / Machine Learning & AI / Communications
- Full submission writeup and pitch script available in [DEVPOST_SUBMISSION.md](./DEVPOST_SUBMISSION.md).
