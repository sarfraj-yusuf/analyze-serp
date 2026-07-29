import { ReadabilityMetrics } from '@/types/seo';

/**
 * Deterministic Syllable Counter
 */
export function countSyllables(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleanWord) return 0;
  if (cleanWord.length <= 3) return 1;

  // Syllable rules
  let processed = cleanWord
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '') // Remove trailing silent 'e', 'es', 'ed'
    .replace(/^y/, ''); // Remove leading 'y'

  const vowelMatches = processed.match(/[aeiouy]{1,2}/g);
  let count = vowelMatches ? vowelMatches.length : 1;

  return Math.max(1, count);
}

/**
 * Calculates Flesch-Kincaid Readability & Tone Metrics
 */
export function calculateReadability(cleanText: string): ReadabilityMetrics {
  if (!cleanText || cleanText.trim().length === 0) {
    return {
      fleschReadingEase: 60,
      fleschGradeLevel: 8,
      gradeLabel: '8th-9th Grade (Standard)',
      toneLabel: 'Informative',
      totalSentences: 1,
      avgSentenceLength: 0,
      avgSyllablesPerWord: 0,
      complexWordsCount: 0,
      complexWordsPercentage: 0,
    };
  }

  // 1. Sentence Segmentation
  const sentences = cleanText
    .split(/[.!?]+\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const totalSentences = Math.max(1, sentences.length);

  // 2. Word Tokenization & Syllable Counting
  const words = cleanText
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && /^[a-z]+$/i.test(w));

  const totalWords = Math.max(1, words.length);

  let totalSyllables = 0;
  let complexWordsCount = 0;

  words.forEach((word) => {
    const syllables = countSyllables(word);
    totalSyllables += syllables;
    if (syllables >= 3) {
      complexWordsCount++;
    }
  });

  const avgSentenceLength = parseFloat((totalWords / totalSentences).toFixed(1));
  const avgSyllablesPerWord = parseFloat((totalSyllables / totalWords).toFixed(2));
  const complexWordsPercentage = parseFloat(((complexWordsCount / totalWords) * 100).toFixed(1));

  // 3. Flesch Reading Ease Formula
  // Reading Ease = 206.835 - (1.015 * ASL) - (84.6 * ASW)
  let fleschReadingEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  fleschReadingEase = Math.min(100, Math.max(0, parseFloat(fleschReadingEase.toFixed(1))));

  // 4. Flesch-Kincaid Grade Level Formula
  // Grade Level = (0.39 * ASL) + (11.8 * ASW) - 15.59
  let fleschGradeLevel = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
  fleschGradeLevel = Math.max(1, parseFloat(fleschGradeLevel.toFixed(1)));

  // 5. Grade Level Label Mapping
  let gradeLabel = '8th-9th Grade (Standard)';
  if (fleschReadingEase >= 90) gradeLabel = '5th Grade (Very Easy)';
  else if (fleschReadingEase >= 80) gradeLabel = '6th Grade (Easy)';
  else if (fleschReadingEase >= 70) gradeLabel = '7th Grade (Fairly Easy)';
  else if (fleschReadingEase >= 60) gradeLabel = '8th-9th Grade (Standard)';
  else if (fleschReadingEase >= 50) gradeLabel = '10th-12th Grade (High School)';
  else if (fleschReadingEase >= 30) gradeLabel = 'College Level (Difficult)';
  else gradeLabel = 'Academic Level (Very Confusing)';

  // 6. Tone Classification
  let toneLabel: ReadabilityMetrics['toneLabel'] = 'Informative';
  if (fleschReadingEase >= 80) toneLabel = 'Conversational';
  else if (fleschReadingEase >= 60) toneLabel = 'Informative';
  else if (fleschReadingEase >= 40) toneLabel = 'Technical';
  else toneLabel = 'Academic / Academic Paper';

  return {
    fleschReadingEase,
    fleschGradeLevel,
    gradeLabel,
    toneLabel,
    totalSentences,
    avgSentenceLength,
    avgSyllablesPerWord,
    complexWordsCount,
    complexWordsPercentage,
  };
}
