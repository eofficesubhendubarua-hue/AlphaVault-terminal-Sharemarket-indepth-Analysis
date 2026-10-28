import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  TrendingDown,
  ShieldCheck,
  Cpu,
  BellRing,
  Bot,
  ChevronLeft,
  ChevronRight,
  Landmark,
} from 'lucide-react';

export type NavTab = 'autopilot' | 'radar' | 'deep' | 'matrix' | 'drawdowns' | 'gatekeeper' | 'aladdin' | 'alerts';

interface NavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const TABS = [
  { id: 'autopilot' as NavTab, label: 'Argon-4 Autopilot', shortLabel: 'Argon-4', icon: Bot, badge: 'Quant Bot' },
  { id: 'radar' as NavTab, label: 'Daily Radar', shortLabel: 'Radar', icon: Compass, badge: 'Automated' },
  { id: 'deep' as NavTab, label: 'AI Deep Audit', shortLabel: 'AI Deep', icon: Sparkles, badge: 'Thinking' },
  { id: 'matrix' as NavTab, label: '19-Asset Matrix', shortLabel: 'Matrix', icon: Layers, count: '19' },
  { id: 'aladdin' as NavTab, label: 'Global Institutional Desks (BlackRock • GS • Jefferies • Rothschild)', shortLabel: 'Global Desks', icon: Landmark, badge: 'Aladdin • GS • Rothschild' },
  { id: 'alerts' as NavTab, label: 'Profit Hunter & Alerts', shortLabel: 'Alerts', icon: BellRing, badge: 'Dips' },
  { id: 'drawdowns' as NavTab, label: 'Selling Heatmap & Watchlist', shortLabel: 'Heatmap', icon: TrendingDown, badge: 'Heatmap' },
  { id: 'gatekeeper' as NavTab, label: 'Watchlist Lab', shortLabel: 'Watchlist', icon: ShieldCheck, badge: '5-Gate' },
];

export const DesktopNavbar: React.FC<NavProps> = ({ activeTab, onTabChange }) => {
  const navRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!navRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Automatically scroll active tab into view when changed
  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    checkScroll();
  }, [activeTab, checkScroll]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!navRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    navRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 250);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    if (e.deltaY !== 0) {
      navRef.current.scrollLeft += e.deltaY * 1.2;
      checkScroll();
    }
  };

  return (
    <div className="hidden md:flex items-center relative max-w-7xl mx-auto px-2 sm:px-4 pb-2 group">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute left-1 z-20 p-1.5 rounded-full bg-slate-900/95 border border-slate-700 text-slate-200 hover:text-white hover:bg-blue-600 hover:border-blue-500 shadow-xl shadow-black/80 transition-all flex items-center justify-center -translate-y-0.5 cursor-pointer backdrop-blur-md"
          title="Scroll Tabs Left"
          aria-label="Scroll Tabs Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Tabs Horizontal Track */}
      <div
        ref={navRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 w-full tab-scroll-track"
        style={{ scrollbarWidth: 'thin' }}
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 whitespace-nowrap cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40 ring-1 ring-blue-400/30'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-medium whitespace-nowrap">{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold mono whitespace-nowrap ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-1 z-20 p-1.5 rounded-full bg-slate-900/95 border border-slate-700 text-slate-200 hover:text-white hover:bg-blue-600 hover:border-blue-500 shadow-xl shadow-black/80 transition-all flex items-center justify-center -translate-y-0.5 cursor-pointer backdrop-blur-md"
          title="Scroll Tabs Right"
          aria-label="Scroll Tabs Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const MobileBottomNav: React.FC<NavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/98 border-t border-slate-800 backdrop-blur-xl px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-between gap-1 max-w-md mx-auto overflow-x-auto no-scrollbar py-0.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate(10);
                }
                onTabChange(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-90 cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'text-blue-400 bg-blue-950/70 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {tab.id === 'alerts' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 animate-pulse" />
                )}
                {tab.id === 'deep' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 absolute -top-0.5 -right-0.5 animate-pulse" />
                )}
              </div>
              <span className="text-[9px] mt-0.5 tracking-tight truncate max-w-[55px]">
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
