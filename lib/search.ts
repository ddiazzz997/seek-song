export interface MusicLink {
  url: string
  found: boolean
}

export function buildSpotifyLink(title: string, artist: string): MusicLink {
  const query = encodeURIComponent(`${title} ${artist}`)
  return {
    url: `https://open.spotify.com/search/${query}`,
    found: true,
  }
}

export function buildYouTubeLink(title: string, artist: string): MusicLink {
  const query = encodeURIComponent(`${title} ${artist} official`)
  return {
    url: `https://www.youtube.com/results?search_query=${query}`,
    found: true,
  }
}

export async function findYouTubeVideoId(
  title: string,
  artist: string
): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  try {
    const query = encodeURIComponent(`${title} ${artist}`)
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`
    )
    const data = await res.json()
    return data.items?.[0]?.id?.videoId ?? null
  } catch {
    return null
  }
}
