import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PoHI - Proof of Human Intent'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)',
        }}
      >
        {/* Lock Icon */}
        <div
          style={{
            display: 'flex',
            fontSize: 80,
            marginBottom: 20,
          }}
        >
          🔏
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 10,
            letterSpacing: '-0.02em',
          }}
        >
          Proof of Human Intent
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#a0a0a0',
            marginBottom: 40,
          }}
        >
          AI executes. Humans authorize. Machines verify.
        </div>

        {/* Three pillars */}
        <div
          style={{
            display: 'flex',
            gap: 60,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
            <div style={{ fontSize: 24, color: '#60a5fa', fontWeight: 600 }}>WHO</div>
            <div style={{ fontSize: 16, color: '#888' }}>World ID</div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
            <div style={{ fontSize: 24, color: '#60a5fa', fontWeight: 600 }}>WHAT</div>
            <div style={{ fontSize: 16, color: '#888' }}>Commit SHA</div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 40px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>⏰</div>
            <div style={{ fontSize: 24, color: '#60a5fa', fontWeight: 600 }}>WHEN</div>
            <div style={{ fontSize: 16, color: '#888' }}>On-chain</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 20,
            color: '#666',
          }}
        >
          <span>github.com/pohi-protocol/pohi</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
