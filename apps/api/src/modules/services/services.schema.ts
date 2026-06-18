import { z } from 'zod'

export const createServiceSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(120),
  tagline: z.string().min(2).max(200),
  description: z.string().min(10),
  category: z.enum([
    'development', 'marketing', 'branding', 'ai_analytics',
    'ecommerce', 'consulting', 'publishing', 'technical', 'premium',
  ]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  coverImage: z.string().url().optional(),
})

export const updateServiceSchema = createServiceSchema.partial()

export const createPackageSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().min(1),
  priceCents: z.number().int().min(100),
  currency: z.string().default('USD'),
  deliveryDays: z.number().int().min(1),
  revisions: z.number().int().min(0).default(1),
  includes: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
})

export const createFaqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  sortOrder: z.number().int().default(0),
})

export const createRequirementSchema = z.object({
  label: z.string().min(2).max(120),
  description: z.string().optional(),
  fieldType: z.enum(['text', 'url', 'file', 'select', 'textarea']).default('text'),
  required: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})
