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
