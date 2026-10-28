import React, { useState } from 'react';
import { CustomAssetItem } from '../types/investment';
import { compute5GatekeeperScore, formatSignedPct } from '../utils/quantLogic';
import { MarketSearchDropdown } from './MarketSearchDropdown';
import { PlusCircle, Trash2, Download, ShieldCheck, AlertCircle } from 'lucide-react';

interface GatekeeperProps {
  customAssets: CustomAssetItem[];
  onAddAsset: (item: CustomAssetItem) => void;
  onRemoveAsset: (idx: number) => void;
  onResetToDefaults: () => void;
}

export const GatekeeperWatchlist: React.FC<GatekeeperProps> = ({
  customAssets,
  onAddAsset,
  onRemoveAsset,
  onResetToDefaults,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('EQUITY');
  const [price, setPrice] = useState('227.50');
  const [high52, setHigh52] = useState('345.00');
  const [low52, setLow52] = useState('215.00');
  const [d1, setD1] = useState('1.11');
  const [m1, setM1] = useState('-6.40');
  const [m3, setM3] = useState('-12.50');
  const [m6, setM6] = useState('-15.20');
  const [y1, setY1] = useState('-18.00');
  const [pe, setPe] = useState('6.4');
  const [roce, setRoce] = useState('16.8');
  const [de, setDe] = useState('0.42');
  const [inst, setInst] = useState<'PASS_INSTITUTIONAL' | 'PASS_MODERATE' | 'CAUTION_ILLIQUID' | 'FAIL_GOVERNANCE'>('PASS_INSTITUTIONAL');
  const [notes, setNotes] = useState('Brent crude at $115.76/bbl upstream hedge; Entry: ₹220-228 | Stop: <₹209');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddAsset({
      name: name.trim(),
      type,
      price: parseFloat(price) || 100,
      high52: parseFloat(high52) || 130,
      low52: parseFloat(low52) || 80,
      d1: parseFloat(d1) || 0,
      m1: parseFloat(m1) || 0,
      m3: parseFloat(m3) || 0,
      m6: parseFloat(m6) || 0,
      y1: parseFloat(y1) || 0,
      pe: parseFloat(pe) || 20,
      roce: parseFloat(roce) || 15,
      de: parseFloat(de) || 0.2,
      inst,
      notes: notes.trim(),
    });

    setName('');
    setNotes('');
  };

  const exportCustomCsv = () => {
    const rows = [
      ['Candidate_Name_ISIN', 'Category', 'Price', '52W_High', '52W_Low', '1D_Pct', '1M_Pct', '3M_Pct', '6M_Pct', '12M_Pct', 'PE_or_TER', 'ROCE_Pct', 'DE_or_Pledge', 'Governance_Status', 'Gatekeeper_Score', 'Classification'],
    ];
    customAssets.forEach(a => {
      const q = compute5GatekeeperScore(a);
      rows.push([
        `"${a.name}"`,
        `"${a.type}"`,
        String(a.price),
        String(a.high52),
        String(a.low52),
        String(a.d1),
        String(a.m1),
        String(a.m3),
        String(a.m6),
        String(a.y1),
        String(a.pe),
        String(a.roce),
        String(a.de),
        `"${a.inst}"`,
        String(q.score),
        `"${q.signal}"`,
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alphavault_gatekeeper_register.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 5-Gatekeeper Register Form */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-emerald-500 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold mono text-[10px] uppercase">
                5-Gatekeeper Institutional Verification
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Expandable Watchlist Register &amp; Penny / Value Gatekeeper Lab
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Low nominal share price or steep drop is not proof of value. Every candidate is tested against exact ISIN, normalized P/E, ROCE &gt;15%, 0% pledge, and DCA tranches.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportCustomCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              Export CSV
            </button>
            <button
              onClick={onResetToDefaults}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition"
            >
              Reset Samples
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <div className="sm:col-span-2 relative z-20">
            <label className="block text-[11px] text-slate-400 mb-1">Exact Legal Name, Ticker &amp; ISIN * (Search Whole Market)</label>
            <MarketSearchDropdown
              value={name}
              onChange={setName}
              onSelect={item => {
                setName(`${item.name} (${item.ticker} | ${item.isin || `INE0${item.ticker}2026`})`);
                setType(item.type === 'MF' ? 'MUTUAL_FUND' : item.type);
                setPrice(String(item.price));
                setHigh52(String(item.high52 ? item.high52.toFixed(2) : (item.price * 1.25).toFixed(2)));
                setLow52(String(item.low52 ? item.low52.toFixed(2) : (item.price * 0.75).toFixed(2)));
                setD1(String(item.change1d));
                if (item.ret1m !== undefined) setM1(String(item.ret1m));
                if (item.ret3m !== undefined) setM3(String(item.ret3m));
                if (item.ret6m !== undefined) setM6(String(item.ret6m));
                if (item.ret1y !== undefined) setY1(String(item.ret1y));
                if (typeof item.pe === 'number') setPe(String(item.pe));
              }}
              placeholder="Search stocks, ETFs, mutual funds (e.g. Suzlon, Waaree, TCS, HDFC)..."
              idPrefix="gatekeeper-reg-search"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Category *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="EQUITY">Stock (Equity)</option>
              <option value="SPECULATIVE">Speculative / Penny</option>
              <option value="ETF">ETF (Check iNAV)</option>
              <option value="MUTUAL_FUND">Mutual Fund (Direct)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Price / NAV (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">52W High (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={high52}
              onChange={e => setHigh52(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">52W Low (₹) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={low52}
              onChange={e => setLow52(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">1D Change (%)</label>
            <input
              type="number"
              step="0.01"
              value={d1}
              onChange={e => setD1(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Rolling 1M (%)</label>
            <input
              type="number"
              step="0.01"
              value={m1}
              onChange={e => setM1(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Rolling 3M (%)</label>
            <input
              type="number"
              step="0.01"
              value={m3}
              onChange={e => setM3(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Rolling 6M (%)</label>
            <input
              type="number"
              step="0.01"
              value={m6}
              onChange={e => setM6(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Rolling 12M (%)</label>
            <input
              type="number"
              step="0.01"
              value={y1}
              onChange={e => setY1(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">P/E Multiple</label>
            <input
              type="number"
              step="0.01"
              value={pe}
              onChange={e => setPe(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">ROCE (%)</label>
            <input
              type="number"
              step="0.1"
              value={roce}
              onChange={e => setRoce(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Debt / Equity</label>
            <input
              type="number"
              step="0.01"
              value={de}
              onChange={e => setDe(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Governance Check</label>
            <select
              value={inst}
              onChange={e => setInst(e.target.value as any)}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="PASS_INSTITUTIONAL">0% Pledge | Liquid | Clean Audit</option>
              <option value="PASS_MODERATE">0% Pledge | Moderate Volume</option>
              <option value="CAUTION_ILLIQUID">Micro-Cap / Wide Spread / iNAV Risk</option>
              <option value="FAIL_GOVERNANCE">High Pledge (&gt;10%) / Debt Stress</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">Entry Tranche, Catalyst &amp; Invalidation Stop</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Entry <= ₹225; Stop: < ₹209"
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95"
            >
              + Run Gatekeeper Audit
            </button>
          </div>
        </form>

        {/* Custom Watchlist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/80">
                <th className="py-2.5 px-3">Candidate, ISIN &amp; Governance Status</th>
                <th className="py-2.5 px-2 text-right">Price (₹)</th>
                <th className="py-2.5 px-2 text-right">1D / 1M / 3M</th>
                <th className="py-2.5 px-2 text-right">6M / 12M</th>
                <th className="py-2.5 px-2 text-right">52W Dist%</th>
                <th className="py-2.5 px-2 text-right">P/E &amp; ROCE</th>
                <th className="py-2.5 px-2 text-center">Score</th>
                <th className="py-2.5 px-2">DCA Tranches</th>
                <th className="py-2.5 px-2">Verdict &amp; Rationale</th>
                <th className="py-2.5 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customAssets.map((item, idx) => {
                const q = compute5GatekeeperScore(item);
                return (
                  <tr key={idx} className="hover:bg-slate-900/60 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-emerald-400 mono">
                        {item.type} • D/E: {item.de} • {item.inst}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right mono font-bold text-white">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-right mono text-[11px]">
                      <div>1D: <span className={item.d1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatSignedPct(item.d1)}</span></div>
                      <div>1M: <span className={item.m1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatSignedPct(item.m1)}</span></div>
                    </td>
                    <td className="py-2.5 px-2 text-right mono text-[11px]">
                      <div>6M: <span className={item.m6 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatSignedPct(item.m6)}</span></div>
                      <div>12M: <span className={item.y1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatSignedPct(item.y1)}</span></div>
                    </td>
                    <td className="py-2.5 px-2 text-right mono font-bold text-amber-400">
                      {q.dd52.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2 text-right mono text-slate-300 text-[11px]">
                      <div>P/E: {item.pe}x</div>
                      <div className="text-emerald-400">ROCE: {item.roce}%</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-xs mono ${
                          q.score >= 76
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : q.score >= 50
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {q.score}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[11px] mono">
                      <div className="text-emerald-400">Entry: ₹{q.buyLow}–₹{q.buyHigh}</div>
                      <div className="text-rose-400">Stop: &lt;₹{q.stop}</div>
                    </td>
                    <td className="py-2.5 px-2 max-w-[200px]">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mono mb-1 border ${q.sigCls}`}>
                        {q.signal}
                      </span>
                      <p className="text-[11px] text-slate-300 truncate">{item.notes}</p>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => onRemoveAsset(idx)}
                        className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-900/40 transition"
                        title="Remove from register"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
