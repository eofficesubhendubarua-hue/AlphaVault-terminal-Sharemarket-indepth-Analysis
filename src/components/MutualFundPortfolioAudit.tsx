import React, { useState } from 'react';
import { MutualFundDeepAudit, MfHoldingItem, MfMonthlyShift } from '../types/investment';
import {
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Layers,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  ShieldCheck,
  Briefcase,
  ExternalLink,
  PlusCircle,
  XCircle,
  BadgePercent,
  Compass,
  Zap,
} from 'lucide-react';

interface MutualFundPortfolioAuditProps {
  auditData: MutualFundDeepAudit;
  fundTicker: string;
  fundName: string;
  onAuditHolding?: (ticker: string) => void;
}

export const MutualFundPortfolioAudit: React.FC<MutualFundPortfolioAuditProps> = ({
  auditData,
  fundTicker,
  fundName,
  onAuditHolding,
}) => {
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(0);
  const [holdingSearch, setHoldingSearch] = useState<string>('');
  const [holdingFilter, setHoldingFilter] = useState<'ALL' | 'LARGE' | 'MID_SMALL' | 'ACCUMULATING' | 'TRIMMING' | 'NEW'>('ALL');
  const [activeShiftSubTab, setActiveShiftSubTab] = useState<'NEW_BUYS' | 'EXITS' | 'ACCUMULATED' | 'TRIMMED'>('NEW_BUYS');

  const currentShift: MfMonthlyShift = auditData.monthlyShifts[selectedMonthIdx] || auditData.monthlyShifts[0];

  // Filter Holdings
  const filteredHoldings = (auditData.allHoldings || []).filter(h => {
    const matchesSearch =
      h.name.toLowerCase().includes(holdingSearch.toLowerCase()) ||
      h.ticker.toLowerCase().includes(holdingSearch.toLowerCase()) ||
      h.sector.toLowerCase().includes(holdingSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (holdingFilter === 'LARGE') return h.mcapCategory === 'GIANT_CAP' || h.mcapCategory === 'LARGE_CAP';
    if (holdingFilter === 'MID_SMALL') return h.mcapCategory === 'MID_CAP' || h.mcapCategory === 'SMALL_CAP';
    if (holdingFilter === 'ACCUMULATING') return h.trend === 'ACCUMULATING';
    if (holdingFilter === 'TRIMMING') return h.trend === 'TRIMMING';
    if (holdingFilter === 'NEW') return h.trend === 'NEW_ENTRY';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Mutual Fund Dossier Header */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mono uppercase">
                {auditData.fundType}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mono uppercase">
                Benchmark: {auditData.benchmarkIndex}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {fundName} ({fundTicker})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              AMC: <span className="text-slate-200 font-semibold">{auditData.fundHouse}</span> • Fund Manager(s): <span className="text-emerald-400 font-semibold">{auditData.fundManager}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mono text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Total AUM</span>
              <span className="text-sm font-extrabold text-emerald-400">
                ₹{auditData.aumCr.toLocaleString('en-IN')} Cr
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Expense Ratio</span>
              <span className="text-sm font-extrabold text-white">
                {auditData.expenseRatioPct}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Cash &amp; Arbitrage</span>
              <span className="text-sm font-extrabold text-amber-300">
                {auditData.cashHoldingPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio Activity Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Accumulated Stocks
            </span>
            <div className="text-lg font-bold text-emerald-400 mono mt-0.5">
              {auditData.accumulationVsSellingSummary.totalAccumulatedStocksCount} Stocks
            </div>
            <span className="text-[10px] text-slate-400">Active stake expansion</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-400" /> Trimmed Stocks
            </span>
            <div className="text-lg font-bold text-rose-400 mono mt-0.5">
              {auditData.accumulationVsSellingSummary.totalTrimmedStocksCount} Stocks
            </div>
            <span className="text-[10px] text-slate-400">Profit booking &amp; risk cut</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <PlusCircle className="w-3 h-3 text-blue-400" /> Fresh Entries (Buys)
            </span>
            <div className="text-lg font-bold text-blue-400 mono mt-0.5">
              +{auditData.accumulationVsSellingSummary.newEntriesCount} New
            </div>
            <span className="text-[10px] text-slate-400">New additions to fund</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <XCircle className="w-3 h-3 text-amber-400" /> Complete Exits
            </span>
            <div className="text-lg font-bold text-amber-300 mono mt-0.5">
              {auditData.accumulationVsSellingSummary.completeExitsCount} Exited
            </div>
            <span className="text-[10px] text-slate-400">100% liquidated</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> Net Equity Infusion
            </span>
            <div className="text-lg font-bold text-white mono mt-0.5">
              +₹{auditData.accumulationVsSellingSummary.netEquityInfusionCr.toLocaleString('en-IN')} Cr
            </div>
            <span className="text-[10px] text-slate-400">Net equity deployment</span>
          </div>
        </div>
      </div>

      {/* MONTH-WISE ACTIVITY: Fresh Buys, Complete Exits, Accumulation, Trimming */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-blue-500 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mono uppercase">
                Month-by-Month Portfolio Shifts
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mono uppercase">
                Audited Turnover &amp; Churn
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Monthly Churn Radar: New Buying Stocks &amp; Complete Exit Stocks
            </h4>
            <p className="text-xs text-slate-400">
              Select month to inspect exact new stocks bought, positions completely dumped, and stake alterations.
            </p>
          </div>

          {/* Month Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs mono">
            {auditData.monthlyShifts.map((shift, idx) => (
              <button
                key={shift.month}
                type="button"
                onClick={() => setSelectedMonthIdx(idx)}
                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                  selectedMonthIdx === idx
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {shift.month}
              </button>
            ))}
          </div>
        </div>

        {/* Manager Commentary for Selected Month */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              Fund Manager Commentary ({currentShift.month}):
            </span>
            <div className="flex items-center gap-3 text-slate-400 mono text-[10px]">
              <span>Portfolio Turnover: <strong className="text-emerald-400">{currentShift.portfolioTurnoverRatioPct}%</strong></span>
              <span>Cash Buffer: <strong className="text-amber-300">{currentShift.cashAndArbitragePct}%</strong></span>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed italic">
            "{currentShift.managerMacroCommentary}"
          </p>
        </div>

        {/* 4 Interactive Sub-Tabs for Monthly Shift */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs mono">
            <button
              type="button"
              onClick={() => setActiveShiftSubTab('NEW_BUYS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeShiftSubTab === 'NEW_BUYS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>🟢 New Buying Stocks ({currentShift.newBuyingStocks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShiftSubTab('EXITS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeShiftSubTab === 'EXITS'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-300" />
              <span>🔴 Complete Exit Stocks ({currentShift.completeExitStocks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShiftSubTab('ACCUMULATED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeShiftSubTab === 'ACCUMULATED'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-300" />
              <span>⚡ Actively Accumulated ({currentShift.topAccumulatedStocks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveShiftSubTab('TRIMMED')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeShiftSubTab === 'TRIMMED'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-amber-300" />
              <span>📉 Actively Trimmed ({currentShift.topTrimmedStocks.length})</span>
            </button>
          </div>

          {/* SUB-PANEL 1: NEW BUYING STOCKS */}
          {activeShiftSubTab === 'NEW_BUYS' && (
            <div className="space-y-2.5">
              {currentShift.newBuyingStocks.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                  No completely new positions initiated in {currentShift.month}.
                </div>
              ) : (
                currentShift.newBuyingStocks.map(stock => (
                  <div
                    key={stock.ticker}
                    className="p-3.5 rounded-lg bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500 transition space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mono text-[10px]">
                          NEW ENTRY • {stock.ticker}
                        </span>
                        <span className="font-bold text-white text-sm">{stock.name}</span>
                        <span className="text-slate-400 text-xs">({stock.sector})</span>
                      </div>

                      <div className="flex items-center gap-2 mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                          Weight: {stock.newWeightPct}% of AUM
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-800/60">
                          ₹{stock.investedCr.toLocaleString('en-IN')} Cr Invested
                        </span>
                        {onAuditHolding && (
                          <button
                            type="button"
                            onClick={() => onAuditHolding(stock.ticker)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition flex items-center gap-1"
                          >
                            <span>Audit Stock</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 pt-1 border-t border-slate-900 flex items-start gap-2">
                      <strong className="text-emerald-400 font-semibold flex-shrink-0">Entry Rationale:</strong>
                      <p className="leading-relaxed">{stock.entryRationale}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUB-PANEL 2: COMPLETE EXIT STOCKS */}
          {activeShiftSubTab === 'EXITS' && (
            <div className="space-y-2.5">
              {currentShift.completeExitStocks.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                  No positions completely exited in {currentShift.month}.
                </div>
              ) : (
                currentShift.completeExitStocks.map(stock => (
                  <div
                    key={stock.ticker}
                    className="p-3.5 rounded-lg bg-slate-950/80 border border-rose-500/30 hover:border-rose-500 transition space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold mono text-[10px]">
                          100% EXITED • {stock.ticker}
                        </span>
                        <span className="font-bold text-white text-sm">{stock.name}</span>
                        <span className="text-slate-400 text-xs">({stock.sector})</span>
                      </div>

                      <div className="flex items-center gap-2 mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-400 font-bold">
                          Exited Stake: {stock.previousWeightPct}%
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 font-bold border border-rose-800/60">
                          ₹{stock.capitalFreedCr.toLocaleString('en-IN')} Cr Freed Up
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 pt-1 border-t border-slate-900 flex items-start gap-2">
                      <strong className="text-rose-400 font-semibold flex-shrink-0">Exit / Thesis Invalidation Reason:</strong>
                      <p className="leading-relaxed">{stock.exitRationale}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUB-PANEL 3: TOP ACCUMULATED */}
          {activeShiftSubTab === 'ACCUMULATED' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentShift.topAccumulatedStocks.map(stock => (
                <div
                  key={stock.ticker}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-white">{stock.name}</span>
                      <span className="text-slate-400 text-[10px] block mono">{stock.ticker} • {stock.sector}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mono text-xs">
                      +{stock.sharesIncreasePct}% Shares
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900 mono">
                    <span>Current Weight: <strong>{stock.currentWeightPct}%</strong></span>
                    <span className="text-emerald-400 font-bold">+₹{stock.valueAddedCr.toLocaleString('en-IN')} Cr added</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-PANEL 4: TOP TRIMMED */}
          {activeShiftSubTab === 'TRIMMED' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentShift.topTrimmedStocks.map(stock => (
                <div
                  key={stock.ticker}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-white">{stock.name}</span>
                      <span className="text-slate-400 text-[10px] block mono">{stock.ticker} • {stock.sector}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold mono text-xs">
                      {stock.sharesDecreasePct}% Shares
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900 mono">
                    <span>Remaining Weight: <strong>{stock.currentWeightPct}%</strong></span>
                    <span className="text-amber-400 font-bold">₹{stock.valueTrimmedCr.toLocaleString('en-IN')} Cr trimmed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ALL HOLDINGS IN-DEPTH ANALYSIS (EACH-WISE) */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-purple-500 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mono uppercase">
                Consolidated Portfolio Holdings
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mono uppercase">
                {auditData.allHoldings.length} Assets Tracked Each-Wise
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              All Holdings In-Depth Analysis (Each-Wise Breakdown &amp; Metrics)
            </h4>
            <p className="text-xs text-slate-400">
              Complete constituent weights, valuation multiples (P/E &amp; ROCE), multi-horizon returns, and active accumulation trend for every portfolio holding.
            </p>
          </div>

          {/* Search Box inside Fund Holdings */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={holdingSearch}
              onChange={e => setHoldingSearch(e.target.value)}
              placeholder="Search holding by name or sector..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs mono">
          <button
            type="button"
            onClick={() => setHoldingFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              holdingFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Holdings ({auditData.allHoldings.length})
          </button>
          <button
            type="button"
            onClick={() => setHoldingFilter('LARGE')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              holdingFilter === 'LARGE' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Giant &amp; Large Cap
          </button>
          <button
            type="button"
            onClick={() => setHoldingFilter('MID_SMALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              holdingFilter === 'MID_SMALL' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Mid &amp; Small Cap
          </button>
          <button
            type="button"
            onClick={() => setHoldingFilter('ACCUMULATING')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              holdingFilter === 'ACCUMULATING' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Actively Accumulating
          </button>
          <button
            type="button"
            onClick={() => setHoldingFilter('TRIMMING')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              holdingFilter === 'TRIMMING' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Actively Trimming
          </button>
          <button
            type="button"
            onClick={() => setHoldingFilter('NEW')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              holdingFilter === 'NEW' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            New Entries
          </button>
        </div>

        {/* Holdings Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950 text-[10px] mono">
                <th className="py-2.5 px-3">Company / Holding</th>
                <th className="py-2.5 px-2.5">Sector</th>
                <th className="py-2.5 px-2.5 text-right">Weight (%) &amp; Value</th>
                <th className="py-2.5 px-2.5 text-center">Cap Category</th>
                <th className="py-2.5 px-2.5 text-right">P/E Multiple</th>
                <th className="py-2.5 px-2.5 text-right">ROCE (%)</th>
                <th className="py-2.5 px-2.5 text-right">1M / 1Y Return</th>
                <th className="py-2.5 px-2.5 text-center">Fund Action (MoM)</th>
                <th className="py-2.5 px-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 mono">
              {filteredHoldings.map(item => (
                <tr key={item.ticker} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white flex items-center gap-1.5 font-sans">
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.ticker}</span>
                  </td>

                  <td className="py-2.5 px-2.5 font-sans text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                      {item.sector}
                    </span>
                  </td>

                  <td className="py-2.5 px-2.5 text-right">
                    <div className="font-bold text-emerald-400">{item.weightPct}%</div>
                    <div className="text-[10px] text-slate-400">
                      ₹{item.holdingValueCr.toLocaleString('en-IN')} Cr
                    </div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.mcapCategory === 'GIANT_CAP'
                          ? 'bg-blue-500/20 text-blue-300'
                          : item.mcapCategory === 'LARGE_CAP'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.mcapCategory.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-2.5 px-2.5 text-right font-bold text-slate-200">
                    {item.peRatio}x
                  </td>

                  <td className="py-2.5 px-2.5 text-right font-bold text-emerald-300">
                    {item.rocePct}%
                  </td>

                  <td className="py-2.5 px-2.5 text-right">
                    <span className={item.ret1m >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {item.ret1m >= 0 ? '+' : ''}{item.ret1m}% (1M)
                    </span>
                    <div className={`text-[10px] ${item.ret1y >= 0 ? 'text-emerald-300 font-bold' : 'text-rose-300'}`}>
                      {item.ret1y >= 0 ? '+' : ''}{item.ret1y}% (1Y)
                    </div>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.trend === 'ACCUMULATING'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : item.trend === 'TRIMMING'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : item.trend === 'NEW_ENTRY'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.trend === 'NEW_ENTRY'
                        ? '★ NEW ENTRY'
                        : item.sharesChangePctMoM !== 0
                        ? `${item.sharesChangePctMoM >= 0 ? '+' : ''}${item.sharesChangePctMoM}%`
                        : 'UNCHANGED'}
                    </span>
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    {onAuditHolding && (
                      <button
                        type="button"
                        onClick={() => onAuditHolding(item.ticker)}
                        className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-[10px] transition flex items-center gap-1 mx-auto"
                        title={`Run in-depth audit on ${item.ticker}`}
                      >
                        <span>Audit</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
