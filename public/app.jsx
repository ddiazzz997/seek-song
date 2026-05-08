const { useState, useEffect, useRef, useMemo } = React;

// ── Platform definitions ────────────────────────────────────────────────
const PLATFORMS = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    short: 'IG',
    // Generic neon — not exact brand colors
    glow: 'oklch(0.72 0.28 350)',
    glow2: 'oklch(0.70 0.27 305)',
    gradient: 'linear-gradient(135deg, oklch(0.72 0.28 350), oklch(0.70 0.27 305))',
    matches: [/instagram\.com/i, /instagr\.am/i],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    short: 'FB',
    glow: 'oklch(0.68 0.22 250)',
    glow2: 'oklch(0.68 0.22 250)',
    gradient: 'linear-gradient(135deg, oklch(0.68 0.22 250), oklch(0.78 0.18 240))',
    matches: [/facebook\.com/i, /fb\.watch/i, /fb\.com/i],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    short: 'TT',
    glow: 'oklch(0.85 0.20 195)',
    glow2: 'oklch(0.68 0.25 25)',
    gradient: 'linear-gradient(135deg, oklch(0.85 0.20 195), oklch(0.68 0.25 25))',
    matches: [/tiktok\.com/i, /vm\.tiktok/i],
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    short: 'YT',
    glow: 'oklch(0.65 0.26 27)',
    glow2: 'oklch(0.72 0.24 20)',
    gradient: 'linear-gradient(135deg, oklch(0.65 0.26 27), oklch(0.72 0.24 20))',
    matches: [/youtube\.com\/shorts/i, /youtu\.be/i, /youtube\.com/i],
  },
};

const PLATFORM_ORDER = ['instagram', 'facebook', 'tiktok', 'youtube'];

function detectPlatform(url) {
  if (!url || !url.trim()) return null;
  for (const id of PLATFORM_ORDER) {
    if (PLATFORMS[id].matches.some((re) => re.test(url))) return id;
  }
  return null;
}

// ── API ─────────────────────────────────────────────────────────────────
const API_URL = '/api/identify';

// Paleta de colores de álbum generada aleatoriamente para canciones reales
const ALBUM_PALETTES = [
  { album: 'oklch(0.65 0.18 28)',  album2: 'oklch(0.45 0.16 350)' },
  { album: 'oklch(0.78 0.16 75)',  album2: 'oklch(0.55 0.18 35)'  },
  { album: 'oklch(0.55 0.20 250)', album2: 'oklch(0.35 0.18 300)' },
  { album: 'oklch(0.45 0.10 280)', album2: 'oklch(0.25 0.06 260)' },
  { album: 'oklch(0.85 0.18 195)', album2: 'oklch(0.55 0.20 320)' },
];
let paletteIndex = 0;
function nextPalette() {
  return ALBUM_PALETTES[paletteIndex++ % ALBUM_PALETTES.length];
}

// ── Platform glyphs (original, generic) ─────────────────────────────────
function PlatformGlyph({ id, size = 18 }) {
  const s = size;
  if (id === 'instagram') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    );
  }
  if (id === 'facebook') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M13.5 21V13h2.2l.4-2.6h-2.6V8.7c0-.8.3-1.4 1.4-1.4h1.3V5a18 18 0 0 0-2-.1c-2 0-3.3 1.2-3.3 3.4v2.1H8.6V13h2.3v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === 'tiktok') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M14 3v10.2a3.3 3.3 0 1 1-3.3-3.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 3c.5 2.6 2.4 4.2 5 4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'youtube') {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="6" width="19" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" />
      </svg>
    );
  }
  return null;
}

// ── Header ──────────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="header">
      <a className="logo" href="#" aria-label="Seek Song — inicio">
        <span className="logo-mark" aria-hidden="true">
          <span className="logo-ring logo-ring-1" />
          <span className="logo-ring logo-ring-2" />
          <span className="logo-ring logo-ring-3" />
          <img src="assets/logo.png" alt="" />
        </span>
        <span className="logo-word">
          <span className="logo-word-1">Seek</span>
          <span className="logo-word-2">Song</span>
        </span>
      </a>
      <nav className="nav">
        <a href="#precio">Precio</a>
        <a href="#historial" className="nav-link-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 8v4l2.5 1.5M21 12a9 9 0 1 1-3-6.7M21 4v4h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Historial
        </a>
        <span className="nav-divider" aria-hidden="true" />
        <a href="#login">Iniciar sesión</a>
        <a href="#signup" className="nav-cta">Empezar gratis</a>
      </nav>
    </header>
  );
}

// ── Word-reveal subtitle ────────────────────────────────────────────────
function TypewriterSub({ text }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    setVisibleCount(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= words.length) clearInterval(iv);
    }, 120);
    return () => clearInterval(iv);
  }, [text]);

  return (
    <p className="tagline-sub">
      {words.map((word, idx) =>
        idx < visibleCount ? (
          <span
            key={idx}
            className="tagline-sub-word"
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            {word}{idx < words.length - 1 ? ' ' : ''}
          </span>
        ) : null
      )}
      {visibleCount < words.length && (
        <span className="tagline-cursor" aria-hidden="true" />
      )}
    </p>
  );
}

// ── Hero + Input ────────────────────────────────────────────────────────
function Hero({ tweaks }) {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | loading | result | error
  const [song, setSong] = useState(null);
  const inputRef = useRef(null);
  const detected = useMemo(() => detectPlatform(url), [url]);
  const platform = detected ? PLATFORMS[detected] : null;

  // Update CSS variables for live theming on the input glow
  useEffect(() => {
    const root = document.documentElement;
    if (platform) {
      root.style.setProperty('--accent', platform.glow);
      root.style.setProperty('--accent-2', platform.glow2);
      root.style.setProperty('--accent-gradient', platform.gradient);
    } else {
      root.style.setProperty('--accent', 'oklch(0.78 0.02 240)');
      root.style.setProperty('--accent-2', 'oklch(0.78 0.02 240)');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, oklch(0.78 0.02 240), oklch(0.65 0.02 240))');
    }
  }, [platform]);

  const submit = async (e) => {
    e && e.preventDefault();
    if (!url.trim() || !platform || phase === 'loading') return;
    setPhase('loading');
    setSong(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPhase('error');
        setSong({ errorMsg: data.error || 'Error desconocido' });
        return;
      }
      setSong({
        title: data.title,
        artist: data.artist,
        spotify: data.spotify.url,
        youtube: data.youtube.url,
        ...nextPalette(),
      });
      setPhase('result');
    } catch {
      setPhase('error');
      setSong({ errorMsg: 'No se pudo conectar con el servidor.' });
    }
  };

  const reset = () => {
    setPhase('idle');
    setSong(null);
    setUrl('');
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  };

  const tryExample = (id) => {
    const examples = {
      instagram: 'https://www.instagram.com/reel/Cx9Y_aBcDef/',
      facebook: 'https://www.facebook.com/reel/8273619203746',
      tiktok: 'https://www.tiktok.com/@creator/video/7239182374561234',
      youtube: 'https://www.youtube.com/shorts/aBcDeFgHiJk',
    };
    setUrl(examples[id]);
    setPhase('idle');
    setSong(null);
  };

  return (
    <main className="hero">
      <div className="hero-inner">
        <h1 className="tagline">
          Esa canción que escuchaste en un reel y{' '}
          <span className="tagline-hl">no puedes encontrar.</span>
        </h1>
        <TypewriterSub text="Pega el link. En segundos la tienes." />

        <form
          className={`url-form phase-${phase} ${platform ? 'has-platform' : ''}`}
          data-platform={detected || 'none'}
          onSubmit={submit}
        >
          <div className="input-shell">
            <div className="input-glow" aria-hidden="true" />
            <div className="input-row">
              <span className="input-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9.5 14.5 14.5 9.5M10 7l1.4-1.4a4 4 0 1 1 5.7 5.7L15.7 12.7M14 17l-1.4 1.4a4 4 0 1 1-5.7-5.7L8.3 11.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                className="url-input"
                placeholder="Pega aquí el enlace del video…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                disabled={phase === 'loading'}
              />
              <button
                type="submit"
                className="submit-btn"
                disabled={!platform || phase === 'loading'}
                aria-label="Identificar canción"
              >
                {phase === 'loading' ? (
                  <span className="btn-spinner" />
                ) : (
                  <>
                    <span>Identificar</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="platform-row" role="group" aria-label="Plataformas soportadas">
            {PLATFORM_ORDER.map((id) => {
              const p = PLATFORMS[id];
              const active = detected === id;
              return (
                <button
                  type="button"
                  key={id}
                  className={`platform-chip ${active ? 'active' : ''}`}
                  data-platform={id}
                  onClick={() => tryExample(id)}
                  title={`Ejemplo de ${p.name}`}
                >
                  <span className="chip-icon"><PlatformGlyph id={id} /></span>
                  <span className="chip-label">{p.name}</span>
                  <span className="chip-dot" aria-hidden="true" />
                </button>
              );
            })}
          </div>

          {!platform && url.trim() && (
            <p className="hint hint-warn">No reconocemos esta URL. Prueba con un enlace de Instagram, Facebook, TikTok o YouTube.</p>
          )}
          {!url.trim() && phase === 'idle' && (
            <p className="hint">Toca una plataforma de arriba para probar con un enlace de ejemplo.</p>
          )}
        </form>

        {/* States below the input */}
        <div className="state-area">
          {phase === 'loading' && <LoadingPulse platform={platform} />}
          {phase === 'result' && song && (
            <Results song={song} platform={platform} onReset={reset} />
          )}
          {phase === 'error' && song && (
            <div className="hint hint-warn" style={{marginTop:'1.5rem', fontSize:'1rem'}}>
              {song.errorMsg}
              <button className="reset-btn" style={{marginLeft:'1rem'}} onClick={reset}>Reintentar</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Loading Pulse ───────────────────────────────────────────────────────
function LoadingPulse({ platform }) {
  return (
    <div className="loading" data-platform={platform ? platform.id : 'none'}>
      <div className="pulse">
        <span className="pulse-ring r1" />
        <span className="pulse-ring r2" />
        <span className="pulse-ring r3" />
        <span className="pulse-core">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M9 4v11.2A3.3 3.3 0 1 1 5.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 4c2 3.5 4.5 4.4 8 4.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </div>
      <div className="loading-text">
        <span>Identificando canción</span>
        <span className="dots"><span>.</span><span>.</span><span>.</span></span>
      </div>
      <div className="loading-meter" aria-hidden="true"><div className="loading-bar" /></div>
    </div>
  );
}

// ── Results ─────────────────────────────────────────────────────────────
function Results({ song, platform, onReset }) {
  return (
    <div className="results">
      <div className="results-head">
        <span className="match-badge">
          <span className="match-dot" /> Coincidencia encontrada
          {platform && <> · vía <strong>{platform.name}</strong></>}
        </span>
        <button className="reset-btn" onClick={onReset}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Buscar otra
        </button>
      </div>
      <div className="cards">
        <SpotifyCard song={song} />
        <YouTubeCard song={song} />
      </div>
    </div>
  );
}

function AlbumArt({ song, variant = 'square' }) {
  // SVG album cover placeholder using song colors + initial
  const initial = song.title.charAt(0);
  return (
    <div className={`art art-${variant}`} style={{
      background: `radial-gradient(120% 120% at 20% 15%, ${song.album} 0%, ${song.album2} 70%)`,
    }}>
      <svg className="art-grain" viewBox="0 0 200 200" preserveAspectRatio="none">
        <defs>
          <pattern id={`p-${song.title.replace(/\s/g,'')}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="rgba(255,255,255,0.18)" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill={`url(#p-${song.title.replace(/\s/g,'')})`} />
      </svg>
      <div className="art-shine" />
      <div className="art-meta">
        <span className="art-initial">{initial}</span>
        <span className="art-bars" aria-hidden="true">
          {[0,1,2,3,4].map(i => <span key={i} style={{ animationDelay: `${i*0.12}s`}} />)}
        </span>
      </div>
    </div>
  );
}

function SpotifyCard({ song }) {
  return (
    <article className="card card-spotify">
      <div className="card-glow" aria-hidden="true" />
      <div className="card-head">
        <span className="card-tag">
          <span className="dot" />
          Spotify
        </span>
        <span className="card-meta">3:24 · Single</span>
      </div>
      <AlbumArt song={song} variant="square" />
      <div className="card-body">
        <h3 className="song-title">{song.title}</h3>
        <p className="song-artist">{song.artist}</p>
      </div>
      <a href={song.spotify} target="_blank" rel="noopener noreferrer" className="card-cta cta-spotify">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M7 9.5c3-.8 6.5-.6 9.5 1M7.6 13c2.4-.6 5-.4 7.4.9M8.2 16.2c1.8-.4 3.6-.3 5.4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        Abrir en Spotify
      </a>
    </article>
  );
}

function YouTubeCard({ song }) {
  return (
    <article className="card card-youtube">
      <div className="card-glow" aria-hidden="true" />
      <div className="card-head">
        <span className="card-tag">
          <span className="dot" />
          YouTube
        </span>
        <span className="card-meta">Video oficial · HD</span>
      </div>
      <div className="thumb-wrap">
        <AlbumArt song={song} variant="wide" />
        <div className="thumb-play">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.5v13l11-6.5z"/>
          </svg>
        </div>
        <div className="thumb-time">3:48</div>
      </div>
      <div className="card-body">
        <h3 className="song-title">{song.title} <span className="muted">— Video Oficial</span></h3>
        <p className="song-artist">{song.artist}</p>
      </div>
      <a href={song.youtube} target="_blank" rel="noopener noreferrer" className="card-cta cta-youtube">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2.5" y="6" width="19" height="12" rx="3" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor"/>
        </svg>
        Ver en YouTube
      </a>
    </article>
  );
}

// ── Tweaks ──────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "background": "deep-space",
  "fontStack": "inter",
  "glowIntensity": 1.0,
  "showGrid": true,
  "cornerRadius": "soft"
}/*EDITMODE-END*/;

function TweaksUI() {
  if (!window.useTweaks) return null;
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const root = document.documentElement;
    const bgs = {
      'deep-space': ['oklch(0.13 0.015 270)', 'oklch(0.10 0.012 280)'],
      'inkwell':    ['oklch(0.14 0.005 250)', 'oklch(0.09 0.005 250)'],
      'plum':       ['oklch(0.15 0.04 320)',  'oklch(0.10 0.03 300)'],
    };
    const [b1, b2] = bgs[t.background] || bgs['deep-space'];
    root.style.setProperty('--bg-1', b1);
    root.style.setProperty('--bg-2', b2);
    root.style.setProperty('--glow-mult', String(t.glowIntensity));
    root.style.setProperty('--radius-card', t.cornerRadius === 'sharp' ? '8px' : t.cornerRadius === 'pill' ? '28px' : '18px');
    root.style.setProperty('--radius-input', t.cornerRadius === 'sharp' ? '10px' : t.cornerRadius === 'pill' ? '999px' : '18px');
    root.style.setProperty('--font-stack',
      t.fontStack === 'geist'
        ? `'Geist', 'Inter', system-ui, sans-serif`
        : t.fontStack === 'mono-mix'
        ? `'Inter', system-ui, sans-serif`
        : `'Inter', system-ui, sans-serif`);
    root.dataset.grid = t.showGrid ? 'on' : 'off';
  }, [t]);

  const { TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakToggle, TweakSlider } = window;

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Background">
        <TweakSelect
          label="Tone"
          value={t.background}
          onChange={(v) => setTweak('background', v)}
          options={[
            { value: 'deep-space', label: 'Deep space' },
            { value: 'inkwell', label: 'Inkwell' },
            { value: 'plum', label: 'Plum' },
          ]}
        />
        <TweakToggle label="Show subtle grid" checked={t.showGrid} onChange={(v) => setTweak('showGrid', v)} />
      </TweakSection>
      <TweakSection title="Type">
        <TweakRadio
          label="Font"
          value={t.fontStack}
          onChange={(v) => setTweak('fontStack', v)}
          options={[
            { value: 'inter', label: 'Inter' },
            { value: 'geist', label: 'Geist' },
          ]}
        />
      </TweakSection>
      <TweakSection title="Style">
        <TweakSlider
          label="Neon glow"
          min={0} max={2} step={0.05}
          value={t.glowIntensity}
          onChange={(v) => setTweak('glowIntensity', v)}
        />
        <TweakRadio
          label="Corners"
          value={t.cornerRadius}
          onChange={(v) => setTweak('cornerRadius', v)}
          options={[
            { value: 'sharp', label: 'Sharp' },
            { value: 'soft', label: 'Soft' },
            { value: 'pill', label: 'Pill' },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// ── App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <div className="app-shell">
      <div className="bg-fx" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>
      <Header />
      <Hero />
      <footer className="foot">
        <span>© 2026 Seek Song</span>
        <span className="foot-sep" />
        <span>Identificación musical asistida</span>
      </footer>
      <TweaksUI />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
