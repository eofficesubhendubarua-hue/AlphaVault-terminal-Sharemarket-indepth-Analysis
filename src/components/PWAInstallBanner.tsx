import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, Smartphone, Tablet, X, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  const deviceTitle = isAndroid || isSmallScreen
    ? 'Install AlphaVault Android App'
    : isIOS
    ? 'Install on iPad & Tablet'
    : 'Install on Windows Desktop & Laptop';

  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 border-b border-blue-500/30 px-3 sm:px-4 py-2 text-xs text-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 flex-shrink-0">
            {isAndroid || isSmallScreen ? (
              <Smartphone className="w-3.5 h-3.5" />
            ) : isIOS ? (
              <Tablet className="w-3.5 h-3.5" />
            ) : (
              <Monitor className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="truncate">
            <span className="font-bold text-white text-[11px] sm:text-xs truncate block sm:inline">
              {deviceTitle}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline ml-2">
              • Run standalone • Automated daily radar • Fast offline access
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] sm:text-xs shadow-md shadow-blue-900/40 transition active:scale-95"
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Install</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition"
            >
              <span>Add to Home</span>
            </button>
          )}

          {!isInstallable && !isIOS && !isSmallScreen && (
            <span className="text-[10px] text-slate-400 hidden lg:inline-block mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
              Browser menu: Install app
            </span>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Tablet className="w-4 h-4 text-emerald-400" /> Install on iPad &amp; Tablet
              </h4>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              1. Tap the <strong className="text-white">Share</strong> icon in your browser toolbar.<br />
              2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.<br />
              3. Launch AlphaVault anytime from your home screen!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
