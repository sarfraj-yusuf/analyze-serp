import React from 'react';
import { ImageAudit } from '@/types/seo';
import { Image, AlertCircle, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';

interface ImageAuditListProps {
  imageAudit: ImageAudit;
}

export const ImageAuditList: React.FC<ImageAuditListProps> = ({ imageAudit }) => {
  const { totalImages, missingAltCount, webpOrSvgCount, imageList } = imageAudit;

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{totalImages}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Total Image Tags</div>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-sm">
          <div className={`p-2.5 rounded-lg ${missingAltCount > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
            {missingAltCount > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{missingAltCount}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Missing Alt Attributes</div>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{webpOrSvgCount}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Modern WebP/SVG Assets</div>
          </div>
        </div>
      </div>

      {/* Detailed Image List */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080c14] max-h-72 overflow-y-auto shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Image Source</th>
              <th className="py-3 px-4">Alt Attribute</th>
              <th className="py-3 px-4 text-center">Format</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-gray-200">
            {imageList.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400 dark:text-gray-500">
                  No images found on this page.
                </td>
              </tr>
            ) : (
              imageList.slice(0, 30).map((img, idx) => (
                <tr key={idx} className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all">
                  <td className="py-2.5 px-4 font-mono max-w-xs truncate">
                    <a
                      href={img.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1 max-w-full truncate"
                      title={img.src}
                    >
                      <span className="truncate">{img.src}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                    </a>
                  </td>
                  <td className="py-2.5 px-4">
                    {img.hasAlt ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-sans">{img.alt}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-bold">
                        MISSING ALT
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {img.isWebpOrSvg ? (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
                        OPTIMIZED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-gray-400 text-[10px] font-mono">
                        LEGACY
                      </span>
                    )}
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
