import { LinkAudit, LinkItem, AnchorCategory } from '@/types/seo';

/**
 * Detects whether an outbound link is an affiliate link and identifies the affiliate network
 */
export function detectAffiliateNetwork(href: string): { isAffiliate: boolean; network: string | null } {
  if (!href) return { isAffiliate: false, network: null };

  const lowerHref = href.toLowerCase();

  // 1. Amazon Associates
  if (
    lowerHref.includes('amazon.com') && (lowerHref.includes('tag=') || lowerHref.includes('ascsubtag=')) ||
    lowerHref.includes('amzn.to') ||
    lowerHref.includes('amazon.co.uk') && lowerHref.includes('tag=')
  ) {
    return { isAffiliate: true, network: 'Amazon Associates' };
  }

  // 2. ShareASale
  if (lowerHref.includes('shareasale.com') || lowerHref.includes('shareasale-analytics.com')) {
    return { isAffiliate: true, network: 'ShareASale' };
  }

  // 3. Impact / ImpactRadius
  if (
    lowerHref.includes('impact.com') ||
    lowerHref.includes('impactradius.com') ||
    lowerHref.includes('sjv.io') ||
    lowerHref.includes('pxf.io') ||
    lowerHref.includes('evyy.net')
  ) {
    return { isAffiliate: true, network: 'Impact' };
  }

  // 4. CJ Affiliate (Commission Junction)
  if (
    lowerHref.includes('anrdoezrs.net') ||
    lowerHref.includes('dpbolvf.net') ||
    lowerHref.includes('jdoqocy.com') ||
    lowerHref.includes('tkqlhce.com') ||
    lowerHref.includes('cj.com')
  ) {
    return { isAffiliate: true, network: 'CJ Affiliate' };
  }

  // 5. Rakuten Advertising
  if (lowerHref.includes('linksynergy.com') || lowerHref.includes('rakuten.com')) {
    return { isAffiliate: true, network: 'Rakuten' };
  }

  // 6. ClickBank
  if (lowerHref.includes('hop.clickbank.net') || lowerHref.includes('clickbank.net')) {
    return { isAffiliate: true, network: 'ClickBank' };
  }

  // 7. Awin
  if (lowerHref.includes('awin1.com') || lowerHref.includes('zenaps.com')) {
    return { isAffiliate: true, network: 'Awin' };
  }

  // 8. Generic Affiliate URL Parameters
  if (
    lowerHref.includes('aff=') ||
    lowerHref.includes('affiliate=') ||
    lowerHref.includes('ref=') ||
    lowerHref.includes('utm_medium=affiliate')
  ) {
    return { isAffiliate: true, network: 'Generic Affiliate' };
  }

  return { isAffiliate: false, network: null };
}

/**
 * Classifies anchor text into Keyword-Rich, Branded, or Generic
 */
export function classifyAnchorText(anchorText: string, targetHref: string, sourceUrl: string): AnchorCategory {
  const cleanText = anchorText.trim().toLowerCase();

  if (!cleanText || cleanText === '(no text)') {
    return 'Generic';
  }

  // Generic Anchor Matcher
  const genericRegex = /^(click here|read more|source|link|website|here|learn more|visit website|this article|more info|view more|details|info|page|url|check out|site)$/i;
  if (genericRegex.test(cleanText)) {
    return 'Generic';
  }

  // Branded Matcher
  let sourceHost = '';
  let targetHost = '';
  try {
    sourceHost = new URL(sourceUrl).hostname.replace(/^www\./, '').split('.')[0];
  } catch {}
  try {
    targetHost = new URL(targetHref).hostname.replace(/^www\./, '').split('.')[0];
  } catch {}

  if (
    (sourceHost && cleanText.includes(sourceHost)) ||
    (targetHost && cleanText.includes(targetHost))
  ) {
    return 'Branded';
  }

  // Keyword-Rich Default for descriptive anchors
  return 'Keyword-Rich';
}

/**
 * Enhances raw link array into a full LinkAudit with anchor categorization and affiliate footprint detection
 */
export function enhanceLinkAudit(
  rawLinks: { href: string; text: string; isExternal: boolean; isNofollow: boolean }[],
  sourceUrl: string
): LinkAudit {
  const totalLinks = rawLinks.length;
  let internalCount = 0;
  let externalCount = 0;
  let nofollowCount = 0;
  let affiliateCount = 0;

  let keywordRichCount = 0;
  let brandedCount = 0;
  let genericCount = 0;

  const networksSet = new Set<string>();

  const enhancedLinks: LinkItem[] = rawLinks.map((link) => {
    if (link.isExternal) externalCount++;
    else internalCount++;

    if (link.isNofollow) nofollowCount++;

    // Anchor Classification
    const anchorCategory = classifyAnchorText(link.text, link.href, sourceUrl);
    if (anchorCategory === 'Keyword-Rich') keywordRichCount++;
    else if (anchorCategory === 'Branded') brandedCount++;
    else genericCount++;

    // Affiliate Detection
    const { isAffiliate, network } = detectAffiliateNetwork(link.href);
    if (isAffiliate) {
      affiliateCount++;
      if (network) networksSet.add(network);
    }

    return {
      ...link,
      anchorCategory,
      isAffiliate,
      affiliateNetwork: network,
    };
  });

  return {
    totalLinks,
    internalCount,
    externalCount,
    nofollowCount,
    affiliateCount,
    anchorBreakdown: {
      keywordRichCount,
      brandedCount,
      genericCount,
    },
    affiliateNetworksDetected: Array.from(networksSet),
    links: enhancedLinks,
  };
}
