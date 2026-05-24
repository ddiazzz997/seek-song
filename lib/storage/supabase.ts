import { createClient } from '@supabase/supabase-js'
import type { StorageAdapter, UserRecord } from '@/lib/auth/types'

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar en .env.local')
  return createClient(url, key)
}

// Convierte fila de BD (snake_case) a UserRecord (camelCase)
function rowToUser(row: Record<string, string>): UserRecord {
  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    telefono: row.telefono,
    email: row.email,
    passwordHash: row.password_hash,
    salt: row.salt,
    createdAt: row.created_at,
  }
}

export const supabaseAdapter: StorageAdapter = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error || !data) return null
    return rowToUser(data)
  },

  async create(user: Omit<UserRecord, 'id'>): Promise<UserRecord> {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('users')
      .insert({
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        email: user.email,
        password_hash: user.passwordHash,
        salt: user.salt,
      })
      .select()
      .single()

    if (error) throw new Error(`Error al crear usuario: ${error.message}`)
    return rowToUser(data)
  },
}
