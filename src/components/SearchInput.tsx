import React, { useState } from 'react';
import { Search, Plus, Trash2, Globe, Sparkles, AlertCircle } from 'lucide-react';

interface SearchInputProps {
  onAnalyze: (urls: string[]) => void;
  isLoading: boolean;
}

const SAMPLE_URLS = [
  'https://ahrefs.com/blog/on-page-seo/',
  'https://backlinko.com/on-page-seo',
  'https://moz.com/learn/seo/on-page-factors',
];

export const SearchInput: React.FC<SearchInputProps> = ({ onAnalyze, isLoading }) => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, '']);
    }
  };

  const handleRemoveUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const handleChangeUrl = (index: number, value: string) => {
    const updated = [...urls];
    updated[index] = value;
    setUrls(updated);
    setError(null);
  };

  const handleLoadSamples = () => {
    setUrls(SAMPLE_URLS);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = urls.map((u) => u.trim()).filter(Boolean);

    if (validUrls.length === 0) {
      setError('Please enter at least one valid URL.');
      return;
    }

    onAnalyze(validUrls);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background gradient decorative glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Competitor <span className="gradient-text">On-Page Audit</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
              Audit single URL or paste up to 5 competitor URLs for instant side-by-side analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSamples}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Try Sample Competitors
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {urls.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-gray-400">
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleChangeUrl(idx, e.target.value)}
                  placeholder={`URL #${idx + 1} (e.g. https://example.com/blog-post)`}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500 shadow-sm"
                  disabled={isLoading}
                />
              </div>

              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(idx)}
                  className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all cursor-pointer"
                  title="Remove URL"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 pt-1 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            {urls.length < 5 ? (
              <button
                type="button"
                onClick={handleAddUrl}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Add Competitor URL ({urls.length}/5)
              </button>
            ) : (
              <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                Maximum 5 competitor URLs reached
              </span>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-bold text-sm flex items-center justify-center gap-2.5 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Parsing DOM & Calculating...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Audit Competitor Pages</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
