'use client';

import React, { useState } from 'react';
import { SinglePageAudit } from '@/types/seo';
import { generateWhiteLabelPdfReport, WhiteLabelOptions } from '@/lib/pdf-report-generator';
import { X, FileText, Download, Sparkles, Building, User, Mail, Palette } from 'lucide-react';
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

export const WhiteLabelPdfModal: React.FC<WhiteLabelPdfModalProps> = ({ isOpen, onClose, audit }) => {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });
  const [agencyName, setAgencyName] = useState('Apex Digital Growth Agency');
  const [clientName, setClientName] = useState('Valued Client');
  const [auditorEmail, setAuditorEmail] = useState('audit@apexdigital.com');
  const [primaryColorHex, setPrimaryColorHex] = useState('#059669');

  if (!isOpen) return null;

  const handleGeneratePdf = async (e: React.FormEvent) => {
    e.preventDefault();
    const options: WhiteLabelOptions = {
      agencyName,
      clientName,
      auditorEmail,
      primaryColorHex,
    };

    await generateWhiteLabelPdfReport(audit, options);
    onClose();
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
          aria-label="Close white label export dialog"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
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
            Export Branded Client PDF Report
          </h3>

          <p className="text-xs text-slate-600 dark:text-gray-400">
            Customize agency branding, client details, and primary accent colors before generating your 3-page PDF report.
          </p>
        </div>

        {/* Customization Form */}
        <form onSubmit={handleGeneratePdf} className="space-y-4">
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
                  onClick={() => setPrimaryColorHex(color.hex)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                    primaryColorHex === color.hex
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 font-bold bg-slate-100 dark:bg-white/10'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: color.hex }} />
                  <span className="text-[11px] text-slate-800 dark:text-gray-200">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-white/10"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Branded PDF Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
