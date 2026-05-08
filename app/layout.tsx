import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diaz Song · Identifica la música de cualquier reel',
  description: 'Pega el link del reel. En segundos tienes el título, artista, Spotify y YouTube.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
