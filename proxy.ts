import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/auth/session'

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (path === '/api/identify') {
    const token = req.cookies.get('seek_session')?.value
    if (!token) {
      return NextResponse.json({ error: 'Autenticación requerida' }, { status: 401 })
    }
    const session = await decrypt(token)
    if (!session || session.expiresAt < Date.now()) {
      return NextResponse.json({ error: 'Sesión expirada' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/identify', '/api/auth/:path*'],
}
