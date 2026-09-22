import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'AnalyzeSERP — Free Competitor SEO Audit & SERP Intelligence Suite';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          backgroundColor: '#090d16',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(6, 182, 212, 0.12) 0%, transparent 50%)',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top Accent Gradient Border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #8b5cf6 100%)',
          }}
        />

        {/* Top Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Logo Icon Mockup */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#34d399',
              }}
            >
              A
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Analyze<span style={{ color: '#34d399' }}>SERP</span>
              </span>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.5px' }}>
                SERP Intelligence &amp; Competitor Auditing
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '9999px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#34d399',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            100% Free Public Beta
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1020px' }}>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              color: '#f8fafc',
              margin: 0,
            }}
          >
            Side-by-Side Competitor SEO Audits &amp; SERP Intelligence
          </h1>
          <p
            style={{
              fontSize: '22px',
              lineHeight: 1.45,
              color: '#94a3b8',
              margin: 0,
              fontWeight: 400,
            }}
          >
            Compare up to 5 competitor URLs in real-time. Uncover keyword gaps, featured snippet Pos 0 bait, internal PageRank topology, and Core Web Vitals with zero sign-up.
          </p>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {[
            'Zero-Latency Parallel Scraper',
            'Full Keyword Gap Matrix',
            'Position 0 Snippet Optimizer',
            'Internal Link Topology Graph',
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#e2e8f0',
              }}
            >
              <span style={{ color: '#38bdf8' }}>✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Bottom Metadata Ribbon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '20px',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 500 }}>
            W3C &amp; Google Search Central Compliant &bull; Zero Telemetry
          </span>
          <span
            style={{
              fontSize: '18px',
              color: '#34d399',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
            }}
          >
            https://analyzeserp.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
