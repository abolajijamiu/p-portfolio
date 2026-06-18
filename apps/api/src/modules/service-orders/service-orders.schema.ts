import { z } from 'zod'

export const placeOrderSchema = z.object({
  packageId: z.string().uuid(),
})

export const submitRequirementsSchema = z.object({
  requirementsData: z.record(z.string(), z.string()),
})

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(5000),
  attachments: z
    .array(z.object({ key: z.string(), name: z.string(), size: z.number() }))
    .default([]),
})

export const createDeliverySchema = z.object({
  message: z.string().min(1).max(5000),
  files: z
    .array(z.object({ key: z.string(), name: z.string(), size: z.number() }))
    .default([]),
  isRevisionDelivery: z.boolean().default(false),
})

export const requestRevisionSchema = z.object({
  reason: z.string().min(5).max(2000),
})

export const createMilestoneSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  sortOrder: z.number().int().default(0),
})

export const assignOrderSchema = z.object({
  expertId: z.string().uuid(),
  dueDate: z.string().optional(),
  internalNotes: z.string().optional(),
})

export const cancelOrderSchema = z.object({
  reason: z.string().min(5).max(1000),
})
