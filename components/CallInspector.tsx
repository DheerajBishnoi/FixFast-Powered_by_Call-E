'use client';

import React, { useState } from 'react';
import { CallAttempt } from '@/lib/types';
import { X, Volume2, ShieldCheck, CheckCircle2, AlertTriangle, Code2, MessageSquare, PhoneCall } from 'lucide-react';

interface CallInspectorProps {
  attempt: CallAttempt | null;
  onClose: () => void;
}

export default function CallInspector({ attempt, onClose }: CallInspectorProps) {
  const [activeTab, setActiveTab] = useState<'transcript' | 'json' | 'verification'>('transcript');

  if (!attempt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b111e] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  {attempt.contractorName}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {attempt.contractorPhone}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                CALL-E Autonomous Dial • Duration: {attempt.durationSeconds}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Waveform simulation */}
            <div className="flex items-center gap-0.5 px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">
              <div className="w-1 bg-amber-400 rounded-full wave-bar-1"></div>
              <div className="w-1 bg-amber-400 rounded-full wave-bar-2"></div>
              <div className="w-1 bg-amber-400 rounded-full wave-bar-3"></div>
              <div className="w-1 bg-amber-400 rounded-full wave-bar-4"></div>
              <div className="w-1 bg-amber-400 rounded-full wave-bar-5"></div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'transcript'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Spoken Transcript ({attempt.transcript.length} turns)</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'json'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Structured Output (JSON)</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'verification'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Anti-Hallucination Proof</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#080d17]">
          {activeTab === 'transcript' && (
            <div className="space-y-3">
              {attempt.transcript.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No audio transcript recorded for this dial attempt.
                </div>
              ) : (
                attempt.transcript.map((msg, i) => {
                  const isAgent = msg.speaker === 'agent';
                  const isIvr = msg.speaker === 'ivr';

                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-100 ml-4'
                          : isIvr
                          ? 'bg-slate-900 border-slate-800 text-slate-300 mr-4'
                          : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-100 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                        <span className={`font-bold uppercase tracking-wider ${
                          isAgent ? 'text-amber-400' : isIvr ? 'text-slate-400' : 'text-cyan-400'
                        }`}>
                          {isAgent ? 'FixFast AI Agent' : isIvr ? 'Automated IVR / Voicemail' : `${attempt.contractorName} Dispatch`}
                        </span>
                        <span className="text-slate-500">{msg.timestamp}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify(attempt.result, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Spoken ETA explicitly extracted from audio:</span>
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {attempt.result?.arrivalEtaMinutes ? `${attempt.result.arrivalEtaMinutes} mins` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Emergency fee explicitly agreed in audio:</span>
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {attempt.result?.emergencyCalloutFee ? `$${attempt.result.emergencyCalloutFee}` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Technician name explicitly identified:</span>
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {attempt.result?.technicianName || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Work order / Dispatch code logged:</span>
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {attempt.result?.dispatchReferenceCode || 'None'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed">
                <strong>Anti-Hallucination Policy:</strong> FixFast will never lock in a booking unless the contractor's explicit verbal agreement is confirmed across both ETA and Callout Fee parameters in the verbatim audio transcript.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            Outcome: <strong className="text-white uppercase">{attempt.status}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
