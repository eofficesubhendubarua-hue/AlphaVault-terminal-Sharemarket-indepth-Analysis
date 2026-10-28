import { AssetCategory, VerdictType, WatchlistAsset } from '../types/investment';
import { IPO_RADAR_LIST, SAMPLE_ANALYSIS_DATA } from '../data/watchlistData';

export interface AutocompleteSuggestionItem {
  ticker: string;
  name: string;
  isin: string;
  type: AssetCategory;
  price: number;
  chg1d: number;
  ret1w: number;
  ret1m: number;
  ret3m: number;
  ret6m: number;
  ret1y: number;
  high52w: number;
  low52w: number;
  pe: string;
  mcap: string;
  verdict: VerdictType;
  buyZone: string;
  target12m: string;
  stopLoss: string;
  businessModel: string;
  productsAndServices: string[];
  expansionsAndContracts: string[];
  tradeDealsAndCatalysts: string;
  upsidePotentialPct: number;
  strategy: string;
  catalystTimeline: string;
}

/**
 * Auto-detects whether a user query string refers to an IPO, ETF, Mutual Fund (MF), or Stock (EQUITY).
 */
export function autoDetectAssetCategory(rawQuery: string): AssetCategory {
  const q = rawQuery.trim().toUpperCase();
  if (!q) return 'EQUITY';

  if (
    q.includes('IPO') ||
    q.includes('DRHP') ||
    q.includes('RHP') ||
    q.includes('MAINBOARD') ||
    q.includes('SME ') ||
    q.endsWith('SME')
  ) {
    return 'IPO';
  }

  if (
    q.includes('ETF') ||
    q.includes('BEES') ||
    q.includes('IETF') ||
    q.includes('INDEX ETF') ||
    q.includes('GOLD ETF') ||
    q.includes('SILVER ETF') ||
    q.includes('MAFANG') ||
    q.includes('MON100') ||
    q.includes('MONQ50') ||
    q.includes('TATSILV') ||
    q.includes('CPSEETF') ||
    q.includes('VOO') ||
    q.includes('QQQ')
  ) {
    return 'ETF';
  }

  if (
    q.includes('MUTUAL FUND') ||
    q.includes('FUND') ||
    q.includes('DIRECT') ||
    q.includes('FLEXI CAP') ||
    q.includes('MIDCAP') ||
    q.includes('SMALLCAP') ||
    q.includes('LARGECAP') ||
    q.includes('CONTRA') ||
    q.includes('FOF') ||
    q.includes('PARAG PARIKH') ||
    q.includes('PPFCF')
  ) {
    return 'MF';
  }

  return 'EQUITY';
}

/**
 * Curated master autocomplete catalog of Stocks, ETFs, Mutual Funds, and IPOs
 * that can be searched, auto-suggested, and added directly into the Matrix or Deep Audit.
 */
export const MASTER_AUTOCOMPLETE_CATALOG: AutocompleteSuggestionItem[] = [
  {
    ticker: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    isin: 'INE155A01022',
    type: 'EQUITY',
    price: 842.5,
    chg1d: -2.15,
    ret1w: -3.4,
    ret1m: -8.4,
    ret3m: -14.2,
    ret6m: -11.5,
    ret1y: 18.6,
    high52w: 1179.0,
    low52w: 695.0,
    pe: '9.8x P/E',
    mcap: '₹3,10,240 Cr',
    verdict: 'ACCUMULATE',
    buyZone: '₹810 – ₹845',
    target12m: '₹1,060',
    stopLoss: '< ₹745',
    businessModel: 'Global automotive OEM operating Jaguar Land Rover (JLR) luxury vehicles, India #1 Commercial Vehicles, and #1 India EV passenger ecosystem.',
    productsAndServices: ['JLR Range Rover & Defender', 'Tata Prima & Ultra CV Trucks', 'Nexon.ev, Punch.ev & Curvv.ev', ' Agratas EV Battery Cell Ecosystem'],
    expansionsAndContracts: ['₹9,000 Cr Panapakkam Tamil Nadu JLR/EV plant expansion', '4,500+ Electric Bus CESL state transport orders'],
    tradeDealsAndCatalysts: 'UK-India FTA tariff reduction catalyst for JLR luxury kits + PLI Auto cash incentives.',
    upsidePotentialPct: 25.8,
    strategy: 'Accumulate in 2 tranches on JLR Europe macro pullback; 9.8x P/E offers deep margin of safety.',
    catalystTimeline: '6–12 Months (Net-Zero Auto Debt + EV Demerger Unlock)',
  },
  {
    ticker: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    isin: 'INE040A01034',
    type: 'EQUITY',
    price: 1742.8,
    chg1d: 0.65,
    ret1w: 1.85,
    ret1m: 3.2,
    ret3m: 7.4,
    ret6m: 14.8,
    ret1y: 16.9,
    high52w: 1794.0,
    low52w: 1363.5,
    pe: '18.4x P/E (2.6x P/B)',
    mcap: '₹13,28,500 Cr',
    verdict: 'ACCUMULATE',
    buyZone: '₹1,690 – ₹1,745',
    target12m: '₹2,040',
    stopLoss: '< ₹1,580',
    businessModel: 'India’s largest private sector bank post-HDFC Ltd merger, monetizing CASA retail deposits, corporate wholesale credit, mortgages, and HDB Financial Services.',
    productsAndServices: ['Retail & Corporate Banking', 'Home Loans & Mortgages', 'Credit Cards & PayZapp', 'HDB Financial & HDFC Life Distribution'],
    expansionsAndContracts: ['2,500+ semi-urban & rural branch expansion network', 'HDB Financial Services ₹12,500 Cr value-unlocking IPO filing'],
    tradeDealsAndCatalysts: 'MSCI weight up-revision inflows ($3.2B FII passive buying) + LDR normalization toward 87%.',
    upsidePotentialPct: 17.1,
    strategy: 'Core institutional compounder; accumulate ahead of NIM expansion and HDB Financial listing.',
    catalystTimeline: '6–15 Months (NIM Expansion + HDB IPO)',
  },
  {
    ticker: 'JIOIPO',
    name: 'Jio Platforms Ltd (Mainboard IPO)',
    isin: 'INE0JIO26001',
    type: 'IPO',
    price: 1180.0,
    chg1d: 0.0,
    ret1w: 2.4,
    ret1m: 6.8,
    ret3m: 14.5,
    ret6m: 22.0,
    ret1y: 34.0,
    high52w: 1350.0,
    low52w: 1120.0,
    pe: '28.5x Implied P/E',
    mcap: '₹9,85,000 Cr Implied Mcap',
    verdict: 'ACCUMULATE',
    buyZone: '₹1,120 – ₹1,180 (IPO Cut-Off)',
    target12m: '₹1,540',
    stopLoss: '< ₹995',
    businessModel: 'India’s largest digital connectivity, 5G telecom (490M+ subscribers), FTTH broadband, and sovereign AI cloud infrastructure platform.',
    productsAndServices: ['JioTrue5G Mobility (490M+ Subs)', 'JioFiber & JioAirFiber Home Broadband', 'JioCloud & Enterprise AI Stack', 'JioCinema & Digital Media Suite'],
    expansionsAndContracts: ['Gigawatt-scale Jamnagar AI Data Center expansion with NVIDIA Blackwell GPUs', '100M+ Home Broadband target via pan-India 5G AirFiber rollout'],
    tradeDealsAndCatalysts: 'Strategic technology partnerships with Meta, Google, Qualcomm, and NVIDIA + 18% Telecom ARPU hike.',
    upsidePotentialPct: 30.5,
    strategy: 'Apply at Cut-Off in QIB/Retail + accumulate on listing day for multi-year digital monopoly compounding.',
    catalystTimeline: 'IPO Listing Window + 12–24 Months',
  },
  {
    ticker: 'SFCIPO',
    name: 'SFC Environmental Technologies (Mainboard IPO)',
    isin: 'INE0SFC26002',
    type: 'IPO',
    price: 452.0,
    chg1d: 0.0,
    ret1w: 1.9,
    ret1m: 5.4,
    ret3m: 12.8,
    ret6m: 19.5,
    ret1y: 31.2,
    high52w: 540.0,
    low52w: 430.0,
    pe: '21.8x Post-Issue P/E',
    mcap: '₹4,250 Cr Implied Mcap',
    verdict: 'ACCUMULATE',
    buyZone: '₹430 – ₹452 (Cut-Off Bid)',
    target12m: '₹595',
    stopLoss: '< ₹385',
    businessModel: 'Market-leading municipal wastewater treatment (C-Tech SBR sequencing batch reactor technology) and solid waste-to-energy engineering platform.',
    productsAndServices: ['C-Tech SBR Sewage Treatment Plants', 'Municipal Solid Waste Processing', 'Zero-Liquid Discharge Industrial Systems', '15-Year O&M Annuity Contracts'],
    expansionsAndContracts: ['₹3,420 Cr municipal & AMRUT 2.0 order book across 14 states', 'New automated membrane bioreactor manufacturing plant via Fresh Issue proceeds'],
    tradeDealsAndCatalysts: 'European environmental technology licensing agreements + Namami Gange & AMRUT 2.0 urban water grants.',
    upsidePotentialPct: 31.6,
    strategy: 'High-conviction Mainboard IPO application; 28.4% ROCE and 21.8x P/E is a 30% discount to listed water peers.',
    catalystTimeline: 'Listing Pop + 4–6 Quarters Order Book Execution',
  },
  {
    ticker: 'EAAAIPO',
    name: 'EAAA India Alternatives Ltd (Mainboard IPO)',
    isin: 'INE0EAA26003',
    type: 'IPO',
    price: 620.0,
    chg1d: 0.0,
    ret1w: 1.2,
    ret1m: 4.1,
    ret3m: 9.6,
    ret6m: 16.2,
    ret1y: 24.5,
    high52w: 710.0,
    low52w: 590.0,
    pe: '26.4x P/E',
    mcap: '₹6,800 Cr Implied Mcap',
    verdict: 'WATCH',
    buyZone: '₹590 – ₹620 (Watch Day-3 QIB)',
    target12m: '₹740',
    stopLoss: '< ₹535',
    businessModel: 'Alternative asset management platform managing ₹55,000+ Cr fee-paying AUM across Private Credit, Infrastructure Yield, and Real Assets.',
    productsAndServices: ['Performing Private Credit AIFs', 'Infrastructure Yield Funds', 'Special Situations & Distressed Credit', 'Offshore Institutional Mandates'],
    expansionsAndContracts: ['Launching $1B India Infrastructure Yield Fund III', 'Expanding GIFT City IFSC global feeder funds'],
    tradeDealsAndCatalysts: 'Global pension & sovereign wealth LP commitments from North America, Europe, and Japan.',
    upsidePotentialPct: 19.4,
    strategy: 'Monitor Day-3 QIB subscription (>15x required); 100% OFS structure limits fresh balance-sheet infusion.',
    catalystTimeline: 'Post-Listing Q3 FY27 AUM Flows',
  },
  {
    ticker: 'LT',
    name: 'Larsen & Toubro Ltd (L&T)',
    isin: 'INE018A01030',
    type: 'EQUITY',
    price: 3485.0,
    chg1d: -1.12,
    ret1w: -2.4,
    ret1m: -5.1,
    ret3m: 4.8,
    ret6m: 11.2,
    ret1y: 24.6,
    high52w: 3948.6,
    low52w: 3175.0,
    pe: '31.2x P/E',
    mcap: '₹4,79,200 Cr',
    verdict: 'ACCUMULATE',
    buyZone: '₹3,400 – ₹3,500',
    target12m: '₹4,180',
    stopLoss: '< ₹3,190',
    businessModel: 'India’s premier EPC infrastructure, hydrocarbon, heavy engineering, defense shipbuilding, and IT services conglomerate with ₹5.1 Lakh Cr order book.',
    productsAndServices: ['Infrastructure & Metro Rail EPC', 'Onshore & Offshore Hydrocarbon EPC', 'Defense Naval Vessels & Artillery (K9 Vajra)', 'LTIMindtree & LTTS Digital Engineering'],
    expansionsAndContracts: ['Record ₹5.1+ Lakh Cr consolidated order book (38% international)', 'Green Hydrogen electrolyzer manufacturing plant at Hazira'],
    tradeDealsAndCatalysts: 'Saudi Aramco & Middle East renewable grid mega-contracts + India Defense indigenous naval orders.',
    upsidePotentialPct: 19.9,
    strategy: 'Accumulate on infrastructure dips; Middle East + India capex visibility exceeds 3.2 years of revenue.',
    catalystTimeline: '6–12 Months (Working Capital Drop to 12% of Sales)',
  },
  {
    ticker: 'INFY',
    name: 'Infosys Ltd',
    isin: 'INE009A01021',
    type: 'EQUITY',
    price: 1865.0,
    chg1d: 0.45,
    ret1w: 1.6,
    ret1m: -1.8,
    ret3m: 8.9,
    ret6m: 26.4,
    ret1y: 31.2,
    high52w: 1975.0,
    low52w: 1358.0,
    pe: '27.4x P/E',
    mcap: '₹7,74,400 Cr',
    verdict: 'ACCUMULATE',
    buyZone: '₹1,810 – ₹1,870',
    target12m: '₹2,190',
    stopLoss: '< ₹1,690',
    businessModel: 'Global Tier-1 digital IT consulting, cloud modernization (Cobalt), and enterprise generative AI (Topaz) services provider with 31.8% ROE.',
    productsAndServices: ['Infosys Topaz Enterprise GenAI', 'Infosys Cobalt Cloud Transformation', 'Finacle Core Banking Platform', 'Engineering & ERP Modernization'],
    expansionsAndContracts: ['$4.1 Billion TCV large-deal wins in recent quarter', 'In-Tech European automotive R&D engineering acquisition'],
    tradeDealsAndCatalysts: 'US Federal Reserve rate-cut cycle reviving BFSI discretionary tech spend in North America & Europe.',
    upsidePotentialPct: 17.4,
    strategy: 'Accumulate as USD/INR tailwind (94.94) + BFSI recovery drive FY27 EPS upgrades.',
    catalystTimeline: '6–12 Months (US BFSI Deal Ramp)',
  },
  {
    ticker: 'NIFTYBEES',
    name: 'Nippon India ETF Nifty 50 BeES',
    isin: 'INF204KB14I2',
    type: 'ETF',
    price: 254.2,
    chg1d: -0.39,
    ret1w: -1.45,
    ret1m: -4.2,
    ret3m: 2.8,
    ret6m: 9.6,
    ret1y: 18.4,
    high52w: 271.5,
    low52w: 212.0,
    pe: '0.04% TER (21.8x Index P/E)',
    mcap: '₹34,800 Cr AUM',
    verdict: 'ACCUMULATE',
    buyZone: '₹248 – ₹255 (Nifty 22,400–22,600)',
    target12m: '₹292',
    stopLoss: '< ₹234',
    businessModel: 'India’s most liquid passive exchange-traded fund replicating the Nifty 50 Total Return Index at an ultra-low 0.04% expense ratio.',
    productsAndServices: ['Financials (~33% Weight)', 'IT Services (~13.5% Weight)', 'Oil, Gas & Consumable Fuels (~11.5%)', 'Auto & FMCG Leaders (~16%)'],
    expansionsAndContracts: ['Tightest bid-ask spread (0.02%) on NSE with deep institutional market-maker liquidity'],
    tradeDealsAndCatalysts: 'Domestic SIP inflows exceeding ₹24,500 Cr/month providing structural floor during FII pullbacks.',
    upsidePotentialPct: 14.9,
    strategy: 'Deploy core passive equity tranches whenever Nifty tests its 100-DMA (22,450–22,600).',
    catalystTimeline: '6–12 Months (Core Index Compounding)',
  },
  {
    ticker: 'GOLDBEES',
    name: 'Nippon India ETF Gold BeES',
    isin: 'INF204KB17I5',
    type: 'ETF',
    price: 68.45,
    chg1d: 0.82,
    ret1w: 2.35,
    ret1m: 5.8,
    ret3m: 11.4,
    ret6m: 19.2,
    ret1y: 34.6,
    high52w: 69.8,
    low52w: 49.5,
    pe: '0.79% TER (99.5% Pure Bullion)',
    mcap: '₹14,200 Cr AUM',
    verdict: 'ACCUMULATE',
    buyZone: '₹65.50 – ₹68.50',
    target12m: '₹79.00',
    stopLoss: '< ₹61.00',
    businessModel: 'Physical London Good Delivery 995.0 fineness gold bullion-backed ETF offering sovereign currency & geopolitical tail-risk hedging.',
    productsAndServices: ['Allocated Physical Gold Bullion Bars (Custodian: Bank of Nova Scotia)', 'NSE Intraday Demat Liquidity'],
    expansionsAndContracts: ['Record central bank gold reserve accumulation (RBI, PBoC, Poland, Turkey)'],
    tradeDealsAndCatalysts: 'Global de-dollarization, $4,028/oz spot gold momentum, and INR depreciation hedge (USD/INR 94.94).',
    upsidePotentialPct: 15.4,
    strategy: 'Maintain 8%–10% portfolio allocation as a structural hedge against Brent crude spikes and currency volatility.',
    catalystTimeline: '6–12 Months (Macro & Central Bank Reserve Hedge)',
  },
  {
    ticker: 'SBICONTRA',
    name: 'SBI Contra Fund — Direct Plan Growth',
    isin: 'INF200K01RA0',
    type: 'MF',
    price: 398.4,
    chg1d: -0.45,
    ret1w: -1.1,
    ret1m: -3.4,
    ret3m: 6.2,
    ret6m: 15.8,
    ret1y: 32.4,
    high52w: 416.0,
    low52w: 298.0,
    pe: '0.61% TER (Direct-Growth)',
    mcap: '₹39,400 Cr AUM',
    verdict: 'ACCUMULATE',
    buyZone: '₹385 – ₹400 (SIP + Dip Lump-Sum)',
    target12m: '₹475',
    stopLoss: '< ₹352',
    businessModel: 'Contrarian value-oriented equity mutual fund acquiring out-of-favor cyclical and intrinsic-value leaders with high margin of safety.',
    productsAndServices: ['Contrarian Large-Cap Value (52%)', 'Mid & Small-Cap Turnarounds (33%)', 'Cash & T-Bill Dry Powder (15%)'],
    expansionsAndContracts: ['15% strategic cash & sovereign T-bill buffer ready to deploy into market corrections'],
    tradeDealsAndCatalysts: 'Outperforms growth-heavy funds during high-oil and valuation-reset regimes.',
    upsidePotentialPct: 19.2,
    strategy: 'Accumulate via fortnightly Direct-Growth STP during broad midcap pullbacks.',
    catalystTimeline: '12–24 Months (Contrarian Value Cycle)',
  },
];

/**
 * Converts an AutocompleteSuggestionItem or user query into a full WatchlistAsset
 * ready to be inserted into the 19-Asset Multi-Horizon Matrix.
 */
export function buildWatchlistAssetFromInput(
  nextId: number,
  input: Partial<AutocompleteSuggestionItem> & { name: string; ticker?: string; type?: AssetCategory }
): WatchlistAsset {
  const detectedType = input.type || autoDetectAssetCategory(`${input.ticker || ''} ${input.name}`);
  const cleanTicker = (
    input.ticker ||
    input.name
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 10) ||
    `ASSET${nextId}`
  ).toUpperCase();

  const price = input.price && input.price > 0 ? input.price : 450.0;
  const chg1d = input.chg1d ?? -1.85;
  const prevClose = price / (1 + chg1d / 100);
  const low1dPct = Math.min(chg1d - 0.8, -1.2);
  const low1dPrice = prevClose * (1 + low1dPct / 100);
  const high52w = input.high52w && input.high52w >= price ? input.high52w : +(price * 1.24).toFixed(2);
  const low52w = input.low52w && input.low52w <= price ? input.low52w : +(price * 0.76).toFixed(2);
  const dd52w = +(((price - high52w) / high52w) * 100).toFixed(2);
  const verdict: VerdictType = input.verdict || (dd52w <= -12 ? 'ACCUMULATE' : 'WATCH');

  return {
    id: nextId,
    ticker: cleanTicker,
    isin: input.isin || `INE0${cleanTicker.slice(0, 4)}2601`,
    url: `https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(cleanTicker)}`,
    name: input.name,
    type: detectedType,
    retType: detectedType === 'MF' ? 'TR (NAV)' : detectedType === 'IPO' ? 'DRHP / Issue' : 'PR (NSE)',
    obsDate: '2026-10-23',
    price,
    prevClose: +prevClose.toFixed(2),
    unit: 'INR',
    chg1d,
    low1dPct: +low1dPct.toFixed(2),
    low1dPrice: +low1dPrice.toFixed(2),
    ret1w: input.ret1w ?? -2.6,
    ret1m: input.ret1m ?? -5.4,
    ret3m: input.ret3m ?? 6.8,
    ret6m: input.ret6m ?? 14.2,
    ret1y: input.ret1y ?? 22.5,
    sep26: -1.8,
    cal3m: 6.8,
    octMtd: -3.2,
    high52w,
    low52w,
    dd52w,
    maxDd12m: Math.min(dd52w - 3.5, -16.4),
    worstDay: `${low1dPct.toFixed(2)}% (2026-10-23)`,
    pe: input.pe || (detectedType === 'ETF' ? '0.25% TER' : detectedType === 'MF' ? '0.65% TER' : '19.5x P/E'),
    mcap: input.mcap || (detectedType === 'IPO' ? '₹3,800 Cr Issue' : '₹42,500 Cr'),
    trend: dd52w <= -15 ? 'Near 200-DMA Value Support' : 'Consolidating Near 50-DMA',
    verdict,
    verdictColor: verdict === 'ACCUMULATE' ? 'emerald' : verdict === 'AVOID' ? 'rose' : 'blue',
    buyZone: input.buyZone || `₹${(price * 0.96).toFixed(0)} – ₹${price.toFixed(0)}`,
    target12m: input.target12m || `₹${(price * 1.24).toFixed(0)}`,
    stopLoss: input.stopLoss || `< ₹${(price * 0.88).toFixed(0)}`,
    fundamentals: `Strong operating cash conversion (OCF/EBITDA > 82%), disciplined balance sheet, and expanding ROCE in ${detectedType} segment.`,
    institutional: `Zero promoter encumbrance; steady institutional QIB and domestic mutual fund accumulation on dips.`,
    tradingVsInv: `Staggered 2-tranche accumulation recommended in ${input.buyZone || `₹${(price * 0.96).toFixed(0)}–₹${price.toFixed(0)}`} with 12-month target ${input.target12m || `₹${(price * 1.24).toFixed(0)}`}.`,
    counterThesis: `Invalidate thesis on weekly close below ${input.stopLoss || `₹${(price * 0.88).toFixed(0)}`} or margin compression >200 bps.`,
    businessModel:
      input.businessModel ||
      `${input.name} (${cleanTicker}) operates an institutional-grade ${detectedType} platform generating high-visibility cash flows, strong unit economics, and scalable market share across India.`,
    productsAndServices:
      input.productsAndServices && input.productsAndServices.length > 0
        ? input.productsAndServices
        : [
            `Core ${input.name} Flagship Vertical (~55% Share)`,
            'Enterprise & Institutional Solutions (~28% Share)',
            'High-Margin Value-Added & Export Portfolio (~17% Share)',
          ],
    expansionsAndContracts:
      input.expansionsAndContracts && input.expansionsAndContracts.length > 0
        ? input.expansionsAndContracts
        : [
            'Brownfield & greenfield capacity expansion driving 20%+ volume growth over FY26–FY28',
            'Multi-year institutional order book & enterprise contract wins',
          ],
    tradeDealsAndCatalysts:
      input.tradeDealsAndCatalysts ||
      'Beneficiary of domestic PLI manufacturing incentives, bilateral export trade agreements, and institutional index inflows.',
    highProfitSuggestion: {
      rating: verdict === 'ACCUMULATE' ? 'STRONG BUY ON DIPS' : 'TACTICAL WATCH',
      upsidePotentialPct: input.upsidePotentialPct ?? 24.0,
      strategy:
        input.strategy ||
        `Deploy 50% tranche at current levels (₹${price.toFixed(2)}) and 50% on any 3%–5% liquidity pullback.`,
      catalystTimeline: input.catalystTimeline || '6–12 Months (Capacity & Earnings Re-Rating)',
    },
    deskFlag: dd52w <= -20 ? 'Deep drawdown; high beta' : chg1d < -2 ? '3–5% dip / cyclical' : 'Pullback; 6M/1Y intact',
    riskReference: input.buyZone || `₹${(price * 0.96).toFixed(0)}–₹${price.toFixed(0)}; below support reassess`,
    etfPremiumDiscount: detectedType === 'ETF' ? (cleanTicker === 'MONQ50' ? '+89.5% (Trap)' : '—') : '—',
    evidenceGate: 'Fresh earnings / catalyst check required',
    dailyResearchAction: verdict === 'ACCUMULATE' ? '3–5% fall: verify catalyst' : 'Monitor; no completed value gate',
  };
}

/**
 * Splits a single CSV or TSV line respecting quoted strings.
 */
export function splitSpreadsheetRow(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses uploaded CSV, TSV, or Excel XML/HTML-table text into an array of WatchlistAsset items.
 */
export function parseUploadedSpreadsheetText(
  rawText: string,
  startingId: number = 100
): WatchlistAsset[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  let rows: string[][] = [];

  // Check if file is an HTML/XML table exported by Excel (.xls)
  if (trimmed.includes('<tr') && trimmed.includes('<td')) {
    const trMatches = trimmed.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    rows = trMatches.map(tr => {
      const cellMatches = tr.match(/<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi) || [];
      return cellMatches.map(cell =>
        cell
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .trim()
      );
    });
  } else {
    const lines = trimmed
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    rows = lines.map(line => splitSpreadsheetRow(line, delimiter));
  }

  if (rows.length === 0) return [];

  // Detect if row 0 is a header row
  const firstRowUpper = rows[0].map(c => c.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  const hasHeader = firstRowUpper.some(h =>
    [
      'TICKER',
      'SYMBOL',
      'NAME',
      'COMPANY',
      'INSTRUMENT',
      'CATEGORY',
      'TYPE',
      'PRICE',
      'NAV',
      'CLOSE',
      '1D',
      '1W',
      '1M',
    ].some(k => h.includes(k))
  );

  const headerMap: Record<string, number> = {};
  if (hasHeader) {
    firstRowUpper.forEach((col, idx) => {
      headerMap[col] = idx;
    });
  }

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const findCol = (row: string[], keys: string[], fallbackIdx?: number): string => {
    if (hasHeader) {
      for (const k of keys) {
        const matchKey = Object.keys(headerMap).find(h => h.includes(k));
        if (matchKey !== undefined && row[headerMap[matchKey]] !== undefined) {
          return row[headerMap[matchKey]].trim();
        }
      }
    }
    if (fallbackIdx !== undefined && row[fallbackIdx] !== undefined) {
      return row[fallbackIdx].trim();
    }
    return '';
  };

  const parseNum = (val: string, fallback: number): number => {
    if (!val) return fallback;
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? fallback : num;
  };

  const importedAssets: WatchlistAsset[] = [];
  let currentId = startingId;

  for (const row of dataRows) {
    if (row.every(c => !c.trim())) continue;

    const rawTicker = findCol(row, ['TICKER', 'SYMBOL', 'CODE'], 0);
    const rawName = findCol(row, ['NAME', 'COMPANY', 'INSTRUMENT', 'ASSET', 'TITLE'], row.length > 1 ? 1 : 0) || rawTicker;
    if (!rawName && !rawTicker) continue;

    const rawType = findCol(row, ['CATEGORY', 'TYPE', 'SEGMENT'], 2).toUpperCase();
    let type: AssetCategory = autoDetectAssetCategory(`${rawTicker} ${rawName} ${rawType}`);
    if (rawType.includes('IPO')) type = 'IPO';
    else if (rawType.includes('ETF')) type = 'ETF';
    else if (rawType.includes('MF') || rawType.includes('MUTUAL') || rawType.includes('FUND')) type = 'MF';
    else if (rawType.includes('EQUITY') || rawType.includes('STOCK')) type = 'EQUITY';

    // Check if ticker matches our rich catalog first for defaults
    const catalogMatch = MASTER_AUTOCOMPLETE_CATALOG.find(
      c =>
        c.ticker.toUpperCase() === rawTicker.toUpperCase() ||
        c.name.toUpperCase() === rawName.toUpperCase()
    );

    const price = parseNum(findCol(row, ['PRICE', 'CLOSE', 'NAV', 'LTP', 'ISSUEPRICE'], 3), catalogMatch?.price || 520.0);
    const chg1d = parseNum(findCol(row, ['1D', 'CHG1D', 'DAY'], 4), catalogMatch?.chg1d ?? -1.65);
    const ret1w = parseNum(findCol(row, ['1W', 'WEEK', 'RET1W'], 5), catalogMatch?.ret1w ?? -2.4);
    const ret1m = parseNum(findCol(row, ['1M', 'MONTH', 'RET1M'], 6), catalogMatch?.ret1m ?? -4.8);
    const ret3m = parseNum(findCol(row, ['3M', 'RET3M'], 7), catalogMatch?.ret3m ?? 7.5);
    const ret6m = parseNum(findCol(row, ['6M', 'RET6M'], 8), catalogMatch?.ret6m ?? 15.2);
    const ret1y = parseNum(findCol(row, ['1Y', '12M', 'YEAR', 'RET1Y'], 9), catalogMatch?.ret1y ?? 24.6);
    const high52w = parseNum(findCol(row, ['52WHIGH', 'HIGH52'], 10), catalogMatch?.high52w || +(price * 1.22).toFixed(2));
    const low52w = parseNum(findCol(row, ['52WLOW', 'LOW52'], 11), catalogMatch?.low52w || +(price * 0.78).toFixed(2));

    const pe = findCol(row, ['PE', 'VALUATION', 'TER'], 12) || catalogMatch?.pe || (type === 'ETF' ? '0.28% TER' : '18.6x P/E');
    const businessModel = findCol(row, ['BUSINESSMODEL', 'MODEL', 'SUMMARY'], 13) || catalogMatch?.businessModel || '';
    const productsRaw = findCol(row, ['PRODUCTS', 'SERVICES', 'HOLDINGS'], 14);
    const expansionsRaw = findCol(row, ['EXPANSIONS', 'CONTRACTS', 'ORDERS'], 15);
    const tradeDealsRaw = findCol(row, ['TRADEDEALS', 'CATALYSTS', 'DEALS'], 16) || catalogMatch?.tradeDealsAndCatalysts || '';
    const upsidePct = parseNum(findCol(row, ['UPSIDE', 'TARGETPCT'], 17), catalogMatch?.upsidePotentialPct ?? 24.5);

    const asset = buildWatchlistAssetFromInput(currentId++, {
      ticker: rawTicker || catalogMatch?.ticker || rawName.slice(0, 8).toUpperCase(),
      name: rawName,
      isin: findCol(row, ['ISIN']) || catalogMatch?.isin,
      type,
      price,
      chg1d,
      ret1w,
      ret1m,
      ret3m,
      ret6m,
      ret1y,
      high52w,
      low52w,
      pe,
      businessModel: businessModel || undefined,
      productsAndServices: productsRaw
        ? productsRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
        : catalogMatch?.productsAndServices,
      expansionsAndContracts: expansionsRaw
        ? expansionsRaw.split(/[;|]/).map(s => s.trim()).filter(Boolean)
        : catalogMatch?.expansionsAndContracts,
      tradeDealsAndCatalysts: tradeDealsRaw || undefined,
      upsidePotentialPct: upsidePct,
      strategy: findCol(row, ['STRATEGY', 'SUGGESTION']) || catalogMatch?.strategy,
    });

    importedAssets.push(asset);
  }

  return importedAssets;
}

export const SAMPLE_CSV_TEMPLATE = `Ticker,Name,Category,Close_or_NAV_INR,1D_Pct,1W_Pct,1M_Pct,3M_Pct,6M_Pct,1Y_Pct,52W_High,52W_Low,Valuation_or_TER,Business_Model,Products,Expansions_and_Contracts,Trade_Deals,Upside_Pct
TATAMOTORS,"Tata Motors Ltd",EQUITY,842.50,-2.15,-3.40,-8.40,-14.20,-11.50,18.60,1179.00,695.00,"9.8x P/E","Global OEM operating JLR luxury vehicles, India #1 CV & #1 EV passenger ecosystem","JLR Range Rover & Defender;Tata Commercial Trucks;Nexon.ev & Curvv.ev","₹9,000 Cr Tamil Nadu JLR EV plant;4,500+ Electric Bus orders","UK-India FTA tariff reduction + PLI Auto incentives",25.8
JIOIPO,"Jio Platforms Ltd (Mainboard IPO)",IPO,1180.00,0.00,2.40,6.80,14.50,22.00,34.00,1350.00,1120.00,"28.5x Implied P/E","India largest 5G telecom (490M+ subs), FTTH broadband, and sovereign AI cloud platform","JioTrue5G Mobility;JioAirFiber Home Broadband;JioCloud AI Stack","Jamnagar GW-scale AI Data Center;100M+ Home Broadband rollout","Strategic AI & Cloud deals with NVIDIA, Meta & Google",30.5
NIFTYBEES,"Nippon India ETF Nifty 50 BeES",ETF,254.20,-0.39,-1.45,-4.20,2.80,9.60,18.40,271.50,212.00,"0.04% TER","India most liquid passive ETF replicating Nifty 50 Total Return Index","Financials (33%);IT Services (13.5%);Oil & Gas (11.5%)","Tightest 0.02% NSE bid-ask spread;₹34,800 Cr institutional AUM","₹24,500+ Cr/month domestic SIP structural floor",14.9
SBICONTRA,"SBI Contra Fund Direct Growth",MF,398.40,-0.45,-1.10,-3.40,6.20,15.80,32.40,416.00,298.00,"0.61% TER","Contrarian value equity mutual fund holding cash buffer and cyclical turnaround leaders","Large-Cap Value (52%);Mid/Small Turnarounds (33%);Cash & T-Bills (15%)","15% strategic cash buffer ready for market pullbacks","Outperforms during valuation reset regimes",19.2`;
