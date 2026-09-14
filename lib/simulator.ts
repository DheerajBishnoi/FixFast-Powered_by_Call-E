import { Contractor, Incident, StructuredCallResult, TranscriptMessage } from './types';

export interface SimulatedDialogueStep {
  speaker: 'agent' | 'contractor' | 'ivr';
  text: string;
  delayMs: number;
}

export interface SimulationOutcome {
  status: 'accepted' | 'voicemail' | 'over_budget' | 'over_eta' | 'declined';
  durationSeconds: number;
  transcript: TranscriptMessage[];
  result: StructuredCallResult;
}

export function generateSimulationOutcome(
  contractor: Contractor,
  incident: Incident,
  attemptIndex: number
): SimulationOutcome {
  const timestamp = new Date().toLocaleTimeString();

  // Pattern:
  // Attempt 0: Voicemail / Answering machine (Contractor 1)
  // Attempt 1: Over budget or over ETA (Contractor 2)
  // Attempt 2: Successful negotiation & booking (Contractor 3)
  // Attempt 3+: Fallback success if roster continues

  if (attemptIndex === 0) {
    // Voicemail / Automated system
    const transcript: TranscriptMessage[] = [
      {
        speaker: 'ivr',
        text: `Thank you for calling ${contractor.name}. All of our dispatchers are currently on other emergency calls. Please leave a message after the tone or visit our website. [Beep]`,
        timestamp
      },
      {
        speaker: 'agent',
        text: `Hello, this is FixFast calling regarding an active ${incident.trade} emergency at ${incident.address}. Since this is an automated voicemail and requires immediate dispatch within ${incident.maxEtaMinutes} minutes, we cannot leave a callback request. Ending call to try next provider.`,
        timestamp
      }
    ];

    return {
      status: 'voicemail',
      durationSeconds: 18,
      transcript,
      result: {
        contractorAvailable: false,
        arrivalEtaMinutes: null,
        emergencyCalloutFee: null,
        technicianName: null,
        dispatchReferenceCode: null,
        confirmedBooking: false,
        notes: 'Automated voicemail greeting reached. Disconnected immediately to prevent critical delay.',
        declineReason: 'Voicemail / No Live Dispatcher',
        quoteVerified: false
      }
    };
  }

  if (attemptIndex === 1) {
    // Available, but outside budget cap
    const quoteFee = Math.round(incident.maxBudget * 1.45);
    const transcript: TranscriptMessage[] = [
      {
        speaker: 'contractor',
        text: `${contractor.name} emergency line, this is dispatch. What's the emergency?`,
        timestamp
      },
      {
        speaker: 'agent',
        text: `Hello, this is FixFast autonomous dispatch calling for property manager at ${incident.address}. We have an urgent situation: ${incident.description}. Do you have a technician who can arrive within ${incident.maxEtaMinutes} minutes?`,
        timestamp
      },
      {
        speaker: 'contractor',
        text: `Yeah, I can get a truck out there in about 40 minutes, but it's after-hours. Our emergency dispatch fee tonight is $${quoteFee} plus hourly labor.`,
        timestamp
      },
      {
        speaker: 'agent',
        text: `Our pre-authorized budget cap for initial emergency dispatch is $${incident.maxBudget}. Are you able to authorize dispatch within that budget?`,
        timestamp
      },
      {
        speaker: 'contractor',
        text: `No, sorry. Our company policy is strict on night callout rates. $${quoteFee} is the minimum flat fee.`,
        timestamp
      },
      {
        speaker: 'agent',
        text: `Understood. Because $${quoteFee} exceeds our authorized limit of $${incident.maxBudget}, we cannot confirm this dispatch. Thank you for your time. Goodbye.`,
        timestamp
      }
    ];

    return {
      status: 'over_budget',
      durationSeconds: 32,
      transcript,
      result: {
        contractorAvailable: true,
        arrivalEtaMinutes: 40,
        emergencyCalloutFee: quoteFee,
        technicianName: null,
        dispatchReferenceCode: null,
        confirmedBooking: false,
        notes: `Contractor was available in 40 mins, but quoted emergency fee of $${quoteFee} which exceeded budget limit of $${incident.maxBudget}.`,
        declineReason: `Fee ($${quoteFee}) exceeds authorized cap ($${incident.maxBudget})`,
        quoteVerified: true
      }
    };
  }

  // Attempt 2+: Winning booking!
  const agreedEta = Math.min(incident.maxEtaMinutes - 15, contractor.avgResponseMins + 5);
  const agreedFee = Math.min(incident.maxBudget - 40, contractor.baseCalloutFee + 20);
  const techNames = ['Marcus Vance', 'Dave Miller', 'Elena Rostova', 'Carlos Mendez', 'Sam Albright'];
  const techName = techNames[attemptIndex % techNames.length];
  const refCode = `FIX-${contractor.trade.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const transcript: TranscriptMessage[] = [
    {
      speaker: 'contractor',
      text: `${contractor.name}, night dispatch. How can we help?`,
      timestamp
    },
    {
      speaker: 'agent',
      text: `Hello, this is FixFast autonomous dispatch on behalf of the property manager at ${incident.address}. We have an urgent emergency: ${incident.description}. Can you dispatch a licensed technician to arrive within ${incident.maxEtaMinutes} minutes, and what is your callout fee?`,
      timestamp
    },
    {
      speaker: 'contractor',
      text: `Got it. Yes, I have senior technician ${techName} finishing up an emergency job nearby. He can roll out and be at ${incident.address.split(',')[0]} in approximately ${agreedEta} minutes. Our emergency dispatch fee is $${agreedFee}.`,
      timestamp
    },
    {
      speaker: 'agent',
      text: `That is within our authorized window of ${incident.maxEtaMinutes} minutes and authorized budget of $${incident.maxBudget}. We would like to lock in this dispatch now for technician ${techName} at the $${agreedFee} callout fee. Please confirm the booking reference code.`,
      timestamp
    },
    {
      speaker: 'contractor',
      text: `Booking is locked in! Your work order dispatch reference code is ${refCode}. ${techName} is en route. Please make sure the gate code and unit access are accessible.`,
      timestamp
    },
    {
      speaker: 'agent',
      text: `Confirmed. Booking code ${refCode} recorded. Entry instructions and on-site contact details have been dispatched to ${techName}'s mobile. Thank you!`,
      timestamp
    }
  ];

  return {
    status: 'accepted',
    durationSeconds: 42,
    transcript,
    result: {
      contractorAvailable: true,
      arrivalEtaMinutes: agreedEta,
      emergencyCalloutFee: agreedFee,
      technicianName: techName,
      dispatchReferenceCode: refCode,
      confirmedBooking: true,
      notes: `Technician ${techName} en route with confirmed ETA of ${agreedEta} mins. Emergency callout fee locked at $${agreedFee}.`,
      declineReason: null,
      quoteVerified: true
    }
  };
}
