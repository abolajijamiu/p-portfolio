import type { NextConfig } from 'next'

const S3_BUCKET = process.env.S3_BUCKET_HOSTNAME // e.g. etech-files-prod.s3.us-east-1.amazonaws.com

const config: NextConfig = {
  // Remove the "X-Powered-By: Next.js" response header
  poweredByHeader: false,

  // Security headers applied to every response
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  images: {
    // Allow Next.js <Image> to serve avatars from S3 when a bucket hostname is configured
    remotePatterns: [
      ...(S3_BUCKET
        ? [
            {
              protocol: 'https' as const,
              hostname: S3_BUCKET,
            },
          ]
        : []),
    ],
  },
}

export default config
