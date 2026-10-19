export type IpWhoResponse = {
  success: boolean
  message?: string
  ip?: string
  city?: string | null
  region?: string | null
  country?: string | null
  latitude?: number | null
  longitude?: number | null
  timezone?: {
    id?: string | null
  } | null
}
