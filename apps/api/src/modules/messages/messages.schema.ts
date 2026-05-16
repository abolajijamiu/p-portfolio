import { z } from 'zod'

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(10_000),
  parentId: z.string().uuid().optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
