import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Cpu,
  Download,
  Upload,
  Check,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Monitor,
  X,
  Sparkles,
  Server,
  RefreshCw,
} from 'lucide-react';
import { StreamSpeed } from '../hooks/useRealTimeMarketSync';
import { WatchlistAsset, CustomAssetItem } from '../types/investment';

interface EngineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamSpeed: StreamSpeed;
  onStreamSpeedChange: (speed: StreamSpeed) => void;
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
  streamSource: 'STREAM_SSE' | 'DIRECT_QUANT_FEED';
  assets: WatchlistAsset[];
  customAssets: CustomAssetItem[];
  onImportAssets?: (imported: WatchlistAsset[]) => void;
}

export const EngineSettingsModal: React.FC<EngineSettingsModalProps> = ({
  isOpen,
  onClose,
  streamSpeed,
  onStreamSpeedChange,
  isLiveStreaming,
  onToggleLiveStream,
  streamSource,
  assets,
  customAssets,
  onImportAssets,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  const permanentUrl = 'https://eofficesubhendubarua-hue.github.io/AlphaVault-terminal-Sharemarket-indepth-Analysis/';

  useEffect(() => {
    try {
      const stored = localStorage.getItem('alphavault_gemini_api_key') || '';
      setApiKey(stored);
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('alphavault_gemini_api_key', apiKey.trim());
      setSavedKeySuccess(true);
      setTimeout(() => setSavedKeySuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearApiKey = () => {
    try {
      localStorage.removeItem('alphavault_gemini_api_key');
      setApiKey('');
      setSavedKeySuccess(true);
      setTimeout(() => setSavedKeySuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(permanentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportJson = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      operator: 'Sri Subhendu Barua',
      clientId: 'S52773407',
      watchlistAssets: assets,
      customAssets: customAssets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphavault_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b111e] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl shadow-blue-950/40 text-slate-200">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#0b111e]/95 backdrop-blur-md px-5 py-4 border-b border-slate-800/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                AlphaVault Terminal Engine Configuration
              </h2>
              <p className="text-[11px] text-slate-400">
                Operator Profile: <span className="text-emerald-400 font-semibold mono">Sri Subhendu Barua</span> • Client ID: <span className="text-blue-400 font-semibold mono">S52773407</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 text-xs">
          {/* Section 1: Permanent Free Cloud Deployment */}
          <div className="glass-card rounded-xl p-4 border border-blue-500/30 bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">Live Permanent Website (Free Forever)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold mono">
                CDN ACTIVE • NO EXPIRY
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This terminal is permanently published to GitHub Pages. It runs 100% free of cost with zero monthly subscriptions, zero server maintenance, and automated continuous synchronization.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                readOnly
                value={permanentUrl}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] mono text-slate-300 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-[11px] transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
              </button>
              <a
                href={permanentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-[11px] transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </a>
            </div>
          </div>

          {/* Section 2: Gemini AI Key Setup */}
          <div className="glass-card rounded-xl p-4 border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">Free Google AI Studio Key (Optional)</span>
              </div>
              <span className="text-[10px] text-slate-400 mono">
                Client-Side In-Browser Storage
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AlphaVault Terminal includes a full <strong>Deterministic CFA Quant Engine</strong> that functions 100% free with zero keys or subscriptions. If you want direct Google AI Studio live neural synthesis in-browser, enter your free API Key below:
            </p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste your free AI Studio API key (AIzaSy...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition"
                >
                  Save
                </button>
                {apiKey && (
                  <button
                    onClick={handleClearApiKey}
                    className="px-3 py-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-300 rounded-lg text-xs transition"
                  >
                    Clear
                  </button>
                )}
              </div>
              {savedKeySuccess && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mono">
                  <Check className="w-3.5 h-3.5" />
                  <span>Key configuration updated successfully in browser memory!</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Live Market Sync Engine Settings */}
          <div className="glass-card rounded-xl p-4 border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">Continuous Perpetual Synchronization</span>
              </div>
              <span className="text-[10px] text-slate-400 mono">
                Active Source: <strong className="text-emerald-400">{streamSource}</strong>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">Stream State</label>
                <button
                  onClick={onToggleLiveStream}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-2 ${
                    isLiveStreaming
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>{isLiveStreaming ? 'LIVE TICKING ACTIVE' : 'PAUSED (CLICK TO RESUME)'}</span>
                </button>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">Tick Frequency Speed</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onStreamSpeedChange('ultra')}
                    className={`py-1 rounded text-[11px] font-bold mono transition ${
                      streamSpeed === 'ultra' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚡ 500ms
                  </button>
                  <button
                    onClick={() => onStreamSpeedChange('fast')}
                    className={`py-1 rounded text-[11px] font-bold mono transition ${
                      streamSpeed === 'fast' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1.0s
                  </button>
                  <button
                    onClick={() => onStreamSpeedChange('normal')}
                    className={`py-1 rounded text-[11px] font-bold mono transition ${
                      streamSpeed === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2.0s
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Data Backup & Angel One Portfolio Export */}
          <div className="glass-card rounded-xl p-4 border border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-400" />
                <span>Export AlphaVault Research Backup</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Download all 19 Gatekeeper assets, custom portfolios, and quantitative signals to JSON.
              </p>
            </div>
            <button
              onClick={handleExportJson}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="mono">AlphaVault Terminal v2.0 • 2026 Institutional Build</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
