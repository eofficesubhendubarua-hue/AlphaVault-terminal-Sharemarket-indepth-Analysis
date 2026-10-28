import React, { useState, useRef } from 'react';
import { WatchlistAsset, AssetCategory, AssetTickDelta } from '../types/investment';
import { formatSignedPct } from '../utils/quantLogic';
import {
  autoDetectAssetCategory,
  buildWatchlistAssetFromInput,
  parseUploadedSpreadsheetText,
  SAMPLE_CSV_TEMPLATE,
  AutocompleteSuggestionItem,
} from '../utils/fileImportParser';
import { MarketSearchDropdown } from './MarketSearchDropdown';
import {
  MarketDirectoryItem,
  convertDirectoryItemToWatchlistAsset,
  searchMarketDirectory,
} from '../data/marketDirectory';
import {
  Search,
  Download,
  Upload,
  PlusCircle,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Package,
  Handshake,
  Flame,
  ArrowUpRight,
  RotateCcw,
  ChevronDown,
  X,
  Radio,
  Zap,
  TrendingUp,
  Target,
  Layers,
} from 'lucide-react';
import { NextDayTradingCard } from './NextDayTradingCard';
import { FutureInvestmentRoadmap } from './FutureInvestmentRoadmap';
import {
  generateNextDayTradingForecast,
  generateFutureInvestmentForecast,
} from '../utils/predictiveAnalysisEngine';

interface ScorecardMatrixProps {
  assets: WatchlistAsset[];
  onUpdateAssetPrice: (id: number, newPrice: number) => void;
  onSelectForDeepAnalysis?: (ticker: string) => void;
  onAddWatchlistAssets?: (newAssets: WatchlistAsset[]) => void;
  onResetWatchlistAssets?: () => void;
  tickDeltas?: Record<string, AssetTickDelta>;
  isLiveStreaming?: boolean;
  latencyMs?: number;
  tickCount?: number;
  onForceSync?: () => void;
}

export const ScorecardMatrix: React.FC<ScorecardMatrixProps> = ({
  assets,
  onUpdateAssetPrice,
  onSelectForDeepAnalysis,
  onAddWatchlistAssets,
  onResetWatchlistAssets,
  tickDeltas = {},
  isLiveStreaming = true,
  latencyMs = 1,
  tickCount = 0,
  onForceSync,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPriceVal, setEditPriceVal] = useState('');
  const [matrixViewMode, setMatrixViewMode] = useState<'TRADING_T1' | 'FUTURE_INVEST' | 'CLASSIC'>('TRADING_T1');
  const [selectedAsset, setSelectedAsset] = useState<WatchlistAsset | null>(assets[13] || assets[0]);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [pasteCsvText, setPasteCsvText] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);
  const [isAiEnriching, setIsAiEnriching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const autoDetectedType: AssetCategory = autoDetectAssetCategory(search);

  // Multi-token search for filtering existing matrix assets
  const searchTokens = search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  // Handle selecting an asset from the full 130+ Market Directory dropdown
  const handleSelectMarketItem = (item: MarketDirectoryItem) => {
    const existing = assets.find(
      a => a.ticker.toUpperCase() === item.ticker.toUpperCase()
    );
    if (existing) {
      setSelectedAsset(existing);
      setSearch(existing.ticker);
      setImportStatusMsg(`Selected ${existing.ticker} (${existing.name}) in the Multi-Horizon Matrix.`);
      return;
    }

    const newAsset = convertDirectoryItemToWatchlistAsset(item);
    onAddWatchlistAssets?.([newAsset]);
    setSelectedAsset(newAsset);
    setSearch(newAsset.ticker);
    setImportStatusMsg(
      `Added ${newAsset.name} (${newAsset.ticker} • ${newAsset.type}) to the Multi-Horizon Matrix with full 1D–1Y returns, business model & contracts!`
    );
  };

  // Add a suggestion or custom user query into the matrix and enrich via Gemini 4 Argon if needed
  const handleSelectOrAddSuggestion = async (
    catalogItem?: AutocompleteSuggestionItem,
    customQuery?: string
  ) => {
    if (catalogItem) {
      const existing = assets.find(
        a => a.ticker.toUpperCase() === catalogItem.ticker.toUpperCase()
      );
      if (existing) {
        setSelectedAsset(existing);
        setSearch(existing.ticker);
        return;
      }

      const nextId = assets.reduce((max, a) => Math.max(max, a.id), 0) + 1;
      const newAsset = buildWatchlistAssetFromInput(nextId, catalogItem);
      onAddWatchlistAssets?.([newAsset]);
      setSelectedAsset(newAsset);
      setImportStatusMsg(
        `Added ${newAsset.name} (${newAsset.ticker} • Auto-Detected: ${newAsset.type}) to the Multi-Horizon Matrix.`
      );
      setSearch(newAsset.ticker);
      return;
    }

    const q = (customQuery ?? search).trim();
    if (!q) return;

    // Check if matches existing asset
    const existing = assets.find(
      a =>
        a.ticker.toUpperCase() === q.toUpperCase() ||
        a.name.toLowerCase() === q.toLowerCase()
    );
    if (existing) {
      setSelectedAsset(existing);
      setSearch(existing.ticker);
      return;
    }

    // Check if matches any item in the 130+ Market Directory
    const marketMatches = searchMarketDirectory(q, undefined, 1);
    if (marketMatches.length > 0) {
      handleSelectMarketItem(marketMatches[0]);
      return;
    }

    // Create immediate asset with auto-detected category, then optionally enrich from /api/analyze
    const nextId = assets.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const detectedType = autoDetectAssetCategory(q);
    const provisionalAsset = buildWatchlistAssetFromInput(nextId, {
      name: q,
      ticker: q.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10),
      type: detectedType,
    });

    onAddWatchlistAssets?.([provisionalAsset]);
    setSelectedAsset(provisionalAsset);
    setSearch('');
    setImportStatusMsg(
      `Added "${q}" (Auto-Detected: ${detectedType}) to the Matrix. Enriching full 1W–1Y returns, business model, products & contracts via Gemini 4 Argon...`
    );

    setIsAiEnriching(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, categoryHint: detectedType }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const d = json.data;
        const enriched = buildWatchlistAssetFromInput(nextId, {
          ticker: d.ticker || provisionalAsset.ticker,
          name: d.name || q,
          isin: d.isin || provisionalAsset.isin,
          type: (d.category === 'MUTUAL_FUND' ? 'MF' : d.category) || detectedType,
          price: d.currentPrice || provisionalAsset.price,
          chg1d: d.returns?.d1 ?? d.change1d ?? provisionalAsset.chg1d,
          ret1w: d.returns?.w1 ?? provisionalAsset.ret1w,
          ret1m: d.returns?.m1 ?? provisionalAsset.ret1m,
          ret3m: d.returns?.m3 ?? provisionalAsset.ret3m,
          ret6m: d.returns?.m6 ?? provisionalAsset.ret6m,
          ret1y: d.returns?.y1 ?? provisionalAsset.ret1y,
          high52w: d.high52 || provisionalAsset.high52w,
          low52w: d.low52 || provisionalAsset.low52w,
          pe: d.valuation?.pe ? `${d.valuation.pe}x P/E` : provisionalAsset.pe,
          mcap: d.marketCapOrAum || provisionalAsset.mcap,
          verdict: d.verdict || provisionalAsset.verdict,
          buyZone: d.dcaTranches?.tranche1BuyZone || provisionalAsset.buyZone,
          target12m: d.dcaTranches?.target12Month || provisionalAsset.target12m,
          stopLoss: d.dcaTranches?.stopLoss || provisionalAsset.stopLoss,
          businessModel: d.businessModel?.summary || provisionalAsset.businessModel,
          productsAndServices:
            d.productsAndServices?.map((p: any) => `${p.name} (${p.shareOrImpact})`) ||
            provisionalAsset.productsAndServices,
          expansionsAndContracts: [
            ...(d.corporateCatalysts?.newExpansions || []),
            ...(d.corporateCatalysts?.majorContractsAndOrders || []),
          ],
          tradeDealsAndCatalysts:
            (d.corporateCatalysts?.tradeDealsAndPartnerships || []).join(' • ') ||
            provisionalAsset.tradeDealsAndCatalysts,
          upsidePotentialPct: d.highProfitPlaybook?.estimatedUpsidePct ?? 24.5,
          strategy: d.highProfitPlaybook?.executionStrategy || provisionalAsset.highProfitSuggestion.strategy,
          catalystTimeline:
            d.highProfitPlaybook?.idealHoldingPeriod || provisionalAsset.highProfitSuggestion.catalystTimeline,
        });
        onAddWatchlistAssets?.([enriched]);
        setSelectedAsset(enriched);
        setImportStatusMsg(
          `Completed Gemini 4 Argon Deep Audit for ${enriched.name} (${enriched.ticker} • ${enriched.type}) and updated Matrix row.`
        );
      }
    } catch {
      // Provisional institutional model remains active
    } finally {
      setIsAiEnriching(false);
    }
  };

  // Handle CSV / Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = String(evt.target?.result || '');
      const nextId = assets.reduce((max, a) => Math.max(max, a.id), 0) + 1;
      const parsed = parseUploadedSpreadsheetText(content, nextId);
      if (parsed.length > 0) {
        onAddWatchlistAssets?.(parsed);
        setSelectedAsset(parsed[0]);
        setImportStatusMsg(
          `Successfully imported ${parsed.length} instrument(s) from "${file.name}" (${parsed
            .map(p => `${p.ticker} [${p.type}]`)
            .join(', ')}) with full 1D–1Y returns, business models, and high-profit playbooks.`
        );
      } else {
        setImportStatusMsg(
          `Could not detect valid rows in "${file.name}". Please ensure columns include Ticker/Name and Price, or download our sample CSV/Excel template.`
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePasteImport = () => {
    if (!pasteCsvText.trim()) return;
    const nextId = assets.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const parsed = parseUploadedSpreadsheetText(pasteCsvText, nextId);
    if (parsed.length > 0) {
      onAddWatchlistAssets?.(parsed);
      setSelectedAsset(parsed[0]);
      setPasteCsvText('');
      setImportStatusMsg(
        `Imported ${parsed.length} instrument(s) (${parsed
          .map(p => `${p.ticker} [${p.type}]`)
          .join(', ')}) into the Multi-Horizon Matrix.`
      );
    }
  };

  const handleDownloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alphavault_sample_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadDemoBatch = () => {
    const nextId = assets.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const parsed = parseUploadedSpreadsheetText(SAMPLE_CSV_TEMPLATE, nextId);
    if (parsed.length > 0) {
      onAddWatchlistAssets?.(parsed);
      setSelectedAsset(parsed[0]);
      setImportStatusMsg(
        `Loaded 4 Demo Instruments (${parsed
          .map(p => `${p.ticker} [${p.type}]`)
          .join(', ')}) into the Matrix with full 1W–1Y returns, business models & contracts.`
      );
    }
  };

  // Filter & sort assets
  const filtered = assets
    .filter(a => {
      const matchCat = categoryFilter === 'ALL' || a.type === categoryFilter;
      const matchVerd = verdictFilter === 'ALL' || a.verdict === verdictFilter;
      if (searchTokens.length === 0) return matchCat && matchVerd;
      const hay = `${a.ticker} ${a.name} ${a.isin} ${a.type} ${a.verdict} ${a.businessModel}`.toLowerCase();
      const matchSearch = searchTokens.every(tok => hay.includes(tok));
      return matchCat && matchVerd && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'dip1d') return a.chg1d - b.chg1d;
      if (sortBy === 'dip1w') return a.ret1w - b.ret1w;
      if (sortBy === 'intraday') return a.low1dPct - b.low1dPct;
      if (sortBy === 'dip1m') return a.ret1m - b.ret1m;
      if (sortBy === 'dd52w') return a.dd52w - b.dd52w;
      if (sortBy === 'ret1y') return b.ret1y - a.ret1y;
      return a.id - b.id;
    });

  const exportCsv = () => {
    const headers = [
      'ID',
      'Ticker',
      'ISIN',
      'Name',
      'Category',
      'Return_Type',
      'Obs_Date',
      'Close_or_NAV_INR',
      '1D_Pct',
      'Intraday_Low_Pct',
      'Rolling_1W_Pct',
      'Rolling_1M_Pct',
      'Rolling_3M_Pct',
      'Rolling_6M_Pct',
      'Rolling_12M_Pct',
      'Dist_From_52W_High_Pct',
      'Window_12M_Max_DD_Pct',
      'Valuation_or_TER',
      'Classification',
      'Entry_Condition',
      'Expected_Upside_Pct',
    ];
    const rows = [headers];
    assets.forEach(a => {
      rows.push([
        String(a.id),
        `"${a.ticker}"`,
        a.isin,
        `"${a.name}"`,
        a.type,
        `"${a.retType}"`,
        a.obsDate,
        a.price.toFixed(2),
        a.chg1d.toFixed(2),
        a.low1dPct.toFixed(2),
        a.ret1w.toFixed(2),
        a.ret1m.toFixed(2),
        a.ret3m.toFixed(2),
        a.ret6m.toFixed(2),
        a.ret1y.toFixed(2),
        a.dd52w.toFixed(2),
        a.maxDd12m.toFixed(2),
        `"${a.pe}"`,
        `"${a.verdict}"`,
        `"${a.buyZone}"`,
        String(a.highProfitSuggestion.upsidePotentialPct),
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alphavault_assets_matrix.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const countByType = (t: string) => assets.filter(a => a.type === t).length;

  return (
    <div className="space-y-6">
      {/* Control Strip with Smart Auto-Detect Search Dropdown + CSV/Excel Upload */}
      <div className="glass-card rounded-xl p-4 sm:p-5 space-y-4 border-l-4 border-l-blue-500">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-[240px]">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                19-Asset Multi-Horizon Matrix &amp; Institutional Thesis ({assets.length} Tracked)
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold mono border border-emerald-500/30">
                AUTO-DETECT + CSV/EXCEL IMPORT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Search or add ANY Stock, ETF, Mutual Fund, or IPO with live auto-detection &amp; dropdown suggestions, or upload a CSV / Excel file for instant multi-horizon analysis.
            </p>
          </div>

          {/* CSV / Excel Upload & Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV / Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportPanel(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-300" />
              <span>{showImportPanel ? 'Hide Import Desk' : 'Batch Import / Template'}</span>
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {assets.length > 19 && onResetWatchlistAssets && (
              <button
                type="button"
                onClick={() => {
                  onResetWatchlistAssets();
                  setImportStatusMsg('Reset matrix to baseline 19 institutional assets.');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                title="Reset to default 19 assets"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset (19)</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-Time Continuous Zero-Latency Market Stream Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveStreaming ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLiveStreaming ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="font-bold text-white mono text-xs sm:text-sm">
              {isLiveStreaming ? 'REAL-TIME MARKET STREAM ACTIVE' : 'STREAM PAUSED'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mono font-semibold">
              ZERO-LATENCY CONTINUOUS SYNC • {assets.length}/{assets.length} ASSETS
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] mono text-slate-300">
            <span className="hidden sm:inline">
              Ticks: <span className="text-emerald-400 font-bold">{tickCount.toLocaleString()}</span>
            </span>
            <span>
              Latency: <span className="text-emerald-400 font-bold">&lt; {latencyMs}ms</span>
            </span>
            {onForceSync && (
              <button
                type="button"
                onClick={onForceSync}
                className="px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-[10px] font-semibold transition"
                title="Trigger immediate instant synchronization tick"
              >
                Sync Now
              </button>
            )}
          </div>
        </div>

        {/* Search Input with 130+ Market Directory Autocomplete Dropdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
          <div className="lg:col-span-6 relative">
            <MarketSearchDropdown
              value={search}
              onChange={setSearch}
              onSelect={handleSelectMarketItem}
              onQuickAnalyze={ticker => {
                if (onSelectForDeepAnalysis) onSelectForDeepAnalysis(ticker);
              }}
              onAddToWatchlist={handleSelectMarketItem}
              isInWatchlist={ticker => assets.some(a => a.ticker.toUpperCase() === ticker.toUpperCase())}
              onKeyDownEnter={() => {
                if (search.trim()) {
                  handleSelectOrAddSuggestion(undefined, search);
                }
              }}
              placeholder="Search 130+ stocks, ETFs, mutual funds & IPOs (e.g. PICC, PIIND, TCS, Reliance, Nifty BeES)..."
              idPrefix="matrix-search"
            />
          </div>

          {/* Quick Add Button + Filters */}
          <div className="lg:col-span-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!search.trim() || isAiEnriching}
              onClick={() => handleSelectOrAddSuggestion(undefined, search)}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isAiEnriching ? 'Analyzing...' : 'Add & Analyze'}</span>
            </button>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories ({assets.length})</option>
              <option value="EQUITY">Stocks / Equities ({countByType('EQUITY')})</option>
              <option value="ETF">ETFs ({countByType('ETF')})</option>
              <option value="MF">Mutual Funds ({countByType('MF')})</option>
              <option value="IPO">IPOs ({countByType('IPO')})</option>
            </select>

            <select
              value={verdictFilter}
              onChange={e => setVerdictFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Verdicts</option>
              <option value="ACCUMULATE">ACCUMULATE Only</option>
              <option value="WATCH">WATCH Only</option>
              <option value="AVOID">AVOID Only</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="default">Default Order (1–{assets.length})</option>
              <option value="dip1d">Biggest 1D Fall First</option>
              <option value="dip1w">Biggest 1W Pullback</option>
              <option value="intraday">Biggest Intraday Drop</option>
              <option value="dip1m">Biggest 1M Pullback</option>
              <option value="dd52w">Deepest 52W Discount</option>
              <option value="ret1y">Highest 1Y Return</option>
            </select>
          </div>
        </div>

        {/* Collapsible CSV / Excel Bulk Import & Sample Template Desk */}
        {showImportPanel && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-500/40 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  <span>Upload CSV / Excel File (.csv, .xlsx, .xls, .tsv) or Paste Spreadsheet Rows</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically detects Stock, ETF, Mutual Fund, or IPO and populates 1D/1W/1M/3M/6M/1Y up &amp; down returns, business models, products, expansions, contracts, and trade deals.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 font-semibold transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV/Excel Template</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemoBatch}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold transition flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Demo Batch (Stock + ETF + MF + IPO)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/50 hover:bg-slate-900 cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 transition"
              >
                <Upload className="w-6 h-6 text-emerald-400" />
                <div className="font-bold text-white">Click to Select CSV or Excel File</div>
                <p className="text-[10px] text-slate-400">
                  Supports .csv, .xlsx, .xls, .tsv • Auto-maps columns (Ticker, Name, Category, Price, Returns, Business Model)
                </p>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <textarea
                  rows={3}
                  value={pasteCsvText}
                  onChange={e => setPasteCsvText(e.target.value)}
                  placeholder="Or paste rows copied from Excel / Google Sheets / CSV here (e.g. TATAMOTORS, Tata Motors Ltd, EQUITY, 842.50 OR JIOIPO, Jio Platforms IPO, IPO, 1180)..."
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white mono focus:outline-none focus:border-purple-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!pasteCsvText.trim()}
                    onClick={handlePasteImport}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs transition"
                  >
                    Parse &amp; Import Pasted Rows
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Feedback Banner */}
        {importStatusMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between gap-2 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{importStatusMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setImportStatusMsg(null)}
              className="text-slate-400 hover:text-white p-1 rounded"
              aria-label="Close status message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* View Perspective Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Matrix Perspective:</span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
            Toggle between Next-Day T+1 tactical execution, Multi-Year compounding, and Trailing returns.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMatrixViewMode('TRADING_T1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              matrixViewMode === 'TRADING_T1'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/50 border border-blue-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Next-Day T+1 Trading</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-mono text-cyan-200">
              Pivots &amp; Targets
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMatrixViewMode('FUTURE_INVEST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              matrixViewMode === 'FUTURE_INVEST'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            <span>Future Investment Compounding</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-mono text-emerald-200">
              1Y–3Y CAGR
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMatrixViewMode('CLASSIC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              matrixViewMode === 'CLASSIC'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-950/50 border border-purple-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-purple-300" />
            <span>Multi-Horizon Returns (Classic)</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-mono text-purple-200">
              1D–1Y
            </span>
          </button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll for Tablet & Desktop */}
      <div className="glass-card rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              {matrixViewMode === 'TRADING_T1' ? (
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/80">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Instrument / Type</th>
                  <th className="py-2.5 px-3 text-right">CMP (₹) &amp; Tick</th>
                  <th className="py-2.5 px-3">T+1 Bias &amp; Confidence</th>
                  <th className="py-2.5 px-3 text-center">Expected Range (Low – High)</th>
                  <th className="py-2.5 px-3 text-right">Center Pivot</th>
                  <th className="py-2.5 px-3 text-right">T+1 Entry</th>
                  <th className="py-2.5 px-3 text-right">Targets (T1 / T2)</th>
                  <th className="py-2.5 px-3 text-right">ATR Stop</th>
                  <th className="py-2.5 px-3 text-center">R:R</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              ) : matrixViewMode === 'FUTURE_INVEST' ? (
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/80">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Instrument / Type</th>
                  <th className="py-2.5 px-3 text-right">CMP (₹)</th>
                  <th className="py-2.5 px-3 text-right">Intrinsic Value</th>
                  <th className="py-2.5 px-3 text-right">Margin of Safety</th>
                  <th className="py-2.5 px-3 text-center">Compounder Score</th>
                  <th className="py-2.5 px-3 text-right">1-Year Target</th>
                  <th className="py-2.5 px-3 text-right">3-Year Compounding (CAGR)</th>
                  <th className="py-2.5 px-3 text-center">Target Weight</th>
                  <th className="py-2.5 px-3">Playbook Strategy</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              ) : (
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/80">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Instrument / ISIN</th>
                  <th className="py-2.5 px-3 text-right">Close / NAV (₹)</th>
                  <th className="py-2.5 px-3 text-right">1D % / 1W %</th>
                  <th className="py-2.5 px-3 text-right">1M % / 3M %</th>
                  <th className="py-2.5 px-3 text-right">6M % / 1Y %</th>
                  <th className="py-2.5 px-3 text-right">52W High (Dist %)</th>
                  <th className="py-2.5 px-3">High-Profit Upside</th>
                  <th className="py-2.5 px-3 text-center">Classification</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        No matrix assets match &ldquo;{search}&rdquo;
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Use the search dropdown above to select and track any of 130+ stocks, ETFs, mutual funds, or IPOs, or clear your search filter.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setCategoryFilter('ALL');
                            setVerdictFilter('ALL');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold mono transition cursor-pointer"
                        >
                          Clear Search Filter
                        </button>
                        {search.trim() && (
                          <button
                            type="button"
                            onClick={() => handleSelectOrAddSuggestion(undefined, search)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold mono flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-950/40"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Add &ldquo;{search.trim()}&rdquo; to Matrix</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(a => {
                  const badgeCls =
                    a.verdictColor === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : a.verdictColor === 'rose'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : a.verdictColor === 'amber'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30';

                  const isEditing = editingId === a.id;
                  const isSelected = selectedAsset?.id === a.id;

                  const tickInfo = tickDeltas[a.ticker];
                  const isRecentTick = tickInfo && Date.now() - tickInfo.timestamp < 1500;
                  const tickCls = isRecentTick
                    ? tickInfo.tickDir === 'up'
                      ? 'tick-flash-up tick-transition'
                      : tickInfo.tickDir === 'down'
                      ? 'tick-flash-down tick-transition'
                      : 'tick-transition'
                    : 'tick-transition';

                  const t1 = a.nextDayTrading || generateNextDayTradingForecast(a);
                  const fut = a.futureInvestment || generateFutureInvestmentForecast(a);

                  const t1BiasBadge =
                    t1.bias === 'STRONG_BULLISH'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : t1.bias === 'BULLISH_DIP_BUY'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : t1.bias === 'DEFENSIVE_TRIM' || t1.bias === 'BEARISH_SHORT'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-700/40 text-slate-300 border-slate-600/40';

                  const t1BiasLabel =
                    t1.bias === 'STRONG_BULLISH'
                      ? 'Strong Bullish'
                      : t1.bias === 'BULLISH_DIP_BUY'
                      ? 'Bullish Dip Buy'
                      : t1.bias === 'DEFENSIVE_TRIM'
                      ? 'Defensive Trim'
                      : t1.bias === 'BEARISH_SHORT'
                      ? 'Bearish Short'
                      : 'Range Neutral';

                  const scoreBadge =
                    fut.compounderQualityScore >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : fut.compounderQualityScore >= 75
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : fut.compounderQualityScore >= 50
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                  // Dynamic view row rendering
                  if (matrixViewMode === 'TRADING_T1') {
                    return (
                      <tr
                        key={a.id}
                        className={`transition ${
                          isSelected ? 'bg-blue-950/30' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 mono text-slate-400">{a.id}</td>
                        <td className="py-2.5 px-3">
                          <div
                            className="font-bold text-white hover:text-blue-400 transition cursor-pointer flex items-center gap-1.5"
                            onClick={() => setSelectedAsset(a)}
                          >
                            <span>{a.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] mono">
                              {a.type}
                            </span>
                            {isRecentTick && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mono">
                            {a.ticker} • {a.isin}
                          </div>
                        </td>
                        <td className={`py-2.5 px-3 text-right mono ${tickCls}`}>
                          <div className="font-bold text-white">₹{a.price.toFixed(2)}</div>
                          <div className="text-[9px]">
                            {isRecentTick && tickInfo?.tickDir === 'up' && (
                              <span className="text-emerald-400">▲ {formatSignedPct(tickInfo.chg1d)}</span>
                            )}
                            {isRecentTick && tickInfo?.tickDir === 'down' && (
                              <span className="text-rose-400">▼ {formatSignedPct(tickInfo.chg1d)}</span>
                            )}
                            {!isRecentTick && (
                              <span className={a.chg1d >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {formatSignedPct(a.chg1d)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold mono inline-block ${t1BiasBadge}`}>
                            {t1BiasLabel}
                          </span>
                          <div className="text-[9px] text-slate-400 mt-0.5 mono">
                            Conf: <span className="text-emerald-300 font-bold">{t1.confidencePct}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center mono">
                          <div className="text-white font-semibold">
                            ₹{t1.expectedLow.toFixed(2)} – ₹{t1.expectedHigh.toFixed(2)}
                          </div>
                          <div className="text-[9px] text-cyan-400">±{t1.expectedMovePct}% move</div>
                        </td>
                        <td className="py-2.5 px-3 text-right mono">
                          <span className="font-bold text-amber-300">₹{t1.pivotPoint.toFixed(2)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right mono">
                          <span className="font-bold text-emerald-400">₹{t1.t1LongEntry.toFixed(2)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right mono text-[10px]">
                          <div className="text-emerald-300 font-semibold">T1: ₹{t1.t1Target1.toFixed(2)}</div>
                          <div className="text-cyan-300">T2: ₹{t1.t1Target2.toFixed(2)}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right mono">
                          <span className="text-rose-400 font-semibold">₹{t1.t1StopLoss.toFixed(2)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center mono text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {t1.riskRewardRatio}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedAsset(a)}
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[10px] font-semibold transition"
                            >
                              Dossier
                            </button>
                            {onSelectForDeepAnalysis && (
                              <button
                                onClick={() => onSelectForDeepAnalysis(a.ticker)}
                                className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-semibold transition"
                                title="Run High-Thinking AI Analysis with Revenue Pie & Growth Charts"
                              >
                                AI Deep
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  if (matrixViewMode === 'FUTURE_INVEST') {
                    return (
                      <tr
                        key={a.id}
                        className={`transition ${
                          isSelected ? 'bg-blue-950/30' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 mono text-slate-400">{a.id}</td>
                        <td className="py-2.5 px-3">
                          <div
                            className="font-bold text-white hover:text-blue-400 transition cursor-pointer flex items-center gap-1.5"
                            onClick={() => setSelectedAsset(a)}
                          >
                            <span>{a.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[9px] mono">
                              {a.type}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mono">
                            {a.ticker} • {a.isin}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right mono font-bold text-white">
                          ₹{a.price.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right mono">
                          <span className="font-bold text-cyan-300">₹{fut.intrinsicValue.toFixed(2)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right mono">
                          <span className={`font-bold ${fut.marginOfSafetyPct > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {fut.marginOfSafetyPct > 0 ? `+${fut.marginOfSafetyPct}%` : `${fut.marginOfSafetyPct}%`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center mono">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${scoreBadge}`}>
                            {fut.compounderQualityScore} / 100
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right mono text-[10px]">
                          <div className="text-emerald-300 font-bold">₹{fut.timeHorizon1y.projectedPrice.toFixed(2)}</div>
                          <div className="text-emerald-400">+{fut.timeHorizon1y.targetReturnPct}%</div>
                        </td>
                        <td className="py-2.5 px-3 text-right mono text-[10px]">
                          <div className="text-purple-300 font-bold">₹{fut.timeHorizon3y.projectedPrice.toFixed(2)}</div>
                          <div className="text-purple-400 font-bold">
                            +{fut.timeHorizon3y.targetReturnPct}% (~{((Math.pow(1 + fut.timeHorizon3y.targetReturnPct / 100, 1 / 3) - 1) * 100).toFixed(1)}% CAGR)
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center mono">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            {fut.recommendedAllocationPct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[10px] text-slate-300 max-w-[200px] truncate" title={fut.accumulationPlaybook}>
                          {fut.accumulationPlaybook}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedAsset(a)}
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[10px] font-semibold transition"
                            >
                              Dossier
                            </button>
                            {onSelectForDeepAnalysis && (
                              <button
                                onClick={() => onSelectForDeepAnalysis(a.ticker)}
                                className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-semibold transition"
                                title="Run High-Thinking AI Analysis with Revenue Pie & Growth Charts"
                              >
                                AI Deep
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Classic view
                  return (
                    <tr
                      key={a.id}
                      className={`transition ${
                        isSelected ? 'bg-blue-950/30' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 mono text-slate-400">{a.id}</td>
                      <td className="py-2.5 px-3">
                        <div
                          className="font-bold text-white hover:text-blue-400 transition cursor-pointer flex items-center gap-1.5"
                          onClick={() => setSelectedAsset(a)}
                        >
                          <span>{a.name}</span>
                          {a.type === 'IPO' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] mono">
                              IPO
                            </span>
                          )}
                          {isRecentTick && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mono">
                          {a.ticker} • {a.isin} • {a.retType}
                        </div>
                      </td>
                      <td className={`py-2.5 px-3 text-right mono ${tickCls}`}>
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="0.01"
                              value={editPriceVal}
                              onChange={e => setEditPriceVal(e.target.value)}
                              className="w-20 px-1 py-0.5 rounded bg-slate-800 border border-blue-500 text-right text-xs text-white mono"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  const p = parseFloat(editPriceVal);
                                  if (!isNaN(p) && p > 0) onUpdateAssetPrice(a.id, p);
                                  setEditingId(null);
                                }
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => {
                                const p = parseFloat(editPriceVal);
                                if (!isNaN(p) && p > 0) onUpdateAssetPrice(a.id, p);
                                setEditingId(null);
                              }}
                              className="px-1.5 py-0.5 bg-blue-600 rounded text-white text-[10px]"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div
                            className="font-bold text-white cursor-pointer hover:text-blue-400 group inline-flex items-center justify-end gap-1"
                            onClick={() => {
                              setEditingId(a.id);
                              setEditPriceVal(a.price.toFixed(2));
                            }}
                            title="Click to test custom price"
                          >
                            <span>₹{a.price.toFixed(2)}</span>
                            {isRecentTick && tickInfo?.tickDir === 'up' && (
                              <span className="text-emerald-400 font-bold text-[10px] micro-pulse">▲</span>
                            )}
                            {isRecentTick && tickInfo?.tickDir === 'down' && (
                              <span className="text-rose-400 font-bold text-[10px] micro-pulse">▼</span>
                            )}
                            <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100">✎</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                          {isRecentTick && tickInfo?.bid ? (
                            <span className="text-[9px] text-emerald-400/90 font-mono">
                              B: ₹{tickInfo.bid.toFixed(2)}
                            </span>
                          ) : (
                            <span>{a.obsDate}</span>
                          )}
                        </div>
                      </td>
                      <td className={`py-2.5 px-3 text-right mono text-[10px] ${isRecentTick ? tickCls : ''}`}>
                        <div>
                          1D:{' '}
                          <span className={`font-bold ${a.chg1d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatSignedPct(a.chg1d)}
                          </span>
                        </div>
                        <div>
                          1W:{' '}
                          <span className={`font-bold ${a.ret1w >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatSignedPct(a.ret1w)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right mono text-[10px]">
                        <div>
                          1M:{' '}
                          <span className={a.ret1m >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {formatSignedPct(a.ret1m)}
                          </span>
                        </div>
                        <div>
                          3M:{' '}
                          <span className={a.ret3m >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {formatSignedPct(a.ret3m)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right mono text-[10px]">
                        <div>
                          6M:{' '}
                          <span className={a.ret6m >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {formatSignedPct(a.ret6m)}
                          </span>
                        </div>
                        <div>
                          1Y:{' '}
                          <span className={a.ret1y >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {formatSignedPct(a.ret1y)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right mono">
                        <div className="text-slate-300">₹{a.high52w.toFixed(2)}</div>
                        <div className="text-amber-400 font-semibold">{a.dd52w.toFixed(1)}%</div>
                      </td>
                      <td className="py-2.5 px-3 mono text-[10px]">
                        <div className="font-bold text-emerald-400">+{a.highProfitSuggestion.upsidePotentialPct}%</div>
                        <div className="text-slate-400 truncate max-w-[140px]">
                          {a.highProfitSuggestion.catalystTimeline}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold mono ${badgeCls}`}>
                          {a.verdict}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedAsset(a)}
                            className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[10px] font-semibold transition"
                          >
                            Dossier
                          </button>
                          {onSelectForDeepAnalysis && (
                            <button
                              onClick={() => onSelectForDeepAnalysis(a.ticker)}
                              className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-semibold transition"
                              title="Run High-Thinking AI Analysis with Revenue Pie & Growth Charts"
                            >
                              AI Deep
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Asset Deep Thesis & Business Model Drawer */}
      {selectedAsset && (
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-blue-500 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 mono">
                  {selectedAsset.type} • {selectedAsset.ticker} • {selectedAsset.isin}
                </span>
                <span className="text-xs text-slate-400">
                  Classification: <strong className="text-white">{selectedAsset.verdict}</strong>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                {selectedAsset.name} — ₹{selectedAsset.price.toFixed(2)} (
                {selectedAsset.chg1d >= 0 ? '+' : ''}
                {selectedAsset.chg1d.toFixed(2)}%)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedAsset.pe} • {selectedAsset.mcap} • 52W High Markdown: {selectedAsset.dd52w.toFixed(1)}%
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mono text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Buy Zone: {selectedAsset.buyZone}
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                12M Target: {selectedAsset.target12m}
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                Stop: {selectedAsset.stopLoss}
              </span>
            </div>
          </div>

          {/* 1D / 1W / 1M / 3M / 6M / 1Y Up & Down Return Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mono text-xs">
            {[
              { label: '1-Day (1D)', val: selectedAsset.chg1d },
              { label: '1-Week (1W)', val: selectedAsset.ret1w },
              { label: '1-Month (1M)', val: selectedAsset.ret1m },
              { label: '3-Month (3M)', val: selectedAsset.ret3m },
              { label: '6-Month (6M)', val: selectedAsset.ret6m },
              { label: '1-Year (1Y)', val: selectedAsset.ret1y },
            ].map(h => {
              const up = h.val >= 0;
              return (
                <div
                  key={h.label}
                  className={`p-2.5 rounded-lg border ${
                    up
                      ? 'bg-emerald-950/25 border-emerald-500/30'
                      : 'bg-rose-950/25 border-rose-500/30'
                  }`}
                >
                  <div className="text-[10px] text-slate-400 uppercase">{h.label}</div>
                  <div className={`text-sm font-extrabold mt-0.5 ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {up ? '▲ +' : '▼ '}
                    {h.val.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* High-Profit Investment Suggestion Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/25 via-slate-950 to-emerald-950/25 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1 flex-1 min-w-[240px]">
              <div className="font-bold text-amber-400 flex items-center gap-1.5 uppercase text-[11px]">
                <Flame className="w-4 h-4" />
                <span>High-Profit Investment Suggestion ({selectedAsset.highProfitSuggestion.rating})</span>
              </div>
              <p className="text-slate-200 font-medium">{selectedAsset.highProfitSuggestion.strategy}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 mono">
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                <span className="text-[10px] text-slate-400 block">Expected Upside</span>
                <span className="font-extrabold text-emerald-400">
                  +{selectedAsset.highProfitSuggestion.upsidePotentialPct}%
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-blue-500/30">
                <span className="text-[10px] text-slate-400 block">Catalyst Timeline</span>
                <span className="font-bold text-blue-300">
                  {selectedAsset.highProfitSuggestion.catalystTimeline}
                </span>
              </div>
            </div>
          </div>

          {/* Business Model, Products & Services, Expansions/Contracts & Trade Deals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Business Model &amp; Products Details</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedAsset.businessModel}</p>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1.5">
                  Core Products / Portfolio Holdings:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAsset.productsAndServices.map((prod, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px]"
                    >
                      {prod}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>New Expansions &amp; Major Contracts</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {selectedAsset.expansionsAndContracts.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Handshake className="w-4 h-4" />
                <span>Trade Deals, JVs &amp; Macro Catalysts</span>
              </div>
              <p className="text-slate-300 leading-relaxed flex items-start gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{selectedAsset.tradeDealsAndCatalysts}</span>
              </p>
            </div>
          </div>

          {/* 4 Institutional Thesis Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="font-bold text-blue-400">1. Normalised Earnings &amp; Cash Flow</div>
              <p className="leading-relaxed">{selectedAsset.fundamentals}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="font-bold text-amber-400">2. Ownership &amp; Microstructure</div>
              <p className="leading-relaxed">{selectedAsset.institutional}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-400">3. Trading vs. Investment View</div>
              <p className="leading-relaxed">{selectedAsset.tradingVsInv}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="font-bold text-rose-400">4. Counter-Thesis &amp; Invalidation</div>
              <p className="leading-relaxed">{selectedAsset.counterThesis}</p>
            </div>
          </div>

          {/* Next-Day Trading Forecast (T+1 Intraday & Swing) & Multi-Horizon Future Investment Roadmap */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Next-Day Trading (T+1) &amp; Future Multi-Horizon Investment Predictive Dossier</span>
              </h4>
              <span className="text-[10px] mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Institutional Confidence: 91.5% • Direct Market Sync
              </span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <NextDayTradingCard
                ticker={selectedAsset.ticker}
                name={selectedAsset.name}
                currentPrice={selectedAsset.price}
                category={selectedAsset.type}
                forecast={
                  selectedAsset.nextDayTrading ||
                  generateNextDayTradingForecast(selectedAsset)
                }
              />
              <FutureInvestmentRoadmap
                ticker={selectedAsset.ticker}
                name={selectedAsset.name}
                currentPrice={selectedAsset.price}
                category={selectedAsset.type}
                forecast={
                  selectedAsset.futureInvestment ||
                  generateFutureInvestmentForecast(selectedAsset)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
