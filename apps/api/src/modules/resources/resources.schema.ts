import { z } from 'zod'

export const createResourceSchema = z.object({
  body: z.object({
    slug: z.string().min(2).max(160),
    title: z.string().min(2).max(200),
    tagline: z.string().min(2).max(300),
    description: z.string().min(10),
    category: z.enum([
      'template', 'plugin', 'guide', 'tool',
      'starter_kit', 'design_asset', 'course', 'font',
    ]),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    featured: z.boolean().default(false),
    coverImageUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    sortOrder: z.number().int().min(0).default(0),
  }),
})

export const updateResourceSchema = z.object({
  body: z.object({
    slug: z.string().min(2).max(160).optional(),
    title: z.string().min(2).max(200).optional(),
    tagline: z.string().min(2).max(300).optional(),
    description: z.string().min(10).optional(),
    category: z.enum([
      'template', 'plugin', 'guide', 'tool',
      'starter_kit', 'design_asset', 'course', 'font',
    ]).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    featured: z.boolean().optional(),
    coverImageUrl: z.string().url().nullable().optional(),
    tags: z.array(z.string()).optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
})

export const createLicenseSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    priceCents: z.number().int().min(0),
    currency: z.string().length(3).default('USD'),
    permissions: z.record(z.boolean()).default({}),
    maxDownloads: z.number().int().min(1).nullable().optional(),
    sortOrder: z.number().int().min(0).default(0),
  }),
})

export const addFileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    key: z.string().min(1).max(500),
    size: z.number().int().min(0).default(0),
    mimeType: z.string().max(100).optional(),
    sortOrder: z.number().int().min(0).default(0),
  }),
})

export const placePurchaseSchema = z.object({
  body: z.object({
    licenseId: z.string().uuid(),
  }),
})
