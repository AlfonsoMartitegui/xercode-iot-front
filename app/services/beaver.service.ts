import { useApi } from '~/composables/useApi'
import { getApiErrorMessage } from '~/services/errors'
import type { BeaverRole } from '~/services/types'

export async function getTenantBeaverRoles(tenantId: number) {
  const api = useApi()

  try {
    return await api<BeaverRole[]>(`/tenants/${tenantId}/beaver/roles`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load Beaver roles for this tenant'))
  }
}

export async function changeBeaverPassword(userId: number, tenantId: number, password: string) {
  const api = useApi()

  try {
    return await api<unknown>(`/users/${userId}/tenants/${tenantId}/beaver/change-password`, {
      method: 'PUT',
      body: { password },
    })
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        'Beaver password could not be updated because the Beaver account was not found by the current email.',
      ),
    )
  }
}

export async function provisionBeaverUser(userId: number, tenantId: number, password: string) {
  const api = useApi()

  try {
    return await api<unknown>(`/users/${userId}/tenants/${tenantId}/beaver/provision`, {
      method: 'POST',
      body: { password },
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudo provisionar el usuario en Beaver'))
  }
}
