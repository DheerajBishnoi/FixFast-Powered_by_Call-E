'use client';

import React from 'react';
import { CascadeSession } from '@/lib/types';
import { CheckCircle, ShieldCheck, Clock, DollarSign, UserCheck, MessageSquare, Phone, Sparkles, MapPin } from 'lucide-react';

interface DispatchCardProps {
  session: CascadeSession;
  onReset: () => void;
}

export default function DispatchCard({ session, onReset }: DispatchCardProps) {
  const { incident, attempts, winningAttemptId } = session;
  const winningAttempt = attempts.find(a => a.id === winningAttemptId);

  if (!winningAttempt || !winningAttempt.result) return null;

  const { result } = winningAttempt;
  const budgetSaved = incident.maxBudget - (result.emergencyCalloutFee || 0);

  return (
    <div className="bg-gradient-to-b from-[#091a1a] to-[#0a1322] border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl shadow-emerald-500/10 space-y-5 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle className="h-7 w-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white font-mono tracking-tight">
                EMERGENCY DISPATCH CONFIRMED
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Lock Complete
              </span>
            </div>
            <p className="text-xs text-emerald-400/80 font-mono">
              Job Reference: <strong>{result.dispatchReferenceCode}</strong> • En Route to {incident.address.split(',')[0]}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700 self-start sm:self-auto"
        >
          New Emergency Dispatch
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Responding Technician */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Assigned Specialist
            </span>
            <h4 className="text-sm font-bold text-white">
              {result.technicianName}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {winningAttempt.contractorName}
            </span>
          </div>
        </div>

        {/* Confirmed Arrival ETA */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Guaranteed Arrival ETA
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-amber-400 font-mono">
                {result.arrivalEtaMinutes}
              </span>
              <span className="text-xs text-amber-300/80 font-mono font-bold">MINUTES</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              ({incident.maxEtaMinutes - (result.arrivalEtaMinutes || 0)}m faster than cap)
            </span>
          </div>
        </div>

        {/* Locked Emergency Fee */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Locked Callout Fee
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-400 font-mono">
                ${result.emergencyCalloutFee}
              </span>
              <span className="text-xs text-emerald-300/80 font-mono font-bold">USD</span>
            </div>
            {budgetSaved > 0 && (
              <span className="text-[10px] text-emerald-400 font-mono">
                (${budgetSaved} under authorized budget)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Double-Booking Safety Guarantee Box */}
      <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-200/90 leading-relaxed">
          <strong className="text-white">Strict Anti-Double-Booking Protection Triggered:</strong> FixFast immediately severed all pending telephone cascades the exact millisecond {winningAttempt.contractorName} locked the booking. No other contractors were contacted or dispatched. Estimated multi-booking trip fee savings: <strong>$150 — $350</strong>.
        </div>
      </div>

      {/* Automated SMS Preview */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
            Automated SMS Receipts Dispatched
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
            SMS SENT (TWILIO/WEBHOOK)
          </span>
        </div>
        <div className="bg-slate-900/90 rounded-lg p-3 text-[11px] font-mono text-slate-300 border border-slate-800 space-y-1.5">
          <p className="text-cyan-300 font-semibold">
            [ALERT TO TENANT &amp; PROPERTY MGR]:
          </p>
          <p>
            Emergency {incident.trade.toUpperCase()} confirmed at {incident.address}. Technician <strong>{result.technicianName}</strong> ({winningAttempt.contractorName}) is en route. ETA: <strong>{result.arrivalEtaMinutes} mins</strong>. Ref: <strong>{result.dispatchReferenceCode}</strong>. Authorized dispatch fee: <strong>${result.emergencyCalloutFee}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
