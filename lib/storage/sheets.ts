import type { StorageAdapter, UserRecord } from '@/lib/auth/types'

function getConfig() {
  const url = process.env.APPS_SCRIPT_URL
  const secret = process.env.APPS_SCRIPT_SECRET
  if (!url || !secret) {
    throw new Error('APPS_SCRIPT_URL y APPS_SCRIPT_SECRET deben estar en .env.local')
  }
  return { url, secret }
}

export const sheetsAdapter: StorageAdapter = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const { url, secret } = getConfig()
    const res = await fetch(
      `${url}?action=findByEmail&email=${encodeURIComponent(email)}&secret=${encodeURIComponent(secret)}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.found ? (data.user as UserRecord) : null
  },

  async create(user: Omit<UserRecord, 'id'>): Promise<UserRecord> {
    const { url, secret } = getConfig()
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createUser', secret, user }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error('Error al guardar usuario en Google Sheets')
    const data = await res.json()
    return { ...data, id: data.email } as UserRecord
  },
}
