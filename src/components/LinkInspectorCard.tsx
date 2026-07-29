import React, { useState } from 'react';
import { LinkAudit, LinkItem } from '@/types/seo';
import { Link2, ExternalLink, ShieldAlert, ShoppingBag, Filter, CheckCircle2, Tag, AlertCircle } from 'lucide-react';

interface LinkInspectorCardProps {
  linkAudit: LinkAudit;
}

export const LinkInspectorCard: React.FC<LinkInspectorCardProps> = ({ linkAudit }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'affiliate' | 'keyword' | 'branded' | 'generic'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    totalLinks,
    internalCount,
    externalCount,
    nofollowCount,
    affiliateCount,
    anchorBreakdown,
    affiliateNetworksDetected,
    links,
  } = linkAudit;

  const currentList = links.filter((l) => {
    if (activeFilter === 'affiliate') return l.isAffiliate;
    if (activeFilter === 'keyword') return l.anchorCategory === 'Keyword-Rich';
    if (activeFilter === 'branded') return l.anchorCategory === 'Branded';
    if (activeFilter === 'generic') return l.anchorCategory === 'Generic';
    return true;
  });

  const filteredList = currentList.filter(
    (l) =>
      l.href.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400">Total Outbound Links</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{totalLinks}</div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">
            {internalCount} Internal / {externalCount} External
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Affiliate Links</span>
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{affiliateCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">
            {affiliateNetworksDetected.length} networks detected
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400">Keyword-Rich Anchors</div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{anchorBreakdown.keywordRichCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">
            {totalLinks > 0 ? Math.round((anchorBreakdown.keywordRichCount / totalLinks) * 100) : 0}% of total
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400">Generic Anchors ("click here")</div>
          <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">{anchorBreakdown.genericCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">
            {anchorBreakdown.brandedCount} Branded Anchors
          </div>
        </div>
      </div>

      {/* Detected Affiliate Networks Badges */}
      {affiliateNetworksDetected.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Monetization Footprint: Detected {affiliateNetworksDetected.length} Affiliate Network(s)</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {affiliateNetworksDetected.map((net, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5"
              >
                🛒 {net}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
            }`}
          >
            All Links ({totalLinks})
          </button>

          <button
            onClick={() => setActiveFilter('affiliate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeFilter === 'affiliate'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Affiliate ({affiliateCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('keyword')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'keyword'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
            }`}
          >
            Keyword-Rich ({anchorBreakdown.keywordRichCount})
          </button>

          <button
            onClick={() => setActiveFilter('branded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'branded'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
            }`}
          >
            Branded ({anchorBreakdown.brandedCount})
          </button>

          <button
            onClick={() => setActiveFilter('generic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'generic'
                ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
            }`}
          >
            Generic ({anchorBreakdown.genericCount})
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter link URL or anchor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2 rounded-xl text-xs glass-input focus:outline-none shadow-sm"
        />
      </div>

      {/* Enhanced Links Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] max-h-80 overflow-y-auto shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
              <th className="py-3 px-4">Link URL</th>
              <th className="py-3 px-4">Anchor Text</th>
              <th className="py-3 px-4 text-center">Anchor Type</th>
              <th className="py-3 px-4 text-center">Monetization</th>
              <th className="py-3 px-4 text-center">Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200 font-sans">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-gray-500">
                  No matching links found for this selection.
                </td>
              </tr>
            ) : (
              filteredList.slice(0, 40).map((l, idx) => (
                <tr key={idx} className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
                  <td className="py-2.5 px-4 font-mono max-w-xs truncate">
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 max-w-full truncate"
                      title={l.href}
                    >
                      <span className="truncate">{l.href}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                    </a>
                  </td>

                  <td className="py-2.5 px-4 text-slate-900 dark:text-white max-w-xs truncate font-medium">
                    {l.text || <span className="text-slate-400 dark:text-gray-500 italic">(No text anchor)</span>}
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.anchorCategory === 'Keyword-Rich'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : l.anchorCategory === 'Branded'
                          ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                          : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {l.anchorCategory}
                    </span>
                  </td>

                  <td className="py-2.5 px-4 text-center font-mono">
                    {l.isAffiliate ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                        🛒 {l.affiliateNetwork || 'AFFILIATE'}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500 text-[10px]">Standard</span>
                    )}
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.isExternal
                          ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {l.isExternal ? 'EXTERNAL' : 'INTERNAL'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
