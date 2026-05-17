import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT', 'WONK'],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deempiretech.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s — E-Tech.',
    default: 'E-Tech. — Strategy, Design & Engineering',
  },
  description:
    'A small, senior team for companies that need the work to be right, not just finished. Strategy, design, and engineering — done properly.',
  keywords: ['digital agency', 'product design', 'strategy', 'engineering', 'brand'],
  authors: [{ name: 'E-Tech.' }],
  openGraph: {
    type: 'website',
    siteName: 'E-Tech.',
    title: 'E-Tech. — Strategy, Design & Engineering',
    description:
      'A small, senior team for companies that need the work to be right, not just finished.',
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Tech. — Strategy, Design & Engineering',
    description:
      'A small, senior team for companies that need the work to be right, not just finished.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
