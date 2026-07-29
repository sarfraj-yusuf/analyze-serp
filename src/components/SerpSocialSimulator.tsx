import React, { useState, useEffect } from 'react';
import { MetaData } from '@/types/seo';
import { Monitor, Smartphone, Share2, Globe, RotateCcw, Check, AlertTriangle, Sparkles, Image as ImageIcon } from 'lucide-react';

interface SerpSocialSimulatorProps {
  meta?: MetaData;
  initialUrl?: string;
}

export const SerpSocialSimulator: React.FC<SerpSocialSimulatorProps> = ({ meta, initialUrl }) => {
  const defaultTitle = meta?.title || 'Example Page Title - Comprehensive On-Page SEO Guide';
  const defaultDesc = meta?.description || 'Learn how to optimize your title tags, meta descriptions, headings, and keyword density for higher search rankings.';
  const defaultUrl = initialUrl || 'https://example.com/blog/on-page-seo-guide';
  const defaultOgImage = meta?.ogImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop';

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDesc);
  const [url, setUrl] = useState(defaultUrl);
  const [ogImage, setOgImage] = useState(defaultOgImage);

  const [activePlatform, setActivePlatform] = useState<'desktop' | 'mobile' | 'facebook' | 'twitter'>('desktop');

  useEffect(() => {
    if (meta) {
      setTitle(meta.title || defaultTitle);
      setDescription(meta.description || defaultDesc);
    }
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [meta, initialUrl]);

  const handleReset = () => {
    setTitle(defaultTitle);
    setDescription(defaultDesc);
    setUrl(defaultUrl);
    setOgImage(defaultOgImage);
  };

  // Estimates title pixel width (~10px per char average in Arial 18px)
  const titlePixelWidth = Math.round(title.length * 9.6);
  const isTitleTruncated = titlePixelWidth > 580 || title.length > 60;
  const isDescTruncated = description.length > 160;

  // Extract hostname for breadcrumbs
  let hostname = 'example.com';
  let path = '/blog/on-page-seo-guide';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    hostname = parsed.hostname;
    path = parsed.pathname;
  } catch {
    hostname = 'example.com';
  }

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
              Interactive Preview Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            SERP Snippet & <span className="gradient-text">Social Card Live Simulator</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Test title tag & meta description edits live to maximize Google SERP click-through rates (CTR).
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-white/10 shadow-sm self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Original</span>
        </button>
      </div>

      {/* Editor Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Live Inputs */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
            Live Metadata Editor
          </h4>

          {/* Title Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-gray-200">
              <span>Title Tag (<strong className={isTitleTruncated ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>{title.length}</strong> / 60 chars)</span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-gray-400">~{titlePixelWidth}px / 580px</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none shadow-sm"
              placeholder="Enter title tag..."
            />
            {isTitleTruncated && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Title exceeds 580px and will be truncated on Google desktop SERPs.
              </p>
            )}
          </div>

          {/* Meta Description Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-gray-200">
              <span>Meta Description (<strong className={isDescTruncated ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>{description.length}</strong> / 160 chars)</span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none shadow-sm resize-none"
              placeholder="Enter meta description..."
            />
            {isDescTruncated && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Description exceeds 160 characters and will be truncated on Google SERPs.
              </p>
            )}
          </div>

          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 dark:text-gray-200 block">Target Page URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs focus:outline-none shadow-sm font-mono"
            />
          </div>
        </div>

        {/* Right Side: Live Visual Previews */}
        <div className="space-y-4">
          {/* Platform Tab Selectors */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-2 rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto shadow-sm">
            <button
              onClick={() => setActivePlatform('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activePlatform === 'desktop'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Google Desktop</span>
            </button>

            <button
              onClick={() => setActivePlatform('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activePlatform === 'mobile'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Mobile</span>
            </button>

            <button
              onClick={() => setActivePlatform('facebook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activePlatform === 'facebook'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Facebook OG</span>
            </button>

            <button
              onClick={() => setActivePlatform('twitter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activePlatform === 'twitter'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-md'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300'
              }`}
            >
              <span>Twitter / X</span>
            </button>
          </div>

          {/* Preview Box Container */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#080c14] border border-slate-200 dark:border-white/10 min-h-[220px] flex flex-col justify-center shadow-inner">
            {/* View 1: Google Desktop SERP */}
            {activePlatform === 'desktop' && (
              <div className="max-w-[600px] space-y-1 font-sans">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-gray-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    {hostname.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{hostname}</span>
                  <span className="text-slate-400 dark:text-gray-500">› {path.replace(/^\//, '').replace(/\//g, ' › ')}</span>
                </div>

                {/* Title */}
                <div className="text-[18px] font-normal leading-snug text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer truncate max-w-[580px]">
                  {title || 'Untitled Page'}
                </div>

                {/* Meta Description */}
                <div className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-normal line-clamp-2 pt-0.5">
                  {description || 'No description provided.'}
                </div>
              </div>
            )}

            {/* View 2: Google Mobile SERP */}
            {activePlatform === 'mobile' && (
              <div className="max-w-[360px] mx-auto space-y-2 font-sans p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0f19]">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                    {hostname.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">{hostname}</div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{url}</div>
                  </div>
                </div>

                <div className="text-[16px] font-medium leading-tight text-[#1a0dab] dark:text-[#8ab4f8]">
                  {title || 'Untitled Page'}
                </div>

                <div className="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-3">
                  {description || 'No description provided.'}
                </div>
              </div>
            )}

            {/* View 3: Facebook OpenGraph Card */}
            {activePlatform === 'facebook' && (
              <div className="max-w-[480px] mx-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#131b2e] overflow-hidden shadow-sm">
                <div className="w-full h-36 bg-slate-200 dark:bg-white/5 relative flex items-center justify-center overflow-hidden">
                  {ogImage ? (
                    <img src={ogImage} alt="OG Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500 text-xs">
                      <ImageIcon className="w-5 h-5" />
                      <span>OpenGraph Image Preview (1200x630)</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">{hostname}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{title}</div>
                  <div className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2">{description}</div>
                </div>
              </div>
            )}

            {/* View 4: Twitter / X Card */}
            {activePlatform === 'twitter' && (
              <div className="max-w-[480px] mx-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0f19] overflow-hidden shadow-sm">
                <div className="w-full h-36 bg-slate-200 dark:bg-white/5 relative flex items-center justify-center overflow-hidden">
                  {ogImage ? (
                    <img src={ogImage} alt="Twitter Card" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500 text-xs">
                      <ImageIcon className="w-5 h-5" />
                      <span>Twitter Card Image</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{title}</div>
                  <div className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2">{description}</div>
                  <div className="text-[11px] text-slate-400 dark:text-gray-500 pt-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{hostname}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
