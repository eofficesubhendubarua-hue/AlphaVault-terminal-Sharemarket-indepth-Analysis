import React, { useState, useEffect } from 'react';
import { WatchlistAsset, CustomAssetItem, PriceAlertTrigger } from '../types/investment';
import { playAlertChime, sendDesktopNotification } from '../utils/audioAlert';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  TrendingDown,
  TrendingUp,
  Flame,
  AlertTriangle,
  PlusCircle,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface ProfitHunterAlertsProps {
  assets: WatchlistAsset[];
  customAssets?: CustomAssetItem[];
  onSelectAssetForAudit?: (ticker: string) => void;
}

const DEFAULT_ALERTS: PriceAlertTrigger[] = [
  {
    id: 'alt-1',
    ticker: 'BHEL',
    name: 'Bharat Heavy Electricals Ltd',
    targetPrice: 380.0,
    direction: 'BELOW',
    createdAt: '2026-10-23',
    triggered: false,
    notes: 'Deploy Tranche 1 in Buy Zone ₹375–386 near 200-DMA support',
  },
  {
    id: 'alt-2',
    ticker: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    targetPrice: 835.0,
    direction: 'BELOW',
    createdAt: '2026-10-23',
    triggered: false,
    notes: 'Deep dip entry on JLR Europe macro pullback; 9.8x P/E floor',
  },
  {
    id: 'alt-3',
    ticker: 'HINDZINC',
    name: 'Hindustan Zinc Ltd',
    targetPrice: 465.0,
    direction: 'BELOW',
    createdAt: '2026-10-23',
    triggered: false,
    notes: 'Value accumulator at 10.07x P/E with 5.1% dividend yield floor',
  },
  {
    id: 'alt-4',
    ticker: 'TATSILV',
    name: 'Tata Silver ETF',
    targetPrice: 90.0,
    direction: 'BELOW',
    createdAt: '2026-10-23',
    triggered: false,
    notes: 'Silver futures COMEX margin dip; -46.7% off 52W high',
  },
];

export const ProfitHunterAlerts: React.FC<ProfitHunterAlertsProps> = ({
  assets,
  customAssets = [],
  onSelectAssetForAudit,
}) => {
  const [alerts, setAlerts] = useState<PriceAlertTrigger[]>(() => {
    try {
      const saved = localStorage.getItem('alphavault_price_alerts');
      return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
    } catch {
      return DEFAULT_ALERTS;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotifEnabled, setDesktopNotifEnabled] = useState(false);
  const [selectedAssetTicker, setSelectedAssetTicker] = useState<string>('BHEL');
  const [targetPriceInput, setTargetPriceInput] = useState<string>('380');
  const [directionInput, setDirectionInput] = useState<'BELOW' | 'ABOVE'>('BELOW');
  const [notesInput, setNotesInput] = useState<string>('Instant Profit Hunt Dip Trigger');
  const [lastFiredMsg, setLastFiredMsg] = useState<string | null>(null);

  // Save alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('alphavault_price_alerts', JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  // Monitor price alerts whenever asset prices change
  useEffect(() => {
    const updated = alerts.map(alt => {
      if (alt.triggered) return alt;

      // Find asset in core assets or custom register
      const matched = assets.find(
        a => a.ticker.toUpperCase() === alt.ticker.toUpperCase()
      );
      const currentPrice = matched?.price;

      if (currentPrice !== undefined) {
        const isTriggered =
          alt.direction === 'BELOW'
            ? currentPrice <= alt.targetPrice
            : currentPrice >= alt.targetPrice;

        if (isTriggered) {
          const alertMsg = `PRICE ALERT: ${alt.name} (${alt.ticker}) is currently ₹${currentPrice.toFixed(
            2
          )} — Crossed trigger of ₹${alt.targetPrice.toFixed(2)} (${alt.direction})!`;

          setLastFiredMsg(alertMsg);

          if (soundEnabled) {
            playAlertChime(alt.direction === 'BELOW' ? 'dip' : 'target');
          }
          if (desktopNotifEnabled) {
            sendDesktopNotification('AlphaVault Price Alert Fired!', alertMsg);
          }

          return {
            ...alt,
            triggered: true,
            triggeredAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          };
        }
      }
      return alt;
    });

    if (JSON.stringify(updated) !== JSON.stringify(alerts)) {
      setAlerts(updated);
    }
  }, [assets, soundEnabled, desktopNotifEnabled]);

  // Filter valuable / good quality assets currently down / bearish (Instant Profit Hunting)
  const bearishQualityDips = assets.filter(
    a =>
      a.verdict === 'ACCUMULATE' &&
      (a.chg1d <= -1.0 || a.low1dPct <= -2.5 || a.dd52w <= -15.0)
  );

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPriceInput);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const matchedAsset =
      assets.find(a => a.ticker.toUpperCase() === selectedAssetTicker.toUpperCase()) ||
      customAssets.find(c => c.name.toUpperCase().includes(selectedAssetTicker.toUpperCase()));

    const assetName = matchedAsset?.name || selectedAssetTicker;

    const newAlert: PriceAlertTrigger = {
      id: `alt-${Date.now()}`,
      ticker: selectedAssetTicker.toUpperCase(),
      name: assetName,
      targetPrice: priceNum,
      direction: directionInput,
      createdAt: new Date().toISOString().split('T')[0],
      triggered: false,
      notes: notesInput.trim() || undefined,
    };

    setAlerts(prev => [newAlert, ...prev]);
    if (soundEnabled) {
      playAlertChime('success');
    }
    setLastFiredMsg(`Added price trigger for ${newAlert.ticker} at ₹${newAlert.targetPrice} (${newAlert.direction}).`);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleResetAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, triggered: false, triggeredAt: undefined } : a))
    );
  };

  const handleQuickPresetBuyZones = () => {
    const buyZoneAlerts: PriceAlertTrigger[] = assets
      .filter(a => a.verdict === 'ACCUMULATE')
      .slice(0, 4)
      .map((a, i) => {
        const parsedBuyPrice = parseFloat(a.buyZone.replace(/[^0-9.]/g, '')) || a.price * 0.97;
        return {
          id: `preset-${Date.now()}-${i}`,
          ticker: a.ticker,
          name: a.name,
          targetPrice: +parsedBuyPrice.toFixed(2),
          direction: 'BELOW',
          createdAt: new Date().toISOString().split('T')[0],
          triggered: false,
          notes: `Instant Profit Hunt Buy Zone: ${a.buyZone}`,
        };
      });

    setAlerts(prev => [...buyZoneAlerts, ...prev]);
    if (soundEnabled) playAlertChime('success');
    setLastFiredMsg(`Loaded 4 automated Buy Zone dip triggers for high-conviction ACCUMULATE assets.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Audio Settings */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Instant Profit Hunting &amp; Real-Time Price Alert Engine
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mono text-[10px] border border-emerald-500/30">
                  REAL-TIME TRIGGERS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Informs you immediately whenever valuable, high-quality stocks, ETFs, or mutual funds drop into bearish value territory for instant lower-price profit hunting.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mono text-xs">
            <button
              type="button"
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playAlertChime('dip');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition ${
                soundEnabled
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-300" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Chime Sound: ON' : 'Chime Sound: MUTED'}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const res = await sendDesktopNotification(
                  'AlphaVault Notification Test',
                  'Instant Profit Hunting alerts are active on your browser.'
                );
                setDesktopNotifEnabled(res);
                if (soundEnabled) playAlertChime('success');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition ${
                desktopNotifEnabled
                  ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{desktopNotifEnabled ? 'Desktop Notif: ACTIVE' : 'Enable Desktop Alerts'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickPresetBuyZones}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Set Buy Zone Triggers</span>
            </button>
          </div>
        </div>

        {/* Live Active Fired Alert Banner */}
        {lastFiredMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-2 text-xs text-emerald-200 animate-pulse">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{lastFiredMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastFiredMsg(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded mono text-[10px]"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Instant Profit Hunting: Live Quality Bearish Dips */}
      <div className="glass-card rounded-xl p-5 space-y-4 border-l-4 border-l-amber-500">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              Instant Profit Hunting: High-Quality Stocks, ETFs &amp; Funds Currently in Bearish Dip Zone
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Valuable CFA/Institutional ACCUMULATE instruments currently trading at significant discounts, pullbacks, or inside their structural Buy Zones.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold mono text-[10px] border border-amber-500/30">
            {bearishQualityDips.length} DIP OPPORTUNITIES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {bearishQualityDips.map(a => (
            <div
              key={a.ticker}
              className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 transition space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-white">{a.name}</div>
                  <div className="text-[10px] text-slate-400 mono">
                    {a.ticker} • {a.type}
                  </div>
                </div>
                <div className="text-right mono">
                  <div className="font-extrabold text-white">₹{a.price.toFixed(2)}</div>
                  <div className="text-rose-400 font-bold text-[10px]">
                    {a.chg1d >= 0 ? '+' : ''}
                    {a.chg1d.toFixed(2)}% (1D)
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] space-y-0.5">
                <div className="text-amber-400 font-semibold">
                  52W Markdown: <span className="mono">{a.dd52w.toFixed(1)}%</span>
                </div>
                <div className="text-emerald-400 font-semibold">
                  Institutional Buy Zone: <span className="mono">{a.buyZone}</span>
                </div>
                <div className="text-blue-300 font-semibold">
                  Expected Upside: <span className="mono">+{a.highProfitSuggestion.upsidePotentialPct}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 mono truncate max-w-[120px]">
                  {a.highProfitSuggestion.catalystTimeline}
                </span>
                {onSelectAssetForAudit && (
                  <button
                    type="button"
                    onClick={() => onSelectAssetForAudit(a.ticker)}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[10px] transition flex items-center gap-1"
                  >
                    <span>Instant Audit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Set Custom Real-Time Price Alert (Above / Below Triggers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleAddAlert}
          className="lg:col-span-5 glass-card rounded-xl p-5 border-l-4 border-l-blue-500 space-y-3.5 text-xs"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-400" />
              Set Custom Price Alert Trigger
            </h4>
            <span className="text-[10px] text-slate-400 mono">Above / Below Triggers</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Set target price triggers on any stock, ETF, mutual fund, or IPO. When prices cross, the engine plays an audio chime and triggers visual alerts.
          </p>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Instrument / Ticker</label>
            <select
              value={selectedAssetTicker}
              onChange={e => {
                setSelectedAssetTicker(e.target.value);
                const found = assets.find(a => a.ticker === e.target.value);
                if (found) {
                  setTargetPriceInput((found.price * 0.96).toFixed(2));
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 mono"
            >
              <optgroup label="19 Core Institutional Watchlist">
                {assets.map(a => (
                  <option key={a.ticker} value={a.ticker}>
                    {a.name} ({a.ticker} • ₹{a.price.toFixed(2)})
                  </option>
                ))}
              </optgroup>
              {customAssets.length > 0 && (
                <optgroup label="Custom Register Assets">
                  {customAssets.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name} (₹{c.price.toFixed(2)})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Trigger Condition</label>
              <select
                value={directionInput}
                onChange={e => setDirectionInput(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-bold mono"
              >
                <option value="BELOW">Price Drops BELOW (Buy Dip)</option>
                <option value="ABOVE">Price Rises ABOVE (Target)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={targetPriceInput}
                onChange={e => setTargetPriceInput(e.target.value)}
                placeholder="e.g. 380.00"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Action Note / Plan</label>
            <input
              type="text"
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              placeholder="e.g. Buy Tranche 1 (50 shares), Stop loss at ₹358"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            <span>Save Price Alert Trigger</span>
          </button>
        </form>

        {/* Active Alert Triggers Register */}
        <div className="lg:col-span-7 glass-card rounded-xl p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              Active Price Alert Triggers ({alerts.length})
            </h4>
            <span className="text-[10px] text-slate-400 mono">Monitored 24/7 with Audio Chimes</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
                No active price triggers. Use the form or click &ldquo;Auto-Set Buy Zone Triggers&rdquo; above.
              </div>
            ) : (
              alerts.map(alt => {
                const matched = assets.find(a => a.ticker.toUpperCase() === alt.ticker.toUpperCase());
                const currentP = matched?.price;
                const distPct =
                  currentP !== undefined
                    ? (((currentP - alt.targetPrice) / alt.targetPrice) * 100).toFixed(1)
                    : null;

                return (
                  <div
                    key={alt.id}
                    className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 transition ${
                      alt.triggered
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{alt.name}</span>
                        <span className="text-[10px] text-slate-400 mono">({alt.ticker})</span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold mono text-[9px] ${
                            alt.direction === 'BELOW'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {alt.direction === 'BELOW' ? '▼ DROPS BELOW' : '▲ RISES ABOVE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mono">
                        Target: <strong className="text-white">₹{alt.targetPrice.toFixed(2)}</strong>
                        {currentP !== undefined && (
                          <span>
                            {' '}
                            • CMP: ₹{currentP.toFixed(2)} ({distPct && `${distPct}% away`})
                          </span>
                        )}
                      </div>
                      {alt.notes && <p className="text-[10px] text-slate-300">{alt.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {alt.triggered ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mono text-[10px] border border-emerald-500/30">
                            ✓ FIRED at {alt.triggeredAt || 'Target'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleResetAlert(alt.id)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] mono"
                            title="Re-arm alert"
                          >
                            Re-Arm
                          </button>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-bold mono text-[10px] border border-slate-800">
                          Active Monitor
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteAlert(alt.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Delete alert trigger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
