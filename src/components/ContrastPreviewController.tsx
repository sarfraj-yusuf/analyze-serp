'use client';

import React, { useState } from 'react';
import {
  ContrastReportData,
  calculateContrastRatio,
  hexToRgb,
  generateSuggestedColors,
} from '@/lib/contrast-analyzer';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  Sparkles,
  Palette,
  ArrowRight,
  Type,
  Gauge,
} from 'lucide-react';

interface ContrastPreviewControllerProps {
  report: ContrastReportData;
}

type TextScale = 'body' | 'button' | 'heading';

const UI_PRESETS = [
  { label: 'Emerald CTA', fg: '#000000', bg: '#10B981', text: 'Get Started Now' },
  { label: 'Dark Surface', fg: '#F1F5F9', bg: '#0F172A', text: 'Executive Health Dashboard' },
  { label: 'Clean Editorial', fg: '#1E293B', bg: '#FFFFFF', text: 'Fast Non-AI Competitor SERP Intelligence' },
  { label: 'Accent Link', fg: '#2563EB', bg: '#F8FAFC', text: 'View Official Documentation' },
  { label: 'Warning Alert', fg: '#B45309', bg: '#FEF3C7', text: 'Action Required: Fix Low Contrast' },
];

export const ContrastPreviewController: React.FC<ContrastPreviewControllerProps> = ({
  report,
}) => {
  // Live Controller Custom State (Interactive Color Sandbox)
  const firstPair = report.pairs[0] || {
    fgColor: '#000000',
    bgColor: '#10B981',
    element: 'Primary Button',
  };

  const [customFg, setCustomFg] = useState<string>(firstPair.fgColor);
  const [customBg, setCustomBg] = useState<string>(firstPair.bgColor);
  const [previewText, setPreviewText] = useState<string>('Get Started Now');
  const [textScale, setTextScale] = useState<TextScale>('button');

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

  const handleSelectPreset = (preset: typeof UI_PRESETS[number]) => {
    setCustomFg(preset.fg);
    setCustomBg(preset.bg);
    setPreviewText(preset.text);
  };

  // Piecewise gauge percentage mapping for intuitive visual representation of WCAG thresholds
  const getGaugePercent = (ratio: number): number => {
    if (ratio <= 1) return 0;
    if (ratio < 3) return ((ratio - 1) / 2) * 25; // 1 to 3 -> 0% to 25%
    if (ratio < 4.5) return 25 + ((ratio - 3) / 1.5) * 25; // 3 to 4.5 -> 25% to 50%
    if (ratio < 7) return 50 + ((ratio - 4.5) / 2.5) * 25; // 4.5 to 7 -> 50% to 75%
    return Math.min(100, 75 + ((ratio - 7) / 14) * 25); // 7 to 21 -> 75% to 100%
  };

  return (
    <div className="space-y-8">
      {/* Overview Score Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center shrink-0 shadow-xs ${
              report.overallScore >= 80
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : report.overallScore >= 50
                ? 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
                : 'text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10'
            }`}
          >
            <span className="text-2xl font-bold font-mono">{report.overallScore}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              WCAG Pass
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Official W3C WCAG 2.1 Standard
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              Visual Contrast Audit Report
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Audited <strong className="text-slate-800 dark:text-slate-100">{report.totalPairsAudited}</strong> element pairs: {report.passedAaCount} Passed AA, {report.passedAaaCount} Passed AAA.
            </p>
          </div>
        </div>

        {/* Discovered Brand Palette */}
        {report.brandPalette.length > 0 && (
          <div className="space-y-1.5 shrink-0 text-left sm:text-right">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Discovered Brand Palette
            </div>
            <div className="flex items-center gap-1.5 justify-start sm:justify-end">
              {report.brandPalette.map((hex, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCustomBg(hex)}
                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-white/20 cursor-pointer shadow-xs hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                  title={`Click to test background ${hex}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Live Color Controller & Sandbox */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Interactive Color Controller
              </span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Real-Time Visual Contrast Sandbox
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Tweak hex values, pick colors, or select UI presets to see instant WCAG ratio &amp; preview updates.
            </p>
          </div>

          <button
            type="button"
            onClick={applySuggestedColors}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Compliant Colors</span>
          </button>
        </div>

        {/* 1-Click Quick UI Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              1-Click UI Presets:
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Test common design scenarios</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {UI_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 dark:hover:border-emerald-500/40 bg-white/80 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/20 shrink-0"
                  style={{ backgroundColor: preset.bg }}
                />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Contrast Spectrum Scale (1:1 to 21:1) */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-500" />
              <span>Contrast Spectrum Ratio:</span>
              <strong className="font-mono text-sm text-slate-900 dark:text-white ml-1">
                {liveRatio} : 1
              </strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase border ${
                liveRatio >= 7.0
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                  : liveRatio >= 4.5
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : liveRatio >= 3.0
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {liveRatio >= 7.0
                ? 'WCAG AAA Gold Standard'
                : liveRatio >= 4.5
                ? 'WCAG AA Standard'
                : liveRatio >= 3.0
                ? 'WCAG AA Large Text Only'
                : 'Fails WCAG Standards'}
            </span>
          </div>

          {/* Continuum Track */}
          <div className="relative pt-1 pb-3">
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-emerald-500 opacity-90 relative overflow-hidden" />
            
            {/* Needle / Marker */}
            <div
              className="absolute top-0 -translate-x-1/2 transition-all duration-200 flex flex-col items-center pointer-events-none"
              style={{ left: `${getGaugePercent(liveRatio)}%` }}
            >
              <div className="w-3.5 h-3.5 bg-slate-900 dark:bg-white rounded-full shadow-md border-2 border-emerald-400" />
              <div className="w-0.5 h-3 bg-slate-900 dark:bg-white" />
            </div>

            {/* Threshold Labels Below Track */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1.5 px-0.5">
              <span>1:1 (Fail)</span>
              <span className="text-amber-600 dark:text-amber-400">3:1 (AA Large)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">4.5:1 (AA Normal)</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">7:1 (AAA)</span>
              <span>21:1 (Max)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Color Controls */}
          <div className="lg:col-span-5 space-y-4">
            {/* Text Input Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Preview Text Content:
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold"
                placeholder="Button Text"
              />
            </div>

            {/* Foreground Text Color Picker */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/[0.08] space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                <span>Text Color (Foreground)</span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {customFg}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customFg}
                  onChange={(e) => setCustomFg(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
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
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/[0.08] space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                <span>Background Container Color</span>
                <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  {customBg}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value.toUpperCase())}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent shrink-0"
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
          <div className="lg:col-span-7 space-y-5">
            {/* Scale Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/[0.05]">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <Type className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium">Preview Specimen Type:</span>
              </div>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] text-xs">
                <button
                  type="button"
                  onClick={() => setTextScale('body')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    textScale === 'body'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Body (16px)
                </button>
                <button
                  type="button"
                  onClick={() => setTextScale('button')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    textScale === 'button'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Button (14px Bold)
                </button>
                <button
                  type="button"
                  onClick={() => setTextScale('heading')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    textScale === 'heading'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Headline (28px)
                </button>
              </div>
            </div>

            {/* Live Rendered Element Preview Box */}
            <div
              className="p-8 sm:p-10 rounded-2xl border-2 transition-all duration-200 shadow-sm flex flex-col items-center justify-center space-y-4 text-center min-h-[200px]"
              style={{
                backgroundColor: customBg,
                color: customFg,
                borderColor: liveRatio >= 4.5 ? '#10B981' : liveRatio >= 3.0 ? '#F59E0B' : '#EF4444',
              }}
            >
              {textScale === 'heading' ? (
                <div className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  {previewText}
                </div>
              ) : textScale === 'body' ? (
                <p className="text-sm sm:text-base leading-relaxed max-w-md font-normal">
                  {previewText}. Good contrast ensures quick readability under bright lighting conditions on mobile and desktop devices.
                </p>
              ) : (
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl font-bold text-sm shadow-xs transition-transform cursor-pointer border"
                  style={{
                    backgroundColor: customBg,
                    color: customFg,
                    borderColor: customFg,
                  }}
                >
                  {previewText}
                </button>
              )}

              <p className="text-[11px] opacity-75 max-w-md leading-relaxed font-mono">
                Foreground: <span className="font-bold">{customFg}</span> · Background: <span className="font-bold">{customBg}</span>
              </p>
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
                <div className="text-[10px] font-mono font-bold uppercase">WCAG AA Normal</div>
                <div className="text-base font-bold flex items-center justify-center gap-1 font-mono">
                  {isAaNormal ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{liveRatio} : 1</span>
                </div>
                <div className="text-[9px] opacity-80 font-mono">Benchmark: &ge; 4.5:1</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center space-y-1 ${
                  isAaLarge
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase">WCAG AA Button/Large</div>
                <div className="text-base font-bold flex items-center justify-center gap-1 font-mono">
                  {isAaLarge ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{liveRatio} : 1</span>
                </div>
                <div className="text-[9px] opacity-80 font-mono">Benchmark: &ge; 3.0:1</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center space-y-1 ${
                  isAaaNormal
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase">WCAG AAA Strict</div>
                <div className="text-base font-bold flex items-center justify-center gap-1 font-mono">
                  {isAaaNormal ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{liveRatio} : 1</span>
                </div>
                <div className="text-[9px] opacity-80 font-mono">Benchmark: &ge; 7.0:1</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audited Element Color Pair Cards */}
      <div className="space-y-4">
        <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-500" />
          <span>Extracted Element Color Pair Audits ({report.pairs.length})</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.pairs.map((pair, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/[0.08] space-y-4 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                  {pair.element}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                    pair.wcagAaNormal || pair.wcagAaLarge
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {pair.wcagAaNormal || pair.wcagAaLarge ? 'PASSED AA' : 'FAILED AA'}
                </span>
              </div>

              {/* Sample Element Render Box */}
              <div
                className="p-4 rounded-xl border text-center font-bold text-sm shadow-xs transition-transform"
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
                <div className="p-2 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Text</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{pair.fgColor}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Background</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{pair.bgColor}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Ratio</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{pair.ratio} : 1</div>
                </div>
              </div>

              {/* Actionable Suggestion */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] text-xs space-y-1">
                <div className="font-bold flex items-center justify-between text-slate-800 dark:text-slate-200">
                  <span>Suggested Fix:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFg(pair.suggestedFgColor);
                      setCustomBg(pair.suggestedBgColor);
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Test in Sandbox</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{pair.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
