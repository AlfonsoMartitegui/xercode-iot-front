import { computed } from 'vue'
import { getMeRequest, loginRequest } from '~/services/auth.service'
import type { AuthUser, LoginPayload } from '~/services/types'
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '~/utils/storage'

export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const token = useState<string | null>('auth:token', () => null)
  const initialized = useState<boolean>('auth:initialized', () => false)
  const loading = useState<boolean>('auth:loading', () => false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const isSuperadmin = computed(() => Boolean(user.value?.is_superadmin))

  function setSession(nextToken: string | null, nextUser: AuthUser | null) {
    token.value = nextToken
    user.value = nextUser
    setStoredToken(nextToken)
    setStoredUser(nextUser)
  }

  function clearSession() {
    token.value = null
    user.value = null
    clearStoredSession()
  }

  async function hydrate() {
    if (initialized.value) {
      return
    }

    if (import.meta.client) {
      token.value = getStoredToken()
      user.value = getStoredUser()
    }

    initialized.value = true
  }

  async function refreshUser() {
    if (!token.value) {
      return null
    }

    try {
      const me = await getMeRequest()
      user.value = me
      setStoredUser(me)
      return me
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function signIn(credentials: LoginPayload) {
    loading.value = true

    try {
      const response = await loginRequest(credentials)
      token.value = response.access_token
      setStoredToken(response.access_token)

      const me = await getMeRequest()
      user.value = me
      setStoredUser(me)

      return me
    } catch (error) {
      clearSession()
      throw error
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function signOut(redirectTo = '/login') {
    clearSession()

    if (import.meta.client) {
      await navigateTo(redirectTo)
    }
  }

  return {
    user,
    token,
    loading,
    initialized,
    isAuthenticated,
    isSuperadmin,
    hydrate,
    refreshUser,
    signIn,
    signOut,
    setSession,
    clearSession,
  }
}
