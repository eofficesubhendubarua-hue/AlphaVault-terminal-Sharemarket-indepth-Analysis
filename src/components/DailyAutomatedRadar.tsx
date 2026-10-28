import React, { useState, useEffect } from 'react';
import { DailyRadarSnapshot } from '../types/investment';
import { INITIAL_SNAPSHOT } from '../data/watchlistData';
import {
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DailyAutomatedRadarProps {
  onSelectAsset?: (ticker: string) => void;
}

export const DailyAutomatedRadar: React.FC<DailyAutomatedRadarProps> = ({ onSelectAsset }) => {
  const [snapshot, setSnapshot] = useState<DailyRadarSnapshot>(INITIAL_SNAPSHOT);
  const [mode, setMode] = useState<'morning' | 'evening'>('morning');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [timeUntilNextRun, setTimeUntilNextRun] = useState('');
  const [autoPilotActive, setAutoPilotActive] = useState(true);
  const [archive, setArchive] = useState<DailyRadarSnapshot[]>([INITIAL_SNAPSHOT]);
  const [activeSpeechSynth, setActiveSpeechSynth] = useState<SpeechSynthesisUtterance | null>(null);

  // Calculate live countdown to the next automated daily run (8:30 AM or 9:30 PM IST)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Target upcoming IST schedule
      // 8:30 AM IST = 03:00 UTC, 9:30 PM IST = 16:00 UTC
      const utcHours = now.getUTCHours();
      const utcMins = now.getUTCMinutes();
      const currentUtcMinutes = utcHours * 60 + utcMins;

      const morningTarget = 3 * 60; // 03:00 UTC (8:30 AM IST)
      const eveningTarget = 16 * 60; // 16:00 UTC (9:30 PM IST)

      let diffMinutes = 0;
      let nextLabel = '';

      if (currentUtcMinutes < morningTarget) {
        diffMinutes = morningTarget - currentUtcMinutes;
        nextLabel = 'Morning Radar (8:30 AM IST)';
      } else if (currentUtcMinutes < eveningTarget) {
        diffMinutes = eveningTarget - currentUtcMinutes;
        nextLabel = 'Evening Review (9:30 PM IST)';
      } else {
        diffMinutes = 24 * 60 - currentUtcMinutes + morningTarget;
        nextLabel = 'Morning Radar (8:30 AM IST)';
      }

      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      setTimeUntilNextRun(`${h}h ${m}m (${nextLabel})`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  // Trigger automated daily analysis generator
  const runAutomatedAnalysis = async (selectedMode: 'morning' | 'evening') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/daily-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: selectedMode }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newSnap: DailyRadarSnapshot = {
          ...json.data,
          id: `snap-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        setSnapshot(newSnap);
        setArchive(prev => [newSnap, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.warn('Using baseline institutional snapshot on network fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (m: 'morning' | 'evening') => {
    setMode(m);
    runAutomatedAnalysis(m);
  };

  // Text-To-Speech audio player
  const toggleAudioBriefing = async () => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    const narrationText = `${snapshot.title}. Executive summary: ${snapshot.headline}. ${snapshot.executiveSummary}. Key recommendations include ${snapshot.topAccumulatePicks.map(p => `${p.ticker}: ${p.reason}`).join('. ')}.`;

    // Try server-side TTS first
    try {
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: narrationText }),
      });
      const ttsData = await ttsRes.json();
      if (ttsData.success && ttsData.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${ttsData.audioBase64}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.play();
        setIsPlayingAudio(true);
        return;
      }
    } catch {
      // Fallback to browser SpeechSynthesis
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(narrationText);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      setActiveSpeechSynth(utter);
      window.speechSynthesis.speak(utter);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Automation Control Bar */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">Continuous Automated Daily Investment Engine</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold mono border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
                AUTOPILOT: {autoPilotActive ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Next Automated Run In: <strong className="text-white mono">{timeUntilNextRun}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Twice Daily: 8:30 AM &amp; 9:30 PM IST</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mono text-xs">
          {/* Mode Selector */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-700">
            <button
              onClick={() => handleModeSwitch('morning')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                mode === 'morning'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>☀ Morning Radar</span>
            </button>
            <button
              onClick={() => handleModeSwitch('evening')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                mode === 'evening'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>☾ Evening Review</span>
            </button>
          </div>

          {/* Trigger Now Button */}
          <button
            onClick={() => runAutomatedAnalysis(mode)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isLoading ? 'Analyzing...' : 'Run Now'}</span>
          </button>

          {/* Audio Hands-Free Briefing */}
          <button
            onClick={toggleAudioBriefing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition ${
              isPlayingAudio
                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/30'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? 'Pause Voice' : 'Listen Briefing'}</span>
          </button>
        </div>
      </div>

      {/* Main Executive Snapshot Dossier */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold mono border border-blue-500/30 uppercase">
                {snapshot.mode === 'morning' ? '8:30 AM IST MORNING RADAR' : '9:30 PM IST EVENING REVIEW'}
              </span>
              <span className="text-xs text-slate-400 mono">
                Settlement Date: 2026-10-23 • Next Session: Mon Oct 26, 2026
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white mt-1.5">{snapshot.title}</h2>
            <p className="text-xs sm:text-sm text-emerald-400 font-medium mt-1">{snapshot.headline}</p>
          </div>

          <div className="text-right text-[11px] mono text-slate-400">
            <div>FII Cash: <strong className="text-emerald-400">+₹887.65 Cr</strong></div>
            <div>DII Cash: <strong className="text-emerald-400">+₹3,235.36 Cr</strong></div>
            <div>Brent: <strong className="text-amber-400">$115.76/bbl</strong></div>
          </div>
        </div>

        {/* 3 Macro & Strategy Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>1. Macro Backdrop &amp; Institutional Flow</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{snapshot.executiveSummary}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>2. High-Conviction Value Picks</span>
            </div>
            <div className="space-y-2">
              {snapshot.topAccumulatePicks.map(pick => (
                <div
                  key={pick.ticker}
                  onClick={() => onSelectAsset?.(pick.ticker)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between font-bold text-white">
                    <span className="text-emerald-300">{pick.ticker}</span>
                    <span className="text-[10px] text-emerald-400 mono">ACCUMULATE ↗</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">{pick.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2">
            <div className="font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>3. Microstructure Warnings &amp; iNAV Alerts</span>
            </div>
            <div className="space-y-2">
              {snapshot.cautionAndAvoid.map(item => (
                <div key={item.ticker} className="p-2 rounded-lg bg-slate-900 border border-rose-900/30">
                  <div className="font-bold text-rose-400">{item.ticker}</div>
                  <p className="text-[11px] text-rose-200 mt-0.5">{item.warning}</p>
                </div>
              ))}
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-amber-400">Tech Overlap Alert:</strong> MAFANG, MASPTOP50, and MON100 share &gt;60% US AI mega-cap overlap. Cap combined weighting.
              </div>
            </div>
          </div>
        </div>

        {/* Pivot Scenarios */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/30">
          <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Next Trading Session (Mon Oct 26, 2026) — Pivot Scenarios</span>
            <span className="mono text-[10px] text-slate-400">Calculated P: 22,656 | R1: 22,731 | S1: 22,524</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-blue-400">Base Case (Rangebound)</div>
              <p className="text-slate-300 mt-1">{snapshot.pivotScenarios.baseCase}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-emerald-400">Bull Case (FII Short Cover)</div>
              <p className="text-slate-300 mt-1">{snapshot.pivotScenarios.bullCase}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-rose-400">Bear Case (Oil Escalation)</div>
              <p className="text-slate-300 mt-1">{snapshot.pivotScenarios.bearCase}</p>
            </div>
          </div>
        </div>

        {/* Action Plan */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Institutional Execution Action Plan for Today
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {snapshot.actionPlanForToday.map((act, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* High-Profit Expansions, Contracts, Trade Deals & IPO Catalyst Highlights */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 via-slate-950 to-emerald-950/30 border border-blue-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>High-Profit Corporate Expansions, Major Contracts, Trade Deals &amp; IPO Radar</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Click any card to open full Business Model, 1W–1Y Return &amp; DRHP Audit
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div
              onClick={() => onSelectAsset?.('BHEL')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition space-y-1"
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-white">BHEL (New Contracts)</span>
                <span className="text-emerald-400 mono text-[10px]">+16.5% Upside</span>
              </div>
              <p className="text-[11px] text-slate-300">
                ₹1.6+ Lakh Cr order book; 800 MW supercritical thermal EPC awards + 80 Vande Bharat sleeper trainsets.
              </p>
            </div>

            <div
              onClick={() => onSelectAsset?.('RELIANCE')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition space-y-1"
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-white">RELIANCE (Expansions)</span>
                <span className="text-emerald-400 mono text-[10px]">+21.4% Upside</span>
              </div>
              <p className="text-[11px] text-slate-300">
                20 GW Jamnagar Solar Giga-Factory H2 FY26 commissioning + Disney Star JV &amp; NVIDIA AI data center deal.
              </p>
            </div>

            <div
              onClick={() => onSelectAsset?.('HINDZINC')}
              className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition space-y-1"
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-white">HINDZINC (Silver &amp; Capex)</span>
                <span className="text-emerald-400 mono text-[10px]">+18.4% + 5% Div</span>
              </div>
              <p className="text-[11px] text-slate-300">
                160 KTPA Debari Roaster &amp; 800 MTPA silver refinery expansion + US Corp Next-Gen zinc battery trade JV.
              </p>
            </div>

            <div
              onClick={() => onSelectAsset?.('JIOIPO')}
              className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 cursor-pointer transition space-y-1"
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-amber-300">JIO &amp; SFC IPOs (DRHP)</span>
                <span className="text-amber-400 mono text-[10px]">IPO AUDIT ↗</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Full Mainboard &amp; SME IPO audit: Fresh Issue vs OFS split, QIB subscription, and listing gain playbooks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

