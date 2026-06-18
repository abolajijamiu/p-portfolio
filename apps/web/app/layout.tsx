import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deempiretech.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s — E-Tech OS',
    default: 'E-Tech OS — Expert Digital Services for Development, Marketing & E-commerce',
  },
  description:
    'Hire vetted expert teams for development, marketing, branding, AI, and e-commerce. Order, track, and receive work through a single managed platform.',
  keywords: ['digital agency', 'web development', 'marketing agency', 'e-commerce', 'branding', 'AI analytics', 'managed platform'],
  authors: [{ name: 'E-Tech OS' }],
  openGraph: {
    type: 'website',
    siteName: 'E-Tech OS',
    title: 'E-Tech OS — Expert Digital Services',
    description:
      'Hire vetted expert teams for development, marketing, branding, AI, and e-commerce — all through one managed platform.',
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Tech OS — Expert Digital Services',
    description:
      'Hire vetted expert teams for development, marketing, branding, AI, and e-commerce — all through one managed platform.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${jetBrainsMono.variable}`}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
