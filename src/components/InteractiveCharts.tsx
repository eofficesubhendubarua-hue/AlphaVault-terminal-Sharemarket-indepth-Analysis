import React, { useState } from 'react';
import { RevenueSegment, GrowthForecast, MarginPeriod } from '../types/investment';
import { formatCurrency, calculateCagr } from '../utils/quantLogic';

interface DonutChartProps {
  segments: RevenueSegment[];
  currency?: string;
  totalLabel?: string;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // purple-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
];

export const RevenueDonutChart: React.FC<DonutChartProps> = ({
  segments,
  currency = '₹',
  totalLabel = 'Total Revenue',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = segments.reduce((acc, s) => acc + s.sharePct, 0) || 100;
  let accumulatedAngle = 0;

  // Generate SVG arcs
  const radius = 80;
  const strokeWidth = 32;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start xl:items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 w-full min-w-0 overflow-hidden shadow-lg">
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex-shrink-0 flex items-center justify-center my-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, idx) => {
            const strokeDasharray = `${(seg.sharePct / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (seg.sharePct / total) * circumference;
            const color = COLORS[idx % COLORS.length];
            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={seg.name}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ opacity: hoveredIdx === null || isHovered ? 1 : 0.45 }}
              />
            );
          })}
        </svg>

        {/* Center Summary Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
          <span
            className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider max-w-[120px] truncate"
            title={hoveredIdx !== null ? segments[hoveredIdx].name : totalLabel}
          >
            {hoveredIdx !== null ? segments[hoveredIdx].name : totalLabel}
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-white mono mt-0.5">
            {hoveredIdx !== null ? `${segments[hoveredIdx].sharePct}%` : '100%'}
          </span>
          {hoveredIdx !== null && segments[hoveredIdx].revenueCr && (
            <span className="text-[10px] sm:text-[11px] text-emerald-400 mono">
              {formatCurrency(segments[hoveredIdx].revenueCr || 0, currency)} Cr
            </span>
          )}
        </div>
      </div>

      {/* Legend & Breakdown Table */}
      <div className="flex-1 w-full min-w-0 space-y-2">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
          <span className="truncate">Revenue Contribution By Segment</span>
          <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">Micro-Breakdown</span>
        </div>
        <div className="space-y-1.5 w-full min-w-0">
          {segments.map((seg, idx) => {
            const color = COLORS[idx % COLORS.length];
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={seg.name}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 text-xs w-full min-w-0 ${
                  isHovered
                    ? 'bg-slate-800 border-blue-500/50 ring-1 ring-blue-500/30 shadow'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
                title={`${seg.name} (${seg.sharePct}% - ${currency}${seg.revenueCr ? seg.revenueCr.toLocaleString('en-IN') + ' Cr' : ''})`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-medium text-slate-200 text-[11px] sm:text-xs truncate block" title={seg.name}>
                    {seg.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right mono flex-shrink-0 pl-1">
                  <span className="font-bold text-white text-xs whitespace-nowrap">{seg.sharePct}%</span>
                  {seg.revenueCr && (
                    <span className="text-slate-400 text-[10px] sm:text-[11px] whitespace-nowrap">
                      {currency}
                      {seg.revenueCr.toLocaleString('en-IN')} Cr
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface GrowthChartProps {
  forecasts: GrowthForecast[];
  currency?: string;
}

export const GrowthForecastChart: React.FC<GrowthChartProps> = ({ forecasts, currency = '₹' }) => {
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'netProfit' | 'ebitda' | 'fcf'>('revenue');

  if (!forecasts || forecasts.length === 0) return null;

  const maxVal = Math.max(...forecasts.map(f => f[activeMetric])) * 1.15 || 100;
  const firstVal = forecasts[0][activeMetric];
  const lastVal = forecasts[forecasts.length - 1][activeMetric];
  const cagr = calculateCagr(firstVal, lastVal, forecasts.length - 1);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 w-full min-w-0 overflow-hidden shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">Multi-Year Financial Growth Trajectory</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mono whitespace-nowrap">
              Projected CAGR: +{cagr.toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">Historical audited performance contrasted with forward consensus projections.</p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="inline-flex flex-wrap rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs mono flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveMetric('revenue')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              activeMetric === 'revenue' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Revenue
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('ebitda')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              activeMetric === 'ebitda' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            EBITDA
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('netProfit')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              activeMetric === 'netProfit' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Net Profit
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('fcf')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              activeMetric === 'fcf' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Free Cash Flow
          </button>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="pt-6 pb-2 w-full min-w-0">
        <div className="h-48 flex items-end justify-between gap-2 border-b border-slate-800 px-2 w-full min-w-0">
          {forecasts.map(item => {
            const val = item[activeMetric];
            const heightPct = Math.max(8, (val / maxVal) * 100);
            const isProjected = item.type === 'projected';

            return (
              <div key={item.year} className="flex-1 flex flex-col items-center group relative min-w-0">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-10 mono">
                  {currency}
                  {val.toLocaleString('en-IN')} Cr ({isProjected ? 'Forecast' : 'Actual'})
                </div>

                <div className="w-full max-w-[42px] flex flex-col items-center">
                  <span className="text-[10px] text-slate-300 mono mb-1 font-bold truncate">
                    {Math.round(val / 1000) > 0 ? `${(val / 1000).toFixed(1)}k` : val}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isProjected
                        ? 'bg-gradient-to-t from-blue-700/60 to-emerald-500/80 border-t-2 border-emerald-400 border-dashed'
                        : activeMetric === 'revenue'
                        ? 'bg-blue-600'
                        : activeMetric === 'ebitda'
                        ? 'bg-purple-600'
                        : activeMetric === 'netProfit'
                        ? 'bg-emerald-600'
                        : 'bg-amber-600'
                    }`}
                  />
                </div>
                <div className="mt-2 text-center w-full min-w-0">
                  <span className="text-[10px] font-bold mono block text-slate-300 truncate">{item.year}</span>
                  <span className="text-[8px] uppercase mono text-slate-400">
                    {isProjected ? 'Proj' : 'Act'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface MarginChartProps {
  margins: MarginPeriod[];
}

export const MarginTrendsChart: React.FC<MarginChartProps> = ({ margins }) => {
  if (!margins || margins.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">Operating Leverage &amp; Margin History</span>
          <p className="text-[11px] text-slate-400">Gross vs Operating vs Net Profit margin conversion efficiency.</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] mono">
          <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-400" /> Gross</span>
          <span className="flex items-center gap-1.5 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-400" /> Operating</span>
          <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Net Margin</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {margins.map(m => (
          <div key={m.period} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white mono text-xs">{m.period}</div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Gross:</span>
              <span className="mono font-bold text-blue-400">{m.gross}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Operating:</span>
              <span className="mono font-bold text-purple-400">{m.operating}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Net Margin:</span>
              <span className="mono font-bold text-emerald-400">{m.net}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ValuationGaugeProps {
  currentPrice: number;
  low52: number;
  high52: number;
  targetPrice?: number;
  currency?: string;
  marginOfSafetyPct?: number;
}

export const ValuationGauge: React.FC<ValuationGaugeProps> = ({
  currentPrice,
  low52,
  high52,
  targetPrice,
  currency = '₹',
  marginOfSafetyPct,
}) => {
  const range = high52 - low52 || 1;
  const currentPosPct = Math.max(0, Math.min(100, ((currentPrice - low52) / range) * 100));

  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-300 uppercase tracking-wider">52-Week Price Spectrum &amp; Margin of Safety</span>
        {marginOfSafetyPct !== undefined && (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mono text-[11px] border border-emerald-500/30">
            Margin of Safety: +{marginOfSafetyPct}%
          </span>
        )}
      </div>

      <div className="relative pt-4 pb-2">
        {/* Progress Bar Track */}
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div className="w-1/3 bg-emerald-500/70" title="Deep Value Band" />
          <div className="w-1/3 bg-blue-500/70" title="Fair Value Band" />
          <div className="w-1/3 bg-rose-500/70" title="Premium Momentum Band" />
        </div>

        {/* Current Price Marker Needle */}
        <div
          style={{ left: `${currentPosPct}%` }}
          className="absolute top-1 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
        >
          <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-md shadow-blue-500/50" />
          <div className="mt-1 text-[10px] font-extrabold text-white mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
            {currency}{currentPrice}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] mono text-slate-400">
        <div>
          <span>52W Low: </span>
          <span className="font-bold text-white">{currency}{low52}</span>
        </div>
        {targetPrice && (
          <div>
            <span>12M Fair Value: </span>
            <span className="font-bold text-emerald-400">{currency}{targetPrice}</span>
          </div>
        )}
        <div>
          <span>52W High: </span>
          <span className="font-bold text-white">{currency}{high52}</span>
        </div>
      </div>
    </div>
  );
};

interface MultiHorizonReturnChartProps {
  returns: {
    d1: number;
    w1: number;
    m1: number;
    m3: number;
    m6: number;
    y1: number;
  };
  ticker?: string;
}

export const MultiHorizonReturnChart: React.FC<MultiHorizonReturnChartProps> = ({
  returns,
  ticker,
}) => {
  const horizons = [
    { label: '1 Day', short: '1D', val: returns.d1 },
    { label: '1 Week', short: '1W', val: returns.w1 },
    { label: '1 Month', short: '1M', val: returns.m1 },
    { label: '3 Months', short: '3M', val: returns.m3 },
    { label: '6 Months', short: '6M', val: returns.m6 },
    { label: '1 Year', short: '1Y', val: returns.y1 },
  ];

  const maxAbs = Math.max(...horizons.map(h => Math.abs(h.val)), 10);

  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">
            Multi-Horizon Up &amp; Down Return Spectrum (1D • 1W • 1M • 3M • 6M • 1Y)
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Complete rolling price/NAV performance trajectory across short, medium, and 1-year horizons{ticker ? ` for ${ticker}` : ''}.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Positive Gain (Up %)
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Pullback / Drawdown (Down %)
          </span>
        </div>
      </div>

      {/* 6-Horizon KPI Cards + Diverging Bar Visual */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {horizons.map(h => {
          const isUp = h.val >= 0;
          const barWidthPct = Math.min(100, Math.max(8, (Math.abs(h.val) / maxAbs) * 100));
          return (
            <div
              key={h.short}
              className={`p-3 rounded-lg border transition ${
                isUp
                  ? 'bg-emerald-950/25 border-emerald-500/30'
                  : 'bg-rose-950/25 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mono text-slate-400">
                <span className="font-bold uppercase text-slate-300">{h.label}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-bold">
                  {h.short}
                </span>
              </div>
              <div
                className={`text-base sm:text-lg font-extrabold mono mt-1 flex items-center gap-1 ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span>{isUp ? '▲' : '▼'}</span>
                <span>
                  {isUp ? '+' : ''}
                  {h.val.toFixed(2)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div
                  style={{ width: `${barWidthPct}%` }}
                  className={`h-full rounded-full ${
                    isUp ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

