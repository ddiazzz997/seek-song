const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── Constantes musikerkennung ────────────────────────────────────────────
const MUSIK_URL = 'https://musikerkennung.com/recognize-link';
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Detección de plataforma ──────────────────────────────────────────────
function detectPlatform(url) {
  if (!url) return null;
  if (/instagram\.com|instagr\.am/i.test(url))         return 'instagram';
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url))    return 'facebook';
  if (/tiktok\.com|vm\.tiktok/i.test(url))             return 'tiktok';
  if (/youtube\.com|youtu\.be/i.test(url))             return 'youtube';
  return null;
}

// ── Limpieza de URL ──────────────────────────────────────────────────────
function cleanUrl(url, platform) {
  const base = url.split('?')[0].split('#')[0];
  if (platform === 'instagram') return base.endsWith('/') ? base : base + '/';
  return base;
}

// ── Construcción del request a musikerkennung ────────────────────────────
function buildRequest(url) {
  const params = new URLSearchParams({
    link: url, hours: '00', minutes: '00', seconds: '00',
  });

  const headers = {
    'Content-Type':       'application/x-www-form-urlencoded',
    'Origin':             'https://musikerkennung.com',
    'Referer':            'https://musikerkennung.com/en/recognize-link',
    'User-Agent':         CHROME_UA,
    'Accept':             'application/json, text/plain, */*',
    'Accept-Language':    'es-ES,es;q=0.9,en;q=0.8',
    'sec-ch-ua':          '"Chromium";v="124", "Google Chrome";v="124"',
    'sec-ch-ua-mobile':   '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest':     'empty',
    'sec-fetch-mode':     'cors',
    'sec-fetch-site':     'same-origin',
  };

  return { method: 'POST', headers, body: params.toString() };
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Un intento de identificación ─────────────────────────────────────────
async function attemptIdentify(url, platform) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 28000); // 28s max por intento

  try {
    const res = await fetch(MUSIK_URL, {
      ...buildRequest(url),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();

    return data.track ? { title: data.track.title, artist: data.track.subtitle } : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ── Identificación con retry ─────────────────────────────────────────────
async function identifySong(url, platform) {
  const first = await attemptIdentify(url, platform);
  if (first) return first;
  await delay(2000);
  return await attemptIdentify(url, platform);
}

// ── Endpoints ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'Seek Song API' }));

app.post('/identify', async (req, res) => {
  const secret = process.env.INTERNAL_SECRET;
  if (secret && req.headers['x-internal-secret'] !== secret) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL requerida' });
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return res.status(400).json({
      error: 'Solo funciona con Instagram, Facebook, TikTok y YouTube Shorts',
    });
  }

  const clean = cleanUrl(url, platform);
  const track = await identifySong(clean, platform);

  if (!track) {
    return res.status(404).json({
      error: 'No se pudo identificar la canción. Puede ser privado, muy corto o sin música.',
    });
  }

  const q  = encodeURIComponent(`${track.title} ${track.artist}`);
  const q2 = encodeURIComponent(`${track.title} ${track.artist} official`);

  res.json({
    title:    track.title,
    artist:   track.artist,
    platform,
    spotify:  { url: `https://open.spotify.com/search/${q}`,                        found: true },
    youtube:  { url: `https://www.youtube.com/results?search_query=${q2}`,           found: true },
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Seek Song API escuchando en puerto ${PORT}`));
