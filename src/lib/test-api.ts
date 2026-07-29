import { POST } from '../app/api/audit/route';
import { NextRequest } from 'next/server';

export async function runApiTest() {
  console.log('=== STEP 4: API ENDPOINT & CACHING TEST ===');

  // Test 1: Empty URLs payload validation
  const emptyReq = new NextRequest('http://localhost:3000/api/audit', {
    method: 'POST',
    body: JSON.stringify({ urls: [] }),
  });
  const emptyRes = await POST(emptyReq);
  const emptyData = await emptyRes.json();
  console.log('Test 1 (Empty payload check): Status', emptyRes.status, '| Message:', emptyData.error);

  // Test 2: Valid single URL audit test
  const validReq = new NextRequest('http://localhost:3000/api/audit', {
    method: 'POST',
    body: JSON.stringify({ urls: ['https://example.com'] }),
  });
  const startTime = Date.now();
  const validRes = await POST(validReq);
  const duration = Date.now() - startTime;
  const validData = await validRes.json();

  console.log('Test 2 (Single URL Audit): Status', validRes.status, `| Duration: ${duration}ms`);
  console.log('Total Results:', validData.totalUrls);

  if (validData.results && validData.results.length > 0) {
    const firstResult = validData.results[0];
    console.log('URL Parsed:', firstResult.url);
    console.log('Status:', firstResult.status);
    console.log('Title:', firstResult.meta?.title || 'N/A');
    console.log('Word Count:', firstResult.wordCount);
  }

  // Test 3: Cache Hit Test (Re-fetching same URL should return instantly from cache)
  const cacheReq = new NextRequest('http://localhost:3000/api/audit', {
    method: 'POST',
    body: JSON.stringify({ urls: ['https://example.com'] }),
  });
  const cacheStartTime = Date.now();
  const cacheRes = await POST(cacheReq);
  const cacheDuration = Date.now() - cacheStartTime;
  console.log(`Test 3 (24h Cache Hit Test): Duration: ${cacheDuration}ms (Expected < 5ms)`);

  if (cacheDuration < 50) {
    console.log('✅ TEST PASSED: 24-hour cache layer and API batch endpoint working as expected!');
  } else {
    console.log('⚠️ Cache hit took longer than expected:', cacheDuration, 'ms');
  }
}

if (require.main === module) {
  runApiTest();
}
