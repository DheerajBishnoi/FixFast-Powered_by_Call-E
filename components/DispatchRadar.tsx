'use client';

import React from 'react';
import { CallAttempt, CascadeSession } from '@/lib/types';
import { Phone, Star, CheckCircle2, XCircle, Clock, FileText, Lock, Radio, AlertCircle } from 'lucide-react';

interface DispatchRadarProps {
  session: CascadeSession | null;
  onSelectAttempt: (attempt: CallAttempt) => void;
  selectedAttemptId: string | null;
  onCancelCascade?: () => void;
}

export default function DispatchRadar({ session, onSelectAttempt, selectedAttemptId, onCancelCascade }: DispatchRadarProps) {
  if (!session) {
    return (
      <div className="bg-[#0e1628]/90 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[360px] text-center">
        <div className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
          <Radio className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-slate-300 mb-1">Dispatch Radar Standby</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Select an emergency preset or configure an incident and click "Start Emergency Cascade" to initiate real-time contractor dials.
        </p>
      </div>
    );
  }

  const { attempts, activeAttemptIndex, status, winningAttemptId, incident } = session;

  const getStatusBadge = (attempt: CallAttempt, index: number) => {
    switch (attempt.status) {
      case 'dialing':
      case 'in_conversation':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            DIALING &amp; NEGOTIATING
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            BOOKING LOCKED
          </span>
        );
      case 'over_budget':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
            <XCircle className="h-3.5 w-3.5 text-red-400" />
            OVER BUDGET CAP
          </span>
        );
      case 'over_eta':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            ETA TOO SLOW
          </span>
        );
      case 'voicemail':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
            VOICEMAIL / UNANSWERED
          </span>
        );
      default:
        // Idle
        if (status === 'completed' && winningAttemptId && index > activeAttemptIndex) {
          return (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-500 border border-slate-800">
              <Lock className="h-3 w-3 text-slate-600" />
              PROTECTED / UNCALLED
            </span>
          );
        }
        return (
          <span className="text-[11px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            QUEUED #{index + 1}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0e1628]/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-500 animate-pulse" />
            Sequential Dispatch Radar
          </h2>
          <p className="text-[11px] text-slate-400">
            Active Priority Roster • Dialing 1-by-1 to prevent duplicate contractor fees
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status === 'active' && onCancelCascade && (
            <button
              type="button"
              onClick={onCancelCascade}
              className="px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 transition-colors cursor-pointer"
            >
              Abort Cascade
            </button>
          )}
          <span className={`text-[11px] font-mono uppercase font-bold px-2 py-1 rounded ${
            status === 'completed'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : status === 'active'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : status === 'cancelled'
              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}>
            Session: {status}
          </span>
        </div>
      </div>

      {/* Waterfall List of Contractors */}
      <div className="space-y-2.5">
        {attempts.map((attempt, index) => {
          const isSelected = selectedAttemptId === attempt.id;
          const isWinning = winningAttemptId === attempt.id;
          const isCurrentActive = status === 'active' && activeAttemptIndex === index;
          const isProtected = status === 'completed' && index > activeAttemptIndex;

          return (
            <div
              key={attempt.id}
              onClick={() => onSelectAttempt(attempt)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'ring-2 ring-amber-500/50 bg-slate-900/90'
                  : 'hover:border-slate-700 bg-slate-900/60'
              } ${
                isWinning
                  ? 'border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-500/5'
                  : isCurrentActive
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-lg shadow-amber-500/5'
                  : isProtected
                  ? 'border-slate-800/60 opacity-60'
                  : 'border-slate-800'
              }`}
            >
              {/* Active pulsing bar */}
              {isCurrentActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 animate-pulse" />
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                    isWinning
                      ? 'bg-emerald-500 text-black'
                      : isCurrentActive
                      ? 'bg-amber-500 text-black animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">
                      {attempt.contractorName}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{attempt.contractorPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {getStatusBadge(attempt, index)}
                </div>
              </div>

              {/* Call Result Summary or Notes */}
              {attempt.result && (
                <div className="mt-2 pt-2 border-t border-slate-800/60 text-xs flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-300 italic flex-1">
                    "{attempt.result.notes}"
                  </p>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 ml-auto"
                  >
                    <FileText className="h-3 w-3" />
                    <span>View Transcript</span>
                  </button>
                </div>
              )}

              {/* Protected Uncalled Explanation */}
              {isProtected && (
                <div className="mt-2 text-[11px] text-emerald-400/80 font-mono flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>Skipped to prevent double-dispatch charges (Saved ~$150-$300 trip fee)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
