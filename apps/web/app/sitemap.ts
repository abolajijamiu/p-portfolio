import type { MetadataRoute } from 'next'
import type { CmsArticle, CmsTheme, CmsWorkItem } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deempiretech.com'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const STATIC_ROUTES = [
  '',
  '/services',
  '/themes',
  '/work',
  '/articles',
  '/resources',
  '/book',
  '/contact',
  '/experts/apply',
  '/pricing',
  '/privacy',
  '/terms',
  '/licenses',
]

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))

  const [articles, themes, work, bookingServices, resources, services] = await Promise.all([
    fetchJson<CmsArticle[]>('/api/v1/cms/articles/published'),
    fetchJson<CmsTheme[]>('/api/v1/cms/themes/published'),
    fetchJson<CmsWorkItem[]>('/api/v1/cms/work/published'),
    fetchJson<{ slug: string; updatedAt?: string }[]>('/api/v1/booking-services'),
    fetchJson<{ slug: string; updatedAt?: string }[]>('/api/v1/resources'),
    fetchJson<{ slug: string; updatedAt?: string }[]>('/api/v1/services'),
  ])

  const articleEntries: MetadataRoute.Sitemap = articles
    ? articles.map((a) => ({
        url: `${SITE_URL}/articles/${a.slug}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: a.featured ? 0.9 : 0.7,
      }))
    : []

  const themeEntries: MetadataRoute.Sitemap = themes
    ? themes.map((t) => ({
        url: `${SITE_URL}/themes/${t.slug}`,
        lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.8,
      }))
    : []

  const workEntries: MetadataRoute.Sitemap = work
    ? work.map((w) => ({
        url: `${SITE_URL}/work/${w.slug}`,
        lastModified: w.updatedAt ? new Date(w.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: w.featured ? 0.85 : 0.7,
      }))
    : []

  const bookEntries: MetadataRoute.Sitemap = bookingServices
    ? bookingServices.map((b) => ({
        url: `${SITE_URL}/book/${b.slug}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.75,
      }))
    : []

  const resourceEntries: MetadataRoute.Sitemap = resources
    ? resources.map((r) => ({
        url: `${SITE_URL}/resources/${r.slug}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.75,
      }))
    : []

  const serviceEntries: MetadataRoute.Sitemap = services
    ? services.map((s) => ({
        url: `${SITE_URL}/services/${s.slug}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.8,
      }))
    : []

  return [
    ...staticEntries,
    ...articleEntries,
    ...themeEntries,
    ...workEntries,
    ...bookEntries,
    ...resourceEntries,
    ...serviceEntries,
  ]
}
