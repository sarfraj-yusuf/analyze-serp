import { NextResponse } from 'next/server';
import { generateRssFeedXml } from '@/lib/blog';

export async function GET() {
  const rssXml = generateRssFeedXml();

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=18000',
    },
  });
}
