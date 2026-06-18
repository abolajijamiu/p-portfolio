import { ImageResponse } from 'next/og'

export const alt = 'E-Tech OS — Expert digital services for development, marketing, and e-commerce'
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
          backgroundColor: '#0F172A',
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
            E
          </span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#3B82F6' }}>
            -Tech OS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{ fontSize: 62, fontWeight: 700, letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.08 }}>
              Expert teams.
            </span>
            <span style={{ fontSize: 62, fontWeight: 700, letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.08 }}>
              Real results.
            </span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ fontSize: 22, color: '#64748B', letterSpacing: '-0.01em', lineHeight: 1.5, maxWidth: 580 }}>
              Development, marketing, branding, AI, and e-commerce — delivered through a managed platform.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 16, color: '#475569', letterSpacing: '0.02em' }}>
            deempiretech.com
          </span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#334155' }} />
          <span style={{ fontSize: 16, color: '#475569', letterSpacing: '0.01em' }}>
            by DeEmpireTech
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
