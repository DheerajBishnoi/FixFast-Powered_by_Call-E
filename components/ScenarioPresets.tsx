'use client';

import React from 'react';
import { ScenarioPreset } from '@/lib/types';
import { SCENARIO_PRESETS } from '@/lib/scenarios';
import { Droplets, Snowflake, Lock, Zap, Clock, DollarSign } from 'lucide-react';

interface ScenarioPresetsProps {
  onSelect: (preset: ScenarioPreset) => void;
  selectedId: string | null;
  disabled: boolean;
}

export default function ScenarioPresets({ onSelect, selectedId, disabled }: ScenarioPresetsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets className="h-5 w-5 text-blue-400" />;
      case 'Snowflake': return <Snowflake className="h-5 w-5 text-cyan-400" />;
      case 'Lock': return <Lock className="h-5 w-5 text-amber-400" />;
      case 'Zap': return <Zap className="h-5 w-5 text-yellow-400" />;
      default: return <Droplets className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          Judge Test Scenarios (1-Click Presets)
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">Select any emergency to autofill</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {SCENARIO_PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              disabled={disabled}
              onClick={() => onSelect(preset)}
              className={`text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer transform hover:-translate-y-1'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl border transition-colors ${
                    isSelected ? 'bg-amber-500/20 border-amber-500/30' : 'bg-black/40 border-white/10 group-hover:bg-white/10'
                  }`}>
                    {getIcon(preset.icon)}
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg ${
                    preset.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {preset.severity}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  {preset.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-md">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  &lt; {preset.maxEtaMinutes}m
                </span>
                <span className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-md text-emerald-400 font-medium">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  Max ${preset.maxBudget}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
