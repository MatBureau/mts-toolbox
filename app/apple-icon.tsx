import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '40px',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 10,
          }}
        >
          MTS
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500',
          }}
        >
          Toolbox
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
