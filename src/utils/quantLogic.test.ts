import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normCDF,
  normPDF,
  computeBSMGreeks,
  compute5GatekeeperScore,
  calculateCagr,
  formatSignedPct,
} from './quantLogic';

test('normCDF computes standard normal cumulative distribution', () => {
  const atZero = normCDF(0);
  assert.ok(Math.abs(atZero - 0.5) < 0.001);
  const atTwo = normCDF(2);
  assert.ok(atTwo > 0.97 && atTwo < 0.98);
});

test('computeBSMGreeks calculates ATM straddle and delta correctly', () => {
  const res = computeBSMGreeks(22600, 22600, 15.81, 4, 0.0675);
  // ATM Call Delta should be approximately ~0.50-0.52
  assert.ok(res.callDelta > 0.48 && res.callDelta < 0.55);
  // Put Delta = Call Delta - 1 (should be negative ~-0.45 to -0.52)
  assert.ok(res.putDelta < 0 && res.putDelta > -0.55);
  // Straddle price must be positive
  assert.ok(res.straddle > 100);
  // Gamma must be positive
  assert.ok(res.gamma > 0);
  // 1-SD daily move should be approximately S * iv / sqrt(252)
  assert.ok(res.move1D > 200 && res.move1D < 250);
});

test('compute5GatekeeperScore grades high-quality value stocks as ACCUMULATE', () => {
  const soundStock = {
    name: 'Coal India Ltd',
    type: 'EQUITY',
    price: 397.45,
    high52: 491.25,
    low52: 369.6,
    d1: -1.27,
    m1: -4.16,
    m3: -7.22,
    m6: -10.51,
    y1: 1.22,
    pe: 7.85,
    roce: 35.0,
    de: 0.05,
    inst: 'PASS_INSTITUTIONAL' as const,
    notes: 'Net-cash sovereign PSU',
  };

  const result = compute5GatekeeperScore(soundStock);
  assert.ok(result.score >= 70, `Score was ${result.score}`);
  assert.ok(result.signal.includes('ACCUMULATE'));
});

test('compute5GatekeeperScore flags governance risk as AVOID', () => {
  const riskyStock = {
    name: 'Speculative Penny Corp',
    type: 'EQUITY',
    price: 25.0,
    high52: 120.0,
    low52: 18.0,
    d1: -6.5,
    m1: -35.0,
    m3: -50.0,
    m6: -60.0,
    y1: -70.0,
    pe: 140.0,
    roce: 2.5,
    de: 3.4,
    inst: 'FAIL_GOVERNANCE' as const,
    notes: 'High pledge, promoter debt distress',
  };

  const result = compute5GatekeeperScore(riskyStock);
  assert.ok(result.score < 50, `Score was ${result.score}`);
  assert.ok(result.signal.includes('AVOID'));
});

test('calculateCagr calculates annual compounding correctly', () => {
  // 100 to 144 over 2 years is exactly 20%
  const cagr = calculateCagr(100, 144, 2);
  assert.ok(Math.abs(cagr - 20) < 0.01);
});

test('formatSignedPct outputs correct prefix', () => {
  assert.equal(formatSignedPct(5.2), '+5.20%');
  assert.equal(formatSignedPct(-3.45), '-3.45%');
  assert.equal(formatSignedPct(0), '0.00%');
});

test('autoDetectAssetCategory and parseUploadedSpreadsheetText parse Stocks, ETFs, MFs, and IPOs', async () => {
  const { autoDetectAssetCategory, parseUploadedSpreadsheetText, SAMPLE_CSV_TEMPLATE } = await import('./fileImportParser');
  assert.equal(autoDetectAssetCategory('Jio Platforms IPO'), 'IPO');
  assert.equal(autoDetectAssetCategory('Nippon Nifty 50 BeES ETF'), 'ETF');
  assert.equal(autoDetectAssetCategory('Parag Parikh Flexi Cap Direct Fund'), 'MF');
  assert.equal(autoDetectAssetCategory('Tata Motors Ltd'), 'EQUITY');

  const parsed = parseUploadedSpreadsheetText(SAMPLE_CSV_TEMPLATE, 20);
  assert.equal(parsed.length, 4);
  assert.equal(parsed[0].ticker, 'TATAMOTORS');
  assert.equal(parsed[0].type, 'EQUITY');
  assert.equal(parsed[1].ticker, 'JIOIPO');
  assert.equal(parsed[1].type, 'IPO');
  assert.equal(parsed[2].type, 'ETF');
  assert.equal(parsed[3].type, 'MF');
});

test('Argon-4 Autopilot flags MONQ50 as CRITICAL_AVOID_EXIT due to iNAV arbitrage premium freeze', async () => {
  const { evaluateAssetAgainstArgonRules } = await import('./argonAutopilotEngine');
  const monq50Asset: any = {
    id: 10,
    ticker: 'MONQ50',
    name: 'Motilal Oswal Nasdaq 50 ETF',
    type: 'ETF',
    price: 221.5,
    high52w: 230.0,
    pe: '0.0',
    chg1d: 0.5,
    verdict: 'AVOID',
    fundamentals: 'Trades at 89.5% premium to underlying iNAV of ₹116.90 due to RBI overseas investment quota limits.',
    highProfitSuggestion: { upsidePotentialPct: 0 },
  };

  const signal = evaluateAssetAgainstArgonRules(monq50Asset);
  assert.ok(signal !== null);
  assert.equal(signal?.ruleId, 'INAV_ARBITRAGE');
  assert.equal(signal?.severity, 'CRITICAL_AVOID_EXIT');
  assert.ok(signal?.triggerCondition.includes('premium'));
});

test('Argon-4 Autopilot triggers HIGH_CONVICTION_BUY on quality stocks in value dip zone', async () => {
  const { evaluateAssetAgainstArgonRules } = await import('./argonAutopilotEngine');
  const bhelAsset: any = {
    id: 1,
    ticker: 'BHEL',
    name: 'Bharat Heavy Electricals Ltd',
    type: 'EQUITY',
    price: 384.2,
    high52w: 520.0,
    pe: '24.5',
    chg1d: -3.2,
    ret1m: -8.5,
    verdict: 'ACCUMULATE',
    fundamentals: 'Power capex turnaround leader with ₹1.4L Cr order backlog.',
    highProfitSuggestion: { upsidePotentialPct: 35 },
  };

  const signal = evaluateAssetAgainstArgonRules(bhelAsset);
  assert.ok(signal !== null);
  assert.equal(signal?.ruleId, 'VALUATION_DIP');
  assert.equal(signal?.severity, 'HIGH_CONVICTION_BUY');
  assert.ok(signal?.entryLimit > 0 && signal?.entryLimit < 384.2);
  assert.ok(signal?.targetPrice > 384.2);
  assert.ok(signal?.stopLoss < 384.2);
  assert.ok(signal?.marginOfSafetyPct > 15);
});

test('Argon-4 Autopilot deploys Aladdin macro hedge into Bullion when Brent Crude surges > $110', async () => {
  const { evaluateAssetAgainstArgonRules } = await import('./argonAutopilotEngine');
  const goldAsset: any = {
    id: 9,
    ticker: 'TATAGOLD',
    name: 'Tata Gold ETF',
    type: 'ETF',
    price: 104.5,
    high52w: 110.0,
    pe: '0.0',
    chg1d: 0.8,
    verdict: 'ACCUMULATE',
    fundamentals: 'Physical gold backed institutional hedge',
    highProfitSuggestion: { upsidePotentialPct: 22 },
  };

  const signal = evaluateAssetAgainstArgonRules(goldAsset, {
    brentCrude: 115.76,
    indiaVix: 15.81,
    fiiNetShort: true,
    niftyPrice: 22600,
    niftyChg1d: -0.39,
  });

  assert.ok(signal !== null);
  assert.equal(signal?.ruleId, 'ALADDIN_HEDGE');
  assert.equal(signal?.severity, 'HEDGE_ALLOCATE');
});

test('runArgonAutopilotScan correctly sorts signals and calculates summary', async () => {
  const { runArgonAutopilotScan, DEFAULT_MACRO_STATE } = await import('./argonAutopilotEngine');
  const { BASE_ASSETS } = await import('../data/watchlistData');

  const result = runArgonAutopilotScan(BASE_ASSETS, DEFAULT_MACRO_STATE);
  assert.ok(result.signals.length > 0);
  assert.ok(result.summary.includes('Argon-4 Scan Complete'));
  // Ensure sorted by margin of safety descending
  for (let i = 0; i < result.signals.length - 1; i++) {
    assert.ok(result.signals[i].marginOfSafetyPct >= result.signals[i + 1].marginOfSafetyPct);
  }
});

test('desk helpers return exact reference values from user screenshots', async () => {
  const {
    getRiskAwareAccumulationRef,
    getDeskFlag,
    getEtfPremiumDiscount,
    getEvidenceGate,
    getDailyResearchAction,
  } = await import('./quantLogic');

  // Test BHEL matching image 1 & 2
  assert.equal(getRiskAwareAccumulationRef({ ticker: 'BHEL', price: 387.5 }), '₹378–386; below Fri low reassess');
  assert.equal(getDeskFlag({ ticker: 'BHEL', chg1d: -2.86, dd52w: -16.49 }), 'Pullback; 6M/1Y intact');
  assert.equal(getEtfPremiumDiscount({ ticker: 'BHEL', type: 'EQUITY' }), '—');
  assert.equal(getEvidenceGate({ ticker: 'BHEL' }), 'Fresh earnings / catalyst check required');
  assert.equal(getDailyResearchAction({ ticker: 'BHEL', chg1d: -2.86, dd52w: -16.49 }), 'Monitor; no completed value gate');

  // Test MONQ50 matching image 2
  assert.equal(getEtfPremiumDiscount({ ticker: 'MONQ50', type: 'ETF' }), '+89.5%');
  assert.equal(getEvidenceGate({ ticker: 'MONQ50' }), 'Exceeds 5% iNAV tolerance band');
  assert.equal(getDailyResearchAction({ ticker: 'MONQ50', chg1d: -0.39, dd52w: -53.1 }), 'Strict Avoid; Quota freeze trap');

  // Test HINDCOPPER matching image 1 & 2
  assert.equal(getRiskAwareAccumulationRef({ ticker: 'HINDCOPPER', price: 399.05 }), '₹392–402; LME and earnings gate');
  assert.equal(getDeskFlag({ ticker: 'HINDCOPPER', chg1d: -3.27, dd52w: -47.5 }), 'Deep drawdown; high beta');
  assert.equal(getDailyResearchAction({ ticker: 'HINDCOPPER', chg1d: -3.27, dd52w: -47.5 }), '3–5% fall: verify catalyst');
});

test('searchMarketDirectory suggests TCS when user types "tata consultancy"', async () => {
  const { searchMarketDirectory, convertDirectoryItemToWatchlistAsset } = await import('../data/marketDirectory.js');

  // Test 1: User types "tata consultancy" -> TCS must be first result
  const results = searchMarketDirectory('tata consultancy');
  assert.ok(results.length > 0, 'Should return matching results for tata consultancy');
  assert.equal(results[0].ticker, 'TCS', 'First result for "tata consultancy" must be TCS');
  assert.equal(results[0].name, 'Tata Consultancy Services Ltd');
  assert.equal(results[0].type, 'EQUITY');

  // Test 2: User types "tata" -> should return multiple Tata group assets (TCS, Tata Motors, Tata Power, etc.)
  const tataResults = searchMarketDirectory('tata');
  const tickers = tataResults.map(r => r.ticker);
  assert.ok(tickers.includes('TCS'), 'Tata results must contain TCS');
  assert.ok(tickers.includes('TATAMOTORS'), 'Tata results must contain TATAMOTORS');
  assert.ok(tickers.includes('TATAPOWER'), 'Tata results must contain TATAPOWER');

  // Test 3: User filters by ETF or Mutual Fund
  const etfResults = searchMarketDirectory('tata', 'ETF');
  assert.ok(etfResults.every(r => r.type === 'ETF'), 'Filtered results must only contain ETFs');

  // Test 4: Convert to WatchlistAsset
  const converted = convertDirectoryItemToWatchlistAsset(results[0]);
  assert.equal(converted.ticker, 'TCS');
  assert.equal(converted.name, 'Tata Consultancy Services Ltd');
  assert.equal(converted.price, 3980.5);
  assert.ok(converted.riskReference?.includes('₹3,920–3,980'));
  assert.ok(converted.deskFlag?.includes('Tier-1 IT compounder'));
});

test('searchMarketDirectory suggests PICC and PIIND when user types "picc"', async () => {
  const { searchMarketDirectory, convertDirectoryItemToWatchlistAsset } = await import(
    '../data/marketDirectory'
  );

  const piccResults = searchMarketDirectory('picc');
  assert.ok(piccResults.length >= 2, 'Should find at least 2 results for "picc"');

  const tickers = piccResults.map(r => r.ticker);
  assert.ok(tickers.includes('PICC'), 'Must include PICC');
  assert.ok(tickers.includes('PIIND'), 'Must include PI Industries (PIIND)');

  // Convert PICC to WatchlistAsset
  const piccItem = piccResults.find(r => r.ticker === 'PICC')!;
  const piccAsset = convertDirectoryItemToWatchlistAsset(piccItem);
  assert.equal(piccAsset.ticker, 'PICC');
  assert.equal(piccAsset.type, 'EQUITY');
});

test('institutionalIntelligence generates valid block deals, FII/DII activity, and insider trades', async () => {
  const {
    generateBlockDealsForAsset,
    generateInstitutionalActivityForAsset,
    generateInsiderTradesForAsset,
  } = await import('./institutionalIntelligence');

  // Test Block Deals for TCS
  const tcsDeals = generateBlockDealsForAsset('TCS', 3980.5, '₹14,42,000 Cr');
  assert.ok(tcsDeals.length >= 3, 'Should generate multiple block deals');
  assert.ok(tcsDeals[0].valueCr > 0, 'Deal value must be positive');
  assert.ok(tcsDeals[0].buyer.length > 0, 'Buyer must be present');
  assert.ok(tcsDeals[0].seller.length > 0, 'Seller must be present');

  // Test Institutional Activity for BHEL
  const bhelActivity = generateInstitutionalActivityForAsset('BHEL', 'EQUITY');
  assert.ok(bhelActivity.fiiHoldingPct > 0);
  assert.ok(bhelActivity.diiHoldingPct > 0);
  assert.equal(bhelActivity.promoterPledgedPct, 0.0, 'BHEL should have 0% pledge');
  assert.ok(bhelActivity.netFlow1mCr > 0);

  // Test Insider Trades for TCS
  const tcsInsiders = generateInsiderTradesForAsset('TCS', 3980.5);
  assert.ok(tcsInsiders.length >= 2);
  assert.ok(tcsInsiders[0].personName.length > 0);
  assert.ok(tcsInsiders[0].sebiRegulation.includes('PIT') || tcsInsiders[0].sebiRegulation.includes('SAST'));
});

test('institutionalIntelligence generates mutual fund all-holdings and month-wise buying & exit stocks for PPFCF', async () => {
  const { generateMutualFundAuditForAsset } = await import('./institutionalIntelligence');

  const ppfcfAudit = generateMutualFundAuditForAsset('PPFCF', 'Parag Parikh Flexi Cap Fund', 'MUTUAL_FUND', 84.65);
  assert.equal(ppfcfAudit.isMutualFundOrEtf, true);
  assert.equal(ppfcfAudit.fundHouse, 'PPFAS Asset Management Company (PPFAS Mutual Fund)');
  assert.ok(ppfcfAudit.allHoldings.length >= 10, 'Should have at least 10 in-depth constituent holdings');

  // Verify holdings details each-wise
  const hdfc = ppfcfAudit.allHoldings.find(h => h.ticker === 'HDFCBANK');
  assert.ok(hdfc !== undefined, 'HDFC Bank should be in holdings');
  assert.ok(hdfc!.weightPct > 5, 'Weight must be significant');
  assert.ok(hdfc!.peRatio > 0, 'PE ratio must be populated');
  assert.ok(hdfc!.rocePct > 0, 'ROCE must be populated');

  // Verify Month-Wise shifts: New Buys & Complete Exits
  assert.ok(ppfcfAudit.monthlyShifts.length >= 3, 'Must have at least 3 monthly shift records');
  const oct = ppfcfAudit.monthlyShifts[0];
  assert.equal(oct.month, 'October 2026');
  assert.ok(oct.newBuyingStocks.length >= 2, 'Must have fresh new entry stocks');
  assert.ok(oct.completeExitStocks.length >= 2, 'Must have complete exit stocks');

  // Check specific fresh entries and exits
  const marutiBuy = oct.newBuyingStocks.find(s => s.ticker === 'MARUTI');
  assert.ok(marutiBuy !== undefined, 'Maruti must be a fresh buying stock in Oct 2026');
  assert.ok(marutiBuy!.entryRationale.length > 10);

  const asianPaintsExit = oct.completeExitStocks.find(s => s.ticker === 'ASIANPAINT');
  assert.ok(asianPaintsExit !== undefined, 'Asian Paints must be an exit stock in Oct 2026');
  assert.ok(asianPaintsExit!.exitRationale.length > 10);

  // Check top accumulated & trimmed
  assert.ok(oct.topAccumulatedStocks.length >= 2);
  assert.ok(oct.topTrimmedStocks.length >= 1);
});

test('marketSyncEngine: roundToTickSize and generateNextMarketTick perform continuous zero-latency updates', async () => {
  const { roundToTickSize, generateNextMarketTick, INITIAL_MACRO_STATE } = await import('./marketSyncEngine');
  const { BASE_ASSETS } = await import('../data/watchlistData');

  // Verify tick size rounding
  assert.equal(roundToTickSize(385.32), 385.3);
  assert.equal(roundToTickSize(385.38), 385.4);
  assert.equal(roundToTickSize(54.432), 54.43);

  // Verify initial macro state
  assert.ok(INITIAL_MACRO_STATE.nifty50.price > 20000);
  assert.ok(INITIAL_MACRO_STATE.brentCrude.price > 100);
  assert.ok(INITIAL_MACRO_STATE.netCashBufferCr > 0);

  // Run next tick cycle
  const tickResult = generateNextMarketTick(BASE_ASSETS, INITIAL_MACRO_STATE);
  assert.equal(tickResult.updatedAssets.length, BASE_ASSETS.length);
  assert.ok(Object.keys(tickResult.deltas).length > 0, 'Must produce asset tick deltas');

  // Verify updated deltas have tight spreads and timestamps
  for (const ticker of Object.keys(tickResult.deltas)) {
    const d = tickResult.deltas[ticker];
    assert.ok(d.price > 0);
    assert.ok(d.bid < d.ask, 'Bid must be strictly less than ask');
    assert.ok(d.timestamp > 0);
    assert.ok(['up', 'down', 'flat'].includes(d.tickDir));
  }

  // Verify macro indices updated
  assert.ok(tickResult.updatedMacro.nifty50.price > 0);
  assert.ok(['up', 'down', 'flat'].includes(tickResult.updatedMacro.nifty50.tickDir));
});

test('predictiveAnalysisEngine: generates institutional Next-Day T+1 trading forecasts with pivot levels', async () => {
  const { generateNextDayTradingForecast } = await import('./predictiveAnalysisEngine');

  // Test Stock (BHEL)
  const bhelForecast = generateNextDayTradingForecast({
    ticker: 'BHEL',
    name: 'Bharat Heavy Electricals Ltd',
    price: 386.72,
    chg1d: -3.05,
    type: 'EQUITY',
  });

  assert.equal(bhelForecast.bias, 'BULLISH_DIP_BUY');
  assert.ok(bhelForecast.confidencePct >= 90);
  assert.ok(bhelForecast.expectedLow < 386.72);
  assert.ok(bhelForecast.expectedHigh > 386.72);
  assert.ok(bhelForecast.pivotPoint > 0);
  assert.ok(bhelForecast.t1LongEntry > 0);
  assert.ok(bhelForecast.t1Target1 > bhelForecast.t1LongEntry);
  assert.ok(bhelForecast.t1Target2 > bhelForecast.t1Target1);
  assert.ok(bhelForecast.t1StopLoss < bhelForecast.t1LongEntry);
  assert.ok(bhelForecast.riskRewardRatio.startsWith('1 :'));
  assert.ok(bhelForecast.optionsMaxPainOrStrike?.includes('Max Pain'));

  // Test ETF (MONQ50 with high premium flag)
  const monq50Forecast = generateNextDayTradingForecast({
    ticker: 'MONQ50',
    name: 'Motilal Oswal Nasdaq 50 ETF',
    price: 221.5,
    chg1d: 0.5,
    type: 'ETF',
  });
  assert.equal(monq50Forecast.bias, 'DEFENSIVE_TRIM');
  assert.ok(monq50Forecast.inavOrNavTrackingError?.includes('iNAV Premium'));

  // Test Mutual Fund (PPFCF)
  const ppfcfForecast = generateNextDayTradingForecast({
    ticker: 'PPFCF',
    name: 'Parag Parikh Flexi Cap Fund',
    price: 84.65,
    chg1d: -0.32,
    type: 'MF',
  });
  assert.ok(ppfcfForecast.inavOrNavTrackingError?.includes('Daily Cutoff: 2:00 PM IST'));
});

test('predictiveAnalysisEngine: generates multi-horizon future compounding targets and margin of safety', async () => {
  const { generateFutureInvestmentForecast } = await import('./predictiveAnalysisEngine');

  // Test Compounder Stock (BHEL)
  const bhelFuture = generateFutureInvestmentForecast({
    ticker: 'BHEL',
    name: 'Bharat Heavy Electricals Ltd',
    price: 386.72,
    type: 'EQUITY',
  });

  assert.ok(bhelFuture.compounderQualityScore >= 90);
  assert.ok(bhelFuture.intrinsicValue > 386.72);
  assert.ok(bhelFuture.marginOfSafetyPct > 10);
  assert.ok(bhelFuture.timeHorizon1m.projectedPrice > 386.72);
  assert.ok(bhelFuture.timeHorizon6m.projectedPrice > bhelFuture.timeHorizon1m.projectedPrice);
  assert.ok(bhelFuture.timeHorizon1y.projectedPrice > bhelFuture.timeHorizon6m.projectedPrice);
  assert.ok(bhelFuture.timeHorizon3y.projectedPrice > bhelFuture.timeHorizon1y.projectedPrice);
  assert.ok(bhelFuture.macroCatalysts.length >= 2);
  assert.ok(bhelFuture.accumulationPlaybook.length > 20);
  assert.ok(bhelFuture.invalidationLevel.length > 15);

  // Test Mutual Fund (PPFCF)
  const ppfcfFuture = generateFutureInvestmentForecast({
    ticker: 'PPFCF',
    name: 'Parag Parikh Flexi Cap Fund',
    price: 84.65,
    type: 'MF',
  });
  assert.equal(ppfcfFuture.compounderQualityScore, 96);
  assert.equal(ppfcfFuture.recommendedAllocationPct, 15);
  assert.ok(ppfcfFuture.accumulationPlaybook.includes('SIP'));
});

test('institutionalIntelligence: generates BlackRock Aladdin, Goldman Sachs, Jefferies, and Rothschild consensus', async () => {
  const { generateGlobalInstitutionalConsensus } = await import('./institutionalIntelligence');

  // Test Equity Asset: TATAMOTORS
  const tataConsensus = generateGlobalInstitutionalConsensus({
    ticker: 'TATAMOTORS',
    name: 'Tata Motors Passenger Vehicles Ltd',
    type: 'EQUITY',
    price: 928.4,
    pe: 14.8,
    dd52w: -17.5,
    roce: 21.4,
    de: 0.38,
    high52: 1125.0,
    low52: 780.0,
  });

  // Verify BlackRock Aladdin
  assert.ok(tataConsensus.blackrock.var95Pct > 0, 'Aladdin VaR 95% must be positive magnitude');
  assert.ok(tataConsensus.blackrock.cvar99Pct > tataConsensus.blackrock.var95Pct, 'CVaR must exceed VaR');
  assert.ok(tataConsensus.blackrock.factorBeta > 0, 'Market beta must be positive');
  assert.ok(tataConsensus.blackrock.stressTestDrawdowns.gfc2008 < 0, 'Stress drawdowns must be negative');
  assert.ok(tataConsensus.blackrock.aladdinHedgeDirective.length > 10, 'Must have tail risk directive');

  // Verify Goldman Sachs
  assert.ok(tataConsensus.goldmanSachs.targetPrice12M > 928.4, '12M target must reflect upside');
  assert.ok(tataConsensus.goldmanSachs.upsidePotentialPct > 0, 'Upside potential must be positive');
  assert.ok(tataConsensus.goldmanSachs.evaSpreadPct > 0, 'EVA spread ROCE - WACC must be positive');
  assert.ok(['CONVICTION_BUY', 'BUY', 'NEUTRAL'].includes(tataConsensus.goldmanSachs.convictionRating));

  // Verify Jefferies
  assert.ok(tataConsensus.jefferies.greedAndFearScore >= 0 && tataConsensus.jefferies.greedAndFearScore <= 100);
  assert.ok(['EARLY_ACCUMULATION', 'MID_CYCLE_EXPANSION', 'CAPITULATION_BOTTOM', 'LATE_STAGE_EUPHORIA', 'DISTRIBUTION_PEAK'].includes(tataConsensus.jefferies.cyclePhase));
  assert.ok(tataConsensus.jefferies.capexBacklogGrowthPct > 0);
  assert.ok(tataConsensus.jefferies.garpMultipleDiscountPct > 0);

  // Verify Rothschild & Co
  assert.ok(tataConsensus.rothschild.intergenerationalMoatScore >= 0 && tataConsensus.rothschild.intergenerationalMoatScore <= 100);
  assert.ok(tataConsensus.rothschild.altmanZScore > 0);
  assert.equal(tataConsensus.rothschild.promoterPledgePct, 0.0, 'Zero pledge invariant');
  assert.ok(tataConsensus.rothschild.cleanCashConversionPct > 0);

  // Verify Consensus Synthesis
  assert.ok(tataConsensus.consensusScore >= 0 && tataConsensus.consensusScore <= 100);
  assert.ok(tataConsensus.unifiedMacroTheses.length >= 3, 'Must have 4 unified macro theses');
  assert.ok(['STRONG_BUY_CONVICTION', 'ACCUMULATE_ON_DIPS', 'HOLD_COMPOUND', 'TRIM_DEFENSIVE', 'AVOID_CAPITAL_LOSS'].includes(tataConsensus.consensusAction));

  // Test Mutual Fund / ETF: PPFCF
  const ppfcfConsensus = generateGlobalInstitutionalConsensus({
    ticker: 'PPFCF',
    name: 'Parag Parikh Flexi Cap Fund',
    type: 'MF',
    price: 84.65,
    pe: 22.0,
    dd52w: -5.2,
    roce: 22.0,
    de: 0.0,
  });
  assert.ok(ppfcfConsensus.rothschild.intergenerationalMoatScore >= 80, 'PPFCF should have elite dynastic moat');
  assert.ok(ppfcfConsensus.blackrock.stressTestDrawdowns.covid2020 < 0);
});




