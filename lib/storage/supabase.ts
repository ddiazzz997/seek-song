import type { StorageAdapter } from '@/lib/auth/types'

// Stub: implementar cuando se migre de Google Sheets a Supabase.
// Para activar: npm install @supabase/supabase-js, setear STORAGE_BACKEND=supabase
// en .env.local, y completar las dos funciones a continuación.
export const supabaseAdapter: StorageAdapter = {
  async findByEmail(_email: string) {
    throw new Error('supabaseAdapter no implementado. Completa lib/storage/supabase.ts.')
  },
  async create(_user) {
    throw new Error('supabaseAdapter no implementado. Completa lib/storage/supabase.ts.')
  },
}
