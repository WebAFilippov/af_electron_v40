export type Location = {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
  timezone: string
  elevation?: number
}

export type GeocodingResult = {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation: number
  feature_code: string
  country_code: string
  admin1_id?: number
  admin2_id?: number
  admin3_id?: number
  admin4_id?: number
  timezone: string
  population?: number
  country: string
  admin1?: string
  admin2?: string
  admin3?: string
  admin4?: string
}

export type GeocodingResponse = {
  results?: GeocodingResult[]
  generationtime_ms: number
}

// Weather Data Types
export type CurrentWeather = {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  precipitation: number
  rain: number
  showers: number
  snowfall: number
  weather_code: number
  cloud_cover: number
  pressure_msl: number
  surface_pressure: number
  wind_speed_10m: number
  wind_direction_10m: number
  wind_gusts_10m: number
}

export type DailyWeather = {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  apparent_temperature_max: number[]
  apparent_temperature_min: number[]
  sunrise: string[]
  sunset: string[]
  precipitation_sum: number[]
  rain_sum: number[]
  showers_sum: number[]
  snowfall_sum: number[]
  precipitation_probability_max: number[]
  wind_speed_10m_max: number[]
  wind_gusts_10m_max: number[]
  wind_direction_10m_dominant: number[]
}

export type HourlyWeather = {
  time: string[]
  temperature_2m: number[]
  relative_humidity_2m: number[]
  apparent_temperature: number[]
  precipitation_probability: number[]
  precipitation: number[]
  rain: number[]
  showers: number[]
  snowfall: number[]
  weather_code: number[]
  cloud_cover: number[]
  visibility: number[]
  wind_speed_10m: number[]
  wind_direction_10m: number[]
  wind_gusts_10m: number[]
  pressure_msl: number[]
  surface_pressure: number[]
}

export type WeatherResponse = {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_units?: {
    time: string
    interval: string
    temperature_2m: string
    relative_humidity_2m: string
    apparent_temperature: string
    is_day: string
    precipitation: string
    rain: string
    showers: string
    snowfall: string
    weather_code: string
    cloud_cover: string
    pressure_msl: string
    surface_pressure: string
    wind_speed_10m: string
    wind_direction_10m: string
    wind_gusts_10m: string
  }
  current?: CurrentWeather
  hourly_units?: Record<string, string>
  hourly?: HourlyWeather
  daily_units?: Record<string, string>
  daily?: DailyWeather
}

// WMO Weather Codes (for icons/descriptions)
export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: 'sun' },
  1: { description: 'Mainly clear', icon: 'sun-cloud' },
  2: { description: 'Partly cloudy', icon: 'cloud-sun' },
  3: { description: 'Overcast', icon: 'cloud' },
  45: { description: 'Fog', icon: 'fog' },
  48: { description: 'Depositing rime fog', icon: 'fog' },
  51: { description: 'Light drizzle', icon: 'drizzle' },
  53: { description: 'Moderate drizzle', icon: 'drizzle' },
  55: { description: 'Dense drizzle', icon: 'drizzle' },
  56: { description: 'Light freezing drizzle', icon: 'snowflake' },
  57: { description: 'Dense freezing drizzle', icon: 'snowflake' },
  61: { description: 'Slight rain', icon: 'rain' },
  63: { description: 'Moderate rain', icon: 'rain' },
  65: { description: 'Heavy rain', icon: 'rain' },
  66: { description: 'Light freezing rain', icon: 'snowflake' },
  67: { description: 'Heavy freezing rain', icon: 'snowflake' },
  71: { description: 'Slight snow fall', icon: 'snow' },
  73: { description: 'Moderate snow fall', icon: 'snow' },
  75: { description: 'Heavy snow fall', icon: 'snow' },
  77: { description: 'Snow grains', icon: 'snow' },
  80: { description: 'Slight rain showers', icon: 'rain' },
  81: { description: 'Moderate rain showers', icon: 'rain' },
  82: { description: 'Violent rain showers', icon: 'rain' },
  85: { description: 'Slight snow showers', icon: 'snow' },
  86: { description: 'Heavy snow showers', icon: 'snow' },
  95: { description: 'Thunderstorm', icon: 'thunderstorm' },
  96: { description: 'Thunderstorm with slight hail', icon: 'thunderstorm' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'thunderstorm' }
}

export function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code]?.description || 'Unknown'
}

export function getWeatherIcon(code: number): string {
  return WEATHER_CODES[code]?.icon || 'cloud'
}
