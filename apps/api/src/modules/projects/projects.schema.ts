import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().date().optional(), // YYYY-MM-DD
})

export const updateProjectStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'review', 'complete', 'archived']),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>
