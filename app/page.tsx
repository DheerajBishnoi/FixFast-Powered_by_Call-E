'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import ScenarioPresets from '@/components/ScenarioPresets';
import IntakeForm from '@/components/IntakeForm';
import DispatchRadar from '@/components/DispatchRadar';
import DispatchCard from '@/components/DispatchCard';
import CallInspector from '@/components/CallInspector';
import { CallAttempt, CascadeSession, ScenarioPreset, TradeType } from '@/lib/types';
import { SCENARIO_PRESETS } from '@/lib/scenarios';
import { Shield, Lightbulb } from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState<'simulator' | 'live'>('simulator');
  const [calleAvailable, setCalleAvailable] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(SCENARIO_PRESETS[0].id);

  const [trade, setTrade] = useState<TradeType>(SCENARIO_PRESETS[0].trade);
  const [address, setAddress] = useState<string>(SCENARIO_PRESETS[0].address);
  const [description, setDescription] = useState<string>(SCENARIO_PRESETS[0].description);
  const [maxEtaMinutes, setMaxEtaMinutes] = useState<number>(SCENARIO_PRESETS[0].maxEtaMinutes);
  const [maxBudget, setMaxBudget] = useState<number>(SCENARIO_PRESETS[0].maxBudget);

  const [session, setSession] = useState<CascadeSession | null>(null);
  const [isCascading, setIsCascading] = useState<boolean>(false);
  const [inspectingAttempt, setInspectingAttempt] = useState<CallAttempt | null>(null);
  
  const cascadingRef = useRef(false);

  useEffect(() => {
    fetch('/api/calle/status')
      .then(r => r.json())
      .then(data => setCalleAvailable(data.available))
      .catch(() => setCalleAvailable(false));
  }, []);

  useEffect(() => {
    if (mode === 'live') {
      setTrade('plumbing');
      setAddress('');
      setDescription('');
      setMaxEtaMinutes(60);
      setMaxBudget(300);
      setSelectedPresetId(null);
      setSession(null);
    } else {
      handleSelectPreset(SCENARIO_PRESETS[0]);
      setSession(null);
    }
  }, [mode]);

  const handleSelectPreset = (preset: ScenarioPreset) => {
    setSelectedPresetId(preset.id);
    setTrade(preset.trade);
    setAddress(preset.address);
    setDescription(preset.description);
    setMaxEtaMinutes(preset.maxEtaMinutes);
    setMaxBudget(preset.maxBudget);
    setSession(null);
  };

  const handleStartCascade = async () => {
    try {
      setIsCascading(true);
      cascadingRef.current = true;

      const res = await fetch('/api/dispatch/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade, address, description, maxEtaMinutes, maxBudget, mode })
      });

      const initialSession: CascadeSession = await res.json();
      setSession(initialSession);

      const pollLoop = async (sessId: string) => {
        if (!cascadingRef.current) return;

        try {
          const stepRes = await fetch(`/api/dispatch/${sessId}`, { method: 'POST' });
          const updatedSession: CascadeSession = await stepRes.json();
          
          setSession(updatedSession);
          if (inspectingAttempt) {
            const fresh = updatedSession.attempts.find(a => a.id === inspectingAttempt.id);
            if (fresh) setInspectingAttempt(fresh);
          }

          if (updatedSession.status === 'active' && !updatedSession.winningAttemptId) {
            // Live mode takes 30-90s per call, poll safely every 3 seconds to protect quota
            // Simulator takes 1.5s per delay
            const delay = updatedSession.mode === 'live' ? 3000 : 1500;
            setTimeout(() => pollLoop(sessId), delay);
          } else {
            setIsCascading(false);
            cascadingRef.current = false;
            if (updatedSession.winningAttemptId) {
              const win = updatedSession.attempts.find(a => a.id === updatedSession.winningAttemptId);
              if (win) setInspectingAttempt(win);
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
          // Retry logic on network failure
          setTimeout(() => pollLoop(sessId), 3000);
        }
      };

      setTimeout(() => {
        pollLoop(initialSession.id);
      }, 1000);

    } catch (err) {
      console.error(err);
      setIsCascading(false);
      cascadingRef.current = false;
    }
  };

  const handleCancelCascade = async () => {
    cascadingRef.current = false;
    setIsCascading(false);
    if (session) {
      try {
        const res = await fetch(`/api/dispatch/${session.id}`, { method: 'DELETE' });
        const updated = await res.json();
        setSession(updated);
      } catch (err) {
        setSession(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
    }
  };

  const handleReset = () => {
    setSession(null);
    setIsCascading(false);
    cascadingRef.current = false;
    setInspectingAttempt(null);
    if (mode === 'live') {
      setAddress('');
      setDescription('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode={mode} onModeToggle={setMode} calleAvailable={calleAvailable} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {mode === 'simulator' && (
          <ScenarioPresets onSelect={handleSelectPreset} selectedId={selectedPresetId} disabled={isCascading} />
        )}

        {session && session.status === 'completed' && session.winningAttemptId && (
          <DispatchCard session={session} onReset={handleReset} />
        )}

        {mode === 'live' && address === '' && description === '' && !isCascading && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200/80 leading-relaxed">
                <strong>Live CALL-E Mode:</strong> Real phone calls will be placed. Enter an emergency description or click the button to autofill a test incident to dial your contractor roster.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAddress('420 Market St, Apt 4B, San Francisco, CA');
                setDescription('Active water line leak in master bathroom. Flooding hazard requiring emergency shutoff and repair.');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
            >
              Autofill Test Incident
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-5 space-y-6">
            <IntakeForm
              trade={trade} onTradeChange={(t) => { setTrade(t); setSelectedPresetId(null); }}
              address={address} onAddressChange={(a) => { setAddress(a); setSelectedPresetId(null); }}
              description={description} onDescriptionChange={(d) => { setDescription(d); setSelectedPresetId(null); }}
              maxEtaMinutes={maxEtaMinutes} onMaxEtaChange={setMaxEtaMinutes}
              maxBudget={maxBudget} onMaxBudgetChange={setMaxBudget}
              onStartCascade={handleStartCascade}
              onCancelCascade={handleCancelCascade}
              isCascading={isCascading} mode={mode}
            />

            <div className="glass-panel rounded-2xl p-5 text-xs text-slate-400 space-y-3">
              <div className="flex items-center gap-2 text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <Shield className="h-4 w-4 text-amber-500" />
                Why FixFast Wins on CALL-E
              </div>
              <ul className="space-y-2 text-[11px] list-disc list-inside text-slate-400 leading-relaxed">
                <li><strong className="text-slate-300">Phone-Native Execution:</strong> Trades answer voice calls, not web forms.</li>
                <li><strong className="text-slate-300">Strict Anti-Double-Booking:</strong> Cascade terminates atomically on confirmation.</li>
                <li><strong className="text-slate-300">Verbatim Audio Grounding:</strong> Verifies technician name and pricing.</li>
              </ul>
            </div>
          </div>

          <div className="xl:col-span-7">
            <DispatchRadar
              session={session}
              onSelectAttempt={(att) => setInspectingAttempt(att)}
              selectedAttemptId={inspectingAttempt?.id || null}
              onCancelCascade={handleCancelCascade}
            />
          </div>
        </div>
      </main>

      {inspectingAttempt && (
        <CallInspector attempt={inspectingAttempt} onClose={() => setInspectingAttempt(null)} />
      )}

      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-md py-6 mt-8 text-center text-xs text-slate-500 font-mono">
        FixFast • Autonomous Emergency Trades Agent • CALL-E Hackathon Submission 2026
      </footer>
    </div>
  );
}
