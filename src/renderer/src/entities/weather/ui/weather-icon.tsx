import type { ReactNode } from 'react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Snowflake,
  Sun
} from 'lucide-react'

/**
 * WMO weather code → icon.
 *
 * The codes are the ones Open-Meteo reports (WMO 4677). Night variants are chosen
 * by the caller through `isDay`, because the code alone does not say whether the
 * sun is up — clear sky at 2 am should not draw a sun.
 */
const DAY_ICONS: Record<number, typeof Sun> = {
  0: Sun,
  1: CloudSun,
  2: CloudSun,
  3: Cloud,
  45: CloudFog,
  48: CloudFog,
  51: CloudDrizzle,
  53: CloudDrizzle,
  55: CloudDrizzle,
  56: CloudDrizzle,
  57: CloudDrizzle,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  66: CloudRain,
  67: CloudRain,
  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  77: Snowflake,
  80: CloudRain,
  81: CloudRain,
  82: CloudRain,
  85: CloudSnow,
  86: CloudSnow,
  95: CloudLightning,
  96: CloudHail,
  99: CloudHail
}

const NIGHT_ICONS: Record<number, typeof Moon> = {
  0: Moon,
  1: CloudMoon,
  2: CloudMoon,
  3: Cloud,
  45: CloudFog,
  48: CloudFog,
  51: CloudDrizzle,
  53: CloudDrizzle,
  55: CloudDrizzle,
  56: CloudDrizzle,
  57: CloudDrizzle,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  66: CloudRain,
  67: CloudRain,
  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  77: Snowflake,
  80: CloudRain,
  81: CloudRain,
  82: CloudRain,
  85: CloudSnow,
  86: CloudSnow,
  95: CloudLightning,
  96: CloudHail,
  99: CloudHail
}

interface WeatherIconProps {
  code: number
  /** 1 during the day, 0 at night. */
  isDay: number
  className?: string
}

/** Icon matching a WMO code, falling back to a plain cloud for unknown values. */
export const WeatherIcon = ({ code, isDay, className }: WeatherIconProps): ReactNode => {
  const Icon = (isDay === 1 ? DAY_ICONS[code] : NIGHT_ICONS[code]) ?? Cloud
  return <Icon className={className} aria-hidden />
}
