import type { Location, WeatherCurrent, WeatherData, WeatherDaily, WeatherHourly, WeatherSnapshot } from '@/shared_app/types'
import { logger } from '@/shared/utils/logger'

/**
 * Weather service.
 *
 * wttr.in is the provider because it needs no API key and, unlike
 * `api.open-meteo.com`, is reachable from networks where that host is blocked —
 * an actual user-facing failure, not a hypothetical one.
 *
 * The fetch lives in the main process rather than the renderer for two reasons:
 *
 *  1. The window can be closed to the tray, and a display device still expects a
 *     current forecast.
 *  2. The same result feeds both the UI and the MQTT payload, so there is one
 *     source of truth instead of two caches drifting apart.
 */

const API_ENDPOINT = 'https://wttr.in'

/** wttr.in updates its upstream models hourly, so the previous value is reused. */
const CACHE_TTL_MS = 15 * 60 * 1000

const REQUEST_TIMEOUT_MS = 20_000

/**
 * wttr.in rejects requests without a conventional user agent, and also serves
 * HTML instead of JSON when it decides the client is a browser.
 */
const REQUEST_HEADERS = {
  'User-Agent': 'curl/8.0',
  Accept: 'application/json'
}

let cached: WeatherData | null = null
let cachedAt = 0
let location: Location | null = null
let pending = false
let lastError = ''

/**
 * Raw shape returned by wttr.in, narrowed to the fields actually used.
 *
 * Notable quirks, all handled below:
 *  - `time` in an hourly entry is hours multiplied by 100 ("300" is 03:00).
 *  - weather codes are WWO numbers (113 = clear), not the WMO codes Open-Meteo
 *    used, so the icon map differs.
 *  - sunrise and sunset are 12-hour strings such as "08:05 AM".
 */
interface WttrResponse {
  current_condition?: {
    temp_C: string
    FeelsLikeC: string
    humidity: string
    pressure: string
    cloudcover: string
    windspeedKmph: string
    winddirDegree: string
    weatherCode: string
    precipMM: string
    weatherDesc: { value: string }[]
  }[]
  nearest_area?: {
    areaName: { value: string }[]
    country: { value: string }[]
    region: { value: string }[]
  }[]
  weather?: {
    date: string
    maxtempC: string
    mintempC: string
    astronomy: {
      sunrise: string
      sunset: string
    }[]
    hourly: {
      time: string
      tempC: string
      FeelsLikeC: string
      humidity: string
      weatherCode: string
      chanceofrain: string
      cloudcover: string
      windspeedKmph: string
      winddirDegree: string
    }[]
  }[]
}

/**
 * Maps a WWO weather code onto the WMO code the rest of the app speaks.
 *
 * Keeping one code family in the shared contract means the UI and the display
 * device never need to know which provider produced a reading.
 */
const WWO_TO_WMO: Record<number, number> = {
  113: 0, // Clear/Sunny
  116: 2, // Partly cloudy
  119: 3, // Cloudy
  122: 3, // Overcast
  143: 45, // Mist
  248: 45, // Fog
  260: 48, // Freezing fog
  176: 80, // Patchy rain possible
  179: 85, // Patchy snow possible
  182: 66, // Patchy sleet possible
  185: 66, // Patchy freezing drizzle possible
  200: 95, // Thundery outbreaks possible
  227: 75, // Blowing snow
  230: 75, // Blizzard
  263: 51, // Patchy light drizzle
  266: 53, // Light drizzle
  281: 56, // Freezing drizzle
  284: 57, // Heavy freezing drizzle
  293: 61, // Patchy light rain
  296: 61, // Light rain
  299: 63, // Moderate rain at times
  302: 63, // Moderate rain
  305: 65, // Heavy rain at times
  308: 65, // Heavy rain
  311: 66, // Light freezing rain
  314: 67, // Heavy freezing rain
  317: 61, // Light sleet
  320: 63, // Moderate or heavy sleet
  323: 71, // Patchy light snow
  326: 71, // Light snow
  329: 73, // Patchy moderate snow
  332: 73, // Moderate snow
  335: 75, // Patchy heavy snow
  338: 75, // Heavy snow
  350: 77, // Ice pellets
  353: 80, // Light rain shower
  356: 81, // Moderate or heavy rain shower
  359: 82, // Torrential rain shower
  362: 85, // Light sleet showers
  365: 85, // Moderate or heavy sleet showers
  368: 85, // Light snow showers
  371: 86, // Moderate or heavy snow showers
  374: 85, // Light showers of ice pellets
  377: 86, // Moderate or heavy showers of ice pellets
  386: 95, // Patchy light rain with thunder
  389: 95, // Moderate or heavy rain with thunder
  392: 95, // Patchy light snow with thunder
  395: 95 // Moderate or heavy snow with thunder
}

const toWmoCode = (wwoCode: string): number => WWO_TO_WMO[Number.parseInt(wwoCode, 10)] ?? 3

/**
 * Converts "08:05 AM" to "HH:MM".
 *
 * The contract uses 24-hour ISO-like times, and the UI slices them by position, so
 * the 12-hour string wttr.in returns has to be normalised here rather than in the
 * view.
 */
const to24Hour = (value: string): string => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) {
    return '00:00'
  }

  let hours = Number.parseInt(match[1], 10) % 12
  const minutes = match[2]
  const isPm = match[3].toUpperCase() === 'PM'

  if (isPm) {
    hours += 12
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`
}

/**
 * Converts an hourly `time` field into "HH:MM".
 *
 * wttr.in encodes the hour as hours*100, so 300 is 03:00 and 2100 is 21:00.
 */
const hourlyTimeTo24 = (value: string): string => {
  const hours = Math.floor(Number.parseInt(value, 10) / 100)
  return `${String(hours).padStart(2, '0')}:00`
}

const num = (value: string | undefined): number => {
  const parsed = Number.parseFloat(value ?? '')
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Determines whether an hour is daylight.
 *
 * wttr.in does not report a day/night flag, and the icons depend on it, so it is
 * derived by comparing the hour against sunrise and sunset.
 */
const isDaylight = (hourLabel: string, sunrise: string, sunset: string): number => {
  const toMinutes = (value: string): number => {
    const [h, m] = value.split(':').map(Number)
    return h * 60 + m
  }

  const now = toMinutes(hourLabel)
  return now >= toMinutes(sunrise) && now < toMinutes(sunset) ? 1 : 0
}

const buildUrl = (target: Location): string => {
  // wttr.in accepts coordinates as "lat,lon", which avoids relying on a city-name
  // match — the stored city may be a small place the service cannot resolve.
  const query = `${target.latitude},${target.longitude}`
  return `${API_ENDPOINT}/${encodeURIComponent(query)}?format=j1`
}

/** Joins a date and a "HH:MM" time into the ISO-like string the contract uses. */
const joinDateTime = (date: string, time: string): string => `${date}T${time}`

const toWeatherData = (response: WttrResponse, target: Location, date: Date): WeatherData | null => {
  const condition = response.current_condition?.[0]
  const days = response.weather

  if (!condition || !days || days.length === 0) {
    return null
  }

  const today = days[0]
  const sunriseFirst = today.astronomy?.[0]?.sunrise ?? '06:00 AM'
  const sunsetFirst = today.astronomy?.[0]?.sunset ?? '06:00 PM'

  const sunrise = to24Hour(sunriseFirst)
  const sunset = to24Hour(sunsetFirst)

  const current: WeatherCurrent = {
    // The full ISO timestamp keeps the payload uniform with the previous provider,
    // so nothing downstream needs to change shape.
    time: `${today.date}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    temperature: num(condition.temp_C),
    feelsLike: num(condition.FeelsLikeC),
    humidity: num(condition.humidity),
    code: toWmoCode(condition.weatherCode),
    isDay: isDaylight(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`, sunrise, sunset),
    precipitation: num(condition.precipMM),
    cloudCover: num(condition.cloudcover),
    pressure: num(condition.pressure),
    windSpeed: num(condition.windspeedKmph),
    windDirection: num(condition.winddirDegree),
    // wttr.in has no gust figure in the current condition; reporting the steady
    // wind is honest, and the UI labels the value as gusts only if present.
    windGusts: num(condition.windspeedKmph)
  }

  const daily: WeatherDaily = {
    time: days.map((day) => day.date),
    codes: days.map((day) => toWmoCode(day.hourly?.[4]?.weatherCode ?? day.hourly?.[0]?.weatherCode ?? '113')),
    temperatureMax: days.map((day) => num(day.maxtempC)),
    temperatureMin: days.map((day) => num(day.mintempC)),
    sunrise: days.map((day) => joinDateTime(day.date, to24Hour(day.astronomy?.[0]?.sunrise ?? '06:00 AM'))),
    sunset: days.map((day) => joinDateTime(day.date, to24Hour(day.astronomy?.[0]?.sunset ?? '06:00 PM'))),
    // wttr.in reports a rain chance per hour but no accumulated total, so the
    // expected volume is approximated from the chances rather than invented.
    precipitationSum: days.map((day) => {
      const averageChance =
        day.hourly.length === 0
          ? 0
          : day.hourly.reduce((sum, hour) => sum + num(hour.chanceofrain), 0) / day.hourly.length
      return Math.round(averageChance) / 100
    }),
    precipitationProbabilityMax: days.map((day) =>
      Math.max(...day.hourly.map((hour) => num(hour.chanceofrain)), 0)
    ),
    windSpeedMax: days.map((day) => Math.max(...day.hourly.map((hour) => num(hour.windspeedKmph)), 0))
  }

  // Hourly entries are flattened across days, so the strip can run past midnight.
  const hourlyTime: string[] = []
  const hourly: WeatherHourly = {
    time: hourlyTime,
    temperature: [],
    humidity: [],
    feelsLike: [],
    precipitationProbability: [],
    code: [],
    cloudCover: [],
    windSpeed: []
  }

  for (const day of days) {
    for (const hour of day.hourly ?? []) {
      const label = hourlyTimeTo24(hour.time)
      hourlyTime.push(`${day.date}T${label}`)
      hourly.temperature.push(num(hour.tempC))
      hourly.humidity.push(num(hour.humidity))
      hourly.feelsLike.push(num(hour.FeelsLikeC))
      hourly.precipitationProbability.push(num(hour.chanceofrain))
      hourly.code.push(toWmoCode(hour.weatherCode))
      hourly.cloudCover.push(num(hour.cloudcover))
      hourly.windSpeed.push(num(hour.windspeedKmph))
    }
  }

  return {
    fetchedAt: Date.now(),
    location: target,
    current,
    daily,
    hourly,
    units: {
      temperature: '°C',
      windSpeed: 'km/h',
      precipitation: 'mm',
      pressure: 'hPa'
    }
  }
}

/**
 * Fetches weather for the configured city.
 *
 * A failing request keeps the previous payload: stale numbers are more useful than
 * an empty screen, and `error` explains why they did not update.
 */
export const fetchWeather = async (force = false): Promise<WeatherData | null> => {
  if (location === null) {
    return null
  }

  const now = Date.now()
  if (!force && cached !== null && now - cachedAt < CACHE_TTL_MS) {
    return cached
  }

  pending = true
  lastError = ''

  try {
    const response = await fetch(buildUrl(location), {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: REQUEST_HEADERS
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = (await response.json()) as WttrResponse
    const data = toWeatherData(payload, location, new Date())

    if (data === null) {
      throw new Error('incomplete response')
    }

    cached = data
    cachedAt = now
    return cached
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    lastError = message
    logger.warn({ error: message, city: location.city }, 'Weather fetch failed')
    return cached
  } finally {
    pending = false
  }
}

/** Current weather, using the cache while it is still fresh. */
export const getWeather = async (): Promise<WeatherSnapshot> => {
  const data = await fetchWeather(false)
  return { data, pending, error: lastError }
}

/** Stored city, or null when the user has not picked one. */
export const getWeatherLocation = (): Location | null => location

/** Sets the city and drops the cache, so the next read fetches for the new place. */
export const setWeatherLocation = async (next: Location | null): Promise<WeatherSnapshot> => {
  location = next
  cached = null
  cachedAt = 0
  lastError = ''

  if (next === null) {
    return { data: null, pending: false, error: '' }
  }

  const data = await fetchWeather(true)
  return { data, pending: false, error: lastError }
}

/** Restores the persisted city on startup without blocking on the network. */
export const initializeWeather = (stored: Location | null): void => {
  location = stored

  if (stored !== null) {
    // Deliberately not awaited: startup should not wait for the network, and the
    // first read or the MQTT loop picks the result up.
    void fetchWeather(false)
  }
}
