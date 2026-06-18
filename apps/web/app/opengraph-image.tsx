import { ImageResponse } from 'next/og'

export const alt = 'E-Tech. — Strategy, Design & Engineering'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em', color: '#ffffff', textTransform: 'uppercase' }}>
            E-TECH
          </span>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', color: '#1B3FC4', textTransform: 'uppercase' }}>
            Systems &amp; Solutions
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{ fontSize: 62, fontWeight: 700, letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.08 }}>
              Built for brands
            </span>
            <span style={{ fontSize: 62, fontWeight: 700, letterSpacing: '-0.03em', color: '#1B3FC4', lineHeight: 1.08 }}>
              that sell online.
            </span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ fontSize: 22, color: '#6b7280', letterSpacing: '-0.01em', lineHeight: 1.5, maxWidth: 580 }}>
              Shopify development, SEO, paid media, and branding — from a senior team that delivers.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 16, color: '#444', letterSpacing: '0.02em' }}>
            deempiretech.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
