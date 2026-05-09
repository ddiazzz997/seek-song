import { getSession } from '@/lib/auth/session'

export default async function Home() {
  const session = await getSession()
  const sessionData = session
    ? { userId: session.userId, nombre: session.nombre, apellido: session.apellido }
    : null

  return (
    // suppressHydrationWarning: el cliente modifica data-grid y CSS vars vía JS
    <html lang="es" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Seek Song · Identifica la música de cualquier reel</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body suppressHydrationWarning>
        <div id="root" />

        {/* Sesión inyectada desde el servidor — nunca expone el JWT al cliente */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SEEK_SESSION__ = ${JSON.stringify(sessionData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')};`,
          }}
        />

        {/* React 18 + Babel standalone — mismas versiones e integridades que el index.html original */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          src="https://unpkg.com/react@18.3.1/umd/react.development.js"
          integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"
          integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
          integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y"
          crossOrigin="anonymous"
        />

        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script {...({ type: 'text/babel', src: '/tweaks-panel.jsx' } as object)} />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script {...({ type: 'text/babel', src: '/app.jsx' } as object)} />
      </body>
    </html>
  )
}
