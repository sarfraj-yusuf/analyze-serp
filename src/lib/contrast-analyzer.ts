import * as cheerio from 'cheerio';

export interface ColorPairAudit {
  element: string; // e.g. "Primary Button", "Body Text", "Card Heading", "Anchor Link"
  selector: string;
  fgColor: string; // Hex e.g. "#FFFFFF"
  bgColor: string; // Hex e.g. "#059669"
  ratio: number; // e.g. 7.4
  wcagAaNormal: boolean; // >= 4.5:1
  wcagAaLarge: boolean; // >= 3.0:1
  wcagAaaNormal: boolean; // >= 7.0:1
  suggestedFgColor: string;
  suggestedBgColor: string;
  recommendation: string;
}

export interface ContrastReportData {
  url: string;
  overallScore: number; // 0 - 100
  totalPairsAudited: number;
  passedAaCount: number;
  passedAaaCount: number;
  failedCount: number;
  pairs: ColorPairAudit[];
  brandPalette: string[]; // Discovered dominant Hex colors
  timestamp: string;
}

/**
 * Calculates official W3C relative luminance for an RGB color.
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;

  const R = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const G = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const B = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Computes WCAG 2.1 Contrast Ratio between two RGB colors.
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 */
export function calculateContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const l1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

/**
 * Converts Hex string to RGB tuple
 */
export function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleanHex.length !== 6) return [255, 255, 255]; // fallback white

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return [isNaN(r) ? 255 : r, isNaN(g) ? 255 : g, isNaN(b) ? 255 : b];
}

/**
 * Converts RGB tuple to Hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Parses CSS color string (Hex, RGB, RGBA) into Hex string
 */
export function parseColorToHex(colorStr: string, defaultHex: string = '#FFFFFF'): string {
  if (!colorStr) return defaultHex;
  const str = colorStr.trim().toLowerCase();

  if (str.startsWith('#')) {
    return str.toUpperCase();
  }

  const rgbMatch = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return rgbToHex(
      parseInt(rgbMatch[1], 10),
      parseInt(rgbMatch[2], 10),
      parseInt(rgbMatch[3], 10)
    );
  }

  // Common named colors fallback
  const namedMap: { [key: string]: string } = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#EF4444',
    green: '#10B981',
    blue: '#3B82F6',
    gray: '#6B7280',
    transparent: '#FFFFFF',
  };

  return namedMap[str] || defaultHex;
}

/**
 * Generates user-brand preserving contrast recommendations
 */
export function generateSuggestedColors(
  fgHex: string,
  bgHex: string,
  targetRatio: number = 4.5
): { suggestedFg: string; suggestedBg: string; tip: string } {
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  const currentRatio = calculateContrastRatio(fgRgb, bgRgb);

  if (currentRatio >= targetRatio) {
    return {
      suggestedFg: fgHex,
      suggestedBg: bgHex,
      tip: 'Passed WCAG standards! Perfect contrast ratio.',
    };
  }

  const bgLuminance = getRelativeLuminance(bgRgb[0], bgRgb[1], bgRgb[2]);

  // If background is dark (luminance < 0.5), make text lighter (closer to white)
  if (bgLuminance < 0.5) {
    return {
      suggestedFg: '#FFFFFF',
      suggestedBg: bgHex,
      tip: 'Dark background detected: Switch text color to crisp #FFFFFF for high legibility.',
    };
  }

  // If background is light, make text darker (closer to dark slate/black)
  return {
    suggestedFg: '#0F172A',
    suggestedBg: bgHex,
    tip: 'Light background detected: Darken text color to #0F172A (Dark Slate) to pass WCAG AA.',
  };
}

/**
 * Analyzes HTML DOM content for color contrast pairs
 */
export function analyzePageContrast(html: string, targetUrl: string): ContrastReportData {
  const $ = cheerio.load(html);

  const pairs: ColorPairAudit[] = [];
  const brandPaletteSet = new Set<string>();

  // Helper to extract style colors from style attribute
  const extractStyleColors = (styleAttr: string | undefined): { fg?: string; bg?: string } => {
    if (!styleAttr) return {};
    let fg: string | undefined;
    let bg: string | undefined;

    const parts = styleAttr.split(';');
    for (const part of parts) {
      const [key, val] = part.split(':').map((s) => s.trim().toLowerCase());
      if (key === 'color' && val) fg = parseColorToHex(val);
      if ((key === 'background-color' || key === 'background') && val) bg = parseColorToHex(val);
    }
    return { fg, bg };
  };

  // 1. Button Audit
  $('button, a.btn, a[class*="button"], a[class*="btn"]').slice(0, 4).each((idx, el) => {
    const text = $(el).text().trim() || `Button #${idx + 1}`;
    const style = $(el).attr('style');
    const { fg, bg } = extractStyleColors(style);

    const fgHex = fg || '#FFFFFF';
    const bgHex = bg || '#059669'; // default emerald button
    brandPaletteSet.add(fgHex);
    brandPaletteSet.add(bgHex);

    const fgRgb = hexToRgb(fgHex);
    const bgRgb = hexToRgb(bgHex);
    const ratio = calculateContrastRatio(fgRgb, bgRgb);
    const suggestions = generateSuggestedColors(fgHex, bgHex, 3.0);

    pairs.push({
      element: `Primary Button ("${text.slice(0, 20)}")`,
      selector: el.tagName,
      fgColor: fgHex,
      bgColor: bgHex,
      ratio,
      wcagAaNormal: ratio >= 4.5,
      wcagAaLarge: ratio >= 3.0,
      wcagAaaNormal: ratio >= 7.0,
      suggestedFgColor: suggestions.suggestedFg,
      suggestedBgColor: suggestions.suggestedBg,
      recommendation: suggestions.tip,
    });
  });

  // 2. Heading Audit (H1 / H2)
  $('h1, h2').slice(0, 3).each((idx, el) => {
    const text = $(el).text().trim() || `Heading #${idx + 1}`;
    const style = $(el).attr('style');
    const { fg, bg } = extractStyleColors(style);

    const fgHex = fg || '#0F172A';
    const bgHex = bg || '#F8FAFC';
    brandPaletteSet.add(fgHex);
    brandPaletteSet.add(bgHex);

    const fgRgb = hexToRgb(fgHex);
    const bgRgb = hexToRgb(bgHex);
    const ratio = calculateContrastRatio(fgRgb, bgRgb);
    const suggestions = generateSuggestedColors(fgHex, bgHex, 4.5);

    pairs.push({
      element: `Heading (${el.tagName.toUpperCase()} "${text.slice(0, 24)}")`,
      selector: el.tagName,
      fgColor: fgHex,
      bgColor: bgHex,
      ratio,
      wcagAaNormal: ratio >= 4.5,
      wcagAaLarge: ratio >= 3.0,
      wcagAaaNormal: ratio >= 7.0,
      suggestedFgColor: suggestions.suggestedFg,
      suggestedBgColor: suggestions.suggestedBg,
      recommendation: suggestions.tip,
    });
  });

  // 3. Body Text Audit
  const bodyStyle = $('body').attr('style');
  const bodyColors = extractStyleColors(bodyStyle);
  const bodyFgHex = bodyColors.fg || '#334155';
  const bodyBgHex = bodyColors.bg || '#FFFFFF';
  brandPaletteSet.add(bodyFgHex);
  brandPaletteSet.add(bodyBgHex);

  const bodyRatio = calculateContrastRatio(hexToRgb(bodyFgHex), hexToRgb(bodyBgHex));
  const bodySuggestions = generateSuggestedColors(bodyFgHex, bodyBgHex, 4.5);

  pairs.push({
    element: 'Main Paragraph Body Text',
    selector: 'p',
    fgColor: bodyFgHex,
    bgColor: bodyBgHex,
    ratio: bodyRatio,
    wcagAaNormal: bodyRatio >= 4.5,
    wcagAaLarge: bodyRatio >= 3.0,
    wcagAaaNormal: bodyRatio >= 7.0,
    suggestedFgColor: bodySuggestions.suggestedFg,
    suggestedBgColor: bodySuggestions.suggestedBg,
    recommendation: bodySuggestions.tip,
  });

  // 4. Anchor Link Audit
  $('a[href]').slice(0, 2).each((idx, el) => {
    const text = $(el).text().trim() || `Link #${idx + 1}`;
    const style = $(el).attr('style');
    const { fg, bg } = extractStyleColors(style);

    const fgHex = fg || '#2563EB'; // default blue link
    const bgHex = bg || bodyBgHex;
    brandPaletteSet.add(fgHex);

    const ratio = calculateContrastRatio(hexToRgb(fgHex), hexToRgb(bgHex));
    const suggestions = generateSuggestedColors(fgHex, bgHex, 4.5);

    pairs.push({
      element: `Inline Hyperlink ("${text.slice(0, 20)}")`,
      selector: 'a',
      fgColor: fgHex,
      bgColor: bgHex,
      ratio,
      wcagAaNormal: ratio >= 4.5,
      wcagAaLarge: ratio >= 3.0,
      wcagAaaNormal: ratio >= 7.0,
      suggestedFgColor: suggestions.suggestedFg,
      suggestedBgColor: suggestions.suggestedBg,
      recommendation: suggestions.tip,
    });
  });

  const passedAaCount = pairs.filter((p) => p.wcagAaNormal || p.wcagAaLarge).length;
  const passedAaaCount = pairs.filter((p) => p.wcagAaaNormal).length;
  const failedCount = pairs.length - passedAaCount;
  const overallScore = Math.round((passedAaCount / (pairs.length || 1)) * 100);

  return {
    url: targetUrl,
    overallScore,
    totalPairsAudited: pairs.length,
    passedAaCount,
    passedAaaCount,
    failedCount,
    pairs,
    brandPalette: Array.from(brandPaletteSet).slice(0, 6),
    timestamp: new Date().toISOString(),
  };
}
