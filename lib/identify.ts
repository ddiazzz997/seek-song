import { Platform } from './platforms'

const BASE_URL = 'https://musikerkennung.com/recognize-link'
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function buildRequest(url: string, platform: Platform): RequestInit {
  const params: Record<string, string> = {
    link: url,
    hours: '00',
    minutes: '00',
    seconds: '00',
  }

  // Instagram y YouTube requieren recaptchaToken vacío — si se omite dan error
  // Facebook falla si se incluye (aunque sea vacío) — debe omitirse
  // TikTok no lo necesita
  if (platform === 'instagram' || platform === 'youtube') {
    params.recaptchaToken = ''
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://musikerkennung.com',
    'Referer': 'https://musikerkennung.com/en/recognize-link',
  }

  // Solo TikTok requiere User-Agent; las otras plataformas no lo necesitan
  if (platform === 'tiktok') {
    headers['User-Agent'] = CHROME_UA
  }

  return {
    method: 'POST',
    headers,
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(22000),
  }
}

export interface TrackResult {
  title: string
  artist: string
}

export async function identifySong(
  cleanUrl: string,
  platform: Platform
): Promise<TrackResult | null> {
  try {
    const res = await fetch(BASE_URL, buildRequest(cleanUrl, platform))
    if (!res.ok) return null

    const data = await res.json()
    if (!data.track) return null

    return { title: data.track.title, artist: data.track.subtitle }
  } catch {
    return null
  }
}
