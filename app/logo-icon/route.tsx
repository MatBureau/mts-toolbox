import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '100px',
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
          }}
        >
          MTS
        </div>
        <div
          style={{
            fontSize: 60,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '600',
            letterSpacing: '4px',
          }}
        >
          TOOLBOX
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
