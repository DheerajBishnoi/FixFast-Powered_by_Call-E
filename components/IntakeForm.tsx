'use client';

import React from 'react';
import { TradeType } from '@/lib/types';
import { Wrench, Zap, Lock, Wind, MapPin, Clock, DollarSign, AlertTriangle, PhoneCall, Info, XCircle } from 'lucide-react';

interface IntakeFormProps {
  trade: TradeType;
  onTradeChange: (trade: TradeType) => void;
  address: string;
  onAddressChange: (address: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  maxEtaMinutes: number;
  onMaxEtaChange: (eta: number) => void;
  maxBudget: number;
  onMaxBudgetChange: (budget: number) => void;
  onStartCascade: () => void;
  onCancelCascade?: () => void;
  isCascading: boolean;
  mode: 'simulator' | 'live';
}

export default function IntakeForm({
  trade,
  onTradeChange,
  address,
  onAddressChange,
  description,
  onDescriptionChange,
  maxEtaMinutes,
  onMaxEtaChange,
  maxBudget,
  onMaxBudgetChange,
  onStartCascade,
  onCancelCascade,
  isCascading,
  mode
}: IntakeFormProps) {
  const trades: { type: TradeType; label: string; icon: React.ReactNode }[] = [
    { type: 'plumbing', label: 'Plumbing', icon: <Wrench className="h-5 w-5" /> },
    { type: 'hvac', label: 'HVAC', icon: <Wind className="h-5 w-5" /> },
    { type: 'locksmith', label: 'Locksmith', icon: <Lock className="h-5 w-5" /> },
    { type: 'electrical', label: 'Electrical', icon: <Zap className="h-5 w-5" /> },
  ];

  const isValid = address.trim().length > 5 && description.trim().length > 10;

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group transition-all duration-500">
      {/* Decorative gradients */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-amber-500/20" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-blue-500/10" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 mb-6 relative z-10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Emergency Incident Configuration
          </h2>
          {mode === 'live' && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Live CALL-E Mode Active — Will place real outbound calls
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Trade Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider block">
            Select Trade Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trades.map((t) => {
              const isActive = trade === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  disabled={isCascading}
                  onClick={() => onTradeChange(t.type)}
                  className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all duration-200 border ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10 hover:text-slate-200'
                  } ${isCascading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer transform hover:-translate-y-0.5'}`}
                >
                  {t.icon}
                  <span className="text-xs font-medium">{t.label}</span>
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-[#0d1424]"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Inputs */}
        <div className="space-y-4">
          <div className="group/input relative">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider block">
              Property / Access Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-slate-500 group-focus-within/input:text-amber-400 transition-colors" />
              </div>
              <input
                type="text"
                disabled={isCascading}
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                placeholder="Enter full property address..."
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
              />
            </div>
          </div>

          <div className="group/input relative">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center justify-between block">
              <span>Emergency Specifics</span>
              {!isValid && description.length > 0 && description.length <= 10 && (
                <span className="text-[10px] text-red-400 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Needs more detail
                </span>
              )}
            </label>
            <textarea
              rows={2}
              disabled={isCascading}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe the physical hazard, unit number, shutoff attempts, etc."
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Max ETA */}
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 relative overflow-hidden group/slider">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-400" />
                Max Acceptable ETA
              </span>
              <span className="text-sm font-mono font-bold text-white bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-inner">
                {maxEtaMinutes} <span className="text-[10px] text-amber-400/80">MINS</span>
              </span>
            </div>
            <div className="relative z-10 px-1">
              <input
                type="range"
                min={15}
                max={180}
                step={5}
                disabled={isCascading}
                value={maxEtaMinutes}
                onChange={(e) => onMaxEtaChange(Number(e.target.value))}
                className="w-full text-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                <span>Critical (15m)</span>
                <span>Flexible (180m)</span>
              </div>
            </div>
          </div>

          {/* Max Budget */}
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 relative overflow-hidden group/slider">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Max Callout Budget
              </span>
              <span className="text-sm font-mono font-bold text-white bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-inner">
                ${maxBudget} <span className="text-[10px] text-emerald-400/80">USD</span>
              </span>
            </div>
            <div className="relative z-10 px-1">
              <input
                type="range"
                min={100}
                max={800}
                step={25}
                disabled={isCascading}
                value={maxBudget}
                onChange={(e) => onMaxBudgetChange(Number(e.target.value))}
                className="w-full text-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                <span>Tight ($100)</span>
                <span>High ($800)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 relative z-10 space-y-3">
          <button
            type="button"
            disabled={isCascading || !isValid}
            onClick={onStartCascade}
            className={`w-full py-4 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group ${
              isCascading
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                : !isValid
                ? 'bg-black/40 text-slate-500 border border-white/10 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5'
            }`}
          >
            <PhoneCall className={`h-5 w-5 ${isCascading ? 'animate-spin' : isValid && !isCascading ? 'group-hover:animate-bounce' : ''}`} />
            <span>
              {isCascading ? 'AUTONOMOUS CASCADE IN PROGRESS...' : !isValid ? 'COMPLETE INCIDENT DETAILS TO DISPATCH' : 'DISPATCH AUTONOMOUS CASCADE AGENT'}
            </span>
          </button>

          {isCascading && onCancelCascade && (
            <button
              type="button"
              onClick={onCancelCascade}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wide bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 hover:border-red-500/60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer"
            >
              <XCircle className="h-4 w-4 text-red-400" />
              <span>END / CANCEL CALLING PROCESS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
