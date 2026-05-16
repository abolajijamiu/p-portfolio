import { ImageResponse } from 'next/og'

export const alt = 'E-Tech. — eCommerce Design & Engineering'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a',
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: '#ffffff' }}>
            E
          </span>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: '#1B3FC4' }}>
            -Tech.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{ fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.1 }}>
              Built for brands
            </span>
            <span style={{ fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.1 }}>
              that sell online.
            </span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ fontSize: 22, color: '#6b7280', letterSpacing: '-0.01em', lineHeight: 1.5, maxWidth: 560 }}>
              Shopify themes, store redesigns, and commerce engineering.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <span style={{ fontSize: 18, color: '#6b7280', letterSpacing: '0.02em' }}>
            deempiretech.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
