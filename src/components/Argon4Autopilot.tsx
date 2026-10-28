import React, { useState, useEffect, useRef } from 'react';
import { WatchlistAsset, CustomAssetItem, AssetCategory } from '../types/investment';
import {
  ArgonRuleId,
  AutopilotSignal,
  AutopilotConfig,
  AutopilotMacroState,
  DEFAULT_AUTOPILOT_RULES,
  DEFAULT_AUTOPILOT_CONFIG,
  DEFAULT_MACRO_STATE,
  runArgonAutopilotScan,
} from '../utils/argonAutopilotEngine';
import { playAlertChime, sendDesktopNotification } from '../utils/audioAlert';
import { formatCurrency, formatSignedPct } from '../utils/quantLogic';
import {
  Bot,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Zap,
  TrendingDown,
  TrendingUp,
  Sliders,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Trash2,
  Layers,
  Cpu,
  BarChart3,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface Argon4AutopilotProps {
  assets: WatchlistAsset[];
  customAssets?: CustomAssetItem[];
  onSelectAssetForAudit?: (ticker: string) => void;
  onUpdateAssetPrice?: (id: number, newPrice: number) => void;
}

interface JournalEntry {
  id: string;
  timestamp: string;
  ticker: string;
  name: string;
  action: 'TRIGGER' | 'SIMULATED_FILL' | 'DISMISSED';
  ruleName: string;
  price: number;
  entryLimit: number;
  targetPrice: number;
  stopLoss: number;
  marginOfSafetyPct: number;
  notes: string;
}

interface ArgonAiSynthesis {
  engineVersion: string;
  timestamp: string;
  regimeLabel: string;
  aladdinRiskScore: number;
  executiveSummary: string;
  systemicFactorExposure: {
    crudeSensitivity: string;
    interestRateSensitivity: string;
    valuationMarginOfSafety: string;
    liquidityProfile: string;
  };
  autonomousActionDirectives: Array<{
    ticker: string;
    action: string;
    targetPrice: number;
    stopLoss: number;
    marginOfSafetyPct: number;
    upsidePotentialPct: number;
    recommendedWeightPct: number;
    rationale: string;
  }>;
  aladdinHedgePlaybook: string;
}

export const Argon4Autopilot: React.FC<Argon4AutopilotProps> = ({
  assets,
  customAssets = [],
  onSelectAssetForAudit,
}) => {
  // Autopilot Config State
  const [config, setConfig] = useState<AutopilotConfig>(() => {
    try {
      const saved = localStorage.getItem('alphavault_argon_config');
      return saved ? JSON.parse(saved) : DEFAULT_AUTOPILOT_CONFIG;
    } catch {
      return DEFAULT_AUTOPILOT_CONFIG;
    }
  });

  const [macroState, setMacroState] = useState<AutopilotMacroState>(DEFAULT_MACRO_STATE);
  const [activeSignals, setActiveSignals] = useState<AutopilotSignal[]>([]);
  const [scanSummary, setScanSummary] = useState<string>('Autopilot initialized. Ready for autonomous sweep.');
  const [totalScansCount, setTotalScansCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alphavault_argon_scans_count');
      return saved ? Number(saved) : 142;
    } catch {
      return 142;
    }
  });

  // Countdown timer for next scan
  const [secondsUntilNextScan, setSecondsUntilNextScan] = useState<number>(config.frequencySeconds);

  // Execution Journal State
  const [journal, setJournal] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('alphavault_argon_journal');
      return saved ? JSON.parse(saved) : [
        {
          id: 'log-1',
          timestamp: '2026-10-23 15:30:12 IST',
          ticker: 'BHEL',
          name: 'Bharat Heavy Electricals Ltd',
          action: 'SIMULATED_FILL',
          ruleName: 'Instant Profit Hunter: Institutional Value Dip',
          price: 384.2,
          entryLimit: 376.5,
          targetPrice: 518.0,
          stopLoss: 349.0,
          marginOfSafetyPct: 26.1,
          notes: 'Executed Tranche 1 algorithmic limit order at support; 200-DMA retest.',
        },
        {
          id: 'log-2',
          timestamp: '2026-10-23 15:15:00 IST',
          ticker: 'MONQ50',
          name: 'Motilal Oswal Nasdaq 50 ETF',
          action: 'TRIGGER',
          ruleName: 'ETF iNAV Premium Arbitrage & Quota Trap Guard',
          price: 221.5,
          entryLimit: 116.9,
          targetPrice: 116.9,
          stopLoss: 210.0,
          marginOfSafetyPct: -47.2,
          notes: 'CRITICAL AVOID: 89.5% premium to fair iNAV quarantined.',
        },
      ];
    } catch {
      return [];
    }
  });

  // Argon 4 AI Thinking Synthesis State
  const [aiSynthesis, setAiSynthesis] = useState<ArgonAiSynthesis | null>(() => {
    try {
      const saved = localStorage.getItem('alphavault_argon_ai_synthesis');
      return saved ? JSON.parse(saved) : {
        engineVersion: 'Argon-4 Quant Autopilot v4.2.1',
        timestamp: new Date().toISOString(),
        regimeLabel: 'HIGH_CRUDE_VOLATILITY_VALUE_ACCUMULATION',
        aladdinRiskScore: 68,
        executiveSummary: 'Global energy supply disruption ($115.76/bbl crude) is driving institutional rotation away from debt-heavy consumer discretionary into sovereign baseload energy, non-ferrous cyclicals, and bullion hedges. Domestic retail margin liquidations in smallcaps have widened the margin-of-safety discount to 18–35% across first-decile quality compounders.',
        systemicFactorExposure: {
          crudeSensitivity: 'HIGH_VULNERABILITY',
          interestRateSensitivity: 'MODERATE_NEUTRAL',
          valuationMarginOfSafety: 'ATTRACTIVE_DIP_ZONE',
          liquidityProfile: 'HEALTHY_DOMESTIC_INFLOWS',
        },
        autonomousActionDirectives: [
          {
            ticker: 'COALINDIA',
            action: 'BUY_TRANCHE_1',
            targetPrice: 520.0,
            stopLoss: 360.0,
            marginOfSafetyPct: 28.5,
            upsidePotentialPct: 30.8,
            recommendedWeightPct: 7.5,
            rationale: 'Thermal substitution hedge with 6.67% dividend yield floor at 7.85x P/E.',
          },
          {
            ticker: 'HINDZINC',
            action: 'BUY_TRANCHE_1',
            targetPrice: 620.0,
            stopLoss: 435.0,
            marginOfSafetyPct: 32.0,
            upsidePotentialPct: 31.9,
            recommendedWeightPct: 6.0,
            rationale: 'Lowest cost quartile producer at 10.07x P/E; strong silver byproduct credit.',
          },
          {
            ticker: 'TATAGOLD',
            action: 'DEPLOY_HEDGE',
            targetPrice: 128.0,
            stopLoss: 96.0,
            marginOfSafetyPct: 15.0,
            upsidePotentialPct: 22.0,
            recommendedWeightPct: 10.0,
            rationale: 'Non-correlated systemic geopolitical crisis hedge.',
          },
          {
            ticker: 'MONQ50',
            action: 'STRICT_AVOID',
            targetPrice: 116.9,
            stopLoss: 210.0,
            marginOfSafetyPct: -47.0,
            upsidePotentialPct: 0.0,
            recommendedWeightPct: 0.0,
            rationale: 'RBI overseas investment limit freeze creates 89.5% premium to real NAV. Uncompensated downside.',
          },
        ],
        aladdinHedgePlaybook: 'Deploy 12-15% of total liquidity into Bullion ETFs (Tata Gold & Silver) and pithead energy compounders (Coal India). Avoid long-duration midcap growth until crude stabilizes below $108.',
      };
    } catch {
      return null;
    }
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string>('Just now');
  const [filterRule, setFilterRule] = useState<'ALL' | ArgonRuleId>('ALL');

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('alphavault_argon_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('alphavault_argon_journal', JSON.stringify(journal));
    } catch {}
  }, [journal]);

  useEffect(() => {
    try {
      localStorage.setItem('alphavault_argon_scans_count', String(totalScansCount));
    } catch {}
  }, [totalScansCount]);

  useEffect(() => {
    if (aiSynthesis) {
      try {
        localStorage.setItem('alphavault_argon_ai_synthesis', JSON.stringify(aiSynthesis));
      } catch {}
    }
  }, [aiSynthesis]);

  // Execute scan function
  const executeScan = (forceManual: boolean = false) => {
    const scanResult = runArgonAutopilotScan(assets, macroState, config);
    setActiveSignals(scanResult.signals);
    setScanSummary(scanResult.summary);
    setLastScanTimestamp(new Date().toLocaleTimeString('en-IN', { hour12: true }));
    setTotalScansCount(prev => prev + 1);

    // If autoExecuteMode is ON and new signals arrive, auto-simulate fills
    if (config.autoExecuteMode && scanResult.signals.length > 0) {
      const topBuy = scanResult.signals.find(
        s => s.severity === 'HIGH_CONVICTION_BUY' && !journal.some(j => j.ticker === s.ticker && j.action === 'SIMULATED_FILL')
      );
      if (topBuy) {
        handleExecuteSignal(topBuy, true);
      }
    }

    // Play chime if new signal found
    if (config.audioChimes && scanResult.signals.length > 0 && forceManual) {
      playAlertChime('dip');
    }
  };

  // Initial scan on mount
  useEffect(() => {
    executeScan(false);
  }, [assets, config.enabled, config.rules]);

  // Continuous Autopilot Interval Loop
  useEffect(() => {
    if (!config.enabled) return;

    setSecondsUntilNextScan(config.frequencySeconds);

    const timer = setInterval(() => {
      setSecondsUntilNextScan(prev => {
        if (prev <= 1) {
          executeScan(false);
          return config.frequencySeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.enabled, config.frequencySeconds, assets, config.rules]);

  // Execute or confirm signal
  const handleExecuteSignal = (signal: AutopilotSignal, isAutomated: boolean = false) => {
    const newEntry: JournalEntry = {
      id: `exec-${signal.ticker}-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) + ' IST',
      ticker: signal.ticker,
      name: signal.name,
      action: 'SIMULATED_FILL',
      ruleName: signal.ruleName,
      price: signal.currentPrice,
      entryLimit: signal.entryLimit,
      targetPrice: signal.targetPrice,
      stopLoss: signal.stopLoss,
      marginOfSafetyPct: signal.marginOfSafetyPct,
      notes: `${isAutomated ? '[AUTOPILOT AUTO-FILL]' : '[1-CLICK OPERATOR EXECUTION]'} Simulated limit order tranche placed at ₹${signal.entryLimit}. Target: ₹${signal.targetPrice} (+${signal.estimatedUpsidePct}%), Stop: ₹${signal.stopLoss}.`,
    };

    setJournal(prev => [newEntry, ...prev.slice(0, 99)]);
    if (config.audioChimes) {
      playAlertChime('success');
    }

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 60, 40]);
    }
  };

  const handleDismissSignal = (signalId: string, ticker: string) => {
    setActiveSignals(prev => prev.filter(s => s.id !== signalId));
    const newEntry: JournalEntry = {
      id: `dismiss-${ticker}-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) + ' IST',
      ticker,
      name: ticker,
      action: 'DISMISSED',
      ruleName: 'Manual Operator Dismissal',
      price: 0,
      entryLimit: 0,
      targetPrice: 0,
      stopLoss: 0,
      marginOfSafetyPct: 0,
      notes: 'Signal dismissed from active order queue by user.',
    };
    setJournal(prev => [newEntry, ...prev.slice(0, 99)]);
  };

  const handleClearJournal = () => {
    setJournal([]);
  };

  const handleExportJournalCsv = () => {
    if (journal.length === 0) return;
    const headers = 'ID,Timestamp,Ticker,Name,Action,Rule,CurrentPrice,EntryLimit,TargetPrice,StopLoss,MarginOfSafetyPct,Notes\n';
    const rows = journal
      .map(j =>
        `"${j.id}","${j.timestamp}","${j.ticker}","${j.name}","${j.action}","${j.ruleName}",${j.price},${j.entryLimit},${j.targetPrice},${j.stopLoss},${j.marginOfSafetyPct},"${j.notes.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Argon4_Autopilot_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Gemini-4 Argon AI Deep Portfolio Synthesis
  const handleTriggerArgonAiSynthesis = async () => {
    setAiLoading(true);
    try {
      const assetsSummary = assets.slice(0, 15).map(a => ({
        ticker: a.ticker,
        name: a.name,
        type: a.type,
        price: a.price,
        chg1d: a.chg1d,
        dd52w: a.dd52w,
        pe: a.pe,
        verdict: a.verdict,
      }));

      const res = await fetch('/api/argon-autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetsSummary,
          macroState,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setAiSynthesis(json.data);
        if (config.audioChimes) {
          playAlertChime('target');
        }
      }
    } catch (err: any) {
      console.error('Error triggering Argon AI synthesis:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredSignals = activeSignals.filter(s => {
    if (filterRule === 'ALL') return true;
    return s.ruleId === filterRule;
  });

  const executedCount = journal.filter(j => j.action === 'SIMULATED_FILL').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Argon 4 Autopilot Master HUD */}
      <section className="glass-card rounded-2xl p-4 sm:p-5 border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-[#061325] to-[#040914] shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold mono tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                ARGON-4 QUANT AUTOPILOT
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mono border ${
                  config.enabled
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    config.enabled ? 'bg-emerald-400 live-dot' : 'bg-amber-400'
                  }`}
                />
                {config.enabled ? 'AUTONOMOUS SWEEP ENGAGED' : 'AUTOPILOT PAUSED'}
              </span>
              <span className="text-[11px] text-slate-400 mono hidden sm:inline">
                Next sweep in: <strong className="text-cyan-300">{secondsUntilNextScan}s</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Autonomous Value Harvester &amp; Aladdin Execution Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Powered by <strong>Gemini 4 Argon</strong> and <strong>Aladdin multi-factor risk logic</strong>.
              Continuously snipes bearish market dips across 19 core assets, calculates dynamic margins of safety,
              protects against ETF iNAV traps, and manages simulated algorithmic orders.
            </p>
          </div>

          {/* Quick Autopilot Control Station */}
          <div className="flex flex-wrap items-center gap-2 mono text-xs">
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
                if (!config.enabled) {
                  playAlertChime('target');
                }
              }}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg ${
                config.enabled
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/40'
              }`}
            >
              {config.enabled ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Autopilot</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Engage Autopilot</span>
                </>
              )}
            </button>

            <button
              onClick={() => executeScan(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Run instant manual scan sweep across all assets"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sweep Now</span>
            </button>

            <button
              onClick={() => setConfig(prev => ({ ...prev, audioChimes: !prev.audioChimes }))}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                config.audioChimes
                  ? 'bg-slate-800 text-cyan-400 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={config.audioChimes ? 'Audio chimes active' : 'Audio muted'}
            >
              {config.audioChimes ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={async () => {
                await sendDesktopNotification(
                  'AlphaVault Argon-4 Autopilot',
                  'Desktop notification permission verified for instant profit hunting triggers.'
                );
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Test browser notification permission"
            >
              <Bell className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Live Frequency & Execution Mode Toggles */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold">Sweep Frequency:</span>
            {[
              { sec: 5, label: '5s Hyper' },
              { sec: 10, label: '10s Active' },
              { sec: 30, label: '30s Swing' },
              { sec: 60, label: '60s Macro' },
            ].map(f => (
              <button
                key={f.sec}
                onClick={() => setConfig(prev => ({ ...prev, frequencySeconds: f.sec }))}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                  config.frequencySeconds === f.sec
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Execution Mode:</span>
              <button
                onClick={() =>
                  setConfig(prev => ({ ...prev, autoExecuteMode: !prev.autoExecuteMode }))
                }
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  config.autoExecuteMode
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-amber-300 border-slate-800'
                }`}
              >
                <Zap className="w-3 h-3 text-current" />
                <span>{config.autoExecuteMode ? 'Auto-Execute (Simulated)' : 'Confirmation Required'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top 4 Telemetry Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mono">
        <div className="glass-card rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SCANS COMPLETED</span>
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 text-xl font-bold text-white">{totalScansCount.toLocaleString()}</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">Last sweep: {lastScanTimestamp}</div>
        </div>

        <div className="glass-card rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ACTIVE TRIGGERS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 text-xl font-bold text-amber-300">{activeSignals.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {activeSignals.filter(s => s.severity === 'HIGH_CONVICTION_BUY').length} Buy Dips •{' '}
            {activeSignals.filter(s => s.severity === 'HEDGE_ALLOCATE').length} Hedges
          </div>
        </div>

        <div className="glass-card rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SIMULATED ORDERS FILLED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 text-xl font-bold text-emerald-400">{executedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zero slippage limit orders</div>
        </div>

        <div className="glass-card rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ALADDIN TAIL RISK SCORE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 text-xl font-bold text-purple-300">
            {aiSynthesis?.aladdinRiskScore || 68}/100
          </div>
          <div className="text-[10px] text-purple-400 mt-0.5">High Crude Volatility Regime</div>
        </div>
      </section>

      {/* Argon 4 Autonomous AI Thinking Synthesizer Card */}
      <section className="glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/30 bg-gradient-to-br from-slate-950 via-[#120a22] to-[#0a0614] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Argon-4 AI Thinking Synthesizer
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 4 Argon High-Thinking
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous portfolio health, regime risk decomposition &amp; macro hedging directives
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerArgonAiSynthesis}
            disabled={aiLoading}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs mono flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md shadow-purple-900/30 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Argon Thinking...' : 'Re-Synthesize via Argon 4'}</span>
          </button>
        </div>

        {aiSynthesis && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-200 leading-relaxed">
              <span className="font-bold text-purple-300 mono mr-2">EXECUTIVE QUANT AUDIT:</span>
              {aiSynthesis.executiveSummary}
            </div>

            {/* Factor Exposures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mono">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">CRUDE SENSITIVITY</span>
                <span className="font-bold text-rose-400 text-xs">
                  {aiSynthesis.systemicFactorExposure.crudeSensitivity}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">RATE SENSITIVITY</span>
                <span className="font-bold text-blue-300 text-xs">
                  {aiSynthesis.systemicFactorExposure.interestRateSensitivity}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">VALUATION SAFETY</span>
                <span className="font-bold text-emerald-400 text-xs">
                  {aiSynthesis.systemicFactorExposure.valuationMarginOfSafety}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">DOMESTIC LIQUIDITY</span>
                <span className="font-bold text-cyan-300 text-xs">
                  {aiSynthesis.systemicFactorExposure.liquidityProfile}
                </span>
              </div>
            </div>

            {/* Aladdin Tail-Risk Hedge Playbook */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-300 mono mr-1.5">
                  ALADDIN TAIL-RISK HEDGE PLAYBOOK:
                </span>
                <span className="text-slate-300">{aiSynthesis.aladdinHedgePlaybook}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Interactive Rule Engine Configuration Matrix */}
      <section className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Argon-4 Algorithmic Rule Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Institutional rules continuously evaluated against every incoming tick and closing valuation
            </p>
          </div>
          <div className="text-xs mono text-cyan-400">
            {Object.values(config.rules).filter(Boolean).length} / 5 Rules Active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEFAULT_AUTOPILOT_RULES.map(rule => {
            const isEnabled = config.rules[rule.id] ?? true;
            return (
              <div
                key={rule.id}
                className={`p-3 rounded-xl border transition ${
                  isEnabled
                    ? 'bg-slate-900/90 border-slate-700/80'
                    : 'bg-slate-950/60 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white">{rule.name}</h4>
                  <button
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        rules: { ...prev.rules, [rule.id]: !isEnabled },
                      }));
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold mono border cursor-pointer ${
                      isEnabled
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {isEnabled ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{rule.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Autonomous Signals & Simulated Orders Queue */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Active Order Queue &amp; Dip Triggers ({filteredSignals.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Algorithmic limit bids calculated with institutional margin of safety &amp; stop-loss gates
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs mono">
            {(['ALL', 'VALUATION_DIP', 'ALADDIN_HEDGE', 'INAV_ARBITRAGE', 'MUTUAL_FUND_DCA'] as const).map(
              r => (
                <button
                  key={r}
                  onClick={() => setFilterRule(r)}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${
                    filterRule === r
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {r === 'ALL'
                    ? 'All Rules'
                    : r === 'VALUATION_DIP'
                    ? 'Value Dips'
                    : r === 'ALADDIN_HEDGE'
                    ? 'Aladdin Hedges'
                    : r === 'INAV_ARBITRAGE'
                    ? 'iNAV Traps'
                    : 'MF DCA'}
                </button>
              )
            )}
          </div>
        </div>

        {filteredSignals.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-200">
              All 19 assets currently conform to risk tolerance.
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No unhedged value divergence or critical traps triggered under current filter. Autopilot
              will sound an alert when market dips create new margin-of-safety opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSignals.map(sig => {
              const isBuy = sig.severity === 'HIGH_CONVICTION_BUY';
              const isHedge = sig.severity === 'HEDGE_ALLOCATE';
              const isAvoid = sig.severity === 'CRITICAL_AVOID_EXIT';

              return (
                <div
                  key={sig.id}
                  className={`glass-card rounded-xl p-4 border transition hover:border-slate-600 space-y-3 relative ${
                    isAvoid
                      ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-slate-950 to-slate-950'
                      : isBuy
                      ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-slate-950'
                      : 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-slate-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-base mono">{sig.ticker}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded font-semibold mono bg-slate-800 text-slate-300">
                          {sig.category}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-bold mono border ${
                            isAvoid
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : isBuy
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {sig.severity.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5 font-medium">{sig.name}</div>
                    </div>

                    <div className="text-right mono">
                      <div className="text-xs text-slate-400">Current Price</div>
                      <div className="text-sm font-bold text-white">
                        {formatCurrency(sig.currentPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Trigger description */}
                  <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                    <span className="font-bold text-cyan-300 mono mr-1.5">{sig.ruleName}:</span>
                    {sig.triggerCondition}
                  </div>

                  {/* Pricing Matrix */}
                  {!isAvoid && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                      <div>
                        <span className="text-[9px] text-slate-400 block">ENTRY LIMIT</span>
                        <span className="font-bold text-cyan-300 text-xs">
                          {formatCurrency(sig.entryLimit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">TARGET</span>
                        <span className="font-bold text-emerald-400 text-xs">
                          {formatCurrency(sig.targetPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">STOP LOSS</span>
                        <span className="font-bold text-rose-400 text-xs">
                          {formatCurrency(sig.stopLoss)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">MARGIN OF SAFETY</span>
                        <span className="font-bold text-emerald-300 text-xs">
                          +{sig.marginOfSafetyPct}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Rationale */}
                  <p className="text-[11px] text-slate-400 italic">
                    &ldquo;{sig.argonRationale}&rdquo;
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs mono">
                    <div className="flex items-center gap-2">
                      {onSelectAssetForAudit && (
                        <button
                          onClick={() => onSelectAssetForAudit(sig.ticker)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Deep Audit</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDismissSignal(sig.id, sig.ticker)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
                      >
                        Dismiss
                      </button>

                      {!isAvoid && (
                        <button
                          onClick={() => handleExecuteSignal(sig, false)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition active:scale-95 cursor-pointer"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Simulate Limit Fill</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Autonomous Execution Journal & Order Audit Trail */}
      <section className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Argon-4 Autonomous Order Journal &amp; Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live chronological ledger of all automated scans, signals, and simulated fills
            </p>
          </div>

          <div className="flex items-center gap-2 mono text-xs">
            <button
              onClick={handleExportJournalCsv}
              disabled={journal.length === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Download execution audit log as CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleClearJournal}
              disabled={journal.length === 0}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
              title="Clear journal history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {journal.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-6 italic mono">
            No executions logged yet. As the autopilot runs, simulated fills will be recorded here.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-80 overflow-y-auto no-scrollbar rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs mono">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0 z-10 text-[10px]">
                  <th className="p-2.5">TIMESTAMP</th>
                  <th className="p-2.5">TICKER</th>
                  <th className="p-2.5">ACTION</th>
                  <th className="p-2.5">RULE</th>
                  <th className="p-2.5 text-right">PRICE</th>
                  <th className="p-2.5 text-right">ENTRY / TARGET</th>
                  <th className="p-2.5">MARGIN OF SAFETY</th>
                  <th className="p-2.5">NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {journal.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-2.5 text-slate-400 whitespace-nowrap text-[11px]">
                      {entry.timestamp}
                    </td>
                    <td className="p-2.5 font-bold text-white">{entry.ticker}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          entry.action === 'SIMULATED_FILL'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : entry.action === 'TRIGGER'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300 max-w-[140px] truncate" title={entry.ruleName}>
                      {entry.ruleName}
                    </td>
                    <td className="p-2.5 text-right font-semibold text-white">
                      {entry.price > 0 ? formatCurrency(entry.price) : '—'}
                    </td>
                    <td className="p-2.5 text-right text-slate-300 whitespace-nowrap">
                      {entry.entryLimit > 0
                        ? `${formatCurrency(entry.entryLimit)} → ${formatCurrency(entry.targetPrice)}`
                        : '—'}
                    </td>
                    <td className="p-2.5 font-bold">
                      {entry.marginOfSafetyPct !== 0 ? (
                        <span className={entry.marginOfSafetyPct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {entry.marginOfSafetyPct > 0 ? `+${entry.marginOfSafetyPct}%` : `${entry.marginOfSafetyPct}%`}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-2.5 text-slate-400 text-[11px] max-w-[220px] truncate" title={entry.notes}>
                      {entry.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
