import { NextRequest, NextResponse } from 'next/server'
import { detectPlatform, cleanUrl } from '@/lib/platforms'
import { identifySong } from '@/lib/identify'
import { buildSpotifyLink, buildYouTubeLink, findYouTubeVideoId } from '@/lib/search'
import { getSession } from '@/lib/auth/session'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Autenticación requerida' }, { status: 401, headers: CORS_HEADERS })
    }

    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400, headers: CORS_HEADERS })
    }

    const platform = detectPlatform(url)
    if (!platform) {
      return NextResponse.json(
        { error: 'Solo funciona con Instagram, Facebook, TikTok y YouTube Shorts' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // En producción: proxy a Render (sus IPs no están bloqueadas por musikerkennung.com)
    // En desarrollo: identificar directamente
    const renderUrl = process.env.RENDER_API_URL
    const renderSecret = process.env.RENDER_INTERNAL_SECRET

    if (renderUrl && renderSecret) {
      const renderRes = await fetch(`${renderUrl}/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': renderSecret,
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(55000),
      })

      const data = await renderRes.json()

      if (!renderRes.ok) {
        return NextResponse.json(
          { error: data.error || 'No se pudo identificar la canción.' },
          { status: renderRes.status, headers: CORS_HEADERS }
        )
      }

      return NextResponse.json(data, { headers: CORS_HEADERS })
    }

    // Fallback local (dev sin RENDER_API_URL)
    const clean = cleanUrl(url, platform)
    const track = await identifySong(clean, platform)

    if (!track) {
      return NextResponse.json(
        { error: 'No se pudo identificar la canción. Puede ser privado, muy corto o sin música.' },
        { status: 404, headers: CORS_HEADERS }
      )
    }

    const videoId = await findYouTubeVideoId(track.title, track.artist)
    const youtube = videoId
      ? { url: `https://www.youtube.com/watch?v=${videoId}`, found: true }
      : buildYouTubeLink(track.title, track.artist)

    const spotify = buildSpotifyLink(track.title, track.artist)

    return NextResponse.json(
      { title: track.title, artist: track.artist, platform, spotify, youtube },
      { headers: CORS_HEADERS }
    )
  } catch (err) {
    console.error('identify error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
