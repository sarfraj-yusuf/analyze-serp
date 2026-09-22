/**
 * Google Featured Snippet (Position 0) Optimizer Engine
 * 
 * Provides intent classification, fluff detection, readiness scoring (0-100%),
 * and semantic HTML/Markdown generation calibrated to Google Search Central standards.
 */

export type SnippetFormat = 'PARAGRAPH' | 'NUMBERED_LIST' | 'BULLETED_LIST' | 'TABLE';

export interface SnippetTableData {
  headers: string[];
  rows: string[][];
}

export interface SnippetInput {
  query: string;
  format: SnippetFormat;
  heading: string;
  paragraphText?: string;
  listItems?: string[];
  tableData?: SnippetTableData;
  targetUrl?: string;
}

export interface SnippetRuleCheck {
  id: string;
  label: string;
  description: string;
  status: 'pass' | 'warn' | 'fail';
  score: number;
  maxScore: number;
}

export interface SnippetReadinessReport {
  score: number; // 0 to 100
  grade: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'POOR';
  recommendedFormat: SnippetFormat;
  detectedFluff: string[];
  wordCount: number;
  charCount: number;
  itemCount: number;
  checks: SnippetRuleCheck[];
  feedback: string[];
}

// Common conversational or filler phrases that prevent winning Google Position 0
export const FLUFF_PATTERNS = [
  "in today's fast-paced world",
  "in today's digital landscape",
  "in today's world",
  "in this article",
  "in this post",
  "in this comprehensive guide",
  "in this guide",
  "have you ever wondered",
  "it goes without saying",
  "needless to say",
  "as we all know",
  "without further ado",
  "let's dive in",
  "let's get started",
  "first and foremost",
  "it is important to note that",
  "at the end of the day",
  "all things considered",
  "when it comes to",
  "look no further",
  "in a nutshell",
];

/**
 * Classifies search query intent into optimal Google Snippet format
 */
export function classifySnippetIntent(query: string): {
  format: SnippetFormat;
  confidence: number;
  rationale: string;
} {
  const q = query.trim().toLowerCase();

  // 1. Table Intent (Comparisons, pricing, specs, rates)
  const tableRegex = /\b(vs|versus|comparison|compare|cost|price|pricing|rates|sizes|dimensions|specs|specifications|plans|tier|fees)\b/i;
  if (tableRegex.test(q)) {
    return {
      format: 'TABLE',
      confidence: 0.88,
      rationale: 'Search queries containing comparison, pricing, or specifications strongly trigger Google Table snippets.',
    };
  }

  // 2. Numbered List Intent (Step-by-step processes, tutorials, recipes, chronological sequences)
  const numberedListRegex = /\b(how to|steps to|step-by-step|guide to|tutorial|process of|routine|ways to make|recipe|method to)\b/i;
  if (numberedListRegex.test(q)) {
    return {
      format: 'NUMBERED_LIST',
      confidence: 0.92,
      rationale: '"How-to" and chronological step queries trigger ordered numbered list snippets with 5–8 steps.',
    };
  }

  // 3. Bulleted List Intent (Top lists, ideas, tips, checklists, collections)
  const bulletedListRegex = /\b(best|top \d+|top|list of|examples|ideas|checklist|tips|tools|alternatives|strategies|types of)\b/i;
  if (bulletedListRegex.test(q)) {
    return {
      format: 'BULLETED_LIST',
      confidence: 0.85,
      rationale: 'Queries seeking collections, best options, or tips trigger unordered bulleted list snippets.',
    };
  }

  // 4. Default to Paragraph Intent (Definitions, explanations, "what is", "why")
  return {
    format: 'PARAGRAPH',
    confidence: 0.90,
    rationale: '"What is", definition, and factual queries trigger 40–58 word paragraph snippet answers.',
  };
}

/**
 * Scans text for introductory filler / fluff phrases
 */
export function detectFluffPhrases(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matches: string[] = [];

  for (const phrase of FLUFF_PATTERNS) {
    if (lower.includes(phrase)) {
      matches.push(phrase);
    }
  }

  return matches;
}

/**
 * Counts words accurately
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Computes deterministic Position 0 Readiness Score (0-100%)
 */
export function calculateSnippetReadiness(input: SnippetInput): SnippetReadinessReport {
  const { query, format, heading, paragraphText = '', listItems = [], tableData } = input;
  const classification = classifySnippetIntent(query);
  const detectedFluff = detectFluffPhrases(paragraphText + ' ' + listItems.join(' '));
  const checks: SnippetRuleCheck[] = [];
  const feedback: string[] = [];

  let totalScore = 0;
  const qLower = query.trim().toLowerCase();
  const hLower = heading.trim().toLowerCase();

  // --- Rule 1: Preceding Question Heading (H2 / H3) (Max 20 pts) ---
  if (!heading.trim()) {
    checks.push({
      id: 'heading-presence',
      label: 'Preceding Section Heading (H2 / H3)',
      description: 'Missing heading tag. Google requires an explicit H2/H3 immediately preceding the snippet bait.',
      status: 'fail',
      score: 0,
      maxScore: 20,
    });
    feedback.push('Add an H2 or H3 heading immediately above your snippet answer that mirrors the search query.');
  } else {
    // Check if heading matches the query intent
    const queryTokens = qLower.split(/\s+/).filter((t) => t.length > 2);
    const matchCount = queryTokens.filter((t) => hLower.includes(t)).length;
    const matchRatio = queryTokens.length > 0 ? matchCount / queryTokens.length : 0;

    if (matchRatio >= 0.6 || hLower.includes(qLower)) {
      checks.push({
        id: 'heading-presence',
        label: 'Preceding Section Heading (H2 / H3)',
        description: `Heading closely matches search query intent (${Math.round(matchRatio * 100)}% match).`,
        status: 'pass',
        score: 20,
        maxScore: 20,
      });
    } else {
      checks.push({
        id: 'heading-presence',
        label: 'Preceding Section Heading (H2 / H3)',
        description: 'Heading is present but lacks sufficient keyword overlap with the target query.',
        status: 'warn',
        score: 12,
        maxScore: 20,
      });
      feedback.push('Include more keywords from the search query inside the H2 heading.');
    }
  }

  // --- Rule 2: Format Alignment with Google Search Intent (Max 20 pts) ---
  if (format === classification.format) {
    checks.push({
      id: 'format-alignment',
      label: 'Search Intent Format Alignment',
      description: `Target format (${format}) matches Google's preferred extraction pattern for this query.`,
      status: 'pass',
      score: 20,
      maxScore: 20,
    });
  } else {
    checks.push({
      id: 'format-alignment',
      label: 'Search Intent Format Alignment',
      description: `Google typically prefers ${classification.format} for this query, but ${format} is selected.`,
      status: 'warn',
      score: 10,
      maxScore: 20,
    });
    feedback.push(`Consider switching format to ${classification.format} to better match SERP expectations.`);
  }

  // --- Rule 3: Length & Density Sweet Spot (Max 25 pts) ---
  let wordCount = 0;
  let charCount = 0;
  let itemCount = 0;

  if (format === 'PARAGRAPH') {
    wordCount = countWords(paragraphText);
    charCount = paragraphText.length;

    if (wordCount >= 40 && wordCount <= 58) {
      checks.push({
        id: 'length-sweet-spot',
        label: 'Paragraph Word Count Sweet Spot',
        description: `Optimal volume (${wordCount} words). Fits Google's 40–58 word snippet box perfectly.`,
        status: 'pass',
        score: 25,
        maxScore: 25,
      });
    } else if ((wordCount >= 32 && wordCount < 40) || (wordCount > 58 && wordCount <= 68)) {
      checks.push({
        id: 'length-sweet-spot',
        label: 'Paragraph Word Count Sweet Spot',
        description: `Acceptable volume (${wordCount} words), but close to truncation or thin boundaries.`,
        status: 'warn',
        score: 16,
        maxScore: 25,
      });
      if (wordCount < 40) feedback.push(`Expand snippet by ${40 - wordCount} words to reach the 40–58 word sweet spot.`);
      if (wordCount > 58) feedback.push(`Trim snippet by ${wordCount - 58} words to avoid Google truncation.`);
    } else {
      checks.push({
        id: 'length-sweet-spot',
        label: 'Paragraph Word Count Sweet Spot',
        description: `Outside optimal range (${wordCount} words). Google may reject snippet as too brief or too long.`,
        status: 'fail',
        score: 6,
        maxScore: 25,
      });
      if (wordCount < 32) feedback.push('Your paragraph is too short. Aim for 40–58 words with clear factual context.');
      if (wordCount > 68) feedback.push('Your paragraph is too long. Truncate it to under 58 words.');
    }
  } else if (format === 'NUMBERED_LIST' || format === 'BULLETED_LIST') {
    itemCount = listItems.filter((item) => item.trim().length > 0).length;
    wordCount = countWords(listItems.join(' '));

    if (itemCount >= 5 && itemCount <= 8) {
      checks.push({
        id: 'length-sweet-spot',
        label: 'List Item Count Sweet Spot',
        description: `Optimal item count (${itemCount} items). Displays cleanly with Google's "More items..." preview.`,
        status: 'pass',
        score: 25,
        maxScore: 25,
      });
    } else if (itemCount >= 4 && itemCount <= 10) {
      checks.push({
        id: 'length-sweet-spot',
        label: 'List Item Count Sweet Spot',
        description: `Acceptable item count (${itemCount} items), but 5–8 items win snippets most frequently.`,
        status: 'warn',
        score: 16,
        maxScore: 25,
      });
      if (itemCount < 5) feedback.push('Add 1–2 more concise steps/items to reach the 5–8 list item benchmark.');
      if (itemCount > 8) feedback.push('Consider consolidating to 6–8 distinct, high-impact items.');
    } else {
      checks.push({
        id: 'length-sweet-spot',
        label: 'List Item Count Sweet Spot',
        description: `Sub-optimal item count (${itemCount} items). Aim for 5–8 items.`,
        status: 'fail',
        score: 8,
        maxScore: 25,
      });
      feedback.push('Lists should have between 5 and 8 items to maximize Position 0 click-through rates.');
    }
  } else if (format === 'TABLE') {
    const colCount = tableData?.headers?.length || 0;
    const rowCount = tableData?.rows?.length || 0;
    itemCount = rowCount;
    wordCount = countWords((tableData?.headers || []).join(' ') + ' ' + (tableData?.rows || []).flat().join(' '));

    if (colCount >= 2 && colCount <= 4 && rowCount >= 3 && rowCount <= 6) {
      checks.push({
        id: 'length-sweet-spot',
        label: 'Table Dimensions Sweet Spot',
        description: `Ideal dimensions (${colCount} columns × ${rowCount} rows) for Google's desktop/mobile table card.`,
        status: 'pass',
        score: 25,
        maxScore: 25,
      });
    } else {
      checks.push({
        id: 'length-sweet-spot',
        label: 'Table Dimensions Sweet Spot',
        description: `Current dimensions (${colCount} cols × ${rowCount} rows). Recommended: 3–4 columns, 3–6 rows.`,
        status: 'warn',
        score: 14,
        maxScore: 25,
      });
      feedback.push('Structure table with 3–4 columns and 3–6 rows with descriptive headers.');
    }
  }

  // --- Rule 4: Inverted Pyramid / Direct Answer (Max 15 pts) ---
  if (format === 'PARAGRAPH') {
    const sentences = paragraphText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || '';
    const hasQueryKeywords = qLower.split(/\s+/).filter((w) => w.length > 3).some((w) => firstSentence.toLowerCase().includes(w));

    if (firstSentence && hasQueryKeywords && !firstSentence.toLowerCase().startsWith('in this') && !firstSentence.toLowerCase().startsWith('have you')) {
      checks.push({
        id: 'inverted-pyramid',
        label: 'Inverted Pyramid Direct Answer',
        description: 'First sentence directly defines or answers the target query without conversational preamble.',
        status: 'pass',
        score: 15,
        maxScore: 15,
      });
    } else {
      checks.push({
        id: 'inverted-pyramid',
        label: 'Inverted Pyramid Direct Answer',
        description: 'First sentence does not deliver a direct answer or lacks core query keywords.',
        status: 'warn',
        score: 8,
        maxScore: 15,
      });
      feedback.push('Start sentence 1 with a direct definition: "[Keyword] is/are..." followed immediately by the answer.');
    }
  } else if (format === 'NUMBERED_LIST' || format === 'BULLETED_LIST') {
    const boldStartsCount = listItems.filter((item) => /^\s*(\*\*|<strong>)[^:*]+(\*\*|:|<\/strong>)/i.test(item)).length;
    if (boldStartsCount >= Math.min(3, listItems.length)) {
      checks.push({
        id: 'inverted-pyramid',
        label: 'Bold Lead-In Keywords',
        description: 'Items feature strong bold leading tags (e.g. "**Step 1: Audit URLs**"), helping Google parse list entities.',
        status: 'pass',
        score: 15,
        maxScore: 15,
      });
    } else {
      checks.push({
        id: 'inverted-pyramid',
        label: 'Bold Lead-In Keywords',
        description: 'List items lack bold leading action verbs or topic labels.',
        status: 'warn',
        score: 8,
        maxScore: 15,
      });
      feedback.push('Prefix each list item with bold text (e.g. "**Step 1:**" or "**Feature Name:**") for higher snippet retention.');
    }
  } else {
    // Table
    const hasCleanHeaders = (tableData?.headers || []).every((h) => h.trim().length > 0);
    if (hasCleanHeaders && (tableData?.headers?.length || 0) >= 2) {
      checks.push({
        id: 'inverted-pyramid',
        label: 'Table Semantic Headers',
        description: 'All columns contain clear, descriptive header labels.',
        status: 'pass',
        score: 15,
        maxScore: 15,
      });
    } else {
      checks.push({
        id: 'inverted-pyramid',
        label: 'Table Semantic Headers',
        description: 'Table is missing descriptive column headers in <thead>.',
        status: 'fail',
        score: 5,
        maxScore: 15,
      });
      feedback.push('Provide clear header labels for every column in the table.');
    }
  }

  // --- Rule 5: Zero Fluff & Filler Words (Max 10 pts) ---
  if (detectedFluff.length === 0) {
    checks.push({
      id: 'zero-fluff',
      label: 'Zero Conversational Fluff',
      description: 'Clean, objective factual syntax with 0 detected filler clichés.',
      status: 'pass',
      score: 10,
      maxScore: 10,
    });
  } else {
    checks.push({
      id: 'zero-fluff',
      label: 'Zero Conversational Fluff',
      description: `Found ${detectedFluff.length} filler phrase(s): "${detectedFluff.slice(0, 2).join('", "')}".`,
      status: 'fail',
      score: 2,
      maxScore: 10,
    });
    feedback.push(`Remove conversational filler: ${detectedFluff.map((f) => `"${f}"`).join(', ')}.`);
  }

  // --- Rule 6: Concise Syntax & Punctuation (Max 10 pts) ---
  const textBlob = paragraphText + ' ' + listItems.join(' ');
  const sentenceCount = textBlob.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const avgWordsPerSentence = wordCount / sentenceCount;

  if (avgWordsPerSentence <= 20 && wordCount > 0) {
    checks.push({
      id: 'sentence-conciseness',
      label: 'Sentence Syntax & Reading Rhythm',
      description: `Crisp sentence length (avg ${Math.round(avgWordsPerSentence)} words/sentence), optimal for 7th–8th grade readability.`,
      status: 'pass',
      score: 10,
      maxScore: 10,
    });
  } else if (wordCount === 0) {
    checks.push({
      id: 'sentence-conciseness',
      label: 'Sentence Syntax & Reading Rhythm',
      description: 'No text entered yet.',
      status: 'fail',
      score: 0,
      maxScore: 10,
    });
  } else {
    checks.push({
      id: 'sentence-conciseness',
      label: 'Sentence Syntax & Reading Rhythm',
      description: `Sentences are relatively long (avg ${Math.round(avgWordsPerSentence)} words/sentence). Split compound sentences.`,
      status: 'warn',
      score: 6,
      maxScore: 10,
    });
    feedback.push('Keep sentences under 18 words to ensure clear, punchy snippet parsing.');
  }

  // Calculate total score
  totalScore = checks.reduce((acc, c) => acc + c.score, 0);

  let grade: SnippetReadinessReport['grade'] = 'POOR';
  if (totalScore >= 88) grade = 'EXCELLENT';
  else if (totalScore >= 72) grade = 'GOOD';
  else if (totalScore >= 50) grade = 'NEEDS_WORK';

  return {
    score: totalScore,
    grade,
    recommendedFormat: classification.format,
    detectedFluff,
    wordCount,
    charCount,
    itemCount,
    checks,
    feedback,
  };
}

/**
 * Generates production-ready semantic HTML for the snippet bait
 */
export function generateSnippetHtml(input: SnippetInput): string {
  const { heading, format, paragraphText = '', listItems = [], tableData } = input;
  const cleanHeading = heading.trim() || 'Frequently Asked Question';

  let bodyHtml = '';

  if (format === 'PARAGRAPH') {
    bodyHtml = `<p>${escapeHtml(paragraphText.trim())}</p>`;
  } else if (format === 'NUMBERED_LIST') {
    const listHtml = listItems
      .filter((item) => item.trim().length > 0)
      .map((item) => `  <li>${formatListItemToHtml(item)}</li>`)
      .join('\n');
    bodyHtml = `<ol>\n${listHtml}\n</ol>`;
  } else if (format === 'BULLETED_LIST') {
    const listHtml = listItems
      .filter((item) => item.trim().length > 0)
      .map((item) => `  <li>${formatListItemToHtml(item)}</li>`)
      .join('\n');
    bodyHtml = `<ul>\n${listHtml}\n</ul>`;
  } else if (format === 'TABLE' && tableData) {
    const headerHtml = (tableData.headers || [])
      .map((h) => `      <th>${escapeHtml(h)}</th>`)
      .join('\n');
    const rowsHtml = (tableData.rows || [])
      .map(
        (row) =>
          `    <tr>\n${row.map((cell) => `      <td>${escapeHtml(cell)}</td>`).join('\n')}\n    </tr>`
      )
      .join('\n');

    bodyHtml = `<table>\n  <thead>\n    <tr>\n${headerHtml}\n    </tr>\n  </thead>\n  <tbody>\n${rowsHtml}\n  </tbody>\n</table>`;
  }

  return `<h2>${escapeHtml(cleanHeading)}</h2>\n${bodyHtml}`;
}

/**
 * Generates clean Markdown for CMS (Notion, Ghost, Next.js MDX)
 */
export function generateSnippetMarkdown(input: SnippetInput): string {
  const { heading, format, paragraphText = '', listItems = [], tableData } = input;
  const cleanHeading = heading.trim() || 'Frequently Asked Question';

  let bodyMd = '';

  if (format === 'PARAGRAPH') {
    bodyMd = paragraphText.trim();
  } else if (format === 'NUMBERED_LIST') {
    bodyMd = listItems
      .filter((item) => item.trim().length > 0)
      .map((item, idx) => `${idx + 1}. ${item.trim()}`)
      .join('\n');
  } else if (format === 'BULLETED_LIST') {
    bodyMd = listItems
      .filter((item) => item.trim().length > 0)
      .map((item) => `- ${item.trim()}`)
      .join('\n');
  } else if (format === 'TABLE' && tableData && tableData.headers.length > 0) {
    const headers = `| ${tableData.headers.join(' | ')} |`;
    const separator = `| ${tableData.headers.map(() => '---').join(' | ')} |`;
    const rows = tableData.rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
    bodyMd = `${headers}\n${separator}\n${rows}`;
  }

  return `## ${cleanHeading}\n\n${bodyMd}`;
}

// Helpers
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatListItemToHtml(item: string): string {
  // Convert **Bold** to <strong>Bold</strong>
  let escaped = escapeHtml(item.trim());
  return escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
