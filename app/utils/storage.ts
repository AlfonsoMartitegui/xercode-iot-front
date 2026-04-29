import type { AuthUser } from '~/services/types'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

function canUseStorage() {
  return import.meta.client && typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

export function getStoredToken(): string | null {
  if (!canUseStorage()) {
    return null
  }

  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (!canUseStorage()) {
    return
  }

  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null
  }

  const raw = localStorage.getItem(USER_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (!canUseStorage()) {
    return
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    return
  }

  localStorage.removeItem(USER_KEY)
}

export function clearStoredSession() {
  setStoredToken(null)
  setStoredUser(null)
}
