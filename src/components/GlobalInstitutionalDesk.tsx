import React, { useState, useMemo } from 'react';
import {
  WatchlistAsset,
  GlobalInstitutionalConsensus,
} from '../types/investment';
import { generateGlobalInstitutionalConsensus } from '../utils/institutionalIntelligence';
import {
  ShieldAlert,
  Sliders,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  DollarSign,
  Activity,
  Landmark,
  Building2,
  PieChart,
  Scale,
  Award,
  Zap,
  Compass,
  AlertTriangle,
  ChevronRight,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface GlobalInstitutionalDeskProps {
  assets: WatchlistAsset[];
  onSelectAssetForAudit?: (ticker: string) => void;
}

type DeskTab = 'all' | 'blackrock' | 'goldman' | 'jefferies' | 'rothschild';

export const GlobalInstitutionalDesk: React.FC<GlobalInstitutionalDeskProps> = ({
  assets,
  onSelectAssetForAudit,
}) => {
  const [activeDesk, setActiveDesk] = useState<DeskTab>('all');
  const [selectedTicker, setSelectedTicker] = useState<string>(assets[0]?.ticker || 'TATAMOTORS');
  const [brentCrudeSlider, setBrentCrudeSlider] = useState<number>(115.76);
  const [indiaVixSlider, setIndiaVixSlider] = useState<number>(16.67);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('oil-shock');

  const currentAsset = useMemo(() => {
    return assets.find(a => a.ticker.toUpperCase() === selectedTicker.toUpperCase()) || assets[0];
  }, [assets, selectedTicker]);

  // Compute 4-Institution Consensus Engine
  const institutionalData: GlobalInstitutionalConsensus = useMemo(() => {
    if (!currentAsset) {
      return generateGlobalInstitutionalConsensus({ ticker: 'TATAMOTORS', price: 928.4, dd52w: -17.5 });
    }
    return generateGlobalInstitutionalConsensus({
      ticker: currentAsset.ticker,
      name: currentAsset.name,
      type: currentAsset.type,
      price: currentAsset.price,
      pe: currentAsset.pe,
      dd52w: currentAsset.dd52w,
      roce: currentAsset.roce,
      de: currentAsset.de,
      high52: currentAsset.high52w,
      low52: currentAsset.low52w,
    });
  }, [currentAsset]);

  // Dynamic Aladdin VaR adjusted by custom slider
  const dynamicVaR95 = useMemo(() => {
    const crudeImpact = Math.max(0, (brentCrudeSlider - 90) * 0.015);
    const vixImpact = Math.max(0, (indiaVixSlider - 14) * 0.06);
    return Number((institutionalData.blackrock.var95Pct + crudeImpact + vixImpact).toFixed(2));
  }, [institutionalData, brentCrudeSlider, indiaVixSlider]);

  return (
    <div className="space-y-6">
      {/* Header Banner: Global Institutional Advisory Tier */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-purple-950/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold mono bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                <Landmark className="w-3 h-3 text-blue-400" />
                <span>GLOBAL INSTITUTIONAL CONSENSUS</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                MULTI-DESK QUANT OS
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex flex-wrap items-center gap-2">
              <span>Institutional Research Suite</span>
              <span className="text-xs sm:text-sm font-normal text-slate-400">
                (BlackRock Aladdin • Goldman Sachs • Jefferies • Rothschild &amp; Co)
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Unified cross-institutional analysis combining <strong>BlackRock Aladdin</strong> enterprise risk modeling, <strong>Goldman Sachs</strong> Economic Value Added (EVA) &amp; conviction tiers, <strong>Jefferies</strong> Greed &amp; Fear cycle positioning, and <strong>Rothschild &amp; Co</strong> sovereign wealth preservation safeguards.
            </p>
          </div>

          {/* Quick Asset Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Asset Focus:</span>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white font-semibold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 mono"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.ticker}>
                  {a.ticker} — {a.name.slice(0, 26)} ({a.unit || '₹'}{a.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Desk Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-5 border-t border-slate-800/80 mt-5">
          <button
            onClick={() => setActiveDesk('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 whitespace-nowrap ${
              activeDesk === 'all'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4-Desk Unified Consensus</span>
          </button>
          <button
            onClick={() => setActiveDesk('blackrock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 whitespace-nowrap ${
              activeDesk === 'blackrock'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>BlackRock "Aladdin" Risk OS</span>
          </button>
          <button
            onClick={() => setActiveDesk('goldman')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 whitespace-nowrap ${
              activeDesk === 'goldman'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Goldman Sachs Marquee</span>
          </button>
          <button
            onClick={() => setActiveDesk('jefferies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 whitespace-nowrap ${
              activeDesk === 'jefferies'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Jefferies "Greed &amp; Fear"</span>
          </button>
          <button
            onClick={() => setActiveDesk('rothschild')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 whitespace-nowrap ${
              activeDesk === 'rothschild'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Rothschild &amp; Co Wealth</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS: 4-INSTITUTION SNAPSHOT FOR CURRENT ASSET */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. BlackRock Aladdin Card */}
        <div
          onClick={() => setActiveDesk('blackrock')}
          className={`glass-card rounded-xl p-4 border transition cursor-pointer ${
            activeDesk === 'blackrock' ? 'border-blue-500 bg-blue-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              BLACKROCK ALADDIN
            </span>
            <span className="text-[10px] font-bold text-slate-400 mono">
              VaR 95%: <strong className="text-white">{dynamicVaR95}%</strong>
            </span>
          </div>
          <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>{institutionalData.blackrock.riskRating.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
            {institutionalData.blackrock.aladdinHedgeDirective}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] mono">
            <span className="text-slate-400">Factor Beta: {institutionalData.blackrock.factorBeta}x</span>
            <span className="text-blue-400 flex items-center gap-0.5">Explore Risk <ChevronRight className="w-3 h-3" /></span>
          </div>
        </div>

        {/* 2. Goldman Sachs Card */}
        <div
          onClick={() => setActiveDesk('goldman')}
          className={`glass-card rounded-xl p-4 border transition cursor-pointer ${
            activeDesk === 'goldman' ? 'border-amber-500 bg-amber-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              GOLDMAN SACHS
            </span>
            <span className="text-[10px] font-bold text-emerald-400 mono">
              +{institutionalData.goldmanSachs.upsidePotentialPct}% Upside
            </span>
          </div>
          <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className={institutionalData.goldmanSachs.convictionRating === 'CONVICTION_BUY' ? 'text-emerald-400' : 'text-blue-400'}>
              {institutionalData.goldmanSachs.convictionRating.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
            12M Target: ₹{institutionalData.goldmanSachs.targetPrice12M} • EVA Spread: +{institutionalData.goldmanSachs.evaSpreadPct}%
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] mono">
            <span className="text-slate-400">Sharpe: {institutionalData.goldmanSachs.sharpeRatio}</span>
            <span className="text-amber-400 flex items-center gap-0.5">Explore Research <ChevronRight className="w-3 h-3" /></span>
          </div>
        </div>

        {/* 3. Jefferies Greed & Fear Card */}
        <div
          onClick={() => setActiveDesk('jefferies')}
          className={`glass-card rounded-xl p-4 border transition cursor-pointer ${
            activeDesk === 'jefferies' ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              JEFFERIES DESK
            </span>
            <span className="text-[10px] font-bold text-slate-300 mono">
              Score: {institutionalData.jefferies.greedAndFearScore}/100
            </span>
          </div>
          <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">{institutionalData.jefferies.cyclePhase.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
            Capex Backlog Growth: +{institutionalData.jefferies.capexBacklogGrowthPct}% • GARP Discount: {institutionalData.jefferies.garpMultipleDiscountPct}%
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] mono">
            <span className="text-slate-400">Flow: DII SIP Accumulation</span>
            <span className="text-emerald-400 flex items-center gap-0.5">Explore Strategy <ChevronRight className="w-3 h-3" /></span>
          </div>
        </div>

        {/* 4. Rothschild & Co Card */}
        <div
          onClick={() => setActiveDesk('rothschild')}
          className={`glass-card rounded-xl p-4 border transition cursor-pointer ${
            activeDesk === 'rothschild' ? 'border-purple-500 bg-purple-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
              ROTHSCHILD &amp; CO
            </span>
            <span className="text-[10px] font-bold text-purple-400 mono">
              Moat: {institutionalData.rothschild.intergenerationalMoatScore}/100
            </span>
          </div>
          <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300">{institutionalData.rothschild.sovereignProtectionGrade.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
            Altman Z-Score: {institutionalData.rothschild.altmanZScore} (Safe) • 0.0% Pledge • {institutionalData.rothschild.cleanCashConversionPct}% Cash Conversion
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] mono">
            <span className="text-slate-400">Runway: 10+ Yr Dynastic</span>
            <span className="text-purple-400 flex items-center gap-0.5">Explore Wealth <ChevronRight className="w-3 h-3" /></span>
          </div>
        </div>
      </div>

      {/* DETAIL SECTION: SWITCHABLE CONTENT BASED ON ACTIVE DESK */}
      {/* ======================================================== */}

      {/* VIEW 1: UNIFIED 4-DESK CONSENSUS */}
      {(activeDesk === 'all') && (
        <div className="space-y-6">
          {/* Consensus Scorecard & Unified Macro Theses */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-emerald-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg mono">
                  {institutionalData.consensusScore}
                </div>
                <div>
                  <div className="text-xs text-slate-400 mono">INSTITUTIONAL CONSENSUS SCORE</div>
                  <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{institutionalData.name} ({institutionalData.ticker})</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {institutionalData.consensusAction.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {onSelectAssetForAudit && (
                <button
                  onClick={() => onSelectAssetForAudit(institutionalData.ticker)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-900/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Full AI CFA Audit</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-300 mono flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>UNIFIED INSTITUTIONAL INVESTMENT THESES</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {institutionalData.unifiedMacroTheses.map((thesis, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold mono flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{thesis}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BLACKROCK ALADDIN ENTERPRISE RISK OPERATING SYSTEM */}
      {(activeDesk === 'blackrock' || activeDesk === 'all') && (
        <div className="glass-card rounded-2xl p-5 border border-blue-500/30 bg-slate-950/60 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>BlackRock "Aladdin" Enterprise Risk Operating System</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold mono">
                    RISK FACTOR DECOMPOSITION
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Value-at-Risk (VaR 95%/99%), Conditional Shortfall, and Macroeconomic Stress Scenarios
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 mono">VaR Budget Mode:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-xs mono">
                STRICT RISK-PARITY
              </span>
            </div>
          </div>

          {/* Interactive Stress Tester Sliders */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Interactive Aladdin Stress-Test Sliders</span>
              </span>
              <span className="text-[11px] text-slate-400 mono">
                Simulated 95% 1-Day VaR: <strong className="text-rose-400 font-bold">-{dynamicVaR95}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Brent Crude Oil Stress:</span>
                  <strong className="text-amber-400 mono">${brentCrudeSlider.toFixed(2)}/bbl</strong>
                </div>
                <input
                  type="range"
                  min="60"
                  max="160"
                  step="2"
                  value={brentCrudeSlider}
                  onChange={(e) => setBrentCrudeSlider(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>India VIX Volatility Stress:</span>
                  <strong className="text-rose-400 mono">{indiaVixSlider.toFixed(2)} pts</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="1"
                  value={indiaVixSlider}
                  onChange={(e) => setIndiaVixSlider(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Historical Stress Scenario Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 mono">2008 LEHMAN CRISIS</div>
              <div className="text-sm font-bold text-rose-400 mono mt-0.5">
                {institutionalData.blackrock.stressTestDrawdowns.gfc2008}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Severe credit squeeze drawdown</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 mono">2020 COVID CRASH</div>
              <div className="text-sm font-bold text-rose-400 mono mt-0.5">
                {institutionalData.blackrock.stressTestDrawdowns.covid2020}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Liquidity shock drawdown</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 mono">OIL SURGE ($130)</div>
              <div className={`text-sm font-bold mono mt-0.5 ${institutionalData.blackrock.stressTestDrawdowns.oilSurge130 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {institutionalData.blackrock.stressTestDrawdowns.oilSurge130 >= 0 ? '+' : ''}{institutionalData.blackrock.stressTestDrawdowns.oilSurge130}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Strait of Hormuz supply rationing</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 mono">STAGFLATION 1970s</div>
              <div className="text-sm font-bold text-amber-400 mono mt-0.5">
                {institutionalData.blackrock.stressTestDrawdowns.stagflation}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Persistent high inflation &amp; rates</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: GOLDMAN SACHS GLOBAL INVESTMENT RESEARCH */}
      {(activeDesk === 'goldman' || activeDesk === 'all') && (
        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-slate-950/60 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Goldman Sachs Global Investment Research &amp; Marquee</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold mono">
                    EQUITY RESEARCH TIER
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Economic Value Added (EVA), Prime Brokerage positioning, and 12-Month DCF Target Prices
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {institutionalData.goldmanSachs.convictionRating}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 mono">12M TARGET PRICE</div>
              <div className="text-xl font-bold text-white mono">
                ₹{institutionalData.goldmanSachs.targetPrice12M}
              </div>
              <span className="text-emerald-400 text-xs font-semibold mono">
                +{institutionalData.goldmanSachs.upsidePotentialPct}% Upside Potential
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 mono">EVA SPREAD (ROCE - WACC)</div>
              <div className="text-xl font-bold text-emerald-400 mono">
                +{institutionalData.goldmanSachs.evaSpreadPct}%
              </div>
              <p className="text-[11px] text-slate-400">
                Exceeds 9.5% weighted cost of capital; substantial shareholder value creation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 mono">PRIME BROKERAGE FLOWS</div>
              <div className="text-sm font-bold text-blue-400 mono mt-1">
                {institutionalData.goldmanSachs.primeBrokeragePositioning.replace(/_/g, ' ')}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Forward Sharpe Ratio: <strong className="text-white mono">{institutionalData.goldmanSachs.sharpeRatio}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: JEFFERIES GREED & FEAR EQUITY STRATEGY */}
      {(activeDesk === 'jefferies' || activeDesk === 'all') && (
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-slate-950/60 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Jefferies Global Equity Strategy &amp; "Greed &amp; Fear"</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold mono">
                    CAPEX &amp; FLOW SUPERCYCLE
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Structural Indian capex cycle, DII SIP liquidity absorption, and market sentiment timing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mono">Greed &amp; Fear Index:</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {institutionalData.jefferies.greedAndFearScore} / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 mono">THEMATIC CYCLE PHASE</div>
              <div className="text-base font-bold text-emerald-400 mono">
                {institutionalData.jefferies.cyclePhase.replace(/_/g, ' ')}
              </div>
              <p className="text-[11px] text-slate-400">
                Institutional accumulation underway as retail participants capitulate during macro pullbacks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 mono">CAPEX &amp; ORDER BACKLOG GROWTH</div>
              <div className="text-xl font-bold text-white mono">
                +{institutionalData.jefferies.capexBacklogGrowthPct}% YoY
              </div>
              <span className="text-xs text-slate-400">
                Multi-year revenue visibility anchored by sovereign and private infrastructure capex.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 mono">GARP MULTIPLE DISCOUNT</div>
              <div className="text-xl font-bold text-blue-400 mono">
                -{institutionalData.jefferies.garpMultipleDiscountPct}%
              </div>
              <span className="text-xs text-slate-400">
                Discount against 5-year historical median valuation multiples.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
            <strong>Jefferies Strategy Desk Commentary:</strong> {institutionalData.jefferies.jefferiesDeskTake}
          </div>
        </div>
      )}

      {/* VIEW 5: ROTHSCHILD & CO SOVEREIGN WEALTH PRESERVATION */}
      {(activeDesk === 'rothschild' || activeDesk === 'all') && (
        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-slate-950/60 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Rothschild &amp; Co Sovereign Advisory &amp; Dynastic Wealth</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold mono">
                    CAPITAL PRESERVATION
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Forensic balance sheet solvency, Altman Z-Score, 0% Promoter pledge, and generational compounding
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold mono bg-purple-500/15 text-purple-400 border border-purple-500/30">
              {institutionalData.rothschild.sovereignProtectionGrade.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 mono">ALTMAN Z-SCORE</div>
              <div className="text-lg font-bold text-emerald-400 mono mt-0.5">
                {institutionalData.rothschild.altmanZScore}
              </div>
              <span className="text-[10px] text-slate-400">Safe Zone (&gt;3.00)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 mono">PROMOTER PLEDGE</div>
              <div className="text-lg font-bold text-white mono mt-0.5">
                {institutionalData.rothschild.promoterPledgePct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-emerald-400">Pristine Zero-Encumbrance</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 mono">CLEAN CASH CONVERSION</div>
              <div className="text-lg font-bold text-purple-300 mono mt-0.5">
                {institutionalData.rothschild.cleanCashConversionPct}%
              </div>
              <span className="text-[10px] text-slate-400">CFO to EBITDA conversion</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 mono">MOAT SCORE</div>
              <div className="text-lg font-bold text-white mono mt-0.5">
                {institutionalData.rothschild.intergenerationalMoatScore}/100
              </div>
              <span className="text-[10px] text-purple-400">Dynastic Compounder</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300">
            <strong>Rothschild Advisory Verdict:</strong> {institutionalData.rothschild.rothschildVerdict}
          </div>
        </div>
      )}
    </div>
  );
};
