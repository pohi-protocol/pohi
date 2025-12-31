import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PoHI - Proof of Human Intent'
export const size = {
  width: 1200,
  height: 600,
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
            fontSize: 70,
            marginBottom: 16,
          }}
        >
          🔏
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}
        >
          Proof of Human Intent
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#a0a0a0',
            marginBottom: 32,
          }}
        >
          AI executes. Humans authorize. Machines verify.
        </div>

        {/* Three pillars - compact */}
        <div
          style={{
            display: 'flex',
            gap: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 32px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>👤</div>
            <div style={{ fontSize: 20, color: '#60a5fa', fontWeight: 600 }}>WHO</div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 32px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>📝</div>
            <div style={{ fontSize: 20, color: '#60a5fa', fontWeight: 600 }}>WHAT</div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 32px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>⏰</div>
            <div style={{ fontSize: 20, color: '#60a5fa', fontWeight: 600 }}>WHEN</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
