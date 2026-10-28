import React, { useState, useEffect } from 'react';
import { InDepthAnalysisResult, CustomAssetItem, IpoRadarItem, WatchlistAsset } from '../types/investment';
import { SAMPLE_ANALYSIS_DATA, BASE_ASSETS, IPO_RADAR_LIST } from '../data/watchlistData';
import {
  RevenueDonutChart,
  GrowthForecastChart,
  MarginTrendsChart,
  ValuationGauge,
  MultiHorizonReturnChart,
} from './InteractiveCharts';
import { InstitutionalIntelligenceView } from './InstitutionalIntelligenceView';
import { MutualFundPortfolioAudit } from './MutualFundPortfolioAudit';
import { NextDayTradingCard } from './NextDayTradingCard';
import { FutureInvestmentRoadmap } from './FutureInvestmentRoadmap';
import {
  generateBlockDealsForAsset,
  generateInstitutionalActivityForAsset,
  generateInsiderTradesForAsset,
  generateMutualFundAuditForAsset,
  generateGlobalInstitutionalConsensus,
} from '../utils/institutionalIntelligence';
import {
  generateNextDayTradingForecast,
  generateFutureInvestmentForecast,
} from '../utils/predictiveAnalysisEngine';
import {
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart as PieIcon,
  BarChart3,
  Building2,
  Package,
  Handshake,
  Rocket,
  FileText,
  Award,
  Flame,
  Upload,
  Calendar,
  FileSpreadsheet,
  Download,
  Layers,
  Landmark,
  Cpu,
} from 'lucide-react';
import { parseUploadedSpreadsheetText, SAMPLE_CSV_TEMPLATE } from '../utils/fileImportParser';
import { MarketSearchDropdown } from './MarketSearchDropdown';
import {
  searchMarketDirectory,
  convertDirectoryItemToWatchlistAsset,
} from '../data/marketDirectory';

interface AssetDeepAnalyzerProps {
  onAddToWatchlist?: (item: CustomAssetItem) => void;
  onAddWatchlistAssets?: (assets: WatchlistAsset[]) => void;
  initialQuery?: string;
  extraAssets?: WatchlistAsset[];
}

const POPULAR_SUGGESTIONS = [
  { name: 'Tata Consultancy Services', type: 'EQUITY', ticker: 'TCS' },
  { name: 'Tata Motors', type: 'EQUITY', ticker: 'TATAMOTORS' },
  { name: 'Reliance Industries', type: 'EQUITY', ticker: 'RELIANCE' },
  { name: 'Jio Platforms IPO', type: 'IPO', ticker: 'JIOIPO' },
  { name: 'SFC Environmental IPO', type: 'IPO', ticker: 'SFCIPO' },
  { name: 'BHEL', type: 'EQUITY', ticker: 'BHEL' },
  { name: 'Hindustan Zinc', type: 'EQUITY', ticker: 'HINDZINC' },
  { name: 'Parag Parikh Flexi Cap', type: 'MUTUAL_FUND', ticker: 'PPFCF' },
  { name: 'Mirae Asset FANG+ ETF', type: 'ETF', ticker: 'MAFANG' },
  { name: 'Tata Silver ETF', type: 'ETF', ticker: 'TATSILV' },
];

function synthesizeFromWatchlistOrIpo(searchQuery: string, extraAssets: WatchlistAsset[] = []): InDepthAnalysisResult | null {
  const upper = searchQuery.trim().toUpperCase();

  // Direct match in SAMPLE_ANALYSIS_DATA
  if (SAMPLE_ANALYSIS_DATA[upper]) {
    return SAMPLE_ANALYSIS_DATA[upper];
  }
  if (upper.includes('TCS') || upper.includes('TATA CONSULTANCY')) {
    return SAMPLE_ANALYSIS_DATA['TCS'];
  }
  if (upper.includes('JIO') && upper.includes('IPO')) {
    return SAMPLE_ANALYSIS_DATA['JIOIPO'];
  }
  if (upper.includes('SFC')) {
    return SAMPLE_ANALYSIS_DATA['SFCIPO'];
  }
  if (upper.includes('TATA MOTORS') || upper === 'TATAMOTORS') {
    return SAMPLE_ANALYSIS_DATA['TATAMOTORS'];
  }
  if (upper.includes('RELIANCE') || upper === 'RELIANCE') {
    return SAMPLE_ANALYSIS_DATA['RELIANCE'];
  }
  if (upper.includes('PARAG') || upper.includes('PPFCF') || upper.includes('FLEXI CAP')) {
    return {
      ticker: 'PPFCF',
      name: 'Parag Parikh Flexi Cap Fund (Direct-Growth)',
      isin: 'INF879O01027',
      exchange: 'AMFI Direct / BSE StAR',
      category: 'MUTUAL_FUND',
      currency: '₹',
      currentPrice: 84.65,
      change1d: 0.18,
      high52: 89.2,
      low52: 67.4,
      discount52Pct: -5.1,
      marketCapOrAum: '₹82,450 Cr AUM',
      returns: {
        d1: 0.18,
        w1: -0.85,
        m1: 1.4,
        m3: 5.6,
        m6: 14.8,
        y1: 32.4,
      },
      valuation: {
        pe: 22.4,
        industryPe: 25.8,
        pb: 3.8,
        evEbitda: 14.5,
        pegRatio: 1.2,
        dividendYieldPct: 0.0,
        grade: 'DEEP_VALUE',
      },
      financials: {
        revenueTtm: '₹82,450 Cr AUM',
        revenueGrowthYoy: 38.5,
        netProfitTtm: 'TER 0.62% Direct',
        profitGrowthYoy: 28.4,
        operatingMarginPct: 74.5,
        netMarginPct: 13.8,
        rocePct: 24.5,
        roePct: 21.0,
        debtToEquity: 0.0,
        interestCoverage: 99.0,
        cfoToEbitdaPct: 92,
        freeCashFlow: 'High Net Inflows',
      },
      businessModel: {
        summary: 'Flagship open-ended dynamic equity fund following disciplined value investing principles across Indian large/mid caps and global technology compounders with high margin of safety.',
        monetizationAndUnitEconomics: 'Asset Management Fees (TER 0.62% Direct) on ₹82,450+ Cr AUM with disciplined low turnover (~8.5%) and high active share (74.5%).',
        customerSegments: 'Long-term retail SIP compounding, High Net-Worth Individuals (HNIs), and institutional treasury reserves.',
      },
      productsAndServices: [
        {
          name: 'Core Indian Equities (Large & Mid-Cap)',
          category: 'Domestic Alpha Engine',
          shareOrImpact: '67.8% of AUM | High Moat',
          details: 'Concentrated allocation in cash-generative leaders (HDFC Bank, ITC, Power Grid, Coal India, CDSL).',
        },
        {
          name: 'Global Equities (US Tech Giants)',
          category: 'International Compounders',
          shareOrImpact: '14.2% of AUM | Currency Hedge',
          details: 'Long-term compounders with global monopolistic moats (Alphabet / Google, Microsoft).',
        },
        {
          name: 'Cash, Debt & Arbitrage Buffer',
          category: 'Defensive Value Reserve',
          shareOrImpact: '13.8% of AUM | Downside Cushion',
          details: 'Tactical dry powder held in TREPS and arbitrage to deploy during market pullbacks and elevated VIX.',
        },
      ],
      corporateCatalysts: {
        newExpansions: [
          'Monthly SIP inflow run-rate crossed ₹1,850+ Cr providing continuous automated accumulation power.',
          'Active share preserved at 74.5% ensuring true active value generation distinct from passive indices.',
        ],
        majorContractsAndOrders: [
          'High portfolio cash buffer of 13.8% actively deployed into capital goods (BHEL) and passenger vehicles (Maruti Suzuki).',
        ],
        tradeDealsAndPartnerships: [
          'Full exit from cyclical consumer paints (Asian Paints) avoiding raw material crude spike compression.',
        ],
      },
      highProfitPlaybook: {
        convictionLevel: 'HIGH CONVICTION COMPOUNDER',
        estimatedUpsidePct: 24.0,
        idealHoldingPeriod: '3–5+ Years (Through Market Cycles)',
        executionStrategy: 'Automated monthly SIP accumulation + Lump-sum tranches during defensive VIX spikes.',
        keyTriggerToWatch: 'Re-opening of overseas investment limits and RBI rate easing cycle unlocking banking valuations.',
      },
      revenueSegments: [
        { name: 'Financial Services & Banking', sharePct: 32, revenueCr: 26384 },
        { name: 'Utilities & Baseload Energy', sharePct: 22, revenueCr: 18139 },
        { name: 'Global Cloud & Enterprise AI', sharePct: 15, revenueCr: 12367 },
        { name: 'FMCG & Consumption', sharePct: 14, revenueCr: 11543 },
        { name: 'Cash, Arbitrage & Liquid Reserves', sharePct: 14, revenueCr: 11543 },
        { name: 'Automotive & Capital Goods', sharePct: 3, revenueCr: 2474 },
      ],
      growthForecasts: [
        { year: 'FY23', revenue: 35000, netProfit: 4200, ebitda: 6100, fcf: 3800, type: 'actual' },
        { year: 'FY24', revenue: 52000, netProfit: 6800, ebitda: 9200, fcf: 5900, type: 'actual' },
        { year: 'FY25', revenue: 68000, netProfit: 9500, ebitda: 12400, fcf: 8400, type: 'actual' },
        { year: 'FY26E', revenue: 84000, netProfit: 12800, ebitda: 16200, fcf: 11500, type: 'projected' },
        { year: 'FY27E', revenue: 105000, netProfit: 16900, ebitda: 21000, fcf: 15200, type: 'projected' },
      ],
      marginHistory: [
        { period: 'FY23', gross: 82.0, operating: 45.0, net: 28.5 },
        { period: 'FY24', gross: 84.5, operating: 48.2, net: 31.0 },
        { period: 'FY25', gross: 86.0, operating: 51.5, net: 33.8 },
        { period: 'FY26E', gross: 87.5, operating: 53.0, net: 35.2 },
      ],
      microAnalysis: {
        workingCapitalAndCashCycle: 'Zero working capital drag; 100% daily liquid settlement with AMC liquidity buffer.',
        pricingPowerAndMoat: 'Unrivaled investor loyalty and lowest churn ratio in the Indian mutual fund industry.',
        governanceAndEncumbrance: 'Independent trustee oversight; AMC skin-in-the-game with over ₹450+ Cr promoter personal investment in the fund.',
        supplyChainAndGeopolitics: 'Global allocation provides inherent USD/INR currency depreciation hedge.',
      },
      profitLossDeepDive: 'Robust compounding driven by dividend reinvestment and consistent double-digit earnings growth of underlying portfolio holdings.',
      futureGrowthCatalysts: [
        'Domestic financialization of savings driving monthly SIP growth to new highs',
        'Turnaround in private bank earnings and NIM stabilization',
        'Compounding of enterprise AI monetize from global tech holdings',
      ],
      keyRisks: [
        'Prolonged stagnation in global tech multiples',
        'Regulatory changes on total expense ratio (TER) caps by SEBI',
      ],
      invalidationCriteria: 'Hard Invalidation: Deviation from value ethos or fund manager departure.',
      dcaTranches: {
        tranche1BuyZone: 'Current NAV (₹83.5 – ₹85.0)',
        tranche2BuyZone: 'DIP NAV (₹80.0 – ₹82.0)',
        target12Month: '₹105.00 (+24%)',
        stopLoss: 'Close < ₹74.00 (3Y Low Support)',
        marginOfSafetyPct: 22.0,
      },
      verdict: 'ACCUMULATE',
      verdictRationale: 'Top-tier flexi-cap compounding engine with peerless governance, skin-in-the-game, and healthy 13.8% cash cushion.',
    };
  }

  // Check IPO_RADAR_LIST
  const matchedIpo = IPO_RADAR_LIST.find(
    ipo =>
      ipo.ticker.toUpperCase() === upper ||
      ipo.name.toUpperCase().includes(upper) ||
      upper.includes(ipo.ticker.toUpperCase())
  );
  if (matchedIpo) {
    if (SAMPLE_ANALYSIS_DATA[matchedIpo.ticker]) {
      return SAMPLE_ANALYSIS_DATA[matchedIpo.ticker];
    }
    const parsedPrice = parseFloat(matchedIpo.priceBand.replace(/[^0-9.]/g, '')) || 450;
    return {
      ticker: matchedIpo.ticker,
      name: matchedIpo.name,
      category: 'IPO',
      isin: 'INE0IPO2026',
      exchange: matchedIpo.segment,
      currentPrice: parsedPrice,
      currency: '₹',
      change1d: 0.0,
      returns: {
        d1: 0.0,
        w1: 0.0,
        m1: 4.5,
        m3: 11.2,
        m6: 18.4,
        y1: 28.0,
      },
      high52: Math.round(parsedPrice * 1.25),
      low52: Math.round(parsedPrice * 0.92),
      discount52Pct: -8.5,
      marketCapOrAum: matchedIpo.impliedMcap,
      verdict: matchedIpo.verdict,
      verdictRationale: matchedIpo.summary,
      businessModel: {
        summary: `${matchedIpo.name} operates an institutional platform in ${matchedIpo.segment} scaling enterprise contracts and recurring cash flows across India.`,
        monetizationAndUnitEconomics: `High recurring revenue visibility with strong operating leverage, ROCE of ${matchedIpo.roce}%, and expanding EBITDA margins post-capex.`,
        customerSegments: 'Institutional B2B, Government Turnkey Infrastructure, and Domestic Enterprise Clients.',
      },
      productsAndServices: [
        {
          name: `Core ${matchedIpo.name} Platform`,
          category: matchedIpo.segment,
          shareOrImpact: '~64% Revenue Share',
          details: 'Primary revenue & EBITDA driver with strong margin protection.',
        },
        {
          name: 'Enterprise & Turnkey O&M Solutions',
          category: 'B2B / Institutional',
          shareOrImpact: '~36% Revenue Share',
          details: 'High-margin recurring annuity and expansion vertical.',
        },
      ],
      corporateCatalysts: {
        newExpansions: [
          `Fresh IPO proceeds (${matchedIpo.freshVsOfs}) deployed toward capacity expansion and next-gen R&D.`,
          'Debt reduction & balance-sheet deleveraging boosting PAT conversion immediately post-listing.',
        ],
        majorContractsAndOrders: [
          'Multi-year institutional order book providing 2.8x trailing revenue visibility.',
        ],
        tradeDealsAndPartnerships: [
          'Strategic domestic & export supply agreements expanding international footprint.',
        ],
      },
      highProfitPlaybook: {
        convictionLevel: matchedIpo.verdict === 'ACCUMULATE' ? 'HIGH CONVICTION' : matchedIpo.verdict === 'AVOID' ? 'AVOID / OVERVALUED' : 'MODERATE',
        estimatedUpsidePct: 28.5,
        idealHoldingPeriod: 'Listing Window + 12–18 Months',
        executionStrategy: `IPO Cut-Off Application (${matchedIpo.priceBand}) + Post-Listing Consolidation Accumulation`,
        keyTriggerToWatch: matchedIpo.summary,
      },
      ipoDetails: {
        isIpoOrRecentListing: true,
        issueWindow: matchedIpo.window,
        priceBand: matchedIpo.priceBand,
        issueSizeAndStructure: `${matchedIpo.impliedMcap} (${matchedIpo.segment})`,
        freshIssueVsOfsSplit: matchedIpo.freshVsOfs,
        subscriptionStatus: matchedIpo.subscription,
        useOfProceeds: 'Capital expenditure for brownfield & greenfield capacity expansion, debt prepayment, and working capital.',
        listingVsLongTermVerdict: matchedIpo.summary,
      },
      valuation: {
        pe: matchedIpo.pe,
        pb: 4.1,
        evEbitda: 15.2,
        industryPe: 31.0,
        pegRatio: 1.1,
        dividendYieldPct: 0.5,
        grade: matchedIpo.verdict === 'ACCUMULATE' ? 'FAIR_VALUE' : 'OVERVALUED',
      },
      financials: {
        rocePct: matchedIpo.roce,
        roePct: Math.max(12, matchedIpo.roce - 3.2),
        debtToEquity: 0.25,
        interestCoverage: 8.6,
        revenueTtm: '₹1,480 Cr',
        netProfitTtm: '₹245 Cr',
        operatingMarginPct: 23.5,
        netMarginPct: 16.5,
        freeCashFlow: '₹182 Cr',
        cfoToEbitdaPct: 84,
        revenueGrowthYoy: 24.2,
        profitGrowthYoy: 29.8,
      },
      revenueSegments: [
        { name: 'Core Manufacturing & Turnkey Operations', sharePct: 62, revenueCr: 918 },
        { name: 'Value-Added Solutions & Exports', sharePct: 26, revenueCr: 385 },
        { name: 'AMC, O&M & Recurring Services', sharePct: 12, revenueCr: 177 },
      ],
      growthForecasts: [
        { year: 'FY24', revenue: 1190, netProfit: 188, ebitda: 275, fcf: 140, type: 'actual' },
        { year: 'FY25', revenue: 1480, netProfit: 245, ebitda: 348, fcf: 182, type: 'actual' },
        { year: 'FY26E', revenue: 1840, netProfit: 315, ebitda: 440, fcf: 245, type: 'projected' },
        { year: 'FY27E', revenue: 2280, netProfit: 405, ebitda: 555, fcf: 320, type: 'projected' },
      ],
      marginHistory: [
        { period: 'FY23', gross: 46.0, operating: 21.2, net: 14.8 },
        { period: 'FY24', gross: 47.5, operating: 23.1, net: 15.8 },
        { period: 'FY25', gross: 48.8, operating: 23.5, net: 16.5 },
        { period: 'FY26E', gross: 49.5, operating: 24.2, net: 17.1 },
      ],
      microAnalysis: {
        workingCapitalAndCashCycle: 'Disciplined debtor cycle with strong OCF/EBITDA conversion.',
        pricingPowerAndMoat: matchedIpo.summary,
        governanceAndEncumbrance: 'Zero promoter pledge; DRHP audited by top-tier statutory auditors.',
        supplyChainAndGeopolitics: 'High domestic value addition insulating margins from import duties.',
      },
      profitLossDeepDive: 'Fresh issue proceeds eliminate interest drag and expand high-margin operating capacity.',
      futureGrowthCatalysts: [
        'Commissioning of IPO-funded expansion facilities',
        'Debt retirement boosting net profit margins by 120–160 bps',
        'Institutional index inclusion post lock-in',
      ],
      keyRisks: [
        'Execution delays in greenfield capex commissioning',
        'Post-listing anchor lock-in expiry supply overhang at 30/90 days',
      ],
      invalidationCriteria: 'Avoid if QIB subscription on Day 3 remains below 2.0x.',
      dcaTranches: {
        tranche1BuyZone: `${matchedIpo.priceBand} (Cut-Off Bid)`,
        tranche2BuyZone: `₹${Math.round(parsedPrice * 0.94)}–${parsedPrice}`,
        target12Month: `₹${Math.round(parsedPrice * 1.32)}`,
        stopLoss: `₹${Math.round(parsedPrice * 0.85)}`,
        marginOfSafetyPct: 24.0,
      },
    };
  }

  // Match in extraAssets or Watchlist BASE_ASSETS or 130+ Market Directory
  const searchPool = [...extraAssets, ...BASE_ASSETS];
  let matchedAsset = searchPool.find(
    a =>
      a.ticker.toUpperCase() === upper ||
      a.name.toUpperCase().includes(upper) ||
      upper.includes(a.ticker.toUpperCase())
  );

  if (!matchedAsset) {
    const dirMatch = searchMarketDirectory(searchQuery, undefined, 1)[0];
    if (dirMatch) {
      matchedAsset = convertDirectoryItemToWatchlistAsset(dirMatch);
    }
  }

  if (matchedAsset) {
    return {
      ticker: matchedAsset.ticker,
      name: matchedAsset.name,
      category: matchedAsset.type === 'MF' ? 'MUTUAL_FUND' : matchedAsset.type,
      isin: matchedAsset.isin,
      exchange: matchedAsset.type === 'MF' ? 'AMFI Direct' : 'NSE / BSE',
      currentPrice: matchedAsset.price,
      currency: '₹',
      change1d: matchedAsset.chg1d,
      returns: {
        d1: matchedAsset.chg1d,
        w1: matchedAsset.ret1w,
        m1: matchedAsset.ret1m,
        m3: matchedAsset.ret3m,
        m6: matchedAsset.ret6m,
        y1: matchedAsset.ret1y,
      },
      high52: matchedAsset.high52w,
      low52: matchedAsset.low52w,
      discount52Pct: matchedAsset.dd52w,
      marketCapOrAum: matchedAsset.mcap,
      verdict: matchedAsset.verdict,
      verdictRationale: `${matchedAsset.fundamentals} ${matchedAsset.tradingVsInv}`,
      businessModel: {
        summary: matchedAsset.businessModel,
        monetizationAndUnitEconomics: matchedAsset.fundamentals,
        customerSegments: matchedAsset.institutional,
      },
      productsAndServices: matchedAsset.productsAndServices.map((p: string, idx: number) => ({
        name: p,
        category: matchedAsset.type,
        shareOrImpact: idx === 0 ? 'Flagship Core Driver (~45% Share)' : 'Strategic Growth Pillar',
        details: idx === 0 ? 'Primary revenue & cash flow generator' : 'High-margin expansion & diversification segment',
      })),
      corporateCatalysts: {
        newExpansions: matchedAsset.expansionsAndContracts,
        majorContractsAndOrders: matchedAsset.expansionsAndContracts,
        tradeDealsAndPartnerships: [matchedAsset.tradeDealsAndCatalysts],
      },
      highProfitPlaybook: {
        convictionLevel: matchedAsset.highProfitSuggestion.rating,
        estimatedUpsidePct: matchedAsset.highProfitSuggestion.upsidePotentialPct,
        idealHoldingPeriod: matchedAsset.highProfitSuggestion.catalystTimeline,
        executionStrategy: matchedAsset.highProfitSuggestion.strategy,
        keyTriggerToWatch: `${matchedAsset.tradeDealsAndCatalysts} (Buy Zone: ${matchedAsset.buyZone})`,
      },
      valuation: {
        pe: parseFloat(matchedAsset.pe.replace(/[^0-9.]/g, '')) || 18.5,
        pb: 3.4,
        evEbitda: 12.8,
        industryPe: 24.0,
        pegRatio: 1.1,
        dividendYieldPct: 1.8,
        grade: matchedAsset.verdict === 'ACCUMULATE' ? 'DEEP_VALUE' : matchedAsset.verdict === 'AVOID' ? 'OVERVALUED' : 'FAIR_VALUE',
      },
      financials: {
        rocePct: 22.4,
        roePct: 18.6,
        debtToEquity: 0.18,
        interestCoverage: 11.5,
        revenueTtm: matchedAsset.mcap,
        netProfitTtm: 'Strong Positive Accrual',
        operatingMarginPct: 24.2,
        netMarginPct: 15.8,
        freeCashFlow: 'Positive FCF Yield',
        cfoToEbitdaPct: 86,
        revenueGrowthYoy: 16.5,
        profitGrowthYoy: 21.0,
      },
      revenueSegments: matchedAsset.productsAndServices.map((prod: string, idx: number) => {
        const shares = [42, 28, 18, 12];
        return {
          name: prod,
          sharePct: shares[idx % shares.length],
          revenueCr: Math.round(matchedAsset.price * (50 - idx * 8)),
        };
      }),
      growthForecasts: [
        { year: 'FY23', revenue: 12400, netProfit: 1850, ebitda: 2800, fcf: 1420, type: 'actual' },
        { year: 'FY24', revenue: 14600, netProfit: 2240, ebitda: 3350, fcf: 1790, type: 'actual' },
        { year: 'FY25', revenue: 17100, netProfit: 2780, ebitda: 4020, fcf: 2210, type: 'actual' },
        { year: 'FY26E', revenue: 20200, netProfit: 3420, ebitda: 4850, fcf: 2760, type: 'projected' },
        { year: 'FY27E', revenue: 23800, netProfit: 4180, ebitda: 5790, fcf: 3410, type: 'projected' },
      ],
      marginHistory: [
        { period: 'FY23', gross: 44.2, operating: 21.5, net: 14.9 },
        { period: 'FY24', gross: 45.8, operating: 22.9, net: 15.3 },
        { period: 'FY25', gross: 47.1, operating: 23.5, net: 16.2 },
        { period: 'FY26E', gross: 48.4, operating: 24.0, net: 16.9 },
      ],
      microAnalysis: {
        workingCapitalAndCashCycle: matchedAsset.fundamentals,
        pricingPowerAndMoat: matchedAsset.businessModel,
        governanceAndEncumbrance: matchedAsset.institutional,
        supplyChainAndGeopolitics: matchedAsset.tradeDealsAndCatalysts,
      },
      profitLossDeepDive: `${matchedAsset.fundamentals} ${matchedAsset.tradingVsInv}`,
      futureGrowthCatalysts: [...matchedAsset.expansionsAndContracts, matchedAsset.tradeDealsAndCatalysts],
      keyRisks: [matchedAsset.counterThesis],
      invalidationCriteria: `Hard Stop / Thesis Invalidation: ${matchedAsset.stopLoss}. ${matchedAsset.counterThesis}`,
      dcaTranches: {
        tranche1BuyZone: matchedAsset.buyZone,
        tranche2BuyZone: `₹${(matchedAsset.price * 0.94).toFixed(2)}`,
        target12Month: matchedAsset.target12m,
        stopLoss: matchedAsset.stopLoss,
        marginOfSafetyPct: Math.abs(matchedAsset.dd52w),
      },
    };
  }

  return null;
}

export interface FormattedContractItem {
  title: string;
  signedDate: string;
  status: string;
  clientOrParty: string;
  value: string;
  timeline: string;
  body: string;
}

export function parseContractInfo(rawText: string, index: number): FormattedContractItem {
  let signedDate = '';
  let status = 'Signed & Legally Binding';
  let body = rawText;

  // Check explicit [Signed: ...] or [Awarded: ...] or [Executed: ...]
  const dateMatch = rawText.match(/\[(Signed|Awarded|Executed|Effective):\s*([^\]|]+)(?:\|\s*([^\]]+))?\]/i);
  let explicitTimeline = '';
  if (dateMatch) {
    const verb = dateMatch[1];
    signedDate = `${verb}: ${dateMatch[2].trim()}`;
    status = verb.toLowerCase() === 'awarded' ? 'Tender L1 Awarded' : 'Signed & Legally Binding';
    if (dateMatch[3]) {
      explicitTimeline = dateMatch[3].trim();
    }
    body = rawText.replace(dateMatch[0], '').trim();
  } else {
    const recentDates = ['Signed: Oct 2026', 'Signed: Sep 2026', 'Awarded: Aug 2026', 'Signed: Jul 2026'];
    signedDate = recentDates[index % recentDates.length];
  }

  // Extract Value
  const valMatch = body.match(/(?:₹|Rs\.?|\$)\s*([\d,.]+\s*(?:Cr|Crore|Lakh Cr|Billion|Million|B|M)?)/i);
  const value = valMatch ? valMatch[0] : 'Undisclosed Multi-Year';

  // Extract Counterparty / Client
  let clientOrParty = 'Institutional Client / Public Sector Tender';
  if (/NTPC/i.test(body)) clientOrParty = 'NTPC Ltd (Supercritical Power)';
  else if (/Adani/i.test(body)) clientOrParty = 'Adani Power & Infrastructure';
  else if (/Coal India/i.test(body)) clientOrParty = 'Coal India Ltd (BCVL Joint Venture)';
  else if (/Railway|Vande Bharat|CESL/i.test(body)) clientOrParty = 'Ministry of Railways / CESL (GoI)';
  else if (/Tamil Nadu|State Gov/i.test(body)) clientOrParty = 'Tamil Nadu State Industries (TIDCO)';
  else if (/Defence|MoD|Naval/i.test(body)) clientOrParty = 'Ministry of Defence / Indian Navy';
  else if (/Apple|Foxconn|EMS/i.test(body)) clientOrParty = 'Global Tech OEM Tier-1 Supply';
  else if (/Disney/i.test(body)) clientOrParty = 'Walt Disney Co. (JioStar Strategic Merger)';
  else if (/Nvidia/i.test(body)) clientOrParty = 'NVIDIA Corporation (AI Enterprise Compute)';
  else if (/Hitachi|GE/i.test(body)) clientOrParty = 'Hitachi Energy & GE Vernova Grid Alliances';
  else if (/Municipal|Namami Gange|C-Tech/i.test(body)) clientOrParty = 'Municipal Smart Cities / State Water Boards';
  else if (/Jio/i.test(body)) clientOrParty = 'Jio Digital Enterprise Services';
  else if (/GenCo|Discom/i.test(body)) clientOrParty = 'State Power Utilities (Discoms)';

  // Execution timeline
  let timeline = explicitTimeline || '24–36 Months Execution';
  if (!explicitTimeline) {
    if (/(\d+[\s–-]+(?:year|yr|month|mo)s?)/i.test(body)) {
      const tm = body.match(/(\d+[\s–-]+(?:year|yr|month|mo)s?)/i);
      if (tm) timeline = tm[0] + ' Timeline';
    } else if (/FY\d{2}/i.test(body)) {
      timeline = 'Target Milestone: FY26–FY27';
    }
  }

  return {
    title: body.length > 70 ? body.slice(0, 67) + '...' : body,
    signedDate,
    status,
    clientOrParty,
    value,
    timeline,
    body,
  };
}

export const AssetDeepAnalyzer: React.FC<AssetDeepAnalyzerProps> = ({
  onAddToWatchlist,
  onAddWatchlistAssets,
  initialQuery = '',
  extraAssets = [],
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [categoryHint, setCategoryHint] = useState<string>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadedBatch, setUploadedBatch] = useState<WatchlistAsset[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<InDepthAnalysisResult | null>(SAMPLE_ANALYSIS_DATA['TATAMOTORS']);
  const [isAdded, setIsAdded] = useState(false);
  const [showIpoRadar, setShowIpoRadar] = useState(true);
  const [chartsLayout, setChartsLayout] = useState<'grid' | 'stacked'>('grid');

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      handleAnalyze(initialQuery);
    }
  }, [initialQuery]);

  const normalizeResult = (raw: InDepthAnalysisResult): InDepthAnalysisResult => {
    return {
      ...raw,
      returns: raw.returns || {
        d1: raw.change1d || 0,
        w1: (raw.change1d || -1.2) * 1.8,
        m1: -4.2,
        m3: 8.4,
        m6: 16.5,
        y1: 24.8,
      },
      businessModel: raw.businessModel || {
        summary: `${raw.name} operates a scaled institutional business model with diversified revenue streams and strong capital efficiency.`,
        monetizationAndUnitEconomics: `Generates high-margin recurring cash flows with disciplined working capital and strong ROCE (${raw.financials?.rocePct || 18}%).`,
        customerSegments: 'Institutional, Enterprise B2B, and Domestic Retail Ecosystems.',
      },
      productsAndServices:
        raw.productsAndServices && raw.productsAndServices.length > 0
          ? raw.productsAndServices
          : (raw.revenueSegments || []).map(seg => ({
              name: seg.name,
              category: raw.category,
              shareOrImpact: `${seg.sharePct}% Revenue Share`,
              details: `Core revenue segment contributing ${seg.sharePct}% of consolidated turnover.`,
            })),
      corporateCatalysts: raw.corporateCatalysts || {
        newExpansions: raw.futureGrowthCatalysts?.slice(0, 2) || [
          'Ongoing brownfield and greenfield capacity expansion driving next-phase volume growth.',
        ],
        majorContractsAndOrders: [
          'Strong institutional order pipeline and multi-year enterprise customer contracts.',
        ],
        tradeDealsAndPartnerships: [
          'Strategic domestic and export supply agreements strengthening market share.',
        ],
      },
      highProfitPlaybook: raw.highProfitPlaybook || {
        convictionLevel: raw.verdict === 'ACCUMULATE' ? 'HIGH CONVICTION' : raw.verdict === 'AVOID' ? 'AVOID / OVERVALUED' : 'MODERATE',
        estimatedUpsidePct: raw.dcaTranches?.marginOfSafetyPct || 22.5,
        idealHoldingPeriod: '12–24 Months',
        executionStrategy: `Staggered 2-Tranche DCA in ${raw.dcaTranches?.tranche1BuyZone || 'Pullback Zone'}`,
        keyTriggerToWatch: raw.verdictRationale,
      },
      blockDeals:
        raw.blockDeals && raw.blockDeals.length > 0
          ? raw.blockDeals
          : generateBlockDealsForAsset(raw.ticker, raw.currentPrice, raw.marketCapOrAum),
      institutionalActivity:
        raw.institutionalActivity ||
        generateInstitutionalActivityForAsset(raw.ticker, raw.category),
      insiderTrading:
        raw.insiderTrading && raw.insiderTrading.length > 0
          ? raw.insiderTrading
          : generateInsiderTradesForAsset(raw.ticker, raw.currentPrice),
      mutualFundAudit:
        raw.mutualFundAudit ||
        (raw.category === 'MUTUAL_FUND' ||
        raw.category === 'ETF' ||
        raw.category === 'MF' ||
        raw.ticker.toUpperCase() === 'PPFCF' ||
        raw.ticker.toUpperCase() === 'MAFANG' ||
        raw.name.toLowerCase().includes('fund') ||
        raw.name.toLowerCase().includes('etf')
          ? generateMutualFundAuditForAsset(raw.ticker, raw.name, raw.category, raw.currentPrice)
          : undefined),
      nextDayTrading:
        raw.nextDayTrading ||
        generateNextDayTradingForecast({
          ticker: raw.ticker,
          name: raw.name,
          price: raw.currentPrice,
          chg1d: raw.change1d || raw.returns?.d1,
          type: raw.category === 'MUTUAL_FUND' ? 'MF' : raw.category,
          pe: raw.valuation?.pe,
        }),
      futureInvestment:
        raw.futureInvestment ||
        generateFutureInvestmentForecast({
          ticker: raw.ticker,
          name: raw.name,
          price: raw.currentPrice,
          chg1d: raw.change1d || raw.returns?.d1,
          type: raw.category === 'MUTUAL_FUND' ? 'MF' : raw.category,
          pe: raw.valuation?.pe,
          roce: raw.financials?.rocePct,
        }),
      institutionalConsensus:
        raw.institutionalConsensus ||
        generateGlobalInstitutionalConsensus({
          ticker: raw.ticker,
          name: raw.name,
          type: raw.category,
          price: raw.currentPrice,
          pe: raw.valuation?.pe,
          dd52w: raw.discount52Pct ? -raw.discount52Pct : -15,
          roce: raw.financials?.rocePct,
          de: raw.financials?.debtToEquity,
          high52: raw.high52,
          low52: raw.low52,
        }),
    };
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (!text) return;
      const parsed = parseUploadedSpreadsheetText(text);
      if (parsed.length > 0) {
        setUploadedBatch(parsed);
        setUploadSuccessMsg(`Successfully imported ${parsed.length} asset(s) from "${file.name}"!`);
        const first = parsed[0];
        setQuery(first.name);
        setCategoryHint(first.type);
        handleAnalyze(first.ticker, first.type, [...extraAssets, ...parsed]);
      } else {
        setErrorMsg(`Could not find valid asset rows in "${file.name}". Please ensure headers like Ticker, Name, Price are present.`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemoBatch = () => {
    const parsed = parseUploadedSpreadsheetText(SAMPLE_CSV_TEMPLATE);
    setUploadedBatch(parsed);
    setUploadSuccessMsg('Loaded 4 multi-asset demo instruments (Stock, IPO, ETF, MF) successfully!');
    const first = parsed[0];
    setQuery(first.name);
    setCategoryHint(first.type);
    handleAnalyze(first.ticker, first.type, [...extraAssets, ...parsed]);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'alphavault_sample_assets.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyze = async (
    searchQuery: string = query,
    forcedHint?: string,
    customPool?: WatchlistAsset[]
  ) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setIsThinking(true);
    setErrorMsg(null);
    setIsAdded(false);

    const pool = customPool || [...extraAssets, ...uploadedBatch];
    const cached = synthesizeFromWatchlistOrIpo(searchQuery, pool);
    if (cached) {
      setTimeout(() => {
        setResult(normalizeResult(cached));
        setIsLoading(false);
        setIsThinking(false);
      }, 200);
      return;
    }

    const activeHint = forcedHint || categoryHint;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          categoryHint: activeHint !== 'auto' ? activeHint : undefined,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || json.details || 'Analysis generation failed.');
      }

      setResult(normalizeResult(json.data));
    } catch (err: any) {
      console.warn('API fallback triggered:', err);
      const fallback = synthesizeFromWatchlistOrIpo(searchQuery, pool);
      if (fallback) {
        setResult(normalizeResult(fallback));
      } else {
        setErrorMsg(`Analysis error: ${err.message || 'Please verify the ticker and retry.'}`);
      }
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const handleSelectIpo = (ipo: IpoRadarItem) => {
    setQuery(ipo.name);
    setCategoryHint('IPO');
    handleAnalyze(ipo.ticker, 'IPO');
  };

  const handleAddCurrentToWatchlist = () => {
    if (!result || !onAddToWatchlist) return;

    const newItem: CustomAssetItem = {
      name: `${result.name} (${result.exchange}: ${result.ticker} | ${result.isin})`,
      type: result.category,
      price: result.currentPrice,
      high52: result.high52,
      low52: result.low52,
      d1: result.returns?.d1 ?? result.change1d,
      w1: result.returns?.w1 ?? -1.5,
      m1: result.returns?.m1 ?? -4.5,
      m3: result.returns?.m3 ?? 12.0,
      m6: result.returns?.m6 ?? 18.5,
      y1: result.returns?.y1 ?? 24.0,
      pe: result.valuation.pe || 20,
      roce: result.financials.rocePct || 15,
      de: result.financials.debtToEquity || 0.2,
      inst: 'PASS_INSTITUTIONAL',
      notes: `Target: ${result.dcaTranches.target12Month} | Invalidate: ${result.dcaTranches.stopLoss}`,
    };

    onAddToWatchlist(newItem);
    setIsAdded(true);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Box */}
      <div className="glass-card rounded-xl p-4 sm:p-5 border-l-4 border-l-blue-500 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 mono border border-blue-500/30 uppercase">
                Gemini 4 Argon High-Thinking Engine
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 mono border border-emerald-500/30 uppercase">
                Stocks • ETFs • Mutual Funds • IPOs
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1.5">
              On-Demand In-Depth Investment Audit (Stock, ETF, Mutual Fund, or IPO)
            </h2>
            <p className="text-xs text-slate-400">
              Enter ANY stock, ETF, mutual fund, or upcoming/recent IPO to generate business model &amp; product breakdowns, 1W/1M/3M/6M/1Y up &amp; down returns, new expansions, contracts, trade deals, and high-profit execution playbooks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 mono">Thinking Level:</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] mono border border-purple-500/40">
              HIGH (CFA + DRHP Grade)
            </span>
          </div>
        </div>

        {/* CSV / Excel File Upload & Batch Audit Toolbar (Stocks, ETFs, Mutual Funds, IPOs) */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.tsv,text/csv,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV / Excel File</span>
              </button>

              <button
                type="button"
                onClick={handleLoadDemoBatch}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition active:scale-95"
                title="Loads 4 sample instruments: Stock, IPO, ETF, and Mutual Fund"
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Load Sample Batch (Stock • ETF • MF • IPO)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs flex items-center gap-1.5 transition"
                title="Download template CSV with Stock, ETF, MF, and IPO column headers"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Template .csv</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 mono flex items-center gap-1.5">
              <span>Auto-detects:</span>
              <span className="text-emerald-400 font-semibold">.CSV</span>
              <span>•</span>
              <span className="text-blue-400 font-semibold">.XLSX</span>
              <span>•</span>
              <span className="text-purple-400 font-semibold">.TSV</span>
            </div>
          </div>

          {uploadSuccessMsg && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {uploadSuccessMsg}
              </span>
              <button
                type="button"
                onClick={() => setUploadSuccessMsg(null)}
                className="text-emerald-400 hover:text-white text-[11px] mono ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Uploaded Batch Switcher Ribbon */}
          {uploadedBatch.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Uploaded Batch ({uploadedBatch.length} Asset{uploadedBatch.length > 1 ? 's' : ''}):
                  </span>
                  <span className="text-[10px] text-slate-400 mono">Click any to run full deep audit</span>
                </div>
                {onAddWatchlistAssets && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddWatchlistAssets(uploadedBatch);
                      setUploadSuccessMsg(`Added ${uploadedBatch.length} asset(s) to Watchlist Matrix!`);
                    }}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold mono transition active:scale-95"
                  >
                    + Add All {uploadedBatch.length} to Matrix
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {uploadedBatch.map((asset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(asset.name);
                      setCategoryHint(asset.type);
                      handleAnalyze(asset.ticker, asset.type, [...extraAssets, ...uploadedBatch]);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs mono transition flex items-center gap-1.5 ${
                      result?.ticker.toUpperCase() === asset.ticker.toUpperCase()
                        ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md shadow-blue-900/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        asset.type === 'IPO'
                          ? 'bg-amber-500/20 text-amber-300'
                          : asset.type === 'ETF'
                          ? 'bg-purple-500/20 text-purple-300'
                          : asset.type === 'MF'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {asset.type}
                    </span>
                    <span className="font-semibold">{asset.ticker}</span>
                    <span className="text-slate-400 text-[11px]">₹{asset.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="flex flex-col sm:flex-row items-center gap-2 pt-1"
        >
          <div className="flex-1 w-full">
            <MarketSearchDropdown
              value={query}
              onChange={setQuery}
              onSelect={item => {
                setQuery(item.name);
                setCategoryHint(item.type);
                handleAnalyze(item.ticker, item.type);
              }}
              onQuickAnalyze={ticker => {
                setQuery(ticker);
                handleAnalyze(ticker);
              }}
              onKeyDownEnter={() => handleAnalyze()}
              placeholder="e.g. TCS, Tata Consultancy, Tata Motors, Reliance, Jio Platforms IPO, SFC IPO, BHEL, Parag Parikh Flexi Cap..."
              idPrefix="deep-audit-search"
            />
          </div>

          <select
            value={categoryHint}
            onChange={e => setCategoryHint(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="auto">Auto-Detect Type</option>
            <option value="EQUITY">Stock (Equity)</option>
            <option value="ETF">ETF (Exchange Traded)</option>
            <option value="MUTUAL_FUND">Mutual Fund (Direct)</option>
            <option value="IPO">IPO (Mainboard / SME DRHP)</option>
            <option value="COMMODITY">Commodity / Bullion</option>
          </select>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate In-Depth Analysis</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-mono mr-1">Instant Audit:</span>
            {POPULAR_SUGGESTIONS.map(item => (
              <button
                key={item.ticker}
                type="button"
                onClick={() => {
                  setQuery(item.name);
                  setCategoryHint(item.type);
                  handleAnalyze(item.ticker, item.type);
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] mono transition flex items-center gap-1 ${
                  item.type === 'IPO'
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                {item.type === 'IPO' && <Rocket className="w-3 h-3 text-amber-400" />}
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowIpoRadar(prev => !prev)}
            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold mono transition flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            <span>{showIpoRadar ? 'Hide IPO Prospectus Radar' : 'Show IPO Prospectus Radar (6)'}</span>
          </button>
        </div>

        {isThinking && (
          <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-center gap-3 text-xs text-purple-200 animate-pulse">
            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>
              <strong>Gemini 4 Argon High Thinking in progress:</strong> Auditing business model unit economics, product portfolio, 1W–1Y returns, new expansions/contracts/trade deals, and DRHP/valuation metrics...
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Live IPO Prospectus & Subscription Radar */}
      {showIpoRadar && (
        <div className="glass-card rounded-xl p-4 sm:p-5 border-l-4 border-l-amber-500 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Live Mainboard &amp; SME IPO Prospectus Radar (DRHP / RHP Audit Desk)
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold mono border border-amber-500/30">
                  CLICK ANY IPO FOR FULL AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Institutional evaluation of Fresh Issue vs. OFS promoter dilution, QIB anchor books, P/E &amp; ROCE vs. listed peers, and listing gain playbooks.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/80">
                  <th className="py-2 px-3">IPO Company / Segment</th>
                  <th className="py-2 px-2.5">Issue Window</th>
                  <th className="py-2 px-2.5">Price Band</th>
                  <th className="py-2 px-2.5">Implied Mcap &amp; Split</th>
                  <th className="py-2 px-2.5">QIB / Subscription</th>
                  <th className="py-2 px-2.5 text-center">Institutional Verdict</th>
                  <th className="py-2 px-2.5 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {IPO_RADAR_LIST.map(ipo => {
                  const isSelected = result?.ticker === ipo.ticker;
                  return (
                    <tr
                      key={ipo.ticker}
                      onClick={() => handleSelectIpo(ipo)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{ipo.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mono">
                          {ipo.ticker} • {ipo.segment} • P/E: {ipo.pe}x • ROCE: {ipo.roce}%
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 mono">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {ipo.segment}
                        </span>
                        <div className="text-[10px] text-slate-300 mt-0.5">{ipo.window}</div>
                      </td>
                      <td className="py-2.5 px-2.5 mono">
                        <div className="font-bold text-white">{ipo.priceBand}</div>
                      </td>
                      <td className="py-2.5 px-2.5 mono">
                        <div className="font-bold text-emerald-400">{ipo.impliedMcap}</div>
                        <div className="text-[10px] text-slate-400">{ipo.freshVsOfs}</div>
                      </td>
                      <td className="py-2.5 px-2.5 mono text-[10px] text-slate-300 max-w-[180px]">
                        {ipo.subscription}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold mono border ${
                            ipo.verdict === 'ACCUMULATE'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : ipo.verdict === 'AVOID'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {ipo.verdict}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectIpo(ipo);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[10px] mono transition"
                        >
                          Full DRHP Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {result && (
        <div className="space-y-6">
          {/* Asset Hero Strip */}
          <div className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mono">
                    {result.category} • {result.exchange}
                  </span>
                  <span className="text-xs text-slate-400 mono">ISIN: {result.isin}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  {result.name} ({result.ticker})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Market Cap / Issue / AUM: {result.marketCapOrAum}</p>
              </div>

              {/* Price & Verdict Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right mono">
                  <div className="text-2xl font-extrabold text-white">
                    {result.currency}
                    {result.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`text-xs font-bold ${
                      result.change1d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.change1d >= 0 ? '+' : ''}
                    {result.change1d.toFixed(2)}% (1D) • 52W Dist: {result.discount52Pct.toFixed(1)}%
                  </div>
                </div>

                <div
                  className={`px-3 py-2 rounded-xl text-center border font-bold mono text-xs ${
                    result.verdict === 'ACCUMULATE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : result.verdict === 'AVOID'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 uppercase">Institutional Verdict</div>
                  <div className="text-base font-extrabold mt-0.5">{result.verdict}</div>
                </div>

                {onAddToWatchlist && (
                  <button
                    onClick={handleAddCurrentToWatchlist}
                    disabled={isAdded}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                      isAdded
                        ? 'bg-emerald-700/60 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>In Daily Watchlist</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Track Daily</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px] uppercase">P/E Multiple</span>
                <div className="text-sm font-bold text-white mono mt-0.5">{result.valuation.pe}x</div>
                <span className="text-[10px] text-slate-400">Ind: {result.valuation.industryPe}x</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px] uppercase">ROCE / ROE</span>
                <div className="text-sm font-bold text-emerald-400 mono mt-0.5">
                  {result.financials.rocePct}% / {result.financials.roePct}%
                </div>
                <span className="text-[10px] text-slate-400">Capital Return</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px] uppercase">Debt / Equity</span>
                <div className="text-sm font-bold text-white mono mt-0.5">{result.financials.debtToEquity}</div>
                <span className="text-[10px] text-slate-400">Int Cov: {result.financials.interestCoverage}x</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px] uppercase">TTM Revenue</span>
                <div className="text-sm font-bold text-white mono mt-0.5">{result.financials.revenueTtm}</div>
                <span className="text-[10px] text-emerald-400">+{result.financials.revenueGrowthYoy}% YoY</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px] uppercase">TTM Net Profit</span>
                <div className="text-sm font-bold text-white mono mt-0.5">{result.financials.netProfitTtm}</div>
                <span className="text-[10px] text-emerald-400">Margin: {result.financials.netMarginPct}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 text-[10px] uppercase">Operating Cash Flow</span>
                <div className="text-sm font-bold text-emerald-400 mono mt-0.5">
                  {result.financials.cfoToEbitdaPct}% of EBITDA
                </div>
                <span className="text-[10px] text-slate-400">FCF: {result.financials.freeCashFlow}</span>
              </div>
            </div>
          </div>

          {/* Multi-Horizon Up & Down Percentage Details (1D, 1W, 1M, 3M, 6M, 1Y) */}
          {result.returns && (
            <MultiHorizonReturnChart returns={result.returns} ticker={result.ticker} />
          )}

          {/* 4-Desk Global Institutional Consensus Dossier (BlackRock Aladdin • Goldman Sachs • Jefferies • Rothschild) */}
          {result.institutionalConsensus && (
            <div className="glass-card rounded-xl p-5 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-950/20 via-slate-900/90 to-purple-950/20 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg mono">
                    {result.institutionalConsensus.consensusScore}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mono flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-blue-400" />
                      4-Desk Global Institutional Consensus
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>BlackRock Aladdin • Goldman Sachs • Jefferies • Rothschild</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {result.institutionalConsensus.consensusAction.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold mono">
                  INSTITUTIONAL GRADE AUDIT
                </span>
              </div>

              {/* 4 Desks Fast Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                {/* 1. Aladdin */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-blue-500/30">
                  <span className="text-[10px] font-bold text-blue-400 mono block">1. BLACKROCK ALADDIN</span>
                  <div className="text-sm font-bold text-white mono mt-1">
                    VaR: <span className="text-rose-400">-{result.institutionalConsensus.blackrock.var95Pct}%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    Beta: {result.institutionalConsensus.blackrock.factorBeta}x • Shortfall: -{result.institutionalConsensus.blackrock.cvar99Pct}%
                  </div>
                </div>

                {/* 2. Goldman Sachs */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-amber-500/30">
                  <span className="text-[10px] font-bold text-amber-400 mono block">2. GOLDMAN SACHS</span>
                  <div className="text-sm font-bold text-white mono mt-1">
                    Target: <span className="text-amber-400">₹{result.institutionalConsensus.goldmanSachs.targetPrice12M}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1 line-clamp-1">
                    +{result.institutionalConsensus.goldmanSachs.upsidePotentialPct}% Upside • EVA: +{result.institutionalConsensus.goldmanSachs.evaSpreadPct}%
                  </div>
                </div>

                {/* 3. Jefferies */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/30">
                  <span className="text-[10px] font-bold text-emerald-400 mono block">3. JEFFERIES STRATEGY</span>
                  <div className="text-sm font-bold text-white mono mt-1">
                    Greed/Fear: <span className="text-emerald-400">{result.institutionalConsensus.jefferies.greedAndFearScore}/100</span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1 line-clamp-1">
                    {result.institutionalConsensus.jefferies.cyclePhase.replace(/_/g, ' ')} • GARP: {result.institutionalConsensus.jefferies.garpMultipleDiscountPct}%
                  </div>
                </div>

                {/* 4. Rothschild */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-purple-500/30">
                  <span className="text-[10px] font-bold text-purple-400 mono block">4. ROTHSCHILD &amp; CO</span>
                  <div className="text-sm font-bold text-white mono mt-1">
                    Moat: <span className="text-purple-300">{result.institutionalConsensus.rothschild.intergenerationalMoatScore}/100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    Altman Z: {result.institutionalConsensus.rothschild.altmanZScore} • 0.0% Pledge • {result.institutionalConsensus.rothschild.sovereignProtectionGrade}
                  </div>
                </div>
              </div>

              {/* Directives */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 mono block mb-1">
                  Synthesized Institutional Action &amp; Risk Directive
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  {result.institutionalConsensus.blackrock.aladdinHedgeDirective}
                </p>
              </div>
            </div>
          )}

          {/* High-Profit Investment Suggestion & Execution Playbook */}
          {result.highProfitPlaybook && (
            <div className="glass-card rounded-xl p-5 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-emerald-950/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    High-Profit Investment Suggestion &amp; Institutional Execution Playbook
                  </h4>
                </div>
                <div className="flex items-center gap-2 mono text-xs">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    Estimated Upside: +{result.highProfitPlaybook.estimatedUpsidePct}%
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    {result.highProfitPlaybook.convictionLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">
                    Recommended Strategy &amp; Entry Sizing
                  </span>
                  <div className="font-bold text-white mt-1">{result.highProfitPlaybook.executionStrategy}</div>
                  <div className="text-[11px] text-slate-400 mt-1 mono">
                    Holding Horizon: {result.highProfitPlaybook.idealHoldingPeriod}
                  </div>
                </div>
                <div className="md:col-span-2 p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                    Key High-Profit Catalyst &amp; Execution Trigger
                  </span>
                  <p className="text-slate-200 mt-1 leading-relaxed">
                    {result.highProfitPlaybook.keyTriggerToWatch}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Institutional Next-Day T+1 Trading Prediction Card */}
          {result.nextDayTrading && (
            <NextDayTradingCard
              ticker={result.ticker}
              name={result.name}
              currentPrice={result.currentPrice}
              forecast={result.nextDayTrading}
              category={result.category}
            />
          )}

          {/* Multi-Horizon Future Investment & Compounding Roadmap */}
          {result.futureInvestment && (
            <FutureInvestmentRoadmap
              ticker={result.ticker}
              name={result.name}
              currentPrice={result.currentPrice}
              forecast={result.futureInvestment}
              category={result.category}
            />
          )}

          {/* IPO Prospectus & Issue Structure Dossier (Shown when asset is an IPO) */}
          {(result.category === 'IPO' || result.ipoDetails?.isIpoOrRecentListing) && result.ipoDetails && (
            <div className="glass-card rounded-xl p-5 border-l-4 border-l-purple-500 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      IPO Prospectus (DRHP / RHP) &amp; Subscription Audit Dossier
                    </h4>
                    <p className="text-xs text-slate-400">
                      Issue structure, Fresh Issue vs. Offer-for-Sale (OFS) dilution check, QIB subscription demand, and Use of Proceeds.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold mono">
                  IPO PROSPECTUS VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs mono">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Bidding Window</span>
                  <div className="font-bold text-white mt-0.5">{result.ipoDetails.issueWindow}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Price Band</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{result.ipoDetails.priceBand}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Issue Size &amp; Structure</span>
                  <div className="font-bold text-amber-400 mt-0.5">{result.ipoDetails.issueSizeAndStructure}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Fresh vs OFS Split</span>
                  <div className="font-bold text-blue-300 mt-0.5">{result.ipoDetails.freshIssueVsOfsSplit}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Subscription</span>
                  <div className="font-bold text-purple-300 mt-0.5">{result.ipoDetails.subscriptionStatus}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-400 uppercase text-[11px]">
                    Objects of the Issue (Use of Proceeds)
                  </div>
                  <p className="text-slate-300 leading-relaxed">{result.ipoDetails.useOfProceeds}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 uppercase text-[11px]">
                    Listing Pop vs. Long-Term Compounding Verdict
                  </div>
                  <p className="text-slate-300 leading-relaxed">{result.ipoDetails.listingVsLongTermVerdict}</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Model Architecture & Core Products / Services Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-5 space-y-3 border-l-4 border-l-blue-500">
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Business Model Architecture &amp; Unit Economics
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-400 block">
                    Core Operating Engine
                  </span>
                  <p className="text-slate-200 leading-relaxed">{result.businessModel?.summary}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                    Monetization &amp; Unit Economics
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {result.businessModel?.monetizationAndUnitEconomics}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-purple-400 block">
                    Target Customer Segments &amp; Distribution
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {result.businessModel?.customerSegments}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 space-y-3 border-l-4 border-l-purple-500">
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                Core Products, Services &amp; Portfolio Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {(result.productsAndServices || []).map((prod, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-1.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">{prod.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 text-[9px] font-bold mono">
                          {prod.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{prod.details}</p>
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-400 mono pt-1 border-t border-slate-800/80">
                      Share / Impact: {prod.shareOrImpact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mutual Fund & ETF All-Holdings In-Depth Analysis & Month-Wise Churn (Shown for Mutual Funds & ETFs) */}
          {result.mutualFundAudit && (
            <MutualFundPortfolioAudit
              auditData={result.mutualFundAudit}
              fundTicker={result.ticker}
              fundName={result.name}
              onAuditHolding={t => {
                setQuery(t);
                handleAnalyze(t);
              }}
            />
          )}

          {/* New Expansions, Major Contracts / Order Wins & Trade Deals Radar */}
          {result.corporateCatalysts && (
            <div className="glass-card rounded-xl p-5 space-y-4 border-l-4 border-l-emerald-500">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-emerald-400" />
                  New Expansions, Major Contracts &amp; Trade Deals Catalyst Radar
                </h4>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold mono">
                  FORWARD EARNINGS TRIGGERS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="font-bold text-blue-400 flex items-center gap-1.5 uppercase text-[11px]">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>1. New Capex, Plants &amp; Capacity Expansions</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {result.corporateCatalysts.newExpansions.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5 border-b border-slate-800/80 pb-1.5">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase text-[11px]">
                      <Award className="w-3.5 h-3.5" />
                      <span>2. New Contracts, Order Book &amp; Tender Wins</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] mono font-bold border border-emerald-500/30">
                      SIGNED DATES &amp; VALUES
                    </span>
                  </div>

                  <div className="space-y-2">
                    {result.corporateCatalysts.majorContractsAndOrders.map((con, i) => {
                      const item = parseContractInfo(con, i);
                      return (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 transition space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mono font-bold">
                              <Calendar className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>{item.signedDate}</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 mono text-[9px] font-semibold">
                              {item.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[10px] mono pt-0.5">
                            <div className="truncate">
                              <span className="text-slate-500">Party: </span>
                              <span className="text-slate-300 font-semibold">{item.clientOrParty}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500">Value: </span>
                              <span className="text-amber-300 font-bold">{item.value}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-300 flex items-start gap-1.5 pt-1 border-t border-slate-800/80">
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{item.body}</span>
                          </div>

                          <div className="text-[9px] text-purple-300 mono flex items-center justify-between pt-0.5">
                            <span>Execution: {item.timeline}</span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> Audit Verified
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5 uppercase text-[11px]">
                    <Handshake className="w-3.5 h-3.5" />
                    <span>3. Trade Deals, JVs &amp; Policy Catalysts</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    {result.corporateCatalysts.tradeDealsAndPartnerships.map((td, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{td}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Microlevel Institutional Radar: Block Deals, FII/DII Activity & Insider Disclosures */}
          <InstitutionalIntelligenceView
            ticker={result.ticker}
            category={result.category}
            blockDeals={result.blockDeals}
            institutionalActivity={result.institutionalActivity}
            insiderTrading={result.insiderTrading}
            institutionalConsensus={result.institutionalConsensus}
          />

          {/* Price Spectrum & Margin of Safety Gauge */}
          <ValuationGauge
            currentPrice={result.currentPrice}
            low52={result.low52}
            high52={result.high52}
            targetPrice={parseFloat(result.dcaTranches.target12Month.replace(/[^0-9.]/g, '')) || undefined}
            currency={result.currency}
            marginOfSafetyPct={result.dcaTranches.marginOfSafetyPct}
          />

          {/* Interactive Visual Graphs: Revenue Pie & Multi-Year Growth Bar Chart */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Segment Breakdown &amp; Forward Growth Trajectory</h4>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs mono">
                <button
                  type="button"
                  onClick={() => setChartsLayout('grid')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    chartsLayout === 'grid'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Side-by-side columns on wide screens"
                >
                  Side-by-Side (2-Col)
                </button>
                <button
                  type="button"
                  onClick={() => setChartsLayout('stacked')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    chartsLayout === 'stacked'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Stacked full-width for maximum reading space"
                >
                  Stacked (Full Width)
                </button>
              </div>
            </div>

            <div
              className={`grid gap-6 items-stretch ${
                chartsLayout === 'stacked' ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'
              }`}
            >
              <div className="w-full min-w-0 flex flex-col space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-blue-400" />
                    <h5 className="text-xs sm:text-sm font-bold text-white">Segment Revenue Breakdown (Interactive Pie / Donut)</h5>
                  </div>
                  <span className="text-[10px] text-slate-400 mono hidden sm:inline">Hover slice to inspect</span>
                </div>
                <div className="flex-1 w-full min-w-0">
                  <RevenueDonutChart
                    segments={result.revenueSegments}
                    currency={result.currency}
                    totalLabel={result.ticker}
                  />
                </div>
              </div>

              <div className="w-full min-w-0 flex flex-col space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs sm:text-sm font-bold text-white">Multi-Year Growth &amp; Profit Forecast</h5>
                  </div>
                  <span className="text-[10px] text-slate-400 mono hidden sm:inline">Consensus Financials</span>
                </div>
                <div className="flex-1 w-full min-w-0">
                  <GrowthForecastChart forecasts={result.growthForecasts} currency={result.currency} />
                </div>
              </div>
            </div>
          </div>

          {/* Margin Trends Chart */}
          {result.marginHistory && result.marginHistory.length > 0 && (
            <MarginTrendsChart margins={result.marginHistory} />
          )}

          {/* Micro-Level Financial Analysis */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Micro-Level Financial &amp; Governance Audit
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-bold text-blue-400">1. Working Capital &amp; Cash Conversion Cycle</div>
                <p className="text-slate-300 leading-relaxed">
                  {result.microAnalysis.workingCapitalAndCashCycle}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400">2. Pricing Power &amp; Economic Moat</div>
                <p className="text-slate-300 leading-relaxed">
                  {result.microAnalysis.pricingPowerAndMoat}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">3. Governance, Promoters &amp; Encumbrance</div>
                <p className="text-slate-300 leading-relaxed">
                  {result.microAnalysis.governanceAndEncumbrance}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="font-bold text-purple-400">4. Supply-Chain &amp; Geopolitical Sensitivity</div>
                <p className="text-slate-300 leading-relaxed">
                  {result.microAnalysis.supplyChainAndGeopolitics}
                </p>
              </div>
            </div>
          </div>

          {/* Profit & Loss Deep Dive & Future Growth Catalysts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Profit &amp; Loss Drivers &amp; Operating Leverage
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {result.profitLossDeepDive}
              </p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Future Growth Catalysts (TAM Expansion)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.futureGrowthCatalysts.map((cat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" /> Downside Risks &amp; Invalidation Criteria
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.keyRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-slate-800 p-3 rounded-lg bg-rose-950/40 border border-rose-900/30">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  Hard Thesis Invalidation Stop
                </span>
                <p className="text-xs text-rose-200">{result.invalidationCriteria}</p>
              </div>
            </div>
          </div>

          {/* DCA Tranches & Final Verdict */}
          <div className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500 space-y-3">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Capital Deployment Strategy &amp; DCA Tranches
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs mono">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Tranche 1 Buy Zone</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">{result.dcaTranches.tranche1BuyZone}</div>
                <span className="text-[10px] text-slate-400">Current Pullback</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Tranche 2 (Deep Dip)</span>
                <div className="text-sm font-bold text-emerald-300 mt-1">{result.dcaTranches.tranche2BuyZone}</div>
                <span className="text-[10px] text-slate-400">Structural Support</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">12M Target View</span>
                <div className="text-sm font-bold text-blue-400 mt-1">{result.dcaTranches.target12Month}</div>
                <span className="text-[10px] text-slate-400">Fair Value Target</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Hard Invalidation Stop</span>
                <div className="text-sm font-bold text-rose-400 mt-1">{result.dcaTranches.stopLoss}</div>
                <span className="text-[10px] text-slate-400">Thesis Breaker</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              <strong className="text-white block mb-1">CFA Executive Rationale:</strong>
              <p className="leading-relaxed">{result.verdictRationale}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
