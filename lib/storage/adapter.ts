import type { StorageAdapter } from '@/lib/auth/types'
import { sheetsAdapter } from './sheets'
import { supabaseAdapter } from './supabase'

function getAdapter(): StorageAdapter {
  if (process.env.STORAGE_BACKEND === 'supabase') return supabaseAdapter
  return sheetsAdapter
}

export const storage: StorageAdapter = getAdapter()
