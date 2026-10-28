import React, { useState, useEffect } from 'react';
import { NavTab, DesktopNavbar, MobileBottomNav } from './components/AndroidNavigation';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { DailyAutomatedRadar } from './components/DailyAutomatedRadar';
import { AssetDeepAnalyzer } from './components/AssetDeepAnalyzer';
import { ScorecardMatrix } from './components/ScorecardMatrix';
import { MicrostructureAndDrawdowns } from './components/MicrostructureAndDrawdowns';
import { GatekeeperWatchlist } from './components/GatekeeperWatchlist';
import { AladdinRiskSuite } from './components/AladdinRiskSuite';
import { ProfitHunterAlerts } from './components/ProfitHunterAlerts';
import { Argon4Autopilot } from './components/Argon4Autopilot';
import { EngineSettingsModal } from './components/EngineSettingsModal';
import { useRealTimeMarketSync } from './hooks/useRealTimeMarketSync';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { WifiOff, RefreshCw, Play, Pause, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('autopilot');
  const [selectedTickerForDeep, setSelectedTickerForDeep] = useState('TATAMOTORS');
  const [istTimeStr, setIstTimeStr] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Primary Continuous Zero-Latency Market Synchronization Hook
  const {
    assets,
    customAssets,
    macroState,
    tickDeltas,
    isLiveStreaming,
    streamSpeed,
    tickCount,
    lastTickIso,
    latencyMs,
    streamSource,
    toggleLiveStream,
    setStreamSpeed,
    forceSyncNow,
    handleUpdateAssetPrice,
    handleAddWatchlistAssets,
    handleResetWatchlistAssets,
    handleAddCustomAsset,
    handleRemoveCustomAsset,
    handleResetCustomAssets,
  } = useRealTimeMarketSync();

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTimeStr(
        now.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDeepAnalyzeTicker = (ticker: string) => {
    setSelectedTickerForDeep(ticker);
    setActiveTab('deep');
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col antialiased relative">
      {/* Top Institutional Compliance Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] text-slate-300 flex items-center justify-between gap-2">
          <div className="truncate">
            <span className="font-bold text-amber-400 mono">COMPLIANCE:</span>{' '}
            <span>Institutional research &amp; decision support • Automated daily radar (8:30 AM &amp; 9:30 PM IST)</span>
          </div>
          <div className="mono text-slate-400 text-[10px] hidden sm:block flex-shrink-0">
            Direct–Growth Default • Gemini 4 Argon
          </div>
        </div>

        {/* Universal PWA Install Banner */}
        <PWAInstallBanner />

        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-emerald-600 to-teal-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-blue-900/40 mono text-xs sm:text-sm flex-shrink-0">
              AV
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate max-w-[220px] sm:max-w-none">
                  AlphaVault Research Terminal
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.2 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
                  <span>2026-10-23</span>
                </span>
                <span className="text-[10px] text-slate-400 mono hidden lg:inline">
                  {istTimeStr}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Continuous Automated Daily Radar (8:30 AM &amp; 9:30 PM) • Gemini 4 Argon High-Thinking Deep Analyzer
              </p>
            </div>
          </div>

          {/* Real-Time Continuous Sync HUD & Stream Controller */}
          <div className="flex flex-wrap items-center gap-2 text-xs mono">
            {/* Live Streaming Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                isLiveStreaming
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
              title="Continuous Real-Time Market Synchronization Status"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLiveStreaming ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isLiveStreaming ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span>{isLiveStreaming ? 'LIVE SYNC: ACTIVE' : 'SYNC: PAUSED'}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                &lt;{latencyMs}ms
              </span>
            </div>

            {/* Stream Speed Selector */}
            <div className="hidden md:flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setStreamSpeed('ultra')}
                className={`px-2 py-0.5 rounded transition ${
                  streamSpeed === 'ultra' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Ultra-fast sub-second tick interval (500ms)"
              >
                ⚡ 500ms
              </button>
              <button
                type="button"
                onClick={() => setStreamSpeed('fast')}
                className={`px-2 py-0.5 rounded transition ${
                  streamSpeed === 'fast' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Fast 1-second interval"
              >
                1s
              </button>
              <button
                type="button"
                onClick={() => setStreamSpeed('normal')}
                className={`px-2 py-0.5 rounded transition ${
                  streamSpeed === 'normal' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Normal 2-second interval"
              >
                2s
              </button>
            </div>

            {/* Play/Pause Stream Button */}
            <button
              type="button"
              onClick={toggleLiveStream}
              className="p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold transition flex items-center gap-1 text-[11px]"
              title={isLiveStreaming ? 'Pause continuous real-time feed' : 'Resume continuous real-time feed'}
            >
              {isLiveStreaming ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{isLiveStreaming ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Instant Force Sync Button */}
            <button
              type="button"
              onClick={forceSyncNow}
              className="p-1 sm:px-2 sm:py-1 rounded-lg bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 font-semibold transition flex items-center gap-1 text-[11px]"
              title="Force immediate zero-latency market tick"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Sync Now</span>
            </button>

            {/* Terminal Engine Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold transition flex items-center gap-1.5 text-[11px]"
              title="Terminal Engine Configuration & API Keys"
            >
              <Settings className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Desktop & Laptop Tab Strip */}
        <DesktopNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      {/* Main Content Area with Bottom Padding on Mobile so bottom bar never obscures content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-5 sm:space-y-6 pb-24 md:pb-8">
        {/* Top Session & Macro Status Strip */}
        {/* Top Session & Macro Status Strip - Live Synchronized */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
          <div className="glass-card rounded-xl p-2.5 sm:p-3 tick-transition">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
              <span>NIFTY / SENSEX</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-white mono flex items-center gap-1.5">
              <span>{macroState.nifty50.price.toFixed(2)}</span>
              <span className={`text-[10px] sm:text-xs font-semibold ${macroState.nifty50.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {macroState.nifty50.changePct >= 0 ? '+' : ''}{macroState.nifty50.changePct}% {macroState.nifty50.tickDir === 'up' ? '▲' : '▼'}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300 mono flex items-center justify-between">
              <span>Sensex: {macroState.sensex.price.toFixed(2)}</span>
              <span className={macroState.sensex.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {macroState.sensex.changePct >= 0 ? '+' : ''}{macroState.sensex.changePct}%
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
              H: {macroState.nifty50.high.toFixed(0)} | L: {macroState.nifty50.low.toFixed(0)}
            </p>
          </div>

          <div className="glass-card rounded-xl p-2.5 sm:p-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
              <span>US MARKETS</span>
              <span className="text-emerald-400">GLOBAL FEED</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-white mono">
              Nasdaq: {macroState.nasdaq.price.toLocaleString()} <span className={macroState.nasdaq.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{macroState.nasdaq.changePct >= 0 ? '+' : ''}{macroState.nasdaq.changePct}%</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300 mono">S&amp;P 500: {macroState.sp500.price.toFixed(2)}</div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Dow: {macroState.dow.price.toLocaleString()} ({macroState.dow.changePct}%)</p>
          </div>

          <div className="glass-card rounded-xl p-2.5 sm:p-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
              <span>FII / DII CASH</span>
              <span className="text-emerald-400">BUFFER</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-emerald-400 mono">FII: +₹{macroState.fiiCashCr} Cr</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-300 mono">DII: +₹{macroState.diiCashCr} Cr</div>
            <p className="text-[9px] sm:text-[10px] text-slate-300 mt-0.5">Net Cash Buffer: +₹{macroState.netCashBufferCr} Cr</p>
          </div>

          <div className="glass-card rounded-xl p-2.5 sm:p-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
              <span>CRUDE &amp; FX</span>
              <span className="text-rose-400">REGIME</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-amber-400 mono">
              Brent: ${macroState.brentCrude.price.toFixed(2)} <span className="text-rose-400 text-[10px] sm:text-xs">+{macroState.brentCrude.changePct}%</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300 mono">USD/INR: {macroState.usdInr.price.toFixed(4)}</div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Gold: ${macroState.gold.price.toFixed(0)} | Silver: ${macroState.silver.price.toFixed(2)}</p>
          </div>

          <div className="glass-card rounded-xl p-2.5 sm:p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
              <span>FII L/S &amp; VIX</span>
              <span className="text-rose-400">DEFENSIVE</span>
            </div>
            <div className="mt-1 text-xs sm:text-sm font-bold text-rose-400 mono">
              FII L/S: {macroState.fiiLsRatio.toFixed(2)} <span className="text-rose-300 text-[10px] sm:text-xs">(88% Short)</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-amber-300 mono">India VIX: {macroState.indiaVix.price.toFixed(2)} (+{macroState.indiaVix.changePct}%)</div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">PCR: {macroState.pcr.toFixed(2)} | Defensive Setup</p>
          </div>
        </section>

        {/* Global Defensive Setup Context Strip */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-amber-400 mono text-[11px]">MACRO DEFENSIVE REGIME:</span>
            <span className="text-slate-300 text-[11px]">
              Broad selling with VIX higher &amp; FII index-future L/S at 0.12. Positive cash flows (FII +₹{macroState.fiiCashCr} Cr &amp; DII +₹{macroState.diiCashCr} Cr) temper—but do not erase—the defensive setup.
            </span>
          </div>
          <span className="text-[10px] font-bold mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            CONTINUOUS ZERO-LATENCY MARKET FEED ACTIVE
          </span>
        </div>

        {/* Tab 0: Argon-4 Quant Autopilot & Autonomous Aladdin Execution Engine */}
        {activeTab === 'autopilot' && (
          <Argon4Autopilot
            assets={assets}
            customAssets={customAssets}
            onSelectAssetForAudit={handleDeepAnalyzeTicker}
            onUpdateAssetPrice={handleUpdateAssetPrice}
          />
        )}

        {/* Tab 1: Daily Automated Radar */}
        {activeTab === 'radar' && (
          <DailyAutomatedRadar onSelectAsset={handleDeepAnalyzeTicker} />
        )}

        {/* Tab 2: AI Deep Audit (Gemini 4 Argon High Thinking) */}
        {activeTab === 'deep' && (
          <AssetDeepAnalyzer
            initialQuery={selectedTickerForDeep}
            onAddToWatchlist={handleAddCustomAsset}
            onAddWatchlistAssets={handleAddWatchlistAssets}
            extraAssets={assets}
          />
        )}

        {/* Tab 3: 19-Asset Performance & Thesis Matrix */}
        {activeTab === 'matrix' && (
          <ScorecardMatrix
            assets={assets}
            onUpdateAssetPrice={handleUpdateAssetPrice}
            onSelectForDeepAnalysis={handleDeepAnalyzeTicker}
            onAddWatchlistAssets={handleAddWatchlistAssets}
            onResetWatchlistAssets={handleResetWatchlistAssets}
            tickDeltas={tickDeltas}
            isLiveStreaming={isLiveStreaming}
            latencyMs={latencyMs}
            tickCount={tickCount}
            onForceSync={forceSyncNow}
          />
        )}

        {/* Tab 4: BlackRock Aladdin Enterprise Risk & Factor Decomposition Suite */}
        {activeTab === 'aladdin' && (
          <AladdinRiskSuite
            assets={assets}
            onSelectAssetForAudit={handleDeepAnalyzeTicker}
          />
        )}

        {/* Tab 5: Instant Profit Hunting & Real-Time Price Alert Engine */}
        {activeTab === 'alerts' && (
          <ProfitHunterAlerts
            assets={assets}
            customAssets={customAssets}
            onSelectAssetForAudit={handleDeepAnalyzeTicker}
          />
        )}

        {/* Tab 6: Drawdowns, 3%-5% Falls, Heatmap & BSM Greeks */}
        {activeTab === 'drawdowns' && (
          <MicrostructureAndDrawdowns
            assets={assets}
            onSelectForDeepAnalysis={handleDeepAnalyzeTicker}
            onAddWatchlistAssets={handleAddWatchlistAssets}
            onResetWatchlistAssets={handleResetWatchlistAssets}
          />
        )}

        {/* Tab 7: Watchlist Lab & 5-Gatekeeper Register */}
        {activeTab === 'gatekeeper' && (
          <GatekeeperWatchlist
            customAssets={customAssets}
            onAddAsset={handleAddCustomAsset}
            onRemoveAsset={handleRemoveCustomAsset}
            onResetToDefaults={handleResetCustomAssets}
          />
        )}
      </main>

      {/* Mobile & Smartphone Bottom Navigation Bar (Docked to very bottom) */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Offline Toast */}
      {!isOnline && (
        <div className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-bounce">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode — Cached institutional assets active.</span>
        </div>
      )}

      {/* Engine Settings & Gemini AI Key Configuration Modal */}
      <EngineSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        streamSpeed={streamSpeed}
        onStreamSpeedChange={setStreamSpeed}
        isLiveStreaming={isLiveStreaming}
        onToggleLiveStream={toggleLiveStream}
        streamSource={streamSource}
        assets={assets}
        customAssets={customAssets}
        onImportAssets={handleAddWatchlistAssets}
      />
    </div>
  );
}
