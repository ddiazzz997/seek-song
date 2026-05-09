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
function Header({ session, onLogout }) {
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
        {session ? (
          <>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Hola, {session.nombre}
            </span>
            <span className="nav-divider" aria-hidden="true" />
            <button
              onClick={onLogout}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-stack)' }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <a href="#historial" className="nav-link-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 8v4l2.5 1.5M21 12a9 9 0 1 1-3-6.7M21 4v4h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Historial
            </a>
            <span className="nav-divider" aria-hidden="true" />
            <a href="#login">Iniciar sesión</a>
            <a href="#signup" className="nav-cta">Empezar gratis</a>
          </>
        )}
      </nav>
    </header>
  );
}

// ── Animated subtitle ───────────────────────────────────────────────────
function TypewriterSub({ text }) {
  return <p className="tagline-sub">{text}</p>;
}

// ── Hero + Input ────────────────────────────────────────────────────────
function Hero({ session, onNeedAuth }) {
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
    // Si no hay sesión → mostrar modal de registro en vez de llamar la API
    if (!session) {
      onNeedAuth();
      return;
    }
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

// ── Confetti (vanilla JS, sin dependencias externas) ───────────────────
function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:998';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  ];

  const particles = Array.from({ length: 140 }, () => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 22,
    vy: (Math.random() - 0.5) * 22 - 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    w: 7 + Math.random() * 9,
    h: 4 + Math.random() * 6,
    alpha: 1,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 16,
  }));

  let frame;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.42;
      p.alpha -= 0.013;
      p.rotation += p.rotSpeed;
      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    if (alive) frame = requestAnimationFrame(tick);
    else canvas.remove();
  };
  frame = requestAnimationFrame(tick);
}

// ── Auth Modal ──────────────────────────────────────────────────────────
function AuthModal({ onSuccess }) {
  const [view, setView] = useState('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', email: '', password: '' });

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = view === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = view === 'register'
      ? { nombre: form.nombre, apellido: form.apellido, telefono: form.telefono, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Algo salió mal. Intenta de nuevo.');
        setLoading(false);
        return;
      }

      onSuccess(data.user);
    } catch {
      setError('No se pudo conectar. Revisa tu conexión e intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop">
      <div className="auth-modal">
        <a className="auth-modal-logo logo" href="#" aria-label="Seek Song">
          <span className="logo-mark" aria-hidden="true" style={{width:36,height:36}}>
            <span className="logo-ring logo-ring-1" />
            <span className="logo-ring logo-ring-2" />
            <span className="logo-ring logo-ring-3" />
            <img src="assets/logo.png" alt="" style={{width:22,height:22}} />
          </span>
          <span className="logo-word" style={{fontSize:'1.1rem'}}>
            <span className="logo-word-1">Seek</span>
            <span className="logo-word-2">Song</span>
          </span>
        </a>

        {view === 'register' ? (
          <>
            <h2 className="auth-modal-title">Crea tu cuenta gratis</h2>
            <p className="auth-modal-sub">Para seguir usando la app regístrate. Es gratis y toma 30 segundos.</p>
          </>
        ) : (
          <>
            <h2 className="auth-modal-title">Bienvenido de vuelta</h2>
            <p className="auth-modal-sub">Ingresa con tu correo y contraseña.</p>
          </>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {view === 'register' && (
            <>
              <div className="auth-row">
                <div className="auth-field">
                  <label>Nombre</label>
                  <input type="text" placeholder="Juan" value={form.nombre} onChange={e => setField('nombre', e.target.value)} disabled={loading} required />
                </div>
                <div className="auth-field">
                  <label>Apellido</label>
                  <input type="text" placeholder="García" value={form.apellido} onChange={e => setField('apellido', e.target.value)} disabled={loading} required />
                </div>
              </div>
              <div className="auth-field">
                <label>Teléfono</label>
                <input type="tel" placeholder="+52 55 1234 5678" value={form.telefono} onChange={e => setField('telefono', e.target.value)} disabled={loading} required />
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Correo electrónico</label>
            <input type="email" placeholder="tu@correo.com" value={form.email} onChange={e => setField('email', e.target.value)} disabled={loading} required />
          </div>
          <div className="auth-field">
            <label>Contraseña{view === 'register' && ' (mínimo 8 caracteres)'}</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setField('password', e.target.value)} disabled={loading} required minLength={8} />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner" />}
            {loading
              ? (view === 'register' ? 'Creando cuenta...' : 'Entrando...')
              : (view === 'register' ? 'Crear cuenta gratis' : 'Iniciar sesión')}
          </button>
        </form>

        <div className="auth-switch">
          {view === 'register'
            ? <>¿Ya tienes cuenta? <button type="button" onClick={() => { setView('login'); setError(null); }}>Inicia sesión</button></>
            : <>¿No tienes cuenta? <button type="button" onClick={() => { setView('register'); setError(null); }}>Regístrate gratis</button></>}
        </div>
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState(window.__SEEK_SESSION__ || null);
  const [showModal, setShowModal] = useState(false);

  const handleAuthSuccess = (user) => {
    setSession(user);
    setShowModal(false);
    fireConfetti();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
  };

  return (
    <div className="app-shell">
      <div className="bg-fx" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>
      <Header session={session} onLogout={handleLogout} />
      <Hero session={session} onNeedAuth={() => setShowModal(true)} />
      <footer className="foot">
        <span>© 2026 Seek Song</span>
        <span className="foot-sep" />
        <span>Identificación musical asistida</span>
      </footer>
      <TweaksUI />
      {showModal && <AuthModal onSuccess={handleAuthSuccess} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
