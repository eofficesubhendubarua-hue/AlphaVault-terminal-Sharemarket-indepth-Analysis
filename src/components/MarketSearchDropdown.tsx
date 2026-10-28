import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MarketDirectoryItem,
  searchMarketDirectory,
  SEARCHABLE_MARKET_DIRECTORY,
} from '../data/marketDirectory';
import { AssetCategory } from '../types/investment';
import {
  Search,
  Sparkles,
  Plus,
  Check,
  TrendingDown,
  TrendingUp,
  X,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface MarketSearchDropdownProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (item: MarketDirectoryItem) => void;
  onQuickAnalyze?: (ticker: string) => void;
  onAddToWatchlist?: (item: MarketDirectoryItem) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  isInWatchlist?: (ticker: string) => boolean;
  onKeyDownEnter?: () => void;
  categoryFilterHint?: AssetCategory | 'ALL';
  showCategoryBadgeInInput?: boolean;
  dropdownAlign?: 'left' | 'right';
  idPrefix?: string;
}

export const MarketSearchDropdown: React.FC<MarketSearchDropdownProps> = ({
  value,
  onChange,
  onSelect,
  onQuickAnalyze,
  onAddToWatchlist,
  placeholder = 'Search stocks, ETFs, mutual funds (e.g. TCS, Tata Consultancy, Reliance, Gold)...',
  className = '',
  inputClassName = '',
  autoFocus = false,
  isInWatchlist,
  onKeyDownEnter,
  categoryFilterHint = 'ALL',
  showCategoryBadgeInInput = true,
  dropdownAlign = 'left',
  idPrefix = 'search',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryTab, setCategoryTab] = useState<'ALL' | AssetCategory>(categoryFilterHint);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search results
  const searchResults = useMemo(() => {
    if (!value || !value.trim()) {
      // If focused and empty, show popular marquee assets
      const popular = SEARCHABLE_MARKET_DIRECTORY.filter(item => item.isPopular);
      if (categoryTab !== 'ALL') {
        return popular.filter(item => item.type === categoryTab).slice(0, 8);
      }
      return popular.slice(0, 8);
    }

    return searchMarketDirectory(value, categoryTab === 'ALL' ? undefined : categoryTab, 12);
  }, [value, categoryTab]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index on results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
        handleSelectItem(searchResults[highlightedIndex]);
      } else if (onKeyDownEnter) {
        setIsOpen(false);
        onKeyDownEnter();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectItem = (item: MarketDirectoryItem) => {
    onSelect(item);
    setIsOpen(false);
  };

  const getCategoryBadgeClass = (type: AssetCategory) => {
    switch (type) {
      case 'EQUITY':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ETF':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'MF':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'IPO':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'COMMODITY':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  // Highlight matching text in name/ticker
  const renderHighlighted = (text: string, highlightQuery: string) => {
    if (!highlightQuery.trim()) return text;
    const q = highlightQuery.trim();
    const regex = new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark key={i} className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          id={`${idPrefix}-input`}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          onChange={e => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          className={`w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-20 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 mono transition ${inputClassName}`}
        />

        {/* Clear & Tag Container */}
        <div className="absolute right-2.5 flex items-center gap-1.5 pointer-events-auto">
          {value.trim() && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-md transition"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {showCategoryBadgeInInput && value.trim() && (
            <span className="text-[10px] font-bold mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 hidden sm:inline-block">
              {searchResults[0]?.type || 'EQUITY'}
            </span>
          )}
        </div>
      </div>

      {/* POPUP DROPDOWN AUTOCOMPLETE MODAL */}
      {isOpen && (
        <div
          className={`absolute ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-full min-w-[340px] sm:min-w-[480px] max-w-[620px] z-50 rounded-2xl bg-[#090f1b] border border-cyan-500/40 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden animate-fadeIn`}
          style={{ maxHeight: '480px' }}
        >
          {/* Top Bar with Category Filter Pills */}
          <div className="p-2.5 bg-[#050a14] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px] mono text-slate-400">
              <span className="font-bold text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                MARKET DIRECTORY SUGGESTIONS
              </span>
              <span>•</span>
              <span>{value.trim() ? `Search: "${value}"` : 'Popular Assets'}</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[10px] mono">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'EQUITY', label: 'Stocks' },
                { id: 'ETF', label: 'ETFs' },
                { id: 'MF', label: 'Mutual Funds' },
                { id: 'IPO', label: 'IPOs' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryTab(tab.id as 'ALL' | AssetCategory)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    categoryTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Items List */}
          <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-800/60 no-scrollbar">
            {searchResults.length > 0 ? (
              searchResults.map((item, idx) => {
                const isSelected = highlightedIndex === idx;
                const inWatchlist = isInWatchlist ? isInWatchlist(item.ticker) : false;

                return (
                  <div
                    key={item.ticker + idx}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelectItem(item)}
                    className={`p-3 transition cursor-pointer flex items-center justify-between gap-3 text-xs mono ${
                      isSelected ? 'bg-[#0f1d35] border-l-4 border-l-cyan-400' : 'hover:bg-[#0c1527]'
                    }`}
                  >
                    {/* Left: Ticker, Name, Category Tag & Sector */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm tracking-tight">
                          {renderHighlighted(item.ticker, value)}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${getCategoryBadgeClass(
                            item.type
                          )}`}
                        >
                          {item.type === 'EQUITY' ? 'STOCK' : item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                          {item.exchange}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-medium truncate mt-0.5">
                        {renderHighlighted(item.name, value)}
                      </div>

                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        <span className="text-cyan-400/90">{item.sectorOrTheme}</span>
                        {item.pe && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">
                              {typeof item.pe === 'number' ? `P/E ${item.pe}x` : item.pe}
                            </span>
                          </>
                        )}
                        {item.marketCapOrAum && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">{item.marketCapOrAum}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Price, 1D Return & Action Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0 text-right">
                      <div>
                        <div className="font-bold text-white text-xs sm:text-sm">
                          {item.currency}
                          {item.price.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div
                          className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                            item.change1d < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.change1d < 0 ? (
                            <TrendingDown className="w-2.5 h-2.5" />
                          ) : (
                            <TrendingUp className="w-2.5 h-2.5" />
                          )}
                          <span>
                            {item.change1d > 0 ? `+${item.change1d}%` : `${item.change1d}%`}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        {onAddToWatchlist && (
                          <button
                            type="button"
                            onClick={() => {
                              onAddToWatchlist(item);
                            }}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                              inWatchlist
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                            }`}
                            title={inWatchlist ? 'Already in Watchlist' : 'Add to Core Watchlist & Heatmap'}
                          >
                            {inWatchlist ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="hidden sm:inline text-[10px]">Tracked</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="hidden sm:inline text-[10px]">Watchlist</span>
                              </>
                            )}
                          </button>
                        )}

                        {onQuickAnalyze && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              onQuickAnalyze(item.ticker);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                            title="Run instant AI Deep Audit"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-200" />
                            <span>Analyze</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-5 text-center space-y-2">
                <p className="text-xs text-slate-300 font-semibold">
                  No directory match found for "{value}"
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  You can still click <strong>Analyze Asset</strong> below. Gemini 4 Argon will conduct an on-demand financial audit on this symbol across the entire Indian &amp; Global stock exchange registry!
                </p>
                {onQuickAnalyze && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onQuickAnalyze(value.toUpperCase().trim());
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs mono transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze "{value.toUpperCase().trim()}" with Gemini 4 Argon</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Footer Ribbon */}
          <div className="p-2 bg-[#04070e] border-t border-slate-800 text-[10px] mono text-slate-400 flex items-center justify-between px-3">
            <span>Use ↑ ↓ keys to navigate, Enter to select, Esc to dismiss</span>
            <span className="text-cyan-400 hidden sm:inline">120+ Indian Stocks • ETFs • MFs • IPOs</span>
          </div>
        </div>
      )}
    </div>
  );
};
