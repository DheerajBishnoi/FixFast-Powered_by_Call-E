import { CallAttempt, CascadeSession, Incident, Contractor } from './types';
import { getContractorsForTrade } from './roster';
import { generateSimulationOutcome } from './simulator';
import { planCalleCall, executeCalleCall, pollCalleRun } from './calle-adapter';

// In-memory store for active cascade sessions attached to globalThis
const globalForSessions = globalThis as unknown as {
  activeSessions: Map<string, CascadeSession> | undefined;
};

const activeSessions = globalForSessions.activeSessions ?? new Map<string, CascadeSession>();
globalForSessions.activeSessions = activeSessions;

export function createCascadeSession(incident: Incident, mode: 'simulator' | 'live' = 'simulator'): CascadeSession {
  const contractors = getContractorsForTrade(incident.trade);

  const attempts: CallAttempt[] = contractors.map(c => ({
    id: `att_${Math.random().toString(36).substring(2, 9)}`,
    contractorId: c.id,
    contractorName: c.name,
    contractorPhone: c.phone,
    status: 'idle',
    startedAt: null,
    endedAt: null,
    durationSeconds: 0,
    transcript: [],
    result: null
  }));

  const session: CascadeSession = {
    id: `casc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    incident,
    status: 'pending',
    attempts,
    activeAttemptIndex: 0,
    winningAttemptId: null,
    mode,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  activeSessions.set(session.id, session);
  return session;
}

export function getCascadeSession(sessionId: string): CascadeSession | undefined {
  return activeSessions.get(sessionId);
}

/**
 * Executes the next step or polls the current active call in the cascade.
 */
export async function stepCascadeSession(sessionId: string): Promise<CascadeSession> {
  const session = activeSessions.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  if (session.status === 'completed' || session.status === 'exhausted' || session.status === 'cancelled') {
    return session;
  }

  const { activeAttemptIndex, attempts, incident, mode } = session;

  if (activeAttemptIndex >= attempts.length) {
    session.status = 'exhausted';
    session.completedAt = new Date().toISOString();
    return session;
  }

  session.status = 'active';
  const currentAttempt = attempts[activeAttemptIndex];
  const contractor = getContractorsForTrade(incident.trade).find(c => c.id === currentAttempt.contractorId);

  if (!contractor) {
    session.activeAttemptIndex++;
    return session;
  }

  // ==========================================
  // SIMULATOR MODE
  // ==========================================
  if (mode === 'simulator') {
    // If it's already done (shouldn't happen in simulator, but just in case)
    if (currentAttempt.status !== 'idle') {
      if (!session.winningAttemptId && activeAttemptIndex + 1 < attempts.length) {
        session.activeAttemptIndex++;
      }
      return session;
    }

    currentAttempt.startedAt = new Date().toISOString();
    currentAttempt.status = 'dialing';
    
    // Instantly generate a realistic simulated outcome
    const outcome = generateSimulationOutcome(contractor, incident, activeAttemptIndex);
    currentAttempt.status = outcome.status;
    currentAttempt.durationSeconds = outcome.durationSeconds;
    currentAttempt.transcript = outcome.transcript;
    currentAttempt.result = outcome.result;
    currentAttempt.endedAt = new Date().toISOString();

    evaluateOutcomeAndAdvance(session, currentAttempt, incident);
    activeSessions.set(session.id, session);
    return session;
  }

  // ==========================================
  // LIVE CALL-E MODE (Robust State Machine)
  // ==========================================
  
  if (currentAttempt.status === 'idle') {
    // 1. INIT: Start the CALL-E call
    currentAttempt.status = 'dialing';
    currentAttempt.startedAt = new Date().toISOString();
    
    try {
      const plan = await planCalleCall(contractor, incident);
      const run = await executeCalleCall(plan.planId, plan.confirmToken);
      currentAttempt.calleRunId = run.runId;
    } catch (error: any) {
      console.error(`[FixFast] CALL-E execution failed for ${contractor.name}:`, error);
      currentAttempt.status = 'failed';
      currentAttempt.endedAt = new Date().toISOString();
      currentAttempt.result = {
        contractorAvailable: false,
        arrivalEtaMinutes: null,
        emergencyCalloutFee: null,
        technicianName: null,
        dispatchReferenceCode: null,
        confirmedBooking: false,
        notes: `System Error: Failed to connect to CALL-E CLI. Reason: ${error.message}`,
        declineReason: 'System Integration Error',
        quoteVerified: false
      };
      evaluateOutcomeAndAdvance(session, currentAttempt, incident);
    }

  } else if (currentAttempt.status === 'dialing' || currentAttempt.status === 'in_conversation') {
    // 2. POLL: Check status of running CALL-E call
    if (currentAttempt.calleRunId) {
      try {
        const pollResult = await pollCalleRun(currentAttempt.calleRunId);
        
        // Update transcript incrementally
        if (pollResult.transcript && pollResult.transcript.length > 0) {
          currentAttempt.transcript = pollResult.transcript.map(t => ({
            speaker: t.speaker as any,
            text: t.text,
            timestamp: new Date().toLocaleTimeString()
          }));
        }

        // State transition based on polling
        if (pollResult.status === 'completed' || pollResult.status === 'resolved' || pollResult.status === 'done') {
          currentAttempt.endedAt = new Date().toISOString();
          
          if (pollResult.structuredOutput) {
            currentAttempt.result = {
              contractorAvailable: !!pollResult.structuredOutput.contractor_available,
              arrivalEtaMinutes: pollResult.structuredOutput.arrival_eta_minutes || null,
              emergencyCalloutFee: pollResult.structuredOutput.emergency_callout_fee || null,
              technicianName: pollResult.structuredOutput.technician_name || null,
              dispatchReferenceCode: pollResult.structuredOutput.dispatch_reference_code || null,
              confirmedBooking: !!pollResult.structuredOutput.confirmed_booking,
              notes: pollResult.structuredOutput.notes || 'Call concluded via CALL-E.',
              declineReason: pollResult.structuredOutput.decline_reason || null,
              quoteVerified: true
            };
          } else {
            // Fallback if structured output failed
            currentAttempt.result = {
              contractorAvailable: false, arrivalEtaMinutes: null, emergencyCalloutFee: null,
              technicianName: null, dispatchReferenceCode: null, confirmedBooking: false,
              notes: 'Call ended but structured data extraction failed.', declineReason: 'Data extraction error', quoteVerified: false
            };
          }

          evaluateOutcomeAndAdvance(session, currentAttempt, incident);
        } else {
          // Still running
          currentAttempt.status = 'in_conversation';
        }
      } catch (error) {
        console.error(`[FixFast] Polling error for run ${currentAttempt.calleRunId}:`, error);
        // We don't fail immediately on one polling error, just keep state as is to retry next tick
      }
    }
  } else {
    // 3. DONE: Attempt is already finished but we haven't advanced yet
    if (!session.winningAttemptId) {
      session.activeAttemptIndex++;
      if (session.activeAttemptIndex >= attempts.length) {
        session.status = 'exhausted';
        session.completedAt = new Date().toISOString();
      }
    }
  }

  activeSessions.set(session.id, session);
  return session;
}

/**
 * Helper to evaluate constraints and update session state (advance vs lock)
 */
function evaluateOutcomeAndAdvance(session: CascadeSession, currentAttempt: CallAttempt, incident: Incident) {
  const r = currentAttempt.result;
  
  if (!r) {
    currentAttempt.status = 'failed';
    session.activeAttemptIndex++;
    return;
  }

  // Strict Double-Booking Guard & Constraint Verification
  if (
    r.confirmedBooking &&
    r.arrivalEtaMinutes !== null && r.arrivalEtaMinutes <= incident.maxEtaMinutes &&
    r.emergencyCalloutFee !== null && r.emergencyCalloutFee <= incident.maxBudget
  ) {
    // WINNER FOUND! Lock the cascade.
    currentAttempt.status = 'accepted';
    session.winningAttemptId = currentAttempt.id;
    session.status = 'completed';
    session.completedAt = new Date().toISOString();
  } else {
    // Evaluate failure reason
    if (!r.contractorAvailable) {
      currentAttempt.status = r.declineReason?.toLowerCase().includes('voicemail') ? 'voicemail' : 'declined';
    } else if (r.arrivalEtaMinutes !== null && r.arrivalEtaMinutes > incident.maxEtaMinutes) {
      currentAttempt.status = 'over_eta';
    } else if (r.emergencyCalloutFee !== null && r.emergencyCalloutFee > incident.maxBudget) {
      currentAttempt.status = 'over_budget';
    } else {
      currentAttempt.status = 'declined';
    }

    // Advance to next contractor
    if (session.activeAttemptIndex + 1 < session.attempts.length) {
      session.activeAttemptIndex++;
    } else {
      session.status = 'exhausted';
      session.completedAt = new Date().toISOString();
    }
  }
}
