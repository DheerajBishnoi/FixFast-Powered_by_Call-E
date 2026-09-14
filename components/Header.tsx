'use client';

import React from 'react';
import { PhoneCall, ShieldCheck, Radio, Sparkles } from 'lucide-react';

interface HeaderProps {
  mode: 'simulator' | 'live';
  onModeToggle: (newMode: 'simulator' | 'live') => void;
  calleAvailable: boolean;
}

export default function Header({ mode, onModeToggle, calleAvailable }: HeaderProps) {
  return (
    <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-4 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-white/20">
            <PhoneCall className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-black text-2xl tracking-tight text-white font-mono">
                FixFast<span className="text-amber-500">.ai</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                Emergency Dispatch Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous Trade Escalation &amp; Zero Double-Booking Engine • Built on CALL-E
            </p>
          </div>
        </div>

        {/* Status Indicators & Mode Switch */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          {/* Safety Guards Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shadow-inner shadow-emerald-500/5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Anti-Double-Booking Guard: Active</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-black/50 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => onModeToggle('simulator')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                mode === 'simulator'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Judge Dry-Run</span>
            </button>
            <button
              onClick={() => onModeToggle('live')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                mode === 'live'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${mode === 'live' ? 'animate-pulse' : ''}`} />
              <span>Live CALL-E</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
