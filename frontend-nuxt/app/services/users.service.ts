import { useApi } from '~/composables/useApi'
import { getApiErrorMessage } from '~/services/errors'
import type { User, UserPayload, UserTenantMembership, UserTenantPayload } from '~/services/types'

export async function getUsers() {
  const api = useApi()

  try {
    return await api<User[]>('/auth/users')
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al obtener usuarios'))
  }
}

export async function createUser(data: UserPayload) {
  const api = useApi()

  try {
    return await api<User>('/auth/user', {
      method: 'POST',
      body: data,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al crear usuario'))
  }
}

export async function editUser(userId: number, data: UserPayload) {
  const api = useApi()

  try {
    return await api<User>(`/auth/user/${userId}`, {
      method: 'POST',
      body: data,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al editar usuario'))
  }
}

export async function getUserTenants(userId: number) {
  const api = useApi()

  try {
    return await api<UserTenantMembership[]>(`/users/${userId}/tenants`)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al obtener membresias'))
  }
}

export async function createUserTenant(userId: number, data: UserTenantPayload) {
  const api = useApi()

  try {
    return await api<UserTenantMembership>(`/users/${userId}/tenants`, {
      method: 'POST',
      body: data,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al crear membresia'))
  }
}

export async function updateUserTenant(userId: number, tenantId: number, data: UserTenantPayload) {
  const api = useApi()

  try {
    return await api<UserTenantMembership>(`/users/${userId}/tenants/${tenantId}`, {
      method: 'PUT',
      body: data,
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al actualizar membresia'))
  }
}

export async function deleteUserTenant(userId: number, tenantId: number) {
  const api = useApi()

  try {
    return await api<unknown>(`/users/${userId}/tenants/${tenantId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Error al eliminar membresia'))
  }
}
