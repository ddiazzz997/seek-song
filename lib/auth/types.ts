export interface UserRecord {
  id: string
  nombre: string
  apellido: string
  telefono: string
  email: string
  passwordHash: string
  salt: string
  createdAt: string
}

export interface PublicUser {
  id: string
  nombre: string
  apellido: string
  email: string
}

export interface SessionPayload {
  userId: string
  nombre: string
  apellido: string
  expiresAt: number
}

export interface StorageAdapter {
  findByEmail(email: string): Promise<UserRecord | null>
  create(user: Omit<UserRecord, 'id'>): Promise<UserRecord>
}
