import React from 'react';
import { FutureInvestmentForecast } from '../types/investment';
import {
  TrendingUp,
  ShieldCheck,
  Target,
  Award,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Percent,
} from 'lucide-react';
import { formatSignedPct } from '../utils/quantLogic';

interface FutureInvestmentRoadmapProps {
  ticker: string;
  name: string;
  currentPrice: number;
  forecast: FutureInvestmentForecast;
  category?: string;
}

export const FutureInvestmentRoadmap: React.FC<FutureInvestmentRoadmapProps> = ({
  ticker,
  name,
  currentPrice,
  forecast,
  category = 'EQUITY',
}) => {
  const horizons = [
    forecast.timeHorizon1m,
    forecast.timeHorizon6m,
    forecast.timeHorizon1y,
    forecast.timeHorizon3y,
  ];

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-blue-500/30 space-y-4 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />

      {/* Header Strip */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Multi-Horizon Future Investment &amp; Compounding Roadmap</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mono border uppercase bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
              1M • 6M • 1Y • 3Y Compounding
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Discounted cash flow, earnings growth compounding, and institutional valuation trajectory for {ticker} ({name}).
          </p>
        </div>

        {/* Quality Score & Allocation Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs mono">
            <span className="text-slate-400">Quality Compounder Score: </span>
            <strong className="text-blue-300 font-bold">{forecast.compounderQualityScore}/100</strong>
          </div>
          <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs mono">
            <span className="text-slate-400">Target Allocation: </span>
            <strong className="text-emerald-300 font-bold">{forecast.recommendedAllocationPct}% of Portfolio</strong>
          </div>
        </div>
      </div>

      {/* Valuation & Margin of Safety Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs mono">
        <div>
          <div className="text-[10px] text-slate-400">CURRENT MARKET PRICE</div>
          <div className="text-sm font-bold text-white">₹{currentPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">INSTITUTIONAL INTRINSIC VALUE</div>
          <div className="text-sm font-bold text-cyan-400">₹{forecast.intrinsicValue.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">VALUATION MARGIN OF SAFETY</div>
          <div className={`text-sm font-bold ${forecast.marginOfSafetyPct >= 15 ? 'text-emerald-400' : forecast.marginOfSafetyPct > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            {forecast.marginOfSafetyPct > 0 ? `+${forecast.marginOfSafetyPct}%` : `${forecast.marginOfSafetyPct}%`}
            {forecast.marginOfSafetyPct >= 15 ? ' (Deep Safety Buffer)' : ''}
          </div>
        </div>
      </div>

      {/* 4-Horizon Compounding Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {horizons.map((h, idx) => {
          const delta = ((h.projectedPrice - currentPrice) / currentPrice) * 100;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 transition space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px] mono text-slate-400">
                <span className="font-semibold">{h.horizonLabel}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300">
                  {h.conviction}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white mono">
                ₹{h.projectedPrice.toFixed(2)}
              </div>
              <div className="flex items-center justify-between text-[11px] mono">
                <span className="text-slate-400">Target Gain:</span>
                <span className={`font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatSignedPct(delta)}
                </span>
              </div>
              {idx === 3 && (
                <div className="text-[9px] text-emerald-400/90 font-semibold mono pt-0.5 border-t border-slate-800/80">
                  ⚡ 3-Year CAGR ~{((Math.pow(1 + delta / 100, 1 / 3) - 1) * 100).toFixed(1)}% Compounding
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compounding Trajectory Summary Banner */}
      <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {forecast.compoundingTrajectorySummary}
        </span>
      </div>

      {/* Playbook, Invalidation, and Catalysts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Accumulation Playbook */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5 text-[11px] mono">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional Accumulation &amp; Staggered Playbook</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {forecast.accumulationPlaybook}
          </p>

          <div className="pt-2 border-t border-slate-800 text-[10px] mono">
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Structural Invalidation Level:</span>
            </span>
            <p className="text-slate-400 mt-0.5 font-sans text-[11px]">
              {forecast.invalidationLevel}
            </p>
          </div>
        </div>

        {/* Core Growth Catalysts */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5 text-[11px] mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Key Macro &amp; Institutional Growth Catalysts</span>
          </div>
          <ul className="space-y-1.5">
            {forecast.macroCatalysts.map((cat, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                <span>{cat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
