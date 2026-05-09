import { Platform } from './platforms'

const BASE_URL = 'https://musikerkennung.com/recognize-link'
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function buildRequest(url: string, platform: Platform): RequestInit {
  const isTikTok = platform === 'tiktok'
  const isYouTube = platform === 'youtube'

  const params: Record<string, string> = {
    link: url,
    hours: '00',
    minutes: '00',
    seconds: '00',
  }

  // Instagram y Facebook necesitan recaptchaToken vacío; TikTok y YouTube NO
  if (!isTikTok && !isYouTube) {
    params.recaptchaToken = ''
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://musikerkennung.com',
    'Referer': 'https://musikerkennung.com/en/recognize-link',
  }

  // TikTok requiere UA real; Instagram/Facebook fallan con UA incluido
  if (isTikTok) {
    headers['User-Agent'] = CHROME_UA
  }

  return {
    method: 'POST',
    headers,
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(25000),
  }
}

export interface TrackResult {
  title: string
  artist: string
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function attemptIdentify(url: string, platform: Platform): Promise<TrackResult | null> {
  const res = await fetch(BASE_URL, buildRequest(url, platform))
  if (!res.ok) return null

  const data = await res.json()

  // Variante opuesta si falta token recaptcha
  if (data.error === 'Missing reCAPTCHA token') {
    const fallbackPlatform = platform === 'tiktok' || platform === 'youtube'
      ? 'instagram' as Platform
      : 'tiktok' as Platform

    await delay(500)
    const retryRes = await fetch(BASE_URL, buildRequest(url, fallbackPlatform))
    const retryData = await retryRes.json()
    if (!retryData.track) return null
    return { title: retryData.track.title, artist: retryData.track.subtitle }
  }

  if (!data.track) return null
  return { title: data.track.title, artist: data.track.subtitle }
}

export async function identifySong(
  cleanUrl: string,
  platform: Platform
): Promise<TrackResult | null> {
  try {
    // Primer intento
    const result = await attemptIdentify(cleanUrl, platform)
    if (result) return result

    // Retry tras 1s por si fue rate limiting transitorio
    await delay(1000)
    return await attemptIdentify(cleanUrl, platform)
  } catch {
    return null
  }
}
