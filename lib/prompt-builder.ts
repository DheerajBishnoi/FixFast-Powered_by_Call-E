import { Contractor, Incident } from './types';

export function buildCalleCallPlan(contractor: Contractor, incident: Incident) {
  const goal = `
You are an autonomous emergency dispatch agent named FixFast calling ${contractor.name} (${contractor.phone}) on behalf of property manager at ${incident.address}.
An urgent emergency is occurring: ${incident.description}.

YOUR GOALS:
1. State clearly who you are and report the emergency incident at ${incident.address}.
2. Ask if they have an on-call licensed technician who can arrive within ${incident.maxEtaMinutes} minutes.
3. Inquire about their emergency dispatch / callout fee. Our maximum pre-authorized budget cap is $${incident.maxBudget}.
4. If they can arrive within ${incident.maxEtaMinutes} minutes and the callout fee is at or below $${incident.maxBudget}:
   - Explicitly confirm the booking.
   - Ask for the responding technician's first and last name.
   - Ask for their internal dispatch or job reference code.
   - Inform them that lockbox/entry codes will be sent directly to their technician upon departure.
5. If they cannot meet the ETA (exceeds ${incident.maxEtaMinutes} mins) OR their fee exceeds $${incident.maxBudget} OR they have no available technicians:
   - Politely decline: "Understood, thank you. Due to active water/safety hazard we must book someone with an earlier ETA. We will try another provider. Goodbye."
   - Immediately end the call.

CRITICAL INVARIANTS:
- Do NOT authorize any fee higher than $${incident.maxBudget}.
- Do NOT accept any ETA longer than ${incident.maxEtaMinutes} minutes.
- If you book, you MUST extract the technician name and dispatch reference.
`.trim();

  return {
    to: contractor.phone,
    goal,
    language: 'en-US',
    dataSchema: {
      type: 'object',
      properties: {
        contractor_available: { type: 'boolean', description: 'Whether the contractor can dispatch a technician' },
        arrival_eta_minutes: { type: 'number', description: 'Technician estimated arrival time in minutes' },
        emergency_callout_fee: { type: 'number', description: 'Emergency trip / callout fee in USD' },
        technician_name: { type: 'string', description: 'Name of the responding technician' },
        dispatch_reference_code: { type: 'string', description: 'Reference code or work order number' },
        confirmed_booking: { type: 'boolean', description: 'True ONLY if agent and contractor both agreed to dispatch' },
        notes: { type: 'string', description: 'Key details or technician status mentioned on the call' },
        decline_reason: { type: 'string', description: 'Reason for decline if unavailable, over budget, or over ETA' }
      },
      required: ['contractor_available', 'confirmed_booking']
    }
  };
}
