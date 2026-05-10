import { Platform } from './platforms'

const BASE_URL = 'https://musikerkennung.com/recognize-link'
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function buildRequest(url: string): RequestInit {
  const params = new URLSearchParams({
    link: url,
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://musikerkennung.com',
      'Referer': 'https://musikerkennung.com/en/recognize-link',
      'User-Agent': CHROME_UA,
    },
    body: params.toString(),
    signal: AbortSignal.timeout(22000),
  }
}

export interface TrackResult {
  title: string
  artist: string
}

export async function identifySong(
  cleanUrl: string,
  _platform: Platform
): Promise<TrackResult | null> {
  try {
    const res = await fetch(BASE_URL, buildRequest(cleanUrl))
    if (!res.ok) return null

    const data = await res.json()
    if (!data.track) return null

    return { title: data.track.title, artist: data.track.subtitle }
  } catch {
    return null
  }
}
