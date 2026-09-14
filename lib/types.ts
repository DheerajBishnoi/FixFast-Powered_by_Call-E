export type TradeType = 'plumbing' | 'electrical' | 'hvac' | 'locksmith';

export interface Incident {
  id: string;
  title: string;
  trade: TradeType;
  address: string;
  description: string;
  maxEtaMinutes: number;
  maxBudget: number;
  severity: 'critical' | 'high' | 'medium';
  createdAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  trade: TradeType;
  phone: string;
  rating: number;
  avgResponseMins: number;
  baseCalloutFee: number;
  city: string;
}

export type CallStatus =
  | 'idle'
  | 'dialing'
  | 'ringing'
  | 'in_conversation'
  | 'verifying_quote'
  | 'accepted'
  | 'declined'
  | 'voicemail'
  | 'over_budget'
  | 'over_eta'
  | 'failed';

export interface TranscriptMessage {
  speaker: 'agent' | 'contractor' | 'ivr';
  text: string;
  timestamp: string;
}

export interface StructuredCallResult {
  contractorAvailable: boolean;
  arrivalEtaMinutes: number | null;
  emergencyCalloutFee: number | null;
  technicianName: string | null;
  dispatchReferenceCode: string | null;
  confirmedBooking: boolean;
  notes: string;
  declineReason: string | null;
  quoteVerified: boolean;
}

export interface CallAttempt {
  id: string;
  contractorId: string;
  contractorName: string;
  contractorPhone: string;
  status: CallStatus;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  transcript: TranscriptMessage[];
  result: StructuredCallResult | null;
  calleRunId?: string;
}

export interface CascadeSession {
  id: string;
  incident: Incident;
  status: 'pending' | 'active' | 'completed' | 'exhausted' | 'cancelled';
  attempts: CallAttempt[];
  activeAttemptIndex: number;
  winningAttemptId: string | null;
  mode: 'simulator' | 'live';
  createdAt: string;
  completedAt: string | null;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  trade: TradeType;
  address: string;
  description: string;
  maxEtaMinutes: number;
  maxBudget: number;
  severity: 'critical' | 'high' | 'medium';
  icon: string;
}
