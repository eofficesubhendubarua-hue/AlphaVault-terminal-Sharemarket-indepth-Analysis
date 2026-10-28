import React from 'react';
import { NextDayTradingForecast } from '../types/investment';
import {
  Zap,
  ShieldAlert,
  TrendingUp,
  Target,
  ArrowRight,
  Compass,
  BarChart2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { formatCurrency, formatSignedPct } from '../utils/quantLogic';

interface NextDayTradingCardProps {
  ticker: string;
  name: string;
  currentPrice: number;
  forecast: NextDayTradingForecast;
  category?: string;
}

export const NextDayTradingCard: React.FC<NextDayTradingCardProps> = ({
  ticker,
  name,
  currentPrice,
  forecast,
  category = 'EQUITY',
}) => {
  const biasBadgeClass =
    forecast.bias === 'STRONG_BULLISH'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : forecast.bias === 'BULLISH_DIP_BUY'
      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
      : forecast.bias === 'DEFENSIVE_TRIM' || forecast.bias === 'BEARISH_SHORT'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

  const biasLabel =
    forecast.bias === 'STRONG_BULLISH'
      ? 'STRONG BULLISH BREAKOUT'
      : forecast.bias === 'BULLISH_DIP_BUY'
      ? 'BULLISH VALUE DIP BUY'
      : forecast.bias === 'DEFENSIVE_TRIM'
      ? 'DEFENSIVE ARBITRAGE TRIM'
      : forecast.bias === 'BEARISH_SHORT'
      ? 'BEARISH DISTRIBUTION'
      : 'RANGE-BOUND CONSOLIDATION';

  // Calculate percentage distances from current price
  const entryDelta = ((forecast.t1LongEntry - currentPrice) / currentPrice) * 100;
  const t1Delta = ((forecast.t1Target1 - currentPrice) / currentPrice) * 100;
  const t2Delta = ((forecast.t1Target2 - currentPrice) / currentPrice) * 100;
  const slDelta = ((forecast.t1StopLoss - currentPrice) / currentPrice) * 100;

  // Expected range position % (0 to 100)
  const rangeSpan = Math.max(0.01, forecast.expectedHigh - forecast.expectedLow);
  const currentPosPct = Math.min(
    100,
    Math.max(0, ((currentPrice - forecast.expectedLow) / rangeSpan) * 100)
  );
  const pivotPosPct = Math.min(
    100,
    Math.max(0, ((forecast.pivotPoint - forecast.expectedLow) / rangeSpan) * 100)
  );

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-cyan-500/30 space-y-4 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400" />

      {/* Header Strip */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Next-Day T+1 Trading Prediction &amp; Execution Blueprint</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold mono border uppercase bg-blue-500/15 text-blue-300 border-blue-500/30">
              1-Day Horizon
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional probability-weighted pivot levels, expected intraday boundaries, and order-flow triggers for {ticker} ({name}).
          </p>
        </div>

        {/* Bias & Confidence Badge */}
        <div className="flex flex-col items-end">
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold mono border flex items-center gap-1.5 ${biasBadgeClass}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{biasLabel}</span>
          </span>
          <span className="text-[10px] text-slate-400 mono mt-1">
            Predictive Model Confidence:{' '}
            <strong className="text-cyan-400">{forecast.confidencePct}%</strong>
          </span>
        </div>
      </div>

      {/* Primary Key Execution Levels Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Entry Zone */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
            <span>T+1 BUY / ENTRY</span>
            <span className="text-cyan-400">TRIGGER</span>
          </div>
          <div className="mt-1 text-sm sm:text-base font-bold text-cyan-300 mono">
            ₹{forecast.t1LongEntry.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mono mt-0.5">
            {formatSignedPct(entryDelta)} vs CMP (₹{currentPrice.toFixed(2)})
          </div>
        </div>

        {/* Target 1 */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
            <span>TARGET 1 (T1)</span>
            <span className="text-emerald-400">SCALE 50%</span>
          </div>
          <div className="mt-1 text-sm sm:text-base font-bold text-emerald-400 mono">
            ₹{forecast.t1Target1.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400/90 font-semibold mono mt-0.5">
            {formatSignedPct(t1Delta)} Quick Gain
          </div>
        </div>

        {/* Target 2 */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
            <span>TARGET 2 (T2)</span>
            <span className="text-emerald-400">RUNNER</span>
          </div>
          <div className="mt-1 text-sm sm:text-base font-bold text-emerald-300 mono">
            ₹{forecast.t1Target2.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-300/90 font-semibold mono mt-0.5">
            {formatSignedPct(t2Delta)} Full Extension
          </div>
        </div>

        {/* Stop Loss */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
            <span>T+1 STOP LOSS</span>
            <span className="text-rose-400">ATR RISK</span>
          </div>
          <div className="mt-1 text-sm sm:text-base font-bold text-rose-400 mono">
            ₹{forecast.t1StopLoss.toFixed(2)}
          </div>
          <div className="text-[10px] text-rose-400/90 mono mt-0.5">
            {formatSignedPct(slDelta)} | R:R {forecast.riskRewardRatio}
          </div>
        </div>
      </div>

      {/* Visual Expected Intraday Boundary Spectrum */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Day Expected Range Spectrum (±{forecast.expectedMovePct}% Volatility Band)</span>
          </span>
          <span className="text-slate-300">
            Center Pivot: <strong className="text-white">₹{forecast.pivotPoint.toFixed(2)}</strong>
          </span>
        </div>

        {/* Range Bar */}
        <div className="relative pt-3 pb-1">
          <div className="h-3 rounded-full bg-slate-800 border border-slate-700 relative overflow-hidden">
            {/* Bullish / Bearish gradient fill */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500/40 via-amber-500/40 to-emerald-500/40"
              style={{ left: '0%', right: '0%' }}
            />
          </div>

          {/* Pivot marker */}
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${pivotPosPct}%` }}
            title={`Center Pivot: ₹${forecast.pivotPoint}`}
          >
            <span className="w-0.5 h-6 bg-amber-400" />
            <span className="text-[9px] text-amber-300 mono">Pivot</span>
          </div>

          {/* Current price marker */}
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-10"
            style={{ left: `${currentPosPct}%` }}
            title={`CMP: ₹${currentPrice}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-300 animate-ping" />
            <span className="text-[9px] font-bold text-cyan-300 mono mt-1">CMP ₹{currentPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Expected Boundary Labels */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 mono pt-1">
          <div>
            Expected Low (Floor): <strong className="text-rose-400">₹{forecast.expectedLow.toFixed(2)}</strong>
          </div>
          <div>
            Expected High (Ceiling): <strong className="text-emerald-400">₹{forecast.expectedHigh.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Action Plan & Order Flow Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1.5 text-[11px] mono">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>T+1 Actionable Trading Plan</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {forecast.t1ActionPlan}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="font-bold text-white flex items-center gap-1.5 text-[11px] mono">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional Flow &amp; Structure</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div>
              <span className="text-slate-400">VWAP Bias:</span> {forecast.vwapBias}
            </div>
            <div>
              <span className="text-slate-400">Order Flow:</span> {forecast.institutionalFlowIndicator}
            </div>
            {forecast.optionsMaxPainOrStrike && (
              <div className="text-amber-300 text-[10px] mono">
                ⚡ {forecast.optionsMaxPainOrStrike}
              </div>
            )}
            {forecast.inavOrNavTrackingError && (
              <div className="text-cyan-300 text-[10px] mono">
                ⚡ {forecast.inavOrNavTrackingError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
