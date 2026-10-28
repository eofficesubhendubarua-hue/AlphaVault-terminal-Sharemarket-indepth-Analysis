export type AssetCategory = 'EQUITY' | 'ETF' | 'MF' | 'IPO' | 'COMMODITY' | 'SPECULATIVE';
export type VerdictType = 'ACCUMULATE' | 'WATCH' | 'AVOID' | 'DATA INSUFFICIENT';

export interface WatchlistAsset {
  id: number;
  ticker: string;
  isin: string;
  url: string;
  name: string;
  type: AssetCategory;
  retType: string;
  obsDate: string;
  price: number;
  prevClose: number;
  unit: string;
  chg1d: number;
  low1dPct: number;
  low1dPrice: number;
  ret1w: number;
  ret1m: number;
  ret3m: number;
  ret6m: number;
  ret1y: number;
  sep26: number;
  cal3m: number;
  octMtd: number;
  high52w: number;
  low52w: number;
  dd52w: number;
  maxDd12m: number;
  worstDay: string;
  pe: string;
  mcap: string;
  trend: string;
  verdict: VerdictType;
  verdictColor: 'emerald' | 'blue' | 'rose' | 'amber';
  buyZone: string;
  target12m: string;
  stopLoss: string;
  fundamentals: string;
  institutional: string;
  tradingVsInv: string;
  counterThesis: string;
  businessModel: string;
  productsAndServices: string[];
  expansionsAndContracts: string[];
  tradeDealsAndCatalysts: string;
  highProfitSuggestion: {
    rating: string;
    upsidePotentialPct: number;
    strategy: string;
    catalystTimeline: string;
  };
  deskFlag?: string;
  riskReference?: string;
  etfPremiumDiscount?: string;
  evidenceGate?: string;
  dailyResearchAction?: string;
  nextDayTrading?: NextDayTradingForecast;
  futureInvestment?: FutureInvestmentForecast;
}

export interface NextDayTradingForecast {
  bias: 'STRONG_BULLISH' | 'BULLISH_DIP_BUY' | 'RANGE_BOUND_NEUTRAL' | 'DEFENSIVE_TRIM' | 'BEARISH_SHORT';
  confidencePct: number;
  expectedLow: number;
  expectedHigh: number;
  pivotPoint: number;
  t1LongEntry: number;
  t1Target1: number;
  t1Target2: number;
  t1StopLoss: number;
  riskRewardRatio: string;
  expectedMovePct: number;
  vwapBias: string;
  institutionalFlowIndicator: string;
  t1ActionPlan: string;
  optionsMaxPainOrStrike?: string;
  inavOrNavTrackingError?: string;
}

export interface FutureHorizonTarget {
  projectedPrice: number;
  targetReturnPct: number;
  conviction: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'SPECULATIVE';
  horizonLabel: string;
}

export interface FutureInvestmentForecast {
  timeHorizon1m: FutureHorizonTarget;
  timeHorizon6m: FutureHorizonTarget;
  timeHorizon1y: FutureHorizonTarget;
  timeHorizon3y: FutureHorizonTarget;
  intrinsicValue: number;
  marginOfSafetyPct: number;
  compounderQualityScore: number; // 0 - 100
  accumulationPlaybook: string;
  invalidationLevel: string;
  macroCatalysts: string[];
  compoundingTrajectorySummary: string;
  recommendedAllocationPct: number;
}

export interface RevenueSegment {
  name: string;
  sharePct: number;
  revenueCr?: number;
}

export interface GrowthForecast {
  year: string;
  revenue: number;
  ebitda: number;
  netProfit: number;
  fcf: number;
  type: 'actual' | 'projected';
}

export interface MarginPeriod {
  period: string;
  gross: number;
  operating: number;
  net: number;
}

export interface ProductDetailItem {
  name: string;
  category: string;
  shareOrImpact: string;
  details: string;
}

export interface IpoProspectusDetails {
  isIpoOrRecentListing: boolean;
  issueWindow: string;
  priceBand: string;
  issueSizeAndStructure: string;
  freshIssueVsOfsSplit: string;
  subscriptionStatus: string;
  useOfProceeds: string;
  listingVsLongTermVerdict: string;
}

export interface BlockDealItem {
  id: string;
  date: string;
  exchange: 'NSE' | 'BSE';
  buyer: string;
  seller: string;
  quantity: number;
  price: number;
  valueCr: number;
  pctEquityTransacted: number;
  dealType: 'BLOCK_DEAL' | 'BULK_DEAL';
  premiumDiscountPct: number;
}

export interface InstitutionalHoldingActivity {
  fiiHoldingPct: number;
  fiiChangeQoq: number;
  diiHoldingPct: number;
  diiChangeQoq: number;
  promoterHoldingPct: number;
  promoterPledgedPct: number;
  publicAndRetailPct: number;
  netFlow1mCr: number;
  netFlow3mCr: number;
  institutionalSentiment: 'HEAVY_ACCUMULATION' | 'MODERATE_ACCUMULATION' | 'STEADY_HOLD' | 'PROFIT_TRIMMING' | 'DISTRIBUTION';
  fiiDiiTrendSummary: string;
}

export interface InsiderTradingDisclosure {
  id: string;
  filingDate: string;
  personName: string;
  designation: string;
  category: 'Promoter Group' | 'Director' | 'KMP' | 'Designated Person';
  transactionType: 'OPEN_MARKET_BUY' | 'OPEN_MARKET_SELL' | 'PLEDGE_CREATION' | 'PLEDGE_REVOCATION' | 'ESOP_ALLOTMENT';
  quantity: number;
  price: number;
  valueCr: number;
  preHoldingPct: number;
  postHoldingPct: number;
  sebiRegulation: 'PIT Reg 7(2)' | 'SAST Reg 29(1)' | 'SAST Reg 29(2)' | 'SAST Reg 31(1)';
  impactSentiment: 'BULLISH_INSIDER_BUY' | 'BEARISH_INSIDER_SELL' | 'NEUTRAL_ESOP' | 'PLEDGE_RELEASE_POSITIVE' | 'PLEDGE_RISK';
  commentary: string;
}

export interface MfHoldingItem {
  ticker: string;
  name: string;
  sector: string;
  weightPct: number;
  holdingValueCr: number;
  mcapCategory: 'GIANT_CAP' | 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP';
  peRatio: number;
  rocePct: number;
  ret1m: number;
  ret1y: number;
  sharesCount: number;
  trend: 'ACCUMULATING' | 'TRIMMING' | 'NEW_ENTRY' | 'UNCHANGED';
  sharesChangePctMoM: number;
}

export interface MfMonthlyShift {
  month: string;
  newBuyingStocks: Array<{
    ticker: string;
    name: string;
    sector: string;
    newWeightPct: number;
    investedCr: number;
    sharesBought: number;
    entryRationale: string;
  }>;
  completeExitStocks: Array<{
    ticker: string;
    name: string;
    sector: string;
    previousWeightPct: number;
    capitalFreedCr: number;
    exitRationale: string;
  }>;
  topAccumulatedStocks: Array<{
    ticker: string;
    name: string;
    sector: string;
    sharesIncreasePct: number;
    currentWeightPct: number;
    valueAddedCr: number;
  }>;
  topTrimmedStocks: Array<{
    ticker: string;
    name: string;
    sector: string;
    sharesDecreasePct: number;
    currentWeightPct: number;
    valueTrimmedCr: number;
  }>;
  totalAumCr: number;
  cashAndArbitragePct: number;
  portfolioTurnoverRatioPct: number;
  managerMacroCommentary: string;
}

export interface MutualFundDeepAudit {
  isMutualFundOrEtf: boolean;
  fundType: string;
  fundHouse: string;
  fundManager: string;
  benchmarkIndex: string;
  aumCr: number;
  expenseRatioPct: number;
  activeSharePct: number;
  cashHoldingPct: number;
  top10HoldingsConcentrationPct: number;
  allHoldings: MfHoldingItem[];
  monthlyShifts: MfMonthlyShift[];
  accumulationVsSellingSummary: {
    totalAccumulatedStocksCount: number;
    totalTrimmedStocksCount: number;
    newEntriesCount: number;
    completeExitsCount: number;
    netEquityInfusionCr: number;
  };
}

export interface InDepthAnalysisResult {
  ticker: string;
  name: string;
  isin: string;
  exchange: string;
  category: string;
  currency: string;
  currentPrice: number;
  change1d: number;
  high52: number;
  low52: number;
  discount52Pct: number;
  marketCapOrAum: string;
  returns: {
    d1: number;
    w1: number;
    m1: number;
    m3: number;
    m6: number;
    y1: number;
  };
  valuation: {
    pe: number;
    industryPe: number;
    pb: number;
    evEbitda: number;
    pegRatio: number;
    dividendYieldPct: number;
    grade: 'DEEP_VALUE' | 'FAIR_VALUE' | 'GROWTH_PREMIUM' | 'OVERVALUED';
  };
  financials: {
    revenueTtm: string;
    revenueGrowthYoy: number;
    netProfitTtm: string;
    profitGrowthYoy: number;
    operatingMarginPct: number;
    netMarginPct: number;
    rocePct: number;
    roePct: number;
    debtToEquity: number;
    interestCoverage: number;
    cfoToEbitdaPct: number;
    freeCashFlow: string;
  };
  businessModel: {
    summary: string;
    monetizationAndUnitEconomics: string;
    customerSegments: string;
  };
  productsAndServices: ProductDetailItem[];
  corporateCatalysts: {
    newExpansions: string[];
    majorContractsAndOrders: string[];
    tradeDealsAndPartnerships: string[];
  };
  highProfitPlaybook: {
    convictionLevel: string;
    estimatedUpsidePct: number;
    idealHoldingPeriod: string;
    executionStrategy: string;
    keyTriggerToWatch: string;
  };
  ipoDetails?: IpoProspectusDetails;
  revenueSegments: RevenueSegment[];
  growthForecasts: GrowthForecast[];
  marginHistory: MarginPeriod[];
  microAnalysis: {
    workingCapitalAndCashCycle: string;
    pricingPowerAndMoat: string;
    governanceAndEncumbrance: string;
    supplyChainAndGeopolitics: string;
  };
  profitLossDeepDive: string;
  futureGrowthCatalysts: string[];
  keyRisks: string[];
  invalidationCriteria: string;
  dcaTranches: {
    tranche1BuyZone: string;
    tranche2BuyZone: string;
    target12Month: string;
    stopLoss: string;
    marginOfSafetyPct: number;
  };
  verdict: VerdictType;
  verdictRationale: string;
  blockDeals?: BlockDealItem[];
  institutionalActivity?: InstitutionalHoldingActivity;
  insiderTrading?: InsiderTradingDisclosure[];
  mutualFundAudit?: MutualFundDeepAudit;
  nextDayTrading?: NextDayTradingForecast;
  futureInvestment?: FutureInvestmentForecast;
}

export interface DailyRadarSnapshot {
  id: string;
  mode: 'morning' | 'evening';
  title: string;
  timestamp: string;
  regimeStatus: string;
  headline: string;
  executiveSummary: string;
  topAccumulatePicks: Array<{ ticker: string; reason: string }>;
  cautionAndAvoid: Array<{ ticker: string; warning: string }>;
  pivotScenarios: {
    baseCase: string;
    bullCase: string;
    bearCase: string;
  };
  actionPlanForToday: string[];
  audioUrl?: string;
}

export interface CustomAssetItem {
  id?: string;
  name: string;
  type: string;
  price: number;
  high52: number;
  low52: number;
  d1: number;
  w1?: number;
  m1: number;
  m3: number;
  m6: number;
  y1: number;
  pe: number;
  roce: number;
  de: number;
  inst: 'PASS_INSTITUTIONAL' | 'PASS_MODERATE' | 'CAUTION_ILLIQUID' | 'FAIL_GOVERNANCE';
  notes: string;
}

export interface IpoRadarItem {
  ticker: string;
  name: string;
  segment: 'MAINBOARD' | 'BSE-SME' | 'NSE-SME';
  window: string;
  priceBand: string;
  impliedMcap: string;
  pe: number;
  roce: number;
  freshVsOfs: string;
  subscription: string;
  verdict: VerdictType;
  summary: string;
}

export interface ContractDetailItem {
  title: string;
  signedDate: string;
  clientOrMinistry: string;
  valueCr?: number;
  executionTimeline?: string;
  details: string;
}

export interface PriceAlertTrigger {
  id: string;
  ticker: string;
  name: string;
  targetPrice: number;
  direction: 'BELOW' | 'ABOVE';
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
  notes?: string;
}

export interface AladdinFactorSensitivity {
  factor: string;
  category: 'MACRO' | 'STYLE' | 'MARKET' | 'CURRENCY';
  loading: number;
  status: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  description: string;
}

export interface AladdinStressScenario {
  id: string;
  title: string;
  shockDescription: string;
  estimatedPortfolioImpactPct: number;
  vulnerableSectors: string[];
  beneficiarySectors: string[];
  actionRecommendation: string;
}

export interface AladdinAlphaOpportunity {
  ticker: string;
  name: string;
  category: AssetCategory;
  signalType: 'DEEP_DIP_VALUE' | 'EARNINGS_RE_RATING' | 'CONTRARIAN_HEDGE';
  currentPrice: number;
  buyZone: string;
  targetPrice: number;
  upsidePct: number;
  aladdinConvictionScore: number;
  whyBuyNow: string;
}

export interface MacroMarketState {
  nifty50: { price: number; change: number; changePct: number; high: number; low: number; tickDir: 'up' | 'down' | 'flat' };
  sensex: { price: number; change: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  nasdaq: { price: number; change: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  sp500: { price: number; change: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  dow: { price: number; change: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  fiiCashCr: number;
  diiCashCr: number;
  netCashBufferCr: number;
  brentCrude: { price: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  usdInr: { price: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  gold: { price: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  silver: { price: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  indiaVix: { price: number; changePct: number; tickDir: 'up' | 'down' | 'flat' };
  pcr: number;
  fiiLsRatio: number;
  lastUpdated: string;
}

export interface AssetTickDelta {
  id: number;
  ticker: string;
  price: number;
  prevPrice: number;
  chg1d: number;
  tickDir: 'up' | 'down' | 'flat';
  timestamp: number;
  bid: number;
  ask: number;
  volumeDelta?: number;
}

export interface MarketSyncStatus {
  isLive: boolean;
  latencyMs: number;
  tickCount: number;
  lastTickIso: string;
  syncMode: 'ULTRA_FAST' | 'HIGH' | 'NORMAL' | 'PAUSED';
  source: 'STREAM_SSE' | 'DIRECT_QUANT_ENGINE';
}
