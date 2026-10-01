import React, { useState } from 'react';
import { ReadabilityMetrics } from '@/types/seo';
import { BookOpen, Award, AlignLeft, Hash, Percent, Sparkles, MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';

const AiSimplifyModal = dynamic(
  () => import('./AiSimplifyModal').then((mod) => mod.AiSimplifyModal),
  { ssr: false }
);

interface ReadabilityCardProps {
  readability: ReadabilityMetrics;
  sampleText?: string;
}

export const ReadabilityCard: React.FC<ReadabilityCardProps> = ({ readability, sampleText = '' }) => {
  const [isSimplifyModalOpen, setIsSimplifyModalOpen] = useState(false);
  const [customText, setCustomText] = useState(sampleText);
  const {
    fleschReadingEase,
    fleschGradeLevel,
    gradeLabel,
    toneLabel,
    totalSentences,
    avgSentenceLength,
    avgSyllablesPerWord,
    complexWordsCount,
    complexWordsPercentage,
  } = readability;

  // Badge Color
  const easeColor =
    fleschReadingEase >= 80
      ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : fleschReadingEase >= 60
      ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
      : fleschReadingEase >= 40
      ? 'text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-purple-600 dark:text-purple-400 border-purple-500/40 bg-purple-500/10';

  return (
    <div className="space-y-6">
      {/* Overview Score Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-md ${easeColor}`}>
            <span className="text-2xl font-bold">{fleschReadingEase}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">/ 100 Ease</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${easeColor}`}>
                {gradeLabel}
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">Readability &amp; Tone Profile</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Evaluated via Flesch-Kincaid sentence length and syllable metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">Content Tone</div>
            <div className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">{toneLabel}</div>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">Grade Level</div>
            <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">Grade {fleschGradeLevel}</div>
          </div>
        </div>
      </div>

      {/* Contextual AI Plain-English Rewriter Opportunity */}
      {(fleschReadingEase < 65 || fleschGradeLevel > 10) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-950 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-2.5">
            <Sparkles className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Readability Opportunity:</strong> Text is currently rated at <strong>{gradeLabel}</strong>. Simplifying sentences to 7th–8th grade increases comprehension and lowers dwell bounce rate.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSimplifyModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs self-start sm:self-auto active:scale-98"
          >
            <Sparkles className="size-3.5" />
            <span>AI Plain-English Rewriter</span>
            <span className="text-[10px] font-mono bg-amber-700/60 px-1 py-0.5 rounded text-amber-100">1 Credit</span>
          </button>
        </div>
      )}

      {/* Detail Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
            <AlignLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Sentence Length</span>
          </div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{avgSentenceLength} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">words/sent</span></div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
            <Hash className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Syllables per Word</span>
          </div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{avgSyllablesPerWord} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">avg</span></div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
            <Percent className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Complex Words</span>
          </div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{complexWordsPercentage}% <span className="text-xs font-normal text-slate-500 dark:text-gray-400">({complexWordsCount})</span></div>
        </div>

        <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Total Sentences</span>
          </div>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{totalSentences} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">sentences</span></div>
        </div>
      </div>

      {/* AI Plain-English Simplify Modal */}
      {isSimplifyModalOpen && (
        <AiSimplifyModal
          isOpen={isSimplifyModalOpen}
          onClose={() => setIsSimplifyModalOpen(false)}
          text={customText || 'Enter or paste complex website sentences here to simplify them for web searchers.'}
          onApply={(simplified) => setCustomText(simplified)}
        />
      )}
    </div>
  );
};
