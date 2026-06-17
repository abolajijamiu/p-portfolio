import { z } from 'zod'

export const createDeliverableTypeSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional(),
  category: z.enum(['theme', 'support', 'custom_project', 'license', 'service']),
  autoTrigger: z.boolean().default(true),
})

export type CreateDeliverableTypeInput = z.infer<typeof createDeliverableTypeSchema>

export const upsertMappingSchema = z.object({
  provider: z.string().min(1),
  externalProductId: z.string().min(1),
  deliverableTypeId: z.string().uuid(),
  config: z.record(z.unknown()).default({}),
  active: z.boolean().default(true),
})

export type UpsertMappingInput = z.infer<typeof upsertMappingSchema>
