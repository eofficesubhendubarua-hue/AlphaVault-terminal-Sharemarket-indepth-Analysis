import React, { useState } from 'react';
import { WatchlistAsset, AladdinFactorSensitivity, AladdinStressScenario, AladdinAlphaOpportunity } from '../types/investment';
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
} from 'lucide-react';

interface AladdinRiskSuiteProps {
  assets: WatchlistAsset[];
  onSelectAssetForAudit?: (ticker: string) => void;
}

const DEFAULT_FACTOR_SENSITIVITIES: AladdinFactorSensitivity[] = [
  {
    factor: 'Market Equity Beta',
    category: 'MARKET',
    loading: 1.06,
    status: 'POSITIVE',
    description: 'High sensitivity to broad domestic Nifty/Sensex cyclical expansion with 1.06x upside capture.',
  },
  {
    factor: 'Crude Oil Sensitivity ($115.76/bbl)',
    category: 'MACRO',
    loading: -0.42,
    status: 'NEGATIVE',
    description: 'Every +$10/bbl rise in Brent trims ~0.42% from gross corporate margins across consumer cyclicals.',
  },
  {
    factor: 'USD/INR Currency Factor (₹94.94)',
    category: 'CURRENCY',
    loading: 0.38,
    status: 'POSITIVE',
    description: 'Net beneficiary through IT exporters (INFY) and international luxury automotive revenue (JLR / Tata Motors).',
  },
  {
    factor: 'Sovereign Yield Duration (6.75% G-Sec)',
    category: 'MACRO',
    loading: -0.28,
    status: 'NEUTRAL',
    description: 'Low leverage across core assets dampens vulnerability to potential 25 bps RBI rate pause/hike.',
  },
  {
    factor: 'Quality / Capital Return Style (ROCE)',
    category: 'STYLE',
    loading: 0.84,
    status: 'POSITIVE',
    description: 'Heavy institutional tilt toward high-ROCE (>18%) cash generators with zero promoter pledge.',
  },
  {
    factor: 'Deep Value Style (P/E Markdown)',
    category: 'STYLE',
    loading: 0.72,
    status: 'POSITIVE',
    description: 'Disciplined margin of safety; assets bought at >15% markdown from 52-week highs.',
  },
];

const SCENARIOS: AladdinStressScenario[] = [
  {
    id: 'oil-shock',
    title: 'Middle East Geopolitical Escalation: Brent Crude Spikes to $130/bbl',
    shockDescription: 'Strait of Hormuz disruptions and supply rationing drive Brent from $115.76 to $130.00/bbl (+12.3%).',
    estimatedPortfolioImpactPct: -2.15,
    vulnerableSectors: ['Oil Marketing Companies (IOC, BPCL)', 'Aviation & Paints', 'Auto Logistics'],
    beneficiarySectors: ['Upstream Crude (ONGC)', 'Coal India (Energy Substitute)', 'Gold Bullion ETF (TATSILV/GOLDBEES)'],
    actionRecommendation: 'Increase hedging allocation in physical Gold/Silver ETFs and accumulate upstream energy beneficiaries at support.',
  },
  {
    id: 'rbi-hike',
    title: 'Sticky Inflation Shock: RBI Surprise 50 bps Repo Rate Hike to 7.00%',
    shockDescription: 'Food & energy inflation forces RBI MPC to reverse easing and raise policy rate by 50 bps.',
    estimatedPortfolioImpactPct: -1.85,
    vulnerableSectors: ['High-Debt Real Estate Developers', 'NBFCs with High Cost of Funds', 'Long-Duration Fixed Income'],
    beneficiarySectors: ['Large Private Banks with High CASA (HDFC Bank)', 'Net-Cash PSUs with Treasury Floats'],
    actionRecommendation: 'Stick strictly to companies with Interest Coverage > 4.0x and Debt-to-Equity < 0.5x.',
  },
  {
    id: 'fii-outflow',
    title: 'Global Risk-Off: FII Emergency Cash Liquidation (-₹50,000 Cr)',
    shockDescription: 'US Treasury 10-Yr yields surge toward 4.90%, triggering aggressive foreign portfolio capital outflows.',
    estimatedPortfolioImpactPct: -4.35,
    vulnerableSectors: ['High FII-Owned Midcaps', 'Overvalued Retail IPOs', 'US Tech Overlap ETFs at Premiums'],
    beneficiarySectors: ['Domestic Mutual Fund SIP Anchors (₹24,500+ Cr/mo)', 'Contrarian Value Stocks (SBICONTRA)'],
    actionRecommendation: 'Deploy scheduled DCA Tranche 2 into Gatekeeper-approved equities near their 200-DMA support bands.',
  },
  {
    id: 'tech-derating',
    title: 'AI Capex Fatigue: Global Mega-Cap Tech Valuation De-Rating (-15%)',
    shockDescription: 'Nasdaq & S&P 500 hyperscalers consolidate post-2026 AI compute buildout, contracting EV/Sales multiples.',
    estimatedPortfolioImpactPct: -3.20,
    vulnerableSectors: ['US Tech ETFs (MAFANG, MON100, MONQ50)', 'Semiconductor Momentum Stocks'],
    beneficiarySectors: ['Domestic Indian Infrastructure (L&T, BHEL)', 'Defensive Consumer Staples & Pharma'],
    actionRecommendation: 'Enforce strict limit orders within ≤1.5% of official iNAV for MAFANG and MON100; avoid unhedged market orders.',
  },
];

export const AladdinRiskSuite: React.FC<AladdinRiskSuiteProps> = ({
  assets,
  onSelectAssetForAudit,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('oil-shock');
  const [customMacroShockPct, setCustomMacroShockPct] = useState<number>(0);

  const activeScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  // Algorithmic Aladdin Alpha Opportunities derived from assets
  const alphaOpportunities: AladdinAlphaOpportunity[] = [
    {
      ticker: 'BHEL',
      name: 'Bharat Heavy Electricals Ltd',
      category: 'EQUITY',
      signalType: 'DEEP_DIP_VALUE',
      currentPrice: 385.35,
      buyZone: '₹375 – ₹386',
      targetPrice: 475.0,
      upsidePct: 23.2,
      aladdinConvictionScore: 94,
      whyBuyNow: 'Friday -3.40% dip flushed leveraged F&O longs into 200-DMA support; ₹1.62 Lakh Cr order book provides 4.3x revenue visibility.',
    },
    {
      ticker: 'HINDZINC',
      name: 'Hindustan Zinc Ltd',
      category: 'EQUITY',
      signalType: 'DEEP_DIP_VALUE',
      currentPrice: 470.85,
      buyZone: '₹460 – ₹475',
      targetPrice: 585.0,
      upsidePct: 24.2,
      aladdinConvictionScore: 91,
      whyBuyNow: '10.07x P/E floor with 5.1% dividend yield; 160 KTPA Debari roaster & 800 MTPA silver refinery expansion commissioned.',
    },
    {
      ticker: 'TATSILV',
      name: 'Tata Silver ETF',
      category: 'ETF',
      signalType: 'CONTRARIAN_HEDGE',
      currentPrice: 91.87,
      buyZone: '₹88 – ₹93',
      targetPrice: 115.0,
      upsidePct: 25.1,
      aladdinConvictionScore: 89,
      whyBuyNow: 'Down -46.7% off 52W high after COMEX margin shakeout; physical silver parity offers structural hedge against currency depreciation.',
    },
    {
      ticker: 'JIOIPO',
      name: 'Jio Platforms Ltd (Mainboard IPO)',
      category: 'IPO',
      signalType: 'EARNINGS_RE_RATING',
      currentPrice: 1180.0,
      buyZone: '₹1,120 – ₹1,180',
      targetPrice: 1540.0,
      upsidePct: 30.5,
      aladdinConvictionScore: 96,
      whyBuyNow: 'Sovereign AI data center with NVIDIA Blackwell + 490M+ 5G subscribers driving 28.5x P/E compounder with Fresh Issue deleveraging.',
    },
  ];

  const totalEffectiveImpact = activeScenario.estimatedPortfolioImpactPct + customMacroShockPct * 0.45;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-purple-500 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-extrabold text-sm mono">
              AL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  BlackRock Aladdin Enterprise Risk &amp; Factor Decomposition Suite
                </h2>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold mono text-[10px] border border-purple-500/40">
                  INSTITUTIONAL GRADE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-asset risk factor loading, Parametric Value-at-Risk (VaR 95% / 99%), interactive scenario stress-testing, and algorithmic Alpha Opportunities.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs mono">
            <span className="text-slate-400">Risk Model:</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-purple-300 font-bold">
              Multi-Factor Copula
            </span>
          </div>
        </div>

        {/* Executive VaR & Capital Exposure Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs mono">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">1-Day VaR (95% Conf)</span>
            <div className="text-sm sm:text-base font-extrabold text-amber-400 mt-0.5">-1.82%</div>
            <span className="text-[10px] text-slate-400">Max 1D expected move</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">10-Day VaR (99% Conf)</span>
            <div className="text-sm sm:text-base font-extrabold text-rose-400 mt-0.5">-4.95%</div>
            <span className="text-[10px] text-slate-400">Basel III Capital Stress</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Expected Shortfall (CVaR)</span>
            <div className="text-sm sm:text-base font-extrabold text-rose-300 mt-0.5">-6.40%</div>
            <span className="text-[10px] text-slate-400">Tail-risk conditional loss</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Portfolio Sharpe Ratio</span>
            <div className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5">1.84x</div>
            <span className="text-[10px] text-slate-400">Risk-adjusted return</span>
          </div>
        </div>
      </div>

      {/* Multi-Asset Factor Risk Decomposition */}
      <div className="glass-card rounded-xl p-5 space-y-3 border-l-4 border-l-blue-500">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Aladdin Multi-Asset Factor Risk Decomposition
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Factor loadings showing portfolio sensitivity to broad equity market, crude oil, currency (USD/INR), interest rate duration, and style tilts.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold mono">
            6 FACTOR VECTORS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {DEFAULT_FACTOR_SENSITIVITIES.map(f => (
            <div key={f.factor} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate">{f.factor}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold mono ${
                    f.loading >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {f.loading >= 0 ? '+' : ''}
                  {f.loading.toFixed(2)}x
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{f.description}</p>
              <div className="pt-1 flex items-center justify-between text-[10px] mono text-slate-400 border-t border-slate-800/80">
                <span>Category: {f.category}</span>
                <span
                  className={`font-semibold ${
                    f.status === 'POSITIVE'
                      ? 'text-emerald-400'
                      : f.status === 'NEGATIVE'
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {f.status} TILT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Scenario Stress-Testing Engine */}
      <div className="glass-card rounded-xl p-5 space-y-4 border-l-4 border-l-amber-500">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Interactive Aladdin Macro Scenario Stress-Testing Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate extreme historical or hypothetical geopolitical, crude oil, interest rate, and liquidity shocks to quantify resilience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mono text-xs">
            <span className="text-slate-400">Total Projected Impact:</span>
            <span
              className={`px-2.5 py-1 rounded font-extrabold ${
                totalEffectiveImpact >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {totalEffectiveImpact >= 0 ? '+' : ''}
              {totalEffectiveImpact.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Predefined Scenario Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {SCENARIOS.map(sc => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-3 rounded-lg border text-left transition ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold truncate text-xs">{sc.title.split(':')[0]}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{sc.shockDescription}</div>
                <div className="mt-2 text-rose-400 font-bold mono text-[11px]">
                  Estimated: {sc.estimatedPortfolioImpactPct.toFixed(2)}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Scenario Deep Impact Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs">
          <div className="font-bold text-white text-sm">{activeScenario.title}</div>
          <p className="text-slate-300">{activeScenario.shockDescription}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900 border border-rose-900/40 space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase block">Vulnerable Assets / Sectors</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {activeScenario.vulnerableSectors.map((v, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/40 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block">Resilient &amp; Beneficiary Assets</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {activeScenario.beneficiarySectors.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-blue-900/40 space-y-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase block">Aladdin Action Plan</span>
              <p className="text-slate-200 text-[11px] leading-relaxed">{activeScenario.actionRecommendation}</p>
            </div>
          </div>

          {/* Custom Fine-Tuning Slider */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Additional Severity Stress Slider:</span>
              <span className="mono font-bold text-white">
                {customMacroShockPct > 0 ? '+' : ''}
                {customMacroShockPct}%
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={customMacroShockPct}
              onChange={e => setCustomMacroShockPct(parseFloat(e.target.value) || 0)}
              className="w-48 sm:w-64 accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Aladdin AI Alpha Opportunities & Suggestions */}
      <div className="glass-card rounded-xl p-5 space-y-4 border-l-4 border-l-emerald-500">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              Aladdin AI Alpha Opportunities &amp; Opportunistic Dip Suggestions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked algorithmic buy signals combining BlackRock style conviction ratings, margin of safety, and corporate catalyst timelines.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold mono border border-emerald-500/30">
            HIGH SHARPE CONVICTION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {alphaOpportunities.map(opp => (
            <div
              key={opp.ticker}
              className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 transition space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{opp.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 mono text-[9px] font-bold">
                      {opp.ticker} • {opp.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mono mt-0.5">
                    CMP: ₹{opp.currentPrice.toFixed(2)} | Buy Zone: <strong className="text-emerald-400">{opp.buyZone}</strong>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold mono text-xs">
                    +{opp.upsidePct}% Upside
                  </div>
                  <div className="text-[10px] text-slate-400 mono mt-0.5">Score: {opp.aladdinConvictionScore}/100</div>
                </div>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">{opp.whyBuyNow}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-300">
                  Target: ₹{opp.targetPrice.toFixed(2)} (Fair Value)
                </span>
                {onSelectAssetForAudit && (
                  <button
                    type="button"
                    onClick={() => onSelectAssetForAudit(opp.ticker)}
                    className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition flex items-center gap-1"
                  >
                    <span>Full AI Audit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
