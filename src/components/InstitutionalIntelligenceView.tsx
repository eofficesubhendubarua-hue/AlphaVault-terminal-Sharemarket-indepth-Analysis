import React, { useState, useMemo } from 'react';
import {
  BlockDealItem,
  InstitutionalHoldingActivity,
  InsiderTradingDisclosure,
  GlobalInstitutionalConsensus,
} from '../types/investment';
import { generateGlobalInstitutionalConsensus } from '../utils/institutionalIntelligence';
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  BadgePercent,
  Calendar,
  Landmark,
  Award,
  ShieldAlert,
  Cpu,
  Sparkles,
} from 'lucide-react';

interface InstitutionalIntelligenceViewProps {
  ticker: string;
  category: string;
  blockDeals?: BlockDealItem[];
  institutionalActivity?: InstitutionalHoldingActivity;
  insiderTrading?: InsiderTradingDisclosure[];
  institutionalConsensus?: GlobalInstitutionalConsensus;
}

export const InstitutionalIntelligenceView: React.FC<InstitutionalIntelligenceViewProps> = ({
  ticker,
  category,
  blockDeals = [],
  institutionalActivity,
  insiderTrading = [],
  institutionalConsensus,
}) => {
  const [activeTab, setActiveTab] = useState<'global-desks' | 'fii-dii' | 'block-deals' | 'insider'>('global-desks');
  const [dealFilter, setDealFilter] = useState<'ALL' | 'BLOCK' | 'BULK'>('ALL');

  const consensus = useMemo(() => {
    return institutionalConsensus || generateGlobalInstitutionalConsensus({ ticker, type: category });
  }, [institutionalConsensus, ticker, category]);

  const filteredDeals = blockDeals.filter(d => {
    if (dealFilter === 'BLOCK') return d.dealType === 'BLOCK_DEAL';
    if (dealFilter === 'BULK') return d.dealType === 'BULK_DEAL';
    return true;
  });

  const totalBlockValue = blockDeals.reduce((sum, d) => sum + d.valueCr, 0);

  return (
    <div className="glass-card rounded-xl p-5 border-l-4 border-l-blue-500 space-y-4 shadow-xl">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mono uppercase">
              Microlevel Market Disclosures
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mono uppercase">
              SEBI SAST • PIT • BSE/NSE Window
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Institutional Radar: Block Deals, FII / DII &amp; Insider Disclosures
          </h3>
          <p className="text-xs text-slate-400">
            Real-time verified exchange filings, marquee institutional block/bulk trades, and promoter open market accumulation for {ticker}.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex flex-wrap rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs mono">
          <button
            type="button"
            onClick={() => setActiveTab('global-desks')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'global-desks'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>4 Global Desks (Aladdin • GS • Jefferies • Rothschild)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fii-dii')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'fii-dii'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>FII &amp; DII Activity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('block-deals')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'block-deals'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>New Block Deals ({blockDeals.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insider')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'insider'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Insider &amp; SAST ({insiderTrading.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 0: 4 GLOBAL DESKS (BLACKROCK ALADDIN • GOLDMAN SACHS • JEFFERIES • ROTHSCHILD) */}
      {activeTab === 'global-desks' && (
        <div className="space-y-4">
          {/* Consensus Score Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-emerald-950/40 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-lg mono">
                {consensus.consensusScore}
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mono">Global Institutional Consensus Score</div>
                <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>{consensus.name} ({consensus.ticker})</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {consensus.consensusAction.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs mono">
              <span className="text-slate-400">Desks Synthesized:</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                BlackRock • GS • Jefferies • Rothschild
              </span>
            </div>
          </div>

          {/* 4 Desks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. BlackRock Aladdin */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-blue-500/30 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    BLACKROCK ALADDIN
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mono">
                    Beta: {consensus.blackrock.factorBeta}x
                  </span>
                </div>
                <div className="text-sm font-bold text-white mono mt-1">
                  1D VaR 95%: <span className="text-rose-400 font-extrabold">-{consensus.blackrock.var95Pct}%</span>
                </div>
                <div className="text-[11px] text-slate-400 mono mt-0.5">
                  Expected Shortfall: -{consensus.blackrock.cvar99Pct}%
                </div>
                <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-bold block mb-0.5">Tail-Risk Directive:</span>
                  {consensus.blackrock.aladdinHedgeDirective}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] mono text-slate-400 flex justify-between">
                <span>Lehman '08: <strong className="text-rose-400">{consensus.blackrock.stressTestDrawdowns.gfc2008}%</strong></span>
                <span>Covid '20: <strong className="text-rose-400">{consensus.blackrock.stressTestDrawdowns.covid2020}%</strong></span>
              </div>
            </div>

            {/* 2. Goldman Sachs */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    GOLDMAN SACHS
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 mono">
                    +{consensus.goldmanSachs.upsidePotentialPct}% Upside
                  </span>
                </div>
                <div className="text-sm font-bold text-white mono mt-1">
                  12M Target: <span className="text-amber-400 font-extrabold">₹{consensus.goldmanSachs.targetPrice12M}</span>
                </div>
                <div className="text-[11px] text-slate-400 mono mt-0.5">
                  Rating: <strong className="text-emerald-400">{consensus.goldmanSachs.convictionRating.replace(/_/g, ' ')}</strong>
                </div>
                <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-blue-400 font-bold block mb-0.5">Marquee/SecDB Rationale:</span>
                  {consensus.goldmanSachs.catalystTimeline}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] mono text-slate-400 flex justify-between">
                <span>EVA Spread: <strong className="text-emerald-400">+{consensus.goldmanSachs.evaSpreadPct}%</strong></span>
                <span>Sharpe: <strong className="text-blue-300">{consensus.goldmanSachs.sharpeRatio}</strong></span>
              </div>
            </div>

            {/* 3. Jefferies */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    JEFFERIES
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 mono">
                    Greed: {consensus.jefferies.greedAndFearScore}/100
                  </span>
                </div>
                <div className="text-sm font-bold text-white mono mt-1">
                  Cycle: <span className="text-emerald-400 font-extrabold">{consensus.jefferies.cyclePhase.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-[11px] text-slate-400 mono mt-0.5">
                  Capex Backlog Growth: +{consensus.jefferies.capexBacklogGrowthPct}% YoY
                </div>
                <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">GARP Strategy:</span>
                  {consensus.jefferies.jefferiesDeskTake}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] mono text-slate-400 flex justify-between">
                <span>GARP Discount: <strong className="text-emerald-400">{consensus.jefferies.garpMultipleDiscountPct}%</strong></span>
                <span>Flow: <strong className="text-blue-300">DII SIP Buy</strong></span>
              </div>
            </div>

            {/* 4. Rothschild & Co */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    ROTHSCHILD &amp; CO
                  </span>
                  <span className="text-[10px] font-bold text-purple-400 mono">
                    Moat: {consensus.rothschild.intergenerationalMoatScore}/100
                  </span>
                </div>
                <div className="text-sm font-bold text-white mono mt-1">
                  Grade: <span className="text-purple-300 font-extrabold">{consensus.rothschild.sovereignProtectionGrade.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-[11px] text-slate-400 mono mt-0.5">
                  Altman Z-Score: {consensus.rothschild.altmanZScore} (Safe Solvency)
                </div>
                <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-purple-400 font-bold block mb-0.5">Wealth Preservation:</span>
                  {consensus.rothschild.wealthPreservationHorizon}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] mono text-slate-400 flex justify-between">
                <span>Pledge: <strong className="text-emerald-400">{consensus.rothschild.promoterPledgePct}%</strong></span>
                <span>CFO/EBITDA: <strong className="text-emerald-400">{consensus.rothschild.cleanCashConversionPct}%</strong></span>
              </div>
            </div>
          </div>

          {/* Unified Institutional Theses */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 mono uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Unified Institutional Investment Theses
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {consensus.unifiedMacroTheses.map((thesis, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold mono flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{thesis}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FII & DII ACTIVITY */}
      {activeTab === 'fii-dii' && institutionalActivity && (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">FII Institutional Stake</span>
              <div className="text-base font-extrabold text-blue-400 mono mt-0.5">
                {institutionalActivity.fiiHoldingPct}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1 mono">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{institutionalActivity.fiiChangeQoq}% QoQ Shift</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">DII Mutual Funds Stake</span>
              <div className="text-base font-extrabold text-emerald-400 mono mt-0.5">
                {institutionalActivity.diiHoldingPct}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1 mono">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{institutionalActivity.diiChangeQoq}% QoQ Shift</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Promoter / State Stake</span>
              <div className="text-base font-extrabold text-white mono mt-0.5">
                {institutionalActivity.promoterHoldingPct}%
              </div>
              <div className="text-[11px] font-bold text-emerald-300 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>{institutionalActivity.promoterPledgedPct === 0 ? '0.0% Pledged (Clean)' : `${institutionalActivity.promoterPledgedPct}% Pledged`}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Inst. Cash Flow (1M)</span>
              <div className="text-base font-extrabold text-emerald-400 mono mt-0.5">
                +₹{institutionalActivity.netFlow1mCr.toLocaleString('en-IN')} Cr
              </div>
              <div className="text-[11px] text-slate-400 mt-1 mono">
                3M Net: +₹{institutionalActivity.netFlow3mCr.toLocaleString('en-IN')} Cr
              </div>
            </div>
          </div>

          {/* Shareholding Visual Stack Bar */}
          <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Ownership Distribution &amp; Shareholding Pattern</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold mono">
                {institutionalActivity.institutionalSentiment.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="h-5 w-full bg-slate-800 rounded-lg overflow-hidden flex text-[10px] font-bold text-white mono shadow-inner">
              <div
                style={{ width: `${institutionalActivity.promoterHoldingPct}%` }}
                className="bg-blue-600 flex items-center justify-center truncate px-1 transition-all"
                title={`Promoter: ${institutionalActivity.promoterHoldingPct}%`}
              >
                Promoter {institutionalActivity.promoterHoldingPct}%
              </div>
              <div
                style={{ width: `${institutionalActivity.fiiHoldingPct}%` }}
                className="bg-purple-600 flex items-center justify-center truncate px-1 transition-all"
                title={`FII: ${institutionalActivity.fiiHoldingPct}%`}
              >
                FII {institutionalActivity.fiiHoldingPct}%
              </div>
              <div
                style={{ width: `${institutionalActivity.diiHoldingPct}%` }}
                className="bg-emerald-600 flex items-center justify-center truncate px-1 transition-all"
                title={`DII: ${institutionalActivity.diiHoldingPct}%`}
              >
                DII {institutionalActivity.diiHoldingPct}%
              </div>
              <div
                style={{ width: `${institutionalActivity.publicAndRetailPct}%` }}
                className="bg-amber-600 flex items-center justify-center truncate px-1 transition-all"
                title={`Public/Retail: ${institutionalActivity.publicAndRetailPct}%`}
              >
                Public {institutionalActivity.publicAndRetailPct}%
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Promoter ({institutionalActivity.promoterHoldingPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> FII ({institutionalActivity.fiiHoldingPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> DII ({institutionalActivity.diiHoldingPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Public &amp; Retail ({institutionalActivity.publicAndRetailPct}%)</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 mt-2">
              <span className="text-white font-bold block mb-1">Institutional Consensus Verdict:</span>
              <p className="leading-relaxed">{institutionalActivity.fiiDiiTrendSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOCK DEALS & BULK DEALS */}
      {activeTab === 'block-deals' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Filter Deals:</span>
              <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] mono">
                <button
                  type="button"
                  onClick={() => setDealFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded ${dealFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  All ({blockDeals.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDealFilter('BLOCK')}
                  className={`px-2.5 py-0.5 rounded ${dealFilter === 'BLOCK' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Block Window
                </button>
                <button
                  type="button"
                  onClick={() => setDealFilter('BULK')}
                  className={`px-2.5 py-0.5 rounded ${dealFilter === 'BULK' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Bulk Market
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-300 mono">
              <span>Cumulative Value: </span>
              <span className="text-emerald-400 font-bold">₹{totalBlockValue.toLocaleString('en-IN')} Cr</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950 text-[10px] mono">
                  <th className="py-2.5 px-3">Date &amp; Exchange</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Buyer Name</th>
                  <th className="py-2.5 px-3">Seller Name</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Deal Price</th>
                  <th className="py-2.5 px-3 text-right">Value (₹ Cr)</th>
                  <th className="py-2.5 px-3 text-right">% Equity</th>
                  <th className="py-2.5 px-3 text-center">CMP Spread</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 mono">
                {filteredDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3">
                      <div className="text-white font-bold">{deal.date}</div>
                      <span className="text-[10px] text-slate-400">{deal.exchange}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          deal.dealType === 'BLOCK_DEAL'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {deal.dealType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-emerald-300 max-w-[200px] truncate" title={deal.buyer}>
                      {deal.buyer}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 max-w-[200px] truncate" title={deal.seller}>
                      {deal.seller}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {deal.quantity.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      ₹{deal.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
                      ₹{deal.valueCr.toLocaleString('en-IN')} Cr
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {deal.pctEquityTransacted}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          deal.premiumDiscountPct >= 0
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {deal.premiumDiscountPct >= 0 ? '+' : ''}{deal.premiumDiscountPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INSIDER INFORMATION & SAST DISCLOSURES */}
      {activeTab === 'insider' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-400">
              Statutory Disclosures filed under SEBI (Prohibition of Insider Trading) &amp; (Substantial Acquisition of Shares &amp; Takeovers) Regulations:
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold mono">
              VERIFIED FILINGS
            </span>
          </div>

          <div className="space-y-2.5">
            {insiderTrading.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-blue-500/40 transition space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{item.filingDate}</span>
                    </span>
                    <span className="font-bold text-white text-sm">{item.personName}</span>
                    <span className="text-slate-400 text-xs">({item.designation} • {item.category})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 mono border border-slate-700">
                      {item.sebiRegulation}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold mono border ${
                        item.impactSentiment === 'BULLISH_INSIDER_BUY' || item.impactSentiment === 'PLEDGE_RELEASE_POSITIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : item.impactSentiment === 'BEARISH_INSIDER_SELL' || item.impactSentiment === 'PLEDGE_RISK'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {item.impactSentiment.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mono pt-1 bg-slate-900/60 p-2 rounded">
                  <div>
                    <span className="text-slate-400 text-[10px]">Transaction Type:</span>
                    <div className="font-bold text-white">{item.transactionType.replace(/_/g, ' ')}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Volume &amp; Price:</span>
                    <div className="font-bold text-slate-200">
                      {item.quantity > 0 ? `${item.quantity.toLocaleString('en-IN')} shares @ ₹${item.price}` : 'Pledge Status Filing'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Total Consideration:</span>
                    <div className="font-bold text-emerald-400">
                      {item.valueCr > 0 ? `₹${item.valueCr.toLocaleString('en-IN')} Cr` : 'Encumbrance Filing'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Holding Post-Trade:</span>
                    <div className="font-bold text-blue-300">
                      {item.postHoldingPct}% (from {item.preHoldingPct}%)
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {item.commentary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
