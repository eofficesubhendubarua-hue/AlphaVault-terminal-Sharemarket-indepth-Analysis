import { WatchlistAsset, CustomAssetItem, MacroMarketState, AssetTickDelta } from '../types/investment';

export const INITIAL_MACRO_STATE: MacroMarketState = {
  nifty50: {
    price: 22600.0,
    change: -88.4,
    changePct: -0.39,
    high: 22680.5,
    low: 22540.2,
    tickDir: 'down',
  },
  sensex: {
    price: 73123.83,
    change: -242.15,
    changePct: -0.33,
    tickDir: 'down',
  },
  nasdaq: {
    price: 25955.1,
    change: -54.7,
    changePct: -0.21,
    tickDir: 'down',
  },
  sp500: {
    price: 7623.68,
    change: -9.85,
    changePct: -0.13,
    tickDir: 'down',
  },
  dow: {
    price: 43120.45,
    change: -180.2,
    changePct: -0.42,
    tickDir: 'down',
  },
  fiiCashCr: 887,
  diiCashCr: 3235,
  netCashBufferCr: 4123,
  brentCrude: {
    price: 115.76,
    changePct: 1.4,
    tickDir: 'up',
  },
  usdInr: {
    price: 94.943,
    changePct: 0.12,
    tickDir: 'up',
  },
  gold: {
    price: 4028.5,
    changePct: 0.45,
    tickDir: 'up',
  },
  silver: {
    price: 54.4,
    changePct: -0.85,
    tickDir: 'down',
  },
  indiaVix: {
    price: 16.45,
    changePct: 4.2,
    tickDir: 'up',
  },
  pcr: 0.82,
  fiiLsRatio: 0.12,
  lastUpdated: new Date().toISOString(),
};

/**
 * Rounds a number to standard exchange tick size (0.05 or 0.01)
 */
export function roundToTickSize(price: number): number {
  if (price > 100) {
    return Math.round(price * 20) / 20;
  }
  return Math.round(price * 100) / 100;
}

/**
 * Generates continuous real-time market micro-ticks across all matrix assets and terminal indices
 * with zero latency, realistic order book spread, and deterministic micro-variation.
 */
export function generateNextMarketTick(
  currentAssets: WatchlistAsset[],
  currentMacro: MacroMarketState,
  currentCustomAssets?: CustomAssetItem[]
): {
  updatedAssets: WatchlistAsset[];
  updatedMacro: MacroMarketState;
  updatedCustomAssets: CustomAssetItem[];
  deltas: Record<string, AssetTickDelta>;
} {
  const now = Date.now();
  const deltas: Record<string, AssetTickDelta> = {};

  // Randomly pick a subset of assets (3 to 6 per sub-second tick cycle) to simulate realistic order arrival
  const numToTick = Math.max(3, Math.min(currentAssets.length, Math.floor(Math.random() * 4) + 3));
  const pickedIndices = new Set<number>();
  while (pickedIndices.size < numToTick && pickedIndices.size < currentAssets.length) {
    pickedIndices.add(Math.floor(Math.random() * currentAssets.length));
  }

  const updatedAssets = currentAssets.map((asset, idx) => {
    // IPO unlisted or MF with fixed NAV can tick less frequently or have micro-drift
    if (!pickedIndices.has(idx)) {
      return asset;
    }

    const prevPrice = asset.price;
    // Micro percentage variance between -0.15% and +0.15%
    const pctDelta = (Math.random() - 0.498) * 0.003;
    let newPrice = roundToTickSize(Math.max(prevPrice * 0.985, Math.min(prevPrice * 1.015, prevPrice * (1 + pctDelta))));

    if (newPrice === prevPrice) {
      // Force at least 1 tick step if random delta rounded to zero
      const tickStep = prevPrice > 100 ? 0.05 : 0.01;
      newPrice = Math.random() > 0.5 ? prevPrice + tickStep : prevPrice - tickStep;
      newPrice = roundToTickSize(newPrice);
    }

    const chg1d = ((newPrice - asset.prevClose) / asset.prevClose) * 100;
    const dd52w = ((newPrice - asset.high52w) / asset.high52w) * 100;
    const tickDir: 'up' | 'down' | 'flat' = newPrice > prevPrice ? 'up' : newPrice < prevPrice ? 'down' : 'flat';

    const spreadPct = 0.0005; // 5 bps institutional spread
    let bid = roundToTickSize(newPrice * (1 - spreadPct));
    let ask = roundToTickSize(newPrice * (1 + spreadPct));
    if (ask <= bid) {
      const step = newPrice > 100 ? 0.05 : 0.01;
      ask = roundToTickSize(bid + step);
    }

    deltas[asset.ticker] = {
      id: asset.id,
      ticker: asset.ticker,
      price: newPrice,
      prevPrice,
      chg1d,
      tickDir,
      timestamp: now,
      bid,
      ask,
      volumeDelta: Math.floor(Math.random() * 1500) + 100,
    };

    return {
      ...asset,
      price: newPrice,
      chg1d,
      dd52w,
    };
  });

  // Micro-tick Macro Indices (Nifty, Sensex, Nasdaq, Brent, Vix, FII buffer)
  const niftyDrift = (Math.random() - 0.495) * 4.5;
  const newNiftyPrice = Math.round((currentMacro.nifty50.price + niftyDrift) * 20) / 20;
  const niftyChange = Math.round((newNiftyPrice - 22688.4) * 100) / 100;
  const niftyChangePct = Math.round((niftyChange / 22688.4) * 10000) / 100;

  const sensexDrift = niftyDrift * 3.2;
  const newSensexPrice = Math.round((currentMacro.sensex.price + sensexDrift) * 100) / 100;
  const sensexChange = Math.round((newSensexPrice - 73365.98) * 100) / 100;
  const sensexChangePct = Math.round((sensexChange / 73365.98) * 10000) / 100;

  const crudeDrift = (Math.random() - 0.49) * 0.08;
  const newCrudePrice = Math.round((currentMacro.brentCrude.price + crudeDrift) * 100) / 100;

  const vixDrift = (Math.random() - 0.48) * 0.03;
  const newVixPrice = Math.round(Math.max(12, Math.min(35, currentMacro.indiaVix.price + vixDrift)) * 100) / 100;

  const updatedMacro: MacroMarketState = {
    ...currentMacro,
    nifty50: {
      price: newNiftyPrice,
      change: niftyChange,
      changePct: niftyChangePct,
      high: Math.max(currentMacro.nifty50.high, newNiftyPrice),
      low: Math.min(currentMacro.nifty50.low, newNiftyPrice),
      tickDir: newNiftyPrice >= currentMacro.nifty50.price ? 'up' : 'down',
    },
    sensex: {
      price: newSensexPrice,
      change: sensexChange,
      changePct: sensexChangePct,
      tickDir: newSensexPrice >= currentMacro.sensex.price ? 'up' : 'down',
    },
    brentCrude: {
      price: newCrudePrice,
      changePct: Math.round(((newCrudePrice - 114.16) / 114.16) * 10000) / 100,
      tickDir: newCrudePrice >= currentMacro.brentCrude.price ? 'up' : 'down',
    },
    indiaVix: {
      price: newVixPrice,
      changePct: Math.round(((newVixPrice - 15.79) / 15.79) * 10000) / 100,
      tickDir: newVixPrice >= currentMacro.indiaVix.price ? 'up' : 'down',
    },
    netCashBufferCr: currentMacro.netCashBufferCr + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 2 : -1) : 0),
    lastUpdated: new Date().toISOString(),
  };

  // Also tick custom assets if any exist
  const updatedCustomAssets = (currentCustomAssets || []).map((ca, cIdx) => {
    if (Math.random() > 0.4) return ca;
    const cPrev = ca.price;
    const cDelta = (Math.random() - 0.5) * 0.002 * cPrev;
    const cNew = roundToTickSize(Math.max(cPrev * 0.98, cPrev + cDelta));
    const cD1 = ((cNew - (ca.price / (1 + ca.d1 / 100))) / (ca.price / (1 + ca.d1 / 100))) * 100;
    return {
      ...ca,
      price: cNew,
      d1: Math.round(cD1 * 100) / 100,
    };
  });

  return {
    updatedAssets,
    updatedMacro,
    updatedCustomAssets,
    deltas,
  };
}
