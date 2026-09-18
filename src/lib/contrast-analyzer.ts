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

// ── Standard Tailwind Color Token Map ──
export const TAILWIND_COLORS: Record<string, string> = {
  'slate-50': '#F8FAFC', 'slate-100': '#F1F5F9', 'slate-200': '#E2E8F0', 'slate-300': '#CBD5E1',
  'slate-400': '#94A3B8', 'slate-500': '#64748B', 'slate-600': '#475569', 'slate-700': '#334155',
  'slate-800': '#1E293B', 'slate-900': '#0F172A', 'slate-950': '#020617',
  'gray-50': '#F9FAFB', 'gray-100': '#F3F4F6', 'gray-200': '#E5E7EB', 'gray-300': '#D1D5DB',
  'gray-400': '#9CA3AF', 'gray-500': '#6B7280', 'gray-600': '#4B5563', 'gray-700': '#374151',
  'gray-800': '#1F2937', 'gray-900': '#111827', 'gray-950': '#030712',
  'zinc-50': '#FAFAFA', 'zinc-100': '#F4F4F5', 'zinc-200': '#E4E4E7', 'zinc-300': '#D4D4D8',
  'zinc-400': '#A1A1AA', 'zinc-500': '#71717A', 'zinc-600': '#52525B', 'zinc-700': '#3F3F46',
  'zinc-800': '#27272A', 'zinc-900': '#18181B', 'zinc-950': '#09090B',
  'neutral-900': '#171717', 'neutral-950': '#0A0A0A',
  'red-500': '#EF4444', 'red-600': '#DC2626', 'red-700': '#B91C1C',
  'orange-500': '#F97316', 'orange-600': '#EA580C',
  'amber-400': '#FBBF24', 'amber-500': '#F59E0B', 'amber-600': '#D97706',
  'yellow-400': '#FACC15', 'yellow-500': '#EAB308',
  'emerald-400': '#34D399', 'emerald-500': '#10B981', 'emerald-600': '#059669', 'emerald-700': '#047857',
  'green-500': '#22C55E', 'green-600': '#16A34A', 'green-700': '#15803D',
  'teal-400': '#2DD4BF', 'teal-500': '#14B8A6', 'teal-600': '#0D9488',
  'cyan-400': '#22D3EE', 'cyan-500': '#06B6D4', 'cyan-600': '#0891B2',
  'sky-400': '#38BDF8', 'sky-500': '#0EA5E9', 'sky-600': '#0284C7',
  'blue-400': '#60A5FA', 'blue-500': '#3B82F6', 'blue-600': '#2563EB', 'blue-700': '#1D4ED8',
  'indigo-400': '#818CF8', 'indigo-500': '#6366F1', 'indigo-600': '#4F46E5', 'indigo-700': '#4338CA',
  'violet-500': '#8B5CF6', 'violet-600': '#7C3AED',
  'purple-500': '#A855F7', 'purple-600': '#9333EA',
  'fuchsia-500': '#D946EF', 'pink-500': '#EC4899', 'rose-500': '#F43F5E',
  'white': '#FFFFFF',
  'black': '#000000',
};

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
 * Converts HSL color values to RGB tuple
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s = Math.max(0, Math.min(1, s / 100));
  l = Math.max(0, Math.min(1, l / 100));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * Parses CSS color string (Hex, RGB, RGBA, HSL, HSLA, named, var(--)) into Hex string
 */
export function parseColorToHex(
  colorStr: string,
  defaultHex: string = '#FFFFFF',
  cssVars?: Record<string, string>
): string {
  if (!colorStr) return defaultHex;
  let str = colorStr.trim().toLowerCase();

  // If color references a CSS var e.g. var(--primary)
  if (str.includes('var(') && cssVars) {
    const varMatch = str.match(/var\(\s*(--[a-zA-Z0-9_-]+)(?:\s*,\s*([^)]+))?\s*\)/);
    if (varMatch) {
      const varName = varMatch[1];
      const fallback = varMatch[2];
      if (cssVars[varName]) {
        str = cssVars[varName].toLowerCase();
      } else if (fallback) {
        str = fallback.trim().toLowerCase();
      }
    }
  }

  // Hex
  if (str.startsWith('#')) {
    let clean = str.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    } else if (clean.length === 8) {
      clean = clean.substring(0, 6);
    }
    if (clean.length === 6 && /^[0-9a-f]{6}$/i.test(clean)) {
      return `#${clean.toUpperCase()}`;
    }
    return defaultHex;
  }

  // RGB / RGBA
  const rgbMatch = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return rgbToHex(
      parseInt(rgbMatch[1], 10),
      parseInt(rgbMatch[2], 10),
      parseInt(rgbMatch[3], 10)
    );
  }

  // HSL / HSLA
  const hslMatch = str.match(/hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?/);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]);
    const l = parseFloat(hslMatch[3]);
    const [r, g, b] = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }

  // Common named colors fallback
  const namedMap: Record<string, string> = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#EF4444',
    green: '#10B981',
    blue: '#3B82F6',
    yellow: '#FBBF24',
    purple: '#8B5CF6',
    gray: '#6B7280',
    grey: '#6B7280',
    orange: '#F97316',
    navy: '#0F172A',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    indigo: '#6366F1',
    pink: '#EC4899',
    rose: '#F43F5E',
    amber: '#F59E0B',
    emerald: '#10B981',
    slate: '#64748B',
    transparent: '#FFFFFF',
  };

  return namedMap[str] || defaultHex;
}

/**
 * Resolves Tailwind or utility classes on an element into FG and BG hex codes
 */
export function resolveTailwindClass(className: string | undefined): { fg?: string; bg?: string } {
  if (!className) return {};
  const tokens = className.split(/\s+/);
  let fg: string | undefined;
  let bg: string | undefined;

  for (const token of tokens) {
    // 1. Arbitrary Hex / RGB classes e.g. bg-[#10b981] or text-[#ffffff]
    const arbitraryBg = token.match(/^bg-\[([#a-zA-Z0-9(),\s]+)\]$/);
    if (arbitraryBg && arbitraryBg[1]) {
      const hex = parseColorToHex(arbitraryBg[1], '');
      if (hex) bg = hex;
    }

    const arbitraryText = token.match(/^text-\[([#a-zA-Z0-9(),\s]+)\]$/);
    if (arbitraryText && arbitraryText[1]) {
      const hex = parseColorToHex(arbitraryText[1], '');
      if (hex) fg = hex;
    }

    // 2. Standard Tailwind classes e.g. bg-emerald-500, text-slate-800
    const bgMatch = token.match(/^bg-([a-z]+(?:-[0-9]+)?)$/);
    if (bgMatch && TAILWIND_COLORS[bgMatch[1]]) {
      bg = TAILWIND_COLORS[bgMatch[1]];
    }

    const textMatch = token.match(/^text-([a-z]+(?:-[0-9]+)?)$/);
    if (textMatch && TAILWIND_COLORS[textMatch[1]]) {
      fg = TAILWIND_COLORS[textMatch[1]];
    }
  }

  return { fg, bg };
}

export interface ExtractedCSSData {
  cssVars: Record<string, string>;
  selectorRules: {
    selector: string;
    fg?: string;
    bg?: string;
  }[];
  allColors: string[];
}

/**
 * Extracts CSS variables and selector rules from full CSS text
 */
export function extractCssData(cssText: string): ExtractedCSSData {
  const cssVars: Record<string, string> = {};
  const selectorRules: { selector: string; fg?: string; bg?: string }[] = [];
  const allColorsSet = new Set<string>();

  if (!cssText) return { cssVars, selectorRules, allColors: [] };

  // 1. Extract CSS variables: --name: value;
  const varRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;!}]+)/g;
  let varMatch: RegExpExecArray | null;
  while ((varMatch = varRegex.exec(cssText)) !== null) {
    const name = `--${varMatch[1]}`;
    const rawVal = varMatch[2].trim();
    const hex = parseColorToHex(rawVal, '');
    if (hex) {
      cssVars[name] = hex;
      allColorsSet.add(hex);
    }
  }

  // 2. Extract rules for key selectors (body, button, a, h1, h2, etc.)
  const cleanCss = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
  let ruleMatch: RegExpExecArray | null;

  while ((ruleMatch = ruleRegex.exec(cleanCss)) !== null) {
    const selector = ruleMatch[1].trim().toLowerCase();
    const decls = ruleMatch[2];

    let fg: string | undefined;
    let bg: string | undefined;

    const colorMatch = decls.match(/(?:^|;)\s*color\s*:\s*([^;!}]+)/i);
    if (colorMatch) {
      const parsed = parseColorToHex(colorMatch[1].trim(), '', cssVars);
      if (parsed) {
        fg = parsed;
        allColorsSet.add(parsed);
      }
    }

    const bgMatch = decls.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;!}]+)/i);
    if (bgMatch) {
      const parsed = parseColorToHex(bgMatch[1].trim(), '', cssVars);
      if (parsed) {
        bg = parsed;
        allColorsSet.add(parsed);
      }
    }

    if (fg || bg) {
      selectorRules.push({ selector, fg, bg });
    }
  }

  // 3. Find raw hex colors in CSS
  const hexMatches = cssText.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || [];
  for (const h of hexMatches) {
    const clean = parseColorToHex(h, '');
    if (clean) allColorsSet.add(clean);
  }

  return {
    cssVars,
    selectorRules,
    allColors: Array.from(allColorsSet),
  };
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

  if (bgLuminance < 0.5) {
    return {
      suggestedFg: '#FFFFFF',
      suggestedBg: bgHex,
      tip: 'Dark background detected: Switch text color to crisp #FFFFFF for high legibility.',
    };
  }

  return {
    suggestedFg: '#0F172A',
    suggestedBg: bgHex,
    tip: 'Light background detected: Darken text color to #0F172A (Dark Slate) to pass WCAG AA.',
  };
}

/**
 * Resolves foreground and background colors for an element using style, class, and CSS rules
 */
function resolveElementColors(
  $: cheerio.CheerioAPI,
  el: any,
  cssData: ExtractedCSSData,
  fallbackBg: string,
  fallbackFg: string
): { fg: string; bg: string } {
  // 1. Check inline style attribute
  const styleAttr = $(el).attr('style');
  let inlineFg: string | undefined;
  let inlineBg: string | undefined;
  if (styleAttr) {
    const parts = styleAttr.split(';');
    for (const part of parts) {
      const [key, val] = part.split(':').map((s) => s.trim().toLowerCase());
      if (key === 'color' && val) inlineFg = parseColorToHex(val, '', cssData.cssVars);
      if ((key === 'background-color' || key === 'background') && val) {
        inlineBg = parseColorToHex(val, '', cssData.cssVars);
      }
    }
  }

  // 2. Check Tailwind classes
  const classAttr = $(el).attr('class') || '';
  const tw = resolveTailwindClass(classAttr);

  let fg = inlineFg || tw.fg;
  let bg = inlineBg || tw.bg;

  // 3. Check CSS selector rules
  if (!fg || !bg) {
    const tag = (el.tagName || '').toLowerCase();
    const classList = classAttr.split(/\s+/).filter(Boolean);

    for (const rule of cssData.selectorRules) {
      const sel = rule.selector;
      const matches =
        sel === tag ||
        sel.includes(tag) ||
        classList.some((c) => sel.includes(`.${c.toLowerCase()}`));

      if (matches) {
        if (!fg && rule.fg) fg = rule.fg;
        if (!bg && rule.bg) bg = rule.bg;
        if (fg && bg) break;
      }
    }
  }

  // 4. Check parent container background if missing
  if (!bg) {
    const parent = $(el).parent();
    if (parent && parent.length) {
      const pTw = resolveTailwindClass(parent.attr('class'));
      if (pTw.bg) bg = pTw.bg;
    }
  }

  return {
    fg: fg || fallbackFg,
    bg: bg || fallbackBg,
  };
}

/**
 * Analyzes HTML DOM content and stylesheets for authentic color contrast pairs
 */
export function analyzePageContrast(
  html: string,
  targetUrl: string,
  externalCss: string = ''
): ContrastReportData {
  const $ = cheerio.load(html);

  // 1. Combine inline styles and external stylesheets
  let inlineCss = '';
  $('style').each((_, el) => {
    inlineCss += '\n' + $(el).text();
  });
  const combinedCss = (inlineCss + '\n' + externalCss).slice(0, 300000);
  const cssData = extractCssData(combinedCss);

  // 2. Discover brand palette from meta tags, theme colors, SVG fills, and CSS
  const brandColorCandidates: string[] = [];

  const themeColor = $('meta[name="theme-color"]').attr('content');
  if (themeColor) {
    const parsed = parseColorToHex(themeColor, '');
    if (parsed) brandColorCandidates.push(parsed);
  }

  const msTileColor = $('meta[name="msapplication-TileColor"]').attr('content');
  if (msTileColor) {
    const parsed = parseColorToHex(msTileColor, '');
    if (parsed) brandColorCandidates.push(parsed);
  }

  // Gather SVG fills
  $('svg [fill]').slice(0, 5).each((_, el) => {
    const fill = $(el).attr('fill');
    if (fill && fill !== 'none' && fill !== 'currentColor') {
      const parsed = parseColorToHex(fill, '');
      if (parsed) brandColorCandidates.push(parsed);
    }
  });

  // Add colors from CSS
  brandColorCandidates.push(...cssData.allColors);

  // Frequency-sort colors, filtering out pure blacks/whites
  const colorFrequency: Record<string, number> = {};
  for (const c of brandColorCandidates) {
    const hex = c.toUpperCase();
    colorFrequency[hex] = (colorFrequency[hex] || 0) + 1;
  }

  const sortedColors = Object.entries(colorFrequency)
    .filter(([hex]) => {
      // Exclude pure white and pure black from primary brand palette display
      return hex !== '#FFFFFF' && hex !== '#000000' && hex !== '#020617' && hex !== '#F8FAFC';
    })
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  // Top 5 vibrant brand colors discovered
  const brandPalette = sortedColors.slice(0, 6);
  if (brandPalette.length === 0) {
    brandPalette.push('#10B981', '#06B6D4', '#6366F1', '#F59E0B');
  }

  const primaryBrandColor = brandPalette[0] || '#10B981';

  // 3. Detect Page Background & Theme Mode (Dark / Light)
  const bodyClass = $('body').attr('class') || '';
  const htmlClass = $('html').attr('class') || '';
  const bodyTw = resolveTailwindClass(bodyClass);
  const isDarkMode =
    htmlClass.includes('dark') ||
    bodyClass.includes('dark') ||
    bodyClass.includes('bg-slate-900') ||
    bodyClass.includes('bg-zinc-900') ||
    bodyClass.includes('bg-black');

  let defaultBodyBg = bodyTw.bg;
  if (!defaultBodyBg) {
    for (const rule of cssData.selectorRules) {
      if (rule.selector === 'body' || rule.selector === 'html') {
        if (rule.bg) {
          defaultBodyBg = rule.bg;
          break;
        }
      }
    }
  }

  if (!defaultBodyBg) {
    defaultBodyBg = isDarkMode ? '#0F172A' : '#FFFFFF';
  }

  const defaultBodyFg = isDarkMode ? '#F8FAFC' : '#1E293B';

  const pairs: ColorPairAudit[] = [];

  // 4. Button Audit (Extract up to 3 buttons)
  const buttonSelectors = 'button, a.btn, a[class*="button"], a[class*="btn"], input[type="submit"], [role="button"]';
  const auditedButtons = new Set<string>();

  $(buttonSelectors).each((idx, el) => {
    if (pairs.length >= 3) return;
    const text = $(el).text().trim() || $(el).attr('value') || `Button #${idx + 1}`;
    if (!text || text.length > 40 || auditedButtons.has(text.toLowerCase())) return;
    auditedButtons.add(text.toLowerCase());

    const resolved = resolveElementColors($, el, cssData, primaryBrandColor, '#FFFFFF');

    // If button has default transparent bg, make sure it has brand color
    let btnBg = resolved.bg;
    if (btnBg === '#FFFFFF' && defaultBodyBg === '#FFFFFF') {
      btnBg = primaryBrandColor;
    }

    let btnFg = resolved.fg;
    // Calculate contrast and adjust default text if unreadable
    const initialRatio = calculateContrastRatio(hexToRgb(btnFg), hexToRgb(btnBg));
    if (initialRatio < 2.5) {
      const bgLum = getRelativeLuminance(...hexToRgb(btnBg));
      btnFg = bgLum < 0.5 ? '#FFFFFF' : '#000000';
    }

    const ratio = calculateContrastRatio(hexToRgb(btnFg), hexToRgb(btnBg));
    const suggestions = generateSuggestedColors(btnFg, btnBg, 3.0);

    pairs.push({
      element: `Action Button ("${text.slice(0, 24)}")`,
      selector: el.tagName ? el.tagName.toLowerCase() : 'button',
      fgColor: btnFg,
      bgColor: btnBg,
      ratio,
      wcagAaNormal: ratio >= 4.5,
      wcagAaLarge: ratio >= 3.0,
      wcagAaaNormal: ratio >= 7.0,
      suggestedFgColor: suggestions.suggestedFg,
      suggestedBgColor: suggestions.suggestedBg,
      recommendation: suggestions.tip,
    });
  });

  // 5. Heading Audit (H1 / H2)
  $('h1, h2').slice(0, 2).each((idx, el) => {
    const text = $(el).text().trim() || `Heading #${idx + 1}`;
    if (!text || text.length > 50) return;

    const resolved = resolveElementColors($, el, cssData, defaultBodyBg, defaultBodyFg);
    const fg = resolved.fg;
    const bg = resolved.bg;

    const ratio = calculateContrastRatio(hexToRgb(fg), hexToRgb(bg));
    const suggestions = generateSuggestedColors(fg, bg, 4.5);

    pairs.push({
      element: `Heading (${el.tagName.toUpperCase()} "${text.slice(0, 24)}")`,
      selector: el.tagName.toLowerCase(),
      fgColor: fg,
      bgColor: bg,
      ratio,
      wcagAaNormal: ratio >= 4.5,
      wcagAaLarge: ratio >= 3.0,
      wcagAaaNormal: ratio >= 7.0,
      suggestedFgColor: suggestions.suggestedFg,
      suggestedBgColor: suggestions.suggestedBg,
      recommendation: suggestions.tip,
    });
  });

  // 6. Body Paragraph Text Audit
  const firstParagraph = $('p').first();
  const paraText = firstParagraph.text().trim() || 'Main content paragraph copy';
  const resolvedBody = firstParagraph.length
    ? resolveElementColors($, firstParagraph.get(0), cssData, defaultBodyBg, isDarkMode ? '#CBD5E1' : '#475569')
    : { fg: isDarkMode ? '#CBD5E1' : '#475569', bg: defaultBodyBg };

  const bodyRatio = calculateContrastRatio(hexToRgb(resolvedBody.fg), hexToRgb(resolvedBody.bg));
  const bodySuggestions = generateSuggestedColors(resolvedBody.fg, resolvedBody.bg, 4.5);

  pairs.push({
    element: `Main Paragraph ("${paraText.slice(0, 24)}...")`,
    selector: 'p',
    fgColor: resolvedBody.fg,
    bgColor: resolvedBody.bg,
    ratio: bodyRatio,
    wcagAaNormal: bodyRatio >= 4.5,
    wcagAaLarge: bodyRatio >= 3.0,
    wcagAaaNormal: bodyRatio >= 7.0,
    suggestedFgColor: bodySuggestions.suggestedFg,
    suggestedBgColor: bodySuggestions.suggestedBg,
    recommendation: bodySuggestions.tip,
  });

  // 7. Anchor Hyperlink Audit
  const firstLink = $('a[href]:not([class*="btn"]):not([class*="button"])').first();
  const linkText = firstLink.text().trim() || 'Documentation Link';
  const linkFgFallback = brandPalette[1] || brandPalette[0] || '#2563EB';
  const resolvedLink = firstLink.length
    ? resolveElementColors($, firstLink.get(0), cssData, defaultBodyBg, linkFgFallback)
    : { fg: linkFgFallback, bg: defaultBodyBg };

  const linkRatio = calculateContrastRatio(hexToRgb(resolvedLink.fg), hexToRgb(resolvedLink.bg));
  const linkSuggestions = generateSuggestedColors(resolvedLink.fg, resolvedLink.bg, 4.5);

  pairs.push({
    element: `Inline Hyperlink ("${linkText.slice(0, 20)}")`,
    selector: 'a',
    fgColor: resolvedLink.fg,
    bgColor: resolvedLink.bg,
    ratio: linkRatio,
    wcagAaNormal: linkRatio >= 4.5,
    wcagAaLarge: linkRatio >= 3.0,
    wcagAaaNormal: linkRatio >= 7.0,
    suggestedFgColor: linkSuggestions.suggestedFg,
    suggestedBgColor: linkSuggestions.suggestedBg,
    recommendation: linkSuggestions.tip,
  });

  // Calculate scores
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
    brandPalette,
    timestamp: new Date().toISOString(),
  };
}

