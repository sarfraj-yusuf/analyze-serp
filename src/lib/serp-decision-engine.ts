import { SinglePageAudit, SerpAlignmentReport, SerpConsensusPattern, EvidenceRecommendation } from '@/types/seo';
import { analyzeKeywordGaps } from './keyword-gap';

/**
 * Normalizes heading text for thematic clustering
 */
function normalizeHeadingText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates thematic overlap between two heading strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(' ').filter((w) => w.length > 2));
  const words2 = new Set(str2.split(' ').filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach((w) => {
    if (words2.has(w)) intersection++;
  });

  return (2.0 * intersection) / (words1.size + words2.size);
}

/**
 * Main Decision Engine: Analyzes SERP competitor consensus vs Your Page
 */
export function analyzeSerpAlignment(
  results: SinglePageAudit[],
  targetUrlInput?: string,
  targetKeywordInput?: string
): SerpAlignmentReport {
  const validResults = results.filter((r) => r.status === 'success');
  if (validResults.length === 0) {
    return {
      alignmentScore: 0,
      opportunityCount: 0,
      verdictHeadline: 'No valid audit data available.',
      verdictSubtext: 'Please check URL inputs and retry.',
      highImpactCount: 0,
      improvementsCount: 0,
      strengthsCount: 0,
      targetUrl: targetUrlInput || '',
      targetKeyword: targetKeywordInput || '',
      top3Opportunities: [],
      serpConsensusPatterns: [],
      technicalHygiene: {
        isCrawlable: false,
        isIndexable: false,
        hasHttps: false,
        hasCanonicalMatch: false,
        issues: ['Failed to load web pages.'],
      },
      evidenceActions: [],
      dontTouchStrengths: [],
    };
  }

  const primaryTargetUrl = targetUrlInput || validResults[0].url;
  const targetAudit = validResults.find((r) => r.url === primaryTargetUrl) || validResults[0];
  const competitors = validResults.filter((r) => r.url !== targetAudit.url);

  const totalAuditsCount = validResults.length;
  const compCount = competitors.length;

  // ── 1. TECHNICAL HYGIENE & CRAWLABILITY CHECK ──
  const techIssues: string[] = [];
  const isCrawlable = targetAudit.status === 'success' && targetAudit.wordCount > 0;
  const robotsStatus = targetAudit.robotsValidation?.status;
  const isIndexable = robotsStatus !== 'BLOCKED' && targetAudit.meta.robotsDirective !== 'noindex';
  const hasHttps = targetAudit.technicalAudit?.hasHttps ?? targetAudit.url.startsWith('https://');
  const hasCanonicalMatch = !targetAudit.meta.canonicalUrl || targetAudit.meta.canonicalUrl.includes(new URL(targetAudit.url).hostname);

  if (!isCrawlable) techIssues.push('Page HTML payload is empty or blocked from scraping.');
  if (!isIndexable) techIssues.push('Robots directive or robots.txt prohibits indexing (noindex/disallow).');
  if (!hasHttps) techIssues.push('Page lacks SSL/HTTPS security protocol.');
  if (!hasCanonicalMatch) techIssues.push('Canonical tag points to an external URL or domain mismatch.');

  const technicalHygiene = {
    isCrawlable,
    isIndexable,
    hasHttps,
    hasCanonicalMatch,
    issues: techIssues,
  };

  // ── 2. SERP PATTERN CONSENSUS EXTRACTION ──
  const serpConsensusPatterns: SerpConsensusPattern[] = [];

  // A. Search Intent Consensus
  const intentCounts: Record<string, number> = {};
  validResults.forEach((r) => {
    const intent = r.searchIntent?.primaryIntent || 'INFORMATIONAL';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  });

  const dominantIntent = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'INFORMATIONAL';
  const dominantIntentRatio = Math.round((intentCounts[dominantIntent] / totalAuditsCount) * 100);
  const targetIntent = targetAudit.searchIntent?.primaryIntent || 'INFORMATIONAL';
  const isIntentMatched = targetIntent === dominantIntent;

  serpConsensusPatterns.push({
    frequencyRatio: `${intentCounts[dominantIntent]}/${totalAuditsCount}`,
    frequencyPercent: dominantIntentRatio,
    patternType: 'INTENT',
    title: `${dominantIntent.charAt(0) + dominantIntent.slice(1).toLowerCase()} Search Intent Focus`,
    description: `${intentCounts[dominantIntent]} of ${totalAuditsCount} pages target ${dominantIntent.toLowerCase()} user queries.`,
    isPresentOnTarget: isIntentMatched,
  });

  // B. Structural Heading Clusters Across Competitors
  const competitorHeadingsList = competitors.flatMap((c) =>
    c.headings.filter((h) => h.level === 'h2' || h.level === 'h3')
  );

  const headingClusters: { theme: string; originalText: string; count: number; urls: Set<string> }[] = [];

  competitorHeadingsList.forEach((h) => {
    const norm = normalizeHeadingText(h.text);
    if (norm.length < 5) return;

    let matched = headingClusters.find((c) => calculateSimilarity(c.theme, norm) > 0.45);
    if (matched) {
      matched.count++;
      matched.urls.add(h.text);
    } else {
      headingClusters.push({
        theme: norm,
        originalText: h.text,
        count: 1,
        urls: new Set([h.text]),
      });
    }
  });

  // Filter themes present in >= 2 competitors or >= 50% of competitors
  const minCompThreshold = Math.max(2, Math.ceil(compCount * 0.5));
  const commonHeadingThemes = headingClusters.filter((c) => c.count >= (compCount >= 2 ? minCompThreshold : 1));

  commonHeadingThemes.slice(0, 6).forEach((theme) => {
    const targetHasTheme = targetAudit.headings.some(
      (th) => calculateSimilarity(normalizeHeadingText(th.text), theme.theme) > 0.4
    );
    const ratio = Math.min(compCount, theme.count);

    serpConsensusPatterns.push({
      frequencyRatio: `${ratio}/${compCount + 1}`,
      frequencyPercent: Math.round((ratio / (compCount + 1)) * 100),
      patternType: 'TOPIC',
      title: `Subtopic: "${theme.originalText}"`,
      description: `Covered by ${ratio} ranking competitors.`,
      isPresentOnTarget: targetHasTheme,
    });
  });

  // C. Structural Elements (FAQ & Tables & Schema)
  let compFaqCount = 0;
  let compSchemaCount = 0;
  competitors.forEach((c) => {
    const hasFaqHeading = c.headings.some((h) => /faq|frequently asked|questions/i.test(h.text));
    if (hasFaqHeading) compFaqCount++;
    if (c.meta.hasJsonLdSchema) compSchemaCount++;
  });

  const targetHasFaq = targetAudit.headings.some((h) => /faq|frequently asked|questions/i.test(h.text));
  if (compFaqCount >= 1) {
    serpConsensusPatterns.push({
      frequencyRatio: `${compFaqCount}/${compCount}`,
      frequencyPercent: Math.round((compFaqCount / compCount) * 100),
      patternType: 'STRUCTURE',
      title: 'Dedicated FAQ / User Question Section',
      description: `${compFaqCount} of ${compCount} competitors feature a structured FAQ section.`,
      isPresentOnTarget: targetHasFaq,
    });
  }

  if (compSchemaCount >= 1) {
    serpConsensusPatterns.push({
      frequencyRatio: `${compSchemaCount}/${compCount}`,
      frequencyPercent: Math.round((compSchemaCount / compCount) * 100),
      patternType: 'SCHEMA',
      title: 'JSON-LD Structured Data Schema',
      description: `${compSchemaCount} of ${compCount} competitors implement JSON-LD schema markup.`,
      isPresentOnTarget: targetAudit.meta.hasJsonLdSchema,
    });
  }

  // ── 3. EVIDENCE-BASED ACTION RECOMMENDATIONS (IMPACT x EFFORT) ──
  const evidenceActions: EvidenceRecommendation[] = [];

  // Action 1: Intent Mismatch
  if (!isIntentMatched) {
    evidenceActions.push({
      id: 'intent-mismatch',
      title: 'Align Content Search Intent',
      action: `Refactor page structure from ${targetIntent.toLowerCase()} to ${dominantIntent.toLowerCase()} focus to match user expectation.`,
      evidence: `${intentCounts[dominantIntent]}/${totalAuditsCount} ranking pages target ${dominantIntent.toLowerCase()} intent.`,
      isMissing: true,
      impact: 'HIGH',
      effort: 'HIGH',
      quadrant: 'PLAN_THIS',
      category: 'INTENT',
    });
  }

  // Action 2: Sub-topic Gaps (Heading Themes)
  commonHeadingThemes.forEach((theme, idx) => {
    const targetHasTheme = targetAudit.headings.some(
      (th) => calculateSimilarity(normalizeHeadingText(th.text), theme.theme) > 0.4
    );

    if (!targetHasTheme) {
      const ratioStr = `${Math.min(compCount, theme.count)}/${compCount} ranking competitors`;
      evidenceActions.push({
        id: `subtopic-gap-${idx}`,
        title: `Add Subtopic: "${theme.originalText}"`,
        action: `Add a dedicated H2 section covering "${theme.originalText}" with supporting details.`,
        evidence: `${ratioStr} cover this subtopic section.`,
        isMissing: true,
        impact: theme.count >= compCount ? 'HIGH' : 'MEDIUM',
        effort: 'LOW',
        quadrant: theme.count >= compCount ? 'DO_FIRST' : 'DO_NEXT',
        category: 'TOPIC',
      });
    }
  });

  // Action 3: Keyword Gaps (Entities & Questions)
  const gapAnalysis = analyzeKeywordGaps(validResults, targetAudit.url);
  const topMissingGaps = (gapAnalysis.yourPageMissingGaps || []).slice(0, 5);

  topMissingGaps.forEach((gap, idx) => {
    const compPresenceCount = Object.values(gap.presenceMap).filter((p) => p.count > 0).length;
    evidenceActions.push({
      id: `keyword-gap-${idx}`,
      title: `Integrate Core Entity: "${gap.phrase}"`,
      action: `Naturally include "${gap.phrase}" in relevant paragraphs or section headings.`,
      evidence: `Used frequently across ${compPresenceCount} competitors (max density ${gap.maxDensity}%).`,
      isMissing: true,
      impact: 'HIGH',
      effort: 'LOW',
      quadrant: 'DO_FIRST',
      category: 'QUESTION',
    });
  });

  // Action 4: FAQ Module
  if (compFaqCount >= 1 && !targetHasFaq) {
    evidenceActions.push({
      id: 'faq-section-gap',
      title: 'Add User FAQ Section',
      action: 'Expose 3-5 common user questions in an FAQ H2 section, then add FAQPage schema markup.',
      evidence: `${compFaqCount}/${compCount} ranking pages include an FAQ section.`,
      isMissing: true,
      impact: 'MEDIUM',
      effort: 'LOW',
      quadrant: 'DO_NEXT',
      category: 'STRUCTURE',
    });
  }

  // Action 5: Schema Markup
  if (compSchemaCount >= 1 && !targetAudit.meta.hasJsonLdSchema) {
    evidenceActions.push({
      id: 'schema-markup-gap',
      title: 'Implement JSON-LD Schema Markup',
      action: 'Add structured Article or FAQ schema code to enhance Google search snippet visibility.',
      evidence: `${compSchemaCount}/${compCount} ranking pages implement JSON-LD schema.`,
      isMissing: true,
      impact: 'MEDIUM',
      effort: 'LOW',
      quadrant: 'DO_NEXT',
      category: 'SCHEMA',
    });
  }

  // Action 6: Readability Adjustment
  const avgCompReadability = competitors.length > 0
    ? Math.round(competitors.reduce((acc, c) => acc + (c.readability?.fleschReadingEase || 60), 0) / competitors.length)
    : 60;
  const targetReadability = targetAudit.readability?.fleschReadingEase || 60;

  if (targetReadability < avgCompReadability - 15) {
    evidenceActions.push({
      id: 'readability-gap',
      title: 'Simplify Writing Tone & Readability',
      action: `Shorten complex sentences to improve reading ease from ${targetReadability}/100 closer to SERP level (~${avgCompReadability}/100).`,
      evidence: `Competitor pages average ${avgCompReadability}/100 reading ease (${competitors[0]?.readability?.gradeLabel || 'Standard'}).`,
      isMissing: true,
      impact: 'MEDIUM',
      effort: 'MEDIUM',
      quadrant: 'DO_NEXT',
      category: 'ONPAGE',
    });
  }

  // ── 4. STRENGTHS ISOLATION ("DON'T WASTE TIME CHANGING THESE") ──
  const dontTouchStrengths: { title: string; reason: string }[] = [];

  // Check Speed / TTFB
  const avgCompTtfb = competitors.length > 0
    ? Math.round(competitors.reduce((acc, c) => acc + (c.technicalAudit?.ttfbMs || 300), 0) / competitors.length)
    : 300;
  const targetTtfb = targetAudit.technicalAudit?.ttfbMs || 200;

  if (targetTtfb <= avgCompTtfb + 50) {
    dontTouchStrengths.push({
      title: `Server Speed & TTFB (${targetTtfb}ms)`,
      reason: `Your server response time is faster or equal to competitor average (${avgCompTtfb}ms). Do not waste time changing hosting or CDNs.`,
    });
  }

  // Check Title Tag
  if (targetAudit.meta.titleLength >= 35 && targetAudit.meta.titleLength <= 65 && !targetAudit.meta.titleTruncated) {
    dontTouchStrengths.push({
      title: `Page Title Length (${targetAudit.meta.titleLength} chars)`,
      reason: 'Your title tag length is optimal for Google SERP displays (<600px). No rewrite needed.',
    });
  }

  // Check H1 Tag
  const targetH1Count = targetAudit.headings.filter((h) => h.level === 'h1').length;
  if (targetH1Count === 1) {
    dontTouchStrengths.push({
      title: 'Main Heading (H1) Focus',
      reason: 'Single clean H1 tag detected matching primary search topic.',
    });
  }

  // Check HTTPS
  if (hasHttps) {
    dontTouchStrengths.push({
      title: 'SSL / HTTPS Security Protocol',
      reason: 'Your site is fully encrypted with secure HTTPS.',
    });
  }

  // Check Image Alt Text
  if (targetAudit.imageAudit.totalImages > 0 && targetAudit.imageAudit.missingAltCount === 0) {
    dontTouchStrengths.push({
      title: 'Image Alt Text Coverage',
      reason: `All ${targetAudit.imageAudit.totalImages} images include descriptive ALT tags. No image alt updates required.`,
    });
  }

  // ── 5. SERP ALIGNMENT SCORE CALCULATION (0 - 100) ──
  const missingThemesCount = commonHeadingThemes.filter(
    (t) => !targetAudit.headings.some((th) => calculateSimilarity(normalizeHeadingText(th.text), t.theme) > 0.4)
  ).length;
  const topicSubScore = commonHeadingThemes.length > 0
    ? Math.max(0, 100 - (missingThemesCount / commonHeadingThemes.length) * 100)
    : 85;

  const entitySubScore = Math.max(0, 100 - topMissingGaps.length * 15);
  const intentSubScore = isIntentMatched ? 100 : 35;

  let structSubScore = 100;
  if (compFaqCount >= 1 && !targetHasFaq) structSubScore -= 40;
  if (compSchemaCount >= 1 && !targetAudit.meta.hasJsonLdSchema) structSubScore -= 30;

  let onpageSubScore = 100;
  if (targetAudit.meta.titleTruncated) onpageSubScore -= 30;
  if (targetAudit.meta.descriptionLength === 0) onpageSubScore -= 40;

  const techSubScore = isCrawlable && isIndexable && hasHttps && hasCanonicalMatch ? 100 : 40;

  const rawScore = Math.round(
    topicSubScore * 0.25 +
    entitySubScore * 0.25 +
    intentSubScore * 0.20 +
    structSubScore * 0.15 +
    onpageSubScore * 0.10 +
    techSubScore * 0.05
  );

  const alignmentScore = Math.min(98, Math.max(25, rawScore));

  // ── 6. VERDICT HEADLINE & SUBTEXT GENERATION ──
  const highImpactActions = evidenceActions.filter((a) => a.impact === 'HIGH');
  const improvementsActions = evidenceActions.filter((a) => a.impact === 'MEDIUM');

  let verdictHeadline = '';
  let verdictSubtext = '';

  if (alignmentScore >= 85) {
    verdictHeadline = 'Your page is strongly aligned with ranking SERP standards.';
    verdictSubtext = 'Your page covers most competitor subtopics and intent signals. Focus on minor keyword refinement and FAQ schema.';
  } else if (!isIntentMatched) {
    verdictHeadline = 'Search Intent Mismatch Detected.';
    verdictSubtext = `Competitors rank with ${dominantIntent.toLowerCase()} guides, while your page targets ${targetIntent.toLowerCase()} format.`;
  } else if (missingThemesCount > 0) {
    verdictHeadline = 'Your page matches search intent, but competitors cover more subtopics & user questions.';
    verdictSubtext = `Top-ranking pages cover ${commonHeadingThemes.length - missingThemesCount} of ${commonHeadingThemes.length} subtopic themes found across competitors.`;
  } else {
    verdictHeadline = 'Content depth & entity coverage gaps detected vs ranking pages.';
    verdictSubtext = 'Enhance key paragraphs with core missing entities and structured Q&A sections.';
  }

  const top3Opportunities = evidenceActions.slice(0, 3).map((a) => ({
    title: a.title,
    category: a.category,
    evidenceText: a.evidence,
  }));

  return {
    alignmentScore,
    opportunityCount: evidenceActions.length,
    verdictHeadline,
    verdictSubtext,
    highImpactCount: highImpactActions.length,
    improvementsCount: improvementsActions.length,
    strengthsCount: dontTouchStrengths.length,
    targetUrl: targetAudit.url,
    targetKeyword: targetKeywordInput || '',
    top3Opportunities,
    serpConsensusPatterns,
    technicalHygiene,
    evidenceActions,
    dontTouchStrengths,
  };
}
