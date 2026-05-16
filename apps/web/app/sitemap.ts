import type { MetadataRoute } from 'next'
import type { CmsArticle } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://deempiretech.com'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const STATIC_ROUTES = ['', '/services', '/themes', '/work', '/articles', '/contact']

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

  const articles = await fetchJson<CmsArticle[]>('/api/v1/cms/articles/published')
  const articleEntries: MetadataRoute.Sitemap = articles
    ? articles.map((a) => ({
        url: `${SITE_URL}/articles/${a.slug}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: a.featured ? 0.9 : 0.7,
      }))
    : []

  return [...staticEntries, ...articleEntries]
}
