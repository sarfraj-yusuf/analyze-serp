/**
 * Lightweight Google Gemini AI Client
 * Uses native fetch to connect directly with Google AI Studio REST API
 * Zero extra dependencies, fully typed, supports structured JSON responses.
 */

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
      role?: string;
    };
    finishReason?: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export interface MetaRewriteResult {
  titles: Array<{
    text: string;
    length: number;
    style: string; // 'High-CTR Punchy' | 'Keyword-First SEO' | 'Question/Curiosity'
    rationale: string;
  }>;
  descriptions: Array<{
    text: string;
    length: number;
    style: string; // 'Action-Oriented' | 'Benefit-Driven' | 'Comprehensive'
    rationale: string;
  }>;
  searchIntent: string;
  recommendedKeywords: string[];
}

export interface FixRecommendationResult {
  rootCause: string;
  impactScore: 'High' | 'Medium' | 'Low';
  effortLevel: 'Quick Win (< 15 mins)' | 'Medium (1-2 hours)' | 'Complex';
  stepByStepFix: string[];
  codeSnippet: {
    language: string;
    title: string;
    code: string;
  };
  serpImpactExplanation: string;
}

export interface ContentSectionResult {
  suggestedHeading: string;
  contentMarkdown: string;
  keyTakeaways: string[];
  suggestedFaqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ReadabilityRewriteResult {
  simplifiedText: string;
  originalGradeEstimate: string;
  newGradeEstimate: string;
  keyImprovements: string[];
}

export interface SnippetBaitResult {
  suggestedHeading: string;
  format: 'PARAGRAPH' | 'NUMBERED_LIST' | 'BULLETED_LIST' | 'TABLE';
  paragraphText?: string;
  listItems?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  wordCount: number;
  rationale: string;
}

const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
];

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

/**
 * Base helper to send requests to Google AI Studio Gemini API
 */
export async function callGeminiApi(
  prompt: string,
  options?: {
    systemInstruction?: string;
    temperature?: number;
    jsonMode?: boolean;
    model?: string;
    attemptIndex?: number;
  }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local. Please provide your Google AI Studio API key.');
  }

  const attemptIndex = options?.attemptIndex ?? 0;
  const model =
    options?.model ||
    (attemptIndex === 0 ? DEFAULT_MODEL : FALLBACK_MODELS[attemptIndex % FALLBACK_MODELS.length]);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody: Record<string, unknown> = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options?.temperature ?? 0.3,
      maxOutputTokens: 2048,
    },
  };

  if (options?.jsonMode) {
    (requestBody.generationConfig as Record<string, unknown>).responseMimeType = 'application/json';
  }

  if (options?.systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (netErr) {
    throw new Error(`Network error contacting Gemini API: ${netErr instanceof Error ? netErr.message : 'Unknown network failure'}`);
  }

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    let parsedMessage = `Gemini API returned HTTP ${res.status}`;
    try {
      const errJson = JSON.parse(errorBody);
      if (errJson?.error?.message) {
        parsedMessage = errJson.error.message;
      }
    } catch {
      if (errorBody) parsedMessage += `: ${errorBody.slice(0, 200)}`;
    }

    // If model is not found/deprecated (404) or experiencing temporary capacity spikes (503/429), cascade to next stable fallback
    if ((res.status === 404 || res.status === 503 || res.status === 429) && attemptIndex < FALLBACK_MODELS.length - 1) {
      const nextAttempt = attemptIndex + 1;
      const nextModel = FALLBACK_MODELS[nextAttempt];
      console.warn(`[Gemini Warning] Model ${model} returned HTTP ${res.status}. Cascading to fallback model: ${nextModel}...`);
      return callGeminiApi(prompt, {
        ...options,
        model: nextModel,
        attemptIndex: nextAttempt,
      });
    }

    throw new Error(`[Gemini Error] ${parsedMessage}`);
  }

  const data: GeminiResponse = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const rawText = parts.map((p) => p.text || '').filter(Boolean).join('\n').trim();

  if (!rawText) {
    throw new Error('Gemini API returned an empty response candidate.');
  }

  return rawText;
}

/**
 * Safely parse JSON from a Gemini response, stripping potential markdown fences
 */
function parseJsonSafe<T>(rawText: string): T {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('[Gemini JSON Parse Failed] Raw output:', rawText);
    throw new Error('Failed to parse structured JSON from AI response: ' + (err instanceof Error ? err.message : 'Malformed JSON'));
  }
}

/**
 * 1. AI Meta Title & Description Rewriter
 */
export async function generateMetaRewrite(params: {
  title?: string;
  description?: string;
  targetKeyword?: string;
  pageUrl?: string;
}): Promise<MetaRewriteResult> {
  const prompt = `
You are an elite Google Technical SEO copywriter and click-through-rate (CTR) specialist.
Analyze the following webpage metadata and generate 3 top-tier, high-ranking, high-CTR Title and Meta Description pairs.

Input Details:
- Page URL: ${params.pageUrl || 'Not provided'}
- Target Keyword: ${params.targetKeyword || 'Extract from current metadata'}
- Current Title: "${params.title || ''}" (${params.title?.length || 0} characters)
- Current Description: "${params.description || ''}" (${params.description?.length || 0} characters)

SEO Rules to Strictly Follow:
1. Title tags must ideally be 50-60 characters (MAX 60 chars to avoid SERP pixel cutoff at 600px).
2. Meta Descriptions must ideally be 140-155 characters (MAX 160 chars to avoid snippet cutoff at 960px).
3. Integrate the primary keyword naturally near the front of at least 2 titles.
4. Add high-converting power words or CTR triggers (e.g., Guide, 2025, Checklist, Fast, Proven, Free) without clickbait.
5. Provide 3 distinct styles:
   - Style 1: "High-CTR Punchy" (Short, compelling, clear hook)
   - Style 2: "Keyword-First SEO" (Maximum organic search engine alignment)
   - Style 3: "Question/Intent-Based" (Solves specific searcher problem)

Return STRICT valid JSON format with this exact structure:
{
  "titles": [
    { "text": "...", "length": 54, "style": "High-CTR Punchy", "rationale": "..." },
    { "text": "...", "length": 58, "style": "Keyword-First SEO", "rationale": "..." },
    { "text": "...", "length": 52, "style": "Question/Intent-Based", "rationale": "..." }
  ],
  "descriptions": [
    { "text": "...", "length": 150, "style": "Action-Oriented", "rationale": "..." },
    { "text": "...", "length": 155, "style": "Benefit-Driven", "rationale": "..." },
    { "text": "...", "length": 148, "style": "Comprehensive", "rationale": "..." }
  ],
  "searchIntent": "Informational / Commercial / Transactional",
  "recommendedKeywords": ["keyword 1", "keyword 2", "keyword 3"]
}
`;

  const rawJson = await callGeminiApi(prompt, {
    jsonMode: true,
    temperature: 0.3,
    systemInstruction: 'You are a senior SEO consultant. Always respond with 100% valid JSON matching the requested schema.',
  });

  return parseJsonSafe<MetaRewriteResult>(rawJson);
}

/**
 * 2. AI Code & Action Recommendation Generator
 */
export async function generateFixRecommendation(params: {
  issueTitle: string;
  issueCategory: string;
  issueDescription: string;
  currentCode?: string;
  pageUrl?: string;
}): Promise<FixRecommendationResult> {
  const prompt = `
You are a Staff Web Performance and Technical SEO Engineer.
Analyze the following SEO / Performance audit finding and provide an exact, actionable developer implementation fix with copy-paste code.

Issue Details:
- Category: ${params.issueCategory}
- Issue: ${params.issueTitle}
- Description: ${params.issueDescription}
- Page URL: ${params.pageUrl || 'General audit'}
${params.currentCode ? `- Current Snippet / Detected Element: ${params.currentCode}` : ''}

Requirements:
1. Identify the exact root cause in 1-2 sentences.
2. Provide a 3 to 5 step concrete fix list that an engineer or webmaster can follow immediately.
3. Provide a production-ready, clean copy-paste code snippet (HTML, Next.js, React, CSS, .htaccess, or Nginx config as applicable to the issue).
4. Explain the direct SERP / User Experience ranking impact in plain English.

Return STRICT valid JSON format with this exact structure:
{
  "rootCause": "Clear explanation of why this issue occurs and why search crawlers or users penalize it.",
  "impactScore": "High",
  "effortLevel": "Quick Win (< 15 mins)",
  "stepByStepFix": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "codeSnippet": {
    "language": "html",
    "title": "Optimized Code Example",
    "code": "<meta name=...>"
  },
  "serpImpactExplanation": "Plain-English 1-line business impact on rankings or CTR."
}
`;

  const rawJson = await callGeminiApi(prompt, {
    jsonMode: true,
    temperature: 0.2,
    systemInstruction: 'You are a technical SEO engineering expert. Return only strictly valid JSON matching the schema.',
  });

  return parseJsonSafe<FixRecommendationResult>(rawJson);
}

/**
 * 3. AI Section Writer / Content Gap Filler
 */
export async function generateContentSection(params: {
  topic: string;
  targetKeyword: string;
  sectionHeading?: string;
  context?: string;
}): Promise<ContentSectionResult> {
  const prompt = `
You are an award-winning organic content strategist.
Draft a comprehensive, highly engaging, EEAT-optimized webpage section to fill an SEO content gap or upgrade thin content.

Topic: ${params.topic}
Target Keyword: ${params.targetKeyword}
${params.sectionHeading ? `Desired Section Heading: ${params.sectionHeading}` : ''}
${params.context ? `Context / Surrounding Content: ${params.context}` : ''}

SEO Guidelines:
- Craft an authoritative, natural tone that satisfies user search intent immediately.
- Use clean Markdown formatting: H2 or H3 heading, short punchy paragraphs (2-3 sentences each), bullet points for readability.
- Seamlessly weave in the target keyword and related semantic entities (LSI).
- Include 2-3 key takeaways.
- Include 2 relevant FAQ Q&As that address common People Also Ask (PAA) queries for this topic.

Return STRICT valid JSON format with this exact structure:
{
  "suggestedHeading": "Exact H2/H3 Heading Title",
  "contentMarkdown": "Full section body written in clean GitHub-Flavored Markdown...",
  "keyTakeaways": [
    "Takeaway 1...",
    "Takeaway 2...",
    "Takeaway 3..."
  ],
  "suggestedFaqs": [
    {
      "question": "Frequently asked question 1?",
      "answer": "Direct, concise answer..."
    },
    {
      "question": "Frequently asked question 2?",
      "answer": "Direct, concise answer..."
    }
  ]
}
`;

  const rawJson = await callGeminiApi(prompt, {
    jsonMode: true,
    temperature: 0.4,
    systemInstruction: 'You are an organic search content strategist. Return only strictly valid JSON matching the schema.',
  });

  return parseJsonSafe<ContentSectionResult>(rawJson);
}

/**
 * 4. AI Readability & Tone Simplifier
 */
export async function generateReadabilityRewrite(params: {
  text: string;
  targetGrade?: string;
}): Promise<ReadabilityRewriteResult> {
  const prompt = `
You are an expert plain-English editor, web readability specialist, and UX copywriter.
Analyze the following text and rewrite it to achieve an optimal 7th to 8th-grade reading level (Flesch Reading Ease 60-70) suitable for web searchers and Google Helpful Content guidelines.

Input Text:
"""
${params.text}
"""

Target Reading Level: ${params.targetGrade || '7th–8th Grade (Plain English, Flesch Ease 60–70)'}

Editorial Rules to Strictly Follow:
1. Simplify complex, multi-syllable academic jargon into natural, accessible vocabulary.
2. Break up overly long, run-on sentences into punchy, clear sentences (ideally 12-18 words each).
3. Convert passive voice into direct, active voice.
4. Preserve 100% of the original facts, core meaning, and any technical key terms.
5. Return 3 to 4 specific bulleted explanations of what was improved (e.g., "Shortened average sentence length", "Replaced dense phrasing with direct language").

Return STRICT valid JSON format with this exact structure:
{
  "simplifiedText": "The completely rewritten, easy-to-read text...",
  "originalGradeEstimate": "e.g. 12th Grade (College / Difficult)",
  "newGradeEstimate": "7th-8th Grade (Standard Plain English)",
  "keyImprovements": [
    "Shortened average sentence length from X to Y words",
    "Converted passive constructions to active voice",
    "Replaced academic jargon with accessible terminology"
  ]
}
`;

  const rawJson = await callGeminiApi(prompt, {
    jsonMode: true,
    temperature: 0.3,
    systemInstruction: 'You are an expert web readability editor. Return only strictly valid JSON matching the schema.',
  });

  return parseJsonSafe<ReadabilityRewriteResult>(rawJson);
}

/**
 * 5. AI Google Featured Snippet (Position 0) Bait Generator
 */
export async function generateSnippetBait(params: {
  query: string;
  format?: string;
  heading?: string;
  context?: string;
}): Promise<SnippetBaitResult> {
  const prompt = `
You are a senior SERP engineer and Featured Snippet (Position 0) optimization specialist.
Generate mathematically optimized "Snippet Bait" designed to win Google's Position 0 for the following search query.

Search Query: "${params.query}"
Desired Format (if specified): ${params.format || 'Auto-detect best fit (PARAGRAPH, NUMBERED_LIST, BULLETED_LIST, or TABLE)'}
Optional Heading Anchor: ${params.heading || 'None provided (generate the best H2)'}
Contextual Snippet / Page Info: ${params.context || 'None provided'}

Strict Google Featured Snippet Algorithmic Guidelines:
1. FORMAT CHOICE:
   - "What is", "Why", definitions, factual questions ➔ PARAGRAPH
   - "How to", chronological steps, tutorials, processes ➔ NUMBERED_LIST
   - "Best", "Top", collections, tips, checklists ➔ BULLETED_LIST
   - "Vs", comparisons, pricing, specs, rates ➔ TABLE

2. EDITORIAL RULES:
   - If PARAGRAPH:
     * Length MUST be strictly between 42 and 52 words.
     * Sentence 1 MUST be a direct, definitive answer (Inverted Pyramid style: "[Query/Keyword] is/are [direct definition]...").
     * Sentences 2-3 provide supporting evidence or scope.
     * ZERO filler clichés (no "in today's world", "in this post", "have you ever wondered", "without further ado").
     * 7th to 8th-grade readability level.
   - If NUMBERED_LIST:
     * Provide exactly 5 to 7 steps.
     * Each step MUST start with bold action text: "**Step 1: [Action Verb]** - [Crisp description]".
   - If BULLETED_LIST:
     * Provide exactly 5 to 7 concise items.
     * Each item MUST start with bold lead-in: "**[Item Name]**: [Crisp description]".
   - If TABLE:
     * Provide 3 to 4 descriptive column headers.
     * Provide 4 to 5 data rows comparing the entities factually.

Return STRICT valid JSON format with this exact structure:
{
  "suggestedHeading": "## [Exact H2 Question, e.g. What is Technical SEO?]",
  "format": "PARAGRAPH", // One of: "PARAGRAPH", "NUMBERED_LIST", "BULLETED_LIST", "TABLE"
  "paragraphText": "Technical SEO is the process of optimizing a website's server and code architecture so search engines can crawl, index, and render pages efficiently. It focuses on crawlability, mobile responsiveness, XML sitemaps, Core Web Vitals, and SSL certificates without altering primary marketing content.",
  "listItems": [
    "**Step 1: Audit Crawlability** - Inspect robots.txt and server status codes.",
    "**Step 2: Optimize Web Vitals** - Compress images and defer unused JavaScript."
  ],
  "tableData": {
    "headers": ["Tool", "Starting Price", "Best For", "Free Trial"],
    "rows": [
      ["AnalyzeSERP", "Free Beta", "Competitor SERP Audits", "Yes"],
      ["Ahrefs", "$99/mo", "Backlink Analysis", "No"]
    ]
  },
  "wordCount": 46,
  "rationale": "Direct answer in sentence 1 within the 40-58 word sweet spot with 0 conversational filler."
}
`;

  const rawJson = await callGeminiApi(prompt, {
    jsonMode: true,
    temperature: 0.3,
    systemInstruction: 'You are an organic search snippet specialist. Return only strictly valid JSON matching the schema.',
  });

  return parseJsonSafe<SnippetBaitResult>(rawJson);
}

export interface ScratchpadAssistResult {
  action: 'insert-keywords' | 'improve-intro' | 'simplify-reading';
  suggestedContent: string;
  explanation: string;
  keywordsUsed: string[];
}

/**
 * AI Assistant for Live SEO Content Scratchpad
 * Helps writers naturally incorporate missing gap keywords, craft high-impact SEO intros,
 * or simplify complex sentences for better readability.
 */
export async function assistContentScratchpad(params: {
  action: 'insert-keywords' | 'improve-intro' | 'simplify-reading';
  draftText: string;
  targetKeyword: string;
  missingKeywords?: string[];
}): Promise<ScratchpadAssistResult> {
  const { action, draftText, targetKeyword, missingKeywords = [] } = params;

  let taskInstruction = '';
  if (action === 'insert-keywords') {
    taskInstruction = `Weave these missing competitor keywords (${missingKeywords.slice(0, 6).join(', ')}) naturally into 2 to 3 contextual, high-value sentences or a cohesive new paragraph that fits seamlessly into the draft. AVOID keyword stuffing. Each sentence must read like human expert editorial copy.`;
  } else if (action === 'improve-intro') {
    taskInstruction = `Rewrite or generate a compelling 80 to 120-word introduction hook that includes the primary keyword "${targetKeyword}" in the first sentence or first 60 words. The intro must hook the reader, establish topical authority, and clearly state what the reader will learn.`;
  } else {
    taskInstruction = `Simplify the readability of the provided draft excerpt. Break up long, monolithic sentences (>25 words), replace convoluted jargon with clear plain English, and target an 8th-grade Flesch reading level while preserving all SEO keywords and entities.`;
  }

  const prompt = `
You are an expert SEO Content Editor and Copywriting Coach.
Current Primary Focus Keyword: "${targetKeyword}"
Missing Keywords to Incorporate: ${missingKeywords.length > 0 ? missingKeywords.slice(0, 8).join(', ') : 'None'}
Requested Action: ${action}

Task:
${taskInstruction}

Current Draft Excerpt / Context:
${draftText.slice(0, 1500) || '(No draft provided yet. Provide a high-converting opening template based on the focus keyword.)'}

Return STRICT valid JSON matching this schema:
{
  "action": "${action}",
  "suggestedContent": "High quality markdown text to insert or replace",
  "explanation": "Brief 1-sentence note explaining what was optimized",
  "keywordsUsed": ["keyword1", "keyword2"]
}
`;

  const rawJson = await callGeminiApi(prompt, {
    jsonMode: true,
    temperature: 0.4,
    systemInstruction: 'You are an elite SEO copy editor. Return only strictly valid JSON matching the requested schema.',
  });

  return parseJsonSafe<ScratchpadAssistResult>(rawJson);
}

export interface TopicClusterLinkRecommendation {
  anchorText: string;
  targetPageConcept: string;
  suggestedUrlPath: string;
  contextSentence: string;
  rationale: string;
}

export interface TopicClusterStrategyResult {
  clusterRole: 'pillar-hub' | 'spoke-support';
  pillarTitle: string;
  recommendedSpokes: string[];
  recommendedInternalLinks: TopicClusterLinkRecommendation[];
  topicalAuthorityTip: string;
}

/**
 * AI Topic Cluster & Internal Link Architect
 * Evaluates on-page content headings and keywords to engineer an optimal
 * Hub-and-Spoke internal linking topology and high-CTR anchor text placements.
 */
export async function generateInternalLinkStrategy(params: {
  pageTitle: string;
  pageUrl: string;
  targetKeyword: string;
  headings: string[];
  existingLinks?: Array<{ href: string; text: string }>;
}): Promise<TopicClusterStrategyResult> {
  const { pageTitle, pageUrl, targetKeyword, headings, existingLinks = [] } = params;

  const prompt = `
You are a Principal Technical SEO Strategist and Information Architect specializing in Topic Clusters and Internal PageRank Silos.

Target Page Information:
- Page Title: "${pageTitle}"
- Page URL: "${pageUrl}"
- Target Focus Keyword: "${targetKeyword}"
- Content Headings:
${headings.slice(0, 10).map((h) => `  - ${h}`).join('\n') || '  - (General SEO Content)'}
- Existing Internal Anchors Sample:
${existingLinks.slice(0, 6).map((l) => `  - [${l.text}] -> ${l.href}`).join('\n') || '  - None'}

Task:
1. Determine if this page functions better as a "pillar-hub" (broad guide) or "spoke-support" (in-depth subtopic).
2. Recommend 4 to 6 supporting spoke topics that should link to/from this pillar.
3. Provide 3 to 5 high-converting, natural contextual internal link placements:
   - Specific descriptive anchor text (avoid over-optimized spam and avoid generic "click here").
   - Recommended destination page concept and clean URL path (e.g. /tools/technical-audit, /blog/core-web-vitals).
   - An exact contextual sentence where the anchor naturally fits.
   - Strategic rationale for search ranking.
4. One actionable topical authority tip for Google's Helpful Content System.

Return STRICT valid JSON matching this schema:
{
  "clusterRole": "pillar-hub", // or "spoke-support"
  "pillarTitle": "Title of the cluster pillar",
  "recommendedSpokes": [
    "Subtopic 1: Deep Dive Guide",
    "Subtopic 2: Tool or Checklist"
  ],
  "recommendedInternalLinks": [
    {
      "anchorText": "Descriptive anchor phrase",
      "targetPageConcept": "Target Page Concept",
      "suggestedUrlPath": "/clean-path",
      "contextSentence": "Full sentence containing the anchor text naturally.",
      "rationale": "Why this internal link passes topical relevance"
    }
  ],
  "topicalAuthorityTip": "Concrete tip for dominating this topic cluster in SERPs"
}
`;

  const rawJson = await callGeminiApi(prompt, {
    jsonMode: true,
    temperature: 0.3,
    systemInstruction: 'You are an elite SEO Information Architect. Return strictly valid JSON matching the requested schema.',
  });

  return parseJsonSafe<TopicClusterStrategyResult>(rawJson);
}


