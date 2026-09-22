/**
 * Real-Time SEO Content Scratchpad Scorer & Lexical Analysis Engine
 * Provides sub-millisecond in-memory lexical parsing, reading metrics,
 * keyword frequency detection, placement auditing, and 0-100% Content Score.
 */

export interface ScratchpadKeyword {
  phrase: string;
  minCount: number;
  maxCount: number;
  currentCount: number;
  status: 'missing' | 'under' | 'optimal' | 'over';
  isPrimary?: boolean;
}

export interface ScratchpadHeading {
  level: 'h1' | 'h2' | 'h3';
  text: string;
}

export interface ReadabilityMetrics {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  readingTimeMinutes: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  fleschReadingEase: number;
  gradeLevel: number;
  gradeLabel: string;
}

export interface PlacementChecks {
  inTitle: boolean;
  inH1: boolean;
  inFirst100: boolean;
  inH2: boolean;
}

export interface ContentScoreBreakdown {
  keywordCoverageScore: number; // max 35
  placementScore: number;       // max 25
  wordCountScore: number;       // max 20
  structureScore: number;       // max 10
  readabilityScore: number;     // max 10
  totalScore: number;           // 0 - 100
  ratingLabel: string;
  ratingColor: 'emerald' | 'amber' | 'rose' | 'slate';
}

export interface ScratchpadAnalysisResult {
  metrics: ReadabilityMetrics;
  placement: PlacementChecks;
  keywords: ScratchpadKeyword[];
  headings: ScratchpadHeading[];
  scoreBreakdown: ContentScoreBreakdown;
}

/**
 * Approximate syllable count for a word (used for Flesch Reading Ease).
 */
function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  // Remove common trailing silent e's
  const processed = clean.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  const syllables = processed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, syllables ? syllables.length : 1);
}

/**
 * Escapes regex special characters in a phrase.
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Counts non-overlapping occurrences of a keyword/phrase in text using word boundaries.
 */
export function countKeywordOccurrences(text: string, phrase: string): number {
  if (!text || !phrase) return 0;
  const normalizedText = text.toLowerCase();
  const normalizedPhrase = phrase.toLowerCase().trim();
  if (!normalizedPhrase) return 0;

  try {
    const escaped = escapeRegExp(normalizedPhrase);
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = normalizedText.match(regex);
    return matches ? matches.length : 0;
  } catch {
    // Fallback if phrase contains complex tokens
    let count = 0;
    let pos = 0;
    while ((pos = normalizedText.indexOf(normalizedPhrase, pos)) !== -1) {
      count++;
      pos += normalizedPhrase.length;
    }
    return count;
  }
}

/**
 * Parse headings from markdown text.
 */
export function extractHeadings(bodyText: string): ScratchpadHeading[] {
  const headings: ScratchpadHeading[] = [];
  if (!bodyText) return headings;

  const lines = bodyText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      headings.push({ level: 'h1', text: trimmed.replace(/^#\s+/, '').trim() });
    } else if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      headings.push({ level: 'h2', text: trimmed.replace(/^##\s+/, '').trim() });
    } else if (trimmed.startsWith('### ')) {
      headings.push({ level: 'h3', text: trimmed.replace(/^###\s+/, '').trim() });
    }
  }
  return headings;
}

/**
 * Calculate Flesch Reading Ease and Grade Level.
 */
export function calculateReadability(words: string[], sentences: string[]): {
  ease: number;
  grade: number;
  label: string;
} {
  const wordCount = Math.max(1, words.length);
  const sentenceCount = Math.max(1, sentences.length);

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }

  // Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;

  let ease = Math.round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord);
  ease = Math.max(0, Math.min(100, ease));

  // Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  let grade = Math.round((0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59) * 10) / 10;
  grade = Math.max(1, Math.min(18, grade));

  let label = 'Standard (8th–9th Grade)';
  if (ease >= 90) label = 'Very Easy (5th Grade)';
  else if (ease >= 80) label = 'Easy (6th Grade)';
  else if (ease >= 70) label = 'Fairly Easy (7th Grade)';
  else if (ease >= 60) label = 'Plain English (8th–9th Grade)';
  else if (ease >= 50) label = 'Fairly Difficult (10th–12th Grade)';
  else if (ease >= 30) label = 'Difficult (College Level)';
  else label = 'Very Confusing (Professional/Academic)';

  return { ease, grade, label };
}

/**
 * Main analysis function that parses and scores scratchpad content.
 */
export function analyzeScratchpad(params: {
  title: string;
  body: string;
  targetKeyword: string;
  gapKeywords: Array<{ phrase: string; targetMin?: number; targetMax?: number }>;
  targetWordCount?: number;
}): ScratchpadAnalysisResult {
  const { title = '', body = '', targetKeyword = '', gapKeywords = [], targetWordCount = 1200 } = params;

  // Clean raw body to pure words
  const fullText = `${title}\n\n${body}`;
  const rawWords = body.trim() ? body.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = rawWords.length;
  const characterCount = body.length;
  const characterCountNoSpaces = body.replace(/\s+/g, '').length;

  // Sentences
  const rawSentences = body
    .split(/[.!?]+(?:\s+|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  const sentenceCount = rawSentences.length || (wordCount > 0 ? 1 : 0);

  // Paragraphs
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paragraphCount = paragraphs.length;

  // Reading time (average 200 words per minute)
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Readability
  const readability = calculateReadability(rawWords, rawSentences);
  const avgSentenceLength = sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;

  const metrics: ReadabilityMetrics = {
    wordCount,
    characterCount,
    characterCountNoSpaces,
    readingTimeMinutes,
    sentenceCount,
    paragraphCount,
    avgSentenceLength,
    fleschReadingEase: readability.ease,
    gradeLevel: readability.grade,
    gradeLabel: readability.label,
  };

  // Headings
  const headings = extractHeadings(body);

  // Placement Checks for Primary Focus Keyword
  const normTarget = targetKeyword.trim().toLowerCase();
  const first100Words = rawWords.slice(0, 100).join(' ').toLowerCase();

  const inTitle = normTarget.length > 0 && countKeywordOccurrences(title, normTarget) > 0;
  const inH1 =
    normTarget.length > 0 &&
    headings.some((h) => h.level === 'h1' && countKeywordOccurrences(h.text, normTarget) > 0);
  const inFirst100 = normTarget.length > 0 && countKeywordOccurrences(first100Words, normTarget) > 0;
  const inH2 =
    normTarget.length > 0 &&
    headings.some((h) => h.level === 'h2' && countKeywordOccurrences(h.text, normTarget) > 0);

  const placement: PlacementChecks = {
    inTitle,
    inH1,
    inFirst100,
    inH2,
  };

  // Keyword Frequency Tracking
  const keywordList: ScratchpadKeyword[] = [];

  // 1. Primary Keyword
  if (normTarget) {
    const primaryCount = countKeywordOccurrences(fullText, normTarget);
    // Ideal primary keyword density is 1.0% to 2.2%
    const defaultPrimaryMin = Math.max(2, Math.round((targetWordCount * 0.01)));
    const defaultPrimaryMax = Math.max(4, Math.round((targetWordCount * 0.022)));

    let status: ScratchpadKeyword['status'] = 'missing';
    if (primaryCount === 0) status = 'missing';
    else if (primaryCount < defaultPrimaryMin) status = 'under';
    else if (primaryCount <= defaultPrimaryMax) status = 'optimal';
    else status = 'over';

    keywordList.push({
      phrase: targetKeyword.trim(),
      minCount: defaultPrimaryMin,
      maxCount: defaultPrimaryMax,
      currentCount: primaryCount,
      status,
      isPrimary: true,
    });
  }

  // 2. Secondary & Gap Keywords
  for (const gap of gapKeywords) {
    const cleanPhrase = gap.phrase.trim();
    if (!cleanPhrase || cleanPhrase.toLowerCase() === normTarget) continue;

    const count = countKeywordOccurrences(fullText, cleanPhrase);
    const min = gap.targetMin ?? Math.max(1, Math.min(3, Math.round(targetWordCount / 500)));
    const max = gap.targetMax ?? Math.max(min + 2, Math.round(targetWordCount / 200));

    let status: ScratchpadKeyword['status'] = 'missing';
    if (count === 0) status = 'missing';
    else if (count < min) status = 'under';
    else if (count <= max) status = 'optimal';
    else status = 'over';

    keywordList.push({
      phrase: cleanPhrase,
      minCount: min,
      maxCount: max,
      currentCount: count,
      status,
      isPrimary: false,
    });
  }

  // Scoring Calculation (0 to 100)
  // A. Keyword Coverage (35 points)
  let keywordCoverageScore = 0;
  if (keywordList.length > 0) {
    let kwPoints = 0;
    for (const kw of keywordList) {
      if (kw.status === 'optimal') kwPoints += 1.0;
      else if (kw.status === 'under') kwPoints += 0.5;
      else if (kw.status === 'over') kwPoints += 0.7; // slight penalty for over-optimizing
      else kwPoints += 0;
    }
    keywordCoverageScore = Math.round((kwPoints / keywordList.length) * 35);
  } else {
    keywordCoverageScore = wordCount > 200 ? 25 : 10;
  }

  // B. Placement Score (25 points)
  let placementScore = 0;
  if (placement.inTitle) placementScore += 8;
  if (placement.inH1) placementScore += 6;
  if (placement.inFirst100) placementScore += 6;
  if (placement.inH2) placementScore += 5;

  // C. Word Count vs Target (20 points)
  let wordCountScore = 0;
  if (wordCount > 0 && targetWordCount > 0) {
    const ratio = wordCount / targetWordCount;
    if (ratio >= 0.95 && ratio <= 1.25) {
      wordCountScore = 20; // Sweet spot
    } else if (ratio >= 0.75) {
      wordCountScore = 15;
    } else if (ratio >= 0.5) {
      wordCountScore = 10;
    } else if (ratio >= 0.25) {
      wordCountScore = 5;
    } else {
      wordCountScore = 2;
    }
  }

  // D. Structure & Headings (10 points)
  let structureScore = 0;
  const h2Count = headings.filter((h) => h.level === 'h2').length;
  const h3Count = headings.filter((h) => h.level === 'h3').length;

  if (h2Count >= 2) structureScore += 5;
  else if (h2Count === 1) structureScore += 3;

  if (h3Count >= 1 || h2Count >= 4) structureScore += 3;
  if (headings.some((h) => h.level === 'h1')) structureScore += 2;

  // E. Readability & Sentence Flow (10 points)
  let readabilityScore = 0;
  if (wordCount > 50) {
    if (readability.ease >= 55 && readability.ease <= 85) {
      readabilityScore += 7; // Ideal web readability
    } else if (readability.ease > 85 || readability.ease >= 40) {
      readabilityScore += 5;
    } else {
      readabilityScore += 2;
    }

    if (avgSentenceLength >= 10 && avgSentenceLength <= 22) {
      readabilityScore += 3;
    } else {
      readabilityScore += 1;
    }
  }

  const totalScore = Math.min(
    100,
    keywordCoverageScore + placementScore + wordCountScore + structureScore + readabilityScore
  );

  let ratingLabel = 'Thin Content';
  let ratingColor: ContentScoreBreakdown['ratingColor'] = 'slate';

  if (totalScore >= 80) {
    ratingLabel = 'SEO Ready (Rank-Ready)';
    ratingColor = 'emerald';
  } else if (totalScore >= 65) {
    ratingLabel = 'Solid Optimization';
    ratingColor = 'amber';
  } else if (totalScore >= 45) {
    ratingLabel = 'Needs More Keywords';
    ratingColor = 'amber';
  } else {
    ratingLabel = 'High Gap / Unoptimized';
    ratingColor = 'rose';
  }

  const scoreBreakdown: ContentScoreBreakdown = {
    keywordCoverageScore,
    placementScore,
    wordCountScore,
    structureScore,
    readabilityScore,
    totalScore,
    ratingLabel,
    ratingColor,
  };

  return {
    metrics,
    placement,
    keywords: keywordList,
    headings,
    scoreBreakdown,
  };
}

/**
 * Generate clean semantic HTML from scratchpad markdown.
 */
export function convertScratchpadToHtml(title: string, markdown: string): string {
  let html = '';
  if (title.trim()) {
    html += `<h1>${escapeHtml(title.trim())}</h1>\n\n`;
  }

  const lines = markdown.split('\n');
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) {
        html += `</${listType}>\n\n`;
        inList = false;
      }
      continue;
    }

    if (line.startsWith('# ')) {
      if (inList) {
        html += `</${listType}>\n\n`;
        inList = false;
      }
      html += `<h1>${escapeHtml(line.slice(2))}</h1>\n`;
    } else if (line.startsWith('## ')) {
      if (inList) {
        html += `</${listType}>\n\n`;
        inList = false;
      }
      html += `<h2>${escapeHtml(line.slice(3))}</h2>\n`;
    } else if (line.startsWith('### ')) {
      if (inList) {
        html += `</${listType}>\n\n`;
        inList = false;
      }
      html += `<h3>${escapeHtml(line.slice(4))}</h3>\n`;
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList || listType !== 'ul') {
        if (inList) html += `</${listType}>\n`;
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      html += `  <li>${formatInlineText(line.replace(/^[-*]\s+/, ''))}</li>\n`;
    } else if (/^\d+\.\s+/.test(line)) {
      if (!inList || listType !== 'ol') {
        if (inList) html += `</${listType}>\n`;
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      html += `  <li>${formatInlineText(line.replace(/^\d+\.\s+/, ''))}</li>\n`;
    } else {
      if (inList) {
        html += `</${listType}>\n\n`;
        inList = false;
      }
      html += `<p>${formatInlineText(line)}</p>\n\n`;
    }
  }

  if (inList) {
    html += `</${listType}>\n`;
  }

  return html.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInlineText(text: string): string {
  let escaped = escapeHtml(text);
  // Bold
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Code
  escaped = escaped.replace(/`(.*?)`/g, '<code>$1</code>');
  return escaped;
}
