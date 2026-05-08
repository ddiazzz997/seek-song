import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage/adapter'
import { verifyPassword } from '@/lib/auth/crypto'
import { createSession } from '@/lib/auth/session'

const INVALID_MSG = 'Correo o contraseña incorrectos'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
    }

    const user = await storage.findByEmail(email.toLowerCase().trim())
    // Siempre 401 con el mismo mensaje: nunca revelar si el email existe
    if (!user) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.salt, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
    }

    const publicUser = { id: user.email, nombre: user.nombre, apellido: user.apellido, email: user.email }
    await createSession(publicUser)

    return NextResponse.json({ ok: true, user: publicUser })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
