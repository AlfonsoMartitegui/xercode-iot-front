import { useApi } from '~/composables/useApi'
import { getApiErrorMessage } from '~/services/errors'
import type {
  AuthUser,
  BeaverHandoffResponse,
  LoginPayload,
  LoginResponse,
} from '~/services/types'

export async function loginRequest(payload: LoginPayload) {
  const api = useApi()

  try {
    return await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error de autenticacion'))
  }
}

export async function getMeRequest() {
  const api = useApi()

  try {
    return await api<AuthUser>('/auth/me')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al obtener usuario'))
  }
}

export async function createBeaverHandoffRequest(tenantId?: number | null) {
  const api = useApi()
  const body = tenantId !== undefined && tenantId !== null ? { tenant_id: tenantId } : {}

  try {
    return await api<BeaverHandoffResponse>('/auth/beaver-handoff', {
      method: 'POST',
      body,
    })
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'No se pudo iniciar sesion en Beaver. Contacta con un administrador.'),
    )
  }
}
