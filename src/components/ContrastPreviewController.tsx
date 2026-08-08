'use client';

import React, { useState } from 'react';
import {
  ContrastReportData,
  calculateContrastRatio,
  hexToRgb,
  generateSuggestedColors,
} from '@/lib/contrast-analyzer';
import { SEOExplanationTooltip } from '@/components/SEOExplanationTooltip';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Palette,
  Eye,
  Check,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ContrastPreviewControllerProps {
  report: ContrastReportData;
}

export const ContrastPreviewController: React.FC<ContrastPreviewControllerProps> = ({
  report,
}) => {
  // Live Controller Custom State (Interactive Color Sandbox)
  const firstPair = report.pairs[0] || {
    fgColor: '#FFFFFF',
    bgColor: '#059669',
    element: 'Primary Button',
  };

  const [customFg, setCustomFg] = useState<string>(firstPair.fgColor);
  const [customBg, setCustomBg] = useState<string>(firstPair.bgColor);
  const [previewText, setPreviewText] = useState<string>('Get Started Now');

  // Compute live contrast ratio for controller
  const liveRatio = calculateContrastRatio(hexToRgb(customFg), hexToRgb(customBg));
  const isAaNormal = liveRatio >= 4.5;
  const isAaLarge = liveRatio >= 3.0;
  const isAaaNormal = liveRatio >= 7.0;

  const suggestions = generateSuggestedColors(customFg, customBg, 4.5);

  const applySuggestedColors = () => {
    setCustomFg(suggestions.suggestedFg);
    setCustomBg(suggestions.suggestedBg);
  };

  return (
    <div className="space-y-8">
      {/* Overview Score Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg ${
              report.overallScore >= 80
                ? 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10'
                : report.overallScore >= 50
                ? 'text-amber-500 border-amber-500/40 bg-amber-500/10'
                : 'text-rose-500 border-rose-500/40 bg-rose-500/10'
            }`}
          >
            <span className="text-2xl font-black">{report.overallScore}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              WCAG Pass
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Official W3C WCAG 2.1 Standard
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Visual Contrast Audit Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Audited <strong className="text-slate-900 dark:text-white">{report.totalPairsAudited}</strong> element pairs: {report.passedAaCount} Passed AA, {report.passedAaaCount} Passed AAA.
            </p>
          </div>
        </div>

        {/* Discovered Brand Palette */}
        {report.brandPalette.length > 0 && (
          <div className="space-y-1.5 shrink-0 text-right sm:text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
              Discovered Brand Palette
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              {report.brandPalette.map((hex, idx) => (
                <div
                  key={idx}
                  onClick={() => setCustomBg(hex)}
                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-white/20 cursor-pointer shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                  title={`Click to test background ${hex}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Live Color Controller & Sandbox */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-indigo-500/5 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-black">
                Interactive Color Controller
              </span>
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" />
              Real-Time Visual Contrast Sandbox
            </h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Change Hex color pickers live to see instant WCAG ratio & UI element preview updates.
            </p>
          </div>

          <button
            onClick={applySuggestedColors}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Compliant Colors</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Color Controls */}
          <div className="lg:col-span-5 space-y-4">
            {/* Text Input Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-900 dark:text-white">
                Preview Button/Text Content:
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-bold"
                placeholder="Button Text"
              />
            </div>

            {/* Foreground Text Color Picker */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Text Color (Foreground)</span>
                <span className="font-mono text-xs font-bold text-emerald-500">
                  {customFg}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customFg}
                  onChange={(e) => setCustomFg(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={customFg}
                  onChange={(e) => setCustomFg(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-lg glass-input font-mono text-xs font-bold uppercase"
                />
              </div>
            </div>

            {/* Background Container Color Picker */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Background Container Color</span>
                <span className="font-mono text-xs font-bold text-cyan-500">
                  {customBg}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-lg glass-input font-mono text-xs font-bold uppercase"
                />
              </div>
            </div>
          </div>

          {/* Right: Live Preview Sandbox & Compliance Badges */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Rendered Element Preview Box */}
            <div
              className="p-8 sm:p-10 rounded-3xl border-2 transition-all duration-200 shadow-2xl flex flex-col items-center justify-center space-y-4 text-center"
              style={{
                backgroundColor: customBg,
                color: customFg,
                borderColor: liveRatio >= 4.5 ? '#10B981' : '#EF4444',
              }}
            >
              <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {previewText}
              </div>
              <p className="text-xs opacity-90 max-w-md leading-relaxed font-normal">
                This is a live rendered preview demonstrating readability and visual contrast.
              </p>

              {/* Sample Rendered Button */}
              <button
                className="px-6 py-3 rounded-2xl font-black text-sm shadow-xl transition-transform hover:scale-105 cursor-pointer border"
                style={{
                  backgroundColor: customBg,
                  color: customFg,
                  borderColor: customFg,
                }}
              >
                {previewText}
              </button>
            </div>

            {/* Live WCAG Compliance Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={`p-3.5 rounded-xl border text-center space-y-1 ${
                  isAaNormal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                <div className="text-[10px] font-extrabold uppercase">WCAG AA Normal</div>
                <div className="text-base font-black flex items-center justify-center gap-1">
                  {isAaNormal ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{liveRatio} : 1</span>
                </div>
                <div className="text-[9px] opacity-80">Req: &gt;= 4.5:1</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center space-y-1 ${
                  isAaLarge
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                <div className="text-[10px] font-extrabold uppercase">WCAG AA Button/Large</div>
                <div className="text-base font-black flex items-center justify-center gap-1">
                  {isAaLarge ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{liveRatio} : 1</span>
                </div>
                <div className="text-[9px] opacity-80">Req: &gt;= 3.0:1</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center space-y-1 ${
                  isAaaNormal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                <div className="text-[10px] font-extrabold uppercase">WCAG AAA Strict</div>
                <div className="text-base font-black flex items-center justify-center gap-1">
                  {isAaaNormal ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{liveRatio} : 1</span>
                </div>
                <div className="text-[9px] opacity-80">Req: &gt;= 7.0:1</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audited Element Color Pair Cards */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-cyan-500" />
          <span>Extracted Element Color Pair Audits ({report.pairs.length})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.pairs.map((pair, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {pair.element}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    pair.wcagAaNormal || pair.wcagAaLarge
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {pair.wcagAaNormal || pair.wcagAaLarge ? 'PASSED AA' : 'FAILED AA'}
                </span>
              </div>

              {/* Sample Element Render Box */}
              <div
                className="p-4 rounded-xl border text-center font-bold text-sm shadow-inner transition-transform"
                style={{
                  backgroundColor: pair.bgColor,
                  color: pair.fgColor,
                  borderColor: pair.fgColor,
                }}
              >
                Sample {pair.element} Text
              </div>

              {/* Color Specs & Ratio */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-[9px] font-sans text-slate-500 dark:text-gray-400 uppercase">Text</div>
                  <div className="font-bold">{pair.fgColor}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-[9px] font-sans text-slate-500 dark:text-gray-400 uppercase">Background</div>
                  <div className="font-bold">{pair.bgColor}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="text-[9px] font-sans text-slate-500 dark:text-gray-400 uppercase">Ratio</div>
                  <div className="font-bold text-emerald-500">{pair.ratio} : 1</div>
                </div>
              </div>

              {/* Actionable Suggestion */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span>Suggested Fix:</span>
                  <button
                    onClick={() => {
                      setCustomFg(pair.suggestedFgColor);
                      setCustomBg(pair.suggestedBgColor);
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test in Sandbox</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{pair.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
