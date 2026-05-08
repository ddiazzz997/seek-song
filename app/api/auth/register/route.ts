import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage/adapter'
import { generateSalt, hashPassword } from '@/lib/auth/crypto'
import { createSession } from '@/lib/auth/session'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, apellido, telefono, email, password } = body

    if (!nombre || !apellido || !telefono || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'El correo electrónico no es válido' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const existing = await storage.findByEmail(email.toLowerCase())
    if (existing) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 })
    }

    const salt = generateSalt()
    const passwordHash = await hashPassword(password, salt)

    const user = await storage.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    })

    const publicUser = { id: user.email, nombre: user.nombre, apellido: user.apellido, email: user.email }
    await createSession(publicUser)

    return NextResponse.json({ ok: true, user: publicUser })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
