import * as Location from "expo-location";
import type { WeatherSnapshot, WeatherCondition } from "@/types";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

let cache: { snapshot: WeatherSnapshot; expiresAt: number } | null = null;

// Open-Meteo WMO weather code → simplified union.
// Reference: https://open-meteo.com/en/docs (weather_code field).
function mapWeatherCode(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly_cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "thunderstorm";
  return "unknown";
}

/**
 * Best-effort current weather for the user's location.
 * Returns null on permission denial or any failure — never throws,
 * since weather is opportunistic and must not block outfit generation.
 */
export async function getCurrentWeather(): Promise<WeatherSnapshot | null> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.snapshot;
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude.toFixed(3)}` +
      `&longitude=${longitude.toFixed(3)}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code` +
      `&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json();
    const current = json?.current;
    if (!current) return null;

    const snapshot: WeatherSnapshot = {
      temp_c: Math.round(current.temperature_2m),
      condition: mapWeatherCode(current.weather_code ?? -1),
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      fetched_at: new Date().toISOString(),
    };

    cache = { snapshot, expiresAt: Date.now() + CACHE_TTL_MS };
    return snapshot;
  } catch (err) {
    console.warn("[weather] fetch failed:", err);
    return null;
  }
}

export function clearWeatherCache() {
  cache = null;
}

export const WEATHER_LABELS: Record<WeatherCondition, string> = {
  clear: "Clear",
  partly_cloudy: "Partly cloudy",
  cloudy: "Cloudy",
  rain: "Rainy",
  snow: "Snowy",
  thunderstorm: "Stormy",
  fog: "Foggy",
  unknown: "Unknown",
};

export const WEATHER_ICONS: Record<WeatherCondition, string> = {
  clear: "sunny-outline",
  partly_cloudy: "partly-sunny-outline",
  cloudy: "cloud-outline",
  rain: "rainy-outline",
  snow: "snow-outline",
  thunderstorm: "thunderstorm-outline",
  fog: "cloudy-night-outline",
  unknown: "ellipse-outline",
};
