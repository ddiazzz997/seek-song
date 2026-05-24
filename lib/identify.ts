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

  // Instagram y Facebook requieren recaptchaToken vacío — si se omite dan "Missing reCAPTCHA token"
  // TikTok y YouTube NO deben incluirlo — si se incluye dan "Missing reCAPTCHA token"
  if (platform === 'instagram' || platform === 'facebook') {
    params.recaptchaToken = ''
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://musikerkennung.com',
    'Referer': 'https://musikerkennung.com/en/recognize-link',
    'User-Agent': CHROME_UA,
    'Accept': 'application/json, text/plain, */*',
  }

  return {
    method: 'POST',
    headers,
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(30000),
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
