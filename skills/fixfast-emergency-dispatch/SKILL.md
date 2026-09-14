---
name: fixfast-emergency-dispatch
description: Autonomous Emergency Trades & Contractor Dispatch Agent. Negotiates ETA and fees via sequential phone cascade with zero double-booking.
version: 1.0.0
author: FixFast Team
category: Emergency Services & Property Operations
tools:
  - calle/plan_call
  - calle/run_call
  - calle/get_call_run
---

# FixFast: Autonomous Emergency Dispatch Skill

FixFast is an agent skill for dispatching emergency contractors (plumbers, HVAC technicians, locksmiths, electricians) via conversational phone calls using CALL-E.

## The Problem
When property emergencies strike (e.g., a burst pipe at 2:00 AM), emails and web tickets are useless because contractors are in the field and only respond to phone calls. Calling multiple contractors simultaneously risks costly double-bookings ($150-$350 trip fees per contractor).

## How FixFast Works
1. **Intake Constraints**: Defines trade, address, hazard description, maximum acceptable ETA (e.g. 90 minutes), and pre-authorized budget cap (e.g. $350).
2. **Prioritized Contractor Cascade**: Dials vetted local contractors sequentially using CALL-E.
3. **Conversational Negotiation**:
   - Inquires whether an on-call technician can arrive within `max_eta_minutes`.
   - Inquires about the emergency callout fee against `max_budget`.
   - Verifies technician name and dispatch reference code.
4. **Strict Atomic Stop**: The moment an acceptable quote is confirmed, FixFast halts all further outbound calls, guaranteeing **zero double-booking**.
5. **Auditable Proof**: Parses the call audio transcript to ensure the contractor verbally agreed to both the ETA and the fee before locking dispatch.

## CLI Usage

```bash
# Using OpenAgentSkill / skills.sh
npx -y skills run fixfast-emergency-dispatch \
  --trade plumbing \
  --address "420 Market St, Apt 4B, San Francisco, CA" \
  --description "Main supply line burst in bathroom. Water leaking into downstairs unit." \
  --max-eta 90 \
  --max-budget 350
```

## Structured Output Schema

FixFast returns a typed JSON result upon concluding the cascade:

```json
{
  "status": "completed",
  "incident_id": "inc_98412",
  "trade": "plumbing",
  "winning_contractor": {
    "name": "Metro Rooter & Drain",
    "phone": "+1 (415) 555-0176",
    "technician_name": "Dave Miller",
    "confirmed_eta_minutes": 45,
    "emergency_callout_fee": 220,
    "dispatch_reference_code": "FIX-PLU-9402"
  },
  "cascade_summary": {
    "contractors_evaluated": 3,
    "total_calls_placed": 3,
    "subsequent_calls_halted": 2,
    "redundant_dispatch_fees_prevented": 300,
    "audit_transcript_verified": true
  }
}
```

## Safety & Invariants

1. **No Above-Budget Commitments**: FixFast will never agree to a callout fee exceeding the user's explicit `max_budget`.
2. **No Above-ETA Commitments**: FixFast will terminate negotiations if arrival ETA exceeds `max_eta_minutes`.
3. **Atomic Cascade Lock**: Cascade stops immediately upon booking. Subsequent candidate contractors remain untouched.
4. **Verbatim Transcript Evidence**: Requires acoustic evidence of spoken agreements to prevent model hallucinations.
