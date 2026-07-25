import { z } from 'zod'
import { PROVIDERS } from '@/mock/nodes'

/**
 * Zod schemas backing the Node Editor forms (React Hook Form +
 * zodResolver). Kept separate from the form components so validation
 * rules are easy to locate/audit independent of JSX.
 */

export const editNodeSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(80),
  status: z.enum(['active', 'maintenance', 'offline', 'archived']),
  provider: z.enum(PROVIDERS),
  dailyCapacity: z.number().int().min(1, 'Must be at least 1').max(1000, 'Must be 1000 or fewer'),
  address: z.string().trim().min(5, 'Address must be at least 5 characters').max(160),
})
export type EditNodeFormValues = z.infer<typeof editNodeSchema>

export const createCandidateSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(80),
  neighbourhood: z.string().trim().min(2, 'Required'),
  address: z.string().trim().min(5, 'Address must be at least 5 characters').max(160),
  provider: z.enum(PROVIDERS),
  latitude: z.number().min(5.4, 'Outside Accra bounds').max(5.85, 'Outside Accra bounds'),
  longitude: z.number().min(-0.45, 'Outside Accra bounds').max(0.1, 'Outside Accra bounds'),
})
export type CreateCandidateFormValues = z.infer<typeof createCandidateSchema>
