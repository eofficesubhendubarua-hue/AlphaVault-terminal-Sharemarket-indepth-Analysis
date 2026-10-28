import { CustomAssetItem } from '../types/investment';

export interface GatekeeperResult {
  dd52: number;
  score: number;
  buyLow: string;
  buyHigh: string;
  stop: string;
  signal: string;
  sigCls: string;
}

export interface BSMGreeksResult {
  callPrice: number;
  putPrice: number;
  straddle: number;
  callDelta: number;
  putDelta: number;
  gamma: number;
  vega: number;
  callTheta: number;
  move1D: number;
  moveExp: number;
}

/**
 * Standard Normal Cumulative Distribution Function approximation
 */
export function normCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2.0);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * y);
}

/**
 * Standard Normal Probability Density Function
 */
export function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2.0 * Math.PI);
}

/**
 * Black-Scholes-Merton Options Delta-Gamma Sensitivity
 */
export function computeBSMGreeks(
  S: number,
  K: number,
  ivPct: number,
  daysToExpiry: number,
  riskFreeRate: number = 0.0675
): BSMGreeksResult {
  const iv = Math.max(0.01, ivPct / 100.0);
  const days = Math.max(0.5, daysToExpiry);
  const T = days / 365.0;
  const r = riskFreeRate;

  const d1 = (Math.log(S / K) + (r + 0.5 * iv * iv) * T) / (iv * Math.sqrt(T));
  const d2 = d1 - iv * Math.sqrt(T);

  const callPrice = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
  const putPrice = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
  const straddle = callPrice + putPrice;

  const callDelta = normCDF(d1);
  const putDelta = callDelta - 1.0;
  const gamma = normPDF(d1) / (S * iv * Math.sqrt(T));
  const vega = (S * normPDF(d1) * Math.sqrt(T)) / 100.0;
  const callTheta =
    (-(S * normPDF(d1) * iv) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normCDF(d2)) / 365.0;

  const move1D = S * (iv / Math.sqrt(252));
  const moveExp = S * iv * Math.sqrt(T);

  return {
    callPrice,
    putPrice,
    straddle,
    callDelta,
    putDelta,
    gamma,
    vega,
    callTheta,
    move1D,
    moveExp,
  };
}

/**
 * 5-Gatekeeper Institutional Scoring Engine
 */
export function compute5GatekeeperScore(item: CustomAssetItem): GatekeeperResult {
  const dd52 = item.high52 > 0 ? ((item.price - item.high52) / item.high52) * 100 : 0;
  let score = 50;

  // Gate 1: Markdown from peak (Value zone is 15% to 48% off peak)
  if (dd52 <= -15 && dd52 >= -48) score += 14;
  else if (dd52 < -48) score += 6; // severe markdown, turnaround required
  else if (dd52 <= -8) score += 8;

  // Gate 2: Short-term vs long-term trend
  if (item.d1 <= -2.5 && item.d1 >= -5.5) score += 8; // in 3%-5% accumulation shakeout
  if (item.y1 > 10 && item.m6 > 5 && item.m1 < 0) score += 12; // structural compounder pullback
  else if (item.y1 > 0) score += 6;

  // Gate 3: Valuation Multiple (P/E or TER)
  if (item.pe > 0 && item.pe <= 18) score += 12; // deep value
  else if (item.pe > 18 && item.pe <= 32) score += 6;
  else if (item.pe > 55) score -= 10;

  // Gate 4: Capital efficiency (ROCE)
  if (item.roce >= 20) score += 10;
  else if (item.roce >= 14) score += 5;

  // Gate 5: Solvency & Governance
  if (item.de <= 0.3) score += 6;
  else if (item.de > 1.2) score -= 10;

  if (item.inst === 'PASS_INSTITUTIONAL') score += 10;
  else if (item.inst === 'PASS_MODERATE') score += 4;
  else if (item.inst === 'CAUTION_ILLIQUID') score -= 12;
  else if (item.inst === 'FAIL_GOVERNANCE') score -= 25;

  score = Math.max(10, Math.min(96, Math.round(score)));
  const buyLow = (item.price * 0.95).toFixed(2);
  const buyHigh = (item.price * 1.0).toFixed(2);
  const stop = (item.price * 0.9).toFixed(2);

  let signal = 'WATCH (Conditional Entry)';
  let sigCls = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  if (item.inst === 'FAIL_GOVERNANCE' || score < 48) {
    signal = 'AVOID (Fails Gatekeeper)';
    sigCls = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  } else if (score >= 76 && item.inst === 'PASS_INSTITUTIONAL') {
    signal = 'ACCUMULATE (Passes All 5 Gates)';
    sigCls = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }

  return { dd52, score, buyLow, buyHigh, stop, signal, sigCls };
}

/**
 * Compound Annual Growth Rate
 */
export function calculateCagr(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

export function formatSignedPct(val: number | string): string {
  const n = Number(val);
  if (isNaN(n)) return '0.00%';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function formatCurrency(val: number, currency: string = '₹'): string {
  return `${currency}${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getRiskAwareAccumulationRef(asset: {
  ticker: string;
  price: number;
  buyZone?: string;
  riskReference?: string;
}): string {
  if (asset.riskReference) return asset.riskReference;
  const t = asset.ticker.toUpperCase();
  if (t === 'BHEL') return '₹378–386; below Fri low reassess';
  if (t === 'COALINDIA') return '₹390–398; income thesis only';
  if (t === 'HINDCOPPER') return '₹392–402; LME and earnings gate';
  if (t === 'MOREPENLAB') return 'Only on pullback ₹113–117';
  if (t === 'MOTHERSON') return '₹148–152; confirm auto demand';
  if (t === 'TATACAP') return '₹301–307; stop below ₹296';
  if (t === 'HINDZINC') return '₹465–480; 10.07x P/E floor';
  if (t === 'MAFANG') return 'Bid ≤1.5% of iNAV (₹241–244)';
  if (t === 'MASPTOP50') return 'Accumulate near true iNAV ₹95–97';
  if (t === 'MON100') return 'Bid ≤ ₹274 during morning air-pockets';
  if (t === 'MONQ50') return 'Strictly avoid; wait for quota resolution';
  if (t === 'TATSILV') return '₹18.20–18.80; COMEX margin flush';
  if (t.includes('QUANT-SC') || t.includes('QUANTSC')) return 'Accelerated SIP on dips ≤ ₹295';
  if (t.includes('MIDCAP')) return 'Accumulate in cyclic retail shakeout';

  if (asset.buyZone) return `${asset.buyZone}; thesis verified`;
  return `₹${(asset.price * 0.95).toFixed(0)}–₹${asset.price.toFixed(0)}; support gate`;
}

export function getDeskFlag(asset: {
  ticker: string;
  chg1d: number;
  dd52w: number;
  deskFlag?: string;
}): string {
  if (asset.deskFlag) return asset.deskFlag;
  const t = asset.ticker.toUpperCase();
  if (t === 'BHEL') return 'Pullback; 6M/1Y intact';
  if (t === 'COALINDIA') return 'Yield / defensive';
  if (t === 'HINDCOPPER') return 'Deep drawdown; high beta';
  if (t === 'MOREPENLAB') return 'Upper-circuit / momentum risk';
  if (t === 'MOTHERSON') return 'Pullback; trend positive';
  if (t === 'TATACAP') return 'Corrective trend';
  if (t === 'HINDZINC') return '3–5% dip / cyclical';
  if (t === 'MONQ50') return 'Quota premium trap (+89.5%)';

  if (asset.chg1d <= -3.0 && asset.chg1d >= -5.0) return '3–5% dip / cyclical';
  if (asset.dd52w <= -25.0) return 'Deep drawdown; high beta';
  if (asset.chg1d > 3.0) return 'Upper-circuit / momentum risk';
  if (asset.chg1d < 0) return 'Pullback; trend positive';
  return 'Corrective trend';
}

export function getEtfPremiumDiscount(asset: {
  ticker: string;
  type: string;
  etfPremiumDiscount?: string;
}): string {
  if (asset.etfPremiumDiscount) return asset.etfPremiumDiscount;
  const t = asset.ticker.toUpperCase();
  if (t === 'MONQ50') return '+89.5%';
  if (t === 'TATSILV') return '+0.2%';
  if (t === 'MAFANG') return '-0.4%';
  if (t === 'MASPTOP50') return '-0.6%';
  if (t === 'MON100') return '+1.3%';
  if (asset.type === 'ETF') return 'Check iNAV';
  return '—';
}

export function getEvidenceGate(asset: {
  ticker: string;
  evidenceGate?: string;
}): string {
  if (asset.evidenceGate) return asset.evidenceGate;
  const t = asset.ticker.toUpperCase();
  if (t === 'MONQ50') return 'Exceeds 5% iNAV tolerance band';
  if (t === 'TATSILV') return 'Vaulted physical silver verified';
  return 'Fresh earnings / catalyst check required';
}

export function getDailyResearchAction(asset: {
  ticker: string;
  chg1d: number;
  dd52w: number;
  dailyResearchAction?: string;
}): string {
  if (asset.dailyResearchAction) return asset.dailyResearchAction;
  const t = asset.ticker.toUpperCase();
  if (t === 'BHEL') return 'Monitor; no completed value gate';
  if (t === 'COALINDIA') return 'Monitor; no completed value gate';
  if (t === 'HINDCOPPER') return '3–5% fall: verify catalyst';
  if (t === 'MOREPENLAB') return 'Monitor; no completed value gate';
  if (t === 'MOTHERSON') return 'Monitor; no completed value gate';
  if (t === 'TATACAP') return 'Deep drawdown: thesis review';
  if (t === 'HINDZINC') return '3–5% fall: verify catalyst';
  if (t === 'MONQ50') return 'Strict Avoid; Quota freeze trap';

  if (asset.chg1d <= -3.0 && asset.chg1d >= -5.0) return '3–5% fall: verify catalyst';
  if (asset.dd52w <= -20.0) return 'Deep drawdown: thesis review';
  return 'Monitor; no completed value gate';
}
