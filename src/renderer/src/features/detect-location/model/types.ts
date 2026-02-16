export type IPApiResponse = {
  status: 'success' | 'fail'
  message?: string
  query: string
  city: string
  regionName: string
  country: string
  lat: number
  lon: number
  timezone: string
}
