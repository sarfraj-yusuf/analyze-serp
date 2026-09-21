import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserCredits, consumeUserCredit } from '@/lib/user-credits';
import { saveUserAiActivity } from '@/lib/db';
import {
  generateMetaRewrite,
  generateFixRecommendation,
  generateContentSection,
} from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session
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
        generatedData = await generateMetaRewrite({
          title: typeof title === 'string' ? title : undefined,
          description: typeof description === 'string' ? description : undefined,
          targetKeyword: typeof targetKeyword === 'string' ? targetKeyword : undefined,
          pageUrl: typeof pageUrl === 'string' ? pageUrl : undefined,
        });
        break;
      }

      case 'fix-recommendation': {
        const { issueTitle, issueCategory, issueDescription, currentCode, pageUrl } = body;
        if (!issueTitle || typeof issueTitle !== 'string') {
          return NextResponse.json({ error: 'Missing required "issueTitle" parameter' }, { status: 400 });
        }
        generatedData = await generateFixRecommendation({
          issueTitle,
          issueCategory: typeof issueCategory === 'string' ? issueCategory : 'SEO Audit',
          issueDescription: typeof issueDescription === 'string' ? issueDescription : 'Technical SEO recommendation',
          currentCode: typeof currentCode === 'string' ? currentCode : undefined,
          pageUrl: typeof pageUrl === 'string' ? pageUrl : undefined,
        });
        break;
      }

      case 'content-section': {
        const { topic, targetKeyword, sectionHeading, context } = body;
        if (!topic || typeof topic !== 'string') {
          return NextResponse.json({ error: 'Missing required "topic" parameter' }, { status: 400 });
        }
        generatedData = await generateContentSection({
          topic,
          targetKeyword: typeof targetKeyword === 'string' ? targetKeyword : topic,
          sectionHeading: typeof sectionHeading === 'string' ? sectionHeading : undefined,
          context: typeof context === 'string' ? context : undefined,
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unsupported generation type: "${type}". Supported: meta-rewrite, fix-recommendation, content-section.` },
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
          : (typeof body.topic === 'string' ? body.topic : 'SEO Topic');

      const resultSummary =
        type === 'meta-rewrite'
          ? 'Generated 3 high-CTR Titles & Descriptions'
          : type === 'fix-recommendation'
          ? 'Generated step-by-step developer remediation code'
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
