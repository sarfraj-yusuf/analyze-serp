import { SearchIntentData, TopicalEntity, KeywordAnalysis, HeadingItem } from '@/types/seo';

/**
 * Analyzes search intent (Informational, Commercial, Transactional, Navigational)
 * and extracts main topical entities with confidence scores.
 */
export function analyzeSearchIntentAndEntities(
  title: string,
  headings: HeadingItem[],
  keywords: KeywordAnalysis
): SearchIntentData {
  const combinedText = [
    title,
    ...headings.map((h) => h.text),
    ...(keywords.oneGram || []).map((k) => k.phrase),
    ...(keywords.twoGram || []).map((k) => k.phrase),
  ]
    .join(' ')
    .toLowerCase();

  const signalsFound: string[] = [];

  // 1. Search Intent Keyword Indicators
  const infoPatterns = ['how to', 'what is', 'guide', 'tutorial', 'examples', 'definition', 'tips', 'why', 'overview', 'step by step', 'explained'];
  const commercialPatterns = ['best', 'vs', 'review', 'top', 'compare', 'pricing', 'features', 'alternative', 'pros and cons', 'cost'];
  const transPatterns = ['buy', 'order', 'discount', 'coupon', 'checkout', 'download', 'sign up', 'register', 'pricing', 'hire'];
  const navPatterns = ['login', 'signin', 'official', 'portal', 'dashboard', 'homepage', 'account'];

  let infoScore = 0;
  let commScore = 0;
  let transScore = 0;
  let navScore = 0;

  infoPatterns.forEach((p) => {
    if (combinedText.includes(p)) {
      infoScore += combinedText.split(p).length - 1;
      if (signalsFound.length < 6) signalsFound.push(`Informational: "${p}"`);
    }
  });

  commercialPatterns.forEach((p) => {
    if (combinedText.includes(p)) {
      commScore += (combinedText.split(p).length - 1) * 1.5;
      if (signalsFound.length < 6) signalsFound.push(`Commercial: "${p}"`);
    }
  });

  transPatterns.forEach((p) => {
    if (combinedText.includes(p)) {
      transScore += (combinedText.split(p).length - 1) * 2;
      if (signalsFound.length < 6) signalsFound.push(`Transactional: "${p}"`);
    }
  });

  navPatterns.forEach((p) => {
    if (combinedText.includes(p)) {
      navScore += (combinedText.split(p).length - 1) * 2;
      if (signalsFound.length < 6) signalsFound.push(`Navigational: "${p}"`);
    }
  });

  // Default intent fallback
  let primaryIntent: 'INFORMATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL' | 'NAVIGATIONAL' = 'INFORMATIONAL';
  let maxScore = infoScore;

  if (commScore > maxScore) {
    primaryIntent = 'COMMERCIAL';
    maxScore = commScore;
  }
  if (transScore > maxScore) {
    primaryIntent = 'TRANSACTIONAL';
    maxScore = transScore;
  }
  if (navScore > maxScore && navScore > 3) {
    primaryIntent = 'NAVIGATIONAL';
    maxScore = navScore;
  }

  const totalScores = infoScore + commScore + transScore + navScore || 1;
  const confidencePercent = Math.min(95, Math.max(60, Math.round((maxScore / totalScores) * 100) + 15));

  // 2. Topical Entity Extraction
  const topicalEntities: TopicalEntity[] = [];

  const addEntity = (name: string, category: TopicalEntity['category'], count: number, density: number) => {
    if (!topicalEntities.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
      topicalEntities.push({
        name,
        category,
        count,
        densityPercent: density,
      });
    }
  };

  // Extract from 2-gram & 3-gram keywords
  (keywords.twoGram || []).slice(0, 5).forEach((item) => {
    addEntity(item.phrase, 'TOPIC_CONCEPT', item.count, item.density);
  });

  (keywords.threeGram || []).slice(0, 5).forEach((item) => {
    addEntity(item.phrase, 'TECHNICAL_TERM', item.count, item.density);
  });

  // 3. Actionable Recommendations based on intent
  const recommendations: string[] = [];

  if (primaryIntent === 'INFORMATIONAL') {
    recommendations.push('Structure content with clear H2/H3 subheadings and bullet points to satisfy quick-answer user queries.');
    recommendations.push('Add an FAQ section or Table of Contents to target Google Featured Snippets.');
  } else if (primaryIntent === 'COMMERCIAL') {
    recommendations.push('Include comparison tables, feature breakdown matrices, and pros/cons lists to help buyers evaluate options.');
    recommendations.push('Add clear Call-To-Action (CTA) buttons linking to full reviews or product sign-ups.');
  } else if (primaryIntent === 'TRANSACTIONAL') {
    recommendations.push('Ensure price points, discount badges, and checkout trust badges are prominently visible above the fold.');
    recommendations.push('Optimize page speed & mobile checkout flow to prevent cart abandonment.');
  } else {
    recommendations.push('Ensure official brand title tags, logo schema, and direct portal links are prominent.');
  }

  return {
    primaryIntent,
    confidencePercent,
    intentSignalsFound: signalsFound.slice(0, 5),
    topicalEntities: topicalEntities.slice(0, 8),
    recommendations,
  };
}
