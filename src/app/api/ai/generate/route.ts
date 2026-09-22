import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserCredits, consumeUserCredit } from '@/lib/user-credits';
import { saveUserAiActivity } from '@/lib/db';
import { aiRateLimiter } from '@/lib/rate-limiter';
import {
  generateMetaRewrite,
  generateFixRecommendation,
  generateContentSection,
  generateReadabilityRewrite,
  generateSnippetBait,
  assistContentScratchpad,
  generateInternalLinkStrategy,
} from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    // 1. IP Burst Rate Limiting Guard (max 10 AI generations per minute per IP)
    const clientIp = aiRateLimiter.getClientIp(req);
    const rateLimit = aiRateLimiter.check(clientIp);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `AI generation burst limit reached. Too many requests from your IP. Please wait ${Math.ceil(
            rateLimit.resetMs / 1000
          )} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        }
      );
    }

    // 2. Authenticate user session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: 'Authentication required. Please sign in with Google or GitHub to unlock free AI tools.',
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // 2. Check daily credit balance
    const creditStatus = await getUserCredits(userEmail);
    if (creditStatus.remainingCredits <= 0) {
      return NextResponse.json(
        {
          error: `Daily AI credit limit reached (${creditStatus.limit}/${creditStatus.limit} used). Your 5 free credits will reset in ${creditStatus.resetInHours} hour(s).`,
          limitReached: true,
          remainingCredits: 0,
          resetInHours: creditStatus.resetInHours,
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate payload
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const { type } = body;
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "type" parameter' }, { status: 400 });
    }

    let generatedData: unknown;

    // 4. Route generation request to appropriate Gemini handler
    switch (type) {
      case 'meta-rewrite': {
        const { title, description, targetKeyword, pageUrl } = body;
        if (typeof title === 'string' && title.length > 300) {
          return NextResponse.json({ error: 'Title parameter exceeds 300 characters limit' }, { status: 400 });
        }
        if (typeof description === 'string' && description.length > 1000) {
          return NextResponse.json({ error: 'Description parameter exceeds 1,000 characters limit' }, { status: 400 });
        }
        generatedData = await generateMetaRewrite({
          title: typeof title === 'string' ? title.slice(0, 300) : undefined,
          description: typeof description === 'string' ? description.slice(0, 1000) : undefined,
          targetKeyword: typeof targetKeyword === 'string' ? targetKeyword.slice(0, 200) : undefined,
          pageUrl: typeof pageUrl === 'string' ? pageUrl.slice(0, 1000) : undefined,
        });
        break;
      }

      case 'fix-recommendation': {
        const { issueTitle, issueCategory, issueDescription, currentCode, pageUrl } = body;
        if (!issueTitle || typeof issueTitle !== 'string') {
          return NextResponse.json({ error: 'Missing required "issueTitle" parameter' }, { status: 400 });
        }
        if (issueTitle.length > 300) {
          return NextResponse.json({ error: 'issueTitle exceeds 300 characters limit' }, { status: 400 });
        }
        if (typeof currentCode === 'string' && currentCode.length > 5000) {
          return NextResponse.json({ error: 'currentCode exceeds 5,000 characters limit' }, { status: 400 });
        }
        generatedData = await generateFixRecommendation({
          issueTitle: issueTitle.slice(0, 300),
          issueCategory: typeof issueCategory === 'string' ? issueCategory.slice(0, 100) : 'SEO Audit',
          issueDescription: typeof issueDescription === 'string' ? issueDescription.slice(0, 2000) : 'Technical SEO recommendation',
          currentCode: typeof currentCode === 'string' ? currentCode.slice(0, 5000) : undefined,
          pageUrl: typeof pageUrl === 'string' ? pageUrl.slice(0, 1000) : undefined,
        });
        break;
      }

      case 'content-section': {
        const { topic, targetKeyword, sectionHeading, context } = body;
        if (!topic || typeof topic !== 'string') {
          return NextResponse.json({ error: 'Missing required "topic" parameter' }, { status: 400 });
        }
        if (topic.length > 300) {
          return NextResponse.json({ error: 'topic exceeds 300 characters limit' }, { status: 400 });
        }
        if (typeof context === 'string' && context.length > 5000) {
          return NextResponse.json({ error: 'context exceeds 5,000 characters limit' }, { status: 400 });
        }
        generatedData = await generateContentSection({
          topic: topic.slice(0, 300),
          targetKeyword: typeof targetKeyword === 'string' ? targetKeyword.slice(0, 200) : topic.slice(0, 300),
          sectionHeading: typeof sectionHeading === 'string' ? sectionHeading.slice(0, 300) : undefined,
          context: typeof context === 'string' ? context.slice(0, 5000) : undefined,
        });
        break;
      }

      case 'simplify-tone': {
        const { text, targetGrade } = body;
        if (!text || typeof text !== 'string') {
          return NextResponse.json({ error: 'Missing required "text" parameter' }, { status: 400 });
        }
        if (text.length > 6000) {
          return NextResponse.json(
            { error: 'Input text exceeds 6,000 characters limit. Please simplify a shorter excerpt.' },
            { status: 400 }
          );
        }
        generatedData = await generateReadabilityRewrite({
          text: text.slice(0, 6000),
          targetGrade: typeof targetGrade === 'string' ? targetGrade.slice(0, 100) : undefined,
        });
        break;
      }

      case 'snippet-bait': {
        const { query, format, heading, context } = body;
        if (!query || typeof query !== 'string') {
          return NextResponse.json({ error: 'Missing required "query" parameter' }, { status: 400 });
        }
        if (query.length > 300) {
          return NextResponse.json({ error: 'query parameter exceeds 300 characters limit' }, { status: 400 });
        }
        if (typeof context === 'string' && context.length > 5000) {
          return NextResponse.json({ error: 'context exceeds 5,000 characters limit' }, { status: 400 });
        }
        generatedData = await generateSnippetBait({
          query: query.slice(0, 300),
          format: typeof format === 'string' ? format.slice(0, 50) : undefined,
          heading: typeof heading === 'string' ? heading.slice(0, 300) : undefined,
          context: typeof context === 'string' ? context.slice(0, 5000) : undefined,
        });
        break;
      }

      case 'scratchpad-assist': {
        const { action, draftText, targetKeyword, missingKeywords } = body;
        if (
          action !== 'insert-keywords' &&
          action !== 'improve-intro' &&
          action !== 'simplify-reading'
        ) {
          return NextResponse.json(
            { error: 'Invalid or missing "action" for scratchpad-assist. Supported: insert-keywords, improve-intro, simplify-reading.' },
            { status: 400 }
          );
        }
        if (!targetKeyword || typeof targetKeyword !== 'string') {
          return NextResponse.json(
            { error: 'Missing required "targetKeyword" parameter' },
            { status: 400 }
          );
        }
        if (targetKeyword.length > 200) {
          return NextResponse.json({ error: 'targetKeyword exceeds 200 characters limit' }, { status: 400 });
        }
        if (typeof draftText === 'string' && draftText.length > 15000) {
          return NextResponse.json(
            { error: 'Draft text exceeds 15,000 characters limit for AI assistant.' },
            { status: 400 }
          );
        }
        generatedData = await assistContentScratchpad({
          action,
          draftText: typeof draftText === 'string' ? draftText.slice(0, 15000) : '',
          targetKeyword: targetKeyword.slice(0, 200),
          missingKeywords: Array.isArray(missingKeywords)
            ? missingKeywords.slice(0, 20).filter((k): k is string => typeof k === 'string').map(k => k.slice(0, 100))
            : [],
        });
        break;
      }

      case 'internal-link-strategy': {
        const { pageTitle, pageUrl, targetKeyword, headings, existingLinks } = body;
        if (!pageTitle || !pageUrl || !targetKeyword) {
          return NextResponse.json(
            { error: 'Missing required "pageTitle", "pageUrl", or "targetKeyword" parameters' },
            { status: 400 }
          );
        }
        if (typeof pageTitle === 'string' && pageTitle.length > 300) {
          return NextResponse.json({ error: 'pageTitle exceeds 300 characters limit' }, { status: 400 });
        }
        if (typeof targetKeyword === 'string' && targetKeyword.length > 200) {
          return NextResponse.json({ error: 'targetKeyword exceeds 200 characters limit' }, { status: 400 });
        }
        generatedData = await generateInternalLinkStrategy({
          pageTitle: typeof pageTitle === 'string' ? pageTitle.slice(0, 300) : '',
          pageUrl: typeof pageUrl === 'string' ? pageUrl.slice(0, 1000) : '',
          targetKeyword: typeof targetKeyword === 'string' ? targetKeyword.slice(0, 200) : '',
          headings: Array.isArray(headings)
            ? headings.slice(0, 30).filter((h): h is string => typeof h === 'string').map(h => h.slice(0, 200))
            : [],
          existingLinks: Array.isArray(existingLinks) ? existingLinks.slice(0, 30) : [],
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unsupported generation type: "${type}". Supported: meta-rewrite, fix-recommendation, content-section, simplify-tone, snippet-bait, scratchpad-assist, internal-link-strategy.` },
          { status: 400 }
        );
    }

    // 5. Deduct 1 credit upon successful generation
    const deduction = await consumeUserCredit(userEmail);

    // 6. Log activity to user_ai_history
    try {
      const targetSummary =
        type === 'meta-rewrite'
          ? (typeof body.title === 'string' ? body.title : (typeof body.pageUrl === 'string' ? body.pageUrl : 'Page Metadata'))
          : type === 'fix-recommendation'
          ? (typeof body.issueTitle === 'string' ? body.issueTitle : 'Technical SEO Issue')
          : type === 'simplify-tone'
          ? 'Readability Plain-English Tone Rewrite'
          : type === 'snippet-bait'
          ? (typeof body.query === 'string' ? `Position 0: "${body.query}"` : 'Position 0 Snippet Bait')
          : type === 'scratchpad-assist'
          ? (typeof body.targetKeyword === 'string' ? `SEO Scratchpad: "${body.targetKeyword}"` : 'SEO Scratchpad Assist')
          : type === 'internal-link-strategy'
          ? (typeof body.targetKeyword === 'string' ? `Link Topology: "${body.targetKeyword}"` : 'Internal Link Topic Cluster')
          : (typeof body.topic === 'string' ? body.topic : 'SEO Topic');

      const resultSummary =
        type === 'meta-rewrite'
          ? 'Generated 3 high-CTR Titles & Descriptions'
          : type === 'fix-recommendation'
          ? 'Generated step-by-step developer remediation code'
          : type === 'simplify-tone'
          ? 'Simplified article draft to 7th-8th grade plain English'
          : type === 'snippet-bait'
          ? 'Generated Position 0 Snippet Bait & Heading'
          : type === 'scratchpad-assist'
          ? `Generated live writing assist for ${body.action || 'keywords'}`
          : type === 'internal-link-strategy'
          ? 'Generated Hub & Spoke Topic Cluster Architecture'
          : 'Generated EEAT section copy and FAQ schema';

      await saveUserAiActivity({
        user_email: userEmail,
        action_type: type,
        target_summary: targetSummary,
        result_summary: resultSummary,
      });
    } catch (logErr) {
      console.error('[User AI Activity Save Warning]:', logErr);
    }

    // 7. Return generated data with updated credit balance
    return NextResponse.json({
      success: true,
      type,
      data: generatedData,
      credits: {
        remaining: deduction.remainingCredits,
        limit: creditStatus.limit,
        resetInHours: creditStatus.resetInHours,
      },
    });
  } catch (error) {
    console.error('[AI Generation API Error]:', error);
    const message = error instanceof Error ? error.message : 'Internal AI generation error';
    return NextResponse.json(
      {
        error: message,
        success: false,
      },
      { status: 500 }
    );
  }
}
