import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MTS-Toolbox - Collection d\'outils en ligne gratuits'
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Container principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          {/* Titre principal */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 20,
              textAlign: 'center',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            MTS-Toolbox
          </div>

          {/* Sous-titre */}
          <div
            style={{
              fontSize: 36,
              color: 'rgba(255,255,255,0.95)',
              marginBottom: 50,
              textAlign: 'center',
              fontWeight: '400',
            }}
          >
            Collection d'outils en ligne gratuits
          </div>

          {/* Icônes des catégories */}
          <div
            style={{
              display: 'flex',
              gap: 30,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                fontSize: 60,
                background: 'rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              📝
            </div>
            <div
              style={{
                fontSize: 60,
                background: 'rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              📄
            </div>
            <div
              style={{
                fontSize: 60,
                background: 'rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              🖼️
            </div>
            <div
              style={{
                fontSize: 60,
                background: 'rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              💻
            </div>
            <div
              style={{
                fontSize: 60,
                background: 'rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              🧮
            </div>
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.25)',
              padding: '15px 40px',
              borderRadius: '50px',
              fontSize: 28,
              color: 'white',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
            }}
          >
            ✨ 50+ outils gratuits
          </div>
        </div>

        {/* Footer avec URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 24,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '500',
          }}
        >
          mts-toolbox.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
