/**
 * Schema.org JSON-LD Generator and Validator
 * Strictly adheres to Google Search Central Rich Results & Schema.org specifications
 * Reference: fixing-metadata skill (Section 6: structured data rules)
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ArticleSchemaData {
  headline: string;
  description: string;
  url: string;
  authorName?: string;
  authorType?: 'Person' | 'Organization';
  publisherName?: string;
  publisherLogoUrl?: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
  articleType?: 'Article' | 'BlogPosting' | 'NewsArticle';
}

export interface SchemaValidationIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
}

export interface SchemaValidationResult {
  isValid: boolean;
  score: number; // 0 - 100
  issues: SchemaValidationIssue[];
}

/**
 * Escapes characters that can break <script> tags when embedding JSON in HTML
 */
export function safeJsonStringify(data: unknown, space: number = 2): string {
  const json = JSON.stringify(data, null, space);
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Generates Schema.org FAQPage JSON-LD object
 */
export function generateFaqSchema(faqs: FaqItem[]) {
  const validFaqs = faqs.filter((f) => f.question.trim().length > 0 && f.answer.trim().length > 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.trim(),
      },
    })),
  };
}

/**
 * Generates Schema.org Article / BlogPosting JSON-LD object
 */
export function generateArticleSchema(data: ArticleSchemaData) {
  const articleType = data.articleType || 'Article';
  const headline = (data.headline || '').trim().slice(0, 110);
  const description = (data.description || '').trim();
  const url = data.url ? data.url.trim() : '';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': articleType,
    headline: headline || 'Article Headline',
  };

  if (description) {
    schema.description = description;
  }

  if (url) {
    schema.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': url,
    };
  }

  if (data.imageUrl && data.imageUrl.trim()) {
    schema.image = [data.imageUrl.trim()];
  }

  if (data.authorName && data.authorName.trim()) {
    schema.author = {
      '@type': data.authorType || 'Person',
      name: data.authorName.trim(),
    };
  }

  if (data.publisherName && data.publisherName.trim()) {
    const publisher: Record<string, unknown> = {
      '@type': 'Organization',
      name: data.publisherName.trim(),
    };
    if (data.publisherLogoUrl && data.publisherLogoUrl.trim()) {
      publisher.logo = {
        '@type': 'ImageObject',
        url: data.publisherLogoUrl.trim(),
      };
    }
    schema.publisher = publisher;
  }

  if (data.datePublished) {
    schema.datePublished = data.datePublished;
  }
  if (data.dateModified) {
    schema.dateModified = data.dateModified;
  }

  return schema;
}

/**
 * Generates combined Schema using @graph for comprehensive page entity representation
 */
export function generateCombinedGraphSchema(article: ArticleSchemaData, faqs: FaqItem[]) {
  const articleSchema = generateArticleSchema(article);
  const faqSchema = generateFaqSchema(faqs);

  const graph: unknown[] = [];

  // Clean @context when combining into @graph
  const { '@context': _aCtx, ...cleanArticle } = articleSchema as { '@context'?: string; [key: string]: unknown };
  graph.push(cleanArticle);

  if (faqs.some((f) => f.question.trim() && f.answer.trim())) {
    const { '@context': _fCtx, ...cleanFaq } = faqSchema as { '@context'?: string; [key: string]: unknown };
    graph.push(cleanFaq);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

/**
 * Validates FAQ items against Google Rich Results standards
 */
export function validateFaqSchema(faqs: FaqItem[]): SchemaValidationResult {
  const issues: SchemaValidationIssue[] = [];
  const validFaqs = faqs.filter((f) => f.question.trim().length > 0 || f.answer.trim().length > 0);

  if (validFaqs.length === 0) {
    issues.push({
      type: 'error',
      field: 'mainEntity',
      message: 'At least 1 Question and Answer pair is required for FAQPage schema.',
    });
    return { isValid: false, score: 0, issues };
  }

  if (validFaqs.length < 2) {
    issues.push({
      type: 'warning',
      field: 'mainEntity',
      message: 'Google recommends providing at least 2 to 3 FAQs to qualify for rich snippet display.',
    });
  }

  validFaqs.forEach((faq, idx) => {
    const qNum = idx + 1;
    const qText = faq.question.trim();
    const aText = faq.answer.trim();

    if (!qText) {
      issues.push({
        type: 'error',
        field: `faq[${qNum}].question`,
        message: `Question #${qNum} is empty. A valid question string is required by Googlebot.`,
      });
    } else {
      if (qText.length < 8) {
        issues.push({
          type: 'warning',
          field: `faq[${qNum}].question`,
          message: `Question #${qNum} ("${qText}") is very short. Ensure it captures clear searcher intent.`,
        });
      }
      if (!qText.endsWith('?') && !qText.endsWith('.')) {
        issues.push({
          type: 'info',
          field: `faq[${qNum}].question`,
          message: `Question #${qNum} does not end with a question mark ('?').`,
        });
      }
    }

    if (!aText) {
      issues.push({
        type: 'error',
        field: `faq[${qNum}].answer`,
        message: `Answer #${qNum} is empty. Google requires non-empty acceptedAnswer text.`,
      });
    } else if (aText.length < 15) {
      issues.push({
        type: 'warning',
        field: `faq[${qNum}].answer`,
        message: `Answer #${qNum} is under 15 characters. Search engines favor concise yet complete direct answers.`,
      });
    }
  });

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;

  let score = 100 - errorCount * 30 - warningCount * 10;
  if (score < 0) score = 0;

  return {
    isValid: errorCount === 0,
    score,
    issues,
  };
}

/**
 * Validates Article Schema against Google Search Central guidelines
 */
export function validateArticleSchema(data: ArticleSchemaData): SchemaValidationResult {
  const issues: SchemaValidationIssue[] = [];

  if (!data.headline || !data.headline.trim()) {
    issues.push({
      type: 'error',
      field: 'headline',
      message: 'Headline is required by Google for Article schema.',
    });
  } else if (data.headline.length > 110) {
    issues.push({
      type: 'warning',
      field: 'headline',
      message: `Headline is ${data.headline.length} characters (Google recommends under 110 chars).`,
    });
  }

  if (!data.description || !data.description.trim()) {
    issues.push({
      type: 'warning',
      field: 'description',
      message: 'Description is recommended for Article search snippets.',
    });
  }

  if (!data.imageUrl || !data.imageUrl.trim()) {
    issues.push({
      type: 'warning',
      field: 'image',
      message: 'Article image URL is recommended by Google for rich card display in SERPs & Google Discover.',
    });
  }

  if (!data.authorName || !data.authorName.trim()) {
    issues.push({
      type: 'warning',
      field: 'author',
      message: 'Author information is highly recommended for Google E-E-A-T evaluation.',
    });
  }

  if (!data.datePublished) {
    issues.push({
      type: 'warning',
      field: 'datePublished',
      message: 'datePublished is recommended for Article structured data.',
    });
  }

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;

  let score = 100 - errorCount * 35 - warningCount * 10;
  if (score < 0) score = 0;

  return {
    isValid: errorCount === 0,
    score,
    issues,
  };
}

/**
 * Heuristically extracts questions from page headings (H2/H3)
 */
export function extractQuestionsFromHeadings(headings: { level: string; text: string }[]): string[] {
  const questionPatterns = [
    /\?$/,
    /^(what|why|how|when|where|who|which|can|is|are|does|do|should|could|would|will)\b/i,
    /\b(faq|frequently asked|common questions|q&a)\b/i,
  ];

  const extracted: string[] = [];
  const seen = new Set<string>();

  headings.forEach((h) => {
    const text = (h.text || '').trim();
    if (text.length > 5 && !seen.has(text.toLowerCase())) {
      const isQuestion = questionPatterns.some((p) => p.test(text));
      if (isQuestion) {
        seen.add(text.toLowerCase());
        extracted.push(text);
      }
    }
  });

  return extracted;
}

/**
 * Formats JSON-LD into standard HTML <script> tag
 */
export function formatScriptTag(jsonLd: object): string {
  const stringified = safeJsonStringify(jsonLd, 2);
  return `<script type="application/ld+json">\n${stringified}\n</script>`;
}

/**
 * Formats JSON-LD for Next.js Script component
 */
export function formatReactScript(jsonLd: object, id: string = 'structured-data'): string {
  const stringified = safeJsonStringify(jsonLd, 2);
  return `<Script\n  id="${id}"\n  type="application/ld+json"\n  dangerouslySetInnerHTML={{ __html: JSON.stringify(${JSON.stringify(jsonLd, null, 2)}) }}\n/>`;
}
