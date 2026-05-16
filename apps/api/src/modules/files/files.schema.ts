import { z } from 'zod'

export const getUploadUrlSchema = z.object({
  name: z.string().min(1).max(255),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().positive().optional(),
})

export const registerFileSchema = z.object({
  name: z.string().min(1).max(255),
  storageKey: z.string().min(1),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().positive().optional(),
})

export type GetUploadUrlInput = z.infer<typeof getUploadUrlSchema>
export type RegisterFileInput = z.infer<typeof registerFileSchema>
