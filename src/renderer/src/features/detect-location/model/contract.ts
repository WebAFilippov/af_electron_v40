import { z } from 'zod'

export const IPApiResponseSchema = z.object({
  status: z.enum(['success', 'fail']),
  message: z.string().optional(),
  query: z.string(),
  city: z.string(),
  regionName: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  timezone: z.string()
})

export type IPApiResponse = z.infer<typeof IPApiResponseSchema>
