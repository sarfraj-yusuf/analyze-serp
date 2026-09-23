import { NextResponse } from 'next/server';
import { getSiteConfigurations } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getSiteConfigurations();
    return NextResponse.json(
      {
        success: true,
        data: {
          maintenance: config.maintenance,
          announcement: config.announcement,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch public site config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site configuration' },
      { status: 500 }
    );
  }
}
