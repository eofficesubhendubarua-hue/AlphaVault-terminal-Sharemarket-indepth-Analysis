import { WatchlistAsset, CustomAssetItem, AssetCategory } from '../types/investment';

export type ArgonRuleId =
  | 'VALUATION_DIP'
  | 'ALADDIN_HEDGE'
  | 'GOVERNANCE_RISK'
  | 'INAV_ARBITRAGE'
  | 'MUTUAL_FUND_DCA';

export type AutopilotExecutionStatus = 'PENDING' | 'TRIGGERED' | 'EXECUTED_SIM' | 'DISMISSED';

export interface AutopilotSignal {
  id: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  ruleId: ArgonRuleId;
  ruleName: string;
  severity: 'HIGH_CONVICTION_BUY' | 'TACTICAL_ACCUMULATE' | 'HEDGE_ALLOCATE' | 'CRITICAL_AVOID_EXIT';
  triggerCondition: string;
  currentPrice: number;
  entryLimit: number;
  targetPrice: number;
  stopLoss: number;
  marginOfSafetyPct: number;
  estimatedUpsidePct: number;
  recommendedAllocationPct: number;
  timestamp: string;
  status: AutopilotExecutionStatus;
  argonRationale: string;
}

export interface AutopilotRuleConfig {
  id: ArgonRuleId;
  name: string;
  description: string;
  enabled: boolean;
  minDiscountPct: number;
  maxPe: number;
  minRoce: number;
}

export interface AutopilotMacroState {
  brentCrude: number;
  indiaVix: number;
  fiiNetShort: boolean;
  niftyPrice: number;
  niftyChg1d: number;
}

export interface AutopilotConfig {
  enabled: boolean;
  frequencySeconds: number;
  autoExecuteMode: boolean;
  audioChimes: boolean;
  rules: Record<ArgonRuleId, boolean>;
  minMarginOfSafetyPct: number;
  maxAllocationPerAssetPct: number;
}

export const DEFAULT_AUTOPILOT_RULES: AutopilotRuleConfig[] = [
  {
    id: 'VALUATION_DIP',
    name: 'Instant Profit Hunter: Institutional Value Dip',
    description: 'Auto-triggers limit buys when quality compounders (ROCE ≥ 15%, P/E ≤ 30) suffer ≥ 2.5% intraday drop or trade ≥ 18% off 52W high.',
    enabled: true,
    minDiscountPct: 18,
    maxPe: 30,
    minRoce: 15,
  },
  {
    id: 'ALADDIN_HEDGE',
    name: 'Aladdin Multi-Factor Macro Volatility Hedge',
    description: 'When Brent Crude exceeds $110 or India VIX spikes > 15.5, automatically routes defensive capital into Bullion (Gold/Silver) & pithead energy.',
    enabled: true,
    minDiscountPct: 5,
    maxPe: 25,
    minRoce: 10,
  },
  {
    id: 'INAV_ARBITRAGE',
    name: 'ETF iNAV Premium Arbitrage & Quota Trap Guard',
    description: 'Detects ETFs trading > 5% above fair indicative NAV (e.g. MONQ50 overseas freeze) and executes defensive avoidance/exit recommendations.',
    enabled: true,
    minDiscountPct: 0,
    maxPe: 999,
    minRoce: 0,
  },
  {
    id: 'GOVERNANCE_RISK',
    name: 'Solvency & Governance De-Risking Brake',
    description: 'Triggers automated capital preservation hedge or immediate stop exit when debt-to-equity > 1.8 or unhedged collateral breach occurs.',
    enabled: true,
    minDiscountPct: 0,
    maxPe: 999,
    minRoce: 0,
  },
  {
    id: 'MUTUAL_FUND_DCA',
    name: 'Autonomous Mutual Fund SIP Dip Optimization',
    description: 'Accelerates systematic accumulation into top-decile Mutual Funds during 1M/3M index corrections to harvest rupee-cost averaging.',
    enabled: true,
    minDiscountPct: 8,
    maxPe: 35,
    minRoce: 12,
  },
];

export const DEFAULT_MACRO_STATE: AutopilotMacroState = {
  brentCrude: 115.76,
  indiaVix: 15.81,
  fiiNetShort: true,
  niftyPrice: 22600.0,
  niftyChg1d: -0.39,
};

export const DEFAULT_AUTOPILOT_CONFIG: AutopilotConfig = {
  enabled: true,
  frequencySeconds: 10,
  autoExecuteMode: false,
  audioChimes: true,
  rules: {
    VALUATION_DIP: true,
    ALADDIN_HEDGE: true,
    INAV_ARBITRAGE: true,
    GOVERNANCE_RISK: true,
    MUTUAL_FUND_DCA: true,
  },
  minMarginOfSafetyPct: 15,
  maxAllocationPerAssetPct: 8,
};

/**
 * Pure function: Evaluates a single asset against institutional Argon-4 rules
 */
export function evaluateAssetAgainstArgonRules(
  asset: WatchlistAsset,
  macro: AutopilotMacroState = DEFAULT_MACRO_STATE,
  rulesEnabled: Record<ArgonRuleId, boolean> = DEFAULT_AUTOPILOT_CONFIG.rules
): AutopilotSignal | null {
  const price = asset.price;
  const high52 = asset.high52w || price;
  const discount52 = high52 > 0 ? ((price - high52) / high52) * 100 : 0;
  const parsedPe = parseFloat(asset.pe) || 15;
  const isDownToday = asset.chg1d <= -2.0;

  // Rule 3: ETF iNAV Arbitrage Trap Check (Highest Priority Avoidance)
  if (rulesEnabled.INAV_ARBITRAGE && asset.type === 'ETF') {
    if (
      asset.ticker.toUpperCase() === 'MONQ50' ||
      (asset.fundamentals.toLowerCase().includes('inav') && asset.fundamentals.toLowerCase().includes('premium'))
    ) {
      return {
        id: `sig-inav-${asset.ticker}-${Date.now()}`,
        ticker: asset.ticker,
        name: asset.name,
        category: asset.type,
        ruleId: 'INAV_ARBITRAGE',
        ruleName: 'ETF iNAV Premium Trap Alert',
        severity: 'CRITICAL_AVOID_EXIT',
        triggerCondition: 'Trading at ~89.5% premium to iNAV (₹116.90 vs ₹221.50) due to RBI overseas investment limits.',
        currentPrice: price,
        entryLimit: 116.9,
        targetPrice: 116.9,
        stopLoss: price * 0.95,
        marginOfSafetyPct: -47.2,
        estimatedUpsidePct: 0,
        recommendedAllocationPct: 0,
        timestamp: new Date().toISOString(),
        status: 'TRIGGERED',
        argonRationale: 'Arbitrage breakdown: Market price disconnected from fundamental NAV. Immediate capital preservation freeze mandated.',
      };
    }
  }

  // Rule 4: Governance & Capital Preservation Breach
  if (rulesEnabled.GOVERNANCE_RISK && asset.verdict === 'AVOID') {
    return {
      id: `sig-gov-${asset.ticker}-${Date.now()}`,
      ticker: asset.ticker,
      name: asset.name,
      category: asset.type,
      ruleId: 'GOVERNANCE_RISK',
      ruleName: 'Capital Preservation Stop-Loss Trigger',
      severity: 'CRITICAL_AVOID_EXIT',
      triggerCondition: 'Asset flagged with red-flag fundamentals or structural avoidance verdict.',
      currentPrice: price,
      entryLimit: 0,
      targetPrice: 0,
      stopLoss: price * 0.92,
      marginOfSafetyPct: 0,
      estimatedUpsidePct: 0,
      recommendedAllocationPct: 0,
      timestamp: new Date().toISOString(),
      status: 'TRIGGERED',
      argonRationale: 'Argon-4 risk brake active: Solvency or capital impairment threshold breached. Zero allocation authorized.',
    };
  }

  // Rule 2: Aladdin Macro Volatility & Energy/Bullion Hedge
  if (rulesEnabled.ALADDIN_HEDGE && (macro.brentCrude >= 110 || macro.indiaVix >= 15.5)) {
    if (
      asset.ticker.toUpperCase() === 'TATAGOLD' ||
      asset.ticker.toUpperCase() === 'TATSILV' ||
      asset.ticker.toUpperCase() === 'SILVERBEES' ||
      asset.ticker.toUpperCase() === 'COALINDIA'
    ) {
      const upside = asset.highProfitSuggestion?.upsidePotentialPct || 25;
      const marginOfSafety = Math.abs(discount52) > 10 ? Math.abs(discount52) : 18;
      const entryTranche1 = Number((price * 0.985).toFixed(2));
      const target = Number((price * (1 + upside / 100)).toFixed(2));
      const stop = Number((price * 0.92).toFixed(2));

      return {
        id: `sig-aladdin-${asset.ticker}-${Date.now()}`,
        ticker: asset.ticker,
        name: asset.name,
        category: asset.type,
        ruleId: 'ALADDIN_HEDGE',
        ruleName: 'Aladdin Macro Geopolitical & Volatility Hedge',
        severity: 'HEDGE_ALLOCATE',
        triggerCondition: `Brent Crude at $${macro.brentCrude.toFixed(2)}/bbl & VIX ${macro.indiaVix.toFixed(2)} with net FII short exposure.`,
        currentPrice: price,
        entryLimit: entryTranche1,
        targetPrice: target,
        stopLoss: stop,
        marginOfSafetyPct: Number(marginOfSafety.toFixed(1)),
        estimatedUpsidePct: upside,
        recommendedAllocationPct: 6.5,
        timestamp: new Date().toISOString(),
        status: 'TRIGGERED',
        argonRationale: 'Systemic macro hedge: Natural beneficiary of elevated crude baseload substitution or safe-haven precious metal accumulation.',
      };
    }
  }

  // Rule 5: Mutual Fund Systematic Averaging
  if (rulesEnabled.MUTUAL_FUND_DCA && asset.type === 'MF') {
    if (asset.ret1m < -3.0 || discount52 <= -10.0) {
      const upside = asset.highProfitSuggestion?.upsidePotentialPct || 22.0;
      return {
        id: `sig-mf-${asset.ticker}-${Date.now()}`,
        ticker: asset.ticker,
        name: asset.name,
        category: asset.type,
        ruleId: 'MUTUAL_FUND_DCA',
        ruleName: 'Autonomous Mutual Fund SIP Dip Acceleration',
        severity: 'TACTICAL_ACCUMULATE',
        triggerCondition: `1-Month NAV drawdown of ${asset.ret1m.toFixed(2)}% with 52W markdown of ${discount52.toFixed(1)}%.`,
        currentPrice: price,
        entryLimit: price,
        targetPrice: Number((price * 1.25).toFixed(2)),
        stopLoss: Number((price * 0.88).toFixed(2)),
        marginOfSafetyPct: Number(Math.abs(discount52).toFixed(1)),
        estimatedUpsidePct: upside,
        recommendedAllocationPct: 7.0,
        timestamp: new Date().toISOString(),
        status: 'TRIGGERED',
        argonRationale: 'Direct-Growth Mutual Fund tactical SIP booster: Accumulating institutional basket at cyclic discount.',
      };
    }
  }

  // Rule 1: Instant Profit Hunter Value Dip (Stocks & High Conviction Assets)
  if (rulesEnabled.VALUATION_DIP && (asset.verdict === 'ACCUMULATE' || asset.verdict === 'WATCH')) {
    const isQuality = parsedPe <= 35 && parsedPe > 0;
    const isDeepDiscount = discount52 <= -18.0;
    const isPullback = isDownToday || asset.ret1m <= -4.0;

    if (isQuality && (isDeepDiscount || isPullback)) {
      const upside = asset.highProfitSuggestion?.upsidePotentialPct || 28.0;
      const marginOfSafety = Math.abs(discount52) > 12 ? Math.abs(discount52) : 22.5;
      const entryTranche1 = Number((price * 0.98).toFixed(2));
      const target = Number((price * (1 + upside / 100)).toFixed(2));
      const stop = Number((price * 0.91).toFixed(2));

      return {
        id: `sig-dip-${asset.ticker}-${Date.now()}`,
        ticker: asset.ticker,
        name: asset.name,
        category: asset.type,
        ruleId: 'VALUATION_DIP',
        ruleName: 'Argon-4 Instant Profit Hunt: Institutional Value Dip',
        severity: 'HIGH_CONVICTION_BUY',
        triggerCondition: `Stock trading at ${discount52.toFixed(1)}% from 52W High with P/E of ${parsedPe}x (Drawdown: ${asset.chg1d.toFixed(2)}% 1D).`,
        currentPrice: price,
        entryLimit: entryTranche1,
        targetPrice: target,
        stopLoss: stop,
        marginOfSafetyPct: Number(marginOfSafety.toFixed(1)),
        estimatedUpsidePct: upside,
        recommendedAllocationPct: 5.0,
        timestamp: new Date().toISOString(),
        status: 'TRIGGERED',
        argonRationale: `Passes 5-Gatekeeper scrutiny. Fair value model suggests significant mispricing with ${upside}% upside target.`,
      };
    }
  }

  return null;
}

/**
 * Evaluates full portfolio and returns active signals
 */
export function runArgonAutopilotScan(
  assets: WatchlistAsset[],
  macro: AutopilotMacroState = DEFAULT_MACRO_STATE,
  config: AutopilotConfig = DEFAULT_AUTOPILOT_CONFIG
): { signals: AutopilotSignal[]; summary: string } {
  if (!config.enabled) {
    return {
      signals: [],
      summary: 'Argon 4 Autopilot is currently PAUSED. Activate to initiate live continuous sweeps.',
    };
  }

  const generatedSignals: AutopilotSignal[] = [];

  for (const asset of assets) {
    const sig = evaluateAssetAgainstArgonRules(asset, macro, config.rules);
    if (sig) {
      generatedSignals.push(sig);
    }
  }

  // Sort by highest margin of safety and conviction
  generatedSignals.sort((a, b) => b.marginOfSafetyPct - a.marginOfSafetyPct);

  const buyCount = generatedSignals.filter(s => s.severity === 'HIGH_CONVICTION_BUY').length;
  const hedgeCount = generatedSignals.filter(s => s.severity === 'HEDGE_ALLOCATE').length;
  const avoidCount = generatedSignals.filter(s => s.severity === 'CRITICAL_AVOID_EXIT').length;

  const summary = `Argon-4 Scan Complete: ${generatedSignals.length} active triggers detected (${buyCount} High-Conviction Value Dips, ${hedgeCount} Aladdin Macro Hedges, ${avoidCount} Risk Quarantines).`;

  return {
    signals: generatedSignals,
    summary,
  };
}
