import React, { useState } from 'react';
import {
  BlockDealItem,
  InstitutionalHoldingActivity,
  InsiderTradingDisclosure,
} from '../types/investment';
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  BadgePercent,
  Calendar,
} from 'lucide-react';

interface InstitutionalIntelligenceViewProps {
  ticker: string;
  category: string;
  blockDeals?: BlockDealItem[];
  institutionalActivity?: InstitutionalHoldingActivity;
  insiderTrading?: InsiderTradingDisclosure[];
}

export const InstitutionalIntelligenceView: React.FC<InstitutionalIntelligenceViewProps> = ({
  ticker,
  category,
  blockDeals = [],
  institutionalActivity,
  insiderTrading = [],
}) => {
  const [activeTab, setActiveTab] = useState<'fii-dii' | 'block-deals' | 'insider'>('fii-dii');
  const [dealFilter, setDealFilter] = useState<'ALL' | 'BLOCK' | 'BULK'>('ALL');

  const filteredDeals = blockDeals.filter(d => {
    if (dealFilter === 'BLOCK') return d.dealType === 'BLOCK_DEAL';
    if (dealFilter === 'BULK') return d.dealType === 'BULK_DEAL';
    return true;
  });

  const totalBlockValue = blockDeals.reduce((sum, d) => sum + d.valueCr, 0);

  return (
    <div className="glass-card rounded-xl p-5 border-l-4 border-l-blue-500 space-y-4 shadow-xl">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mono uppercase">
              Microlevel Market Disclosures
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mono uppercase">
              SEBI SAST • PIT • BSE/NSE Window
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Institutional Radar: Block Deals, FII / DII &amp; Insider Disclosures
          </h3>
          <p className="text-xs text-slate-400">
            Real-time verified exchange filings, marquee institutional block/bulk trades, and promoter open market accumulation for {ticker}.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs mono">
          <button
            type="button"
            onClick={() => setActiveTab('fii-dii')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'fii-dii'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>FII &amp; DII Activity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('block-deals')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'block-deals'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>New Block Deals ({blockDeals.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insider')}
            className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'insider'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Insider &amp; SAST ({insiderTrading.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FII & DII ACTIVITY */}
      {activeTab === 'fii-dii' && institutionalActivity && (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">FII Institutional Stake</span>
              <div className="text-base font-extrabold text-blue-400 mono mt-0.5">
                {institutionalActivity.fiiHoldingPct}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1 mono">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{institutionalActivity.fiiChangeQoq}% QoQ Shift</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">DII Mutual Funds Stake</span>
              <div className="text-base font-extrabold text-emerald-400 mono mt-0.5">
                {institutionalActivity.diiHoldingPct}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-1 mono">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{institutionalActivity.diiChangeQoq}% QoQ Shift</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Promoter / State Stake</span>
              <div className="text-base font-extrabold text-white mono mt-0.5">
                {institutionalActivity.promoterHoldingPct}%
              </div>
              <div className="text-[11px] font-bold text-emerald-300 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>{institutionalActivity.promoterPledgedPct === 0 ? '0.0% Pledged (Clean)' : `${institutionalActivity.promoterPledgedPct}% Pledged`}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Inst. Cash Flow (1M)</span>
              <div className="text-base font-extrabold text-emerald-400 mono mt-0.5">
                +₹{institutionalActivity.netFlow1mCr.toLocaleString('en-IN')} Cr
              </div>
              <div className="text-[11px] text-slate-400 mt-1 mono">
                3M Net: +₹{institutionalActivity.netFlow3mCr.toLocaleString('en-IN')} Cr
              </div>
            </div>
          </div>

          {/* Shareholding Visual Stack Bar */}
          <div className="p-3.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Ownership Distribution &amp; Shareholding Pattern</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold mono">
                {institutionalActivity.institutionalSentiment.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="h-5 w-full bg-slate-800 rounded-lg overflow-hidden flex text-[10px] font-bold text-white mono shadow-inner">
              <div
                style={{ width: `${institutionalActivity.promoterHoldingPct}%` }}
                className="bg-blue-600 flex items-center justify-center truncate px-1 transition-all"
                title={`Promoter: ${institutionalActivity.promoterHoldingPct}%`}
              >
                Promoter {institutionalActivity.promoterHoldingPct}%
              </div>
              <div
                style={{ width: `${institutionalActivity.fiiHoldingPct}%` }}
                className="bg-purple-600 flex items-center justify-center truncate px-1 transition-all"
                title={`FII: ${institutionalActivity.fiiHoldingPct}%`}
              >
                FII {institutionalActivity.fiiHoldingPct}%
              </div>
              <div
                style={{ width: `${institutionalActivity.diiHoldingPct}%` }}
                className="bg-emerald-600 flex items-center justify-center truncate px-1 transition-all"
                title={`DII: ${institutionalActivity.diiHoldingPct}%`}
              >
                DII {institutionalActivity.diiHoldingPct}%
              </div>
              <div
                style={{ width: `${institutionalActivity.publicAndRetailPct}%` }}
                className="bg-amber-600 flex items-center justify-center truncate px-1 transition-all"
                title={`Public/Retail: ${institutionalActivity.publicAndRetailPct}%`}
              >
                Public {institutionalActivity.publicAndRetailPct}%
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Promoter ({institutionalActivity.promoterHoldingPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> FII ({institutionalActivity.fiiHoldingPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> DII ({institutionalActivity.diiHoldingPct}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Public &amp; Retail ({institutionalActivity.publicAndRetailPct}%)</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 mt-2">
              <span className="text-white font-bold block mb-1">Institutional Consensus Verdict:</span>
              <p className="leading-relaxed">{institutionalActivity.fiiDiiTrendSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOCK DEALS & BULK DEALS */}
      {activeTab === 'block-deals' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Filter Deals:</span>
              <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] mono">
                <button
                  type="button"
                  onClick={() => setDealFilter('ALL')}
                  className={`px-2.5 py-0.5 rounded ${dealFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  All ({blockDeals.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDealFilter('BLOCK')}
                  className={`px-2.5 py-0.5 rounded ${dealFilter === 'BLOCK' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Block Window
                </button>
                <button
                  type="button"
                  onClick={() => setDealFilter('BULK')}
                  className={`px-2.5 py-0.5 rounded ${dealFilter === 'BULK' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Bulk Market
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-300 mono">
              <span>Cumulative Value: </span>
              <span className="text-emerald-400 font-bold">₹{totalBlockValue.toLocaleString('en-IN')} Cr</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950 text-[10px] mono">
                  <th className="py-2.5 px-3">Date &amp; Exchange</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Buyer Name</th>
                  <th className="py-2.5 px-3">Seller Name</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Deal Price</th>
                  <th className="py-2.5 px-3 text-right">Value (₹ Cr)</th>
                  <th className="py-2.5 px-3 text-right">% Equity</th>
                  <th className="py-2.5 px-3 text-center">CMP Spread</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 mono">
                {filteredDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3">
                      <div className="text-white font-bold">{deal.date}</div>
                      <span className="text-[10px] text-slate-400">{deal.exchange}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          deal.dealType === 'BLOCK_DEAL'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {deal.dealType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-emerald-300 max-w-[200px] truncate" title={deal.buyer}>
                      {deal.buyer}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 max-w-[200px] truncate" title={deal.seller}>
                      {deal.seller}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">
                      {deal.quantity.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      ₹{deal.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
                      ₹{deal.valueCr.toLocaleString('en-IN')} Cr
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {deal.pctEquityTransacted}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          deal.premiumDiscountPct >= 0
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {deal.premiumDiscountPct >= 0 ? '+' : ''}{deal.premiumDiscountPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INSIDER INFORMATION & SAST DISCLOSURES */}
      {activeTab === 'insider' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-400">
              Statutory Disclosures filed under SEBI (Prohibition of Insider Trading) &amp; (Substantial Acquisition of Shares &amp; Takeovers) Regulations:
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold mono">
              VERIFIED FILINGS
            </span>
          </div>

          <div className="space-y-2.5">
            {insiderTrading.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-blue-500/40 transition space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{item.filingDate}</span>
                    </span>
                    <span className="font-bold text-white text-sm">{item.personName}</span>
                    <span className="text-slate-400 text-xs">({item.designation} • {item.category})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 mono border border-slate-700">
                      {item.sebiRegulation}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold mono border ${
                        item.impactSentiment === 'BULLISH_INSIDER_BUY' || item.impactSentiment === 'PLEDGE_RELEASE_POSITIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : item.impactSentiment === 'BEARISH_INSIDER_SELL' || item.impactSentiment === 'PLEDGE_RISK'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {item.impactSentiment.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mono pt-1 bg-slate-900/60 p-2 rounded">
                  <div>
                    <span className="text-slate-400 text-[10px]">Transaction Type:</span>
                    <div className="font-bold text-white">{item.transactionType.replace(/_/g, ' ')}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Volume &amp; Price:</span>
                    <div className="font-bold text-slate-200">
                      {item.quantity > 0 ? `${item.quantity.toLocaleString('en-IN')} shares @ ₹${item.price}` : 'Pledge Status Filing'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Total Consideration:</span>
                    <div className="font-bold text-emerald-400">
                      {item.valueCr > 0 ? `₹${item.valueCr.toLocaleString('en-IN')} Cr` : 'Encumbrance Filing'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Holding Post-Trade:</span>
                    <div className="font-bold text-blue-300">
                      {item.postHoldingPct}% (from {item.preHoldingPct}%)
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {item.commentary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
