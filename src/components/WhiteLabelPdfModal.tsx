'use client';

import React, { useState } from 'react';
import { SinglePageAudit } from '@/types/seo';
import { generateWhiteLabelPdfReport, WhiteLabelOptions } from '@/lib/pdf-report-generator';
import { X, Download, Sparkles, Building, User, Mail, Palette, Type, Loader2, AlertCircle } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface WhiteLabelPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: SinglePageAudit;
}

const COLOR_PRESETS = [
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Cyan Blue', hex: '#0284c7' },
  { name: 'Indigo Purple', hex: '#4f46e5' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Dark Slate', hex: '#0f172a' },
];

/** Validates a hex color string (3 or 6 digit, with or without #) */
const isValidHex = (hex: string): boolean => /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);

/** Normalizes a hex input to always include the # prefix */
const normalizeHex = (hex: string): string => {
  const cleaned = hex.startsWith('#') ? hex : `#${hex}`;
  return cleaned;
};

export const WhiteLabelPdfModal: React.FC<WhiteLabelPdfModalProps> = ({ isOpen, onClose, audit }) => {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });
  const [agencyName, setAgencyName] = useState('Apex Digital Growth Agency');
  const [tagline, setTagline] = useState('');
  const [clientName, setClientName] = useState('Valued Client');
  const [auditorEmail, setAuditorEmail] = useState('audit@apexdigital.com');
  const [primaryColorHex, setPrimaryColorHex] = useState('#059669');
  const [customHexInput, setCustomHexInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomHexChange = (value: string) => {
    setCustomHexInput(value);
    const normalized = normalizeHex(value);
    if (isValidHex(normalized)) {
      // Expand 3-digit hex to 6-digit for consistency
      const full = normalized.length === 4
        ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
        : normalized;
      setPrimaryColorHex(full);
    }
  };

  const handlePresetClick = (hex: string) => {
    setPrimaryColorHex(hex);
    setCustomHexInput('');
  };

  const handleGeneratePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const options: WhiteLabelOptions = {
        agencyName,
        tagline: tagline.trim() || undefined,
        clientName,
        auditorEmail,
        primaryColorHex,
      };

      await generateWhiteLabelPdfReport(audit, options);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while generating the PDF.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whitelabel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-white/10 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isGenerating}
          aria-label="Close white label export dialog"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>White-Label B2B Agency Feature</span>
          </div>

          <h3 id="whitelabel-modal-title" className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Export Premium Client PDF Report
          </h3>

          <p className="text-xs text-slate-600 dark:text-gray-400">
            Customize agency branding, client details, and primary accent colors before generating your 5-page PDF report.
          </p>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleGeneratePdf} className="space-y-4">
          {/* Agency Name */}
          <div className="space-y-1.5">
            <label htmlFor="pdf-agency-name" className="text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Agency Name
            </label>
            <input
              id="pdf-agency-name"
              type="text"
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none shadow-sm font-medium"
              placeholder="e.g. Apex Digital Growth Agency"
            />
          </div>

          {/* Agency Tagline */}
          <div className="space-y-1.5">
            <label htmlFor="pdf-tagline" className="text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              Agency Tagline <span className="font-normal text-slate-500 dark:text-gray-500">(Optional)</span>
            </label>
            <input
              id="pdf-tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none shadow-sm font-medium"
              placeholder="e.g. Data-Driven SEO & Growth Consulting"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pdf-client-name" className="text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Client Name / Company
              </label>
              <input
                id="pdf-client-name"
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none shadow-sm font-medium"
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pdf-auditor-email" className="text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Auditor Email
              </label>
              <input
                id="pdf-auditor-email"
                type="email"
                required
                value={auditorEmail}
                onChange={(e) => setAuditorEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs focus:outline-none shadow-sm font-medium"
                placeholder="e.g. audit@agency.com"
              />
            </div>
          </div>

          {/* Color Preset Selector */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Primary PDF Brand Color</span>
            </div>

            <div role="radiogroup" aria-label="Primary PDF Brand Color" className="flex items-center gap-2 overflow-x-auto pb-1">
              {COLOR_PRESETS.map((color) => (
                <button
                  type="button"
                  key={color.hex}
                  role="radio"
                  aria-checked={primaryColorHex === color.hex}
                  aria-label={`${color.name} brand color`}
                  onClick={() => handlePresetClick(color.hex)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer border ${
                    primaryColorHex === color.hex && !customHexInput
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 font-bold bg-slate-100 dark:bg-white/10'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: color.hex }} />
                  <span className="text-[11px] text-slate-800 dark:text-gray-200">{color.name}</span>
                </button>
              ))}
            </div>

            {/* Custom Hex Input */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="relative flex items-center gap-2 flex-1">
                <label htmlFor="pdf-custom-hex" className="text-[11px] font-medium text-slate-500 dark:text-gray-400 shrink-0">
                  Custom:
                </label>
                <input
                  id="pdf-custom-hex"
                  type="text"
                  value={customHexInput}
                  onChange={(e) => handleCustomHexChange(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-lg glass-input text-xs focus:outline-none shadow-sm font-mono font-medium tracking-wide"
                  placeholder="#FF5733"
                  maxLength={7}
                  aria-label="Custom hex color value"
                />
                {/* Color Preview Circle */}
                <div
                  className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-white/20 shrink-0 transition-colors"
                  style={{ backgroundColor: primaryColorHex }}
                  aria-label={`Current color preview: ${primaryColorHex}`}
                />
                <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500">
                  {primaryColorHex}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Branded PDF Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
