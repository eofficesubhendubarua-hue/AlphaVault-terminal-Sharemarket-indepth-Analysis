import React, { useState, useMemo, useRef } from 'react';
import { WatchlistAsset, AssetCategory } from '../types/investment';
import {
  computeBSMGreeks,
  formatSignedPct,
  formatCurrency,
  getRiskAwareAccumulationRef,
  getDeskFlag,
  getEtfPremiumDiscount,
  getEvidenceGate,
  getDailyResearchAction,
  BSMGreeksResult,
} from '../utils/quantLogic';
import {
  parseUploadedSpreadsheetText,
  SAMPLE_CSV_TEMPLATE,
  autoDetectAssetCategory,
} from '../utils/fileImportParser';
import { MarketSearchDropdown } from './MarketSearchDropdown';
import {
  MarketDirectoryItem,
  convertDirectoryItemToWatchlistAsset,
} from '../data/marketDirectory';
import {
  Calculator,
  AlertTriangle,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  FileSpreadsheet,
  RotateCcw,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface MicrostructureProps {
  assets: WatchlistAsset[];
  onSelectForDeepAnalysis?: (ticker: string) => void;
  onAddWatchlistAssets?: (newAssets: WatchlistAsset[]) => void;
  onResetWatchlistAssets?: () => void;
}

type HeatmapPillFilter = 'ALL' | 'DAY_FALL_3_5' | 'DEEP_1M_3M' | 'ETF_PREMIUM' | 'MF_NAVS';

export const MicrostructureAndDrawdowns: React.FC<MicrostructureProps> = ({
  assets,
  onSelectForDeepAnalysis,
  onAddWatchlistAssets,
  onResetWatchlistAssets,
}) => {
  // Search Box for New Stock Analysis & CSV Upload state
  const [newAssetSearch, setNewAssetSearch] = useState('');
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Core portfolio watchlist (Image 1) state
  const [watchlistFilter, setWatchlistFilter] = useState('');
  const [sortByPullback, setSortByPullback] = useState(false);

  // Selling pressure & value-qualification heatmap (Image 2) state
  const [heatmapPill, setHeatmapPill] = useState<HeatmapPillFilter>('ALL');

  // BSM Calculator state
  const [spot, setSpot] = useState(22600);
  const [strike, setStrike] = useState(22600);
  const [iv, setIv] = useState(16.45);
  const [days, setDays] = useState(4);
  const [greeks, setGreeks] = useState<BSMGreeksResult>(() =>
    computeBSMGreeks(22600, 22600, 16.45, 4)
  );

  const handleRecalcBSM = (e: React.FormEvent) => {
    e.preventDefault();
    setGreeks(computeBSMGreeks(spot, strike, iv, days));
  };

  // CSV File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (!text) return;
      const parsed = parseUploadedSpreadsheetText(text);
      if (parsed.length > 0) {
        onAddWatchlistAssets?.(parsed);
        setUploadStatusMsg(
          `Successfully imported ${parsed.length} asset(s) from "${file.name}" into your watchlist & heatmap!`
        );
        if (parsed[0] && onSelectForDeepAnalysis) {
          // prefill first item for deep audit
        }
      } else {
        setUploadStatusMsg(`Could not find valid asset rows in "${file.name}". Please ensure headers like Ticker, Name, Price are present.`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Template download
  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alphavault_sample_assets.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add stock/ETF/MF directly from the market directory dropdown to Core Watchlist & Heatmap
  const handleAddMarketItemToWatchlist = (item: MarketDirectoryItem, shouldFilterWatchlist = false) => {
    const isAlreadyIn = assets.some(a => a.ticker.toUpperCase() === item.ticker.toUpperCase());
    if (!isAlreadyIn) {
      const newAsset = convertDirectoryItemToWatchlistAsset(item);
      onAddWatchlistAssets?.([newAsset]);
      setUploadStatusMsg(`Added ${item.ticker} (${item.name} • ${item.type}) to Core Watchlist & Selling Heatmap! Click "Analyze Asset" to run full CFA Deep Audit.`);
    } else {
      setUploadStatusMsg(`${item.ticker} (${item.name}) is tracked in your active Watchlist & Selling Heatmap.`);
    }
    if (shouldFilterWatchlist) {
      setWatchlistFilter(item.ticker);
    }
  };

  // Quick Analyze from the new stock search box
  const handleQuickAnalyze = () => {
    const q = newAssetSearch.trim();
    if (!q) return;
    if (onSelectForDeepAnalysis) {
      onSelectForDeepAnalysis(q.toUpperCase());
    }
  };

  // 1. FILTERED CORE PORTFOLIO WATCHLIST (Image 1)
  const coreWatchlistAssets = useMemo(() => {
    let list = assets.filter(a => {
      if (!watchlistFilter.trim()) return true;
      const q = watchlistFilter.toLowerCase();
      const flag = getDeskFlag(a).toLowerCase();
      return (
        a.ticker.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        flag.includes(q)
      );
    });

    if (sortByPullback) {
      list = [...list].sort((a, b) => a.chg1d - b.chg1d); // lowest (most negative) first
    }

    return list;
  }, [assets, watchlistFilter, sortByPullback]);

  // 2. FILTERED SELLING PRESSURE & VALUE-QUALIFICATION HEATMAP (Image 2)
  const heatmapAssets = useMemo(() => {
    return assets.filter(a => {
      if (heatmapPill === 'ALL') return true;
      if (heatmapPill === 'DAY_FALL_3_5') {
        return a.chg1d <= -2.5 && a.chg1d >= -5.5;
      }
      if (heatmapPill === 'DEEP_1M_3M') {
        return a.ret1m <= -6.0 || a.ret3m <= -10.0;
      }
      if (heatmapPill === 'ETF_PREMIUM') {
        return a.type === 'ETF';
      }
      if (heatmapPill === 'MF_NAVS') {
        return a.type === 'MF';
      }
      return true;
    });
  }, [assets, heatmapPill]);

  // Heatmap table cell color styling matching Image 2
  const getCellColor = (val: number, isDD = false) => {
    if (isDD) {
      if (val <= -25) return 'bg-[#401216] text-rose-200 font-bold';
      if (val <= -15) return 'bg-[#3b171a] text-rose-300';
      return 'bg-slate-900/60 text-slate-300';
    }
    if (val >= 30) return 'bg-[#0e3b24] text-emerald-300 font-bold';
    if (val > 0) return 'bg-[#0f2e1d] text-emerald-400';
    if (val <= -15) return 'bg-[#4f1319] text-rose-200 font-bold';
    if (val <= -3) return 'bg-[#40141a] text-rose-300';
    if (val < 0) return 'bg-[#33181c] text-amber-200';
    return 'bg-slate-900 text-slate-300';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Box for New Stock Analysis & Upload CSV Control Station */}
      <section className="glass-card rounded-2xl p-4 sm:p-5 border border-cyan-500/40 bg-gradient-to-br from-slate-950 via-[#061220] to-[#040814] shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold mono">
                <Search className="w-3.5 h-3.5" />
                NEW ASSET ANALYSIS &amp; CSV UPLOADER
              </span>
              <span className="text-[11px] font-bold mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Stocks • ETFs • Mutual Funds • IPOs
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 tracking-tight">
              Search New Stock Information &amp; Upload CSV / Spreadsheet
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mt-0.5">
              Type ANY stock (e.g. TCS, Tata Consultancy, Reliance, INFY), ETF, or mutual fund for instant dropdown suggestions and institutional deep audit, or upload a custom CSV/Excel to populate the Core Watchlist and Selling Heatmap.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 mono text-xs self-start lg:self-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.tsv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV / Spreadsheet</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Download sample CSV template for Stocks, ETFs, and Mutual Funds"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">CSV Template</span>
            </button>

            {assets.length > 19 && onResetWatchlistAssets && (
              <button
                onClick={() => {
                  onResetWatchlistAssets();
                  setUploadStatusMsg('Reset watchlist back to the original 19 institutional assets.');
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                title="Reset to default 19 assets"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar Input Row with Autocomplete Dropdown Popup */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 w-full">
            <MarketSearchDropdown
              value={newAssetSearch}
              onChange={setNewAssetSearch}
              onSelect={item => {
                setNewAssetSearch(item.ticker);
                handleAddMarketItemToWatchlist(item, false);
              }}
              onQuickAnalyze={ticker => {
                if (onSelectForDeepAnalysis) onSelectForDeepAnalysis(ticker);
              }}
              onAddToWatchlist={item => handleAddMarketItemToWatchlist(item, false)}
              isInWatchlist={ticker => assets.some(a => a.ticker.toUpperCase() === ticker.toUpperCase())}
              onKeyDownEnter={handleQuickAnalyze}
              placeholder="Enter Stock Ticker, Company Name, ETF, or Mutual Fund (e.g. TCS, Tata Consultancy, INFY, Reliance, Gold)..."
              idPrefix="top-asset-search"
            />
          </div>

          <button
            onClick={handleQuickAnalyze}
            disabled={!newAssetSearch.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold text-xs mono flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shadow-blue-900/30 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze Asset</span>
          </button>
        </div>

        {uploadStatusMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between gap-2">
            <span className="mono">{uploadStatusMsg}</span>
            <button
              onClick={() => setUploadStatusMsg(null)}
              className="text-slate-400 hover:text-white mono text-[10px]"
            >
              ✕
            </button>
          </div>
        )}
      </section>

      {/* SECTION 1: CORE PORTFOLIO WATCHLIST (Exact Image 1 Replica) */}
      <section className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Core portfolio watchlist
            </h3>
            <p className="text-xs text-slate-400">
              NSE closes and AMC NAVs dated 23 Oct 2026. Returns are rolling close-to-close / NAV-to-NAV; ETF iNAV check is separate.
            </p>
          </div>

          {/* Right header controls matching Image 1: Filter ticker input & Sort 1D pullback button */}
          <div className="flex flex-wrap items-center gap-2 mono text-xs">
            <div className="relative w-64 sm:w-72">
              <MarketSearchDropdown
                value={watchlistFilter}
                onChange={setWatchlistFilter}
                onSelect={item => {
                  handleAddMarketItemToWatchlist(item, true);
                }}
                onQuickAnalyze={ticker => {
                  if (onSelectForDeepAnalysis) onSelectForDeepAnalysis(ticker);
                }}
                onAddToWatchlist={item => {
                  handleAddMarketItemToWatchlist(item, true);
                }}
                isInWatchlist={ticker => assets.some(a => a.ticker.toUpperCase() === ticker.toUpperCase())}
                placeholder="Filter ticker, name or flag..."
                inputClassName="py-1.5 text-xs rounded-lg bg-[#0b121e] border-slate-700/80 pl-9"
                dropdownAlign="right"
                showCategoryBadgeInInput={false}
                idPrefix="watchlist-filter"
              />
            </div>

            <button
              onClick={() => setSortByPullback(!sortByPullback)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                sortByPullback
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-[#0d1627] text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <ArrowUpDown className="w-3 h-3 text-cyan-400" />
              <span>Sort 1D pullback</span>
            </button>
          </div>
        </div>

        {/* Watchlist Table Matching Image 1 Columns */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left border-collapse text-xs mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#080d17] text-[11px]">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-2">Type</th>
                <th className="py-2.5 px-3 text-right">Close / NAV</th>
                <th className="py-2.5 px-2 text-right">1D</th>
                <th className="py-2.5 px-2 text-right">1M</th>
                <th className="py-2.5 px-2 text-right">3M</th>
                <th className="py-2.5 px-2 text-right">6M</th>
                <th className="py-2.5 px-2 text-right">1Y</th>
                <th className="py-2.5 px-2 text-right">52W drawdown</th>
                <th className="py-2.5 px-3">Risk-aware accumulation reference</th>
                <th className="py-2.5 px-3">Desk flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#060a12]">
              {coreWatchlistAssets.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-xs font-bold text-slate-300">
                        No watchlist assets match &ldquo;{watchlistFilter}&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Use the search dropdown above to select and track any of 130+ stocks, ETFs, or mutual funds, or clear this filter.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setWatchlistFilter('')}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold mono transition cursor-pointer"
                        >
                          Clear Filter
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                coreWatchlistAssets.map(a => {
                const deskFlag = getDeskFlag(a);
                const riskRef = getRiskAwareAccumulationRef(a);

                return (
                  <tr
                    key={a.id}
                    onClick={() => onSelectForDeepAnalysis && onSelectForDeepAnalysis(a.ticker)}
                    className="hover:bg-[#0c1424] transition cursor-pointer"
                    title={`Click to view in-depth CFA audit for ${a.ticker}`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                      <span>{a.ticker}</span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-300 whitespace-nowrap capitalize">
                      {a.type === 'EQUITY' ? 'Equity' : a.type}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                      {formatCurrency(a.price)}
                    </td>
                    <td
                      className={`py-2.5 px-2 text-right font-semibold whitespace-nowrap ${
                        a.chg1d < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatSignedPct(a.chg1d)}
                    </td>
                    <td
                      className={`py-2.5 px-2 text-right font-semibold whitespace-nowrap ${
                        a.ret1m < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatSignedPct(a.ret1m)}
                    </td>
                    <td
                      className={`py-2.5 px-2 text-right font-semibold whitespace-nowrap ${
                        a.ret3m < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatSignedPct(a.ret3m)}
                    </td>
                    <td
                      className={`py-2.5 px-2 text-right font-semibold whitespace-nowrap ${
                        a.ret6m < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatSignedPct(a.ret6m)}
                    </td>
                    <td
                      className={`py-2.5 px-2 text-right font-semibold whitespace-nowrap ${
                        a.ret1y < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatSignedPct(a.ret1y)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-rose-400 font-semibold whitespace-nowrap">
                      {a.dd52w.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {riskRef}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {deskFlag}
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: SELLING PRESSURE & VALUE-QUALIFICATION HEATMAP (Exact Image 2 Replica) */}
      <section className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Selling pressure &amp; value-qualification heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Verified 23 Oct EOD / NAV inputs. Red cells show negative return or drawdown; amber cells show a premium or missing evidence gate. The heatmap identifies research queues, never automatic purchases.
          </p>
        </div>

        {/* Filter Pills Matching Image 2 */}
        <div className="flex flex-wrap items-center gap-1.5 mono text-xs pt-1">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DAY_FALL_3_5', label: '3–5% day fall' },
            { id: 'DEEP_1M_3M', label: 'Deep 1M / 3M' },
            { id: 'ETF_PREMIUM', label: 'ETF premium blocks' },
            { id: 'MF_NAVS', label: 'MF NAVs' },
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setHeatmapPill(pill.id as HeatmapPillFilter)}
              className={`px-3 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                heatmapPill === pill.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-[#0b121e] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Heatmap Table Matching Image 2 Columns */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left border-collapse text-xs mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#080d17] text-[11px]">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-2">Type</th>
                <th className="py-2.5 px-2 text-center">1D</th>
                <th className="py-2.5 px-2 text-center">1M</th>
                <th className="py-2.5 px-2 text-center">3M</th>
                <th className="py-2.5 px-2 text-center">52W DD</th>
                <th className="py-2.5 px-3 text-center">ETF premium / discount</th>
                <th className="py-2.5 px-3">Evidence gate</th>
                <th className="py-2.5 px-3">Daily research action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#060a12]">
              {heatmapAssets.map(a => {
                const etfPrem = getEtfPremiumDiscount(a);
                const evGate = getEvidenceGate(a);
                const action = getDailyResearchAction(a);

                return (
                  <tr
                    key={a.id}
                    onClick={() => onSelectForDeepAnalysis && onSelectForDeepAnalysis(a.ticker)}
                    className="hover:bg-[#0c1424] transition cursor-pointer"
                  >
                    <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                      <div>{a.ticker}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate max-w-[140px]">
                        {a.name}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-slate-300 capitalize whitespace-nowrap">
                      {a.type === 'EQUITY' ? 'Equity' : a.type}
                    </td>
                    <td className={`py-2 px-2 text-center whitespace-nowrap ${getCellColor(a.chg1d)}`}>
                      {formatSignedPct(a.chg1d)}
                    </td>
                    <td className={`py-2 px-2 text-center whitespace-nowrap ${getCellColor(a.ret1m)}`}>
                      {formatSignedPct(a.ret1m)}
                    </td>
                    <td className={`py-2 px-2 text-center whitespace-nowrap ${getCellColor(a.ret3m)}`}>
                      {formatSignedPct(a.ret3m)}
                    </td>
                    <td className={`py-2 px-2 text-center whitespace-nowrap ${getCellColor(a.dd52w, true)}`}>
                      {a.dd52w.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-center text-slate-300 whitespace-nowrap">
                      {etfPrem.includes('+89.5%') ? (
                        <span className="text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-600/40">
                          {etfPrem}
                        </span>
                      ) : (
                        etfPrem
                      )}
                    </td>
                    <td className="py-2 px-3 text-amber-300 whitespace-nowrap text-[11px]">
                      {evGate}
                    </td>
                    <td className="py-2 px-3 text-cyan-300 whitespace-nowrap text-[11px]">
                      {action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Options Delta-Gamma Sensitivity Calculator */}
      <section className="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-purple-500 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              <span>Interactive Black-Scholes-Merton (BSM) Options Delta-Gamma Calculator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate systemic option Greeks, implied volatility exposure, and expected 1-SD daily index range
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold mono">
            QUANT RISK GAUGES
          </span>
        </div>

        <form onSubmit={handleRecalcBSM} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mono">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Spot Price (S)</label>
            <input
              type="number"
              value={spot}
              onChange={e => setSpot(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Strike (K)</label>
            <input
              type="number"
              value={strike}
              onChange={e => setStrike(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Implied Vol (IV %)</label>
            <input
              type="number"
              step="0.01"
              value={iv}
              onChange={e => setIv(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Days to Expiry (T)</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                step="0.5"
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition active:scale-95 cursor-pointer"
              >
                Compute
              </button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs mono pt-1">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">CALL DELTA (Δ)</span>
            <span className="text-sm font-bold text-emerald-400">{greeks.callDelta.toFixed(3)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">PUT DELTA (Δ)</span>
            <span className="text-sm font-bold text-rose-400">{greeks.putDelta.toFixed(3)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">GAMMA (Γ)</span>
            <span className="text-sm font-bold text-blue-300">{greeks.gamma.toFixed(5)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">VEGA (ν / 1% IV)</span>
            <span className="text-sm font-bold text-amber-300">₹{greeks.vega.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">ATM STRADDLE</span>
            <span className="text-sm font-bold text-white">₹{greeks.straddle.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">1-SD EXPECTED MOVE</span>
            <span className="text-sm font-bold text-purple-300">±{greeks.move1D.toFixed(1)} pts</span>
          </div>
        </div>
      </section>
    </div>
  );
};
